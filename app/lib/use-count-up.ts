"use client";

import type { RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { COUNT, REVEAL } from "@/app/lib/motion";
import { reachableStart } from "@/app/lib/scroll";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Counts every `[data-count]` element inside `scope` up from 0 once it enters the viewport
 * (CLAUDE.md "Stats"). The server-rendered text is the final value ("50K+"), so no-JS and
 * reduced motion show it unchanged; only the leading number animates, prefix/suffix stay put.
 */
export function useCountUp(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-count]", scope.current).forEach((el) => {
          const final = el.textContent ?? "";
          const match = final.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
          if (!match) return;
          const [, prefix, num, suffix] = match;
          const decimals = num.includes(".") ? num.split(".")[1].length : 0;
          const state = { v: 0 };
          const render = () => (el.textContent = `${prefix}${state.v.toFixed(decimals)}${suffix}`);
          render();
          gsap.to(state, {
            v: Number(num),
            duration: COUNT.dur,
            ease: COUNT.ease,
            onUpdate: render,
            onComplete: () => void (el.textContent = final),
            scrollTrigger: { trigger: el, start: reachableStart(REVEAL.startPct), once: true },
          });
          return () => void (el.textContent = final);
        });
      });
      return () => mm.revert();
    },
    { scope },
  );
}
