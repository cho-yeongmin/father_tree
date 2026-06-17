"use client";

interface NearbyFilterProps {
  enabled: boolean;
  onToggle: () => void;
  nearbyCount: number;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
}

export function NearbyFilter({
  enabled,
  onToggle,
  nearbyCount,
  totalCount,
  isLoading,
  error,
}: NearbyFilterProps) {
  return (
    <div className="border-b border-border bg-card px-4 py-3">
      <button
        type="button"
        onClick={onToggle}
        disabled={isLoading}
        className={[
          "flex min-h-touch w-full items-center justify-between rounded-xl px-5 text-lg font-medium transition-colors",
          enabled
            ? "bg-primary text-primary-foreground"
            : "border-2 border-border bg-background text-foreground hover:border-primary",
        ].join(" ")}
        aria-pressed={enabled}
      >
        <span>📍 내 주변 나무</span>
        <span className="text-base font-normal opacity-90">
          {isLoading
            ? "위치 확인 중..."
            : enabled
              ? `${nearbyCount}그루 (${DEFAULT_RADIUS_LABEL})`
              : `전체 ${totalCount}그루`}
        </span>
      </button>
      {error && enabled && (
        <p className="mt-2 text-lg text-red-600" role="alert">
          {error}
        </p>
      )}
      {enabled && !error && !isLoading && nearbyCount === 0 && (
        <p className="mt-2 text-lg text-muted">
          {DEFAULT_RADIUS_LABEL} 안에 나무가 없습니다. 필터를 끄면 전국 나무를 볼
          수 있습니다.
        </p>
      )}
    </div>
  );
}

const DEFAULT_RADIUS_LABEL = "10km 이내";
