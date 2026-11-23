# Dodge website

Marketing site for **Dodge**, an agentic platform that cuts SAP support load and TCO for CPG enterprises.
One long landing page built section by section from the Figma file (see `CLAUDE.md`).

## Stack

- Next.js (App Router) + TypeScript, Tailwind CSS v4 (tokens in `app/globals.css`)
- GSAP + ScrollTrigger for all scroll-driven motion, Lenis for desktop smooth scrolling
- Motion (`motion/react`) for UI state transitions (accordion, carousel, mobile menu)

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000 — updates live as you edit
```

Other scripts: `npm run build` (production build), `npm run start` (serve the build), `npm run lint`.

## Where things live

| Path | What |
|---|---|
| `app/page.tsx` | The page — sections in order |
| `app/components/` | One component per section, plus navbar, mobile menu, shared `parallax-image` |
| `app/components/illustrations/` | Animated isometric illustrations; untouched Figma exports in `_source/` |
| `app/lib/motion.ts` | All motion values (durations, easings, parallax ranges, carousel spacing) |
| `app/globals.css` | Design tokens (colours, type scale) from Figma |
| `scripts/build-illustrations.mjs` | Regenerates `illustrations/art/*` from `_source/` (`node scripts/build-illustrations.mjs`) |
| `CLAUDE.md`, `motionreference.md` | Build rules and the motion spec |

## Deploy

Vercel, auto-deploying from `main`. Set `NEXT_PUBLIC_SITE_URL` to the live URL so Open Graph images resolve.

## Known placeholders

Copy and links still to be supplied: the "Hodge" wordmark, buttons labelled "Button", repeated stats ("50K+"),
"Pariatur anim sit exercitation" captions, the single repeated testimonial, social/legal link URLs.
The UI font is a temporary stand-in (Figtree) for Gilmer until licensed font files are added (`app/fonts.ts`).
