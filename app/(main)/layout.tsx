import { BottomNav } from "@/components/layout/BottomNav";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { GeolocationProvider } from "@/components/stamp/GeolocationProvider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col pb-28">
      <div className="flex items-center justify-end border-b border-border bg-card px-4 py-2">
        <AuthStatus />
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
      <GeolocationProvider />
      <InstallPrompt />
      <BottomNav />
    </div>
  );
}
