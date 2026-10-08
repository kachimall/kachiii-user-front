"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { MessageCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getConversations } from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { currentToken } from "@/store/auth";
import { useChat } from "@/store/chat";

type Props = {
  store: { id: string; slug: string; name: string };
  /** The product the shopper is asking about, to start the first message with. */
  about?: string;
  className?: string;
};

/**
 * Opens the shopper's conversation with a store, or a new one, in the floating chat panel;
 * sign-in first when signed out.
 */
export function MessageStoreButton({ store, about, className }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const show = useChat((s) => s.show);
  const [busy, setBusy] = useState(false);

  async function open() {
    const token = currentToken();
    if (!token) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setBusy(true);
    try {
      const existing = (await getConversations(token, { store: store.slug, perPage: 1 })).data[0];
      show(
        existing
          ? { kind: "thread", id: existing.id }
          : { kind: "new", store: { id: store.id, slug: store.slug, name: store.name }, about },
      );
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn’t open the chat. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="outline" onClick={open} disabled={busy} className={cn("h-9 rounded-full px-4", className)}>
      <MessageCircleIcon aria-hidden className="size-4" />
      Chat with store
    </Button>
  );
}
