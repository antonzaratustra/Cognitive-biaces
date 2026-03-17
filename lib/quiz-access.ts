import { getProductBySku, getQuizBySlug } from "@/data/course-data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function checkQuizAccess(quizSlug: string, tgId?: string | null) {
  const quiz = getQuizBySlug(quizSlug);

  if (!quiz) {
    return { hasAccess: false, reason: "quiz_not_found" as const };
  }

  const product = getProductBySku(quiz.productSku);

  if (!product) {
    return { hasAccess: false, reason: "product_not_found" as const };
  }

  if (!tgId) {
    return { hasAccess: false, reason: "missing_tg_id" as const };
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return { hasAccess: false, reason: "demo_mode" as const };
  }

  const { data, error } = await supabase
    .from("cb_entitlements")
    .select("id")
    .eq("user_tg_id", tgId)
    .eq("product_sku", product.sku)
    .maybeSingle();

  if (error) {
    return { hasAccess: false, reason: "supabase_error" as const, error: error.message };
  }

  return { hasAccess: Boolean(data), reason: data ? ("ok" as const) : ("not_purchased" as const) };
}
