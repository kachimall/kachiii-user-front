"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import { useShowcase } from "@/components/showcase/showcase-context";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { SHOWCASE_DWELL_MS, SHOWCASE_TURN_MS } from "@/lib/data/showcase";
import { cn } from "@/lib/utils";

const DRAG_THRESHOLD_PX = 6;
const mod = (a: number, n: number) => ((a % n) + n) % n;

type Props = {
  /** Auto-turn every few seconds (paused on hover, focus and drag). */
  autoplay: boolean;
  variant: "inline" | "overlay";
  /** Rendered width of the cube, for picking the image resolution (next/image `sizes`). */
  sizes?: string;
  className?: string;
};

/**
 * A box that turns one face at a time, like PowerPoint's Prism transition.
 * Only four physical faces exist; the hidden back face is re-filled before it
 * turns into view, so any number of categories can loop.
 */
export function PrismCube({ autoplay, variant, sizes, className }: Props) {
  const { faces, step, setStep } = useShowcase();
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const lastStep = useRef(step);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragDeg, setDragDeg] = useState<number | null>(null);
  const drag = useRef<{ x: number; pointerId: number; width: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const n = faces.length;
  const current = mod(step, n);
  const running = autoplay && !reducedMotion && !hovered && !focused && dragDeg === null;

  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setStep((s) => s + 1), SHOWCASE_DWELL_MS + SHOWCASE_TURN_MS);
    return () => clearTimeout(id);
  }, [running, step, setStep]);

  // Mid-turn the box's edge swings out past the slot; dip the scale so the
  // whole box stays inside it (PowerPoint's Prism does the same).
  useEffect(() => {
    if (step === lastStep.current) return;
    lastStep.current = step;
    if (reducedMotion) return;
    stageRef.current?.animate([{ scale: 1 }, { scale: 0.86 }, { scale: 1 }], {
      duration: SHOWCASE_TURN_MS,
      easing: "ease-in-out",
    });
  }, [step, reducedMotion]);

  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { x: e.clientX, pointerId: e.pointerId, width: rootRef.current?.clientWidth ?? 1, moved: false };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > DRAG_THRESHOLD_PX) {
      // Capture only once it's a real drag, so plain clicks still reach the face link.
      d.moved = true;
      rootRef.current?.setPointerCapture(d.pointerId);
    }
    if (d.moved) setDragDeg(Math.max(-90, Math.min(90, (dx / d.width) * 90)));
  }

  function onPointerEnd(e: React.PointerEvent) {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    const dx = e.clientX - d.x;
    const deg = Math.max(-90, Math.min(90, (dx / d.width) * 90));
    let turns = Math.round(-deg / 90);
    if (turns === 0 && Math.abs(dx) > d.width * 0.15) turns = dx < 0 ? 1 : -1;
    setStep((s) => s + turns);
    setDragDeg(null);
    suppressClick.current = true;
  }

  const angle = -90 * step + (dragDeg ?? 0);
  const turnMs = reducedMotion || dragDeg !== null ? 0 : SHOWCASE_TURN_MS;
  const isOverlay = variant === "overlay";

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Special categories"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") setStep((s) => s + 1);
        if (e.key === "ArrowLeft") setStep((s) => s - 1);
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onClickCapture={(e) => {
        if (suppressClick.current) {
          e.preventDefault();
          e.stopPropagation();
          suppressClick.current = false;
        }
      }}
      className={cn("group/cube relative touch-pan-y select-none @container", className)}
    >
      {/* Container units (cqw) resolve against the root, so perspective lives on this inner stage.
          No clipping here: mid-turn, the box's front edge comes toward the viewer and grows
          slightly past the slot, and cropping it would cut off its top and bottom. */}
      <div ref={stageRef} className="absolute inset-0" style={{ perspective: "240cqw" }}>
        <div
          className="absolute inset-0 transform-3d"
          style={{
            transform: `translateZ(-50cqw) rotateY(${angle}deg)`,
            transition: `transform ${turnMs}ms cubic-bezier(0.65, 0, 0.35, 1)`,
          }}
        >
          {[0, 1, 2, 3].map((slot) => {
            // Which face this physical side shows: front = current, right = next,
            // left = previous, back = the one after next.
            let offset = mod(slot - step, 4);
            if (offset === 3) offset = -1;
            const index = mod(step + offset, n);
            const face = faces[index];
            const isFront = offset === 0;

            return (
              <div
                key={slot}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${n}: ${face.word}`}
                aria-hidden={!isFront}
                className="absolute inset-0 overflow-hidden shadow-lg backface-hidden"
                style={{ transform: `rotateY(${slot * 90}deg) translateZ(50cqw)` }}
              >
                <Link
                  href={face.href}
                  tabIndex={isFront ? 0 : -1}
                  draggable={false}
                  className="absolute inset-0 block overflow-hidden outline-none focus-visible:ring-3 focus-visible:ring-white focus-visible:ring-inset"
                >
                  <Image
                    src={face.image}
                    alt=""
                    fill
                    draggable={false}
                    quality={90}
                    sizes={sizes ?? (isOverlay ? "(min-width: 768px) 900px, 92vw" : "92vw")}
                    className="object-cover"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-linear-to-t from-black/45 via-black/5 to-transparent"
                  />
                  <span className="absolute inset-0 flex flex-col justify-end p-[5cqw] pb-[9cqw] text-white">
                    <span
                      className="font-heading leading-[0.9] font-extrabold tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
                      style={{ fontSize: "17cqw" }}
                    >
                      {face.word}
                    </span>
                    <span
                      className="mt-[1.5cqw] flex items-center gap-1 font-semibold"
                      style={{ fontSize: "max(11px, 3.4cqw)" }}
                    >
                      {face.tagline}
                      <ArrowRightIcon aria-hidden className="size-[1.2em]" />
                    </span>
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[3cqw] flex items-center justify-center gap-1">
        {faces.map((face, i) => (
          <button
            key={face.id}
            type="button"
            aria-label={`Show ${face.word}`}
            aria-current={i === current}
            onClick={() => setStep((s) => s + mod(i - current, n))}
            className={cn(
              "rounded-full transition-all outline-none focus-visible:ring-2 focus-visible:ring-white",
              isOverlay ? "h-2" : "h-1.5",
              i === current
                ? isOverlay
                  ? "w-6 bg-white"
                  : "w-4 bg-white"
                : cn("bg-white/50 hover:bg-white/80", isOverlay ? "w-2" : "w-1.5"),
            )}
          />
        ))}
      </div>
    </div>
  );
}
