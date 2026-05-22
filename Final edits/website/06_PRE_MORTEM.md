# Pre-Mortem — Curls & Contemplation (project-specific)

Run via the `pre-mortem` skill against this specific build, not the generic OS pass. The thought experiment: *it is 14 days after the Curls launch and it failed. What went wrong?*

Risks are classified Tiger (real, evidence-backed), Paper Tiger (sounds scary, unlikely), or Elephant (unspoken). Tigers carry urgency: Launch-Blocking · Fast-Follow · Track.

**Generic OS pre-mortem fixes are inherited.** This file adds the Curls-specific Tigers the generic pass cannot surface — pricing, V4 metadata, MailerLite migration, Substack sync, IPPY/Rihanna credibility claims, multi-EPUB drift.

---

## Tigers — Launch-Blocking

| # | Risk | Evidence | Mitigation | Owner |
|---|---|---|---|---|
| C0 | **Demand is unproven.** The site, funnels, and 90-day pre-order campaign all assume hairstylists will pay $15.99 for this book — but no pre-sell test has been run. A polished, fast, compliant site with zero buyers is the single most likely launch-day-+14 failure. | The bundle audits build machinery exhaustively; not one file tested whether the buyer exists (LLM Council review, 2026-05-22). | Make the 90-day pre-order campaign a falsifiable demand test with a Day-30 go/no-go checkpoint — see **§ Demand-validation gate** below. If the pre-order floor is missed, pause spend and reassess positioning, traffic, and price before the launch push. | Michael |
| C1 | The book metadata still points at an old EPUB (`V2` or `V3`) after launch, customers get a stale file, refund spike. | Repo currently has V2, V3, V4 EPUBs. `web/lib/book-data.ts` historically pinned to a non-versioned path. | `04_BOOK_DATA_PATCH.md` lands a typed `bookData` object with `epub.filename = "CurlsAndContemplationV4.epub"` plus a `grep` check in `verify-build.sh` that fails the build if V1/V2/V3 paths reappear in `web/`. | Michael |
| C2 | Regular price ($17.99) set in production instead of the $15.99 pre-order price — customers expecting the pre-order price either bounce or chargeback when their card hits at $17.99. | Two prices in the spec; manual config drift is the default failure mode. | Stripe price IDs split into `STRIPE_PRICE_ID_PREORDER` ($15.99) and `STRIPE_PRICE_ID_REGULAR` ($17.99). `/checkout` reads `RELEASE_DATE` env + `+14d` window to pick the right ID server-side. Snapshot test in `server.test.ts`. | Michael |
| C3 | Webhook accepted without signature verification → forged "paid" events create download tokens. | Generic Tiger; doubly important here because Supabase signed URLs make leaks easy to monetize. | `web/lib/stripe.ts` rejects events whose `stripe.webhooks.constructEvent` fails. Snapshot test with a known-bad signature must fail closed. | Michael |
| C4 | Paid EPUB/PDF served from a public `/private/` path → indexed by Google or shared on a piracy site. | v1.0 PRD stored books under `/private/` next to public — same Bun process can serve them. | Supabase bucket `curls-deliverables` is **private**; per-customer signed URLs (24h TTL) regenerated on portal access; download endpoint enforces 3-download cap + 7-day expiry; refund revokes. Search-index check `site:curlsandcontemplation.com filetype:epub` post-launch. | Michael |
| C5 | FTC mail/internet-order rule violation — pre-order page promises a date without reasonable basis; date slips; no consent-or-refund flow. | Pre-order is a stated date with real money attached. | `/preorder-policy` page (Phase 15 gate) carries: real date, delay/refund language, consent flow. `verify-build.sh` checks the route exists and serves 200. | Michael / attorney |
| C6 | "Rihanna's day-to-day hairstylist" claim used on the public site without current employment status verified at launch time. | Celebrity-roster credibility is a legal claim. | Pre-launch verification: confirm the claim is currently accurate at the Strategy Lock gate. Maintain a `claims-evidence.md` log with date verified + source. Replace with "former" or specific date range if status changes. | Michael |
| C7 | IPPY Awards claim ("IPPY Awards submission — Category 47") inflated to "winner" or "finalist" without the actual award status. | Awards bodies will issue cease-and-desist for inflated claims. | Use the exact verified status only ("submission"). Update if and only if a real result is announced. Substantiation file in `claims-evidence.md`. | Michael |
| C8 | ACISS palette codemod misses a teal value buried in an inline SVG or third-party component, so launch page ships with both palettes visible. | Codemod scans `.css/.tsx/.ts` only; SVG fills inside HTML strings or imported `.svg` files might slip. | `verify-no-hardcoded.mjs` extended to also scan `.svg` and `.html` for `#2B9999` and `#C9A961`. Visual diff in Vercel preview vs current production gates the launch deploy. | Michael |
| C9 | The bestseller-badge surface displays a stale or untruthful badge ("Bestseller — 2026") that was never earned. | Badges are public claims; the credibility floor is "true." | `bestseller-badge/badges.json` is the source of truth, each entry has `verified_by` + `verified_at`. Component skips entries older than 90 days. Phase 15 legal gate must approve each badge. | Michael |
| C10 | MailerLite migration runs hot while Mailchimp is still live; sequences mail subscribers twice. | Dual-ESP risk during a 30-day migration window. | Hard switch: when MailerLite goes live, pause Mailchimp automations and freeze its API key. Re-export Mailchimp subscribers as a CSV snapshot for audit. Phase 12 gate covers this. | Michael |

