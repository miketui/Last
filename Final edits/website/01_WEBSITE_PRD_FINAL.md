# Curls & Contemplation — Website PRD (FINAL)

**Version:** 3.0 — supersedes v2.0
**Status:** Pre-Launch (Pre-Order Phase)
**Date:** 2026-05-22
**Owner:** Michael David Warren Jr.
**Repo:** `miketui/Last` @ `main`, work path `Final edits/MONEY/`

---

## 1. Version history

### v1.0 → v2.0

| # | v1.0 | v2.0 |
|---|---|---|
| 1 | Palette: Teal `#2B9999` + Gold `#C9A961` | **ACISS — Obsidian `#0E0D0B` / Gold `#B89968` / Jade `#1F6F6B`** |
| 2 | Type: Cinzel Decorative + Libre Baskerville + Montserrat | Display: distinctive serif (chosen Phase 4 by `ui-ux-pro-max` within ACISS); Body: refined sans; **no Inter / Roboto / Arial / Space Grotesk** |
| 3 | Animation: ad-hoc CSS | **Motion (`motion/react`)** — locked easing + duration scale (240/480/720 ms) |
| 4 | EPUB: `CurlsAndContemplation.epub` | **`CurlsAndContemplationV4.epub`** (final), POD-6x9 PDF |
| 5 | Marketing email: Mailchimp | **MailerLite primary** (`warrenm115@gmail.com`); Mailchimp deprecated |
| 6 | Digital delivery: local `/private/` serving + Resend link | **Supabase signed URL** (private bucket) + token attempt-limit + expiry; Resend retained for transactional |
| 7 | Pricing: $19.99 flat | **$17.99 launch / $19.99 regular** — gated by `RELEASE_DATE` |
| 8 | No Substack integration | **RSS poll → MailerLite broadcast** + buyer-only deep-link reward |
| 9 | No design system workspace | **`packages/aciss-tokens`** with Style Dictionary → tokens.css, tailwind.config.ts |
| 10 | No human approval gates | **9 scoped gates** via `human-approval-gate` skill (ledger in build log) |
| 11 | No legal pages beyond Privacy/Terms/Refund | Adds `/preorder-policy`, `/digital-delivery-policy`, `/cookies`, `/accessibility` — FTC + CCPA/CPRA compliant |
| 12 | 3D book cover via Three.js loaded eagerly | **Tier-2 lazy-loaded** Spline/Lottie hero; static SVG fallback; honors `prefers-reduced-motion` |

### v2.0 → v3.0 (this doc) — 2026-05-22

| # | v2.0 | v3.0 (this doc) |
|---|---|---|
| 1 | Pricing: $17.99 launch / $19.99 regular | **$15.99 pre-order / $17.99 regular** — set after the decision to also sell on Amazon Kindle at $9.99; the direct price stays ≥ the Amazon price so Amazon can't price-match it down |
| 2 | "Launch promo" = pre-order + first 14 days | **90-day pre-order campaign** — pre-order opens at `RELEASE_DATE − 90 days` |
| 3 | Timeline anchored to a fixed 2026-05-22 calendar | **All dates relative to `RELEASE_DATE`** (still TBD) — no hardcoded calendar dates anywhere |
| 4 | EPUB + PDF only | EPUB + PDF **+ bonus bundle** (Pricing Kit, chapter workbook, lifetime updates, pre-order-only bonus chapter) — the reason to buy direct over the $9.99 Kindle |
| 5 | No demand test | **Demand-validation gate** (`06_PRE_MORTEM.md` C0) — a falsifiable Day-30 pre-order go/no-go |
| 6 | No sales copy in the bundle | **`17_WEBSITE_COPY.md`** added — real home hero, `/book` sales argument, objection FAQ |
| 7 | Traffic assumed | **Owned-audience launch plan** added (§ 9a) |

---

## 2. Product overview

