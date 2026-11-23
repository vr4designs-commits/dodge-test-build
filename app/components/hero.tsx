"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ParallaxImage } from "@/app/components/parallax-image";
import { useReveal } from "@/app/lib/use-reveal";
import { MQ, PARALLAX } from "@/app/lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Hero (desktop 1:593, mobile 1:848).
 * Mobile: full-bleed image under the transparent navbar, 412:789 frame.
 * ≥768: rounded image holder below the solid navbar, 32px side/bottom margins.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const holder = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLDivElement>(null);

  useReveal(section);

  // Headline layer drifts up faster than the image for depth (desktop/tablet only).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const drift = (factor: number) =>
        gsap.to(header.current, {
          yPercent: PARALLAX.heroHeadlineShift * factor,
          ease: "none",
          scrollTrigger: { trigger: holder.current, start: "top top", end: "bottom top", scrub: true },
        });
      mm.add(MQ.desktop, () => drift(1));
      mm.add(MQ.tablet, () => drift(PARALLAX.tabletFactor));
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      id="hero"
      aria-labelledby="hero-title"
      className="bg-primary-white md:px-8 md:pt-(--nav-h) md:pb-8"
    >
      <div
        ref={holder}
        data-nav-overlay
        className="relative isolate aspect-412/789 overflow-hidden md:aspect-4/3 md:rounded-image lg:aspect-1376/928"
      >
        <ParallaxImage
          variant="hero"
          mode="fromTop"
          scale
          src="/images/hero-landscape.webp"
          alt="Illustrated landscape: rolling green hills and a red suspension bridge, with people turning giant wooden gears on a hillside."
          // Rendered width, not box width: the Figma crops scale the image well past the box
          // (mobile 1542/412 ≈ 375vw; desktop cover of the overscanned layer × 1.08 ≈ 141vw).
          sizes="(min-width: 768px) 141vw, 375vw"
          priority
          className="absolute inset-0 -z-10"
          innerClassName="max-md:top-[-1.267%] max-md:bottom-[-8.238%]"
          imageClassName="object-[26.46%_50%] md:object-center"
        />

        {/* Header (1:596 / 1:851). Mobile: 125px from the top. ≥768: centred in a 380/928 band at 24.5/928. */}
        <div
          ref={header}
          className="absolute inset-x-0 top-31.25 flex justify-center px-8 md:top-[2.64%] md:h-[40.95%] md:items-center"
        >
          <div className="flex flex-col items-center gap-5.5 text-center text-primary-white">
            <h1
              id="hero-title"
              data-reveal
              className="max-w-hero-title-m font-serif text-display md:max-w-none md:whitespace-nowrap"
            >
              Smarter IT, Stronger Systems
            </h1>
            {/* Figma fixes this box at 73.96px tall (3 lines @16 mobile, 2 lines @25 desktop + slack). */}
            <p
              data-reveal
              className="min-h-[4.6227em] max-w-hero-intro-m text-intro md:min-h-[2.9585em] md:max-w-hero-intro"
            >
              Our agentic platform cuts support load and lowers SAP TCO—so your COE can focus on progress, not
              problems.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
