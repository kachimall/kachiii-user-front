"use client";

import { create } from "zustand";

export type ChatStore = { id: string; slug: string; name: string };

/** What the floating chat panel shows: the inbox, a conversation, or a new one with a store. */
export type ChatView = { kind: "list" } | { kind: "thread"; id: string } | { kind: "new"; store: ChatStore; about?: string };

type ChatState = {
  open: boolean;
  view: ChatView;
  /** Unread messages across every conversation (`meta.unread_total`). */
  unread: number;
  show: (view?: ChatView) => void;
  close: () => void;
  setUnread: (unread: number) => void;
};

export const useChat = create<ChatState>()((set) => ({
  open: false,
  view: { kind: "list" },
  unread: 0,
  show: (view) => set((state) => ({ open: true, view: view ?? state.view })),
  close: () => set({ open: false }),
  setUnread: (unread) => set({ unread }),
}));
