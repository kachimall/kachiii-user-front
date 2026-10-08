"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowUpIcon, MessageSquareIcon, XIcon } from "lucide-react";
import { ChatPanel } from "@/components/messages/chat-panel";
import { getConversations } from "@/lib/api/account";
import { useAuth, useAuthHydrated } from "@/store/auth";
import { useChat } from "@/store/chat";

const UNREAD_POLL_MS = 60_000;

/** Pages where the buttons would cover the page's own bar or duplicate it (cart, checkout, messages). */
function hiddenOn(pathname: string) {
  return pathname === "/cart" || pathname.startsWith("/checkout") || pathname.startsWith("/account/messages");
}

export function FloatingActions() {
  const pathname = usePathname();
  const hydrated = useAuthHydrated();
  const token = useAuth((s) => s.token);
  const close = useChat((s) => s.close);

  // Leaving for a page without the buttons closes the panel with them.
  const hidden = hiddenOn(pathname);
  useEffect(() => {
    if (hidden) close();
  }, [hidden, close]);

  if (hidden) return null;

  return (
    <aside aria-label="Quick help" className="fixed right-3 bottom-above-nav z-30 mb-3 flex flex-col items-end gap-1.5 md:right-6 md:bottom-6 md:mb-0">
      {/* Store chats need an account, so signed-out visitors only get "back to top". */}
      {hydrated && token && <ChatLauncher token={token} />}
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="grid size-10 place-items-center rounded-full bg-surface-container-lowest shadow-md transition-transform outline-none hover:bg-surface-container-high focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95"
      >
        <ArrowUpIcon className="size-5" />
      </button>
    </aside>
  );
}

function ChatLauncher({ token }: { token: string }) {
  const open = useChat((s) => s.open);
  const unread = useChat((s) => s.unread);
  const setUnread = useChat((s) => s.setUnread);
  const show = useChat((s) => s.show);
  const close = useChat((s) => s.close);

  // The badge: checked every minute while the tab is visible, and when the shopper comes back to it.
  useEffect(() => {
    const check = () => {
      if (document.visibilityState !== "visible") return;
      getConversations(token, { perPage: 1 })
        .then((res) => setUnread(Number(res.meta.unread_total ?? 0)))
        .catch(() => undefined);
    };
    check();
    const timer = setInterval(check, UNREAD_POLL_MS);
    window.addEventListener("focus", check);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", check);
    };
  }, [token, setUnread]);

  const count = unread > 99 ? "99+" : String(unread);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close Kachiii Chat" : unread > 0 ? `Kachiii Chat, ${unread} unread messages` : "Kachiii Chat"}
        aria-expanded={open}
        onClick={() => (open ? close() : show())}
        className="flex size-12 items-center justify-center gap-1 rounded-full bg-primary text-white shadow-lg transition-colors outline-none hover:bg-primary-container focus-visible:ring-3 focus-visible:ring-ring/50 md:size-auto md:px-2.5 md:py-1.5"
      >
        <span className="relative">
          {open ? <XIcon aria-hidden className="size-5.5" /> : <MessageSquareIcon aria-hidden className="size-5.5" />}
          {!open && unread > 0 && (
            <span aria-hidden className="absolute -top-2 -right-2 grid h-4 min-w-4 place-items-center rounded-full border-2 border-white bg-secondary px-0.5 text-[9px] leading-none font-bold md:hidden">
              {count}
            </span>
          )}
        </span>
        <span aria-hidden className="hidden pr-1 text-label-md font-bold md:inline">
          Kachiii Chat
        </span>
        {unread > 0 && (
          <span aria-hidden className="hidden rounded-sm bg-white/20 px-1.5 py-0.5 text-[10px] font-bold md:inline">
            {count} new
          </span>
        )}
      </button>
      {/* Portalled: the aside's stacking context would put the panel under the tab bar. */}
      {open && createPortal(<ChatPanel token={token} />, document.body)}
    </>
  );
}
