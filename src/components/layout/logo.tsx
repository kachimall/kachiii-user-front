import { cn } from "@/lib/utils";

export function Logo({ className, showMall = true }: { className?: string; showMall?: boolean }) {
  return (
    <span className={cn("flex items-center gap-1.5", className)}>
      <span aria-hidden className="grid size-8 place-items-center rounded-md bg-secondary-container font-heading text-lg font-extrabold text-white">
        K
      </span>
      <span className="font-heading text-headline-md font-extrabold tracking-tight text-secondary">KACHI</span>
      {showMall && (
        <span className="rounded-sm bg-primary px-1.5 py-0.5 text-label-xs tracking-wider text-white uppercase">Mall</span>
      )}
    </span>
  );
}
