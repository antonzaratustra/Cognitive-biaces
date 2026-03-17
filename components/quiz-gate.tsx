"use client";

import { useEffect, useMemo, useState } from "react";

import type { Product, Quiz } from "@/lib/types";
import { quizOfferLink } from "@/lib/telegram";

type QuizGateProps = {
  product: Product;
  quiz: Quiz;
};

type AuthState =
  | { status: "idle" | "checking" | "not_supported"; tgId?: string }
  | { status: "authorized"; tgId: string; name: string }
  | { status: "error"; message: string };

function useTelegramQuizAccess(quizSlug: string) {
  const [auth, setAuth] = useState<AuthState>({ status: "checking" });
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [accessReason, setAccessReason] = useState<string>("");

  useEffect(() => {
    async function run(initData: string) {
      const authResponse = await fetch("/api/telegram/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ initData })
      });

      const authPayload = await authResponse.json();

      if (!authResponse.ok || !authPayload.ok) {
        setAuth({ status: "error", message: authPayload.error || "Не удалось авторизоваться через Telegram." });
        return;
      }

      const tgId = String(authPayload.user.tgId);
      setAuth({
        status: "authorized",
        tgId,
        name: authPayload.user.firstName || authPayload.user.username || "друг"
      });

      const accessResponse = await fetch(`/api/quiz-access?slug=${encodeURIComponent(quizSlug)}&tgId=${encodeURIComponent(tgId)}`);
      const accessPayload = await accessResponse.json();
      setHasAccess(Boolean(accessPayload.hasAccess));
      setAccessReason(accessPayload.reason || "");
    }

    let attempts = 0;

    const tryBindTelegram = () => {
      const webApp = window.Telegram?.WebApp;

      webApp?.ready?.();
      webApp?.expand?.();

      if (webApp?.initData) {
        void run(webApp.initData);
        return true;
      }

      return false;
    };

    if (tryBindTelegram()) {
      return;
    }

    const intervalId = window.setInterval(() => {
      attempts += 1;

      if (tryBindTelegram()) {
        window.clearInterval(intervalId);
        return;
      }

      if (attempts >= 20) {
        window.clearInterval(intervalId);
        setAuth({ status: "not_supported" });
      }
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [quizSlug]);

  return { accessReason, auth, hasAccess };
}

export function QuizGate({ product, quiz }: QuizGateProps) {
  const { accessReason, auth, hasAccess } = useTelegramQuizAccess(quiz.slug);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  const availableQuestions = useMemo(() => {
    if (hasAccess) {
      return quiz.questions;
    }

    return quiz.questions.slice(0, 1);
  }, [hasAccess, quiz.questions]);

  const score = availableQuestions.reduce((sum, question) => {
    return sum + (answers[question.id] === question.correctAnswer ? 1 : 0);
  }, 0);

  return (
    <div className="quiz-gate">
      <div className="glass-card quiz-auth-card">
        <div className="eyebrow">Доступ к практике</div>
        <h3>{quiz.title}</h3>
        <p>{quiz.description}</p>

        {auth.status === "authorized" ? (
          <>
            <p>
              Авторизация подтверждена для <strong>{auth.name}</strong>.{" "}
              {hasAccess
                ? "Полный квиз открыт: можно проходить все вопросы и возвращаться к ним после новых уроков."
                : "Пока открыт только preview. Полный доступ откроется сразу после покупки в Telegram."}
            </p>
            {!hasAccess ? (
              <a className="primary-button" href={quizOfferLink()}>
                Купить доступ за {product.priceXtr} Stars
              </a>
            ) : null}
          </>
        ) : null}

        {auth.status === "checking" ? <p>Проверяю доступ через Telegram...</p> : null}
        {auth.status === "not_supported" ? (
          <>
            <p>
              В обычном браузере открыт preview-режим. Полная проверка доступа срабатывает, когда страница открыта из
              Telegram mini app.
            </p>
            <a className="primary-button" href={quizOfferLink()}>
              Открыть покупку в Telegram
            </a>
          </>
        ) : null}
        {auth.status === "error" ? <p>{auth.message}</p> : null}

        {accessReason ? <small className="quiz-access-reason">Статус: {accessReason}</small> : null}
      </div>

      <div className="glass-card quiz-questions">
        <div className="quiz-header">
          <div>
            <div className="eyebrow">Практика</div>
            <h3>{hasAccess ? "Полный квиз" : "Preview-вопрос"}</h3>
          </div>
          <button className="ghost-button" type="button" onClick={() => setShowResult(true)}>
            Проверить ответы
          </button>
        </div>

        <div className="quiz-list">
          {availableQuestions.map((question, index) => (
            <article key={question.id} className="quiz-card">
              <div className="quiz-card__index">Вопрос {index + 1}</div>
              <h4>{question.questionText}</h4>
              <div className="quiz-options">
                {question.options.map((option, optionIndex) => {
                  const selected = answers[question.id] === optionIndex;

                  return (
                    <button
                      key={option}
                      className={selected ? "quiz-option quiz-option--selected" : "quiz-option"}
                      type="button"
                      onClick={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {showResult && answers[question.id] !== undefined ? (
                <p className="quiz-explanation">
                  {answers[question.id] === question.correctAnswer ? "Верно. " : "Пока мимо. "}
                  {question.explanation}
                </p>
              ) : null}
            </article>
          ))}
        </div>

        {showResult ? (
          <div className="quiz-score">
            <strong>
              {score} / {availableQuestions.length}
            </strong>
            <span>
              {hasAccess ? "Хорошая база для практики. Возвращайся к квизам после новых уроков и сравнивай, как меняется взгляд." : quiz.teaser}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
