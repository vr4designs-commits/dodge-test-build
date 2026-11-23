"use client";

import type { RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { REVEAL } from "@/app/lib/motion";
import { reachableStart } from "@/app/lib/scroll";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Fade-and-rise reveal for every `[data-reveal]` inside `scope` (CLAUDE.md "Text reveals").
 * Plays once on entering the viewport. Elements entering together are staggered in DOM order.
 * Hidden state comes from `.js-reveal [data-reveal]` (only set when JS runs and motion is allowed),
 * so no-JS and reduced motion show the final state.
 */
export function useReveal(scope: RefObject<HTMLElement | null>, opts: { startPct?: number } = {}) {
  const startPct = opts.startPct ?? REVEAL.startPct;
  useGSAP(
    () => {
      const els = gsap.utils.toArray<HTMLElement>("[data-reveal]", scope.current);
      if (!els.length) return;
      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { mobile, reduced } = ctx.conditions as Record<string, boolean>;
          if (reduced) {
            gsap.set(els, { opacity: 1, y: 0 });
            return;
          }
          gsap.set(els, { y: mobile ? REVEAL.riseMobile : REVEAL.rise });
          ScrollTrigger.batch(els, {
            // Capped to the last reachable scroll, so elements near the page end still play.
            start: reachableStart(startPct),
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: mobile ? REVEAL.durMobile : REVEAL.dur,
                ease: REVEAL.ease,
                stagger: REVEAL.stagger,
                overwrite: true,
              }),
          });
        },
      );
      return () => mm.revert();
    },
    { scope, dependencies: [startPct] },
  );
}
