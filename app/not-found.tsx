import Link from "next/link";

import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="site-shell not-found-shell">
        <div className="glass-card not-found-card">
          <div className="eyebrow">404</div>
          <h1>Такой карточки пока нет</h1>
          <p>Вернись к атласу или на главную, чтобы продолжить исследование когнитивных искажений.</p>
          <div className="inline-actions">
            <Link className="primary-button" href="/#atlas">
              К атласу
            </Link>
            <Link className="ghost-button" href="/">
              На главную
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
