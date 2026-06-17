"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { LibrarySortKey } from "@/types/database";

const SORT_OPTIONS: { key: LibrarySortKey; label: string }[] = [
  { key: "visited_at", label: "날짜순" },
  { key: "region", label: "지역별" },
  { key: "rating", label: "별점 높은 순" },
];

export function SortFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = (searchParams.get("sort") as LibrarySortKey) ?? "visited_at";

  function handleSort(sort: LibrarySortKey) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="정렬 필터"
    >
      {SORT_OPTIONS.map(({ key, label }) => {
        const isActive = current === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleSort(key)}
            className={[
              "min-h-touch rounded-xl px-5 text-lg font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "border-2 border-border bg-card text-foreground hover:border-primary",
            ].join(" ")}
            aria-pressed={isActive}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
