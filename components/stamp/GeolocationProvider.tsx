"use client";

import { StampNotifier } from "@/components/stamp/StampNotifier";
import { useStampTour } from "@/hooks/useStampTour";

export function GeolocationProvider() {
  const { stampEvent, dismissStamp } = useStampTour();

  if (!stampEvent) return null;

  return (
    <StampNotifier
      tree={stampEvent.tree}
      distanceM={stampEvent.distanceM}
      newBadges={stampEvent.newBadges}
      onDismiss={dismissStamp}
    />
  );
}
