"use client";

interface StarRatingInputProps {
  value: number | null;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

const STAR_LABELS = ["1점", "2점", "3점", "4점", "5점"];

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
}: StarRatingInputProps) {
  return (
    <div
      className="flex gap-2"
      role="radiogroup"
      aria-label="별점 선택"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isSelected = value != null && star <= value;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={STAR_LABELS[star - 1]}
            disabled={disabled}
            onClick={() => onChange(star)}
            className={[
              "flex min-h-touch min-w-touch items-center justify-center rounded-xl text-4xl transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isSelected
                ? "text-accent"
                : "text-border hover:text-accent/60",
            ].join(" ")}
          >
            {isSelected ? "★" : "☆"}
          </button>
        );
      })}
    </div>
  );
}
