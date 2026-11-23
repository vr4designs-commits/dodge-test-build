"use client";

import { useRef } from "react";
import Image from "next/image";
import { ParallaxImage } from "@/app/components/parallax-image";
import { useReveal } from "@/app/lib/use-reveal";

/**
 * CTA (desktop 1:844 / 1:845, mobile 1:1058). Same landscape as the hero, at Figma's own crops:
 * desktop/tablet a rounded 1311×389 card with parallax (range PARALLAX.cta); mobile a full-bleed
 * 412×458.5 block straight after the dark compliance section, static.
 * PLACEHOLDER: the button label is "Button" in Figma and has no target yet (points at #main).
 */
export function Cta() {
  const section = useRef<HTMLElement>(null);
  useReveal(section);

  return (
    <section ref={section} id="cta" aria-labelledby="cta-title" className="md:mt-14 md:px-[4.0313rem] md:py-[1.1563rem]">
      <div className="relative h-[28.6563rem] overflow-hidden bg-primary-black md:h-[24.3125rem] md:rounded-image md:bg-grey-2">
        <Image src="/images/cta-landscape-m.webp" alt="" fill sizes="100vw" className="object-cover md:hidden" />
        <ParallaxImage variant="cta" src="/images/cta-landscape.webp" alt="" sizes="(min-width: 768px) 92vw, 1px" className="absolute inset-0 hidden md:block" />
        {/* Centred at every width: mobile spans the 32px side margins (= Figma's 347.5px block at 412) so it stays
            centred on wider phones/small tablets; ≥768 is centred on the card at Figma's 50% − 35.4px. */}
        <div className="absolute inset-x-8 top-[4.1194rem] mx-auto flex max-w-cta-title flex-col items-center gap-8 md:top-[calc(50%-2.2125rem)] md:-translate-y-1/2 md:gap-6">
          <h2 id="cta-title" data-reveal className="text-center font-serif text-display text-primary-white">
            See how we automate your CPG processes
          </h2>
          <a
            data-reveal
            href="#main"
            className="flex min-w-[8.4279rem] items-center justify-center rounded-button bg-primary-white p-3 text-center text-body text-primary-black md:min-w-[9.7184rem] md:text-lead"
          >
            Button
          </a>
        </div>
      </div>
    </section>
  );
}
