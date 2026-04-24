import type { ReactNode } from "react";

type ScreenShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function ScreenShell({
  eyebrow,
  title,
  description,
  action,
  children
}: ScreenShellProps) {
  return (
    <section className="mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[var(--violet-main)]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-3xl font-black leading-tight text-[var(--text)] sm:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--text-soft)] sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      {children}
    </section>
  );
}
