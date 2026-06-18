import { LogoutButton } from "@/components/auth/LogoutButton";

export function ScreenLogoutFooter() {
  return (
    <div className="shrink-0 border-t border-border bg-card px-4 py-3">
      <LogoutButton fullWidth />
    </div>
  );
}
