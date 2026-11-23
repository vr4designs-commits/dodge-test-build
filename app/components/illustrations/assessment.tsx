"use client";

import { useId, useRef, type RefObject } from "react";
import { AssessmentArt } from "@/app/components/illustrations/art/assessment-art";
import { useIllustration } from "@/app/lib/use-illustration";
import { ILLO } from "@/app/lib/motion";

/** Centre y of the 11 converging input shapes (same order as the in-1..11 classes). */
const IN_CY = [95, 53.4, 149.1, 200.3, 260, 75.2, 114, 43.9, 199.3, 234.5, 157.6];
/** The funnel's centre line (y) — inputs start slightly spread away from it. */
const FUNNEL_CY = 160;
/** §7.4: inputs start 30–60px further left (cycled so neighbours don't collide) and ~15% more spread. */
const START_DX = [30, 45, 60];
const SPREAD = 0.15;

/**
 * Assessment (Approach 01). Contract: "a health scan … to pinpoint the bottleneck" → scattered shapes
 * converge into the funnel, markers flag what reaches the green ring, the leader line and summary
 * panel appear = many signals narrowed down to one bottleneck. §7.4. The funnel and rings never move.
 */
export function Assessment({ active, primed, triggerRef, className }: { active: boolean; primed?: boolean; triggerRef?: RefObject<Element | null>; className?: string }) {
  const scope = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[^A-Za-z0-9_-]/g, "");

  useIllustration(
    scope,
    (q, tl) => {
      // STORY 0.20: a subset of left-side inputs converges from 30–60px further left, slightly spread.
      IN_CY.forEach((cy, i) => {
        tl.from(q(`.illo-assessment__in-${i + 1}`), { x: -START_DX[i % START_DX.length], y: (cy - FUNNEL_CY) * SPREAD, opacity: 0, duration: ILLO.dur.lg, ease: ILLO.ease.settle }, 0.2 + i * ILLO.stagger.sm);
      });
      // 0.90: `i` markers MARK as shapes reach the green ring, left → right.
      for (let n = 1; n <= 6; n++) {
        tl.from(q(`.illo-assessment__mark-${n}`), { opacity: 0, scale: 0.9, transformOrigin: "50% 50%", duration: ILLO.dur.sm, ease: ILLO.ease.settle }, 0.9 + (n - 1) * ILLO.stagger.md);
      }
      // 1.50: leader line traces from the ring to the summary panel (path runs panel → ring, so draw from its end).
      const leader = q(".illo-assessment__leader");
      tl.fromTo(leader, { attr: { "stroke-dasharray": "1 1", "stroke-dashoffset": -1 } }, { attr: { "stroke-dashoffset": 0 }, duration: ILLO.dur.md, ease: ILLO.ease.draw }, 1.5);
      tl.set(leader, { attr: { "stroke-dasharray": "none" } });
      // 1.85: summary panel; pie reveals clockwise, bars left → right. No implied percentages.
      tl.from(q(".illo-assessment__panel"), { opacity: 0, duration: ILLO.dur.sm, ease: ILLO.ease.settle }, 1.85);
      tl.fromTo(q(".illo-assessment__pie"), { attr: { "stroke-dashoffset": 1 } }, { attr: { "stroke-dashoffset": 0 }, duration: ILLO.dur.md, ease: ILLO.ease.settle }, 1.85);
      tl.from(q(".illo-assessment__bar-1, .illo-assessment__bar-2, .illo-assessment__bar-3"), { scaleX: 0, transformOrigin: "0% 50%", duration: ILLO.dur.md, ease: ILLO.ease.settle, stagger: ILLO.stagger.sm }, 1.85);
    },
    { active, primed, triggerRef },
  );

  return (
    <div ref={scope} className={className}>
      <AssessmentArt uid={uid} className="size-full" />
    </div>
  );
}
