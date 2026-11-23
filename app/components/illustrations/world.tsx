"use client";

import { useId, useRef, type RefObject } from "react";
import { WorldArt } from "@/app/components/illustrations/art/world-art";
import { useIllustration } from "@/app/lib/use-illustration";
import { ILLO } from "@/app/lib/motion";

/** Trace circles: centre = the route's start (origin dot or its node), from the export geometry. */
const TRACE: [n: number, cx: number, cy: number][] = [
  [1, 81.33, 175.46], // route 182: origin → north
  [2, 136.03, 74.84], // route 185: node-1 → south
  [3, 19.17, 83.94], // route 180: node-2 → over the edge
  [4, 125.58, 17.19], // route 184: node-3 → east edge
  [5, 166.45, 176.66], // route 181: node-4 → over the edge
];

/**
 * World (Challenge row 3). Copy is placeholder ("Cat-and-Mouse"). Contract (re-mapped, flagged):
 * issues linger with no clear owner → routes trace outward from the origin and from each existing
 * node = issues spreading across a connected landscape. The globe never rotates (§7.3).
 * Only route 182 starts at the origin in the artwork; the other four start at the green nodes.
 * Replays while in view (user request, overriding §5/§7 "no loop").
 */
export function World({ triggerRef, className }: { triggerRef?: RefObject<Element | null>; className?: string }) {
  const scope = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[^A-Za-z0-9_-]/g, "");

  useIllustration(
    scope,
    (q, tl) => {
      const mark = { opacity: 0, scale: 0.9, transformOrigin: "50% 50%", duration: ILLO.dur.sm, ease: ILLO.ease.settle };
      // ENTER: globe, grid, land
      tl.from(q(".illo-world__env"), { opacity: 0, duration: ILLO.dur.sm, ease: ILLO.ease.settle }, 0);
      // STORY: origin marks, then routes trace out one by one; each node marks as its route sets off
      tl.from(q(".illo-world__origin"), mark, 0.2);
      TRACE.forEach(([n, cx, cy], i) => {
        const at = 0.4 + i * ILLO.stagger.lg;
        if (n > 1) tl.from(q(`.illo-world__node-${n - 1}`), mark, at - ILLO.stagger.sm);
        tl.from(q(`.illo-world__trace-${n}`), { scale: 0, svgOrigin: `${cx} ${cy}`, duration: ILLO.dur.md, ease: ILLO.ease.draw }, at);
      });
    },
    { triggerRef, loopInView: true },
  );

  return (
    <div ref={scope} className={className}>
      <WorldArt uid={uid} className="illo-world size-full overflow-visible" />
    </div>
  );
}
