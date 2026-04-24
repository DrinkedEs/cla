import type { ButtonHTMLAttributes, ReactNode } from "react";
import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  icon?: AppIconName;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

const variants = {
  primary:
    "bg-[linear-gradient(135deg,var(--violet-main),var(--violet-glow))] text-white shadow-[0_16px_40px_rgba(124,76,194,0.24)] hover:brightness-105 active:scale-[0.98]",
  secondary:
    "border border-[rgba(124,76,194,0.18)] bg-[rgba(124,76,194,0.08)] text-[var(--violet-deep)] hover:bg-[rgba(124,76,194,0.12)] active:scale-[0.98]",
  ghost:
    "border border-[rgba(105,73,150,0.12)] bg-white/65 text-[var(--text)] hover:bg-white active:scale-[0.98]"
};

export function buttonClasses(
  variant: "primary" | "secondary" | "ghost" = "primary",
  className = ""
) {
  return `inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`;
}

export function PrimaryButton({
  children,
  icon,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, className)}
      {...props}
    >
      {children}
      {icon ? <AppIcon name={icon} className="h-4 w-4" /> : null}
    </button>
  );
}
