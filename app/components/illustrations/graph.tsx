"use client";

import { useId, useRef, type RefObject } from "react";
import { GraphArt } from "@/app/components/illustrations/art/graph-art";
import { useIllustration } from "@/app/lib/use-illustration";
import { ILLO } from "@/app/lib/motion";

/** Selector map (motionreference §6.3): part → class in graph-art.tsx */
const PART = {
  env: ".illo-graph__env",
  bars: [1, 2, 3, 4, 5].map((n) => `.illo-graph__bar-${n}`).join(","),
  line: ".illo-graph__line",
  arrow: ".illo-graph__arrow",
} as const;

/**
 * Graph (Challenge row 1). Contract: "The Necessary Investment That Becomes a Pit of Problems /
 * ROI stalls" → bars step down, the line traces the decline and the arrow lands = things getting worse.
 * §7.1 choreography. Replays while in view (user request, overriding §5/§7 "no loop").
 */
export function Graph({ triggerRef, className }: { triggerRef?: RefObject<Element | null>; className?: string }) {
  const scope = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[^A-Za-z0-9_-]/g, "");

  useIllustration(
    scope,
    (q, tl) => {
      // ENTER: card + dashed border
      tl.from(q(PART.env), { opacity: 0, duration: ILLO.dur.sm, ease: ILLO.ease.settle }, 0);
      // STORY: bars reveal from their baselines (mask, not scaleY on the art), left → right
      tl.from(q(PART.bars), { scaleY: 0, transformOrigin: "50% 100%", duration: ILLO.dur.md, ease: ILLO.ease.settle, stagger: ILLO.stagger.md }, 0.15);
      // stepped line draws left → right over the bars
      tl.from(q(PART.line), { scaleX: 0, transformOrigin: "0% 50%", duration: ILLO.dur.lg, ease: ILLO.ease.draw }, 0.55);
      // arrow lands from a 4px nudge above, along the card vertical
      tl.from(q(PART.arrow), { y: -ILLO.dist.nudge, opacity: 0, duration: ILLO.dur.md, ease: ILLO.ease.settle }, 1.2);
    },
    { triggerRef, loopInView: true },
  );

  return (
    <div ref={scope} className={className}>
      <GraphArt uid={uid} className="illo-graph size-full overflow-visible" />
    </div>
  );
}
