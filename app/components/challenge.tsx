"use client";

import { useRef, type ComponentType, type ReactNode, type RefObject } from "react";
import { Graph } from "@/app/components/illustrations/graph";
import { Compass } from "@/app/components/illustrations/compass";
import { World } from "@/app/components/illustrations/world";
import { useReveal } from "@/app/lib/use-reveal";
import { ILLO } from "@/app/lib/motion";

type IlloProps = { triggerRef?: RefObject<Element | null>; className?: string };

/**
 * Rows (order + copy confirmed with the user: desktop order, copy matched to each illustration).
 * `place` positions the 212-unit export inside the 206px desktop slot exactly as the Figma
 * instances do (scale + offset from the instance frames); mobile tiles are the export at 104px.
 */
const ROWS: { Illo: ComponentType<IlloProps>; place: string; title: ReactNode; body: string }[] = [
  {
    Illo: Graph,
    place: "lg:-left-[2.533%] lg:-top-[2.942%] lg:size-[105.57%]",
    title: (
      <>
        The Necessary Investment <br />
        That Becomes a Pit of Problems
      </>
    ),
    body: "ERP spend feels justified, but ROI stalls because teams get trapped in day-to-day support instead of driving improvement.",
  },
  {
    Illo: Compass,
    place: "lg:-left-[3.179%] lg:-top-[3.319%] lg:size-[106.72%]",
    title: (
      <>
        A Constant Cat-and-Mouse <br />
        With Your Partner
      </>
    ),
    body: "Business, IT, and your SI all point in different directions—no clear owner, no clear root cause, and issues linger.",
  },
  {
    // PLACEHOLDER copy (repeated in Figma) — flagged in review.
    Illo: World,
    place: "lg:-left-[2.026%] lg:-top-[3.439%] lg:size-[107.08%]",
    title: (
      <>
        A Constant Cat-and-Mouse <br />
        With Your Partner
      </>
    ),
    body: "Business, IT, and your SI all point in different directions—no clear owner, no clear root cause, and issues linger.",
  },
];

function ChallengeRow({ Illo, place, title, body }: (typeof ROWS)[number]) {
  const row = useRef<HTMLLIElement>(null);
  // Row text and illustration share one trigger so the heading leads the hero beat by ~150ms.
  useReveal(row, { startPct: ILLO.trigger.startPct });

  return (
    <li ref={row} className="flex flex-col lg:min-h-66.5 lg:flex-row lg:items-center">
      <div className="relative size-26 shrink-0 lg:size-51.5">
        <Illo triggerRef={row} className={`absolute inset-0 ${place}`} />
      </div>
      <div className="mt-3.5 flex flex-col gap-4 py-4 lg:mt-0 lg:ml-8 lg:max-w-row-text lg:gap-6 lg:px-8 lg:py-0">
        {/* Figma's explicit line breaks; lines may wrap further below 1440 so narrow desktops don't overflow. */}
        <h3 data-reveal className="font-serif text-row-title min-[90rem]:whitespace-nowrap">
          {title}
        </h3>
        <p data-reveal className="text-intro lg:max-w-row-body">
          {body}
        </p>
      </div>
    </li>
  );
}

/**
 * The Challenge (desktop 1:606, mobile 1:860).
 * Mobile/tablet: header stacked above the rows, faint side rules. The exports' white frame fill is hidden at all sizes (user request).
 * Desktop: header in a 415.75/1440 left column, vertical divider running up to the hero image.
 */
export function Challenge() {
  const head = useRef<HTMLDivElement>(null);
  useReveal(head);

  return (
    <section
      id="challenge"
      aria-labelledby="challenge-title"
      className="relative mt-8 px-8 pt-11.25 pb-15.5 lg:mt-14 lg:grid lg:grid-cols-[28.872%_1fr] lg:p-0"
    >
      {/* Mobile side rules (1:870 / 1:869): extend 31px above and 32px below the section */}
      <span aria-hidden="true" className="absolute -top-7.75 -bottom-8 left-[1.115rem] w-px bg-rule-light lg:hidden" />
      <span aria-hidden="true" className="absolute -top-7.75 -bottom-8 right-[1.2319rem] w-px bg-rule-light lg:hidden" />
      {/* Desktop divider (1:614): from the hero image's bottom edge (88px up) to the section end */}
      <span aria-hidden="true" className="absolute -top-22 bottom-0 left-[28.872%] hidden w-px bg-grey-2 lg:block" />

      {/* Mobile header frame is a fixed 72px tall (1:863) */}
      <div ref={head} className="min-h-18 lg:min-h-0 lg:pt-29.25 lg:pl-[3.9619rem]">
        <p
          data-reveal
          className="flex h-(--container-eyebrow-box) items-end text-eyebrow font-bold text-grey-2 uppercase lg:font-normal"
        >
          Problem
        </p>
        <h2 id="challenge-title" data-reveal className="mt-2.5 font-serif text-section-title">
          The Challenge
        </h2>
      </div>

      <ul className="mt-16 flex flex-col gap-16 lg:mt-0 lg:gap-23 lg:pt-5 lg:pb-17.5 lg:pl-[5.7844rem]">
        {ROWS.map((row, i) => (
          <ChallengeRow key={i} {...row} />
        ))}
      </ul>
    </section>
  );
}
