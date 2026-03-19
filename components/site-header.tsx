"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { telegramDeepLink } from "@/lib/telegram";

const navItems = [
  { href: "/#about", label: "О курсе" },
  { href: "/#for-who", label: "Для кого" },
  { href: "/#atlas", label: "Атлас" },
  { href: "/#flow", label: "Как проходит" },
  { href: "/#quiz", label: "Квизы" }
];

type SiteHeaderProps = {
  alwaysVisible?: boolean;
};

export function SiteHeader({ alwaysVisible = false }: SiteHeaderProps) {
  const [visible, setVisible] = useState(alwaysVisible);

  useEffect(() => {
    if (alwaysVisible) {
      return;
    }

    const onScroll = () => {
      setVisible(window.scrollY > 80);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [alwaysVisible]);

  return (
    <div className={visible ? "floating-header floating-header--visible" : "floating-header"}>
      <div className="site-shell">
        <div className="site-header">
          <Link className="brand-mark" href="/">
            <span className="brand-mark__dot" />
            Bias Atlas
          </Link>

          <nav className="site-nav" aria-label="Основная навигация">
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <a className="ghost-button" href={telegramDeepLink("start")}>
              Открыть курс
            </a>
            <a className="primary-button" href="/quizzes/judgment-lab">
              Quiz pack
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
