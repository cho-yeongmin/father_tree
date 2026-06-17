"use client";

import type { Tree } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { openTmapNavigation } from "@/lib/tmap/deeplink";

interface TmapButtonProps {
  tree: Tree;
}

export function TmapButton({ tree }: TmapButtonProps) {
  return (
    <Button
      fullWidth
      variant="secondary"
      onClick={() => openTmapNavigation(tree)}
    >
      T map 길안내
    </Button>
  );
}