## Tigers — Fast-Follow

| # | Risk | Mitigation |
|---|---|---|
| C11 | Substack RSS sync mis-tags subscribers, so the second broadcast hits people who already saw the post. | Track `Substack Synced` group per post-GUID, not as a global flag. `web/scripts/substack-cron.ts` writes one tag per `(subscriber, post_guid)` row. |
| C12 | The Spline/Lottie Tier-2 hero animation loads on mobile and blows LCP. | Gate behind `min-width: md` AND `connection.effectiveType !== "2g/3g"`. Static SVG fallback by default. |
| C13 | The exit-intent modal misfires on iOS/iPadOS where `mouseleave` semantics differ. | Use `Page Visibility API` + scroll-up + idle-after-15s combination for mobile detection. Cap to once per session via `sessionStorage`. |
| C14 | A blog post or chapter preview ships without `Article` JSON-LD, hurting SEO snippet eligibility. | Build-time `web/scripts/check-jsonld.ts` parses every `/blog/*` and `/chapter/*` route's rendered HTML and asserts `application/ld+json` is present and parseable. |
| C15 | The Pricing Confidence Kit PDF is downloaded but the email never sends because Resend rate-limits the surge at launch. | Queue lead-magnet emails via `email_queue` table; cron-driven, retry with exponential backoff, max 3 attempts. PII-safe error logs. |
| C16 | Substack RSS endpoint moves or rate-limits, breaking sync silently. | Cron has a `last_successful_sync_at` watermark and fires a Sentry alert if > 24h. |

## Tigers — Track (monitor, not blocking)

| # | Risk | Mitigation |
|---|---|---|
| C17 | A second-edition or revision rolls in 6 months and `book-data.ts` carries V4 forever. | Versioning convention: `book-data.ts` carries a `revision` field; `epub.filename` is the only path of truth; V5+ overrides at one place. |
| C18 | Stripe Tax + foreign VAT issues for non-US buyers. | Enable Stripe Tax on the product; review post-launch sales by country; revisit at 60 days. |
| C19 | The portfolio site `michaeldavidjr.beauty` drifts from the book site's cross-canonical assumptions. | Both sites consume `packages/aciss-tokens`. Quarterly cross-canonical audit. |

---

## Paper Tigers

| Risk | Why it isn't real here |
|---|---|
| "We need a Next.js rewrite for SEO." | The site is a single-page SPA serving 30 routes with static meta + JSON-LD. Static + prerendered OG is sufficient. SSR is over-engineering. |
| "We need a custom CMS for the blog." | Three launch posts. `web/lib/blog-data.ts` is fine. Migrate to Sanity/Contentful only if post volume > 50. |
| "Amazon will retaliate if we sell direct." | Amazon doesn't retaliate against direct sales — it doesn't even notice for a single-title author. The pre-order revenue + launch list are the moat. |
| "We need to translate the site into 5 languages." | English-first audience. Multilingual is a Phase-3 question (90 days post-launch), not a launch question. |
| "The cron will hammer Resend during launch." | Pre-orders fulfill via a single bulk cron with batching (max 100 emails per run). Resend's documented limits are well above the launch list size. |

---

## Elephants (unspoken)

| Elephant | Surfacing it |
|---|---|
| The "launch" might quietly become an indefinite pre-order if the date keeps slipping. Each slip without consent-or-refund violates FTC. | Strategy Lock gate sets a date. Any slip triggers the `/preorder-policy` consent-or-refund flow. Approval ledger records each slip with a reason. |
| Michael's celebrity-roster credibility is the marketing engine, and it can change overnight (gig ends, schedule moves). | `claims-evidence.md` carries the dated source for every claim. Strategy Lock gate verifies the claim is currently accurate at launch. The book stands on its own — the claims are not load-bearing for the product. |
| Substack and the book site fight for the same email address. The owned-audience moat fractures if the two lists diverge. | The Substack sync is one-way: site → Substack invite via S1-E2 footer link. Substack sign-ups are surfaced back to MailerLite via a buyer-only post that requires a referral parameter. Single source of truth = MailerLite. |
| "Studio-grade" becomes the excuse for missing the launch date. Conversion-first wins; polish ships after. | Definition of done is conversion-first. The pre-mortem itself is a gate — it blocks launch only on the named launch-blockers, not on polish. |
| The IPPY result, if it lands, reshapes the entire marketing — but the date is out of Michael's control. | Pre-launch comms do not depend on an IPPY result. Post-result comms have a draft sequence ready to go (S3.5 variant) gated by a yes/no flag in `.env`. |
| Refunds from people who bought, downloaded, and kept the file. | Refund revokes the token — but the file is already on the customer's machine. Refund rate target < 5%. Above 5% triggers a content/expectation audit, not a piracy hunt. |

