"use client";

import { useRef } from "react";
import { useReveal } from "@/app/lib/use-reveal";

/** Star positions in the 93.6px GDPR badge (1:823–1:832); `flip` = mirrored vertically in Figma. */
const STARS: { x: number; y: number; flip?: boolean }[] = [
  { x: 39.73, y: 9.28 }, { x: 39.73, y: 76.55, flip: true },
  { x: 24.08, y: 16.09 }, { x: 24.08, y: 69.74, flip: true },
  { x: 55.4, y: 16.09 }, { x: 55.4, y: 69.74, flip: true },
  { x: 68.66, y: 24.08 }, { x: 68.66, y: 61.74, flip: true },
  { x: 10.82, y: 24.08 }, { x: 10.82, y: 61.74, flip: true },
];
const px = (n: number) => `${n / 16}rem`;

/**
 * Badges are composed from Figma's own vector pieces at their exact positions (1:799 / 1:815), drawn at
 * the desktop size (93.6px) and scaled to the mobile 59.06px (×0.631) below lg — the mobile frame uses the
 * same pieces at that ratio.
 */
function Badge({ kind }: { kind: "soc" | "gdpr" }) {
  return (
    <span className="relative block size-[3.6914rem] lg:size-[5.85rem]">
      <span className="absolute top-0 left-0 block size-[5.85rem] origin-top-left scale-[0.631] lg:scale-100">
        {kind === "soc" ? (
          <span className="absolute inset-0 overflow-hidden rounded-full border-[0.043rem] border-primary-white">
            {/* eslint-disable @next/next/no-img-element -- tiny static vector pieces composed at exact Figma offsets */}
            <img src="/icons/compliance/soc-divider.svg" alt="" className="absolute block" style={{ left: px(6.53), top: px(47.92 - 0.34), width: px(79.314), height: px(0.688) }} />
            <img src="/icons/compliance/soc-aicpa.svg" alt="" className="absolute block" style={{ left: px(22.34), top: px(27.29), width: px(47.927), height: px(11.512) }} />
            <img src="/icons/compliance/soc-soc.svg" alt="" className="absolute block" style={{ left: px(29.98), top: px(59.46), width: px(33.959), height: px(11.512) }} />
            <img src="/icons/compliance/soc-ring.svg" alt="" className="absolute block" style={{ left: px(93.602 / 2 - 0.01 - 80.283 / 2), top: px(93.602 / 2 + 0.21 - 80.283 / 2), width: px(80.283), height: px(80.283) }} />
          </span>
        ) : (
          <span className="absolute inset-0">
            <img src="/icons/compliance/gdpr-text.svg" alt="" className="absolute block" style={{ left: px(93.602 / 2 - 1.77 - 44.377 / 2), top: px(93.602 / 2 + 0.92 - 11.512 / 2), width: px(44.377), height: px(11.512) }} />
            <img src="/icons/compliance/gdpr-hexagon.svg" alt="" className="absolute block" style={{ left: px(-6.23 + 103.105 * 0.067), top: px(-4.3), width: px(103.105 * (1 - 0.134)), height: px(103.105) }} />
            {STARS.map((s, i) => (
              <img
                key={i}
                src="/icons/compliance/gdpr-star.svg"
                alt=""
                className={`absolute block ${s.flip ? "-scale-y-100" : ""}`}
                style={{ left: px(s.x + 10.392 * 0.0245), top: px(s.y + (s.flip ? 10.392 * 0.0955 : 0)), width: px(10.392 * 0.951), height: px(10.392 * 0.9045) }}
              />
            ))}
            {/* eslint-enable @next/next/no-img-element */}
          </span>
        )}
      </span>
    </span>
  );
}

/**
 * Compliance (desktop 1:793, mobile 1:1015). Dark. Statement + SOC 2 / GDPR badges.
 * The mobile frame's row of white placeholder tiles below (1:1054) was removed at the user's request.
 */
export function Compliance() {
  const section = useRef<HTMLElement>(null);
  useReveal(section);

  return (
    <section ref={section} id="compliance" aria-labelledby="compliance-title" className="mt-8 bg-primary-black text-primary-white lg:mt-14">
      <div className="flex flex-col gap-8 p-8 lg:h-[15.4375rem] lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-0">
        <h2 id="compliance-title" data-reveal className="max-w-compliance-title-m font-serif text-row-title lg:max-w-compliance-title">
          Committed to maintaining compliance with international safety and security standards
        </h2>
        <ul data-reveal className="flex items-center gap-11 lg:gap-[4.9913rem]">
          <li className="flex flex-col items-center gap-[1.08rem] lg:gap-[1.7114rem]">
            <Badge kind="soc" />
            <span className="text-eyebrow whitespace-nowrap lg:text-body">SOC Type 2</span>
          </li>
          <li className="flex flex-col items-center gap-[1.08rem] lg:gap-[1.7114rem]">
            <Badge kind="gdpr" />
            <span className="text-eyebrow whitespace-nowrap lg:text-body">GDPR Compliant</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
