// Builds animation-ready React components from the untouched Figma exports
// (motionreference.md §6 step 3). Run: node scripts/build-illustrations.mjs
//
// Allowed edits only: wrap existing nodes in new <g>, add classes / data attributes,
// add masks & clip paths, scope ids per instance. Never touch d, fill, stroke,
// existing transforms or draw order. Each edit must match exactly once or the build fails.
//
// Animation-only plumbing (applied by JS while a timeline runs, removed at rest):
//   data-anim-mask="<id>"  → mask="url(#<id>)" while animating
//   data-anim-only         → visibility="hidden" at rest, visible while animating
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "app/components/illustrations/_source");
const OUT = path.join(ROOT, "app/components/illustrations/art");

function edit(s, find, replace, label) {
  const re = find instanceof RegExp ? new RegExp(find.source, find.flags.replace("g", "") + "g") : null;
  const count = re ? (s.match(re) || []).length : s.split(find).length - 1;
  if (count !== 1) throw new Error(`[${label}] expected exactly 1 match, got ${count}`);
  return s.replace(find, replace);
}

// ---------- scene edit specs ----------
const scenes = {
  graph(s) {
    s = edit(s, '<rect width="212" height="212" fill="white"/>', '<rect width="212" height="212" fill="white" class="hidden"/>', "bg");
    s = edit(s, '<g id="Graph">', '<g id="Graph" class="illo-graph__env">', "env");
    // Merged grained fill (bars + line + arrow ring): reveal through region masks.
    const v3 = s.match(/<g id="Vector_3" filter="[^"]+">[\s\S]*?<\/g>/)[0];
    s = edit(s, v3, `<g data-anim-mask="graph-reveal">${v3}</g>`, "bars fill");
    // Bar 2/4 outlines + line outline share the same region mask.
    s = edit(s, /(<path id="Vector_5"[^>]*\/>\s*<path id="Vector_6"[^>]*\/>\s*<path id="Vector_7"[^>]*\/>)/, '<g data-anim-mask="graph-reveal">$1</g>', "outlines");
    // Arrow: outline + an animation-only copy of the merged fill clipped to the arrow, moving as one.
    const v8 = s.match(/<path id="Vector_8"[^>]*\/>/)[0];
    const v3arrow = v3.replace('id="Vector_3"', 'id="Vector_3_arrow"');
    s = edit(s, v8, `<g class="illo-graph__arrow"><g clip-path="url(#graph-arrow-clip)" data-anim-only="" visibility="hidden">${v3arrow}</g>${v8}</g>`, "arrow");
    // Bars: skewed to the card plane (slope -0.1409 → skewY(-8.02°)); coords are pre-skew.
    const bars = [
      [30.5, 97.4], [58.7, 106.9], [87, 128.2], [115.2, 138.3], [143.4, 155.9],
    ].map(([x, top], i) => `<rect class="illo-graph__bar-${i + 1}" x="${x}" y="${top}" width="20.2" height="${(178.4 - top).toFixed(1)}" fill="white"/>`).join("");
    const linePoly = "28,75 128,75 128,108 195,108 195,155 164,155 164,131 143.5,131.3 135.2,118.7 115.5,115 106.8,111.6 95.2,113 87.3,110.2 78.6,95.8 72,93.2 65.4,90.6 59,91.3 50.5,88 30.5,90.5 28,90.5";
    s = edit(s, "<defs>", `<defs>
<mask id="graph-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="212" height="212"><g transform="skewY(-8.02)">${bars}</g><g clip-path="url(#graph-line-clip)"><rect class="illo-graph__line" x="28" y="70" width="168" height="90" fill="white"/></g></mask>
<clipPath id="graph-line-clip"><polygon points="${linePoly}"/></clipPath>
<clipPath id="graph-arrow-clip"><rect x="129" y="40" width="62" height="66"/></clipPath>`, "defs");
    return s;
  },

  compass(s) {
    s = edit(s, '<rect width="212" height="212" fill="white"/>', '<rect width="212" height="212" fill="white" class="hidden"/>', "bg");
    s = edit(s, '<g id="Compass">', '<g id="Compass" class="illo-compass__env">', "env");
    const arrow = s.match(/<g id="Vector" filter="[^"]+">[\s\S]*?<\/g>/)[0];
    s = edit(s, arrow, `<g data-anim-mask="compass-reveal">${arrow}</g>`, "arrow");
    s = edit(s, "<defs>", `<defs>
<mask id="compass-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="212" height="212">
<rect class="illo-compass__arrow-stem" x="99" y="112" width="17" height="42" fill="white"/>
<g clip-path="url(#compass-left-clip)"><rect class="illo-compass__arrow-left" x="48" y="80" width="56" height="62" fill="white"/></g>
<g clip-path="url(#compass-up-clip)"><rect class="illo-compass__arrow-up" x="86" y="54" width="44" height="60" fill="white"/></g>
<g clip-path="url(#compass-right-clip)"><rect class="illo-compass__arrow-right" x="110" y="74" width="58" height="68" fill="white"/></g>
</mask>
<clipPath id="compass-left-clip"><polygon points="99,142 99,116 103.5,112 88,82 48,82 48,142"/></clipPath>
<clipPath id="compass-up-clip"><polygon points="103.5,112 88,82 88,54 128,54 128,78 111.5,112"/></clipPath>
<clipPath id="compass-right-clip"><polygon points="116,116 111.5,112 128,78 168,74 168,142 116,142"/></clipPath>`, "defs");
    return s;
  },

  world(s) {
    s = edit(s, '<rect width="212" height="212" fill="white"/>', '<rect width="212" height="212" fill="white" class="hidden"/>', "bg");
    s = edit(s, '<g id="World">', '<g id="World" class="illo-world__env">', "env");
    const wrapG = (id, cls) => {
      const el = s.match(new RegExp(`<g id="${id}" filter="[^"]+">[\\s\\S]*?<\\/g>`))[0];
      s = edit(s, el, `<g class="${cls}">${el}</g>`, cls);
    };
    wrapG("Vector_47", "illo-world__origin");
    wrapG("Vector_49", "illo-world__node-1");
    wrapG("Vector_45", "illo-world__node-2");
    wrapG("Vector_46", "illo-world__node-3");
    wrapG("Vector_48", "illo-world__node-4");
    const routes = { "Vector 182": 1, "Vector 185": 2, "Vector 180": 3, "Vector 184": 4, "Vector 181": 5 };
    for (const [id, n] of Object.entries(routes)) {
      const el = s.match(new RegExp(`<path id="${id}"[^>]*\\/>`))[0];
      s = edit(s, el, `<g data-anim-mask="world-route-${n}">${el}</g>`, `route ${n}`);
    }
    // Trace masks: a circle growing from each route's start (origin or its node).
    const traces = [
      [1, 81.33, 175.46, 125], [2, 136.03, 74.84, 100], [3, 19.17, 83.94, 75], [4, 125.58, 17.19, 90], [5, 166.45, 176.66, 92],
    ].map(([n, cx, cy, r]) => `<mask id="world-route-${n}" maskUnits="userSpaceOnUse" x="0" y="0" width="212" height="212"><circle class="illo-world__trace-${n}" cx="${cx}" cy="${cy}" r="${r}" fill="white"/></mask>`).join("\n");
    s = edit(s, "<defs>", `<defs>\n${traces}`, "defs");
    return s;
  },
};

