import type { ReactNode } from "react";

type StatusPillProps = {
  children: ReactNode;
  tone?: StatusTone;
};

export type StatusTone = "violet" | "mint" | "rose" | "muted";

const tones = {
  violet: "border-violet-300/20 bg-violet-300/12 text-violet-100",
  mint: "border-mint/20 bg-mint/10 text-mint",
  rose: "border-rose/20 bg-rose/10 text-rose",
  muted: "border-white/10 bg-white/[0.06] text-white/65"
};

export function StatusPill({ children, tone = "violet" }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
