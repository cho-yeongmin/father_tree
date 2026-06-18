import { BottomNav } from "@/components/layout/BottomNav";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col pb-28">
      <div className="flex flex-1 flex-col">{children}</div>
      <InstallPrompt />
      <BottomNav />
    </div>
  );
}