// ---------- Approach scenes (motionreference §7.4–7.7) ----------
// All four exports carry a #FAFAFA 520×320 frame fill: hidden, like the Challenge frames (user request).
const hideFrame = (s, label) => edit(s, '<rect width="520" height="320" fill="#FAFAFA"/>', '<rect width="520" height="320" fill="#FAFAFA" class="hidden"/>', `${label} bg`);
const wrapEl = (s, re, open, label) => {
  const el = s.match(re);
  if (!el) throw new Error(`[${label}] not found`);
  return edit(s, el[0], `${open}${el[0]}</g>`, label);
};
const gBlock = (id) => new RegExp(`<g id="${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>[\\s\\S]*?<\\/g>`);
const pathEl = (id) => new RegExp(`<(?:path|rect) id="${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*\\/>`);

Object.assign(scenes, {
  assessment(s) {
    s = hideFrame(s, "assessment");
    // CONVERGE subset: the 11 left-edge input shapes (centre x < 70), in left→right order.
    ["Rectangle 18461", "Rectangle 18472", "Rectangle 18435", "Rectangle 18478", "Rectangle 18486", "Rectangle 18473", "Rectangle 18460", "Rectangle 18501", "Rectangle 18438", "Rectangle 18510", "Rectangle 18447"]
      .forEach((id, i) => { s = wrapEl(s, pathEl(id), `<g class="illo-assessment__in-${i + 1}">`, id); });
    // `i` markers inside / at the green ring, left → right.
    ["Group 2147203946", "Group 2147203933", "Group 2147203944", "Group 2147203945", "Group 2147203932", "Group 2147203933_2"]
      .forEach((id, i) => { s = wrapEl(s, gBlock(id), `<g class="illo-assessment__mark-${i + 1}">`, id); });
    s = edit(s, '<path id="Vector 178" ', '<path id="Vector 178" class="illo-assessment__leader" pathLength="1" ', "leader");
    s = edit(s, '<g id="Frame 2147225582">', '<g id="Frame 2147225582" class="illo-assessment__panel">', "panel");
    s = edit(s, '<g id="Group 2147203937">', '<g id="Group 2147203937" data-anim-mask="assessment-pie">', "pie");
    s = edit(s, '<g id="Rectangle 18474" ', '<g id="Rectangle 18474" data-anim-mask="assessment-bar-1" ', "bar1");
    s = edit(s, '<g id="Rectangle 18475_2">', '<g id="Rectangle 18475_2" data-anim-mask="assessment-bar-2">', "bar2");
    s = edit(s, '<g id="Rectangle 18476_2">', '<g id="Rectangle 18476_2" data-anim-mask="assessment-bar-3">', "bar3");
    const bar = (n, x, y, w, h) => `<mask id="assessment-bar-${n}" maskUnits="userSpaceOnUse" x="0" y="0" width="520" height="320"><rect class="illo-assessment__bar-${n}" x="${x}" y="${y}" width="${w}" height="${h}" fill="white"/></mask>`;
    s = edit(s, "<defs>", `<defs>
<mask id="assessment-pie" maskUnits="userSpaceOnUse" x="0" y="0" width="520" height="320"><circle class="illo-assessment__pie" cx="432.56" cy="45.16" r="6.3" fill="none" stroke="white" stroke-width="12.6" pathLength="1" stroke-dasharray="1 1" transform="rotate(-90 432.56 45.16)"/></mask>
${bar(1, 451.8, 34, 44.6, 7.5)}${bar(2, 473.2, 41.8, 23, 7)}${bar(3, 461.3, 49.3, 35, 7)}`, "defs");
    return s;
  },

  analyse(s) {
    s = hideFrame(s, "analyse");
    // Plates left → right: [plate, dashed line, anchor cell, marker?]
    const sets = [
      ["Vector_218", "Vector_216", "Vector_105", "Frame 2147225657", 85.86, 84.78, 199.63],
      ["Vector_223", "Vector_222", "Vector_126", null, 200.54, 101.62, 255.98],
      ["Vector_219", "Vector_217", "Vector", "Frame 2147225658", 251.33, 21.6, 136.45],
      ["Vector_225", "Vector_224", "Vector_62", null, 320.75, 106.99, 221.84],
      ["Vector_221", "Vector_220", "Vector_24", "Frame 2147225659", 400.08, 89.83, 204.67],
    ];
    let defs = "", m = 0;
    sets.forEach(([plate, line, anchor, marker, x, top, bottom], i) => {
      const n = i + 1;
      s = wrapEl(s, gBlock(plate), `<g class="illo-analyse__plate-${n}">`, plate);
      s = wrapEl(s, pathEl(line), `<g data-anim-mask="analyse-line-${n}">`, line);
      s = wrapEl(s, pathEl(anchor), `<g class="illo-analyse__anchor-${n}">`, anchor);
      if (marker) s = wrapEl(s, gBlock(marker), `<g class="illo-analyse__mark-${++m}" data-plate="${n}">`, marker);
      // Line mask = (rect riding with its plate) ∩ (clip growing up from the anchor).
      const h = (bottom - top + 2 + 40).toFixed(2);
      defs += `<mask id="analyse-line-${n}" maskUnits="userSpaceOnUse" x="0" y="0" width="520" height="320"><g clip-path="url(#analyse-grow-${n})"><rect class="illo-analyse__line-${n}" x="${x - 3}" y="${(top - 1).toFixed(2)}" width="6" height="${h}" fill="white"/></g></mask>`;
      defs += `<clipPath id="analyse-grow-${n}"><rect class="illo-analyse__grow-${n}" x="${x - 3}" y="${(top - 41).toFixed(2)}" width="6" height="${(bottom - top + 42).toFixed(2)}"/></clipPath>`;
    });
    s = edit(s, "<defs>", `<defs>\n${defs}`, "defs");
    return s;
  },

  configure(s) {
    s = edit(s, '<rect width="520" height="320" fill="#FAFAFA"/>', '<rect width="520" height="320" fill="#FAFAFA" class="hidden"/>', "configure bg");
    // Wheel = dashed inner ring, modules, crosshair, rim, hub (contiguous). Orbit guides/arcs stay outside.
    s = edit(s, '<g id="Group_22" opacity="0.4">', '<g class="illo-configure__wheel-1"><g id="Group_22" opacity="0.4">', "wheel-1 open");
    s = wrapEl(s, pathEl("Vector_75"), '<g class="illo-configure__hub-1">', "hub-1");
    s = edit(s, /(<g class="illo-configure__hub-1"><path id="Vector_75"[^>]*\/><\/g>)/, "$1</g>", "wheel-1 close");
    s = edit(s, '<g id="Group_11" ', '<g class="illo-configure__wheel-2"><g id="Group_11" ', "wheel-2 open");
    s = wrapEl(s, pathEl("Vector_39"), '<g class="illo-configure__hub-2">', "hub-2");
    s = edit(s, /(<g class="illo-configure__hub-2"><path id="Vector_39"[^>]*\/><\/g>)/, "$1</g>", "wheel-2 close");
    return s;
  },

  support(s) {
    s = hideFrame(s, "support");
    // Bars top → bottom (each bar's front, side and grained top faces are a contiguous run).
    [["Vector_79", "Vector_89"], ["Vector_57", "Vector_67"], ["Vector_68", "Vector_78"]].forEach(([a, b], i) => {
      const re = new RegExp(`<path id="${a}"[\\s\\S]*?<path id="${b}"[^>]*\\/>`);
      s = wrapEl(s, re, `<g data-anim-mask="support-bar-${i + 1}">`, `bar ${i + 1}`);
    });
    s = wrapEl(s, pathEl("Vector_92"), '<g data-anim-mask="support-conn-slack">', "slack connector");
    s = wrapEl(s, pathEl("Vector_91"), '<g data-anim-mask="support-conn-teams">', "teams connector");
    const bar = (n, x, y, w, h) => `<mask id="support-bar-${n}" maskUnits="userSpaceOnUse" x="0" y="0" width="520" height="320"><rect class="illo-support__bar-${n}" x="${x}" y="${y}" width="${w}" height="${h}" fill="white"/></mask>`;
    // Connector masks: trace rect (from the app tile) + a soft band that travels outward for FLOW.
    const conn = (name, x, bandX) => `<mask id="support-conn-${name}" maskUnits="userSpaceOnUse" x="0" y="0" width="520" height="320"><rect class="illo-support__trace-${name}" x="${x}" y="147" width="69.8" height="8" fill="white"/><rect class="illo-support__flow-${name}" x="${bandX}" y="147" width="24" height="8" fill="url(#support-band)"/></mask>`;
    s = edit(s, "<defs>", `<defs>
<linearGradient id="support-band" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="white"/><stop offset="0.5" stop-color="#8C8C8C"/><stop offset="1" stop-color="white"/></linearGradient>
${bar(1, 199.3, 73, 126, 37.4)}${bar(2, 185.9, 123, 153.1, 37.4)}${bar(3, 172.6, 173.2, 99, 37.3)}
${conn("slack", 48.8, 118)}${conn("teams", 401.8, 378.8)}`, "defs");
    return s;
  },
});

