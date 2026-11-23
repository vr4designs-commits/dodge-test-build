# motionreference.md — Isometric illustration motion (Dodge website)

Read this whole file before animating any of the seven illustrations or
the footer bars (§8). It sets out what may move, how, when, and why.
Site-wide motion (Lenis, image parallax, text reveals) is in CLAUDE.md,
not here.

---

## 0. Authority and the two rules

### Sources and what each one is for

| Source | Use it for | Never use it for |
|---|---|---|
| Original SVGs exported from Figma (node IDs in §6) | Everything visual: geometry, perspective, strokes, colours, gradients, grain, layering, logos | Changing the design to fit a motion idea |
| Adjacent section copy (§7) | Deciding **which** existing parts move, in what order, and what the motion means | Inventing features, numbers or integrations |
| The four Pinterest references (§1) | **How motion feels**: pacing, sequencing, settling | Anything visual: style, colours, glows, backgrounds, UI chrome, shapes |

**Priority when these conflict:** (1) exact fidelity to the original SVG →
(2) accurate meaning of the adjacent copy → (3) motion feel from the
references → (4) implementation convenience. If a motion idea needs the
artwork to change, adapt the idea or drop it. Never change the artwork.

### Rule 1: Don't touch the artwork. Only add motion.

- Don't change, add, remove or simplify anything visible: paths,
  proportions, line weights, colours, fills, gradients, grain, dashes,
  logos, perspective or crop. No new glows, shadows, particles, scan
  lines, labels, numbers or highlights.
- **The resting frame is the original, pixel for pixel.** Every animation
  is a `from` tween that ends at the source state. Loops return exactly to
  the source state every cycle. Paused, reduced-motion and no-JS states
  all show the original.
- During motion only, these temporary changes are allowed: translate
  (along the drawing's own axes), opacity, small scale (≤10% on grained
  fills), mask or clip reveals, stroke draw-on, and rotation about a
  centre that's drawn in the artwork.
- Invisible prep work is fine: wrapping existing nodes in new `<g>`
  groups, adding IDs, `pathLength`, `transform-origin`, masks. If a
  moving part is merged into a compound path and can't be separated
  without changing how it looks, leave it static and flag it.

### Rule 2: Every motion acts out the copy next to it.

Before animating, write the one-line contract:

> "This section says **[copy claim]**, so the illustration shows
> **[existing part] [verb]-ing** to communicate **[outcome]**."

If you can't write it, stop and ask. If removing a motion wouldn't make the
copy any less clear, remove the motion.

**Self-check:** "Am I using the references to decide how *this*
illustration moves, or am I making it *look* more like the references?"
Only the first is allowed.

---

## 1. Motion references (motion only)

- Ref 1: https://in.pinterest.com/pin/835136324689908298/: **stepped
  storytelling**. Each step has one clear move; lines draw on and objects
  settle into place.
- Ref 2: https://in.pinterest.com/pin/852939616956532985/: **process**.
  Input goes in, the mechanism works, output comes out, in cause-and-effect
  order.
- Ref 3: https://in.pinterest.com/pin/831195674994544164/: **data made
  physical**. Things stack, fill and arrive in slots.
- Ref 4: https://in.pinterest.com/pin/725290715041200567/: **explain by
  focus**. One part acts at a time while the rest stay still.

The pins weren't viewable during prep (HTTP 403). The motion qualities
above come from their descriptions. If you can open them, take only cadence,
sequencing and easing from them.

**Shared motion DNA:** an animated engineering diagram, not a cartoon or a
3D render. One hero action per beat. Calm, precise, with a sense of
weight; things settle, they don't bounce. Input → action → result → hold.
Emphasis comes from what moves, never from added colour.

---

## 2. Motion grammar

- **The camera is fixed.** No global rotation, zoom, perspective change,
  wobble or parallax on an illustration. Illustrations are never placed
  inside the `ParallaxImage` component.
- **Move along the drawing's own axes.** Only Analyse is true isometric
  (30°: X-iso `(0.866, 0.5)`, Y-iso `(-0.866, 0.5)`, Z `(0, -1)`). Graph,
  Compass and Support sit on tilted planes: measure their local axes from
  the drawn edges. Assessment and Configure are near-frontal. World is a
  sphere. Don't force any of them into a new projection.
- **Rotation** only happens around a centre drawn in the artwork (the
  Configure hubs). Never fake 3D rotation (don't spin the globe or flip the
  compass).
