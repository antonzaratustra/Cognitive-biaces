import { NextResponse } from "next/server";

import { checkQuizAccess } from "@/lib/quiz-access";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const tgId = searchParams.get("tgId");

  if (!slug) {
    return NextResponse.json({ hasAccess: false, reason: "missing_slug" }, { status: 400 });
  }

  const result = await checkQuizAccess(slug, tgId);
  return NextResponse.json(result);
}
