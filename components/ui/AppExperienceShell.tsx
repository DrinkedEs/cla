"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";

function ToothBrushLoader() {
  return (
    <div className="relative h-16 w-16">
      <div className="absolute left-1/2 top-1/2 h-11 w-8 -translate-x-1/2 -translate-y-1/2 rounded-[45%_45%_38%_38%] border-[3px] border-violet-900/70 bg-white tooth-loader" />
      <div className="absolute left-5 top-8 h-2.5 w-10 rounded-full bg-violet-400 brush-loader" />
      <div className="absolute left-[3.35rem] top-[1.9rem] h-3 w-2 rounded-full bg-violet-300/80 brush-head-loader" />
      <div className="absolute left-[1.55rem] top-[1.1rem] h-7 w-7 rounded-full border border-violet-300/40 bg-violet-200/25 pulse-ring" />
    </div>
  );
}

export function AppExperienceShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  const firstRender = useRef(true);

  useEffect(() => {
    const splashTimer = window.setTimeout(() => {
      setShowSplash(false);
    }, 1100);

    return () => window.clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (showSplash) return;

    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    setShowTransition(true);

    const timer = window.setTimeout(() => {
      setShowTransition(false);
    }, 520);

    return () => window.clearTimeout(timer);
  }, [pathname, showSplash]);

  const isLoading = showSplash || showTransition;

  return (
    <>
      {isLoading && (
        <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(140,103,214,0.2),transparent_42%),linear-gradient(180deg,rgba(251,249,255,0.95),rgba(242,235,252,0.96))] px-6 transition-opacity duration-500 opacity-100">
          <div className="glass-panel flex w-full max-w-sm flex-col items-center gap-5 px-8 py-10 text-center">
            <BrandLogo size="lg" animated />

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-violet-600">
                L&A Dental
              </p>

              <h2 className="text-2xl font-black text-slate-900">
                Cargando una experiencia más humana
              </h2>

              <p className="text-sm leading-6 text-slate-600">
                Estamos preparando tu feed clínico, agenda y mensajes.
              </p>
            </div>

            <ToothBrushLoader />
          </div>
        </div>
      )}

      <div
        className={`transition-all duration-500 ${
          showTransition
            ? "scale-[0.99] opacity-90 blur-[1px]"
            : "scale-100 opacity-100 blur-0"
        }`}
      >
        {children}
      </div>
    </>
  );
}