- **Grain and gradients:** never animate the gradient or the noise. Grain
  must travel with its shape and not slip. On grained fills, prefer mask
  reveals over `scaleX/scaleY` so the grain doesn't stretch.
- **Weight:** heavy parts (platforms, wheels, bubble) move little and
  slowly. Light parts (tiles, markers, dots) move more and faster.
  Overshoot is at most 3px. No spring, bounce or elastic easing.
- **Depth:** keep the painter's order correct throughout. If a part passes
  behind another, split or reorder layers so occlusion stays right, and
  restore the original order at rest.

---

## 3. Tokens

These go in `app/lib/motion.ts` next to the site-wide tokens. Illustration
code never uses raw numbers.

```ts
export const ILLO = {
  dur: { xs: 0.18, sm: 0.28, md: 0.45, lg: 0.8, xl: 1.1 },   // seconds
  hold: 2.0,           // read time after STORY before any optional loop
  stagger: { sm: 0.06, md: 0.12, lg: 0.18 },
  ease: {
    settle: "expo.out",      // ≈ cubic-bezier(0.16, 1, 0.3, 1): reveals, arrivals
    mech:   "power2.inOut",  // ≈ cubic-bezier(0.4, 0, 0.2, 1): mechanism moves, indexing
    draw:   "power1.inOut",  // stroke draw-on, path traces
    flow:   "none",          // linear: dash flow, steady transport
  },
  dist: { rise: 16, lift: 40, nudge: 4 },   // px at 1x illustration scale
  loop: { flow: 3, quiet: 6 },              // seconds per cycle
  mobileTimeScale: 1.2,                     // mobile plays ~20% faster
};
```

Timing limits: ENTER ≤ 0.6s, STORY ≤ 2.4s, then hold.

---

## 4. Primitives

Name the primitive for each beat in your spec. All of them use only
elements that already exist in the artwork.

| Primitive | What it does | How |
|---|---|---|
| DRAW | A stroke traces on | `pathLength="1"` + `stroke-dashoffset`. For dashed strokes, use a mask so the dashes stay dashed. |
| REVEAL | A filled shape appears along an axis | Clip/mask reveal from its base or origin. Use this for grained shapes instead of scaling. |
| RISE / LIFT | A part comes up along its local vertical into its drawn position | `from` y offset + opacity, `settle` |
| CONVERGE | Scattered parts travel into their drawn positions | `from` offsets spread outward, `settle`, staggered |
| INDEX | A wheel rotates a fixed step about its drawn hub | `rotation` on a wrapper group, `mech` |
| TRACE | A route or connector reveals along its exact path | DRAW or mask, from origin to destination |
| MARK | An existing badge, marker or node appears | Opacity + scale 0.9→1 from its centre, `settle`, `dur.sm` |
| FLOW | Dashes move along an existing dashed path | Animate `stroke-dashoffset`, linear. Loops only (see §5). |

---

## 5. Playback

### Triggers

- **The Challenge** (Graph, Compass, World): play once when ~35% of the
  illustration is visible (ScrollTrigger `start: "top 70%"`, `once: true`),
  then hold. Never replay on scroll back. Start the first movement within
  ~200ms of the heading's reveal starting.
- **Approach accordion** (Assessment, Analyse, Configure, Support): the
  scene plays **when its panel opens**: click (or Enter/Space) on
  desktop, tap on mobile. There's no hover trigger. Only one panel is open
  at a time (see "Approach accordion interaction" in CLAUDE.md). Panel 01
  System Assessment is open by default and plays when the section scrolls
  into view. A scene starts only after its panel's width (or height)
  expansion has finished. When a panel closes,
  pause and reset its timeline to the source state while it's hidden.
  Re-opening replays it. That replay is user-initiated and short, so it's
  fine.
- **Sync with text:** the panel or row heading appears first. The hero
  beat starts 150–250ms after. Body copy and the illustration finish at
  about the same time.

### Loops

- By default there are none: play once and hold the result.
- Loops are allowed only where the copy describes an ongoing process.
  Only Analyse ("continuous problem management") and Support (ongoing
  support) qualify. Their loops run only while their panel is open and on
  screen, and pause when the panel closes, scrolls off screen or the tab
  is hidden.
- Loop amplitude stays ≤30% of the STORY motion, and loops wrap
  seamlessly (no hard cut). At most 2 loops run in the viewport at once.

### Reduced motion and no JS

