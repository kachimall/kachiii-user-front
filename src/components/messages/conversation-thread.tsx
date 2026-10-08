"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeftIcon, BotIcon, EyeOffIcon, ImagePlusIcon, MailWarningIcon, SendHorizontalIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { AccountGate } from "@/components/account/account-gate";
import { StoreAvatar } from "@/components/messages/conversation-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/empty-state";
import {
  getConversation,
  getMessages,
  MAX_MESSAGE_LENGTH,
  MAX_MESSAGE_PHOTOS,
  markConversationRead,
  resendVerification,
  sendMessage,
  startConversation,
} from "@/lib/api/account";
import { ApiError, apiFileUrl } from "@/lib/api/client";
import type { ApiConversation, ApiMessage } from "@/lib/api/schema";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth";

const PAGE_SIZE = 30;
const POLL_MS = 15_000;

type StoreRef = { id?: string; slug: string; name: string; logo_url?: string | null };

/** Oldest first, one entry per id. */
function merge(current: ApiMessage[], incoming: ApiMessage[]) {
  const byId = new Map(current.map((m) => [m.id, m]));
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => a.sent_at.localeCompare(b.sent_at) || a.id.localeCompare(b.id));
}

const dayLabel = (iso: string) => new Date(iso).toLocaleDateString("en-AE", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString("en-AE", { timeStyle: "short" });

/** An existing conversation (`id`), or a new one with `store` that starts on the first send. */
export function ConversationThread(props: { id?: string; store?: StoreRef; about?: string }) {
  const next = props.id ? `/account/messages/${props.id}` : "/account/messages";
  return (
    <AccountGate next={next} title="Sign in to chat with stores">
      {(token) => <Thread token={token} {...props} />}
    </AccountGate>
  );
}

function Thread({ token, id, store: newStore, about }: { token: string; id?: string; store?: StoreRef; about?: string }) {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const [conversation, setConversation] = useState<ApiConversation>();
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [hasOlder, setHasOlder] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState<string>();
  const scroller = useRef<HTMLDivElement>(null);
  // Scroll to the newest message after it renders, unless older ones were just added on top.
  const stickToBottom = useRef(true);

  // The messages shown, for the poll to tell which ones are new.
  const shown = useRef<ApiMessage[]>([]);
  useEffect(() => {
    shown.current = messages;
  }, [messages]);

  /** Fetches the newest page; true when the store wrote something new. */
  const refresh = useCallback(async () => {
    if (!id) return false;
    const res = await getMessages(token, id, undefined, PAGE_SIZE);
    const known = new Set(shown.current.map((m) => m.id));
    const fresh = res.data.filter((m) => !known.has(m.id));
    if (fresh.length === 0) return false;
    stickToBottom.current = true;
    setMessages((current) => merge(current, fresh));
    return fresh.some((m) => m.sender === "store");
  }, [token, id]);

  // First load: the conversation, its newest page of messages, then mark it read.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    Promise.all([getConversation(token, id), getMessages(token, id, undefined, PAGE_SIZE)])
      .then(([conv, res]) => {
        if (cancelled) return;
        setConversation(conv);
        setMessages(merge([], res.data));
        setHasOlder(res.meta.has_more ?? false);
        if ((conv.unread_count ?? 0) > 0) markConversationRead(token, id).catch(() => undefined);
      })
      .catch((e) => !cancelled && setError(e instanceof ApiError ? e.message : "Couldn’t load this conversation."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [token, id]);

  // New replies show up while the page is open and visible.
  useEffect(() => {
    if (!id) return;
    const timer = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      refresh()
        .then((unread) => {
          if (unread) markConversationRead(token, id).catch(() => undefined);
        })
        .catch(() => undefined);
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [token, id, refresh]);

  useLayoutEffect(() => {
    if (!stickToBottom.current || !scroller.current) return;
    scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [messages]);

  async function loadOlder() {
    if (!id || messages.length === 0) return;
    setLoadingOlder(true);
    const el = scroller.current;
    const fromBottom = el ? el.scrollHeight - el.scrollTop : 0;
    try {
      const res = await getMessages(token, id, messages[0].id, PAGE_SIZE);
      stickToBottom.current = false;
      setMessages((current) => merge(current, res.data));
      setHasOlder(res.meta.has_more ?? false);
      // Keep the shopper's place: the list grows above them.
      requestAnimationFrame(() => {
        if (el) el.scrollTop = el.scrollHeight - fromBottom;
      });
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn’t load older messages.");
    } finally {
      setLoadingOlder(false);
    }
  }

  const store: StoreRef | undefined = conversation?.store ?? newStore;

  if (loading) return <Skeleton className="h-[60vh] rounded-lg" />;
  if (error) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-destructive">{error}</p>
        <Link href="/account/messages" className="text-sm text-primary hover:underline">
          Back to messages
        </Link>
      </div>
    );
  }
  if (!store) {
    return (
      <p className="text-muted-foreground">
        Choose a store to message from its product or store page.{" "}
        <Link href="/account/messages" className="text-primary hover:underline">
          Your messages
        </Link>
      </p>
    );
  }

  async function send(input: { body?: string; photos: File[] }) {
    if (id) {
      const message = await sendMessage(token, id, input);
      stickToBottom.current = true;
      setMessages((current) => merge(current, [message]));
      return;
    }
    if (!newStore?.id) throw new ApiError("Choose a store to message from its product or store page.", 422);
    const started = await startConversation(token, newStore.id, input);
    router.replace(`/account/messages/${started.id}`);
  }

  return (
    <div className="flex h-[calc(100dvh-12rem)] min-h-112 flex-col overflow-hidden rounded-lg bg-surface-container-lowest shadow-card md:h-[calc(100dvh-16rem)]">
      <header className="flex items-center gap-3 border-b border-surface-container p-3 md:p-4">
        <Link href="/account/messages" aria-label="All messages" className="grid size-9 place-items-center rounded-full hover:bg-surface-container-low">
          <ArrowLeftIcon aria-hidden className="size-5" />
        </Link>
        <StoreAvatar name={store.name} logo={store.logo_url ?? null} className="size-10" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-headline-sm">{store.name}</p>
          <Link href={`/stores/${store.slug}`} className="text-label-xs font-normal text-secondary hover:underline">
            Visit store
          </Link>
        </div>
      </header>

      <div ref={scroller} className="flex flex-1 flex-col gap-2 overflow-y-auto bg-surface-container-low/50 p-3 md:p-4" aria-live="polite">
        {hasOlder && (
          <Button variant="outline" disabled={loadingOlder} onClick={loadOlder} className="h-8 self-center rounded-full px-4 text-xs">
            {loadingOlder ? "Loading…" : "Load older messages"}
          </Button>
        )}
        {messages.length === 0 && (
          <p className="m-auto max-w-xs text-center text-body-sm text-on-surface-variant">
            Ask {store.name} about a product, sizes, stock or your order. They’ll answer here, and we’ll email you when they do.
          </p>
        )}
        {messages.map((message, i) => {
          const newDay = i === 0 || dayLabel(messages[i - 1].sent_at) !== dayLabel(message.sent_at);
          return (
            <div key={message.id} className="flex flex-col gap-2">
              {newDay && (
                <p className="self-center rounded-full bg-surface-container px-2.5 py-0.5 text-label-xs font-normal text-on-surface-variant">
                  {dayLabel(message.sent_at)}
                </p>
              )}
              <MessageBubble message={message} token={token} />
            </div>
          );
        })}
      </div>

      {user && !user.email_verified ? (
        <VerifyEmailNotice token={token} />
      ) : (
        <Composer onSend={send} initial={!id && about ? `Hi, I have a question about “${about}”: ` : ""} />
      )}
    </div>
  );
}

function MessageBubble({ message, token }: { message: ApiMessage; token: string }) {
  const mine = message.sender === "buyer";
  return (
    <div className={cn("flex max-w-[85%] flex-col gap-1 md:max-w-[70%]", mine ? "items-end self-end" : "items-start self-start")}>
      {message.auto_reply && (
        <span className="flex items-center gap-1 text-label-xs font-normal text-on-surface-variant">
          <BotIcon aria-hidden className="size-3" />
          Automatic reply
        </span>
      )}
      {message.hidden ? (
        <p className="flex items-start gap-1.5 rounded-2xl border border-dashed border-outline-variant px-3 py-2 text-body-sm text-on-surface-variant italic">
          <EyeOffIcon aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          <span>
            KACHIII removed this message{message.hidden_reason && `: ${message.hidden_reason}`}
          </span>
        </p>
      ) : (
        <>
          {message.photos.length > 0 && (
            <div className={cn("flex flex-wrap gap-1.5", mine && "justify-end")}>
              {message.photos.map((path, i) => (
                <MessagePhoto key={path} path={path} token={token} alt={`Photo ${i + 1}`} />
              ))}
            </div>
          )}
          {message.body && (
            <p
              className={cn(
                "rounded-2xl px-3 py-2 text-body-md whitespace-pre-line wrap-break-word",
                mine ? "rounded-br-sm bg-primary-container text-white" : "rounded-bl-sm bg-surface-container-lowest shadow-sm",
              )}
            >
              {message.body}
            </p>
          )}
        </>
      )}
      <time dateTime={message.sent_at} className="px-1 text-[10px] text-on-surface-variant">
        {timeLabel(message.sent_at)}
      </time>
    </div>
  );
}

/** A message photo, private to the shopper and the store: loaded with the token. */
function MessagePhoto({ path, token, alt }: { path: string; token: string; alt: string }) {
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();
    let url: string | undefined;
    apiFileUrl(path, token, controller.signal)
      .then((u) => setSrc((url = u)))
      .catch(() => {});
    return () => {
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [path, token]);

  return (
    <a href={src} target="_blank" rel="noreferrer" className="block size-28 overflow-hidden rounded-xl border bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element -- private image behind the token */}
      {src && <img src={src} alt={alt} className="size-full object-cover" />}
    </a>
  );
}

function Composer({ onSend, initial }: { onSend: (input: { body?: string; photos: File[] }) => Promise<void>; initial: string }) {
  const [body, setBody] = useState(initial);
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const text = body.trim();
  const canSend = !busy && (text.length > 0 || photos.length > 0);

  async function submit(event?: React.FormEvent) {
    event?.preventDefault();
    if (!canSend) return;
    setBusy(true);
    setError(undefined);
    try {
      await onSend({ body: text || undefined, photos: photos.map((p) => p.file) });
      photos.forEach((p) => URL.revokeObjectURL(p.url));
      setBody("");
      setPhotos([]);
    } catch (e) {
      if (e instanceof ApiError) {
        const photoError = Object.entries(e.errors).find(([k]) => k.startsWith("photos"))?.[1][0];
        setError(e.field("body") ?? photoError ?? e.field("store_id") ?? e.message);
      } else {
        setError("Couldn’t send. Check your connection and try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 border-t border-surface-container p-3 md:p-4">
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((photo) => (
            <div key={photo.url} className="relative size-16 overflow-hidden rounded-lg border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
              <img src={photo.url} alt={photo.file.name} className="size-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(photo.url);
                  setPhotos((p) => p.filter((q) => q !== photo));
                }}
                aria-label={`Remove ${photo.file.name}`}
                className="absolute top-0.5 right-0.5 grid size-5 place-items-center rounded-full bg-background/90 hover:bg-background"
              >
                <XIcon className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex items-end gap-2">
        <label
          className={cn(
            "grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-low focus-within:ring-3 focus-within:ring-ring/50",
            photos.length >= MAX_MESSAGE_PHOTOS && "pointer-events-none opacity-40",
          )}
        >
          <ImagePlusIcon aria-hidden className="size-5" />
          <span className="sr-only">Add photos (up to {MAX_MESSAGE_PHOTOS})</span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={photos.length >= MAX_MESSAGE_PHOTOS}
            onChange={(e) => {
              const added = Array.from(e.target.files ?? [])
                .slice(0, MAX_MESSAGE_PHOTOS - photos.length)
                .map((file) => ({ file, url: URL.createObjectURL(file) }));
              setPhotos((p) => [...p, ...added]);
              e.target.value = "";
            }}
          />
        </label>
        <label className="sr-only" htmlFor="message-body">
          Message
        </label>
        <textarea
          id="message-body"
          rows={1}
          maxLength={MAX_MESSAGE_LENGTH}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends; Shift+Enter starts a new line.
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Write a message…"
          className="max-h-32 min-h-10 flex-1 resize-none rounded-2xl border border-input bg-card px-3.5 py-2 text-body-md outline-none field-sizing-content focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button type="submit" disabled={!canSend} aria-label="Send" className="size-10 shrink-0 rounded-full p-0">
          <SendHorizontalIcon aria-hidden className="size-4.5" />
        </Button>
      </div>
    </form>
  );
}

/** Writing to stores needs a verified email. */
function VerifyEmailNotice({ token }: { token: string }) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function resend() {
    setBusy(true);
    try {
      await resendVerification(token);
      setSent(true);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn’t send the email. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-surface-container bg-primary-fixed/40 p-3 text-body-sm md:p-4">
      <MailWarningIcon aria-hidden className="size-5 shrink-0 text-primary" />
      <p className="min-w-0 flex-1">
        {sent ? "Check your inbox for the verification link, then come back here." : "Verify your email address to message stores."}
      </p>
      {!sent && (
        <Button variant="outline" disabled={busy} onClick={resend} className="h-9 rounded-full px-4">
          Resend link
        </Button>
      )}
    </div>
  );
}
