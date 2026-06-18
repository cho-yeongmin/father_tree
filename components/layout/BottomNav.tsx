"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/map", label: "나무 지도", icon: "🗺️" },
  { href: "/library", label: "나의 라이브러리", icon: "📚" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card safe-area-bottom"
      aria-label="주요 메뉴"
    >
      <ul className="mx-auto flex max-w-lg">
        {navItems.map(({ href, label, icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                prefetch
                className={[
                  "flex min-h-touch flex-col items-center justify-center gap-1 py-2 text-base font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted hover:text-foreground",
                ].join(" ")}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="text-2xl" aria-hidden>
                  {icon}
                </span>
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
