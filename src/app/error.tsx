"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-4 px-4 pt-20 sm:px-6">
      <h1 className="font-heading text-4xl font-extrabold tracking-tight">We couldn’t load this page.</h1>
      <p className="text-lg text-muted-foreground">
        The shop is having trouble reaching its servers. Give it a moment, then try again.
      </p>
      <Button onClick={() => retry()} className="h-11 rounded-full px-6 text-base">
        Try again
      </Button>
    </div>
  );
}
