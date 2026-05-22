# Motion + Tier-2 3D Spec — Curls & Contemplation

The motion layer carries 95% of a premium site. The Tier-2 3D hero is a single moment, gated and budget-bounded. Tier-3 WebGL is forbidden on this site — Curls is a sales/preorder surface, not a 3D product.

**Library:** Motion (`motion/react`, formerly Framer Motion). Install via `npm install motion`.

**Global rules:**
- Animate only `transform` and `opacity`. **Never** animate `width`/`height`/`top`/`left`.
- Easing default: `cubic-bezier(0.22, 1, 0.36, 1)` (gentle ease-out).
- Easing for premium reveals: `cubic-bezier(0.65, 0, 0.35, 1)` (sharper).
- Durations: 180ms fast / 240ms UI / 480ms section / 720ms hero only.
- Honor `prefers-reduced-motion: reduce` via Motion's `useReducedMotion`.
- One orchestrated page-load with staggered reveals > scattered micro-interactions.
- No decorative loops. Every motion has a reason.

---

## Tier 1 — Motion + Tailwind + CSS (default — used everywhere)

### Page transitions

Wrap `<Routes>` in `<AnimatePresence mode="wait">`. Each page exports a default `motion.main` with:

```tsx
import { motion, useReducedMotion } from "motion/react";

export default function Page() {
  const prefersReduced = useReducedMotion();
  return (
    <motion.main
      initial={prefersReduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReduced ? undefined : { opacity: 0, y: -16 }}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* page content */}
    </motion.main>
  );
}
```

### Section reveals (scroll-tied)

Each major section uses `whileInView` once:

```tsx
<motion.section
  initial={{ opacity: 0, y: 32 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px 0px" }}
  transition={{ duration: 0.72, ease: [0.65, 0, 0.35, 1] }}
>
  …
</motion.section>
```

Staggered children:

```tsx
<motion.ul
  variants={{ on: { transition: { staggerChildren: 0.08 } } }}
  initial="off" whileInView="on" viewport={{ once: true }}
>
  {items.map(x => (
    <motion.li key={x.id}
      variants={{ off: { opacity: 0, y: 24 }, on: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
    >…</motion.li>
  ))}
</motion.ul>
```

### CTA hover lift (gold glow)

```tsx
<motion.button
  whileHover={{ y: -2, boxShadow: "0 0 0 1px rgba(184,153,104,0.4), 0 8px 24px rgba(184,153,104,0.18)" }}
  whileTap={{ y: 0, scale: 0.98 }}
  transition={{ duration: 0.18 }}
  className="bg-gold text-obsidian font-display px-6 py-3 rounded-md"
>
  Pre-order — $15.99 launch
</motion.button>
```

### FAQ accordion

```tsx
<AnimatePresence initial={false}>
  {open && (
    <motion.div
      key="content"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      style={{ overflow: "hidden" }}
    >
      <p className="pb-4">{answer}</p>
    </motion.div>
  )}
</AnimatePresence>
```

> Exception to the no-height rule: accordions require height for accessibility; document the exception in `code-review`.

### Exit-intent modal

Trigger: `mouseleave` from `documentElement` AND `clientY < 5` AND not already shown this session. On mobile (no mouse): scroll-up + 15s idle + visibility change fallback.

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.96 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.98 }}
  transition={{ duration: 0.24, ease: [0.65, 0, 0.35, 1] }}
  className="fixed inset-0 grid place-items-center bg-obsidian/80 backdrop-blur-sm"
>
  …
</motion.div>
```

### Footer fade-in on near-bottom

Subtle — fades opacity 0.6 → 1.0 over 480ms as user nears bottom of doc. No vertical translation.

---

## Tier 2 — Single hero moment (gated)

**Goal:** one statement of premium feel on `/`. Not on `/book`, not on `/checkout`.

### Option A — Spline scene (recommended)

A slow rotation of the V4 book cover. Hosted on Spline; embedded via `<iframe>` or their React component.

```tsx
import { lazy, Suspense } from "react";
import { useReducedMotion } from "motion/react";
import { HeroBookFallback } from "./HeroBookFallback";

const SplineHero = lazy(() => import("./HeroBookSpline"));

