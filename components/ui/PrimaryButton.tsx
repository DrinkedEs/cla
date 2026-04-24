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
    "bg-violet-electric text-white shadow-aura hover:bg-violet-glow active:scale-[0.98]",
  secondary:
    "border border-violet-300/30 bg-violet-300/12 text-violet-100 hover:bg-violet-300/18 active:scale-[0.98]",
  ghost:
    "border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1] active:scale-[0.98]"
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
