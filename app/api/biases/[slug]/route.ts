import { NextResponse } from "next/server";

import { getLessonBySlug, getRelatedLessons } from "@/lib/content";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const lesson = await getLessonBySlug(slug);

  if (!lesson) {
    return NextResponse.json({ error: "bias_not_found" }, { status: 404 });
  }

  return NextResponse.json({
    lesson,
    related: await getRelatedLessons(slug)
  });
}
