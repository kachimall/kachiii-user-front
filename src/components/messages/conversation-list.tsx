"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRightIcon, ImageIcon, MessagesSquareIcon, StoreIcon } from "lucide-react";
import { AccountGate } from "@/components/account/account-gate";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/empty-state";
import { getConversations } from "@/lib/api/account";
import { ApiError, isApiImage, type ApiMeta } from "@/lib/api/client";
import type { ApiConversation, ApiMessage } from "@/lib/api/schema";
import { cn } from "@/lib/utils";

/** "14:05" today, "Mon" this week, else "12 Oct". */
export function formatWhen(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString("en-AE", { timeStyle: "short" });
  if (now.getTime() - date.getTime() < 6 * 24 * 3600 * 1000) return date.toLocaleDateString("en-AE", { weekday: "short" });
  return date.toLocaleDateString("en-AE", { day: "numeric", month: "short" });
}

/** One line for a message in a list: its text, or what it holds. */
export function messagePreview(message: ApiMessage | null) {
  if (!message) return "No messages yet";
  if (message.hidden) return "Message removed by KACHIII";
  const prefix = message.sender === "buyer" ? "You: " : "";
  if (message.body) return prefix + message.body;
  return `${prefix}${message.photos.length === 1 ? "Photo" : `${message.photos.length} photos`}`;
}

export function StoreAvatar({ name, logo, className }: { name: string; logo: string | null; className?: string }) {
  return (
    <span className={cn("relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary-fixed text-secondary", className)}>
      {logo ? (
        <Image src={logo} alt="" fill sizes="44px" unoptimized={isApiImage(logo)} className="object-cover" />
      ) : (
        <StoreIcon aria-hidden className="size-5" />
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}

export function ConversationList() {
  return (
    <AccountGate next="/account/messages" title="Sign in to see your messages" description="Chat with stores about products and orders.">
      {(token) => <Conversations token={token} />}
    </AccountGate>
  );
}

function Conversations({ token }: { token: string }) {
  const [page, setPage] = useState(1);
  const [conversations, setConversations] = useState<ApiConversation[]>();
  const [meta, setMeta] = useState<ApiMeta>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    getConversations(token, { page, perPage: 20 })
      .then((res) => {
        setConversations(res.data);
        setMeta(res.meta);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Couldn’t load your messages."));
  }, [token, page]);

  if (error) return <p className="text-destructive">{error}</p>;
  if (!conversations) return <Skeleton className="h-64 rounded-lg" />;
  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessagesSquareIcon}
        title="No messages yet"
        description="Questions about a product or an order? Tap “Chat with store” on a product or store page."
      >
        <Link href="/products" className={cn(buttonVariants(), "h-10 rounded-full px-6")}>
          Browse products
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col divide-y divide-surface-container overflow-hidden rounded-lg bg-surface-container-lowest shadow-card">
        {conversations.map((c) => {
          const unread = c.unread_count ?? 0;
          const last = c.last_message;
          return (
            <li key={c.id}>
              <Link href={`/account/messages/${c.id}`} className="flex items-center gap-3 p-4 transition-colors hover:bg-surface-container-low">
                <StoreAvatar name={c.store.name} logo={c.store.logo_url} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={cn("truncate font-heading text-headline-sm", unread > 0 && "text-on-surface")}>{c.store.name}</p>
                    <time dateTime={c.last_message_at ?? undefined} className="shrink-0 text-label-xs font-normal text-on-surface-variant">
                      {formatWhen(c.last_message_at)}
                    </time>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("flex min-w-0 items-center gap-1 truncate text-body-sm", unread > 0 ? "font-semibold text-on-surface" : "text-on-surface-variant")}>
                      {last && !last.body && last.photos.length > 0 && !last.hidden && <ImageIcon aria-hidden className="size-3.5 shrink-0" />}
                      <span className="truncate">{messagePreview(last)}</span>
                    </p>
                    {unread > 0 && (
                      <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
                        <span className="sr-only">Unread: </span>
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRightIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          );
        })}
      </ul>
      {meta && (meta.last_page ?? 1) > 1 && (
        <div className="flex items-center justify-between text-sm">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-full">
            Newer
          </Button>
          <span className="text-muted-foreground">
            Page {meta.current_page} of {meta.last_page}
          </span>
          <Button variant="outline" disabled={!meta.has_more} onClick={() => setPage((p) => p + 1)} className="rounded-full">
            Older
          </Button>
        </div>
      )}
    </div>
  );
}
