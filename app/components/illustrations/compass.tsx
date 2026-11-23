"use client";

import { useId, useRef, type RefObject } from "react";
import { CompassArt } from "@/app/components/illustrations/art/compass-art";
import { useIllustration } from "@/app/lib/use-illustration";
import { ILLO } from "@/app/lib/motion";

/** Selector map (motionreference §6.3) */
const PART = {
  env: ".illo-compass__env",
  stem: ".illo-compass__arrow-stem",
  left: ".illo-compass__arrow-left",
  up: ".illo-compass__arrow-up",
  right: ".illo-compass__arrow-right",
} as const;

/**
 * Compass (Challenge row 2). Contract: "Business, IT, and your SI all point in different directions"
 * → the arrow splits from one stem into three equal branches = no single direction or owner.
 * §7.2 choreography, no rotation; dial, rim and letters never move. Replays while in view (user request).
 */
export function Compass({ triggerRef, className }: { triggerRef?: RefObject<Element | null>; className?: string }) {
  const scope = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[^A-Za-z0-9_-]/g, "");

  useIllustration(
    scope,
    (q, tl) => {
      const reveal = { duration: ILLO.dur.md, ease: ILLO.ease.settle };
      // ENTER: dial + rim (letters fade with the dial but never move)
      tl.from(q(PART.env), { opacity: 0, duration: ILLO.dur.sm, ease: ILLO.ease.settle }, 0);
      // STORY: stem reveals upward from its base
      tl.from(q(PART.stem), { scaleY: 0, transformOrigin: "50% 100%", ...reveal }, 0.15);
      // three branches reveal from the fork to their tips, together, equal weight
      tl.from(q(PART.left), { scaleX: 0, transformOrigin: "100% 50%", ...reveal }, 0.55);
      tl.from(q(PART.up), { scaleY: 0, transformOrigin: "50% 100%", ...reveal }, 0.55);
      tl.from(q(PART.right), { scaleX: 0, transformOrigin: "0% 50%", ...reveal }, 0.55);
    },
    { triggerRef, loopInView: true },
  );

  return (
    <div ref={scope} className={className}>
      <CompassArt uid={uid} className="illo-compass size-full overflow-visible" />
    </div>
  );
}
