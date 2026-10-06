import { Suspense } from "react";
import { Logo } from "@/components/layout/logo";

/** Centered card for the sign-in, sign-up and password pages. */
export function AuthShell({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-3 pt-6 pb-12 md:pt-12">
      <div className="flex flex-col gap-5 rounded-lg bg-surface-container-lowest p-5 shadow-card sm:p-8">
        <header className="flex flex-col items-center gap-2 text-center">
          <Logo />
          <h1 className="mt-2 font-heading text-headline-lg-mobile">{title}</h1>
          {intro && <p className="text-body-md text-on-surface-variant">{intro}</p>}
        </header>
        {/* The forms read the query string, which needs a Suspense boundary. */}
        <Suspense fallback={<div aria-busy className="h-64 animate-pulse rounded-md bg-surface-container" />}>{children}</Suspense>
      </div>
    </div>
  );
}
