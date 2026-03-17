import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Cognitive Bias Atlas",
  description:
    "Landing + atlas-first MVP для курса по когнитивным искажениям: интерактивная карта, карточки уроков, Telegram-курс и quiz pack.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
