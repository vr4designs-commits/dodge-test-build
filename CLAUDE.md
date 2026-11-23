# CLAUDE.md — Dodge website build

Marketing site for **Dodge**, an agentic platform that cuts SAP support load
and TCO for CPG enterprises. One long landing page, built section by
section from Figma.

**The core of this build is feel:** smooth inertia scrolling on desktop, and
a parallax effect on every image as it scrolls through the viewport. Get
those two right before polishing anything else.

---

## Design source

Figma: https://www.figma.com/design/GRp4QlPYAfVSnL9m6KOxz6/Dodge-Website?node-id=0-1
(page "Website design", node `0:1`)

- Figma is the source of truth for spacing, color, type and layout. Pull
  exact values per section with the Figma MCP (`get_design_context`,
  `get_variable_defs`, `get_screenshot`). Never estimate. If a value
  can't be read, ask.
- Desktop frame is 1440 wide (`1:592`). Mobile frame is 412 wide
  (`1:847`), plus a mobile menu (`1:1060`). Build mobile from the mobile
  frame, not by shrinking desktop.
- The Figma file is reachable through the **Figma desktop app MCP** (the
  file must be open in the desktop app). The cloud Figma account in use
  does not have access to this file.

### Section map

| # | Section | Desktop node | Mobile node | Notes |
|---|---------|--------------|-------------|-------|
| 1 | Navbar | `1:2058` | navbar instance in `1:848`, menu `1:1060` | Logo, About Us / Solution / Case Studies, Login, primary button |
| 2 | Hero | `1:593` | `1:848` | Rounded full-width illustrated landscape + serif headline. **Parallax image** |
| 3 | The Challenge | `1:606` | `1:860` | Left label + title, vertical divider, 3 rows each with an **isometric illustration** (Graph `7:2082`, Compass `7:2383`, World `7:2493`) |
| 4 | Approach | `1:615` | `1:871` | Serif intro + 4-panel accordion (System Assessment, Analyze, Configure, Support). Expanded states in `2:932`. Each panel has an **isometric illustration** (Assessment `7:1763`, Analyse `7:1588`, Configure `6:1332`, Support `6:1234`) |
| 5 | Stats + testimonials | `1:723` | `1:958` | Dark. 3 stats, testimonial carousel with prev/next, green gradient bar strip at the bottom. **Parallax on testimonial photo** |
| 6 | The latest from Dodge | `1:749` | `1:971` | Bento grid of 4 cards. **Parallax on card images** |
| 7 | Compliance | `1:793` | inside `1:1013` | Dark. SOC 2 + GDPR badges, dashed strip below |
| 8 | CTA | `1:844` | `CTA Mobile` in `1:1013` | Rounded landscape image card + button. **Parallax image** |
| 9 | Footer | `1:846` | `1:1059` | Links + stepped green bar graphic |

Copy is placeholder in places ("Pariatur anim sit exercitation", repeated
"50K+", repeated Challenge copy, buttons labelled "Button"). Build it as
it appears in Figma and list the placeholders in the review notes. Don't
invent copy.

---

## Workflow: one section at a time

1. Build the section: static layout first (mobile, then up to desktop),
   matching Figma, then its motion.
2. Run the checks in **Definition of done** and fix any failures.
3. Stop. Report what was built, show the proof, and list anything that
   was ambiguous or needed a judgment call.
4. Wait for "looks good, move on" or "fix X" before starting the next
   section. Never batch sections.

Order: global setup (fonts, tokens, Lenis provider, layout) → sections
1 to 9 in the order above.

---

## Tech stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS v4**: tokens in the `@theme` block of `app/globals.css`.
  No `tailwind.config` file.
- **GSAP + ScrollTrigger** (with `@gsap/react` → `useGSAP`): all
  scroll-linked motion (parallax, reveals, any pin or scrub)
- **Lenis**: smooth scrolling on desktop
- **Motion** (formerly Framer Motion; `import { motion } from "motion/react"`):
  component state only (hover, tap, accordion open/close, carousel
  slide, mobile menu)
