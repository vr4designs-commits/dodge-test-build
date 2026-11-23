"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FOOTER } from "@/app/lib/motion";
import { reachableStart } from "@/app/lib/scroll";
import { FOOTER_BARS_DESKTOP, FOOTER_BARS_MOBILE, type FooterBar } from "@/app/lib/footer-bars";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const gradient = (bar: FooterBar) => `linear-gradient(to bottom, ${bar.stops.map(([at, c]) => `${c} ${at}px`).join(", ")})`;

/**
 * One row of bars. Each bar is its own element (motionreference §8 "Build"), holding — bottom to top —
 * its measured gradient, its slice of the shared gradient-flow overlay, and its grain (so the grain stays
 * above the overlay and travels with the bar). `rowTop` = the row container's top in Figma footer px.
 */
function Row({ bars, rowTop, className }: { bars: FooterBar[]; rowTop: number; className: string }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      {bars.map((b, i) => (
        <div
          key={i}
          data-footer-bar
          className="absolute bottom-0 overflow-hidden"
          style={{ left: `${b.x}%`, width: `${b.w}%`, top: b.top - rowTop, backgroundImage: gradient(b) }}
        >
          {/* Flow overlay slice: the full 2×-row-wide band, offset so all slices line up into one layer. */}
          <div
            data-footer-flow
            className="absolute inset-y-0 opacity-0"
            style={{
              left: `${(-b.x / b.w) * 100}%`,
              width: `${(200 / b.w) * 100}%`,
              backgroundImage: "linear-gradient(90deg, transparent 0%, var(--color-bar-pale) 25%, transparent 50%, var(--color-bar-pale) 75%, transparent 100%)",
            }}
          />
          <div className="grain absolute inset-0" />
        </div>
      ))}
    </div>
  );
}

/**
 * Footer bar strip (motionreference §8). Bottom-aligned to the footer's bottom edge, clipped, decorative.
 * Phase 1 (all sizes, mobile ×1.2 speed): bars rise out of the edge left → right, once, at "top 95%".
 * Phase 2 (desktop only): a faint pale-green band drifts left → right across the bars, looping,
 * paused off-screen / tab hidden. Reduced motion and no-JS: bars at rest, no flow.
 */
export function FooterBars() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 1024px)", mobile: "(max-width: 767px)" },
        (ctx) => {
          const { motion, desktop, mobile } = ctx.conditions as Record<string, boolean>;
          if (!motion) return;
          const row = root.current!.querySelector<HTMLElement>(desktop ? ".footer-bars-desktop" : ".footer-bars-mobile")!;
          const bars = row.querySelectorAll<HTMLElement>("[data-footer-bar]");
          const flows = row.querySelectorAll<HTMLElement>("[data-footer-flow]");

          // Phase 2 — built paused; starts after the rise, gated by visibility.
          let flowStarted = false;
          let onScreen = false;
          const flow = desktop
            ? gsap.timeline({ paused: true })
                .to(flows, { opacity: FOOTER.flow.opacity, duration: FOOTER.flow.fadeIn, ease: "none" }, 0)
                .fromTo(flows, { xPercent: 0 }, { xPercent: -50, duration: FOOTER.flow.cycle, ease: FOOTER.flow.ease, repeat: -1 }, 0)
            : null;
          const gate = () => {
            if (!flow || !flowStarted) return;
            if (onScreen && !document.hidden) flow.play();
            else flow.pause();
          };

          // Phase 1 — rise. Hidden state is set here (never in CSS), so no-JS shows the bars at rest.
          const rise = gsap.from(bars, {
            yPercent: 100,
            duration: FOOTER.rise.dur,
            ease: FOOTER.rise.ease,
            stagger: FOOTER.rise.stagger,
            paused: true,
            onComplete: () => {
              flowStarted = true;
              gate();
            },
          });
          rise.timeScale(mobile ? FOOTER.mobileTimeScale : 1);
          ScrollTrigger.create({ trigger: row, start: reachableStart(FOOTER.rise.startPct), once: true, onEnter: () => rise.play() });
          if (flow) {
            ScrollTrigger.create({ trigger: row, start: "top bottom", end: "bottom top", onToggle: (self) => { onScreen = self.isActive; gate(); } });
            document.addEventListener("visibilitychange", gate);
          }
          return () => document.removeEventListener("visibilitychange", gate);
        },
      );
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden="true" className="relative h-[14.4375rem] overflow-hidden lg:h-[23.7813rem]">
      {/* Row tops in Figma footer px: mobile 425 (1:1059), desktop 180.5 (1:846). */}
      <Row bars={FOOTER_BARS_MOBILE} rowTop={425} className="footer-bars-mobile lg:hidden" />
      <Row bars={FOOTER_BARS_DESKTOP} rowTop={180.5} className="footer-bars-desktop hidden lg:block" />
    </div>
  );
}
