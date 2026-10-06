"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ApiUser } from "@/lib/api/schema";

type AuthState = {
  token: string | null;
  user: ApiUser | null;
  expiresAt: string | null;
  setSession: (token: string, user: ApiUser, expiresAt: string) => void;
  setUser: (user: ApiUser) => void;
  clearSession: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      expiresAt: null,
      setSession: (token, user, expiresAt) => set({ token, user, expiresAt }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ token: null, user: null, expiresAt: null }),
    }),
    {
      name: "kachiii-auth",
      storage: createJSONStorage(() => localStorage),
      // Rehydrated by <SessionHydrator /> after mount, like the cart.
      skipHydration: true,
    },
  ),
);

/** The token, unless it has expired. */
export function currentToken(): string | null {
  const { token, expiresAt } = useAuth.getState();
  if (!token) return null;
  if (expiresAt && Date.parse(expiresAt) <= Date.now()) return null;
  return token;
}

const subscribeHydration = (callback: () => void) =>
  useAuth.persist?.onFinishHydration(callback) ?? (() => {});

/** True once the saved session has been loaded from localStorage. */
export function useAuthHydrated() {
  return useSyncExternalStore(
    subscribeHydration,
    () => useAuth.persist?.hasHydrated() ?? false,
    () => false,
  );
}