// ---------- SVG → JSX ----------
function toJsx(svg, name) {
  const viewBox = svg.match(/viewBox="([^"]+)"/)[1];
  let body = svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  const ids = new Set();
  body = body
    .replace(/style="mask-type:luminance"/g, 'style={{ maskType: "luminance" }}')
    .replace(/ class="/g, ' className="')
    .replace(/ data-anim-mask="([^"]+)"/g, (_, id) => { ids.add(id); return ` data-anim-mask={\`url(#\${u("${id}")})\`}`; })
    .replace(/ id="([^"]+)"/g, (_, id) => { ids.add(id); return ` id={u(${JSON.stringify(id)})}`; })
    .replace(/ xlink:href="#([^"]+)"/g, (_, id) => ` href={\`#\${u(${JSON.stringify(id)})}\`}`)
    .replace(/ ([a-zA-Z-]+)="url\(#([^)]+)\)"/g, (_, attr, id) => ` ${attr}={\`url(#\${u(${JSON.stringify(id)})})\`}`)
    .replace(/ ((?!data-|aria-)[a-z]+(?:-[a-z]+)+)=/g, (_, a) => " " + a.replace(/-([a-z])/g, (_m, c) => c.toUpperCase()) + "=");
  return `// GENERATED by scripts/build-illustrations.mjs from _source/${name}.svg — do not edit by hand.
// Artwork is unchanged; only wrappers, classes, masks and per-instance ids were added.
export function ${name[0].toUpperCase() + name.slice(1)}Art({ uid, className }: { uid: string; className?: string }) {
  const u = (id: string) => \`\${uid}-\${id.replace(/[^A-Za-z0-9_-]/g, "_")}\`;
  return (
    <svg viewBox="${viewBox}" preserveAspectRatio="xMidYMin meet" fill="none" aria-hidden="true" focusable="false" className={className}>
${body.trim()}
    </svg>
  );
}
`;
}

fs.mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2);
for (const [name, apply] of Object.entries(scenes)) {
  if (only.length && !only.includes(name)) continue;
  const src = fs.readFileSync(path.join(SRC, `${name}.svg`), "utf8");
  const out = toJsx(apply(src), name);
  fs.writeFileSync(path.join(OUT, `${name}-art.tsx`), out);
  console.log(`✓ ${name}-art.tsx`);
}
