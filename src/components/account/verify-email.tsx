"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { verifyEmail } from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";

const SELLER_URL = process.env.NEXT_PUBLIC_SELLER_URL ?? "http://localhost:3002";

type State = { status: "checking" } | { status: "done" | "failed"; message: string };

/**
 * The verification email's page: sends the link's signed details to the shop API and shows the
 * answer. A vendor applicant's link (`seller`) sends them on to the Seller Centre afterwards.
 */
export function VerifyEmail({ seller = false }: { seller?: boolean }) {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const hash = params.get("hash") ?? "";
  const expires = params.get("expires") ?? "";
  const signature = params.get("signature") ?? "";
  const complete = Boolean(id && hash && expires && signature);
  const [state, setState] = useState<State>({ status: "checking" });

  useEffect(() => {
    if (!complete) return;
    let cancelled = false;
    verifyEmail(id, hash, { expires, signature })
      .then((message) => !cancelled && setState({ status: "done", message }))
      .catch((error) => {
        if (cancelled) return;
        const expired = error instanceof ApiError && error.status === 403;
        setState({
          status: "failed",
          message: expired
            ? "This link has expired or is not valid. Sign in and ask for a new verification email."
            : error instanceof Error
              ? error.message
              : "We couldn’t verify your email. Try again.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [complete, id, hash, expires, signature]);

  if (!complete) {
    return <p className="text-center text-muted-foreground">This verification link is incomplete. Open the link from the email again.</p>;
  }

  if (state.status === "checking") {
    return <p aria-busy className="text-center text-muted-foreground">Checking your link…</p>;
  }

  const next = seller ? (
    <a href={`${SELLER_URL}/login`} className="text-primary hover:underline">
      Continue to the Seller Centre
    </a>
  ) : (
    <Link href="/account" className="text-primary hover:underline">
      Go to your account
    </Link>
  );

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className={state.status === "failed" ? "text-destructive" : undefined}>
        {state.status === "done" ? `${state.message} You can now use every part of your account.` : state.message}
      </p>
      {next}
    </div>
  );
}
