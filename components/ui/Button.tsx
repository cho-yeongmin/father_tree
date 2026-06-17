import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
  secondary:
    "bg-accent text-foreground hover:bg-accent/90 active:bg-accent/80",
  outline:
    "border-2 border-primary text-primary bg-transparent hover:bg-primary/5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", fullWidth, className = "", children, ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={[
          "inline-flex min-h-touch items-center justify-center gap-2 rounded-xl px-6 text-lg font-medium transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variantStyles[variant],
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </button>
    );
  },
);
