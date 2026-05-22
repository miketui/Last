# Curls & Contemplation — Studio Handoff Bundle v3

**Project:** Curls & Contemplation: A Freelance Hairstylist's Guide to Creative Excellence
**Author:** Michael David Warren Jr. (Michael David)
**Publisher:** TAYLKOMB LLC
**Repo:** https://github.com/miketui/Last (path: `Final edits/MONEY`)
**Build OS:** `studio-site-build-os` v1.0.0
**Design System:** ACISS — Obsidian leads, Gold elevates, Jade distinguishes
**Date:** 2026-05-22
**Status:** Pre-Launch — Pre-Order phase

---

## What's in this bundle

This bundle turns your existing `Last/web/` site into a bestseller-worthy, conversion-driven, ACISS-aligned platform that runs through the full 22-phase Studio Site Build OS pipeline. Every prompt hardcodes the skills, slash commands, MCP servers, plugins, and connectors needed to execute. Nothing assumes — every gate stops for explicit approval.

```
curls-handoff-bundle-v3/
├── 00_README.md                       ← this file
├── 01_WEBSITE_PRD_FINAL.md            ← FINAL PRD (v3.0)
├── 02_SITEMAP.md                      ← all routes + SEO titles, meta, OG, JSON-LD
├── 03_ACISS_TOKENS_SPEC.md            ← packages/aciss-tokens workspace + Style Dictionary
├── 04_BOOK_DATA_PATCH.md              ← exact diff for web/lib/book-data.ts (V4 EPUB)
├── 05_EMAIL_SEQUENCES.md              ← all 7 sequences, full HTML + plain-text copy
├── 06_PRE_MORTEM.md                   ← project-specific Tigers/Paper Tigers/Elephants
├── 07_LAUNCH_TIMELINE.md              ← Phase 0–3, relative to RELEASE_DATE · 90-day pre-order
├── 08_MASTER_AI_BUILDER_PROMPT.md     ← orchestrator with every skill/MCP hardcoded
├── 09_PROMPT_LIBRARY.md               ← 14 chain-of-thought prompts per phase
├── 10_FOUNDATION_FILES.md             ← robots/sitemap/seo/jsonld/.env/vercel/substack-sync
├── 11_INTEGRATION_PLAYBOOK.md         ← all 3rd-party configs: Stripe/MailerLite/Supabase/Resend/Vercel/Sentry/Datadog/GA4/Substack/Figma/Adobe/Higgsfield + OAuth flows
├── 12_3D_AND_MOTION_SPEC.md           ← Motion (motion/react) layer + Tier-2 hero spec
├── 13_HUMAN_APPROVAL_GATES.md         ← scoped gate ledger for money/data/legal/launch
├── 14_SECURITY_LEGAL_QA.md            ← FTC preorder, CCPA/CPRA, WCAG 2.2 AA checklist
├── 15_FUNNEL_GENERATOR_PROMPT.md      ← paste-ready prompt — 4 high-conversion funnels (F1–F4)
├── 16_SEO_AND_DISCOVERY.md            ← paste-ready prompt — full L1–L7 discoverability playbook
├── 17_WEBSITE_COPY.md                 ← real sales copy — home hero, /book argument, bonus bundle, FAQ
├── BUNDLE_PRE_MORTEM.md               ← meta pre-mortem on this bundle (B1–B19 Tigers, E1–E10 Elephants)
├── claims-evidence.md                 ← required substantiation template (pre-mortem B9)
└── PUSH_TO_REPO.md                    ← idempotent push script (bash + PowerShell) + 4 paths to land
```

**Pre-mortem applied.** The bundle has been hardened against B1–B19 + E1–E10. Key fixes baked in:

- **B1** — Phase 0 first action smoke-tests `web/` (see `08`)
- **B2** — codemod now sweeps `.html/.svg/.tex/.py` (see `03`)
- **B3** — pricing math pinned to UTC with snapshot test (see `04`, `09`)
- **B4** — 7-day MailerLite + Mailchimp dual-write cutover (see `05`, `09`, `11`)
- **B5** — Vercel Blob fallback for Supabase outage (see `09`, `11`)
- **B6** — orchestrator dry-run scheduled during the Phase 0 build (see `07`, `08`)
- **B7** — webhook signature test is a real `server.test.ts` case (see `04`, `09`)
- **B8** — `epubcheck` required before Phase 11 (see `07`, `14`)
- **B9** — `claims-evidence.md` is a required artifact (see `14`, file in bundle)
- **B10** — backup approver named for non-money gates (see `13`)
- **B11–B16** — fast-follow tigers wired into `11_INTEGRATION_PLAYBOOK.md § 21.5–21.9`

---

## How to use this bundle (by environment)

### In Claude Code (recommended for actual build)

