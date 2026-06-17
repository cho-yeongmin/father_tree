"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getDistanceMeters } from "@/lib/geo/distance";
import { fetchTreesNearPositionClient } from "@/lib/queries/trees-client";
import { createClient } from "@/lib/supabase/client";
import type { Tree } from "@/types/database";
import { useGeolocation } from "./useGeolocation";

interface StampEvent {
  tree: Tree;
  distanceM: number;
}

interface UseStampTourOptions {
  enabled?: boolean;
}

export function useStampTour({ enabled = true }: UseStampTourOptions = {}) {
  const { position, error: geoError } = useGeolocation({ enabled });
  const [nearbyTrees, setNearbyTrees] = useState<Tree[]>([]);
  const [stampEvent, setStampEvent] = useState<StampEvent | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const stampedTodayRef = useRef<Set<string>>(new Set());
  const processingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  useEffect(() => {
    if (!position || !enabled) {
      setNearbyTrees([]);
      return;
    }

    let cancelled = false;

    fetchTreesNearPositionClient(position.latitude, position.longitude).then(
      (trees) => {
        if (!cancelled) {
          setNearbyTrees(trees);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [position, enabled]);

  const requestNotificationPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  const showNotification = useCallback((tree: Tree) => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("방문 스탬프 획득! 🌳", {
        body: `${tree.name} 방문이 인증되었습니다.`,
        icon: "/markers/marker-star.svg",
      });
    }
  }, []);

  useEffect(() => {
    if (!position || !enabled || isLoggedIn === false || nearbyTrees.length === 0) {
      return;
    }

    const currentPosition = position;

    async function checkStamps() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoggedIn(false);
        return;
      }

      for (const tree of nearbyTrees) {
        if (
          stampedTodayRef.current.has(tree.id) ||
          processingRef.current.has(tree.id)
        ) {
          continue;
        }

        const distanceM = getDistanceMeters(
          currentPosition.latitude,
          currentPosition.longitude,
          tree.latitude,
          tree.longitude,
        );

        if (distanceM > tree.stamp_radius_m) continue;

        processingRef.current.add(tree.id);

        const { error } = await supabase.from("visits").insert({
          user_id: user.id,
          tree_id: tree.id,
          is_auto_stamped: true,
          stamp_latitude: currentPosition.latitude,
          stamp_longitude: currentPosition.longitude,
          distance_m: Math.round(distanceM * 10) / 10,
        });

        processingRef.current.delete(tree.id);

        if (error) {
          if (error.code === "23505") {
            stampedTodayRef.current.add(tree.id);
          }
          continue;
        }

        stampedTodayRef.current.add(tree.id);
        setStampEvent({ tree, distanceM });
        showNotification(tree);
      }
    }

    checkStamps();
  }, [position, nearbyTrees, enabled, isLoggedIn, showNotification]);

  const dismissStamp = useCallback(() => setStampEvent(null), []);

  return {
    stampEvent,
    dismissStamp,
    geoError,
    isLoggedIn,
    position,
  };
}