- **next/font** for fonts, **next/image** for images
- Deploy: **Vercel**, auto-deploy from `main`

```
npm install gsap @gsap/react lenis motion
```

GSAP is fully free, including all of its plugins. We use **Lenis instead
of ScrollSmoother**, so never run both. Ask before adding any other
animation or UI library.

### Who owns what

- GSAP owns everything driven by scroll position.
- Motion owns state changes (hover, tap, mount, layout, presence).
- Never animate the same element with both.
- Don't use Motion's `useScroll`, `useTransform`-on-scroll or
  `whileInView`. Scroll-driven motion goes through GSAP.

---

## Smooth scroll (Lenis)

Set it up in exactly one place: a `"use client"` provider in the root
layout (`app/components/smooth-scroll.tsx`).

```ts
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ autoRaf: false, lerp: LENIS.lerp });
lenis.on("scroll", ScrollTrigger.update);
const tick = (time: number) => lenis.raf(time * 1000);
gsap.ticker.add(tick);
gsap.ticker.lagSmoothing(0);
// cleanup: gsap.ticker.remove(tick); lenis.destroy();
```

- Only create Lenis when `(min-width: 1024px) and (pointer: fine)`
  matches **and** reduced motion is not requested. Everywhere else, use
  native scroll.
- Import `lenis/dist/lenis.css`. Don't set `scroll-behavior: smooth`
  anywhere.
- Anchor and nav links use `lenis.scrollTo(target, { offset: -navHeight })`.
- Any inner scrolling element gets `data-lenis-prevent`. Call
  `lenis.stop()` while the mobile menu or any overlay is open, and
  `lenis.start()` when it closes.
- On route change, jump to top (`lenis.scrollTo(0, { immediate: true })`)
  and call `ScrollTrigger.refresh()`.
- Call `ScrollTrigger.refresh()` once fonts (`document.fonts.ready`) and
  above-the-fold images have loaded, so trigger positions are correct.
- Set `ScrollTrigger.config({ ignoreMobileResize: true })`.

---

## Parallax on images (core effect)

Every content image (hero, testimonial photo, "latest" cards, CTA) gets
the same parallax treatment through one shared component,
`app/components/parallax-image.tsx`. Don't re-implement it per section.

How it works:

- **Outer wrapper**: holds the size, rounded corners and
  `overflow: hidden`. The wrapper never moves.
- **Inner layer**: holds the `next/image` (`fill`, `object-cover`). It's
  taller than the wrapper (e.g. `inset: -10% 0`, so ~120% height) so its
  edges never show while it moves.
- The inner layer moves on `yPercent` from `-range` to `+range` across the
  wrapper's time in the viewport:

```ts
gsap.fromTo(inner, { yPercent: -range }, {
  yPercent: range,
  ease: "none",
  scrollTrigger: { trigger: wrapper, start: "top bottom", end: "bottom top", scrub: true },
});
```

- Ranges come from `PARALLAX` in `app/lib/motion.ts`, never from raw
  numbers in components. Start with: `hero: 12`, `card: 8`, `cta: 10`.
  Tune these in review.
- Hero: the image also scales from `1.08` to `1` as the page scrolls past,
  and the headline drifts up slightly faster than the image so there's
  separation between layers.
- Only animate `transform`. Never `top`, `background-position` or
  `height`. Put `will-change: transform` on the inner layer only.
- Wrap all of it in `gsap.matchMedia()`:
  - Desktop (≥1024px, no reduced motion): full range.
  - Tablet (768–1023px): half range.
  - Mobile (<768px): no parallax. Images are static.
  - Reduced motion: no parallax. Images are static and centred.

---

## Isometric illustrations

The Challenge (Graph, Compass, World) and Approach (Assessment, Analyse,
Configure, Support) sections use isometric line illustrations.

**Whenever you animate an isometric illustration, read
`motionreference.md` first and follow it exactly.** It holds the motion
spec for these illustrations. Don't improvise timing, easing or
choreography for them. If something isn't covered there, ask.

