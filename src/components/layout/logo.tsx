import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  showMall?: boolean;
  /** Show only the K mark on phones, where the header row is shared with search. */
  collapse?: boolean;
};

export function Logo({ className, showMall = true, collapse = false }: Props) {
  return (
    <span className={cn("flex items-center gap-1.5", className)}>
      <span aria-hidden className="grid size-8 place-items-center rounded-md bg-secondary-container font-heading text-lg font-extrabold text-white">
        K
      </span>
      <span className={cn("font-heading text-headline-md font-extrabold tracking-tight text-secondary", collapse && "hidden sm:inline")}>
        KACHIII
      </span>
      {showMall && (
        <span
          className={cn(
            "rounded-sm bg-primary px-1.5 py-0.5 text-label-xs tracking-wider text-white uppercase",
            collapse && "hidden sm:inline",
          )}
        >
          Mall
        </span>
      )}
    </span>
  );
}
