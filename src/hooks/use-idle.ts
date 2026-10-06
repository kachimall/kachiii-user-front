"use client";

import { useEffect, useRef } from "react";

const ACTIVITY_EVENTS = ["pointermove", "pointerdown", "keydown", "wheel", "scroll", "touchstart"] as const;

function isTyping() {
  const el = document.activeElement;
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
}

/**
 * Calls `onIdle` after `timeout` ms without user activity, and `onActive` on
 * the first activity after that. Never fires while the tab is hidden or the
 * user is focused in a form field.
 */
export function useIdle(timeout: number, handlers: { onIdle: () => void; onActive: () => void }) {
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let idle = false;

    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (document.visibilityState !== "visible" || isTyping()) {
          schedule();
          return;
        }
        idle = true;
        handlersRef.current.onIdle();
      }, timeout);
    };

    const onActivity = () => {
      if (idle) {
        idle = false;
        handlersRef.current.onActive();
      }
      schedule();
    };

    for (const event of ACTIVITY_EVENTS) window.addEventListener(event, onActivity, { passive: true });
    document.addEventListener("visibilitychange", onActivity);
    schedule();

    return () => {
      clearTimeout(timer);
      for (const event of ACTIVITY_EVENTS) window.removeEventListener(event, onActivity);
      document.removeEventListener("visibilitychange", onActivity);
    };
  }, [timeout]);
}
