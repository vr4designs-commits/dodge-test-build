"use client";

import { useRef } from "react";
import { TestimonialCarousel } from "@/app/components/testimonial-carousel";
import { BarStrip } from "@/app/components/bar-strip";
import { useReveal } from "@/app/lib/use-reveal";
import { useCountUp } from "@/app/lib/use-count-up";

/** PLACEHOLDER copy, repeated in Figma (desktop "50K+" ×3; the user chose desktop copy for all breakpoints). */
const STATS = [
  { value: "50K+", label: "Configs Audited", sub: "Across Finance, Procurement, and TPM" },
  { value: "50K+", label: "Configs Audited", sub: "Across Finance, Procurement, and TPM" },
  { value: "50K+", label: "Configs Audited", sub: "Across Finance, Procurement, and TPM" },
];

/**
 * Stats + testimonials (desktop 1:723, mobile 1:958). Dark section.
 * Mobile: left-aligned heading, stats as rows (number | label), single testimonial card overlapping
 * the bar strip. Desktop: centred heading, three stat columns, carousel with peeks, strip below.
 */
export function Stats() {
  const section = useRef<HTMLElement>(null);
  useReveal(section);
  useCountUp(section);

  return (
    <section
      ref={section}
      id="results"
      aria-labelledby="results-title"
      className="mt-8 overflow-x-clip bg-primary-black text-primary-white lg:mt-14"
    >
      <div className="px-8 pt-[2.0625rem] lg:px-[4.1563rem] lg:pt-[3.1563rem]">
        <h2
          id="results-title"
          data-reveal
          className="max-w-stats-title-m font-serif text-row-title lg:mx-auto lg:max-w-stats-title lg:text-center"
        >
          Powering smarter CPG operations across the enterprise
        </h2>

        <ul className="mt-8 flex flex-col gap-8 lg:mt-16 lg:grid lg:grid-cols-3 lg:gap-16">
          {STATS.map((s, i) => (
            <li
              key={i}
              data-reveal
              className="-mx-[0.4063rem] flex items-center justify-between lg:mx-0 lg:flex-col lg:justify-center lg:gap-6 lg:px-6 lg:py-2 lg:text-center"
            >
              <span data-count className="w-stat-num-m font-sans text-stat tabular-nums lg:w-auto">
                {s.value}
              </span>
              <span className="flex w-stat-sub-m flex-col gap-[0.4741rem] lg:w-stat-sub lg:items-center lg:gap-3">
                <span className="text-body font-bold lg:text-lead">{s.label}</span>
                <span className="text-eyebrow lg:text-lead">{s.sub}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Card sits above the strip on mobile (they overlap by 76.6px in 1:958). */}
      <div className="relative z-10 px-8 lg:px-0">
        <TestimonialCarousel />
      </div>
      <BarStrip />
    </section>
  );
}
