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
      className={`rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-4 shadow-soft backdrop-blur ${className}`}
    >
      {children}
    </Component>
  );
}
