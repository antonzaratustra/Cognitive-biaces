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
    setMessage("Регистрация завершена! Теперь курс и бот связаны.");
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      window.Telegram?.WebApp?.close?.();
    }, 3000);
  }

  return (
    <main className="site-shell miniapp-shell">
      <section className="glass-card miniapp-card">
        <div className="eyebrow">Telegram mini app</div>
        <h1>Быстрая регистрация</h1>
        <p className="miniapp-lead">
          {tgName ? `Привет, ${tgName}. ` : ""}
          Оставь email, чтобы связать прогресс в курсе с твоим аккаунтом.
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

          <div className="form-checkboxes">
            <label className="checkbox-row">
              <input 
                checked={consentTerms} 
                required 
                type="checkbox" 
                onChange={(event) => setConsentTerms(event.target.checked)} 
              />
              <span>Согласен на обработку персональных данных</span>
            </label>

            <label className="checkbox-row">
              <input checked={consentEmail} type="checkbox" onChange={(event) => setConsentEmail(event.target.checked)} />
              <span>Хочу получать письма об обновлениях</span>
            </label>
          </div>

          {status !== "success" ? (
            <button className="primary-button" disabled={status === "submitting" || !initData} type="submit">
              {status === "submitting" ? "Сохраняю..." : "Завершить регистрацию"}
            </button>
          ) : (
            <div className="success-popup">
              <div className="success-icon">✅</div>
              <p>Готово! Окно закроется автоматически через пару секунд...</p>
              <button className="ghost-button" type="button" onClick={() => window.Telegram?.WebApp?.close?.()}>
                Закрыть сейчас
              </button>
            </div>
          )}
        </form>
      </section>

      <style jsx>{`
        .miniapp-shell {
          padding: 24px 16px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .miniapp-card {
          margin-top: 20px;
          padding: 32px 24px;
        }
        .miniapp-lead {
          margin-bottom: 24px;
          line-height: 1.5;
        }
        .miniapp-note {
          background: rgba(255, 255, 255, 0.05);
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 0.9rem;
          margin-bottom: 32px;
          border-left: 3px solid var(--accent-color, #0088cc);
        }
        .form-checkboxes {
          margin: 24px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .success-popup {
          text-align: center;
          padding: 24px;
          background: rgba(0, 200, 100, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(0, 200, 100, 0.2);
          margin-top: 16px;
        }
        .success-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }
      `}</style>
    </main>
  );
}
