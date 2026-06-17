import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { TreeDetailContent } from "@/components/trees/TreeDetailContent";
import { getTreeById } from "@/lib/queries/trees";
import { getVisitPhotos } from "@/lib/queries/visit-photos";
import { getLatestVisitForTree } from "@/lib/queries/visits";

interface TreeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TreeDetailPage({ params }: TreeDetailPageProps) {
  const { id } = await params;
  const tree = await getTreeById(id);

  if (!tree) {
    notFound();
  }

  const { visit, isLoggedIn } = await getLatestVisitForTree(id);
  const photos = visit ? await getVisitPhotos(visit.id) : [];

  return (
    <div className="flex min-h-full flex-1 flex-col pb-6">
      <PageHeader title="나무 상세" description={tree.summary ?? undefined} />
      <TreeDetailContent
        tree={tree}
        visit={visit}
        isLoggedIn={isLoggedIn}
        photos={photos}
      />
    </div>
  );
}
