"use client";

import { useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { motion, type PanInfo } from "motion/react";
import { ParallaxImage } from "@/app/components/parallax-image";
import { CAROUSEL } from "@/app/lib/motion";

type Testimonial = { quote: [string, string]; name: string; role: string; photo: string; logo: string; logoAlt: string };

/**
 * PLACEHOLDER: all three cards in Figma (1:742 / 1:745 / 1:748) are the same Alex Chen / P&G testimonial.
 * The quote keeps Figma's line break after the first sentence (desktop).
 */
const ALEX: Testimonial = {
  quote: [
    "Dodge instantly brought clarity and control to our complex CPG processes.",
    "The seamless implementation of their automation delivered flawless system performance, allowing our team to shift focus purely to strategic growth.",
  ],
  name: "Alex Chen",
  role: "VP of Financial Operations, GPB",
  photo: "/images/testimonial-alex-chen.webp",
  logo: "/icons/logo-pg.svg",
  logoAlt: "P&G",
};
const SLIDES: Testimonial[] = [ALEX, ALEX, ALEX];

const transition = { duration: CAROUSEL.dur, ease: CAROUSEL.ease };

/**
 * The track is endless: `pos` is a virtual position that only ever counts up or down, and the cards
 * rendered are the window pos−2 … pos+2 (keyed by virtual index, content = SLIDES[v mod n]).
 * Every card therefore always moves one step in the same direction as its neighbours — the card
 * leaving slides out past the edge and a fresh copy slides in from the other side, instead of one
 * card jumping across the whole track. ±2 are off-stage (transparent) staging slots.
 */
const WINDOW = [-2, -1, 0, 1, 2] as const;
const mod = (v: number, n: number) => ((v % n) + n) % n;

function Card({ t }: { t: Testimonial }) {
  return (
    <figure className="flex h-full flex-col gap-4 overflow-hidden rounded-image bg-primary-white p-4 text-primary-black lg:flex-row-reverse lg:items-center lg:justify-between lg:gap-0 lg:p-0 lg:pl-8">
      <ParallaxImage
        variant="card"
        src={t.photo}
        alt={t.name}
        sizes="(min-width: 1024px) 522px, calc(100vw - 6rem)"
        className="relative aspect-square w-full shrink-0 rounded-icon lg:h-full lg:w-auto lg:rounded-none"
      />
      <div className="flex flex-col lg:w-quote-col lg:justify-center lg:gap-9">
        <Image src={t.logo} alt={t.logoAlt} width={65.55} height={28.52} className="hidden lg:block" />
        {/* Mobile text block: at least Figma's 319px, quote top / name bottom (1:970); desktop stacks with a 64px gap */}
        <div className="flex min-h-[19.9375rem] flex-col justify-between gap-12 lg:min-h-0 lg:justify-start lg:gap-16">
          <blockquote className="flex flex-col lg:gap-[0.47rem]">
            <span aria-hidden="true" className="font-serif text-quote-mark lg:hidden">
              ”
            </span>
            <Image src="/icons/quote-mark.svg" alt="" aria-hidden="true" width={12.63} height={9.86} className="hidden lg:block" />
            <p className="font-serif text-h5 tracking-[-0.02em] lg:max-w-quote">
              {t.quote[0]} <br className="hidden lg:inline" />
              {t.quote[1]}
            </p>
          </blockquote>
          <figcaption className="flex flex-col gap-4">
            <span className="text-lead font-bold">{t.name}</span>
            <span className="text-body">{t.role}</span>
          </figcaption>
        </div>
      </div>
    </figure>
  );
}

/**
 * Prev/next button: 44px hit area around Figma's 36px white circle (1:743 / 1:746).
 * "side": desktop, beside the centre card. "below": mobile/tablet, in a row under the card (user request).
 */
function ArrowButton({ dir, onClick, placement }: { dir: "prev" | "next"; onClick: () => void; placement: "side" | "below" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous testimonial" : "Next testimonial"}
      className={
        placement === "side"
          ? "absolute top-1/2 z-20 hidden size-11 -translate-y-1/2 place-items-center lg:grid"
          : "grid size-11 place-items-center lg:hidden"
      }
      style={placement === "below" ? undefined : dir === "prev" ? { right: "calc(50% + var(--card-w) / 2 + 0.4rem)" } : { left: "calc(50% + var(--card-w) / 2 + 0.4rem)" }}
    >
      <span className="grid size-9 place-items-center rounded-full bg-white">
        <Image src="/icons/arrow.svg" alt="" width={24} height={24} className={dir === "prev" ? "rotate-180" : ""} />
      </span>
    </button>
  );
}

/**
 * Testimonial carousel (1:741 desktop, 1:970 mobile). Motion owns the slide state change.
 * Desktop: centre card with scaled peeks either side and prev/next buttons beside it.
 * Mobile/tablet (user request, beyond the Figma mobile frame): the same scaled peeks at the screen edges,
 * prev/next buttons in a row below the card, and swipe. No autoplay. Left/Right keys work when focused.
 *
 * Direction (user request): the right arrow moves the cards left → right (the left card slides into
 * the centre); the left arrow moves them right → left. A swipe moves the cards with the finger.
 */
export function TestimonialCarousel() {
  const [pos, setPos] = useState(0);
  const n = SLIDES.length;
  const active = mod(pos, n);
  /** Shift every card one slot to the right (+1) or left (−1). */
  const shift = (dir: 1 | -1) => setPos((p) => p - dir);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x < -CAROUSEL.swipeDistance || velocity.x < -CAROUSEL.swipeVelocity) shift(-1);
    else if (offset.x > CAROUSEL.swipeDistance || velocity.x > CAROUSEL.swipeVelocity) shift(1);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") shift(1);
    if (e.key === "ArrowLeft") shift(-1);
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Testimonials"
      tabIndex={0}
      onKeyDown={onKeyDown}
      // Below lg the stacked card keeps Figma's mobile width (348) so tablets don't get a 700px-tall card.
      className="relative mt-8 [--card-w:100%] focus-visible:outline-primary-white max-lg:mx-auto max-lg:max-w-[21.75rem] lg:mt-[3.8838rem] lg:h-[32.5881rem] lg:[--card-w:min(60.18rem,calc(100vw-8rem))]"
    >
      {/* Peeks show on every breakpoint; the section clips them at the viewport edge. */}
      <div className="relative grid lg:h-full">
        {WINDOW.map((d) => {
          const v = pos + d; // virtual index: stable key while the card travels
          const i = mod(v, n);
          const t = SLIDES[i];
          const isActive = d === 0;
          return (
            <motion.div
              key={v}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}`}
              aria-hidden={!isActive}
              inert={!isActive}
              initial={false}
              animate={{
                // Peeks at ±offset, scaled 0.8: desktop uses Figma's spacing, mobile a tighter one (see CAROUSEL).
                "--slide-x": `${d * CAROUSEL.sideOffsetPct}%`,
                "--slide-x-m": `${d * CAROUSEL.mobileOffsetPct}%`,
                "--slide-s": isActive ? 1 : CAROUSEL.sideScale,
                // Staging slots (±2) are off-stage and transparent; cards fade as they leave / arrive.
                opacity: Math.abs(d) > 1 ? 0 : 1,
              } as never}
              transition={transition}
              drag={isActive ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={onDragEnd}
              className={`col-start-1 row-start-1 translate-x-(--slide-x-m) scale-(--slide-s) touch-pan-y lg:absolute lg:top-0 lg:left-1/2 lg:h-full lg:w-(--card-w) lg:translate-x-[calc(-50%+var(--slide-x))] ${
                isActive ? "z-10" : Math.abs(d) === 1 ? "z-5" : "z-0"
              }`}
            >
              <Card t={t} />
            </motion.div>
          );
        })}
      </div>
      <ArrowButton dir="prev" placement="side" onClick={() => shift(-1)} />
      <ArrowButton dir="next" placement="side" onClick={() => shift(1)} />
      {/* Mobile/tablet: centred row under the card (16px below, 16px apart). Same direction logic as desktop. */}
      <div className="mt-4 flex justify-center gap-4 lg:hidden">
        <ArrowButton dir="prev" placement="below" onClick={() => shift(-1)} />
        <ArrowButton dir="next" placement="below" onClick={() => shift(1)} />
      </div>
      <p className="sr-only" aria-live="polite">{`Testimonial ${active + 1} of ${n}`}</p>
    </div>
  );
}
