"use client";

import { StampNotifier } from "@/components/stamp/StampNotifier";
import { useStampTour } from "@/hooks/useStampTour";
import type { Tree } from "@/types/database";

interface GeolocationProviderProps {
  trees: Tree[];
}

export function GeolocationProvider({ trees }: GeolocationProviderProps) {
  const { stampEvent, dismissStamp } = useStampTour({ trees });

  if (!stampEvent) return null;

  return (
    <StampNotifier
      tree={stampEvent.tree}
      distanceM={stampEvent.distanceM}
      onDismiss={dismissStamp}
    />
  );
}