- `prefers-reduced-motion: reduce` (check at startup and on change): show
  the original artwork with at most a 200ms opacity fade. No travel,
  rotation, flow or loops.
- No JS / SSR: render the unchanged source SVG. Nothing is hidden before
  JS runs. Set initial `from` states only inside the timeline, never in
  CSS that applies without JS.

### Mobile

- Same choreography, with `timeScale(ILLO.mobileTimeScale)`. If a scene
  moves too many elements at once on a small screen, reduce the number of
  simultaneous movers rather than cropping. Never crop connectors, markers
  or nodes.

---

## 6. SVG pipeline

### Sources

| Scene | Figma node (standalone frame) | Section |
|---|---|---|
| `graph` | `7:2082` | The Challenge, row 1 |
| `compass` | `7:2383` | The Challenge, row 2 |
| `world` | `7:2493` | The Challenge, row 3 |
| `assessment` | `7:1763` | Approach, panel 1 |
| `analyse` | `7:1588` | Approach, panel 2 |
| `configure` | `6:1332` | Approach, panel 3 |
| `support` | `6:1234` | Approach, panel 4 |

The expanded accordion cards in `2:932` show how each illustration sits
inside its panel.

### Steps

1. **Export** each node as SVG through the Figma MCP, with IDs included and
   strokes kept as strokes (not outlined). Save the untouched exports to
   `app/components/illustrations/_source/{scene}.svg`. **These are
   immutable**: never edit them.
2. **Preflight** each export: `viewBox`, nested groups and transforms,
   `defs` (gradients, patterns, filters, masks, clip paths), embedded
   images, `<use>`, compound paths. Is the grain a pattern, a filter or an
   embedded image? List which parts can move independently. If an export
   is a flattened bitmap, or a needed part is merged, report it before
   going further.
3. **Make the animation-ready copy** as a component
   (`app/components/illustrations/{scene}.tsx`):
   - Wrap existing nodes in named groups. Never edit `d`, `fill`,
     `stroke`, existing `transform` values, or the draw order.
   - Naming: `illo-{scene}__env`, `__hero`, `__part-{n}`, `__detail-*`,
     `__flow-*`, `__mark-*`.
   - Apply animation transforms to **new wrapper groups**, never on top
     of the original `transform` attributes. Use explicit pivots
     (`transform-box: fill-box` plus a verified `transform-origin`).
   - **Scope IDs per instance** (`useId()`), and update every `url(#…)`
     reference so gradients, masks and filters never collide.
   - Strokes that DRAW get `pathLength="1"`. Keep `vector-effect` as
     exported.
   - If optimising, use SVGO with `cleanupIds: false`,
     `collapseGroups: false`, `removeViewBox: false`,
     `convertShapeToPath: false`, `mergePaths: false`, then re-check
     parity.
   - Record the selector map (part → group ID) as typed constants in
     the component.
4. **Parity gate, before any animation.** Render `_source/{scene}.svg`
   and the component side by side at the same size and background, at
   desktop and 375px. They must be visually identical (anti-aliasing
   aside). Repeat for the **settled** frame after the animation is built.
   Show the screenshots as proof.
5. **Timeline:** one GSAP timeline per scene inside `useGSAP`, with labels
   `enter`, `story`, `loop`. Animate only transform, opacity, and
   `stroke-dashoffset`/masks (no filters, no path `d`). Use
   `will-change` only during active tweens. Clean everything up on
   unmount, and make sure React Strict Mode can't trigger a double run.

---

## 7. Scene specs (with the real copy)

> **Challenge copy is still placeholder.** On desktop all three rows read
> "A Constant Cat-and-Mouse With Your Partner / Business, IT, and your SI
> all point in different directions—no clear owner, no clear root cause,
> and issues linger." The mobile frame instead repeats "The Necessary
> Investment That Becomes a Pit of Problems / ERP spend feels justified,
> but ROI stalls…" and shows the World icon on all three rows. The specs
> below follow the section's framing (**these are problems**). Confirm
> the final copy for each row before building, and re-check each contract.

### 7.1 `graph`: The Challenge, row 1

**Drawn:** a tilted card with a dashed inner border, five bars (three
green grained, two outline) stepping down left to right, a descending
stepped line, and an outline down arrow.
**Contract (provisional):** the section describes stalled ROI or a
worsening situation, so the bars step down, the line traces the decline,
and the arrow lands, communicating **things getting worse**. The downward
direction is the problem, not a win.
**Axes:** the card's plane. Bars reveal along the card's vertical edge.

