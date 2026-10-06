"use client";

import { ArrowUpIcon, MessageSquareIcon } from "lucide-react";
import { toast } from "sonner";

export function FloatingActions() {
  return (
    <aside aria-label="Quick help" className="fixed right-3 bottom-above-nav z-30 mb-3 flex flex-col items-end gap-1.5 md:right-6 md:bottom-6 md:mb-0">
      <button
        type="button"
        aria-label="Kachi Chat, 2 agents online"
        onClick={() => toast.info("Kachi Chat isn’t available yet. Email support@kachi.example for help.")}
        className="flex size-12 items-center justify-center gap-1 rounded-full bg-primary text-white shadow-lg transition-colors outline-none hover:bg-primary-container focus-visible:ring-3 focus-visible:ring-ring/50 md:size-auto md:px-2.5 md:py-1.5"
      >
        <span className="relative">
          <MessageSquareIcon aria-hidden className="size-5.5" />
          <span aria-hidden className="absolute -top-1 -right-1 size-2.5 rounded-full border-2 border-white bg-secondary" />
        </span>
        <span aria-hidden className="hidden pr-1 text-label-md font-bold md:inline">Kachi Chat</span>
        <span aria-hidden className="hidden rounded-sm bg-white/20 px-1.5 py-0.5 text-[10px] font-bold md:inline">2 Online</span>
      </button>
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
