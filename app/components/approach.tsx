"use client";

import { useEffect, useId, useRef, useState, type ComponentType, type CSSProperties, type RefObject } from "react";
import { motion, type TargetAndTransition } from "motion/react";
import { Assessment } from "@/app/components/illustrations/assessment";
import { Analyse } from "@/app/components/illustrations/analyse";
import { Configure } from "@/app/components/illustrations/configure";
import { Support } from "@/app/components/illustrations/support";
import { useReveal } from "@/app/lib/use-reveal";
import { ACCORDION } from "@/app/lib/motion";

type IlloProps = { active: boolean; primed?: boolean; triggerRef?: RefObject<Element | null>; className?: string };

/**
 * Copy from the desktop states (1189:3381 / 1190:3967 / 1190:4310 / 1190:4734). The mobile frame's
 * placeholders ("Analyze 01" ×4) are replaced with the real titles and copy (confirmed with the user).
 */
const PANELS: { n: string; title: string; body: string; Illo: ComponentType<IlloProps> }[] = [
  { n: "01", title: "System Assessment", body: "Our retrieval LM conducts a health scan to understand your WRICEFs,custom objects,ticket patterns and more to pinpoint the bottleneck slowing you down.", Illo: Assessment },
  { n: "02", title: "Analyze", body: "Our agents are built to do continuous problem management to surface recurring issues before they impact the business.", Illo: Analyse },
  { n: "03", title: "Configure", body: "Clear, prioritized reconfiguration roadmap that fixes misaligned setups and moves your COE one step closer to a zero inbox world.", Illo: Configure },
  { n: "04", title: "Support", body: "Automate L1/L2 support through agents integrated with Teams/Slack—cutting resolution times and reducing your consulting hours.", Illo: Support },
];

const transition = { duration: ACCORDION.dur, ease: ACCORDION.ease };

/**
 * Approach (desktop 1:615 + states 1189:3381…; mobile 1:871 + states 1190:5223…).
 * One accordion, one panel open at a time, opened by click / Enter / Space (no hover trigger,
 * per motionreference §5). Desktop: horizontal panels whose widths animate. Mobile/tablet:
 * vertical rows whose bodies animate height. A panel's illustration plays once its expansion ends.
 */
