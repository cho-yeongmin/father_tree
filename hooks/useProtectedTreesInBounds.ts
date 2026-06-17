"use client";

import { useEffect, useRef, useState } from "react";
import { boundsKey, type GeoBounds } from "@/lib/geo/bounds";
import { fetchProtectedTreesInBoundsClient } from "@/lib/queries/trees-client";
import type { Tree } from "@/types/database";

const FETCH_DEBOUNCE_MS = 250;
const MAX_CACHED_PROTECTED_TREES = 4000;

interface UseProtectedTreesInBoundsOptions {
  bounds: GeoBounds | null;
  enabled: boolean;
}

export function useProtectedTreesInBounds({
  bounds,
  enabled,
}: UseProtectedTreesInBoundsOptions) {
  const [protectedTrees, setProtectedTrees] = useState<Tree[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, Tree>>(new Map());
  const loadedBoundsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || !bounds) {
      return;
    }

    const requestKey = boundsKey(bounds);
    if (loadedBoundsRef.current.has(requestKey)) {
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const trees = await fetchProtectedTreesInBoundsClient(bounds);
        if (cancelled) {
          return;
        }

        loadedBoundsRef.current.add(requestKey);
        const cache = cacheRef.current;

        for (const tree of trees) {
          cache.set(tree.id, tree);
        }

        if (cache.size > MAX_CACHED_PROTECTED_TREES) {
          const keepIds = new Set(trees.map((tree) => tree.id));
          for (const id of cache.keys()) {
            if (!keepIds.has(id)) {
              cache.delete(id);
            }
          }
        }

        setProtectedTrees(Array.from(cache.values()));
      } catch {
        if (!cancelled) {
          setError("보호수를 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, FETCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [bounds, enabled]);

  useEffect(() => {
    if (!enabled) {
      cacheRef.current.clear();
      loadedBoundsRef.current.clear();
      setProtectedTrees([]);
      setError(null);
      setIsLoading(false);
    }
  }, [enabled]);

  return { protectedTrees, isLoading, error };
}
