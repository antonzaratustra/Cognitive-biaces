"use client";

import { FormEvent, useState } from "react";

import { telegramDeepLink } from "@/lib/telegram";

type LeadResponse = {
  ok: boolean;
  leadId?: string;
  mode?: "demo" | "supabase";
  error?: string;
};

const emptyForm = {
  email: "",
  tgUsername: "",
  consentEmail: false,
  consentTerms: false
};

type LeadFormProps = {
  source: string;
  utmCampaign?: string;
  utmMedium?: string;
  utmSource?: string;
};

export function LeadForm({ source, utmCampaign, utmMedium, utmSource }: LeadFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [botLink, setBotLink] = useState(telegramDeepLink("lead_web"));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...form,
        source,
        utmSource,
        utmMedium,
        utmCampaign
      })
    });

    const payload = (await response.json()) as LeadResponse;

    if (!response.ok || !payload.ok) {
      setStatus("error");
      setMessage(payload.error || "Не получилось сохранить контакт. Попробуй еще раз.");
      return;
    }

    const leadId = payload.leadId || "lead_web";
    setBotLink(telegramDeepLink(`lead_${leadId}`));
    setStatus("success");
    setMessage(
      payload.mode === "supabase"
        ? "Готово. Место в раннем доступе закреплено — теперь можно открыть Telegram и забрать старт курса 👇"
        : "Форма уже работает. Пока включен demo-режим, но переход в Telegram и логика старта уже подготовлены 👇"
    );
    setForm(emptyForm);
  }

  return (
    <div className="glass-card lead-card">
      <div className="eyebrow">✉️ Ранний доступ</div>
      <h3>Оставь контакты и забери вход в курс без лишней суеты.</h3>
      <p>
        Email нужен, чтобы прислать обновления, новые разделы и доступ к практике. Telegram поможет мягко продолжить
        путь уже внутри курса: от первого урока до квизов и AI-разборов.
      </p>

      <form className="lead-form" onSubmit={handleSubmit}>
        <label>
          Email для старта
          <input
            required
            autoComplete="email"
            placeholder="you@example.com"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </label>

        <label>
          Telegram username
          <input
            autoComplete="username"
            placeholder="@username"
            type="text"
            value={form.tgUsername}
            onChange={(event) => setForm((current) => ({ ...current, tgUsername: event.target.value }))}
          />
        </label>

        <label className="checkbox-row">
          <input
            checked={form.consentEmail}
            type="checkbox"
            onChange={(event) => setForm((current) => ({ ...current, consentEmail: event.target.checked }))}
          />
          <span>Хочу получать письма о новых уроках, квизах и редких полезных обновлениях.</span>
        </label>

        <label className="checkbox-row">
          <input
            checked={form.consentTerms}
            type="checkbox"
            onChange={(event) => setForm((current) => ({ ...current, consentTerms: event.target.checked }))}
          />
          <span>Согласен на обработку данных и понимаю, что доступ к новым функциям будет открываться поэтапно.</span>
        </label>

        <button className="primary-button" disabled={status === "submitting"} type="submit">
          {status === "submitting" ? "Сохраняю..." : "Забрать место и открыть Telegram"}
        </button>
      </form>

      {status !== "idle" ? (
        <div className={`form-status form-status--${status}`}>
          <p>{message}</p>
          {status === "success" ? (
            <a className="secondary-link" href={botLink}>
              Перейти в Telegram
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
