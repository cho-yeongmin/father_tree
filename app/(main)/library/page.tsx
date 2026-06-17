import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SortFilter } from "@/components/library/SortFilter";
import { VisitList } from "@/components/library/VisitList";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getLibraryItems } from "@/lib/queries/library";
import type { LibrarySortKey } from "@/types/database";

interface LibraryPageProps {
  searchParams: Promise<{ sort?: string }>;
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const params = await searchParams;
  const sort = (params.sort as LibrarySortKey) ?? "visited_at";
  const validSort: LibrarySortKey = ["visited_at", "region", "rating"].includes(
    sort,
  )
    ? sort
    : "visited_at";

  const { items, isLoggedIn } = await getLibraryItems(validSort);

  return (
    <>
      <PageHeader
        title="나의 라이브러리"
        description="방문 인증한 나무와 감상을 모아둡니다"
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Suspense fallback={<div className="h-touch" />}>
          <SortFilter />
        </Suspense>

        {!isLoggedIn ? (
          <Card className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <p className="text-6xl" aria-hidden>
              🔐
            </p>
            <p className="mt-4 text-xl font-medium text-foreground">
              로그인이 필요합니다
            </p>
            <p className="mt-2 text-lg text-muted">
              방문 스탬프와 감상을 저장하려면 로그인해 주세요
            </p>
            <Link href="/auth/login" className="mt-6 block w-full max-w-xs">
              <Button fullWidth>로그인하기</Button>
            </Link>
          </Card>
        ) : items.length === 0 ? (
          <Card className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <p className="text-6xl" aria-hidden>
                📚
              </p>
              <p className="mt-4 text-xl font-medium text-foreground">
                아직 방문한 나무가 없습니다
              </p>
              <p className="mt-2 text-lg text-muted">
                지도에서 나무를 찾아 가까이 가면 스탬프가 찍힙니다
              </p>
              <Link href="/map" className="mt-6 inline-block">
                <Button>지도로 가기</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <VisitList items={items} />
        )}
      </div>
    </>
  );
}
