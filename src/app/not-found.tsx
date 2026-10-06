import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-5 px-4 pt-20 sm:px-6">
      <p className="rounded-sm bg-primary px-1.5 py-0.5 text-white tabular-nums text-sm">404</p>
      <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">This page isn’t here.</h1>
      <p className="text-lg text-muted-foreground">
        The link may be old, or the product may have sold out for good.
      </p>
      <Link href="/products" className={cn(buttonVariants(), "h-11 rounded-full px-6 text-base")}>
        Browse all products
      </Link>
    </div>
  );
}
