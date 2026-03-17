import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { parseTelegramUser, validateTelegramInitData } from "@/lib/telegram-auth";

const schema = z.object({
  consentEmail: z.boolean(),
  consentTerms: z.boolean(),
  email: z.string().email(),
  initData: z.string().min(1),
  source: z.string().optional()
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message || "Некорректные данные регистрации."
      },
      { status: 400 }
    );
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json(
      {
        ok: false,
        error: "TELEGRAM_BOT_TOKEN не задан. Добавь переменную окружения и повтори регистрацию."
      },
      { status: 501 }
    );
  }

  const isValid = validateTelegramInitData(parsed.data.initData, botToken);

  if (!isValid) {
    return NextResponse.json({ ok: false, error: "Telegram initData не прошел проверку подписи." }, { status: 401 });
  }

  const user = parseTelegramUser(new URLSearchParams(parsed.data.initData).get("user"));

  if (!user) {
    return NextResponse.json({ ok: false, error: "Не удалось прочитать пользователя из Telegram." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({
      ok: true,
      mode: "demo",
      user: {
        firstName: user.first_name || null,
        tgId: String(user.id),
        username: user.username || null
      }
    });
  }

  const now = new Date().toISOString();
  const userPayload = {
    tg_id: String(user.id),
    tg_username: user.username || null,
    first_name: user.first_name || null,
    last_name: user.last_name || null,
    email: parsed.data.email,
    marketing_consent: parsed.data.consentEmail,
    updated_at: now
  };

  const userUpsert = await supabase
    .from("cb_users")
    .upsert(userPayload, { onConflict: "tg_id" })
    .select("id")
    .single();

  if (userUpsert.error) {
    return NextResponse.json({ ok: false, error: userUpsert.error.message }, { status: 500 });
  }

  const leadInsert = await supabase
    .from("cb_leads")
    .insert({
      bound_user_id: userUpsert.data.id,
      consent_email: parsed.data.consentEmail,
      consent_terms: parsed.data.consentTerms,
      email: parsed.data.email,
      source: parsed.data.source || "miniapp_register",
      tg_id: String(user.id),
      tg_username: user.username || null
    })
    .select("id")
    .single();

  if (leadInsert.error) {
    return NextResponse.json({ ok: false, error: leadInsert.error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    mode: "supabase",
    leadId: leadInsert.data.id,
    user: {
      firstName: user.first_name || null,
      tgId: String(user.id),
      username: user.username || null
    }
  });
}
