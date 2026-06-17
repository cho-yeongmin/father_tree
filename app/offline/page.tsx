import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function OfflinePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PageHeader
        title="오프라인 상태"
        description="인터넷 연결을 확인해 주세요"
      />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <Card padding="lg" className="max-w-md">
          <p className="text-6xl" aria-hidden>
            📡
          </p>
          <p className="mt-4 text-xl font-medium text-foreground">
            지금은 오프라인입니다
          </p>
          <p className="mt-3 text-lg text-muted">
            Wi-Fi 또는 모바일 데이터를 켠 뒤 다시 시도해 주세요.
            이전에 방문한 페이지는 일부 이용할 수 있습니다.
          </p>
          <Link href="/map" className="mt-6 block">
            <Button fullWidth>지도로 이동</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