export function Approach() {
  const head = useRef<HTMLDivElement>(null);
  const accordion = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(0);
  const [settled, setSettled] = useState(0);
  const baseId = useId();
  useReveal(head);

  const choose = (i: number) => {
    if (i === open) return;
    setSettled(-1);
    setOpen(i);
  };

  // The panel's height animation normally reports completion (onAnimationComplete below), but on touch
  // devices that event can be skipped when one panel closes as another opens — leaving the scene stuck in
  // its primed state. Fallback: treat the panel as settled once the expansion duration has elapsed.
  useEffect(() => {
    if (settled === open) return;
    const t = window.setTimeout(() => setSettled(open), ACCORDION.dur * 1000 + 50);
    return () => window.clearTimeout(t);
  }, [open, settled]);

  return (
    <section id="approach" aria-labelledby="approach-title" className="mt-8 px-8 pt-[2.0313rem] lg:mt-14 lg:px-16 lg:pt-8 lg:pb-8">
      <div ref={head} className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:gap-0">
        <p
          data-reveal
          className="text-eyebrow font-bold text-grey-2 uppercase lg:flex lg:h-(--container-eyebrow-box) lg:w-approach-label lg:items-end lg:text-grey-3"
        >
          Approach
        </p>
        <h2 id="approach-title" data-reveal className="font-serif text-row-title lg:max-w-approach-title">
          From Accelerating IT to Streamlining <br className="hidden lg:inline" />
          Governance - We help you spot and solve problems, giving you a chance to unlock the Real ROI of your ERP
          without the bureaucracy
        </h2>
      </div>

      <div
        ref={accordion}
        className="@container mt-8 overflow-hidden rounded-image border border-grey-2 bg-white lg:mt-16 lg:flex lg:h-146.5"
      >
        {PANELS.map(({ n, title, body, Illo }, i) => {
          const isOpen = open === i;
          const headerId = `${baseId}-h${i}`;
          const regionId = `${baseId}-r${i}`;
          return (
            <motion.div
              key={n}
              initial={false}
              // Width lives in a CSS var so it only applies on desktop (lg:w-(--panel-w)); mobile rows stay full width.
              style={{ "--panel-w": isOpen ? ACCORDION.widthOpen : ACCORDION.widthClosed } as CSSProperties}
              animate={{ "--panel-w": isOpen ? ACCORDION.widthOpen : ACCORDION.widthClosed } as TargetAndTransition}
              transition={transition}
              className={`relative flex flex-col border-grey-2 not-first:border-t lg:w-(--panel-w) lg:shrink-0 lg:border-t-0 lg:border-r lg:px-6 lg:py-6.5 lg:last:border-r-0 ${
                // Open border is drawn inside the box (Figma inside stroke), so it doesn't eat the 520px content width.
                isOpen ? "pb-12 lg:border-r-0 lg:bg-primary-white lg:shadow-[inset_0_0_0_1px_var(--color-panel-border)]" : "bg-white"
              }`}
            >
              <h3>
                <button
                  id={headerId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={regionId}
                  onClick={() => choose(i)}
                  className={`flex w-full text-left font-bold text-primary-black lg:items-start lg:text-panel-title lg:after:absolute lg:after:inset-0 lg:after:content-[''] ${
                    isOpen ? "flex-col px-4 pt-4 lg:p-0 lg:after:hidden" : "h-18 items-center justify-between px-4 lg:h-auto lg:min-h-16 lg:p-0"
                  } ${isOpen ? "cursor-default" : "cursor-pointer"}`}
                >
                  <span className={isOpen ? "order-2" : ""}>{title}</span>
                  {/* Mobile number: right of the title when closed, above it when open */}
                  <span aria-hidden="true" className={`text-grey-2 lg:hidden ${isOpen ? "order-1 self-end" : ""}`}>
                    {n}
                  </span>
                </button>
              </h3>

              <motion.div
                id={regionId}
                role="region"
                aria-labelledby={headerId}
                aria-hidden={!isOpen}
                inert={!isOpen}
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={transition}
                onAnimationComplete={() => isOpen && setSettled(i)}
                // Desktop: the open region fills the space left in the fixed-height panel, so the illustration
                // can scale down to fit on wide screens instead of being cropped.
                className={`overflow-hidden ${isOpen ? "lg:min-h-0 lg:flex-1" : ""}`}
              >
                {/* Fixed to the open width (568/1312 of the accordion − padding) so text never reflows mid-animation */}
                <div className="flex flex-col gap-4 px-4 pt-2.75 lg:h-full lg:w-[calc(43.293cqi-3rem)] lg:gap-5 lg:px-0 lg:pt-2.5">
                  <p className="text-body lg:text-lead">{body}</p>
                  {/* Mobile: fixed 316:214 slot. Desktop: up to 520:320, shrinking to fit the panel height (svg keeps its ratio, top-aligned). */}
                  <div className="relative aspect-316/214 overflow-hidden lg:aspect-auto lg:max-h-[calc((43.293cqi-3rem)*320/520)] lg:min-h-0 lg:flex-1 lg:bg-primary-white">
                    <Illo
                      active={isOpen && settled === i}
                      primed={isOpen && settled !== i}
                      triggerRef={accordion}
                      className="absolute inset-x-0 top-[4.57%] aspect-520/320 lg:inset-0 lg:aspect-auto"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Desktop number at the panel's foot */}
              <span
                aria-hidden="true"
                className={`mt-auto hidden font-medium text-numeral lg:block ${isOpen ? "leading-12 tracking-normal text-digit-open" : "text-digit"}`}
              >
                {n}
              </span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
