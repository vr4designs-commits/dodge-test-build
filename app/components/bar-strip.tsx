"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MQ, STRIP } from "@/app/lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Figma geometry (px) for the two visible rows of grained bars. Each bar is a 950.74px raster
 * (Figma node renders, so the layer effect that lightens the image fill is included); bars repeat every 950.74px so the row covers any width.
 * Rows 3–4 in the desktop frame start at the section's bottom edge and are never visible.
 */
const PERIOD = 950.736;
const BARS_PER_ROW = 6; // covers up to ~3800px wide from offset − PERIOD
type Row = { top: number; height: number; offset: number; src: string };
const DESKTOP: Row[] = [
  { top: 0, height: 92.724, offset: -3.229, src: "/images/strip-a.webp" }, // 1:724 / 1:725
  { top: 92.724, height: 91.727, offset: 160.188, src: "/images/strip-b.webp" }, // 1:729 / 1:727 / 1:728
];
const MOBILE: Row[] = [
  { top: -0.476, height: 92.724, offset: -68.127, src: "/images/strip-a.webp" }, // 1:960
  // 1:962 / 1:961 use a near-identical export of the same light→dark bar; Figma can only render it clipped, so the desktop render is reused.
  { top: 92.248, height: 92.252, offset: 95.297, src: "/images/strip-b.webp" },
];

function Rows({ rows, className }: { rows: Row[]; className: string }) {
  return (
    <div aria-hidden="true" className={`absolute inset-0 ${className}`}>
      {rows.map((r, ri) => (
        <div key={ri} data-strip-row className="absolute inset-x-0" style={{ top: r.top, height: r.height }}>
          {Array.from({ length: BARS_PER_ROW }, (_, k) => (
            <div key={k} data-strip-bar className="absolute top-0 h-full" style={{ left: r.offset + (k - 1) * PERIOD, width: PERIOD }}>
              {/* Decorative, tiny lossless rasters: served as-is so the grain isn't recompressed. */}
              <Image src={r.src} alt="" fill unoptimized sizes={`${Math.ceil(PERIOD)}px`} className="object-cover" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Green bar strip at the foot of the stats section (1:724–1:733 desktop, 1:959 mobile).
 * Desktop only: the bars rise out of the section's bottom edge, left → right, row by row, scrubbed
 * to scroll. Mobile, tablet and reduced motion: static.
 */
export function BarStrip() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.desktop, () => {
        const rows = gsap.utils.toArray<HTMLElement>(".bar-strip-desktop [data-strip-row]", root.current);
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: `top ${STRIP.startPct}%`, end: `bottom ${STRIP.endPct}%`, scrub: true },
        });
        // Bottom row first, then the top row, each bar staggered left → right.
        [...rows].reverse().forEach((row, i) => {
          tl.from(row.querySelectorAll("[data-strip-bar]"), { yPercent: STRIP.riseFrom * (i + 1), ease: STRIP.ease, stagger: STRIP.stagger }, i * STRIP.stagger * 2);
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      // Mobile: pulled up behind the card's bottom 76.6px (1:958) plus the 60px arrow row under the card.
      className="relative -mt-[8.5356rem] h-[10.9106rem] overflow-hidden lg:mt-[3.8838rem] lg:h-[11.5594rem]"
    >
      <Rows rows={MOBILE} className="lg:hidden" />
      <Rows rows={DESKTOP} className="bar-strip-desktop hidden lg:block" />
    </div>
  );
}
