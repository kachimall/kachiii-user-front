"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { LayoutGridIcon, SearchIcon, StoreIcon, TagIcon } from "lucide-react";
import { getSearchSuggestions } from "@/lib/api/catalog";
import { productPath } from "@/lib/api/products";
import type { ApiSuggestions } from "@/lib/api/schema";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 200;
const MIN_LENGTH = 2;

type Suggestion = { key: string; label: string; href: string; group: string };

const groups: { key: keyof ApiSuggestions; title: string; icon: typeof SearchIcon; href: (s: ApiSuggestions[keyof ApiSuggestions][number]) => string }[] = [
  { key: "products", title: "Products", icon: SearchIcon, href: (p) => productPath(p) },
  { key: "categories", title: "Categories", icon: LayoutGridIcon, href: (c) => `/products?category=${encodeURIComponent(c.slug)}` },
  { key: "brands", title: "Brands", icon: TagIcon, href: (b) => `/products?brand=${encodeURIComponent(b.slug)}` },
  { key: "stores", title: "Stores", icon: StoreIcon, href: (s) => `/stores/${encodeURIComponent(s.slug)}` },
];

function flatten(suggestions: ApiSuggestions): Suggestion[] {
  return groups.flatMap((group) =>
    suggestions[group.key].map((item) => ({ key: `${group.key}:${item.id}`, label: item.name, href: group.href(item), group: group.key })),
  );
}

/** Highlights the typed term in a suggested name. */
function Highlight({ text, term }: { text: string; term: string }) {
  const at = text.toLowerCase().indexOf(term.toLowerCase());
  if (at < 0 || !term) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <strong className="font-semibold text-on-surface">{text.slice(at, at + term.length)}</strong>
      {text.slice(at + term.length)}
    </>
  );
}

/**
 * The header's search box: suggests products, categories, brands and stores as the shopper
 * types. Enter on a highlighted suggestion opens it; otherwise the form searches as before.
 */
export function SearchSuggestInput({ className }: { className?: string }) {
  const router = useRouter();
  const listId = useId();
  const [value, setValue] = useState("");
  const [term, setTerm] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const request = useRef<AbortController | undefined>(undefined);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      request.current?.abort();
    },
    [],
  );

  function onChange(next: string) {
    setValue(next);
    setActive(-1);
    clearTimeout(timer.current);
    request.current?.abort();
    const trimmed = next.trim();
    if (trimmed.length < MIN_LENGTH) {
      setItems([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(() => {
      const controller = new AbortController();
      request.current = controller;
      getSearchSuggestions(trimmed.slice(0, 100), controller.signal)
        .then((suggestions) => {
          if (controller.signal.aborted) return;
          setTerm(trimmed);
          setItems(flatten(suggestions));
          setOpen(true);
        })
        .catch(() => {
          // Suggestions are a convenience; searching still works without them.
        });
    }, DEBOUNCE_MS);
  }

  function go(item: Suggestion) {
    setOpen(false);
    setActive(-1);
    router.push(item.href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || items.length === 0) {
      if (event.key === "ArrowDown" && items.length > 0) setOpen(true);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (event.key === "Enter" && active >= 0) {
      event.preventDefault();
      go(items[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  const showList = open && items.length > 0;

  return (
    <>
      <input
        id="site-search"
        name="q"
        type="search"
        autoComplete="off"
        placeholder="Search products, brands and stores…"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => items.length > 0 && value.trim().length >= MIN_LENGTH && setOpen(true)}
        onBlur={() => setOpen(false)}
        className={className}
      />
      <div
        id={listId}
        role="listbox"
        aria-label="Search suggestions"
        hidden={!showList}
        className="absolute inset-x-0 top-full z-50 mt-1.5 max-h-[min(70vh,28rem)] overflow-y-auto rounded-lg bg-surface-container-lowest py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-surface-container"
      >
        {groups.map((group) => {
          const groupItems = items.map((item, index) => ({ item, index })).filter(({ item }) => item.group === group.key);
          if (groupItems.length === 0) return null;
          const Icon = group.icon;
          return (
            <div key={group.key} role="group" aria-label={group.title}>
              <p aria-hidden className="px-4 pt-1.5 pb-0.5 text-label-xs text-outline uppercase">
                {group.title}
              </p>
              {groupItems.map(({ item, index }) => (
                <div
                  key={item.key}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  // mousedown, not click: the input's blur would close the list first.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    go(item);
                  }}
                  onMouseEnter={() => setActive(index)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 px-4 py-2 text-body-md text-on-surface-variant",
                    index === active && "bg-primary-fixed/50 text-primary",
                  )}
                >
                  <Icon aria-hidden className="size-4 shrink-0 text-outline" />
                  <span className="truncate">
                    <Highlight text={item.label} term={term} />
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
