"use client";

import { gsap } from "gsap";
import { useId, useRef, type RefObject } from "react";
import { SupportArt } from "@/app/components/illustrations/art/support-art";
import { useIllustration } from "@/app/lib/use-illustration";
import { ILLO } from "@/app/lib/motion";

/**
 * Distance the flow band travels to cross a connector completely (connector 67.8 + band 24 + margins).
 * The connectors' dashes are separate sub-paths, not a dash array, so FLOW can't move the dash phase:
 * a soft dimmer band travels outward through an animation-only mask instead (motion only, no new colour).
 */
const FLOW_TRAVEL = 93.2;
const FLOW_PAUSE = 2;

/**
 * Support (Approach 04). Contract: "Automate L1/L2 support through agents integrated with Teams/Slack —
 * cutting resolution times" → both connectors trace in, the three bars fill as the response, then the
 * line flows back out = request in → resolved → reply out, quickly. §7.7. Logos are never animated.
 */
export function Support({ active, primed, triggerRef, className }: { active: boolean; primed?: boolean; triggerRef?: RefObject<Element | null>; className?: string }) {
  const scope = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[^A-Za-z0-9_-]/g, "");

  useIllustration(
    scope,
    (q, tl) => {
      // 0.10: both connectors trace from their app tiles toward the bubble, together.
      const trace = { scaleX: 0, duration: ILLO.dur.md, ease: ILLO.ease.draw };
      tl.from(q(".illo-support__trace-slack"), { ...trace, transformOrigin: "0% 50%" }, 0.1);
      tl.from(q(".illo-support__trace-teams"), { ...trace, transformOrigin: "100% 50%" }, 0.1);
      // 0.55: bars reveal left → right along the bubble's X edge, top → bottom; faces move as one.
      tl.from(q(".illo-support__bar-1, .illo-support__bar-2, .illo-support__bar-3"), { scaleX: 0, transformOrigin: "0% 50%", duration: ILLO.dur.md, ease: ILLO.ease.settle, stagger: ILLO.stagger.md }, 0.55);
      // 1.30: reply flows outward once, toward the apps.
      const flow = { duration: ILLO.dur.md, ease: ILLO.ease.flow };
      tl.to(q(".illo-support__flow-slack"), { x: -FLOW_TRAVEL, ...flow }, 1.3);
      tl.to(q(".illo-support__flow-teams"), { x: FLOW_TRAVEL, ...flow }, 1.3);
      tl.set(q(".illo-support__flow-slack, .illo-support__flow-teams"), { x: 0 });
    },
    {
      active,
      primed,
      triggerRef,
      buildLoop: (q) =>
        gsap
          .timeline({ repeat: -1, repeatDelay: FLOW_PAUSE })
          .fromTo(q(".illo-support__flow-slack"), { x: 0 }, { x: -FLOW_TRAVEL, duration: ILLO.loop.flow, ease: ILLO.ease.flow }, 0)
          .fromTo(q(".illo-support__flow-teams"), { x: 0 }, { x: FLOW_TRAVEL, duration: ILLO.loop.flow, ease: ILLO.ease.flow }, 0),
    },
  );

  return (
    <div ref={scope} className={className}>
      <SupportArt uid={uid} className="size-full" />
    </div>
  );
}
