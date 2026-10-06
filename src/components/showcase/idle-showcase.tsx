"use client";

import { useLayoutEffect, useRef } from "react";
import { XIcon } from "lucide-react";
import { PrismCube } from "@/components/showcase/prism-cube";
import { useShowcase } from "@/components/showcase/showcase-context";
import { useIdle } from "@/hooks/use-idle";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { SHOWCASE_IDLE_MS } from "@/lib/data/showcase";
import { cn } from "@/lib/utils";

/** The in-page showcase slot. The overlay zooms out of it and shrinks back into it. */
export function ShowcaseSlot({
  className,
  sizes,
  children,
}: {
  className?: string;
  /** How wide the slot renders, so the cube loads a sharp enough image. */
  sizes?: string;
  children?: React.ReactNode;
}) {
  const { slotRef, overlay } = useShowcase();

  if (children) {
    return (
      <div ref={slotRef} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div ref={slotRef} className={cn("relative aspect-video", className)}>
      <PrismCube
        autoplay={overlay === "closed"}
        variant="inline"
        sizes={sizes}
        className={cn("size-full", overlay !== "closed" && "invisible")}
      />
    </div>
  );
}

/**
 * After a period of inactivity the showcase zooms from its slot to the centre
 * of the screen. Any activity (or the close button) shrinks it back.
 */
export function IdleShowcase() {
  const { overlay, setOverlay, slotRef } = useShowcase();
  const reducedMotion = usePrefersReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useIdle(SHOWCASE_IDLE_MS, {
    onIdle: () => setOverlay((o) => (o === "closed" ? "open" : o)),
    onActive: () => setOverlay((o) => (o === "open" ? "closing" : o)),
  });

  useLayoutEffect(() => {
    const box = boxRef.current;
    const backdrop = backdropRef.current;
    if (!box || !backdrop || overlay === "closed") return;

    box.getAnimations().forEach((a) => a.cancel());
    backdrop.getAnimations().forEach((a) => a.cancel());

    // Transform that places the centred box exactly over the in-page slot.
    const toSlot = () => {
      const slot = slotRef.current?.getBoundingClientRect();
      if (reducedMotion || !slot || slot.width === 0) return null;
      const rect = box.getBoundingClientRect();
      const dx = slot.left + slot.width / 2 - (rect.left + rect.width / 2);
      const dy = slot.top + slot.height / 2 - (rect.top + rect.height / 2);
      return `translate(${dx}px, ${dy}px) scale(${slot.width / rect.width})`;
    };
    const slotTransform = toSlot();

    if (overlay === "open") {
      box.animate(
        slotTransform ? [{ transform: slotTransform }, { transform: "none" }] : [{ opacity: 0 }, { opacity: 1 }],
        { duration: slotTransform ? 650 : 200, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
      );
      backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
      return;
    }

    const shrink = box.animate(
      slotTransform ? [{ transform: "none" }, { transform: slotTransform }] : [{ opacity: 1 }, { opacity: 0 }],
      { duration: slotTransform ? 500 : 150, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
    );
    backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: "forwards" });
    shrink.onfinish = () => setOverlay("closed");
    return () => {
      shrink.onfinish = null;
    };
  }, [overlay, reducedMotion, setOverlay, slotRef]);

  if (overlay === "closed") return null;

  return (
    <div role="dialog" aria-label="Special categories" className="fixed inset-0 z-60 grid place-items-center p-4">
      <div ref={backdropRef} aria-hidden className="absolute inset-0 bg-on-surface/55" />
      <div ref={boxRef} className="relative aspect-video w-[min(92vw,900px)]">
        <PrismCube autoplay={overlay === "open"} variant="overlay" className="size-full" />
        <button
          type="button"
          aria-label="Close showcase"
          onClick={() => setOverlay((o) => (o === "open" ? "closing" : o))}
          className="absolute -top-3 -right-3 grid size-9 place-items-center rounded-full bg-white text-on-surface shadow-lg transition-colors outline-none hover:bg-surface-container focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <XIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}
