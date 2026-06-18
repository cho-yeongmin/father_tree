import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScreenLogoutFooter } from "@/components/layout/ScreenLogoutFooter";
import { MapPageClient } from "@/components/map/MapPageClient";
import { GeolocationProvider } from "@/components/stamp/GeolocationProvider";
import { getMapInitialData } from "@/lib/queries/trees";

async function MapContent() {
  const { naturalMonuments, reviewedTreeIds } = await getMapInitialData();

  return (
    <MapPageClient
      naturalMonuments={naturalMonuments}
      reviewedTreeIds={Array.from(reviewedTreeIds)}
    />
  );
}

export default function MapPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="나무 지도"
        description="전국의 천연기념물과 보호수를 찾아보세요"
      />
      <div className="relative flex flex-1 flex-col">
        <Suspense
          fallback={
            <div className="flex flex-1 min-h-[50vh] items-center justify-center bg-border/20">
              <p className="text-lg text-muted">지도를 준비하는 중...</p>
            </div>
          }
        >
          <MapContent />
        </Suspense>
        <GeolocationProvider />
      </div>
      <ScreenLogoutFooter />
    </div>
  );
}
