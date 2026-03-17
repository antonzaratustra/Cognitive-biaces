import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { leadSchema } from "@/lib/leads";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = leadSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message || "Некорректные данные формы."
      },
      { status: 400 }
    );
  }

  const leadId = crypto.randomUUID();
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({
      ok: true,
      leadId,
      mode: "demo"
    });
  }

  const { error } = await supabase.from("cb_leads").insert({
    id: leadId,
    email: parsed.data.email,
    tg_username: parsed.data.tgUsername || null,
    source: parsed.data.source || "landing",
    utm_source: parsed.data.utmSource || null,
    utm_medium: parsed.data.utmMedium || null,
    utm_campaign: parsed.data.utmCampaign || null,
    consent_email: parsed.data.consentEmail,
    consent_terms: parsed.data.consentTerms
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    leadId,
    mode: "supabase"
  });
}