```
ENTER  0.00  card + dashed border fade in (dur.sm)
STORY  0.15  bars REVEAL from their baselines, left→right (dur.md, settle, stagger.md); mask, not scaleY
       0.55  stepped line DRAWs left→right over the bars (dur.lg, draw)
       1.20  arrow RISEs into place from nudge(4px) above, along the card vertical (dur.md, settle)
       1.70  done → hold
```

No loop. Never repeat the decline as if it keeps falling.
**Groups:** `__card`, `__border`, `__bar-1..5`, `__line`, `__arrow`

### 7.2 `compass`: The Challenge, row 2

**Drawn:** a tilted disc with a thick rim, the letters N/E/S/W, and a green
three-way arrow (a stem branching left, up and right).
**Contract (provisional):** "Business, IT, and your SI all point in
different directions", so the arrow splits from one stem into three
equal branches, communicating **no single direction or owner**. Don't
emphasise one branch, and don't "settle" it onto a heading. That would
claim a solution in a problem section.
**Axes:** the disc's plane. Letters and dial stay fixed.

```
ENTER  0.00  dial and rim fade in (dur.sm); letters stay static
STORY  0.15  stem REVEALs upward from its base (mask, dur.md, settle)
       0.55  left, up and right branches REVEAL from the fork to their tips at the same time (mask, dur.md, settle)
       1.10  done → hold
```

No loop, no rotation.
**Groups:** `__dial`, `__rim`, `__letters`, `__arrow-stem`, `__arrow-left`, `__arrow-up`, `__arrow-right`

### 7.3 `world`: The Challenge, row 3

**Drawn:** a wireframe globe, green grained land, one black origin dot,
small green nodes, and dashed routes (some crossing the globe's edge).
**Contract (provisional):** the copy for this row isn't final. The default
is that routes trace outward from the origin to the existing nodes,
communicating **issues spread across a connected landscape**. If the
final copy is about something else, re-map it with §4 and flag it. Don't
invent geographic claims.
**Axes:** sphere. **Never rotate the globe.** All motion lives in the
routes and nodes.

```
ENTER  0.00  globe, grid and land present (fade in, dur.sm)
STORY  0.20  origin dot MARK (dur.sm)
       0.40  routes TRACE from origin → destination, one by one (dur.md each, stagger.lg); mask so dashes stay dashed; respect the segments behind the globe
             each destination node MARKs as its route arrives (scale ≤10%, dur.sm)
       2.20  done → hold
```

No loop.
**Groups:** `__globe`, `__grid`, `__land`, `__origin`, `__node-1..n`, `__route-1..n`. If a path's data runs destination → origin, reverse the draw in code, not the path.

### 7.4 `assessment`: Approach, panel 1 "System Assessment" (open by default)

**Copy:** "Our retrieval LM conducts a health scan to understand your
WRICEFs, custom objects, ticket patterns and more to pinpoint the
bottleneck slowing you down."
**Contract:** the copy says a broad scan narrows down to the bottleneck,
so scattered shapes converge through the rings into the green zone, gain
their info markers, and the summary panel appears, communicating **many
signals narrowed down to one identified bottleneck**.
**Axes:** the funnel's centre line (left → right).

```
ENTER  0.00  dashed envelope + two outline rings present; broad input set visible (no blank start)
STORY  0.20  a subset of left-side shapes CONVERGE into their drawn positions from 30–60px further left and slightly spread (dur.lg, settle, stagger.sm); no collisions, shapes keep their identity
       0.90  shapes entering the green ring: existing `i` markers MARK as they arrive, left→right (dur.sm, stagger.md)
       1.50  leader line TRACEs from the green ring to the summary panel (dur.md, draw)
       1.85  summary panel fades in; pie REVEALs by clockwise mask, bars REVEAL left→right (dur.md, stagger.sm). No implied percentages
       2.40  done → hold
```

No loop. Don't treat grey shapes as "rejected". The funnel and rings never move.
**Groups:** `__envelope`, `__ring-1`, `__ring-2`, `__ring-green`, `__in-*`, `__mark-*`, `__leader`, `__panel`, `__pie`, `__bar-1..3`

### 7.5 `analyse`: Approach, panel 2 "Analyze"

**Copy:** "Our agents are built to do continuous problem management to
surface recurring issues before they impact the business."
**Contract:** the copy says issues get surfaced continuously, so specific
tiles lift out of the grid as plates and three get flagged, communicating
**recurring issues surfaced before they spread**.
**Axes:** true isometric. Lift along Z.

```
ENTER  0.00  platform + grid present and static (no generic scan of every tile)
STORY  0.15  the 5 anchor cells (under the dashed lines) get a subtle opacity emphasis (dur.sm)
       0.40  the 5 green plates LIFT along Z from ~dist.lift lower to their drawn positions (dur.lg, settle, stagger.md); keep their projected shape and grain
       0.50  dashed connectors extend from anchor to plate as each lifts (mask reveal; endpoint stays attached; line stays behind its plate)
       1.60  the 3 existing `!` markers MARK on their plates, each after its plate settles (dur.sm, stagger.md). Only those 3: never flag all 5
       2.20  done → hold
LOOP   (panel open + on screen only) every loop.quiet: one flagged plate lowers ~12px and re-lifts (dur.lg, settle), ending exactly at source. The platform never moves.
```

**Groups:** `__platform`, `__grid`, `__anchor-1..5`, `__line-1..5`, `__plate-1..5`, `__mark-1..3`

### 7.6 `configure`: Approach, panel 3 "Configure"

**Copy:** "Clear, prioritized reconfiguration roadmap that fixes
misaligned setups and moves your COE one step closer to a zero inbox
world."
**Contract:** the copy says misaligned setups get fixed one prioritised
step at a time, so each wheel starts one module out of alignment and
indexes into place, first wheel then second, communicating **an ordered
realignment**.
**Axes:** frontal. Each wheel rotates about its own drawn hub. **The wheels
are separate mechanisms; don't mesh them or apply a gear ratio.** (Check
against the export. If they really do mesh, flag it before changing
this.)

