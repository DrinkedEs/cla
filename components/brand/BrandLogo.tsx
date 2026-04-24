"use client";

import Image from "next/image";
import laLogo from "@/data/assets/la.png";

type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
};

const sizeMap = {
  sm: 36,
  md: 56,
  lg: 104
};

export function BrandLogo({
  size = "md",
  animated = false,
  className = ""
}: BrandLogoProps) {
  const dimension = sizeMap[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-[28px] border border-white/50 bg-white/85 shadow-[0_20px_70px_rgba(96,61,154,0.16)] backdrop-blur ${animated ? "brand-logo-float" : ""} ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      <div className="absolute inset-1 rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.18),transparent_62%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,236,255,0.92))]" />
      <Image
        src={laLogo}
        alt="Logo L&A Dental"
        width={Math.round(dimension * 0.7)}
        height={Math.round(dimension * 0.7)}
        className="relative z-10 h-auto w-[70%] object-contain"
        priority={animated}
      />
    </div>
  );
}
