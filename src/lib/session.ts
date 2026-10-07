"use client";

import { ApiError } from "@/lib/api/client";
import { getMe, logout } from "@/lib/api/account";
import type { ApiAuthResult } from "@/lib/api/schema";
import { currentToken, useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";

// Sign-in and sign-out touch both stores, so they live here rather than in either one.

/** Saves the session from a login/register response and moves the guest cart to the server. */
export async function startSession(result: ApiAuthResult) {
  if ("two_factor" in result) {
    // Two-factor sign-in only applies to staff accounts, which can't shop.
    throw new ApiError("This account signs in through the Kachiii admin portal.", 403);
  }
  useAuth.getState().setSession(result.token, result.user, result.expires_at);
  await useCart.getState().mergeIntoServer();
}

export async function endSession() {
  const token = currentToken();
  useAuth.getState().clearSession();
  useCart.getState().clear();
  if (token) await logout(token).catch(() => undefined);
}

/** Runs once after the stores load: drops an expired session and syncs the user and cart. */
export async function resumeSession() {
  const { token } = useAuth.getState();
  if (!token) return;
  if (!currentToken()) {
    useAuth.getState().clearSession();
    useCart.getState().clear();
    return;
  }
  try {
    const user = await getMe(token);
    useAuth.getState().setUser(user);
    await useCart.getState().refresh();
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      useAuth.getState().clearSession();
      useCart.getState().clear();
    }
  }
}
