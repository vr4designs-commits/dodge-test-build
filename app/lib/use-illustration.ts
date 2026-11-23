"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ILLO } from "@/app/lib/motion";
import { reachableStart } from "@/app/lib/scroll";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type Q = (selector: string) => Element[];

type Options = {
  /** Element whose top crossing ILLO.trigger.startPct starts playback (defaults to the scene). */
  triggerRef?: RefObject<Element | null>;
  /**
   * Panel mode (Approach accordion). Omit for scroll mode (Challenge rows).
   * true  = panel open and its expansion finished → play once in view; replay on every re-open.
   * false = panel closed → timeline paused and reset to the source artwork.
   */
  active?: boolean;
  /**
   * Panel mode: the panel has started opening but its expansion hasn't finished. The scene is put in
   * its start state so the panel reveals it pre-story instead of flashing the finished artwork.
   */
  primed?: boolean;
  /** Optional seamless loop (Analyse, Support). Must start and end at the source state. */
  buildLoop?: (q: Q) => gsap.core.Timeline;
  /**
   * Scroll mode only (Challenge rows, user request overriding §5 "play once"): restart the scene every time
   * the row comes into view and keep replaying it (story → ILLO.hold → story…) while it stays in view.
   * Paused when the row leaves view or the tab is hidden, so only on-screen scenes cost anything.
   */
  loopInView?: boolean;
};

/**
 * Shared playback for isometric illustrations (motionreference.md §5).
 * - One paused GSAP timeline per scene from `build`; hidden states are `from` tweens set here
 *   (never in CSS), so no-JS shows the source artwork.
 * - Reduced motion: nothing is built → original artwork.
 * - `[data-anim-mask]` / `[data-anim-only]` plumbing is armed only while animating, so every
 *   resting frame (settled, closed, paused) is the untouched source.
 * - Loops run only while active, on screen and the tab is visible, after STORY + ILLO.hold.
 * - Mobile (<768) plays at ILLO.mobileTimeScale.
 */
export function useIllustration(scope: RefObject<Element | null>, build: (q: Q, tl: gsap.core.Timeline) => void, opts: Options = {}) {
  const panelMode = opts.active !== undefined;
  const activeRef = useRef(opts.active ?? true);
  // Set inside the GSAP context; the effect below drives open/close.
  const ctl = useRef<{ open: () => void; close: () => void; prime: () => void } | null>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", mobile: "(max-width: 767px)" }, (ctx) => {
        const { motion, mobile } = ctx.conditions as Record<string, boolean>;
        if (!motion) return;
        const q = gsap.utils.selector(root) as Q;
        const masked = q("[data-anim-mask]");
        const animOnly = q("[data-anim-only]");
        const arm = () => {
          masked.forEach((el) => el.setAttribute("mask", el.getAttribute("data-anim-mask")!));
          animOnly.forEach((el) => el.setAttribute("visibility", "visible"));
        };
        const disarm = () => {
          masked.forEach((el) => el.removeAttribute("mask"));
          animOnly.forEach((el) => el.setAttribute("visibility", "hidden"));
        };
        const scale = mobile ? ILLO.mobileTimeScale : 1;

        // ----- loop gating
        const loop = opts.buildLoop?.(q).pause(0).timeScale(scale);
        let storyDone = false;
        let onScreen = false;
        let holdCall: gsap.core.Tween | null = null;
        const updateLoop = () => {
          if (!loop) return;
          const run = activeRef.current && storyDone && onScreen && !document.hidden;
          if (run && !loop.isActive()) {
            arm();
            loop.play();
          } else if (!run && (loop.isActive() || loop.progress() > 0)) {
            loop.pause(0);
            disarm();
          }
        };
        if (loop) {
          ScrollTrigger.create({ trigger: root, start: "top bottom", end: "bottom top", onToggle: (self) => { onScreen = self.isActive; updateLoop(); } });
          document.addEventListener("visibilitychange", updateLoop);
        }

        // ----- story
        const tl = opts.loopInView
          ? // Repeats forever with a hold between plays; masks stay armed while it runs (identical to source at rest).
            gsap.timeline({ paused: true, repeat: -1, repeatDelay: ILLO.hold })
          : gsap.timeline({
              paused: true,
              onComplete: () => {
                disarm();
                holdCall = gsap.delayedCall(ILLO.hold, () => { storyDone = true; updateLoop(); });
              },
            });
        arm();
        build(q, tl);
        tl.timeScale(scale);

        if (opts.loopInView) {
          let inView = false;
          const resume = () => { if (inView && !document.hidden) tl.resume(); else tl.pause(); };
          const restart = () => { inView = true; arm(); tl.restart(); resume(); };
          const leave = () => { inView = false; tl.pause(); };
          ScrollTrigger.create({
            trigger: opts.triggerRef?.current ?? root,
            start: reachableStart(ILLO.inView.startPct),
            end: `bottom ${ILLO.inView.endPct}%`,
            onEnter: restart,
            onEnterBack: restart,
            onLeave: leave,
            onLeaveBack: leave,
          });
          document.addEventListener("visibilitychange", resume);
          return () => {
            document.removeEventListener("visibilitychange", resume);
            disarm();
          };
        }

        const reset = () => {
          holdCall?.kill();
          storyDone = false;
          updateLoop();
          tl.pause();
          tl.progress(1);
          disarm();
        };
        const play = () => {
          holdCall?.kill();
          storyDone = false;
          updateLoop();
          arm();
          tl.restart();
        };
        if (!activeRef.current) reset();

        ScrollTrigger.create({
          trigger: opts.triggerRef?.current ?? root,
          start: reachableStart(ILLO.trigger.startPct),
          once: true,
          // Default-open scene (Approach panel 01) / scroll scenes: first play when scrolled into view.
          onEnter: () => {
            if (activeRef.current) play();
          },
        });

        const prime = () => {
          holdCall?.kill();
          storyDone = false;
          updateLoop();
          arm();
          tl.pause(0);
        };
        // A panel the user opens is on screen by definition, so it always plays. (It used to also wait for its
        // scroll trigger, but on touch devices a collapsed, zero-height panel's trigger may never fire, which left
        // scenes opened after another panel stuck in their start state.)
        ctl.current = { open: play, close: reset, prime };
        return () => {
          ctl.current = null;
          holdCall?.kill();
          document.removeEventListener("visibilitychange", updateLoop);
          disarm();
        };
      });
      return () => mm.revert();
    },
    { scope },
  );

  // Panel open/close (Approach). A re-open replays the scene; closing resets it to the source.
  useEffect(() => {
    if (!panelMode) return;
    const was = activeRef.current;
    activeRef.current = !!opts.active;
    if (opts.active && !was) ctl.current?.open();
    else if (!opts.active && opts.primed) ctl.current?.prime();
    else if (!opts.active && was) ctl.current?.close();
  }, [panelMode, opts.active, opts.primed]);
}
