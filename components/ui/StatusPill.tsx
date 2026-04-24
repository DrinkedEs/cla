import type { ReactNode } from "react";

type StatusPillProps = {
  children: ReactNode;
  tone?: StatusTone;
};

export type StatusTone = "violet" | "mint" | "rose" | "muted";

const tones = {
  violet: "border-[rgba(124,76,194,0.18)] bg-[rgba(124,76,194,0.08)] text-[var(--violet-deep)]",
  mint: "border-[rgba(69,172,154,0.16)] bg-[rgba(98,215,188,0.14)] text-[#177d6d]",
  rose: "border-[rgba(236,102,148,0.18)] bg-[rgba(255,228,239,0.7)] text-[#c44c7a]",
  muted: "border-[rgba(105,73,150,0.12)] bg-white/65 text-[var(--text-soft)]"
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
