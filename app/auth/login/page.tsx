import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/map");
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PageHeader
        title="로그인"
        description="방문 스탬프와 라이브러리를 저장하려면 로그인이 필요합니다"
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {supabaseUrl && supabaseKey ? (
          <LoginForm />
        ) : (
          <Card padding="lg">
            <p className="text-xl text-foreground">
              Supabase 환경 변수가 설정되지 않았습니다.
              <code className="mt-2 block text-base">.env.local</code> 파일을
              확인해 주세요.
            </p>
          </Card>
        )}
        <p className="text-center text-lg text-muted">
          <Link href="/map" className="font-medium text-primary underline">
            로그인 없이 지도만 보기
          </Link>
        </p>
      </div>
    </div>
  );
}
