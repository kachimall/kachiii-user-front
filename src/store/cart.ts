"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { addCartItem, getCart, removeCartItem, updateCartItem } from "@/lib/api/account";
import { variantName } from "@/lib/api/products";
import type { ApiCart } from "@/lib/api/schema";
import { currentToken } from "@/store/auth";
import type { CartItem } from "@/types";

const MAX_QTY = 99;

// Guests keep their cart in this browser. Signed-in shoppers use the server
// cart (the backend has no guest cart); on sign-in the guest lines are moved
// over by `mergeIntoServer`. Every action resolves once the change is saved
// and rejects with an ApiError when the server refuses it.
type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => Promise<void>;
  setQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  /** Reloads the server cart. No-op for guests. */
  refresh: () => Promise<void>;
  /** Pushes guest lines to the server cart, then loads it. */
  mergeIntoServer: () => Promise<void>;
  clear: () => void;
};

export function fromServerCart(cart: ApiCart): CartItem[] {
  return cart.stores.flatMap((group) =>
    group.items.map((line) => ({
      lineId: line.id,
      productId: line.product.id,
      variantId: line.variant.id,
      name: line.product.name,
      variantName: variantName(line.variant.options),
      price: Number(line.unit_price),
      compareAtPrice: line.compare_at_price ? Number(line.compare_at_price) : undefined,
      image: line.thumbnail_url ?? undefined,
      quantity: line.quantity,
      status: line.status,
      stock: line.stock,
    })),
  );
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => {
      const save = (cart: ApiCart) => set({ items: fromServerCart(cart) });
      const line = (variantId: string) => get().items.find((i) => i.variantId === variantId);

      return {
        items: [],

        async addItem(item, quantity = 1) {
          const token = currentToken();
          if (token) {
            save(await addCartItem(token, item.variantId, quantity));
            return;
          }
          set((state) => {
            const existing = state.items.find((i) => i.variantId === item.variantId);
            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.variantId === item.variantId ? { ...i, quantity: Math.min(i.quantity + quantity, MAX_QTY) } : i,
                ),
              };
            }
            return { items: [...state.items, { ...item, quantity: Math.min(quantity, MAX_QTY) }] };
          });
        },

        async setQuantity(variantId, quantity) {
          if (quantity <= 0) return get().removeItem(variantId);
          const token = currentToken();
          const lineId = line(variantId)?.lineId;
          if (token && lineId) {
            save(await updateCartItem(token, lineId, Math.min(quantity, MAX_QTY)));
            return;
          }
          set((state) => ({
            items: state.items.map((i) => (i.variantId === variantId ? { ...i, quantity: Math.min(quantity, MAX_QTY) } : i)),
          }));
        },

        async removeItem(variantId) {
          const token = currentToken();
          const lineId = line(variantId)?.lineId;
          if (token && lineId) {
            save(await removeCartItem(token, lineId));
            return;
          }
          set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) }));
        },

        async refresh() {
          const token = currentToken();
          if (token) save(await getCart(token));
        },

        async mergeIntoServer() {
          const token = currentToken();
          if (!token) return;
          const guestLines = get().items.filter((i) => !i.lineId);
          for (const item of guestLines) {
            // A line that's sold out or no longer listed is dropped rather than blocking sign-in.
            await addCartItem(token, item.variantId, item.quantity).catch(() => undefined);
          }
          save(await getCart(token));
        },

        clear: () => set({ items: [] }),
      };
    },
    {
      name: "kachiii-cart",
      storage: createJSONStorage(() => localStorage),
      // Rehydrated by <SessionHydrator /> after mount so server and first client
      // render match.
      skipHydration: true,
    },
  ),
);

export const selectCount = (s: CartState) => s.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectSubtotal = (s: CartState) =>
  s.items.filter((i) => !i.status || i.status === "available").reduce((sum, i) => sum + i.price * i.quantity, 0);

// `useCart.persist` is missing on the server, where localStorage doesn't exist.
const subscribeHydration = (callback: () => void) => useCart.persist?.onFinishHydration(callback) ?? (() => {});

/** True once the saved cart has been loaded from localStorage. */
export function useCartHydrated() {
  return useSyncExternalStore(
    subscribeHydration,
    () => useCart.persist?.hasHydrated() ?? false,
    () => false,
  );
}
