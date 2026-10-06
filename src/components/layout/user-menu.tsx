"use client";

import Link from "next/link";
import { CircleUserRoundIcon } from "lucide-react";
import { useAuth, useAuthHydrated } from "@/store/auth";

const linkClass =
  "hidden items-center gap-2 rounded-lg px-2 py-1 transition-colors outline-none hover:bg-surface-container-low focus-visible:ring-3 focus-visible:ring-ring/50 md:flex";

/** Header account link: the shopper's name when signed in, else sign-in. */
export function UserMenu() {
  const hydrated = useAuthHydrated();
  const user = useAuth((s) => s.user);

  if (hydrated && user) {
    const first = user.name.split(" ")[0];
    return (
      <Link href="/account" className={linkClass}>
        <span className="grid size-8 place-items-center rounded-full bg-linear-to-br from-secondary to-secondary-container text-label-md text-white">
          {first.charAt(0).toUpperCase()}
        </span>
        <span className="flex flex-col text-left">
          <span className="text-label-xs font-normal text-on-surface-variant">Hi, {first}</span>
          <span className="text-label-md">My account</span>
        </span>
      </Link>
    );
  }

  return (
    <Link href="/login" className={linkClass}>
      <CircleUserRoundIcon aria-hidden className="size-8 text-on-surface-variant" strokeWidth={1.5} />
      <span className="flex flex-col text-left">
        <span className="text-label-md">Sign in</span>
        <span className="text-label-xs text-secondary">or register</span>
      </span>
    </Link>
  );
}
