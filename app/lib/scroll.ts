import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * ScrollTrigger `start` equivalent to "top <pct>%", but never later than the last reachable scroll
 * position. ScrollTrigger only fires once the scroll passes the start, and clamp() caps the start at
 * exactly maxScroll, which can't be passed. Capping at maxScroll - 1 lets elements near the page end
 * (last sections, footer) still play.
 */
export function reachableStart(viewportPct: number) {
  return (self: ScrollTrigger) => {
    const el = self.trigger as Element;
    const top = el.getBoundingClientRect().top + window.scrollY;
    return Math.min(top - (window.innerHeight * viewportPct) / 100, ScrollTrigger.maxScroll(window) - 1);
  };
}
