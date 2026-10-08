"use client";

import Link from "next/link";
import { LogInIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { useAuth, useAuthHydrated } from "@/store/auth";

/**
 * Renders its children with the shopper's token once the saved session has loaded, or a
 * sign-in prompt that comes back to `next`.
 */
export function AccountGate({
  next,
  title,
  description,
  children,
}: {
  next: string;
  title: string;
  description?: string;
  children: (token: string) => React.ReactNode;
}) {
  const ready = useAuthHydrated();
  const token = useAuth((s) => s.token);

  if (!ready) return <Skeleton className="h-96 rounded-lg" />;
  if (!token) {
    return (
      <EmptyState icon={LogInIcon} title={title} description={description}>
        <Link href={`/login?next=${encodeURIComponent(next)}`} className={cn(buttonVariants(), "h-10 rounded-full px-6")}>
          Sign in
        </Link>
      </EmptyState>
    );
  }
  return children(token);
}