Key points (details in motionreference.md):

- Export each illustration from Figma as SVG via the MCP, and keep the
  untouched export in `app/components/illustrations/_source/`. Never
  redraw, restyle or edit the artwork. Only add motion.
- Challenge illustrations play once on scroll-in. Approach illustrations
  play when their accordion panel opens.
- Illustrations are **never** wrapped in `ParallaxImage`. The camera stays
  fixed.
- They're decorative, so the SVG gets `aria-hidden="true"`. The text
  next to them carries the meaning.
- Reduced motion and no-JS show the original artwork unchanged.

---

## Other section motion (defaults; confirm in review)

- Text reveals: headings and paragraphs fade and rise slightly on entering
  the viewport (GSAP + ScrollTrigger, play once, no scrub).
- Stats: numbers count up once on entering the viewport.
- Approach accordion: see **Approach accordion interaction** below.
- Testimonial carousel: Motion for slide transitions, prev/next buttons,
  swipe on touch. No autoplay unless asked.
- Footer bars: rise left→right, then a subtle gradient flow. Spec in
  **motionreference.md §8**.
- Green bar strip and dashed strip: gentle scroll-linked rise or
  stagger, desktop only.

### Approach accordion interaction (section 4)

Click to open. **Exactly one panel is open at a time.** Reference: the four
states in Figma `2:932` (01 open, 02 open, 03 open, 04 open).

- **Default:** panel 01 **System Assessment** is open on load. The others
  are collapsed, showing only their title and number.
- **Click a collapsed panel** → it expands, and the panel that was open
  collapses **at the same time**, in one smooth width change. The row's
  total width never changes. Only the split between panels moves.
- **Click the open panel** → nothing happens. It stays open, because one
  panel must always be open.
