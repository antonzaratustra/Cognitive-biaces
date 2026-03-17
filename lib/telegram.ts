const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "cognitive_biases_atlas_bot";

export function telegramDeepLink(startPayload: string) {
  return `https://t.me/${botUsername}?start=${encodeURIComponent(startPayload)}`;
}

export function atlasDeepLink(slug: string) {
  return telegramDeepLink(`lesson_${slug}`);
}

export function quizOfferLink() {
  return telegramDeepLink("quiz_offer");
}
