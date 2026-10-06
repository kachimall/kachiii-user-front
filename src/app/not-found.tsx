import Link from "next/link";
import { SearchXIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-3 pt-8 md:pt-16">
      <EmptyState
        icon={SearchXIcon}
        title="This page isn’t here"
        description="The link may be old, or the product may have sold out for good."
      >
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "h-10 rounded-full px-6")}>
          Go home
        </Link>
        <Link href="/products" className={cn(buttonVariants(), "h-10 rounded-full px-6")}>
          Browse all products
        </Link>
      </EmptyState>
    </div>
  );
}
