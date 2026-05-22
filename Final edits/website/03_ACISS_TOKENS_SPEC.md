# `packages/aciss-tokens` — Workspace Spec

A monorepo workspace inside `Last/` that owns the locked ACISS design tokens and emits every framework consumer (CSS, Tailwind, JSON, Swift, Android XML).

**Philosophy:** Black leads. Gold elevates. Jade distinguishes.

**Sole source of truth.** No component, page, or theme ever hardcodes a hex value. CI fails on raw `#` color literals in `web/styles/`, `web/components/`, `web/frontend.tsx`.

---

## 1. Workspace layout

```
Last/
├── package.json                       ← root, with workspaces array
└── packages/
    └── aciss-tokens/
        ├── package.json
        ├── README.md
        ├── style-dictionary.config.ts
        ├── tokens/
        │   ├── color.json
        │   ├── typography.json
        │   ├── spacing.json
        │   ├── radii.json
        │   ├── shadow.json
        │   ├── motion.json
        │   └── breakpoint.json
        └── dist/                       ← generated; gitignored
            ├── tokens.css              ← CSS custom properties
            ├── tokens.json             ← raw JSON
            ├── tailwind.config.ts      ← Tailwind theme.extend
            ├── tokens.swift            ← optional, iOS
            └── tokens.android.xml      ← optional, Android
```

**Root `package.json` change** (add the workspace):

```json
{
  "workspaces": [
    "web",
    "packages/*"
  ]
}
```

---

## 2. `packages/aciss-tokens/package.json`

```json
{
  "name": "@curls/aciss-tokens",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/tokens.json",
  "exports": {
    ".": "./dist/tokens.json",
    "./css": "./dist/tokens.css",
    "./tailwind": "./dist/tailwind.config.ts"
  },
  "scripts": {
    "build": "style-dictionary build --config ./style-dictionary.config.ts",
    "watch": "style-dictionary build --config ./style-dictionary.config.ts --watch",
    "verify": "node ./scripts/verify-no-hardcoded.mjs"
  },
  "devDependencies": {
    "style-dictionary": "^4.0.0",
    "typescript": "^5.5.0"
  }
}
```

---

## 3. Token files — locked content

### 3.1 `tokens/color.json`

```json
{
  "color": {
    "obsidian": { "value": "#0E0D0B", "type": "color", "comment": "Background, primary text, surfaces. Warm rich black — never pure #000." },
    "gold":     { "value": "#B89968", "type": "color", "comment": "Accent, CTAs, premium signals. Antique champagne — never yellow-gold." },
    "jade":     { "value": "#1F6F6B", "type": "color", "comment": "Secondary accent, links. Deep jade — never Tiffany teal." },

    "obsidian-soft": { "value": "#1A1815", "type": "color", "comment": "Elevated surface 1." },
    "obsidian-card": { "value": "#221F1A", "type": "color", "comment": "Card / panel surface." },

    "gold-tint":     { "value": "#D4B98C", "type": "color", "comment": "Body text on obsidian when small (≥4.5:1)." },
    "gold-deep":     { "value": "#8B6F45", "type": "color", "comment": "Pressed/hover state." },

    "jade-link":     { "value": "#2A8E89", "type": "color", "comment": "Body link on obsidian (≥4.5:1)." },
    "jade-deep":     { "value": "#155551", "type": "color", "comment": "Pressed/hover." },

    "ink":           { "value": "#F3EFE6", "type": "color", "comment": "Inverse text on obsidian (cream). High legibility." },
    "ink-muted":     { "value": "#B8B0A0", "type": "color", "comment": "Secondary text on obsidian." },
    "ink-quiet":     { "value": "#7A726A", "type": "color", "comment": "Tertiary text / hint." },

    "danger":        { "value": "#C24B3B", "type": "color", "comment": "Validation error / refund / destructive." },
    "success":       { "value": "#5C8A6A", "type": "color", "comment": "Confirmation / paid." }
  }
}
```

### 3.2 `tokens/typography.json`