- **Click only.** No hover-to-open. Hover just shows a subtle cursor or
  affordance change on collapsed panels (exact styling from Figma; ask
  if it isn't specified).
- **Order inside the opening panel:** the width expands first, then the
  description fades in, then the illustration plays its scene (see
  motionreference.md). The closing panel's description and illustration
  fade out immediately, before its width shrinks, so text never squashes
  or reflows during the resize. Its illustration timeline resets to the
  source state while hidden.
- **Build:** one `activeIndex` state (default `0`). Width changes use
  Motion `layout` (or a `flex-grow` transition) with a shared duration and
  easing from `app/lib/motion.ts`. Use the expanded and collapsed widths
  from the Figma states. The number (01–04) stays pinned to the bottom of
  each panel throughout.
- **Accessibility:** each panel header is a `<button>` with
  `aria-expanded` and `aria-controls`. The panel body has `role="region"`
  and `aria-labelledby`. Enter/Space opens a panel. Tab moves through the
  headers. Collapsed bodies are hidden from screen readers (`hidden` or
  `inert`), not just visually clipped.
- **Mobile (<768px):** a vertical accordion following the mobile frame
  `1:871`. Same rules apply: System Assessment open by default, tap to
  open, and opening one closes the other. Height animates instead of
  width. After opening, if the new panel's header is above the viewport,
  scroll it into view.
- **Tablet:** use the desktop horizontal version if the open panel's text
  and illustration fit without wrapping awkwardly. Otherwise use the
  mobile vertical one. Flag the choice in review.
- **Reduced motion:** panels switch instantly, or with a ≤150ms crossfade.
  No width or height animation, and illustrations show their resting
  frame.

Every effect needs a reduced-motion fallback that shows the final state.
Don't just switch the effect off and leave content hidden.

---

## Tokens and code conventions

- Colors, type scale, spacing and radii: in `@theme` in
  `app/globals.css`, pulled from Figma variables. No raw hex or px values
  in components.
- Motion values (durations, easings, `LENIS`, `PARALLAX`): in
  `app/lib/motion.ts`. No magic numbers in components, and no
  browser-default `ease`.
- Fonts: the Figma file pairs a serif (headings, quotes) with a sans
  (UI, body). Read the exact families from Figma and load them with
  `next/font`. If a font isn't on Google Fonts, ask for the files.
- Fluid type with `clamp()` between the 412 and 1440 frames.
- Breakpoints: mobile <768, tablet 768–1023, desktop ≥1024. Write
  mobile-first.
- Components in `app/components/`, one per file. File names in
  kebab-case, component names in PascalCase.

## Responsive design

Mobile is its own layout pass for every section, not desktop shrunk down.

- **Breakpoints:** mobile <768, tablet 768–1023, desktop ≥1024. Write
  base styles for mobile, then layer up with `min-width` queries.
- **Mobile follows the mobile frame** (`1:847`) for stacking order,
  spacing and type. Tablet has no Figma frame: interpolate between the
  two and flag the result for review. If a section has no mobile
  equivalent, ask how it should reflow. Don't guess.
- **Known mobile reflows from Figma:**
  - Navbar collapses to a logo plus a menu toggle that opens the
    full-screen menu (`1:1060`).
  - The Challenge's left column and divider stack above the rows.
  - The Approach accordion becomes a vertical tap accordion.
  - Stats stack vertically. The carousel shows one card at a time and
    supports swipe.
  - The "latest" bento grid becomes a single column.
  - Compliance badges sit below the heading.
- **Section padding and gaps shrink on mobile.** Take values from the
  mobile frame. Never let desktop values carry over to mobile.
- **Type:** fluid `clamp()` between the 412 and 1440 frames. Check at
  375, 390 and 430px.
- **Nothing is hover-only.** Anything that reveals on hover needs a
  tap or focus equivalent on touch.
- **Touch targets** are at least 44×44px. The fixed navbar respects
  `env(safe-area-inset-*)`.
- **No accidental horizontal scroll.** The carousel peek cards and wide
  strips must clip inside their section (`overflow-x: clip`). Never let
  them widen the page.
- **Motion on mobile:** native scroll (no Lenis) and no parallax. Use
  simpler, smaller reveals, because big motion feels jarring on a small
  screen. Gate desktop-only effects with `gsap.matchMedia()`.
- **Testing:** use device emulation at 375 and 430px, not just a
  resized desktop window. A check on a real phone is flagged for human
  review.

## Assets

- Raster images: export from Figma at 2x as `.webp` into `/public/images`.
  Keep the exact crop and aspect ratio.
- Icons, logos and illustrations: SVG from the MCP.
- Images use `next/image` with `sizes` set. Hero and nav logo get
  `priority`; everything below the fold lazy-loads.

## Accessibility (the essentials)

- Semantic HTML (`header`, `nav`, `main`, `section`, `footer`, `button`).
- Alt text on content images. `alt=""` + `aria-hidden` on decorative ones.
- Icon-only buttons (carousel arrows, menu toggle) get an `aria-label`.
- Visible focus states. Accordion and carousel work with the keyboard.
- Text contrast meets WCAG AA, including white text on the hero image.
- Touch targets at least 44×44px. Respect `env(safe-area-inset-*)` on the
  fixed navbar.

## Metadata

Title, meta description, Open Graph image and a custom favicon (from the
Dodge logo). Not the Next.js defaults.

---

## Definition of done (per section)

Run these and show the proof. Never tick something you couldn't verify;
say so instead.

- [ ] `tsc --noEmit`, lint and `next build` pass
- [ ] Screenshot of the built section beside the Figma frame. Spacing,
      color and type match.
- [ ] Screenshots at 375px and 430px: no horizontal scroll, touch targets
      ≥44px
- [ ] Parallax uses the shared component and `PARALLAX` values, and is
      off on mobile and under reduced motion
- [ ] Lenis is the single root instance and isn't created on touch,
      mobile or reduced motion
- [ ] Isometric motion follows `motionreference.md`
- [ ] Reduced-motion fallback exists and is described
- [ ] No layout shift on load. Fonts via `next/font`.

Flag for human review (don't tick these yourself): 60fps scrolling, how
the parallax feels, Safari behavior, and a check on a real phone.