1. Clone `Last` repo locally and `cd Last/`.
2. Copy `.claude/skills/` from `studio-site-build-os` into the repo (orchestrator + security-legal-qa + human-approval-gate).
3. Drop this entire bundle into `Final edits/MONEY/handoff/`.
4. Open Claude Code. Paste **`08_MASTER_AI_BUILDER_PROMPT.md`** as your first message.
5. Approve each `[GATE]` explicitly. Use `09_PROMPT_LIBRARY.md` for per-phase rerolls.

### In Cowork (Claude desktop / this environment)

1. Open the project folder via `mcp__cowork__request_cowork_directory` so I can read/write the repo.
2. Run `/studio` to invoke the studio-site-workflow skill.
3. I produce artifacts; you run terminal steps (npm install, vercel deploy, claude mcp add, etc.).

### In Claude.ai (browser)

1. Upload this bundle as project knowledge.
2. Use `08_MASTER_AI_BUILDER_PROMPT.md` as the system message.
3. Artifacts ship via `present_files`. Terminal steps belong to you.

---

## The two laws (non-negotiable)

1. **Brief before code.** Phases 2–5 lock strategy, brief, design, architecture before scaffolding.
2. **Human gate before money/data/legal/launch.** Phases 2, 3, 4, 5, 11, 12, 15, 19, 20 are `[GATE]`. See `13_HUMAN_APPROVAL_GATES.md`.

---

## Stack (locked — do not substitute)

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 18.2+ + Vite + TypeScript (strict) | Vite over Next.js; SSR is over-engineering for this site |
| Runtime (existing site) | Bun + SQLite | Preserved at `web/`; ACISS palette overlays on top |
| Styling | Tailwind CSS + `packages/aciss-tokens` | ACISS via Style Dictionary; never freelance colors |
| Animation | **Motion** (`motion/react`) | formerly Framer Motion; **not** GSAP, not Three.js on the sales path |
| Email capture | **MailerLite** (`warrenm115@gmail.com`) | new primary; Mailchimp deprecated, Resend stays for transactional |
| Transactional email | **Resend** | unchanged — DKIM/SPF/DMARC already warm |
| Hosting | **Vercel** | `vercel.json` + serverless functions; preview → production gate |
| DNS | **Namecheap** | confirm CNAME/A before flipping the apex |
| Payments | **Stripe** | pre-order $15.99 / $17.99 regular; webhook signature verified |
| Database / auth / file storage | **Supabase** | signed-URL EPUB delivery (replaces local /private serving) |
| Bot protection | **Cloudflare Turnstile** | every public form |
| Analytics | **GA4** | consent-mode; CCPA/CPRA banner required |
| Monitoring | **Sentry** | PII-safe configuration |
| Substack sync | RSS poll → MailerLite broadcast | net-new in this bundle |

---

## ACISS palette (locked)

| Token | Hex | Role |
|---|---|---|
| Obsidian | `#0E0D0B` | Background, primary text, surfaces (warm rich black, not pure black) |
| Gold | `#B89968` | Accent, CTAs, premium signals (antique champagne, not yellow-gold) |
| Jade | `#1F6F6B` | Secondary accent, links, distinguishing detail (deep jade, not Tiffany teal) |

**Philosophy:** Black leads. Gold elevates. Jade distinguishes.

**Migration note:** the v1.0 PRD's teal `#2B9999` and Cinzel Decorative + Libre Baskerville stack is **superseded**. Existing teal references in `web/styles/main.css` will be swept and replaced. See `03_ACISS_TOKENS_SPEC.md` for the codemod.

---

## Final pricing (locked)

| Item | Price | Format |
|---|---|---|
| eBook — pre-order (90-day campaign, direct site) | **$15.99** | EPUB (V4) + PDF + bonus bundle, secure download via Supabase signed URL |
| eBook — regular (post-launch, direct site) | **$17.99** | EPUB (V4) + PDF + bonus bundle |
| eBook — Amazon Kindle (external) | $9.99 | Kindle format only; managed on KDP, not by this bundle. The direct price stays **≥ $9.99** so Amazon cannot price-match it down. |
| Pricing Confidence Kit (lead magnet) | Free | PDF, gated by email |
| Sample Chapter (Chapter 1) | Free | PDF, ungated |
| Paperback | TBD | Amazon / B&N / Waterstones / Indigo (external links only) |

The direct site sells above the $9.99 Kindle edition because it includes the **bonus bundle** — both formats (EPUB + PDF), the Pricing Confidence Kit, the chapter workbook, free lifetime updates, and a pre-order-only bonus chapter. The bundle is the reason to buy direct. Full copy in `17_WEBSITE_COPY.md`.

Stripe price IDs to set in `.env.production`:
- `STRIPE_PRICE_ID_PREORDER=price_xxxxx` (pre-order $15.99)
- `STRIPE_PRICE_ID_REGULAR=price_xxxxx` (regular $17.99)

