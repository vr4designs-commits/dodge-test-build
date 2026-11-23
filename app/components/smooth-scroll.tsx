"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LENIS, MQ } from "@/app/lib/motion";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

type ScrollTarget = string | number | HTMLElement;

type SmoothScrollApi = {
  /** Scroll to a target, offset by the fixed navbar height. Works with or without Lenis. */
  scrollTo: (target: ScrollTarget, opts?: { immediate?: boolean }) => void;
  /** Pause scrolling (overlays, mobile menu). */
  stop: () => void;
  start: () => void;
};

const SmoothScrollContext = createContext<SmoothScrollApi | null>(null);

export function useSmoothScroll(): SmoothScrollApi {
  const ctx = useContext(SmoothScrollContext);
  if (!ctx) throw new Error("useSmoothScroll must be used inside <SmoothScroll>");
  return ctx;
}

/** Navbar height is read from the --nav-h CSS variable so it stays in sync with the layout. */
function navOffset(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--nav-h");
  const px = parseFloat(raw);
  return Number.isFinite(px) ? -px : 0;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [, setReady] = useState(false);
  const pathname = usePathname();

  // Create / destroy the single Lenis instance as the media query flips.
  useEffect(() => {
    // Tells the reveal failsafe in layout.tsx that the app booted.
    (window as Window & { __appReady?: boolean }).__appReady = true;
    const mq = window.matchMedia(MQ.smoothScroll);
    let tick: ((time: number) => void) | null = null;

    const teardown = () => {
      if (tick) gsap.ticker.remove(tick);
      tick = null;
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };

    const setup = () => {
      teardown();
      if (!mq.matches) {
        setReady(true);
        return;
      }
      const lenis = new Lenis({
        autoRaf: false,
        lerp: LENIS.lerp,
        wheelMultiplier: LENIS.wheelMultiplier,
      });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      lenisRef.current = lenis;
      setReady(true);
      ScrollTrigger.refresh();
    };

    setup();
    mq.addEventListener("change", setup);
    return () => {
      mq.removeEventListener("change", setup);
      teardown();
    };
  }, []);

  // Refresh trigger positions once fonts and above-the-fold images are in.
  useEffect(() => {
    let cancelled = false;
    const refresh = () => !cancelled && ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    if (document.readyState === "complete") refresh();
    else window.addEventListener("load", refresh, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", refresh);
    };
  }, []);

  // Route change: jump to top and recompute triggers.
  useEffect(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  }, [pathname]);

  const scrollTo = useCallback<SmoothScrollApi["scrollTo"]>((target, opts) => {
    const offset = navOffset();
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { offset, immediate: opts?.immediate });
      return;
    }
    // Native fallback (touch, mobile, reduced motion). No smooth behaviour by design.
    let y: number;
    if (typeof target === "number") y = target;
    else {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      if (!el) return;
      y = el.getBoundingClientRect().top + window.scrollY + offset;
    }
    window.scrollTo(0, y);
  }, []);

  const api = useMemo<SmoothScrollApi>(
    () => ({
      scrollTo,
      stop: () => lenisRef.current?.stop(),
      start: () => lenisRef.current?.start(),
    }),
    [scrollTo],
  );

  return <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>;
}
