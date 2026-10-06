import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  /** Buttons or links under the text. */
  children?: React.ReactNode;
  className?: string;
};

/** Centered card for empty lists, signed-out views and dead ends. */
export function EmptyState({ icon: Icon, title, description, children, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg bg-surface-container-lowest px-6 py-10 text-center shadow-card sm:py-14",
        className,
      )}
    >
      <span className="grid size-16 place-items-center rounded-full bg-primary-fixed text-primary">
        <Icon aria-hidden className="size-7" strokeWidth={1.75} />
      </span>
      <p className="font-heading text-headline-md">{title}</p>
      {description && <p className="max-w-sm text-body-md text-on-surface-variant">{description}</p>}
      {children && <div className="mt-2 flex flex-wrap items-center justify-center gap-3">{children}</div>}
    </div>
  );
}

/** Pulsing placeholder block for loading states. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-surface-container", className)} />;
}
