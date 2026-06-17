import { PageHeader } from "@/components/layout/PageHeader";
import { MapPageClient } from "@/components/map/MapPageClient";
import { getTreesForMap } from "@/lib/queries/trees";

export default async function MapPage() {
  const { trees, reviewedTreeIds } = await getTreesForMap();

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="나무 지도"
        description="전국의 천연기념물과 보호수를 찾아보세요"
      />
      <div className="relative flex flex-1 flex-col">
        <MapPageClient
          trees={trees}
          reviewedTreeIds={Array.from(reviewedTreeIds)}
        />
      </div>
      <div className="border-t border-border bg-card px-4 py-3">
        <ul className="flex flex-wrap justify-center gap-4 text-base text-muted">
          <li className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 rounded-full bg-red-600" />
            천연기념물
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 rounded-full bg-green-700" />
            보호수
          </li>
          <li className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>⭐</span>
            방문·리뷰
          </li>
        </ul>
      </div>
    </div>
  );
}
