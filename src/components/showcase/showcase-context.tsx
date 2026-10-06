"use client";

import { createContext, useContext, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import type { ShowcaseFace } from "@/lib/data/showcase";

export type OverlayPhase = "closed" | "open" | "closing";

type ShowcaseState = {
  faces: ShowcaseFace[];
  /** Ever-increasing turn count; the front face is `faces[step mod length]`. */
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  overlay: OverlayPhase;
  setOverlay: Dispatch<SetStateAction<OverlayPhase>>;
  /** The in-page slot the overlay zooms out of and shrinks back into. */
  slotRef: RefObject<HTMLDivElement | null>;
};

const ShowcaseContext = createContext<ShowcaseState | null>(null);

export function ShowcaseProvider({ faces, children }: { faces: ShowcaseFace[]; children: React.ReactNode }) {
  const [step, setStep] = useState(0);
  const [overlay, setOverlay] = useState<OverlayPhase>("closed");
  const slotRef = useRef<HTMLDivElement>(null);

  return <ShowcaseContext value={{ faces, step, setStep, overlay, setOverlay, slotRef }}>{children}</ShowcaseContext>;
}

export function useShowcase() {
  const ctx = useContext(ShowcaseContext);
  if (!ctx) throw new Error("useShowcase must be used inside <ShowcaseProvider>");
  return ctx;
}
