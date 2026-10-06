import { Suspense } from "react";

/** Centered card for the sign-in, sign-up and password pages. */
export function AuthShell({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pt-12 pb-16 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight">{title}</h1>
        {intro && <p className="text-muted-foreground">{intro}</p>}
      </header>
      <div className="rounded-3xl border bg-card p-6">
        {/* The forms read the query string, which needs a Suspense boundary. */}
        <Suspense fallback={<div aria-busy className="h-64 animate-pulse rounded-2xl bg-muted" />}>{children}</Suspense>
      </div>
    </div>
  );
}