---

## Credibility stack (use everywhere — proof not puffery)

- **Rihanna's day-to-day hairstylist** (current)
- **IPPY Awards submission** — Category 47
- **Training under Guido Palau and Jimmy Paul**
- **Celebrity/editorial roster** (named on `/about` only — verified consent)

Every claim above carries an evidence link in the build log per `14_SECURITY_LEGAL_QA.md` § Claims.

---

## File map: what belongs where in `Last/`

| Bundle file | Destination |
|---|---|
| `01_WEBSITE_PRD_FINAL.md` | `Last/Final edits/MONEY/PRD.md` (replaces `web/PRD.md`) |
| `02_SITEMAP.md` | `Last/Final edits/MONEY/SITEMAP.md` |
| `03_ACISS_TOKENS_SPEC.md` | `Last/packages/aciss-tokens/README.md` (workspace) |
| `04_BOOK_DATA_PATCH.md` | apply to `Last/web/lib/book-data.ts` |
| `05_EMAIL_SEQUENCES.md` | `Last/web/lib/email-sequences/*.ts` (one file per sequence) |
| `06_PRE_MORTEM.md` | `Last/Final edits/MONEY/PRE-MORTEM.md` |
| `07_LAUNCH_TIMELINE.md` | `Last/Final edits/MONEY/LAUNCH_TIMELINE.md` |
| `08_MASTER_AI_BUILDER_PROMPT.md` | paste into Claude Code first message |
| `09_PROMPT_LIBRARY.md` | `Last/Final edits/MONEY/prompts/` (14 .md files) |
| `10_FOUNDATION_FILES.md` | scattered across `web/public/`, `web/lib/`, repo root |
| `11_INTEGRATION_PLAYBOOK.md` | `Last/Final edits/MONEY/INTEGRATIONS.md` |
| `12_3D_AND_MOTION_SPEC.md` | `Last/Final edits/MONEY/MOTION.md` |
| `13_HUMAN_APPROVAL_GATES.md` | `Last/Final edits/MONEY/GATES.md` |
| `14_SECURITY_LEGAL_QA.md` | `Last/Final edits/MONEY/SECURITY-LEGAL-QA.md` |
| `15_FUNNEL_GENERATOR_PROMPT.md` | `Last/Final edits/website/15_FUNNEL_GENERATOR_PROMPT.md` |
| `16_SEO_AND_DISCOVERY.md` | `Last/Final edits/website/16_SEO_AND_DISCOVERY.md` |
| `17_WEBSITE_COPY.md` | `Last/Final edits/website/17_WEBSITE_COPY.md` |
| `BUNDLE_PRE_MORTEM.md` | `Last/Final edits/website/BUNDLE_PRE_MORTEM.md` |
| `claims-evidence.md` | `Last/Final edits/website/claims-evidence.md` |
| `PUSH_TO_REPO.md` | `Last/Final edits/website/PUSH_TO_REPO.md` |

---

## Quick start (one paste)

Open Claude Code in the `Last/` repo. Paste this:

```
Use the studio-site-orchestrator skill from .claude/skills/ to run the 22-phase pipeline on this repo.

Read Final edits/MONEY/PRD.md as the brief. Run Phase 0 (env + tool verify). Stop at every [GATE] for my explicit approval. Hardcode the skill, slash-command, MCP-server, plugin, and connector inventory from Final edits/MONEY/prompts/MASTER_AI_BUILDER_PROMPT.md.

Brief is locked. ACISS palette is locked. Stack is locked. Stripe prices: $15.99 pre-order / $17.99 regular. 90-day pre-order campaign. Release date: [confirm with me].
```

Then approve each gate as it comes up.

---

## What's NOT in this bundle (intentionally)

- **Finder's Book handoff** — locked for next turn. You'll brief premise, audience, lead magnet, launch phase. Bundle structure will mirror this one with Family Clarity System™ branding + Cormorant Garamond + Inter + Heritage Gold `#B8923D` already pulled from your `finders-book-phase3` repo.
- **Actual code rewrites** — every prompt in `09_PROMPT_LIBRARY.md` produces code when run. The bundle itself is the contract, not the build.
- **Live API keys** — `.env.example` is variable names only. Real values live in Vercel env vars, never the repo.
- **Attorney-reviewed legal copy** — `15_SECURITY_LEGAL_QA.md` defines what each legal page must contain. The actual copy is approved by you or your attorney at the legal-publication gate.

---

*Bundle generated 2026-05-22 against `miketui/Last` @ `main` and `miketui/finders-book-phase3` @ `main`. Re-verify any plugin slug in `/plugin > Discover` per `STUDIO_SITE_BUILD_OS.md` § Tool & asset inventory.*
