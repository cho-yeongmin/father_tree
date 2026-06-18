"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PROTECTED_TREE_REGIONS } from "@/lib/data/protected-tree-regions";
import { PROTECTED_TREE_SPECIES } from "@/lib/data/protected-tree-species";
import {
  formatProtectedRegionSelection,
  isAllProtectedRegionsSelected,
  isProtectedRegionSelected,
  toggleAllProtectedRegions,
  toggleProtectedRegion,
  type ProtectedRegionSelection,
} from "@/lib/trees/region-filter";
import {
  isAllProtectedSpeciesSelected,
  isProtectedSpeciesSelected,
  toggleAllProtectedSpecies,
  toggleProtectedSpecies,
  type ProtectedSpeciesSelection,
} from "@/lib/trees/species-filter";

type FilterTab = "region" | "species";

interface ProtectedTreeFilterSheetProps {
  open: boolean;
  regionSelection: ProtectedRegionSelection;
  speciesSelection: ProtectedSpeciesSelection;
  onRegionChange: (selected: ProtectedRegionSelection) => void;
  onSpeciesChange: (selected: ProtectedSpeciesSelection) => void;
  onFocusRegion: (region: string) => void;
  onClose: () => void;
}

export function ProtectedTreeFilterSheet({
  open,
  regionSelection,
  speciesSelection,
  onRegionChange,
  onSpeciesChange,
  onFocusRegion,
  onClose,
}: ProtectedTreeFilterSheetProps) {
  const [tab, setTab] = useState<FilterTab>("region");
  const [speciesQuery, setSpeciesQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setSpeciesQuery("");
      setTab("region");
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
    const keyword = speciesQuery.trim().toLowerCase();
    if (!keyword) {
      return PROTECTED_TREE_SPECIES;
    }
    return PROTECTED_TREE_SPECIES.filter((item) =>
      item.name.toLowerCase().includes(keyword),
    );
  }, [speciesQuery]);

  if (!open) {
    return null;
  }

  const allRegionsSelected = isAllProtectedRegionsSelected(regionSelection);
  const allSpeciesSelected = isAllProtectedSpeciesSelected(speciesSelection);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="protected-filter-title"
      className="fixed inset-0 z-50 flex flex-col bg-background safe-area-bottom"
    >
      <div className="shrink-0 border-b border-border px-4 pb-3 pt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="protected-filter-title" className="text-xl font-bold text-foreground">
            보호수 필터
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-touch rounded-lg px-3 text-lg text-muted"
          >
            닫기
          </button>
        </div>

        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setTab("region")}
            className={[
              "min-h-touch flex-1 rounded-xl px-3 text-base font-medium",
              tab === "region"
                ? "bg-primary text-primary-foreground"
                : "border-2 border-border bg-background text-foreground",
            ].join(" ")}
          >
            지역
          </button>
          <button
            type="button"
            onClick={() => setTab("species")}
            className={[
              "min-h-touch flex-1 rounded-xl px-3 text-base font-medium",
              tab === "species"
                ? "bg-primary text-primary-foreground"
                : "border-2 border-border bg-background text-foreground",
            ].join(" ")}
          >
            종류
          </button>
        </div>

        {tab === "species" && (
          <input
            type="search"
            value={speciesQuery}
            onChange={(event) => setSpeciesQuery(event.target.value)}
            placeholder="나무 이름 검색"
            className="min-h-touch w-full rounded-xl border-2 border-border bg-card px-4 text-lg text-foreground placeholder:text-muted"
          />
        )}

        <div className={tab === "species" ? "mt-3 flex gap-2" : "flex gap-2"}>
          <Button
            type="button"
            variant={
              tab === "region"
                ? allRegionsSelected
                  ? "primary"
                  : "outline"
                : allSpeciesSelected
                  ? "primary"
                  : "outline"
            }
            className="flex-1 px-3 text-base"
            onClick={() => {
              if (tab === "region") {
                onRegionChange(toggleAllProtectedRegions(regionSelection));
              } else {
                onSpeciesChange(toggleAllProtectedSpecies(speciesSelection));
              }
            }}
          >
            전체 선택 및 해지
          </Button>
        </div>

        {tab === "region" && (
          <p className="mt-2 text-sm text-muted">
            선택: {formatProtectedRegionSelection(regionSelection)}
          </p>
        )}
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
        {tab === "region" ? (
          PROTECTED_TREE_REGIONS.map((item) => {
            const checked = isProtectedRegionSelected(regionSelection, item.name);
            const inputId = `region-filter-${item.name}`;

            return (
              <li
                key={item.name}
                className="border-b border-border/70 last:border-0"
              >
                <div className="flex min-h-touch items-center gap-3 py-2">
                  <label
                    htmlFor={inputId}
                    className="flex flex-1 cursor-pointer items-center gap-3"
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        onRegionChange(
                          toggleProtectedRegion(regionSelection, item.name),
                        )
                      }
                      className="h-6 w-6 shrink-0 accent-primary"
                    />
                    <span className="flex-1 text-lg text-foreground">
                      {item.name}
                    </span>
                    <span className="text-base text-muted">
                      {item.count.toLocaleString()}그루
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => onFocusRegion(item.name)}
                    className="shrink-0 rounded-lg border border-border px-2 py-1 text-sm text-primary"
                  >
                    이동
                  </button>
                </div>
              </li>
            );
          })
        ) : filteredSpecies.length === 0 ? (
          <li className="py-8 text-center text-lg text-muted">
            검색 결과가 없습니다
          </li>
        ) : (
          filteredSpecies.map((item) => {
            const checked = isProtectedSpeciesSelected(
              speciesSelection,
              item.name,
            );
            const inputId = `species-filter-${item.name}`;

            return (
              <li
                key={item.name}
                className="border-b border-border/70 last:border-0"
              >
                <label
                  htmlFor={inputId}
                  className="flex min-h-touch cursor-pointer items-center gap-3 py-2"
                >
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      onSpeciesChange(
                        toggleProtectedSpecies(speciesSelection, item.name),
                      )
                    }
                    className="h-6 w-6 shrink-0 accent-primary"
                  />
                  <span className="flex-1 text-lg text-foreground">
                    {item.name}
                  </span>
                  <span className="text-base text-muted">
                    {item.count.toLocaleString()}그루
                  </span>
                </label>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
