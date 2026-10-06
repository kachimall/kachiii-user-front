"use client";

import { useEffect } from "react";
import { CloudOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-3 pt-8 md:pt-16">
      <EmptyState
        icon={CloudOffIcon}
        title="We couldn’t load this page"
        description="The shop is having trouble reaching its servers. Give it a moment, then try again."
      >
        <Button onClick={() => retry()} className="h-10 rounded-full px-6">
          Try again
        </Button>
      </EmptyState>
    </div>
  );
}
