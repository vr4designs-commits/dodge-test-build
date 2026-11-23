// Single source of truth for motion values. No magic numbers in components.

/** Media queries shared by Lenis and gsap.matchMedia(). */
export const MQ = {
  desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
  tablet:
    "(min-width: 768px) and (max-width: 1023px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 767px)",
  reduced: "(prefers-reduced-motion: reduce)",
  /** Lenis runs only here: large screen + fine pointer + motion allowed. */
  smoothScroll:
    "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
} as const;

export const LENIS = {
  lerp: 0.1,
  wheelMultiplier: 1,
} as const;

/** Parallax ranges in yPercent of the inner layer. Tune in review. */
export const PARALLAX = {
  hero: 12,
  card: 8,
  cta: 10,
  /** Tablet multiplies each range by this. */
  tabletFactor: 0.5,
  /** Hero image scale on scroll: from → 1. */
  heroScaleFrom: 1.08,
  /** Hero headline drift (yPercent of its own box) while the hero scrolls out — reads faster than the image. */
  heroHeadlineShift: -60,
} as const;

/**
 * Overscan the inner layer needs so its edges never show.
 * "through": moves -r → +r of its own height (both sides). "fromTop": 0 → +r (top only).
 */
export function parallaxOverscan(range: number, mode: "through" | "fromTop") {
  return mode === "through" ? range / (100 - 2 * range) : range / (100 - range);
}

export type ParallaxVariant = "hero" | "card" | "cta";

/** Text reveals and counters (CLAUDE.md "Other section motion"). */
export const REVEAL = {
  dur: 0.8,
  durMobile: 0.6,
  rise: 24,
  riseMobile: 12,
  stagger: 0.08,
  ease: "expo.out",
  /** Trigger line: element top at 85% of the viewport (via reachableStart). */
  startPct: 85,
} as const;

export const COUNT = {
  dur: 1.6,
  ease: "power2.out",
} as const;

/** Motion-owned (component state) transitions. */
export const UI = {
  fast: 0.2,
  base: 0.35,
  slow: 0.6,
  ease: [0.16, 1, 0.3, 1] as const,
  easeInOut: [0.4, 0, 0.2, 1] as const,
} as const;

/** Navbar + mobile menu (Motion-owned state transitions). */
export const NAV = {
  /** Navbar background / logo crossfade when it leaves the hero image. */
  themeDur: 0.3,
  menu: {
    overlayDur: 0.35,
    itemDur: 0.5,
    itemRise: 12,
    itemStagger: 0.05,
    itemDelay: 0.08,
  },
} as const;

/** Approach accordion (Motion-owned state change). Illustrations start after `dur` (motionreference §5). */
export const ACCORDION = {
  dur: 0.6,
  ease: UI.easeInOut,
  /** Desktop panel widths = Figma: open 568, collapsed 248, of the 1312 accordion. */
  widthOpen: `${(568 / 1312) * 100}%`,
  widthClosed: `${(248 / 1312) * 100}%`,
} as const;

/** Testimonial carousel (Motion-owned). Geometry from 1:741: side cards are the centre card at 0.8. */
export const CAROUSEL = {
  dur: 0.6,
  ease: UI.easeInOut,
  sideScale: 770.303 / 962.879,
  /** Centre-to-side distance as % of the card width: (962.88/2 + 124 gap + 770.3/2) / 962.88. */
  sideOffsetPct: ((962.879 / 2 + 124 + 770.303 / 2) / 962.879) * 100,
  /**
   * Mobile/tablet: the 0.8-scaled neighbour starts 38px past the 348px card's edge (user's choice).
   * That's wider than the 32px side margin on phones, so neighbours sit off-screen and slide in on change.
   */
  mobileOffsetPct: ((348 / 2 + 38 + (348 * (770.303 / 962.879)) / 2) / 348) * 100,
  /** Swipe: px or px/s needed to change slide. */
  swipeDistance: 60,
  swipeVelocity: 400,
} as const;

/** Green bar strip at the foot of the stats section (desktop-only scroll-linked rise). */
export const STRIP = {
  /** Bars start this far below their resting place (yPercent of their own height). */
  riseFrom: 100,
  stagger: 0.08,
  ease: "none",
  /** Rise runs from the strip top entering to the strip bottom entering. */
  startPct: 100,
  endPct: 100, // strip bottom reaches the viewport bottom = fully risen (reachable even at the page end)
} as const;

/** Isometric illustrations — values from motionreference.md §3. */
export const ILLO = {
  dur: { xs: 0.18, sm: 0.28, md: 0.45, lg: 0.8, xl: 1.1 },
  hold: 2.0,
  stagger: { sm: 0.06, md: 0.12, lg: 0.18 },
  ease: {
    settle: "expo.out",
    mech: "power2.inOut",
    draw: "power1.inOut",
    flow: "none",
  },
  dist: { rise: 16, lift: 40, nudge: 4 },
  loop: { flow: 3, quiet: 6 },
  mobileTimeScale: 1.2,
  /** motionreference §5: "top 70%" (~35% visible), via reachableStart. */
  trigger: { startPct: 70 },
  /**
   * Challenge rows (user request, overriding §5 "play once"): replay every time the row comes into view
   * and keep looping while it stays in view. In view = row top above 80% and bottom below 20% of the viewport.
   */
  inView: { startPct: 80, endPct: 20 },
} as const;

/** Footer bars — motionreference.md §8. */
export const FOOTER = {
  rise: { dur: 0.8, stagger: 0.05, ease: "expo.out", startPct: 95 },
  flow: { cycle: 10, opacity: 0.18, fadeIn: 1, ease: "none" },
  mobileTimeScale: 1.2,
} as const;
