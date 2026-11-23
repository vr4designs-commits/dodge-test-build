import Image from "next/image";
import { FooterBars } from "@/app/components/footer-bars";

/**
 * Link groups. Desktop Figma (1:846) repeats "About Us / Solution / Case Studies" in all three columns
 * (placeholder); the mobile frame (1:1059) has the real set, so its groups fill the three columns.
 * PLACEHOLDER: social and legal links have no URLs yet.
 */
const GROUPS: { label: string; links: { text: string; href: string }[] }[] = [
  { label: "Site", links: [{ text: "About Us", href: "#challenge" }, { text: "Solution", href: "#approach" }, { text: "Case Studies", href: "#latest" }] },
  { label: "Social", links: [{ text: "Instagram", href: "#" }, { text: "Facebook", href: "#" }, { text: "X (Twitter)", href: "#" }, { text: "LinkedIn", href: "#" }] },
  { label: "Legal", links: [{ text: "Privacy Notice", href: "#" }, { text: "Terms & Conditions", href: "#" }] },
];

/**
 * Footer (desktop 1:846, mobile 1:1059). Logo symbol, copyright and link groups above a hairline,
 * then the stepped green bars running into the bottom edge (FooterBars, motionreference §8).
 * Mobile: logo/copyright, Site | Social side by side, Legal as its own row (Privacy | Terms).
 */
export function Footer() {
  return (
    <footer className="mt-8 bg-primary-white lg:mt-14">
      <div className="border-b-[0.025rem] border-grey-1 p-8 lg:px-16">
        {/* Figma fixes this block: 346px tall on mobile (I1:1059;2:8105), 95px on desktop (I1:846;2:8068). */}
        <div className="flex min-h-[21.625rem] flex-col gap-8 lg:h-[5.9375rem] lg:min-h-0 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex h-[3.6875rem] flex-col justify-between lg:h-auto lg:gap-[0.9375rem]">
            <Image src="/icons/logo-symbol.svg" alt="Hodge" width={31} height={37} className="h-[2.2294rem] w-[1.8679rem] lg:h-[2.9688rem] lg:w-[2.4873rem]" />
            <p className="text-eyebrow">©2025 Heimer labs pvt. ltd.</p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-[var(--container-footer-col)_auto] justify-between gap-x-4 gap-y-8 text-eyebrow lg:flex lg:gap-[3.8125rem]">
            {GROUPS.map((g, gi) => (
              <ul key={g.label} aria-label={g.label} className={`flex flex-col gap-4 lg:w-footer-col ${gi === 2 ? "col-span-2 flex-row justify-between lg:flex-col lg:justify-start" : ""}`}>
                {g.links.map((l) => (
                  <li key={l.text} className={gi === 2 ? "first:w-footer-col last:w-[5.7126rem] lg:w-auto!" : ""}>
                    <a href={l.href} className="-my-3.5 block py-3.5 lg:-my-1 lg:py-1">
                      {l.text}
                    </a>
                  </li>
                ))}
              </ul>
            ))}
          </nav>
        </div>
      </div>
      <div className="mt-[0.9375rem] lg:mt-[1.3438rem]">
        <FooterBars />
      </div>
    </footer>
  );
}
