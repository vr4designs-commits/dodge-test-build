"use client";

import { useRef, type CSSProperties } from "react";
import Image, { type ImageProps } from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MQ, PARALLAX, parallaxOverscan, type ParallaxVariant } from "@/app/lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type ParallaxImageProps = Omit<ImageProps, "fill" | "className" | "style"> & {
  variant: ParallaxVariant;
  /** Wrapper classes: position, size, radius. The wrapper never moves. Must set its own position. */
  className?: string;
  /** Extra classes for the inner layer, e.g. a mobile-only static crop. */
  innerClassName?: string;
  /** Classes for the <img>, e.g. object-position for the Figma crop. */
  imageClassName?: string;
  /**
   * "through" (default): image travels -range → +range while the wrapper crosses the viewport.
   * "fromTop": for above-the-fold images — starts at rest (0) on load, travels to +range as it scrolls out.
   */
  mode?: "through" | "fromTop";
  /** Also scale PARALLAX.heroScaleFrom → 1 over the same scroll (hero). */
  scale?: boolean;
  sizes: string;
};

/**
 * Shared parallax treatment for every content image (CLAUDE.md "Parallax on images").
 * Outer wrapper clips and never moves; inner layer is taller and moves on transform only.
 * Desktop: full range. Tablet: half. Mobile and reduced motion: static, no overscan.
 */
export function ParallaxImage({
  variant,
  className = "relative",
  innerClassName = "",
  imageClassName = "object-center",
  mode = "through",
  scale = false,
  alt,
  sizes,
  ...imageProps
}: ParallaxImageProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const range = PARALLAX[variant];
  const o = parallaxOverscan(range, mode) * 100;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const build = (r: number) => {
        const trigger =
          mode === "fromTop"
            ? { trigger: wrapper.current, start: "top top", end: "bottom top", scrub: true }
            : { trigger: wrapper.current, start: "top bottom", end: "bottom top", scrub: true };
        gsap.fromTo(
          inner.current,
          { yPercent: mode === "fromTop" ? 0 : -r, scale: scale ? PARALLAX.heroScaleFrom : 1 },
          { yPercent: r, scale: 1, ease: "none", scrollTrigger: trigger },
        );
      };
      mm.add(MQ.desktop, () => build(range));
      mm.add(MQ.tablet, () => build(range * PARALLAX.tabletFactor));
      // Mobile + reduced motion: nothing registered → static.
      return () => mm.revert();
    },
    { scope: wrapper, dependencies: [range, mode, scale] },
  );

  // Overscan only where parallax runs (≥768 + motion allowed); see .parallax-inner in globals.css.
  const vars = {
    "--px-top": `${-o}%`,
    "--px-bottom": mode === "fromTop" ? "0%" : `${-o}%`,
  } as CSSProperties;

  return (
    <div ref={wrapper} className={`overflow-hidden ${className}`}>
      <div ref={inner} style={vars} className={`parallax-inner absolute inset-0 ${innerClassName}`}>
        <Image {...imageProps} alt={alt} fill sizes={sizes} className={`object-cover ${imageClassName}`} />
      </div>
    </div>
  );
}
