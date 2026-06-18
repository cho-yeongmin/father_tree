"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PROTECTED_TREE_SPECIES } from "@/lib/data/protected-tree-species";
import {
  isAllProtectedSpeciesSelected,
  isProtectedSpeciesSelected,
  toggleAllProtectedSpecies,
  toggleProtectedSpecies,
  type ProtectedSpeciesSelection,
} from "@/lib/trees/species-filter";

interface SpeciesFilterSheetProps {
  open: boolean;
  selected: ProtectedSpeciesSelection;
  onChange: (selected: ProtectedSpeciesSelection) => void;
  onClose: () => void;
}

export function SpeciesFilterSheet({
  open,
  selected,
  onChange,
  onClose,
}: SpeciesFilterSheetProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const filteredSpecies = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return PROTECTED_TREE_SPECIES;
    }

    return PROTECTED_TREE_SPECIES.filter((item) =>
      item.name.toLowerCase().includes(keyword),
    );
  }, [query]);

  if (!open) {
    return null;
  }

  const allSelected = isAllProtectedSpeciesSelected(selected);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="종류 선택 닫기"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="species-filter-title"
        className="relative flex max-h-[78vh] flex-col rounded-t-2xl bg-card shadow-2xl safe-area-bottom"
      >
        <div className="border-b border-border px-4 pb-3 pt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="species-filter-title" className="text-xl font-bold text-foreground">
              보호수 종류
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="min-h-touch rounded-lg px-3 text-lg text-muted"
            >
              닫기
            </button>
          </div>

          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="나무 이름 검색"
            className="min-h-touch w-full rounded-xl border-2 border-border bg-background px-4 text-lg text-foreground placeholder:text-muted"
          />

          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              variant={allSelected ? "primary" : "outline"}
              className="flex-1 px-3 text-base"
              onClick={() => onChange(toggleAllProtectedSpecies(selected))}
            >
              전체 선택 및 해지
            </Button>
          </div>
        </div>

        <ul className="flex-1 overflow-y-auto px-4 py-2">
          {filteredSpecies.length === 0 ? (
            <li className="py-8 text-center text-lg text-muted">
              검색 결과가 없습니다
            </li>
          ) : (
            filteredSpecies.map((item) => {
              const checked = isProtectedSpeciesSelected(selected, item.name);
              const inputId = `species-filter-${item.name}`;

              return (
                <li key={item.name} className="border-b border-border/70 last:border-0">
                  <label
                    htmlFor={inputId}
                    className="flex min-h-touch cursor-pointer items-center gap-3 py-2"
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        onChange(toggleProtectedSpecies(selected, item.name))
                      }
                      className="h-6 w-6 shrink-0 accent-primary"
                    />
                    <span className="flex-1 text-lg text-foreground">{item.name}</span>
                    <span className="text-base text-muted">{item.count.toLocaleString()}그루</span>
                  </label>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
