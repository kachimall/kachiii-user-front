"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Maximize2Icon, MessagesSquareIcon, XIcon } from "lucide-react";
import { ConversationRow } from "@/components/messages/conversation-list";
import { Thread } from "@/components/messages/conversation-thread";
import { Skeleton } from "@/components/ui/empty-state";
import { getConversations } from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";
import type { ApiConversation } from "@/lib/api/schema";
import { useChat } from "@/store/chat";

const INBOX_POLL_MS = 15_000;

/**
 * The floating chat: the shopper's store conversations in a panel over the page (full screen on
 * phones), so they can read and answer without leaving it.
 */
export function ChatPanel({ token }: { token: string }) {
  const view = useChat((s) => s.view);
  const show = useChat((s) => s.show);
  const close = useChat((s) => s.close);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const fullPage = view.kind === "thread" ? `/account/messages/${view.id}` : "/account/messages";
  const embedded = {
    onBack: () => show({ kind: "list" }),
    onStarted: (id: string) => show({ kind: "thread", id }),
  };

  return (
    <section
      role="dialog"
      aria-label="Kachiii Chat"
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-surface-container-lowest md:inset-auto md:right-6 md:bottom-24 md:h-[min(36rem,calc(100dvh-8rem))] md:w-96 md:rounded-xl md:border md:border-surface-container md:shadow-2xl"
    >
      <header className="flex items-center gap-2 bg-primary px-3 py-2.5 pt-[calc(0.625rem+env(safe-area-inset-top))] text-white md:pt-2.5">
        <MessagesSquareIcon aria-hidden className="size-5" />
        <h2 className="flex-1 font-heading text-headline-sm">Kachiii Chat</h2>
        <Link
          href={fullPage}
          onClick={close}
          aria-label="Open in full page"
          className="grid size-8 place-items-center rounded-full outline-none hover:bg-white/15 focus-visible:ring-3 focus-visible:ring-white/50"
        >
          <Maximize2Icon aria-hidden className="size-4" />
        </Link>
        <button
          type="button"
          onClick={close}
          aria-label="Close chat"
          className="grid size-8 place-items-center rounded-full outline-none hover:bg-white/15 focus-visible:ring-3 focus-visible:ring-white/50"
        >
          <XIcon aria-hidden className="size-5" />
        </button>
      </header>
      <div className="min-h-0 flex-1">
        {view.kind === "list" ? (
          <Inbox token={token} onOpen={(id) => show({ kind: "thread", id })} />
        ) : view.kind === "thread" ? (
          <Thread key={view.id} token={token} id={view.id} embedded={embedded} />
        ) : (
          <Thread key={`new-${view.store.id}`} token={token} store={view.store} about={view.about} embedded={embedded} />
        )}
      </div>
    </section>
  );
}

function Inbox({ token, onOpen }: { token: string; onOpen: (id: string) => void }) {
  const setUnread = useChat((s) => s.setUnread);
  const [conversations, setConversations] = useState<ApiConversation[]>();
  const [more, setMore] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      getConversations(token, { perPage: 20 })
        .then((res) => {
          if (cancelled) return;
          setConversations(res.data);
          setMore(res.meta.has_more ?? false);
          setUnread(Number(res.meta.unread_total ?? 0));
          setError(undefined);
        })
        .catch((e) => !cancelled && setError(e instanceof ApiError ? e.message : "Couldn’t load your messages."));
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, INBOX_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [token, setUnread]);

  if (error && !conversations) return <p className="p-4 text-body-sm text-destructive">{error}</p>;
  if (!conversations) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }
  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <MessagesSquareIcon aria-hidden className="size-10 text-on-surface-variant/60" />
        <p className="font-heading text-headline-sm">No messages yet</p>
        <p className="text-body-sm text-on-surface-variant">Questions about a product or an order? Tap “Chat with store” on a product or store page.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <ul className="flex flex-col divide-y divide-surface-container">
        {conversations.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onOpen(c.id)}
              className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors outline-none hover:bg-surface-container-low focus-visible:bg-surface-container-low"
            >
              <ConversationRow conversation={c} />
            </button>
          </li>
        ))}
      </ul>
      {more && (
        <Link href="/account/messages" onClick={useChat.getState().close} className="block p-3 text-center text-body-sm text-primary hover:underline">
          See all messages
        </Link>
      )}
    </div>
  );
}