### 2.1 Purpose
A direct-to-consumer eBook sales platform that enables Michael David Warren (Rihanna's day-to-day hairstylist, training lineage Guido Palau and Jimmy Paul) to sell his book directly to readers, capture leads, nurture prospects via automated email sequences, manage orders, and operate a credible author platform — without depending on Amazon as the primary funnel.

### 2.2 Target audience
- **Primary:** Freelance hairstylists growing their business and creative practice (ages 22–45)
- **Secondary:** Beauty industry professionals (salon owners, cosmetology students, assistants)
- **Tertiary:** Craft/career book readers; beauty-curious readers drawn by celebrity-roster credibility

### 2.3 Business model (LOCKED)

| Item | Price | Format | Fulfillment |
|---|---|---|---|
| eBook (pre-order — 90-day campaign + first 14d post-launch) | **$15.99** | EPUB (V4) + PDF + bonus bundle | Stripe Checkout → Supabase signed URL (7-day, 3-download cap) |
| eBook (regular, post-launch) | **$17.99** | EPUB (V4) + PDF + bonus bundle | same |
| eBook (Amazon Kindle — external) | $9.99 | Kindle format only | Amazon KDP; not managed by this bundle. Direct price stays ≥ this. |
| Pricing Confidence Kit | Free | PDF | gated by email; Turnstile-protected |
| Sample Chapter (Chapter 1) | Free | PDF | ungated; top-of-funnel |
| Paperback (POD-6x9) | TBD | external | Amazon / B&N / Waterstones / Indigo links only |
| Bestseller-badge program | Internal | — | `bestseller-badge/` repo content |

### 2.4 Conversion goal hierarchy (one per surface)
1. **Lead capture** (Pricing Confidence Kit) — top of funnel
2. **Pre-order** ($15.99) — middle of funnel
3. **Post-order nurture** (sequence → review → second book/related products) — bottom of funnel
4. **Substack subscription** — owned-audience compounding asset

---

## 3. Architecture

### 3.1 Technology stack (LOCKED — see `00_README.md` § Stack)

Existing site (`web/`) runs Bun + SQLite. ACISS palette, Motion, MailerLite, Supabase, Turnstile are layered on top. No framework migration in this phase.

### 3.2 System diagram (updated)

```
┌─────────────────────────────────────────────────┐
│                   Browser (SPA)                  │
│  React 19 · Motion · Tailwind+ACISS · Stripe.js  │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS · CSP enforced
┌──────────────────────▼──────────────────────────┐
│              Bun.serve() (port 3000)             │
│  Turnstile-protected forms · Zod validation     │
│                                                   │
│  ┌─────────┐  ┌──────────┐  ┌────────────────┐  │
│  │  Pages   │  │   API    │  │  Static Files  │  │
│  └─────────┘  └────┬─────┘  └────────────────┘  │
│                     │                             │
│  ┌──────────────────▼──────────────────────────┐ │
│  │      Business Logic (signature-verified)    │ │
│  │  lib/stripe · lib/email · lib/mailerlite    │ │
│  │  lib/supabase · lib/substack-sync           │ │
│  └──────────────────┬──────────────────────────┘ │
│                     │                             │
│  ┌──────────────────▼──────────────────────────┐ │
│  │           SQLite (bun:sqlite) · WAL          │ │
│  │  customers · orders · portal_tokens          │ │
│  │  download_tokens (revocable)                 │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
   │            │             │           │           │
┌──▼──┐    ┌───▼───┐    ┌────▼────┐  ┌───▼────┐ ┌──▼───┐
│Stripe│   │Resend │    │MailerLite│  │Supabase│ │ GA4  │
│ pay  │   │ tx    │    │ marketing│  │  files │ │consent│
└─────┘    └───────┘    └─────────┘  └────────┘ └──────┘
                              │
                         ┌────▼─────┐
                         │ Substack │
                         │  (RSS)   │
                         └──────────┘
```

### 3.3 Routes (full list)

See `02_SITEMAP.md` for every route with SEO title, meta, OG, JSON-LD, priority, changefreq.

| Tier | Routes |
|---|---|
| Public marketing | `/` · `/book` · `/chapters` · `/chapter/:slug` (×16) · `/blog` · `/blog/:slug` · `/faq` · `/about` · `/resources` |
| Commerce | `/checkout` · `/thank-you` · `/portal/:token` · `/download/:token` |
| Legal | `/privacy` · `/terms` · `/refund-policy` · `/preorder-policy` · `/digital-delivery-policy` · `/cookies` · `/accessibility` |
| Admin (auth-gated) | `/admin` · `/admin/orders` · `/admin/subscribers` · `/admin/analytics` · `/admin/broadcasts` |
| API | `/api/subscribe` · `/api/free-resource` · `/api/checkout` · `/api/stripe/webhooks` · `/api/portal/:token` · `/api/download/:token` · `/api/track` · `/api/health` · `/api/admin/*` |
| Cron | `/api/cron/process-emails` · `/api/cron/release-ebook` · `/api/cron/substack-sync` · `/api/cron/token-cleanup` |

---

## 4. Functional requirements (deltas from v1.0)

### 4.1 Net-new

| # | Feature | Spec |
|---|---|---|
| F43 | Supabase signed-URL delivery | Replace local `/private/` serving. Bucket: `curls-deliverables` (private). Signed URL TTL = 24h, regenerated on each portal visit. Per-customer attempt cap = 3 downloads / 7 days. |
| F44 | MailerLite primary CRM | Replace Mailchimp. Group IDs: `Subscribers`, `Pricing Kit`, `Sample Chapter`, `Pre-Orders`, `Post-Order Customers`, `Refunded`, `Substack Synced`. Universal embed on `/`, `/resources`. Webhook for unsubscribe sync to SQLite. |
| F45 | Substack RSS sync | Cron every 6h: poll Substack RSS, dedupe by GUID, store in `posts_substack` table. On new post: queue MailerLite broadcast to `Subscribers` minus `Substack Synced`; tag opens as `Substack Synced`. |
| F46 | Substack buyer-reward | Post-order email (Day 3) includes deep-link to Substack with `?ref=buyer` for a buyer-only Substack post unlock (manual curation). |
| F47 | Tier-2 hero animation | Spline scene (book cover rotating) lazy-loaded after first paint; static SVG fallback < 50 KB; gated by `prefers-reduced-motion` and viewport ≥ md. |
| F48 | ACISS palette enforcement | Style Dictionary build emits `tokens.css`, `tailwind.config.ts`, `tokens.json`. Codemod removes legacy teal/gold references from `web/styles/main.css`. CI fails if `#2B9999` or `#C9A961` reappear. |
| F49 | CCPA/CPRA consent banner | Block GA4 + MailerLite tracking pixels until consent. "Do Not Sell or Share My Personal Information" link in footer. Consent persisted in `localStorage` + cookie. |
| F50 | Bestseller badge surface | `/` hero strip + `/book` credibility section pulls latest badge from `bestseller-badge/badges.json`. Manual update flow documented in `INTEGRATIONS.md`. |
| F51 | Author portfolio cross-link | `/about` deep-links to `mdw-portfolio/` (separate static site or sub-route). Decision: served at `michaeldavidjr.beauty` (separate Vercel project). Cross-canonical headers set. |
| F52 | Approval gate ledger | Build log records every `[GATE]` approval with timestamp + scope. Stored in `Final edits/MONEY/GATE_LEDGER.md`. |
| F53 | Tier-1 motion layer | Page transitions, scroll-tied section reveals, exit-intent modal spring, FAQ accordion, gold-jade CTA hover. All `transform` + `opacity` only. |

### 4.2 Removed from v1.0

- **F21 hard date gate** — replaced with FTC-compliant preorder policy (see `14_SECURITY_LEGAL_QA.md`) requiring real release date + delay/refund language.
- **Mailchimp env vars** — deprecated. Migration window: 30 days after MailerLite primary goes live.

---

## 5. Database schema (deltas)

### 5.1 New tables

```sql
posts_substack
├── id (TEXT PRIMARY KEY)
├── guid (TEXT UNIQUE)
├── title (TEXT)
├── slug (TEXT)
├── url (TEXT)
├── published_at (TEXT)
├── synced_to_mailerlite (INTEGER DEFAULT 0)
├── broadcast_id (TEXT)
└── created_at (TEXT)

consent_log
├── id (TEXT PRIMARY KEY)
├── ip_hash (TEXT)
├── user_agent (TEXT)
├── analytics_consent (INTEGER)
├── marketing_consent (INTEGER)
├── region (TEXT)        -- "CA" | "EU" | "OTHER"
├── consent_version (TEXT)
└── created_at (TEXT)

gate_ledger
├── id (TEXT PRIMARY KEY)
├── gate_name (TEXT)      -- strategy_lock | brief_lock | design_lock | ...
├── approved_by (TEXT)
├── scope_approved (TEXT)
├── approved_at (TEXT)
└── notes (TEXT)
```

### 5.2 Altered tables

```sql
ALTER TABLE download_tokens ADD COLUMN supabase_path TEXT;
ALTER TABLE download_tokens ADD COLUMN signed_url_expires_at TEXT;
ALTER TABLE subscribers   ADD COLUMN mailerlite_subscriber_id TEXT;
ALTER TABLE subscribers   ADD COLUMN mailerlite_groups TEXT;  -- JSON array
ALTER TABLE orders        ADD COLUMN launch_state TEXT;       -- "preorder" | "postorder"
ALTER TABLE orders        ADD COLUMN price_tier TEXT;         -- "launch" | "regular"
```

---

## 6. Design system (LOCKED — see `03_ACISS_TOKENS_SPEC.md`)

### 6.1 Palette

| Token | Hex | Role | WCAG 2.2 AA check (vs Obsidian bg) |
|---|---|---|---|
| Obsidian | `#0E0D0B` | bg, primary text | — |
| Gold | `#B89968` | accent, CTAs | 4.85:1 large text only; small body uses tint `#D4B98C` (6.2:1) |
| Jade | `#1F6F6B` | links, distinguishing | 3.1:1 → bump to `#2A8E89` (4.6:1) for body links |

### 6.2 Type system

Display: distinctive serif (locked Phase 4). Body: refined sans (locked Phase 4). Forbidden: Inter, Roboto, Arial, Helvetica, system-ui, Space Grotesk. Display-pair candidates: Fraunces (display) + Söhne (body); or Cormorant Garamond (display) + Inter Tight (body — only if licensed display partner shifts).

### 6.3 Motion

Easing `cubic-bezier(0.22, 1, 0.36, 1)` default · `cubic-bezier(0.65, 0, 0.35, 1)` premium reveals. Durations 240/480/720 ms. Animate `transform` + `opacity` only. Honor `prefers-reduced-motion: reduce`.

### 6.4 Forbidden patterns

Generic AI hero · stock testimonials · "Elevate your" / "Unlock the power of" / "In today's fast-paced world" · lorem ipsum · emoji bullet lists in body · decorative gradients · purple-on-white · more than one primary CTA per screen · footer longer than the page.

---

## 7. Non-functional requirements

### 7.1 Performance (HARD BUDGET)

| Metric | Target |
|---|---|
| LCP | < 2.5s (desktop and mobile, 4G) |
| INP | < 200ms |
| CLS | < 0.1 |
| Lighthouse Performance | ≥ 95 |
| Lighthouse Accessibility | 100 |
| Initial JS bundle | < 200 KB gzipped |
| Static SVG hero fallback | < 50 KB |

Lazy-load: 3D/Spline scene, Recharts (admin only), all images below the fold. Preload: hero image + body font WOFF2.

### 7.2 Security (delegated to `14_SECURITY_LEGAL_QA.md`)

CSP · security headers · Turnstile · Zod · rate limit · Stripe webhook signature · download-token attempt limit · private storage · `npm audit` · PII-safe logs · Sentry filter.

### 7.3 SEO

`Book` JSON-LD on `/book`; `Article` JSON-LD per blog post; `FAQPage` JSON-LD on `/faq`; `BreadcrumbList` on all deep routes; `Person` + `Organization` JSON-LD on `/about` and `/`. Open Graph per route. XML sitemap auto-generated. Robots.txt blocks `/admin`, `/portal`, `/download`, `/api`. See `10_FOUNDATION_FILES.md`.

### 7.4 Accessibility

WCAG 2.2 AA. Semantic HTML. Focus rings (gold on obsidian, not removed). Keyboard nav full coverage. Skip-to-content link. ARIA where semantic HTML insufficient. Contrast verified per § 6.1.

### 7.5 Reliability

SQLite WAL · Stripe auto-retry 72h · email queue retry with backoff · graceful degradation when MailerLite/Resend/Stripe down · Vercel preview deploy + smoke test before production · daily SQLite backup to Vercel Blob.

---

## 8. Content inventory

### 8.1 Book — 16 chapters, 4 parts (canonical slugs)

**Part I: Foundations of Creative Excellence**
1. `unveiling-your-creative-odyssey`
2. `refining-your-creative-toolkit`
3. `reigniting-your-creative-fire`
4. `the-art-of-networking-in-freelance-hairstyling`

**Part II: Growing Your Craft and Career**
5. `cultivating-creative-excellence-through-mentorship`
6. `mastering-the-business-of-hairstyling`
7. `embracing-wellness-and-self-care`
8. `advancing-skills-through-continuous-education`

**Part III: Leadership and Legacy**
9. `stepping-into-leadership`
10. `crafting-enduring-legacies`
11. `advanced-digital-strategies-for-freelance-hairstylists`
12. `financial-wisdom-building-sustainable-ventures`

**Part IV: The Future of the Craft**
13. `embracing-ethics-and-sustainability-in-hairstyling`
14. `the-impact-of-ai-on-the-beauty-industry`
15. `cultivating-resilience-and-well-being-in-hairstyling`
16. `tresses-and-textures-embracing-diversity-in-hairstyling`

### 8.2 Blog (initial)
- `pricing-strategy-for-freelance-hairstylists`
- `networking-secrets-for-hairstylists`
- `overcoming-creative-burnout`

### 8.3 FAQ (6 categories, 20+ Qs) — see `02_SITEMAP.md`

### 8.4 Lead magnets

| Resource | Gate | Source |
|---|---|---|
| Pricing Confidence Kit | Email required | `web/public/downloads/pricing-confidence-kit.pdf` |
| Sample Chapter (Chapter 1) | None | `web/public/downloads/sample-chapter.pdf` |

---

## 9. Launch phases (relative to `RELEASE_DATE`)

See `07_LAUNCH_TIMELINE.md` for the full relative timeline. No calendar dates are hardcoded — every phase resolves once `RELEASE_DATE` is locked. `PREORDER_OPEN = RELEASE_DATE − 90 days`.

| Phase | Window | Goal |
|---|---|---|
| Phase 0 — Build | `BUILD_START → PREORDER_OPEN` | The 22-phase build: infra, design, commerce, email, QA. The site is live and able to take a pre-order by `PREORDER_OPEN`. |
| Phase 1 — Pre-Order Campaign | `PREORDER_OPEN → T−1` (90 days) | The 90-day pre-order campaign at $15.99. Day-30 demand-validation go/no-go. |
| Phase 2 — Launch | `T` | Launch broadcast cascade, bulk pre-order fulfillment cron, paperback links go live. |
| Phase 3 — Post-Launch | `T+1 → T+90` | Nurture, review-ask, post-purchase optimization; $17.99 regular price activates at `T+15`. |

Real `RELEASE_DATE` is set during the Strategy Lock `[GATE]`.

### 9a. Owned-audience launch plan (v3 — added per LLM Council review)

The 90-day pre-order campaign needs traffic, and the bundle's most underused asset is Michael himself. The pre-order is **not** marketed primarily through an RSS-to-email cron — it is marketed through the channels Michael already owns:

- **Instagram — the primary engine.** Behind-the-scenes from the chair and from set, chapter excerpts as carousels, the "why I wrote this" story. Every post drives to `/book`.
- **Set + editorial credibility.** Michael's celebrity-roster work is the proof. Used honestly (per `claims-evidence.md`), it is the single biggest reason a stranger trusts the book.
- **Peer hairstylists.** The book's exact audience. Direct outreach, a small advance-reader group, and word of mouth inside the freelance-stylist community convert far better than cold traffic.
- **The existing email list.** Warmed first, on day one of pre-order.
- **Substack.** Owned long-form; cross-posts and the buyer-only reward (S4-E2) compound the list.

Paid acquisition (Meta / Google) stays **off** until organic-only conversion is measured through `T+30` (`BUNDLE_PRE_MORTEM.md` E9). The launch is the start of the list, not the harvest.

---

## 10. Success metrics (90 days post-launch)

| Metric | Target |
|---|---|
| Direct eBook sales | 500+ units |
| Email subscribers (MailerLite) | 2,000+ |
| Subscriber → purchase | > 3% |
| Visitor → subscriber | > 5% |
| Refund rate | < 5% |
| Email open rate | > 30% |
| Substack subscribers (cross-grown) | +500 |
| Core Web Vitals (LCP) | < 2.5s sustained |

---

## 11. Risk register

See `06_PRE_MORTEM.md` for full Tigers / Paper Tigers / Elephants, plus `BUNDLE_PRE_MORTEM.md` for the execution-path meta-tigers. Launch-Blocking Tigers C0–C10 — demand unproven, secret leak, webhook forgery, public file URL piracy, FTC preorder violation, 3D-hero perf tank, and more — all fold into the pipeline. **C0 (demand unproven)** is gated by the 90-day pre-order campaign's Day-30 go/no-go checkpoint.

---

## 12. File manifest (delta)

```
Last/
├── packages/
│   └── aciss-tokens/                 ← NEW workspace
│       ├── tokens/                   ← Style Dictionary inputs
│       ├── dist/                     ← built outputs
│       │   ├── tokens.css
│       │   ├── tailwind.config.ts
│       │   └── tokens.json
│       ├── package.json
│       └── README.md
│
├── web/
│   ├── lib/
│   │   ├── book-data.ts              ← PATCH (V4 EPUB) — see 04_BOOK_DATA_PATCH.md
│   │   ├── mailerlite.ts             ← NEW (replaces mailchimp.ts)
│   │   ├── supabase.ts               ← NEW (signed-URL delivery)
│   │   ├── substack-sync.ts          ← NEW (RSS poller)
│   │   ├── consent.ts                ← NEW (CCPA banner state)
│   │   ├── seo.ts                    ← NEW
│   │   ├── jsonld.ts                 ← NEW
│   │   └── email-sequences/          ← NEW directory
│   │       ├── welcome.ts
│   │       ├── preorder-confirmation.ts
│   │       ├── launch-reminders.ts
│   │       ├── post-purchase.ts
│   │       ├── lead-magnet-delivery.ts
│   │       └── refund-notice.ts
│   │
│   ├── public/
│   │   ├── robots.txt                ← REGENERATED
│   │   └── sitemap.xml               ← REGENERATED at build
│   │
│   ├── components/
│   │   ├── ConsentBanner.tsx         ← NEW
│   │   ├── HeroBookSpline.tsx        ← NEW (Tier-2 lazy hero)
│   │   ├── HeroBookFallback.tsx      ← NEW (static SVG)
│   │   └── BestsellerBadgeStrip.tsx  ← NEW
│   │
│   ├── styles/
│   │   └── main.css                  ← CODEMOD (teal/gold → aciss-tokens vars)
│   │
│   └── vercel.json                   ← UPDATED (CSP, headers, cron)
│
└── Final edits/MONEY/
    ├── PRD.md                        ← this file
    ├── SITEMAP.md
    ├── EMAIL_SEQUENCES.md
    ├── PRE-MORTEM.md
    ├── LAUNCH_TIMELINE.md
    ├── INTEGRATIONS.md
    ├── MOTION.md
    ├── GATES.md
    ├── GATE_LEDGER.md                ← live build log
    ├── SECURITY-LEGAL-QA.md
    └── prompts/
        ├── MASTER_AI_BUILDER_PROMPT.md
        └── (14 phase prompts)
```

---

## 13. Acceptance criteria (definition of done)

A page is **done** only when:
- It makes its **one job** obvious in five seconds — a real hairstylist lands, understands what is sold, who it is for, and why it is worth $15.99 (positioning lives in `17_WEBSITE_COPY.md`, not a placeholder)
- Desktop + mobile design pass design-critique
- One primary CTA
- SEO title + meta + OG + JSON-LD where applicable
- WCAG 2.2 AA pass (`audit` skill green)
- Loading + error states
- Analytics event fired (consent-gated)
- Legal review where the page makes a claim or collects data
- Human approval recorded in `GATE_LEDGER.md` for money / data / legal / launch surfaces

---

*This PRD is the locked brief for the studio-site-orchestrator. The orchestrator does not begin Phase 6 (scaffold) until Phases 2–5 (strategy, brief, design, architecture) gates are all approved against this document.*
