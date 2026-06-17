"use client";

import type { ReactNode } from "react";
import type { TreeType } from "@/types/database";

export interface MapTypeFilters {
  natural_monument: boolean;
  protected_tree: boolean;
  visited_reviewed: boolean;
}

export const DEFAULT_MAP_TYPE_FILTERS: MapTypeFilters = {
  natural_monument: true,
  protected_tree: true,
  visited_reviewed: true,
};

interface MapTypeFilterProps {
  filters: MapTypeFilters;
  onChange: (filters: MapTypeFilters) => void;
}

const LEGEND_ITEMS: {
  key: keyof MapTypeFilters;
  label: string;
  indicator: ReactNode;
}[] = [
  {
    key: "natural_monument",
    label: "천연기념물",
    indicator: (
      <span
        className="inline-block h-4 w-4 shrink-0 rounded-full bg-red-600"
        aria-hidden
      />
    ),
  },
  {
    key: "protected_tree",
    label: "보호수",
    indicator: (
      <span
        className="inline-block h-4 w-4 shrink-0 rounded-full bg-green-700"
        aria-hidden
      />
    ),
  },
  {
    key: "visited_reviewed",
    label: "방문·리뷰",
    indicator: (
      <span className="shrink-0 text-lg leading-none" aria-hidden>
        ⭐
      </span>
    ),
  },
];

export function MapTypeFilter({ filters, onChange }: MapTypeFilterProps) {
  function toggle(key: keyof MapTypeFilters) {
    onChange({ ...filters, [key]: !filters[key] });
  }

  return (
    <div className="border-t border-border bg-card px-4 py-3">
      <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3">
        {LEGEND_ITEMS.map(({ key, label, indicator }) => {
          const checked = filters[key];
          const inputId = `map-filter-${key}`;

          return (
            <li key={key}>
              <label
                htmlFor={inputId}
                className="flex min-h-touch cursor-pointer items-center gap-3 text-lg text-foreground"
              >
                <input
                  id={inputId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(key)}
                  className="h-6 w-6 shrink-0 accent-primary"
                />
                {indicator}
                <span className={checked ? "" : "text-muted line-through"}>
                  {label}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function filterTreesByType<T extends { type: TreeType }>(
  trees: T[],
  filters: MapTypeFilters,
): T[] {
  return trees.filter((tree) => {
    if (tree.type === "natural_monument") {
      return filters.natural_monument;
    }
    if (tree.type === "protected_tree") {
      return filters.protected_tree;
    }
    return true;
  });
}
