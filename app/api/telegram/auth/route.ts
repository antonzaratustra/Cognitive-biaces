import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { parseTelegramUser, validateTelegramInitData } from "@/lib/telegram-auth";

const schema = z.object({
  initData: z.string().min(1)
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Нужен initData из Telegram Mini App." }, { status: 400 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json(
      {
        ok: false,
        error: "TELEGRAM_BOT_TOKEN не задан. В demo-режиме страницу можно смотреть, но auth пока невалиден."
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
    return NextResponse.json({ ok: false, error: "Не удалось прочитать профиль пользователя из initData." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (supabase) {
    const now = new Date().toISOString();
    const { error } = await supabase.from("cb_users").upsert(
      {
        tg_id: String(user.id),
        tg_username: user.username || null,
        first_name: user.first_name || null,
        last_name: user.last_name || null,
        updated_at: now
      },
      {
        onConflict: "tg_id"
      }
    );

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    ok: true,
    user: {
      tgId: String(user.id),
      username: user.username || null,
      firstName: user.first_name || null,
      lastName: user.last_name || null
    }
  });
}