```
ENTER  0.00  both wheels, orbit guides and arcs present; guides stay fixed throughout
STORY  0.20  wheel 1 INDEXes from −1 module interval (measure the actual angle between modules, ~40°) to 0, in the direction the drawn arrows indicate (dur.lg, mech)
       0.75  wheel 2 INDEXes the same way about its own hub (dur.lg, mech); "prioritized" means sequential, not simultaneous
       1.50  the existing green hub dots get a brief opacity emphasis 0.6→1 (dur.sm). No glow
       1.90  done → hold at source
```

No loop.
**Groups:** `__wheel-1` (rim, modules, rings, crosshair, hub together), `__wheel-2`, `__guide-*`, `__arc-*`

### 7.7 `support`: Approach, panel 4 "Support"

**Copy:** "Automate L1/L2 support through agents integrated with
Teams/Slack—cutting resolution times and reducing your consulting
hours."
**Contract:** the copy says requests arrive from Slack/Teams and get
resolved fast, so both connectors trace into the bubble, the three bars
fill in as the response, then the dashes flow back out, communicating
**request in → resolved → reply out, quickly**.
**Axes:** the bubble's plane. Bars reveal along the bubble's horizontal edge.

```
ENTER  0.00  bubble, Slack tile and Teams tile present (static)
STORY  0.10  both dashed connectors TRACE from their app tiles toward the bubble, together (dur.md, draw; mask so dashes stay dashed). Treat both channels the same
       0.55  three bars REVEAL left→right along the bubble's X edge, top→bottom (dur.md, settle, stagger.md); front and side faces move as one
       1.30  connectors FLOW outward once (dash phase toward the apps, dur.md, linear)
       1.80  done → hold. Brisk tempo on purpose: "cutting resolution times"
LOOP   (panel open + on screen only) connectors FLOW outward at loop.flow, with a 2s pause between cycles
```

The Slack and Teams logos are third-party marks. Never recolour, distort
or animate inside them, and don't imply forwarding between the two apps.
**Groups:** `__bubble`, `__bar-1..3`, `__conn-slack`, `__conn-teams`, `__tile-slack`, `__tile-teams`

### 7.8 Page rhythm

Every scene has a different hero action, so the page never repeats itself:
Graph = step down · Compass = split · World = trace out · Assessment =
converge · Analyse = lift + flag · Configure = index · Support = in →
respond → out. At most 2 loops can run at once, and in practice only one
accordion panel is open, so that's at most one.

---

## 8. Footer bars

**Drawn:** 15 grained green bars along the bottom of the footer
(`1:846`), stepping up to the centre bar and back down. Each bar has a
vertical gradient, dark green at the top fading to pale green at the
bottom. The same Rule 1 applies: the resting frame is the Figma design
exactly. No new colours, no glow, and the bars' shapes, heights and
grain never change.

