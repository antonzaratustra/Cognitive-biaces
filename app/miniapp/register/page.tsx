"use client";

import { FormEvent, useEffect, useState } from "react";

type RegisterResponse = {
  error?: string;
  mode?: "demo" | "supabase";
  ok: boolean;
  user?: {
    firstName?: string | null;
    tgId: string;
    username?: string | null;
  };
};

export default function MiniAppRegisterPage() {
  const [email, setEmail] = useState("");
  const [consentEmail, setConsentEmail] = useState(true);
  const [consentTerms, setConsentTerms] = useState(false);
  const [initData, setInitData] = useState("");
  const [tgName, setTgName] = useState("");
  const [status, setStatus] = useState<"idle" | "ready" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("Открой это окно из Telegram, чтобы связать регистрацию с ботом.");

  useEffect(() => {
    let attempts = 0;

    const bindTelegram = () => {
      const webApp = window.Telegram?.WebApp;
      const user = webApp?.initDataUnsafe?.user;

      webApp?.ready?.();
      webApp?.expand?.();

      if (webApp?.initData) {
        setInitData(webApp.initData);
        setTgName(user?.first_name || user?.username || "друг");
        setMessage("Telegram подтвержден. Оставь email, чтобы сохранить доступ и получать обновления.");
        setStatus("ready");
        return true;
      }

      return false;
    };

    if (bindTelegram()) {
      return;
    }

    const intervalId = window.setInterval(() => {
      attempts += 1;

      if (bindTelegram() || attempts >= 20) {
        window.clearInterval(intervalId);
      }

      if (attempts >= 20) {
        setStatus("error");
        setMessage("Telegram Mini App не передал данные авторизации. Открой эту страницу кнопкой внутри бота еще раз.");
      }
    }, 250);

    return () => window.clearInterval(intervalId);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!initData) {
      setStatus("error");
      setMessage("Нужно открыть страницу именно из Telegram mini app.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    const response = await fetch("/api/miniapp/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        consentEmail,
        consentTerms,
        email,
        initData,
        source: "miniapp_register"
      })
    });

    const payload = (await response.json()) as RegisterResponse;

    if (!response.ok || !payload.ok) {
      setStatus("error");
      setMessage(payload.error || "Не получилось завершить регистрацию. Попробуй еще раз.");
      return;
    }

    setStatus("success");
    setMessage(
      payload.mode === "supabase"
        ? "Готово. Регистрация завершена, можно закрыть окно и вернуться в бота."
        : "Регистрация отработала в demo-режиме. Для боевого сохранения добавь реальные env и Supabase."
    );
  }

  return (
    <main className="site-shell miniapp-shell">
      <section className="glass-card miniapp-card">
        <div className="eyebrow">Telegram mini app</div>
        <h1>Быстрая регистрация в курсе</h1>
        <p className="miniapp-lead">
          {tgName ? `Привет, ${tgName}. ` : ""}
          Здесь мы привяжем email к Telegram-аккаунту, чтобы курс, карта и будущая практика работали как единый путь.
        </p>

        <div className="miniapp-note">{message}</div>

        <form className="lead-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              required
              autoComplete="email"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="checkbox-row">
            <input checked={consentEmail} type="checkbox" onChange={(event) => setConsentEmail(event.target.checked)} />
            <span>Хочу получать письма о новых уроках, практике и обновлениях курса.</span>
          </label>

          <label className="checkbox-row">
            <input checked={consentTerms} type="checkbox" onChange={(event) => setConsentTerms(event.target.checked)} />
            <span>Согласен на обработку данных и понимаю, что курс развивается поэтапно.</span>
          </label>

          <button className="primary-button" disabled={status === "submitting" || status === "success"} type="submit">
            {status === "submitting" ? "Сохраняю..." : "Завершить регистрацию"}
          </button>
        </form>

        {status === "success" ? (
          <button className="ghost-button" type="button" onClick={() => window.Telegram?.WebApp?.close?.()}>
            Закрыть окно и вернуться в бота
          </button>
        ) : null}
      </section>
    </main>
  );
}
