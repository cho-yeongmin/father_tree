import Link from "next/link";
import Image from "next/image";
import type { Tree, Visit, VisitPhoto } from "@/types/database";
import { getTreeImages } from "@/lib/trees/images";
import { VisitReviewSection } from "@/components/review/VisitReviewSection";
import { TreeImageSection } from "@/components/trees/TreeImageSection";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { KakaoShareButton } from "./KakaoShareButton";
import { TmapButton } from "./TmapButton";

const TYPE_LABELS = {
  natural_monument: "천연기념물",
  protected_tree: "보호수",
} as const;

interface TreeDetailContentProps {
  tree: Tree;
  visit: Visit | null;
  isLoggedIn: boolean;
  photos: VisitPhoto[];
}

export function TreeDetailContent({
  tree,
  visit,
  isLoggedIn,
  photos,
}: TreeDetailContentProps) {
  const treeImages = getTreeImages(tree);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card padding="lg">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-base font-medium text-primary">
          {TYPE_LABELS[tree.type]}
        </span>
        <h2 className="mt-3 text-3xl font-bold leading-snug text-foreground">
          {tree.name}
        </h2>
        <p className="mt-2 text-xl text-muted">
          {tree.region}
          {tree.district ? ` · ${tree.district}` : ""}
        </p>
        {tree.address && (
          <p className="mt-2 text-lg text-muted">{tree.address}</p>
        )}
      </Card>

      <TreeImageSection images={treeImages} treeName={tree.name} />

      {tree.description && (
        <Card padding="lg">
          <h3 className="text-2xl font-bold text-foreground">유래와 설명</h3>
          <p className="mt-3 text-xl leading-relaxed text-foreground">
            {tree.description}
          </p>
        </Card>
      )}

      {tree.legend && (
        <Card padding="lg">
          <h3 className="text-2xl font-bold text-foreground">역사적 전설</h3>
          <p className="mt-3 text-xl leading-relaxed text-foreground">
            {tree.legend}
          </p>
        </Card>
      )}

      <VisitReviewSection
        treeName={tree.name}
        visit={visit}
        isLoggedIn={isLoggedIn}
        photos={photos}
      />

      <div className="flex flex-col gap-3">
        <TmapButton tree={tree} />
        <KakaoShareButton tree={tree} />
        <Link href="/map" className="block">
          <Button fullWidth variant="outline">
            지도로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}