```json
{
  "font": {
    "display": { "value": "'Fraunces', Georgia, serif", "type": "fontFamily", "comment": "Locked Phase 4 — distinctive serif." },
    "body":    { "value": "'Söhne', system-ui, sans-serif", "type": "fontFamily", "comment": "Locked Phase 4 — refined sans. Never Inter/Roboto/Arial/Space Grotesk." },
    "mono":    { "value": "'JetBrains Mono', ui-monospace, monospace", "type": "fontFamily", "comment": "Code/data only." }
  },
  "fontSize": {
    "xs":  { "value": "12px", "type": "fontSize" },
    "sm":  { "value": "14px", "type": "fontSize" },
    "base":{ "value": "16px", "type": "fontSize" },
    "lg":  { "value": "18px", "type": "fontSize" },
    "xl":  { "value": "20px", "type": "fontSize" },
    "2xl": { "value": "24px", "type": "fontSize" },
    "3xl": { "value": "32px", "type": "fontSize" },
    "4xl": { "value": "44px", "type": "fontSize" },
    "5xl": { "value": "60px", "type": "fontSize" },
    "6xl": { "value": "76px", "type": "fontSize" }
  },
  "lineHeight": {
    "tight":   { "value": "1.1",  "type": "lineHeight" },
    "snug":    { "value": "1.25", "type": "lineHeight" },
    "normal":  { "value": "1.5",  "type": "lineHeight" },
    "relaxed": { "value": "1.65", "type": "lineHeight" }
  },
  "tracking": {
    "tight":  { "value": "-0.02em", "type": "letterSpacing" },
    "normal": { "value": "0",       "type": "letterSpacing" },
    "wide":   { "value": "0.04em",  "type": "letterSpacing" }
  }
}
```

### 3.3 `tokens/spacing.json`

```json
{
  "space": {
    "0":  { "value": "0",     "type": "spacing" },
    "1":  { "value": "4px",   "type": "spacing" },
    "2":  { "value": "8px",   "type": "spacing" },
    "3":  { "value": "12px",  "type": "spacing" },
    "4":  { "value": "16px",  "type": "spacing" },
    "6":  { "value": "24px",  "type": "spacing" },
    "8":  { "value": "32px",  "type": "spacing" },
    "12": { "value": "48px",  "type": "spacing" },
    "16": { "value": "64px",  "type": "spacing" },
    "24": { "value": "96px",  "type": "spacing" },
    "32": { "value": "128px", "type": "spacing" }
  }
}
```

### 3.4 `tokens/radii.json`

```json
{
  "radius": {
    "none": { "value": "0",    "type": "borderRadius" },
    "sm":   { "value": "4px",  "type": "borderRadius" },
    "md":   { "value": "8px",  "type": "borderRadius" },
    "lg":   { "value": "16px", "type": "borderRadius" },
    "xl":   { "value": "24px", "type": "borderRadius" },
    "full": { "value": "9999px","type": "borderRadius" }
  }
}
```

### 3.5 `tokens/shadow.json`

```json
{
  "shadow": {
    "sm":  { "value": "0 1px 2px rgba(0,0,0,0.40)",                                "type": "boxShadow" },
    "md":  { "value": "0 4px 12px rgba(0,0,0,0.45)",                               "type": "boxShadow" },
    "lg":  { "value": "0 12px 32px rgba(0,0,0,0.55)",                              "type": "boxShadow" },
    "gold":{ "value": "0 0 0 1px rgba(184,153,104,0.4), 0 8px 24px rgba(184,153,104,0.18)", "type": "boxShadow", "comment": "CTA hover lift." }
  }
}
```

### 3.6 `tokens/motion.json`

```json
{
  "motion": {
    "ease": {
      "out":     { "value": "cubic-bezier(0.22, 1, 0.36, 1)",  "type": "transitionTiming" },
      "premium": { "value": "cubic-bezier(0.65, 0, 0.35, 1)",  "type": "transitionTiming" }
    },
    "duration": {
      "fast":    { "value": "180ms", "type": "duration" },
      "ui":      { "value": "240ms", "type": "duration" },
      "section": { "value": "480ms", "type": "duration" },
      "hero":    { "value": "720ms", "type": "duration" }
    }
  }
}
```

### 3.7 `tokens/breakpoint.json`

```json
{
  "breakpoint": {
    "sm": { "value": "640px",  "type": "sizing" },
    "md": { "value": "768px",  "type": "sizing" },
    "lg": { "value": "1024px", "type": "sizing" },
    "xl": { "value": "1280px", "type": "sizing" },
    "2xl":{ "value": "1536px", "type": "sizing" }
  }
}
```

