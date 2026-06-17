import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function TreeNotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-6xl" aria-hidden>
        🌳
      </p>
      <h1 className="text-2xl font-bold text-foreground">나무를 찾을 수 없습니다</h1>
      <p className="text-lg text-muted">삭제되었거나 잘못된 주소일 수 있습니다.</p>
      <Link href="/map">
        <Button>지도로 돌아가기</Button>
      </Link>
    </div>
  );
}
