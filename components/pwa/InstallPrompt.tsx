"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isStandaloneMode()) return;

    const dismissedAt = localStorage.getItem("pwa-install-dismissed");
    if (dismissedAt) {
      const daysSince =
        (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        setDismissed(true);
        return;
      }
    }

    if (isIosDevice()) {
      setShowIosGuide(true);
      return;
    }

    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  function handleDismiss() {
    localStorage.setItem("pwa-install-dismissed", String(Date.now()));
    setDismissed(true);
    setShowIosGuide(false);
    setInstallEvent(null);
  }

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    setStatus(
      outcome === "accepted"
        ? "홈 화면에 추가되었습니다!"
        : "나중에 다시 안내해 드릴게요.",
    );
    setInstallEvent(null);
    if (outcome === "accepted") {
      setDismissed(true);
    }
  }

  if (dismissed || isStandaloneMode()) return null;
  if (!installEvent && !showIosGuide) return null;

  return (
    <div className="fixed inset-x-4 bottom-32 z-40">
      <Card padding="lg" className="border-2 border-primary shadow-xl">
        <h2 className="text-xl font-bold text-foreground">
          홈 화면에 추가하기
        </h2>
        <p className="mt-2 text-lg text-muted">
          앱처럼 바로 열어 나무 지도를 편하게 보실 수 있습니다.
        </p>

        {showIosGuide ? (
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-lg text-foreground">
            <li>하단 <strong>공유</strong> 버튼을 누릅니다</li>
            <li><strong>홈 화면에 추가</strong>를 선택합니다</li>
            <li><strong>추가</strong>를 누릅니다</li>
          </ol>
        ) : (
          <Button fullWidth className="mt-4" onClick={handleInstall}>
            📲 홈 화면에 추가
          </Button>
        )}

        <Button
          fullWidth
          variant="outline"
          className="mt-2"
          onClick={handleDismiss}
        >
          나중에
        </Button>

        {status && (
          <p className="mt-3 text-lg text-primary" role="status">
            {status}
          </p>
        )}
      </Card>
    </div>
  );
}