---

## 4. Style Dictionary config

`packages/aciss-tokens/style-dictionary.config.ts`:

```ts
import type { Config } from "style-dictionary/types";

const config: Config = {
  source: ["tokens/**/*.json"],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "dist/",
      files: [{ destination: "tokens.css", format: "css/variables", options: { selector: ":root" } }],
    },
    json: {
      transformGroup: "js",
      buildPath: "dist/",
      files: [{ destination: "tokens.json", format: "json/nested" }],
    },
    tailwind: {
      transformGroup: "js",
      buildPath: "dist/",
      files: [{ destination: "tailwind.config.ts", format: "javascript/es6", filter: () => true }],
      // emit a Tailwind-shaped theme.extend; see custom format below
    },
  },
};

export default config;
```

A custom Tailwind formatter (`scripts/format-tailwind.mjs`) emits:

```ts
// packages/aciss-tokens/dist/tailwind.config.ts
import type { Config } from "tailwindcss";
export const acissTheme: Config["theme"] = {
  extend: {
    colors: {
      obsidian: "#0E0D0B",
      "obsidian-soft": "#1A1815",
      "obsidian-card": "#221F1A",
      gold: "#B89968",
      "gold-tint": "#D4B98C",
      "gold-deep": "#8B6F45",
      jade: "#1F6F6B",
      "jade-link": "#2A8E89",
      "jade-deep": "#155551",
      ink: "#F3EFE6",
      "ink-muted": "#B8B0A0",
      "ink-quiet": "#7A726A",
      danger: "#C24B3B",
      success: "#5C8A6A",
    },
    fontFamily: {
      display: ["Fraunces", "Georgia", "serif"],
      body: ["Söhne", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "ui-monospace", "monospace"],
    },
    boxShadow: {
      gold: "0 0 0 1px rgba(184,153,104,0.4), 0 8px 24px rgba(184,153,104,0.18)",
    },
    transitionTimingFunction: {
      "aciss-out": "cubic-bezier(0.22, 1, 0.36, 1)",
      "aciss-premium": "cubic-bezier(0.65, 0, 0.35, 1)",
    },
    transitionDuration: {
      ui: "240ms",
      section: "480ms",
      hero: "720ms",
    },
  },
};
export default { theme: acissTheme } satisfies Partial<Config>;
```

`web/tailwind.config.ts` imports it:

```ts
import { acissTheme } from "@curls/aciss-tokens/tailwind";
export default {
  content: ["./frontend.tsx", "./components/**/*.tsx", "./index.html"],
  theme: acissTheme,
  plugins: [require("@tailwindcss/typography")],
};
```

---

## 5. Codemod — remove legacy palette

A script removes the v1.0 teal/champagne palette from `web/styles/main.css` and replaces hardcoded uses across `web/`:

```bash
# packages/aciss-tokens/scripts/codemod.mjs
// Pre-mortem fix B2 — sweeps every file type the legacy palette can hide in.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const PAIRS = [
  ["#2B9999", "var(--color-jade)"],         // legacy teal → ACISS jade
  ["#C9A961", "var(--color-gold)"],         // legacy gold → ACISS gold
  ["#1a1a1a", "var(--color-obsidian)"],     // legacy ink → ACISS obsidian
  ["#f9f7f2", "var(--color-ink)"],          // legacy cream → ACISS ink
  ["Cinzel Decorative", "var(--font-display)"],
  ["Libre Baskerville", "var(--font-body)"],
  ["Montserrat", "var(--font-body)"],
];

// B2: every extension where the legacy palette can live.
// Includes EPUB internal XHTML/CSS (OEBPS/), PDF generator scripts (pdf/, pub/),
// LaTeX print sources (.tex), Python utility scripts, raw SVG asset files,
// and HTML print previews.
const EXT = /\.(css|tsx|ts|html|xhtml|svg|tex|py|json)$/;
const SCAN_DIRS = ["web", "OEBPS", "pdf", "pub", "canvas", "bestseller-badge", "mdw-portfolio", "Final edits"];

function walk(dir) {
  let dirEntries;
  try { dirEntries = readdirSync(dir); } catch { return; }
  for (const f of dirEntries) {
    if (f === "node_modules" || f === "dist" || f === ".next" || f === ".git") continue;
    const p = join(dir, f);
    let s;
    try { s = statSync(p); } catch { continue; }
    if (s.isDirectory()) { walk(p); continue; }
    if (!EXT.test(p)) continue;
    let src = readFileSync(p, "utf8");
    let changed = false;
    for (const [from, to] of PAIRS) {
      if (src.includes(from)) { src = src.split(from).join(to); changed = true; }
    }
    if (changed) { writeFileSync(p, src); console.log("✓", p); }
  }
}

for (const dir of SCAN_DIRS) walk(dir);
console.log("Codemod complete. Verify with `npm run verify --workspace @curls/aciss-tokens`.");
```

