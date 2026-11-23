"use client";

import { useId, useRef, type RefObject } from "react";
import { ConfigureArt } from "@/app/components/illustrations/art/configure-art";
import { useIllustration } from "@/app/lib/use-illustration";
import { ILLO } from "@/app/lib/motion";

/** Hub centres measured from the export (inner-ring and hub-dot centres coincide). */
const HUB_1 = "158.92 120.68"; // left wheel
const HUB_2 = "370.49 176.75"; // right wheel
/** Each wheel has 10 modules (20 radial repeats: outline + inner) → one module = 36°. */
const MODULE_DEG = 360 / 10;

/**
 * Configure (Approach 03). Contract: "prioritized reconfiguration roadmap that fixes misaligned setups"
 * → each wheel starts one module out of alignment and indexes into place, first then second
 * = an ordered realignment. §7.6. Separate mechanisms (not meshed), rotating about their own drawn hubs;
 * orbit guides and arcs stay fixed. Direction: counter-clockwise, following each wheel's dashed-orbit arrow.
 */
export function Configure({ active, primed, triggerRef, className }: { active: boolean; primed?: boolean; triggerRef?: RefObject<Element | null>; className?: string }) {
  const scope = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[^A-Za-z0-9_-]/g, "");

  useIllustration(
    scope,
    (q, tl) => {
      const index = { rotation: MODULE_DEG, duration: ILLO.dur.lg, ease: ILLO.ease.mech };
      tl.from(q(".illo-configure__wheel-1"), { ...index, svgOrigin: HUB_1 }, 0.2);
      tl.from(q(".illo-configure__wheel-2"), { ...index, svgOrigin: HUB_2 }, 0.75);
      // 1.50: existing green hub dots — brief opacity emphasis, no glow.
      tl.from(q(".illo-configure__hub-1, .illo-configure__hub-2"), { opacity: 0.6, duration: ILLO.dur.sm, ease: ILLO.ease.settle }, 1.5);
    },
    { active, primed, triggerRef },
  );

  return (
    <div ref={scope} className={className}>
      <ConfigureArt uid={uid} className="size-full" />
    </div>
  );
}
