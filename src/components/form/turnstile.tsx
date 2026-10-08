"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Cloudflare Turnstile, the bot check the backend asks for on sign-up, login and password reset
// while it has a secret key. Without NEXT_PUBLIC_TURNSTILE_SITE_KEY the widget is skipped and
// forms send no token, which a backend without bot protection accepts.

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined;

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "flexible" | "compact";
    },
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi> | undefined;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile failed to load")));
    script.onerror = () => {
      scriptPromise = undefined;
      script.remove();
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * The widget's token for a form. `reset()` asks for a fresh one: Cloudflare accepts each token
 * once, so call it after every submit the backend answered.
 */
export function useTurnstile() {
  const [token, setToken] = useState<string>();
  const [error, setError] = useState<string>();
  const widgetId = useRef<string | undefined>(undefined);

  const reset = useCallback(() => {
    setToken(undefined);
    if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
  }, []);

  return {
    enabled: TURNSTILE_SITE_KEY !== undefined,
    token,
    error,
    setError,
    reset,
    widget: TURNSTILE_SITE_KEY ? (
      <TurnstileWidget
        siteKey={TURNSTILE_SITE_KEY}
        widgetId={widgetId}
        error={error}
        onToken={(value) => {
          setToken(value);
          if (value) setError(undefined);
        }}
      />
    ) : null,
  };
}

function TurnstileWidget({
  siteKey,
  widgetId,
  error,
  onToken,
}: {
  siteKey: string;
  widgetId: React.RefObject<string | undefined>;
  error?: string;
  onToken: (token: string | undefined) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  // The latest callback, so the widget isn't re-rendered when the parent re-renders.
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  });

  useEffect(() => {
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !container.current) return;
        widgetId.current = turnstile.render(container.current, {
          sitekey: siteKey,
          size: "flexible",
          theme: "light",
          callback: (token) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(undefined),
          "error-callback": () => onTokenRef.current(undefined),
        });
      })
      .catch(() => !cancelled && setLoadFailed(true));
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = undefined;
    };
  }, [siteKey, widgetId]);

  return (
    <div className="flex flex-col gap-1.5">
      <div ref={container} className="min-h-16.25" />
      {loadFailed && (
        <p role="alert" className="text-sm text-destructive">
          The security check couldn’t load. Check your connection or turn off content blockers, then reload the page.
        </p>
      )}
      {error && !loadFailed && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
