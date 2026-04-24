import type { ReactNode } from "react";

type SurfaceProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "button";
  onClick?: () => void;
};

export function Surface({
  children,
  className = "",
  as: Component = "div",
  onClick
}: SurfaceProps) {
  return (
    <Component
      onClick={onClick}
      className={`glass-panel rounded-[1.8rem] border border-[var(--surface-border)] bg-[var(--surface)] p-5 text-[var(--text)] shadow-[0_22px_70px_rgba(93,66,140,0.12)] backdrop-blur ${className}`}
    >
      {children}
    </Component>
  );
}