Run via `npm run codemod --workspace @curls/aciss-tokens`. CI gate (`verify-no-hardcoded.mjs`) fails if any legacy hex resurfaces.

**Pre-mortem B2 fix:** the legacy palette can hide in EPUB internal CSS (`OEBPS/`), PDF print sources (`pdf/`, `pub/`), LaTeX files, Python build scripts, and inline `<style>` blocks in HTML print previews. The original codemod only scanned `.css/.tsx/.ts/.html` — extended above to include `.xhtml/.svg/.tex/.py/.json` and to walk every repo directory that touches the palette.

---

## 6. CI verification (Phase 14 gate)

`packages/aciss-tokens/scripts/verify-no-hardcoded.mjs`:

```js
// Pre-mortem fix B2 — extended scan: every extension where the legacy palette can hide.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const FORBIDDEN = [
  /#2B9999/i,           // legacy teal
  /#C9A961/i,           // legacy champagne
  /Cinzel Decorative/,  // legacy display font
  /Libre Baskerville/,  // legacy body font
];
let bad = 0;

const EXT = /\.(css|tsx|ts|html|xhtml|svg|tex|py|json)$/;
const SCAN_DIRS = ["web", "OEBPS", "pdf", "pub", "canvas", "bestseller-badge", "mdw-portfolio", "Final edits"];

function walk(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const f of entries) {
    if (f === "node_modules" || f === "dist" || f === ".next" || f === ".git") continue;
    const p = join(dir, f);
    let s;
    try { s = statSync(p); } catch { continue; }
    if (s.isDirectory()) { walk(p); continue; }
    if (!EXT.test(p)) continue;
    const src = readFileSync(p, "utf8");
    for (const re of FORBIDDEN) {
      if (re.test(src)) { console.error("✗ legacy token in", p); bad++; }
    }
  }
}
for (const d of SCAN_DIRS) walk(d);
if (bad === 0) console.log("✓ no legacy palette artifacts");
process.exit(bad > 0 ? 1 : 0);
```

Wired into `package.json` `precommit` and `vercel.json` `buildCommand`.

---

## 7. Cross-platform consumers (optional)

| Platform | File | Use case |
|---|---|---|
| iOS | `dist/tokens.swift` | If TAYLKOMB ever ships a companion app |
| Android | `dist/tokens.android.xml` | same |
| Figma | `dist/tokens.json` → Figma Tokens plugin | Design parity |

These are emitted only when `STYLE_DICTIONARY_PLATFORMS=all` is set. Default is `css,json,tailwind`.

---

## 8. Bridge tokens to Finder's Book

To allow the Finder's Book site to consume Heritage Gold `#B8923D` while sharing the workspace:

```json
{
  "color": {
    "heritage-gold": { "value": "#B8923D", "type": "color", "comment": "Finder's Book / TAYLKOMB-adjacent bridge. Used only by finders-book site." }
  }
}
```

Stored in `tokens/color.json` under a `bridge.finders` namespace. Curls components never reference it. Documented for next-turn handoff.

---

## 9. Build verification (Phase 0)

```bash
cd Last
npm install
npm run build --workspace @curls/aciss-tokens
ls packages/aciss-tokens/dist/
# expect: tokens.css  tokens.json  tailwind.config.ts
npm run verify --workspace @curls/aciss-tokens
# expect: exit 0
```

---

*This spec is the lock document for Phase 4 (Design direction). The orchestrator does not enter Phase 6 (Scaffold + tokens) until `packages/aciss-tokens` builds clean and the codemod has run against `web/`.*
