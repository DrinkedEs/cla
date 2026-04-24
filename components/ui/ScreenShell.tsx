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
    <section className="mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-2 text-xs font-semibold uppercase text-violet-200">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-3xl font-black leading-tight text-white sm:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62 sm:text-base">
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
