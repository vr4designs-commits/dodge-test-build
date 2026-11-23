"use client";

import { gsap } from "gsap";
import { useId, useRef, type RefObject } from "react";
import { AnalyseArt } from "@/app/components/illustrations/art/analyse-art";
import { useIllustration } from "@/app/lib/use-illustration";
import { ILLO } from "@/app/lib/motion";

const PLATES = [1, 2, 3, 4, 5] as const;
/** Flagged plates (the ones with an existing `!` marker): mark-1 → plate 1, mark-2 → 3, mark-3 → 5. */
const FLAGGED = [1, 3, 5] as const;
/** Loop: the centre flagged plate dips and re-lifts (≤30% of the STORY lift). */
const LOOP_PLATE = 3;
const LOOP_MARK = 2;
const LOOP_DIP = ILLO.dist.lift * 0.3;

/**
 * Analyse (Approach 02). Contract: "continuous problem management to surface recurring issues" →
 * plates lift out of the grid and three get flagged = recurring issues surfaced before they spread.
 * §7.5. True isometric: lift along Z (screen y). The platform never moves.
 */
export function Analyse({ active, primed, triggerRef, className }: { active: boolean; primed?: boolean; triggerRef?: RefObject<Element | null>; className?: string }) {
  const scope = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[^A-Za-z0-9_-]/g, "");

  useIllustration(
    scope,
    (q, tl) => {
      // 0.15: anchor cells under the dashed lines get a subtle emphasis.
      tl.from(q(PLATES.map((n) => `.illo-analyse__anchor-${n}`).join(",")), { opacity: 0.35, duration: ILLO.dur.sm, ease: ILLO.ease.settle }, 0.15);
      PLATES.forEach((n, i) => {
        const at = 0.4 + i * ILLO.stagger.md;
        const lift = { duration: ILLO.dur.lg, ease: ILLO.ease.settle };
        // Plate lifts along Z from ~40px lower; its connector's mask rides with it so the endpoint stays attached…
        tl.from(q(`.illo-analyse__plate-${n}`), { y: ILLO.dist.lift, opacity: 0, ...lift }, at);
        tl.from(q(`.illo-analyse__line-${n}`), { y: ILLO.dist.lift, ...lift }, at);
        // …while the connector extends up from its anchor.
        tl.from(q(`.illo-analyse__grow-${n}`), { scaleY: 0, transformOrigin: "50% 100%", ...lift }, at + 0.1);
      });
      // 1.60: the three existing `!` markers, each after its plate settles. Never all five.
      FLAGGED.forEach((_, k) => {
        tl.from(q(`.illo-analyse__mark-${k + 1}`), { opacity: 0, scale: 0.9, transformOrigin: "50% 50%", duration: ILLO.dur.sm, ease: ILLO.ease.settle }, 1.6 + k * ILLO.stagger.md);
      });
    },
    {
      active,
      primed,
      triggerRef,
      buildLoop: (q) => {
        const parts = q(`.illo-analyse__plate-${LOOP_PLATE}, .illo-analyse__mark-${LOOP_MARK}`);
        const dur = ILLO.dur.md + ILLO.dur.lg;
        return gsap
          .timeline({ repeat: -1, repeatDelay: ILLO.loop.quiet - dur })
          .to(parts, { y: LOOP_DIP, duration: ILLO.dur.md, ease: ILLO.ease.mech })
          .to(parts, { y: 0, duration: ILLO.dur.lg, ease: ILLO.ease.settle });
      },
    },
  );

  return (
    <div ref={scope} className={className}>
      <AnalyseArt uid={uid} className="size-full" />
    </div>
  );
}