export function HeroBook() {
  const prefersReduced = useReducedMotion();
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
  const isSlowConn = typeof navigator !== "undefined" && (navigator as any).connection?.effectiveType?.includes("2g");

  // Static SVG fallback wins on mobile, reduced-motion preference, or slow connection
  if (prefersReduced || isMobile || isSlowConn) return <HeroBookFallback />;

  return (
    <Suspense fallback={<HeroBookFallback />}>
      <SplineHero />
    </Suspense>
  );
}
```

**Spline scene specs:**
- 3D model: V4 cover with subtle bevel (cover SVG extruded 8mm)
- Rotation: y-axis 0.3 rpm, never stops, never accelerates
- Lighting: warm key light from 30° upper-left, gentle fill from below
- Material: matte paper with sub-1% specular
- Camera: orbit between 88° → 92° (1° amplitude) every 12s; never near-side
- Background: transparent → composited over ACISS obsidian-card surface
- Asset size budget: ≤ 250 KB compiled (`.splinecode` after gzip)
- Loaded only via `<Suspense>` after first paint

### Option B — Lottie JSON

Equivalent to Spline but easier to bundle. Adobe MCP can produce; export from After Effects or Bodymovin.

### Static SVG fallback (`HeroBookFallback.tsx`)

```tsx
export function HeroBookFallback() {
  return (
    <div className="aspect-[3/4] w-full max-w-md mx-auto rounded-md shadow-lg overflow-hidden bg-obsidian-card">
      <img src="/og/book-cover-static.svg" alt="Curls & Contemplation, the freelance hairstylist's guide to creative excellence" className="w-full h-auto" loading="eager" decoding="async" width={600} height={800} />
    </div>
  );
}
```

`book-cover-static.svg`: traced from the actual cover, fonts converted to paths, gzipped ≤ 50 KB. Generated via:

```
/adobe-for-creativity:adobe-resize-photos-and-videos
input: /media/cover-v4.png
output: 600x800 PNG, then
mcp__3860784d-4fbb-40ca-b7b7-8289bb0ab199__image_vectorize → SVG
```

### Performance budget (hero)

| Metric | Budget |
|---|---|
| LCP delta | ≤ +0.4s vs fallback |
| Main-thread block | ≤ 50ms during hero init |
| CLS | 0 (hero box reserved at layout time via aspect-ratio) |
| Bundle add | ≤ 30 KB JS gzipped (lazy chunk) |
| Transferred | ≤ 250 KB compiled scene |

Hero fails the gate if any budget is breached. Fall back to SVG-only.

---

## Tier 3 — Three.js / R3F / Babylon (forbidden on Curls)

Curls is a sales site. Tier 3 is reserved for products where the 3D experience IS the product (configurators, interactive renders). Do not load Three.js, drei, or R3F. The `freshtechbro/claudedesignskills` marketplace stays a library to reach into, not a default.

---

## Page-by-page motion inventory

| Surface | Motion |
|---|---|
| `/` | Page transition · Hero Tier-2 (Spline) or fallback · Section reveals · CTA lift · Bestseller-badge strip slide-in once · Exit-intent modal |
| `/book` | Page transition · Section reveals · CTA lift (hero CTA + sticky CTA) · No Tier-2 (sales-critical surface) |
| `/chapters` | Page transition · Grid stagger reveal · Card hover lift (translate 2px) |
| `/chapter/:slug` | Page transition · Pull-quote fade-in · Sticky CTA appears at 50% scroll |
| `/blog` | Page transition · Card stagger |
| `/blog/:slug` | Page transition · Image lazy fade-in · Reading-progress bar (single transform, GPU) |
| `/faq` | Page transition · Accordion animation |
| `/about` | Page transition · Section reveals · Author-photo crossfade hover |
| `/resources` | Page transition · Card stagger · Form Turnstile gentle slide-in |
| `/checkout` | Page transition · Step-progress slide · NO Tier-2 (commerce surface, perf-critical) |
| `/thank-you` | Page transition · Confetti? **No.** Single subtle gold underline on the order number. |
| `/portal/:token` | Page transition · Download-link reveal sequence (one-by-one, 80ms stagger) |
| Legal pages | Page transition · No other motion |
| `/admin*` | None — fast-path UI |

---

## Reduced-motion behavior

`useReducedMotion` returns true → behavior:

- Page transitions: **disabled** — instant render
- Section reveals: replaced with `opacity` only (no `y`)
- CTA hover: shadow change only, no `y` lift
- FAQ accordion: instant open/close
- Exit-intent: shown without spring; opacity fade only
- Hero Tier-2: **disabled** — SVG fallback served
- Reading-progress bar: still useful but uses `transform: scaleX()` (GPU-cheap, no flicker)

---

## Performance gates (Phase 17)

The motion layer ships only when:

- [ ] Lighthouse Performance ≥ 95 on `/` and `/book` (mobile + desktop)
- [ ] LCP < 2.5s
- [ ] INP < 200ms
- [ ] CLS < 0.1
- [ ] Bundle JS first-load < 200 KB gzipped (motion chunk lazy)
- [ ] No layout shift when Spline scene swaps in (aspect-ratio reserved)

If any fail, the Spline scene is disabled site-wide via env flag `HERO_3D_ENABLED=false` until fixed.

---

## Code-review checklist for any motion PR

- [ ] Animates `transform` + `opacity` only (exception: accordion `height` — documented)
- [ ] `useReducedMotion` honored
- [ ] No motion loop without a clear reason
- [ ] Easing pulled from tokens (`aciss-out` / `aciss-premium`)
- [ ] Duration pulled from tokens (`ui` / `section` / `hero`)
- [ ] `whileInView` uses `once: true`
- [ ] No layout shift introduced
- [ ] Tested with DevTools "Slow 4G" + "6x CPU throttling"
- [ ] Tested with `prefers-reduced-motion: reduce` enabled in OS
- [ ] Tested on Safari (iOS) — known to differ on `mouseleave` and spring physics

---

## Asset checklist

| Asset | Source | Phase |
|---|---|---|
| V4 cover Spline scene `.splinecode` | Spline web app or via Adobe → import | 9 |
| Static SVG fallback (`book-cover-static.svg`) | `image_vectorize` from cover PNG | 9 |
| Cover PNG (600×800) | `media/cover-v4.png` (existing) | — |
| Reading-progress bar (CSS only) | none — pure code | 10 |
| Gold-shadow filter | Tailwind plugin or inline | 10 |

---

*Motion is the difference between "well-coded" and "premium." The discipline is animation that earns its place, not animation that performs being-an-AI-site.*
