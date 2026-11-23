"use client";

import { useRef } from "react";
import Image from "next/image";
import { ParallaxImage } from "@/app/components/parallax-image";
import { useReveal } from "@/app/lib/use-reveal";

/**
 * The latest from Dodge (desktop 1:749, mobile 1:971). Bento grid from 1280; 2×2 of the mobile cards at 768–1279; single column below.
 * Desktop (≥1280, where the small cards stay ≥230px) keeps Figma's grid proportions (1310.8 × 513) so every card scales together; positions inside
 * cards are % of the card. Mobile uses the mobile frame's own coordinates (cards are a fixed 236px tall).
 * PLACEHOLDER copy ("Pariatur anim sit exercitation") as in Figma; cards have no link targets yet.
 */
export function Latest() {
  const section = useRef<HTMLElement>(null);
  useReveal(section);

  return (
    <section ref={section} id="latest" aria-labelledby="latest-title" className="mt-8 px-[1.985rem] pt-[2.0461rem] pb-[1.9656rem] lg:mt-14 lg:px-16 lg:py-14">
      {/* Capped at Figma's 1310.8px content width so the proportional bento doesn't balloon on wide screens. */}
      <div className="mx-auto max-w-[81.925rem]">
      <h2 id="latest-title" data-reveal className="font-serif text-row-title">
        The latest from Dodge
      </h2>

      <div className="mt-[2.0238rem] flex flex-col gap-[1.625rem] md:grid md:grid-cols-2 lg:mt-[4.525rem] xl:grid xl:aspect-[1310.81/513] xl:grid-cols-[758fr_537fr] xl:grid-rows-[235fr_17.3fr_260.18fr] xl:gap-x-4 xl:gap-y-0">
        {/* 1 — Dodge × P&G (1:753 / 1:974) */}
        <article data-reveal className="relative h-[14.7319rem] overflow-hidden rounded-image bg-grey-1 xl:row-span-3 xl:h-auto">
          <div className="absolute top-0 -left-[0.03%] h-[8.6875rem] w-[101.93%] overflow-hidden xl:-left-[0.02%] xl:h-[73.228%] xl:w-[101.994%]">
            <ParallaxImage
              variant="card"
              src="/images/latest-landscape.webp"
              alt=""
              sizes="(min-width: 1024px) 54vw, 100vw"
              className="absolute inset-0"
              // Figma crops: mobile frame shows source y 258–510 (41.6% down this crop), desktop is centred.
              imageClassName="object-[50%_41.6%] xl:object-center"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-primary-black/17" />
            <Image
              src="/icons/latest-lockup.svg"
              alt="Dodge × P&G"
              width={400.39}
              height={109.13}
              className="absolute top-1/2 left-1/2 h-auto w-[11.498rem] -translate-1/2 xl:w-[25.0244rem]"
            />
          </div>
          <p className="absolute top-[9.6rem] left-[0.76rem] text-lead xl:top-[79.2%] xl:left-[3.493%] xl:text-panel-title">
            Pariatur anim <br className="xl:hidden" />
            sit <br className="hidden xl:inline" />
            exercitation
          </p>
        </article>

        {/* 2 — P&G story (1:767 / 1:987) */}
        <article data-reveal className="relative h-[14.75rem] overflow-hidden rounded-image bg-grey-1 xl:h-auto">
          <ParallaxImage
            variant="card"
            src="/images/latest-pg-story.webp"
            alt="A man in a grey blazer speaking and gesturing"
            sizes="(min-width: 1024px) 19vw, 50vw"
            className="absolute -top-[0.1425rem] left-[49.672%] h-[15.1641rem] w-[50.624%] xl:top-0 xl:left-[50.247%] xl:h-[103.597%] xl:w-[50.069%]"
            // Figma crops: mobile shows source x 32.9–73.8%, desktop 22.9–84.8%.
            imageClassName="object-[55.6%_50%] xl:object-[58.1%_50%]"
          />
          <div className="absolute top-[1.1875rem] left-[0.9319rem] flex h-[12.75rem] w-[8.9375rem] flex-col justify-center gap-[0.6405rem] xl:top-[12.646%] xl:left-[4.391%] xl:h-[80.817%] xl:w-[48.64%] xl:gap-[0.99rem]">
            <Image src="/icons/logo-pg-small.svg" alt="P&G" width={50.26} height={21.87} className="h-auto w-[2.0317rem] xl:w-[3.141rem]" />
            <h3 className="text-lead xl:max-w-[12.049rem]">
              How P&amp;G built a <br className="hidden xl:inline" />
              self-aware supply chain with Dodge AI
            </h3>
          </div>
        </article>

        {/* 3 — Event (1:775 / 1:994) */}
        <article data-reveal className="relative h-[14.75rem] rounded-image bg-grey-1 xl:col-start-2 xl:row-start-3 xl:h-auto xl:w-[48.45%]">
          <div className="absolute top-[1.1694rem] left-[0.9319rem] flex h-[12.75rem] w-[19.625rem] max-w-[calc(100%-1.8rem)] flex-col justify-center gap-[0.6405rem] xl:top-[12.415%] xl:left-[9.724%] xl:h-auto xl:w-[81.484%] xl:justify-start xl:gap-[1.0673rem]">
            <h3 className="max-w-[13.8992rem] text-lead xl:max-w-none">
              Turning IT <br />
              Strategy into Business Outcome with Dodge
            </h3>
            <p className="text-body">
              November 14, 2025 <br className="hidden xl:inline" />
              15:00 CET
            </p>
          </div>
        </article>

        {/* 4 — Green (1:779 / 1:999). Decorative boxes; the card graphic stays static (not a photo). */}
        <article
          data-reveal
          className="relative h-[14.75rem] overflow-hidden rounded-image border-card-border xl:col-start-2 xl:row-start-3 xl:ml-auto xl:h-auto xl:w-[48.45%] xl:border"
        >
          <Image src="/images/latest-green-m.webp" alt="" fill unoptimized sizes="100vw" className="object-cover xl:hidden" />
          <Image src="/images/latest-green.webp" alt="" fill unoptimized sizes="20vw" className="hidden object-cover xl:block" />
          <div aria-hidden="true" className="xl:hidden">
            <Image src="/icons/latest-box-m-1.svg" alt="" width={44.53} height={40.1} className="absolute top-[9.2594rem] left-[6.4325rem]" />
            <Image src="/icons/latest-box-m-2.svg" alt="" width={95.07} height={85.92} className="absolute top-[8.8725rem] left-[8.0069rem]" />
            <Image src="/icons/latest-box-m-3.svg" alt="" width={305.99} height={275.57} className="absolute top-[2.585rem] left-[9.7488rem] max-w-none -rotate-[0.24deg]" />
          </div>
          <div aria-hidden="true" className="hidden xl:block">
            <Image src="/icons/latest-box-1.svg" alt="" width={55.01} height={49.55} className="absolute top-[46.346%] -left-[0.038%] h-[19.043%] w-[21.144%]" />
            <Image src="/icons/latest-box-2.svg" alt="" width={117.46} height={106.15} className="absolute top-[43.402%] left-[11.923%] h-[40.8%] w-[45.148%]" />
            <Image src="/icons/latest-box-3.svg" alt="" width={378.05} height={340.47} className="absolute -top-[4.378%] left-[25.16%] h-[130.862%] w-[145.307%] max-w-none -rotate-[0.24deg]" />
          </div>
          <p className="absolute top-[1.1694rem] left-[0.9319rem] w-[13.8992rem] text-lead text-primary-white xl:top-[9.659%] xl:left-[9.225%] xl:w-[78.21%]">
            Pariatur anim sit exercitation
          </p>
        </article>
      </div>
      </div>
    </section>
  );
}