**Contract:** this is the sign-off for the page. The bars build up like a
skyline, then the green breathes quietly across them, so the page ends
feeling alive but calm. It isn't tied to copy, so keep it restrained.

### Build

- Export from Figma so **each bar is its own element** (SVG `<rect>`/`<g>`,
  or a `div` with the exported fill). If the export flattens them into one
  shape or one image, stop and ask. Don't redraw.
- The bar row sits in a container with `overflow: hidden`, with its bottom
  edge aligned to the footer's bottom edge. That makes bars rise up out of
  the page edge.
- Bars are decorative: `aria-hidden="true"` on the row.

### Phase 1: Rise (plays once)

- **Trigger:** when the top of the bar row reaches about 95% of the
  viewport height (`start: "top 95%"`, `once: true`). It's at the end of
  the page, so a higher start point might never be reached.
- **Motion:** each bar starts fully below the container (`yPercent: 100`)
  and rises to its resting position (`yPercent: 0`). Translate only: never
  `scaleY`, which would stretch the grain.
- **Order:** left → right, bar 1 to bar 15.
- **Timing:** each bar `FOOTER.rise.dur`, staggered
  `FOOTER.rise.stagger`, easing `settle` (expo.out). No overshoot or
  bounce: bars land and stop. The whole wave takes ~1.5s.
- It plays once. Scrolling back up and down again doesn't replay it. The
  bars stay in place.

### Phase 2: Gradient flow (loop, starts after the rise finishes)

- A **very subtle** band of lighter green drifts slowly left → right
  across all 15 bars, like light passing over them.
- **How:** one overlay layer covering the whole bar row, **clipped to the
  bar shapes** (same mask/clip as the bars, so nothing shows in the gaps
  above them). The overlay is a horizontal gradient made only of greens
  already in the bars: transparent → the pale bottom green → transparent.
  The overlay is twice the row's width, and only its `transform` moves
  (`xPercent: 0 → -50`, linear, repeat −1), so the loop is seamless and
  GPU-cheap. **Never animate `background-position` or the gradient
  stops**, and never move or re-render the grain. Keep the grain above
  the overlay, or the overlay below the grain, so the texture stays put.
- **Intensity:** overlay opacity `FOOTER.flow.opacity` (start at 0.15–0.2).
  If you notice the loop before you notice the footer, it's too strong.
- **Speed:** one full pass every `FOOTER.flow.cycle` (start at ~10s). Slow
  enough to feel like breathing, not a loading shimmer.
- Fade the overlay in over ~1s when it starts. Never pop it in.
- **Pause** when the footer is off screen or the tab is hidden.

### Tokens (add to `app/lib/motion.ts`)

```ts
export const FOOTER = {
  rise: { dur: 0.8, stagger: 0.05, ease: "expo.out" },
  flow: { cycle: 10, opacity: 0.18, fadeIn: 1, ease: "none" },
};
```

### Responsive and reduced motion

- **Mobile:** the rise plays with the same order, at about 20% faster
  timing. The gradient flow is **off on mobile** to save battery. Bars
  just rest after rising.
- **Reduced motion:** no rise and no flow. Bars appear in their resting
  state immediately.
- **No JS:** bars render in their resting state. Set the hidden starting
  position only inside the GSAP timeline, never in CSS.

---

## 9. Acceptance checklist (per illustration)

- [ ] The export in `_source/` is untouched. The component passed the
      parity gate at rest and settled, at desktop and 375px (screenshots
      shown).
- [ ] The contract sentence is written down and matches the confirmed
      copy. Any mismatch is flagged.
- [ ] Nothing added, removed or recoloured. Nothing visual taken from the
      references.
- [ ] Motion follows the drawing's own axes. No fake 3D, no globe spin.
      Grain doesn't stretch or slip.
- [ ] One hero action per beat. ENTER ≤ 0.6s, STORY ≤ 2.4s, then hold.
- [ ] Correct trigger: scroll-in for Challenge, panel-open for Approach.
      Loops only on Analyse and Support, paused when closed, off screen or
      the tab is hidden.
- [ ] Reduced motion and no-JS show the original artwork.
- [ ] Instance-scoped IDs. No transform accumulation on replay. Clean
      unmount (Strict Mode safe).
- [ ] Only transform, opacity and dash/mask animated. Smooth on mobile.
