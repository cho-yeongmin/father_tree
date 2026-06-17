import { PageHeader } from "@/components/layout/PageHeader";
import { MapPageClient } from "@/components/map/MapPageClient";
import { getMapInitialData } from "@/lib/queries/trees";

export default async function MapPage() {
  const { naturalMonuments, reviewedTreeIds } = await getMapInitialData();

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="나무 지도"
        description="전국의 천연기념물과 보호수를 찾아보세요"
      />
      <div className="relative flex flex-1 flex-col">
        <MapPageClient
          naturalMonuments={naturalMonuments}
          reviewedTreeIds={Array.from(reviewedTreeIds)}
        />
      </div>
    </div>
  );
}