---

## Demand-validation gate (v3 — added per LLM Council review, 2026-05-22)

The 90-day pre-order campaign is itself the demand test. Make it **falsifiable** so a weak signal stops the spend instead of being explained away.

- **90-day target.** Michael sets a real pre-order number before pre-order opens. A reasonable floor for a first book from a warm-ish audience: **75–150 pre-orders**. Write the chosen number into `GATE_LEDGER.md` at Strategy Lock.
- **Day-30 checkpoint.** At pre-order Day 30, pre-orders should be **≥ ~25%** of the 90-day target. Pre-order curves are front- and back-loaded; ~25% by Day 30 is a healthy mid-campaign reading.
- **Go** — on or above the line → continue to the launch push as planned.
- **No-go** — below ~25% → **stop the marketing spend.** Reassess, in this order: (1) positioning and sales copy (`17_WEBSITE_COPY.md`), (2) the traffic source, (3) the price, (4) whether to launch at all. Do not "push harder" on a funnel that isn't converting.
- **Abort line** — below **~10%** of target by Day 30 → the offer or the audience is wrong. Do not proceed to a paid launch; rework the offer first.

This gate exists because every other risk in this file assumes people want the book. C0 is the risk that they don't — and it is the cheapest one to test early.

---

## Launch-blocker gate

The pre-mortem skill is a **`[GATE]` at Phase 19**. The gate cannot be approved until every Launch-Blocking Tiger (C0–C10) has a green check in `GATE_LEDGER.md` with:

- the test that proves it's fixed
- the file path of the fix
- the date and the approver

Fast-Follow Tigers are scheduled in the post-launch sprint (Phase 3, T+1 to T+14). Track items are reviewed at T+30.

---

## Verification log (to be filled at Phase 19)

| Tiger | Status | Evidence | Approved by | Date |
|---|---|---|---|---|
| C0 Demand proven | | Day-30 pre-order checkpoint ≥ floor | | |
| C1 V4 metadata | | grep + test passed | | |
| C2 Pricing tiers | | snapshot test passed | | |
| C3 Webhook signature | | snapshot test failed-closed | | |
| C4 Private storage | | `site:` search clean | | |
| C5 FTC preorder | | `/preorder-policy` 200 | | |
| C6 Rihanna claim | | dated source in `claims-evidence.md` | | |
| C7 IPPY claim | | dated source in `claims-evidence.md` | | |
| C8 Palette codemod | | verify-no-hardcoded green | | |
| C9 Bestseller badge | | badges.json verified | | |
| C10 MailerLite cutover | | Mailchimp keys frozen | | |

---

*This pre-mortem is the project-specific layer on top of the generic OS one. Both must be green before the Pre-Mortem `[GATE]` at Phase 19 closes.*

---

## Cross-reference: Bundle meta pre-mortem (B1–B19 + E1–E10)

After this project pre-mortem was written, a **second pre-mortem** was run against the handoff bundle itself — the meta-pass per Klein 2007 — producing `BUNDLE_PRE_MORTEM.md`. That file surfaces ten additional Launch-Blocking Tigers (B1–B10), six Fast-Follow (B11–B16), three Track (B17–B19), and ten Elephants (E1–E10) specific to the **execution path** rather than the product itself.

**The Phase 19 Pre-Mortem Review gate covers BOTH files.** It cannot close until:

- [ ] Every C-prefix Tiger (C0–C19) in this file has evidence + status in `GATE_LEDGER.md`
- [ ] Every B-prefix Tiger (B1–B19) in `BUNDLE_PRE_MORTEM.md` has evidence + status
- [ ] Every E-prefix Elephant (E1–E10) has been acknowledged in writing

Quick map of the most load-bearing meta-tigers (read `BUNDLE_PRE_MORTEM.md` for full):

| ID | Risk | Fix lives in |
|---|---|---|
| B1 | `web/` not verified working before bundle overlay | `08_MASTER_AI_BUILDER_PROMPT.md` Phase 0 |
| B2 | Codemod missed `.html/.svg/.tex/.py` files | `03_ACISS_TOKENS_SPEC.md` codemod |
| B3 | Pricing TZ math ambiguous | `04_BOOK_DATA_PATCH.md` `activeTierAt()` |
| B4 | Mailchimp→MailerLite hard cutover risky | `05_EMAIL_SEQUENCES.md` dual-write window |
| B5 | Supabase single-vendor dependency | `11_INTEGRATION_PLAYBOOK.md § 21.5` Blob fallback |
| B6 | Orchestrator v1.0.0 first-flight risk | `07_LAUNCH_TIMELINE.md` Week -1 dry-run |
| B7 | Webhook signature test was checklist-only | `04_BOOK_DATA_PATCH.md § 5` real `server.test.ts` |
| B8 | V4 EPUB never validated against epubcheck | `14_SECURITY_LEGAL_QA.md § B.5.1` |
| B9 | `claims-evidence.md` referenced but absent | `claims-evidence.md` in bundle |
| B10 | Bus-factor of 1 on all 9 gates | `13_HUMAN_APPROVAL_GATES.md § Gate roster` |
