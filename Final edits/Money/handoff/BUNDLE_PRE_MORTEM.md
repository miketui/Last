# Pre-Mortem — Curls Handoff Bundle v2 (Meta)

**Method:** `/anthropic-skills:pre-mortem` per Klein 2007 / Kahneman 2011.
**Subject:** the 17-file `curls-handoff-bundle-v2` and the launch process it prescribes for Michael David Warren Jr.'s first book launch.
**Scope:** **bundle + execution** — not the website artifacts themselves (those are covered in `06_PRE_MORTEM.md`). This is the meta-pass: what could go wrong with the handoff itself, the orchestrator workflow, and the solo-operator launch reality.
**Run date:** 2026-05-22
**Anchor failure date:** 2026-07-17 (14 days after a 2026-07-03 launch)

---

## The thought experiment

> *"It is 2026-07-17. The launch missed pre-order target by 60%. The launch list never crossed 600 subscribers. A wave of refund requests hit on Day 7 about download issues. Search Console shows two routes de-indexed. The Substack sync silently broke during launch week. Michael is exhausted. What went wrong?"*

---

## Summary distribution

| Class | Count |
|---|---|
| Tigers — Launch-Blocking | **10** |
| Tigers — Fast-Follow | **6** |
| Tigers — Track | **3** |
| Paper Tigers | **5** |
| Elephants | **10** |

**Verdict:** The bundle is comprehensive but its biggest risks are **operator-shaped** (solo bus-factor, emotional investment, attention budget) and **integration-shaped** (third-party assumptions never tested), not content-shaped. Every Launch-Blocking Tiger has a named mitigation already inside the bundle — but four of those mitigations require *actually doing the test*, not just documenting it.

---

## Tigers — Launch-Blocking (10)

| # | Risk | Evidence | Mitigation | Owner | Decision date |
|---|---|---|---|---|---|
| **B1** | The existing `Last/web/` Bun + SQLite site hasn't been verified working in months. The bundle assumes ACISS/Motion/MailerLite overlays on a working base. If `web/server.ts` doesn't boot clean, every Phase 6+ step blocks. | Repo recon showed 292 commits across many branches; CLAUDE.md mentions setup steps that imply non-trivial state. No CI status visible on the public repo page. | Phase 0 first action: clone, `bun install`, `bun --hot server.ts`, smoke every route from SITEMAP.md. Document baseline. If broken, fix or rebuild *before* anything else lands. | Michael | T-21 (2026-06-12) |
| **B2** | ACISS codemod (`03_ACISS_TOKENS_SPEC.md § 5`) only sweeps `.css/.tsx/.ts`. The repo also contains `.html`, `.tex`, `.py`, `.svg` files. Legacy teal `#2B9999` or champagne `#C9A961` will survive in OEBPS, pdf/, pub/, generate-pod-pdf.py — and could leak into OG images, PDF print, EPUB internal CSS. | Repo languages: HTML 64%, TeX 17%, CSS 4%, Python 1%. The verify script only checks 3 file types. | Extend `verify-no-hardcoded.mjs` to scan `.html, .svg, .tex, .py`. Run codemod across all of them. CI fails on any legacy hex in any source file. | Michael | T-21 |
| **B3** | Dual pricing ($17.99 launch / $19.99 regular) flips at `RELEASE_DATE + 14d`. The bundle never specifies the timezone. A buyer at 11:59pm PT on Day 14 vs 12:01am ET sees different prices — and one of them is now wrong. Chargeback risk. | Pricing logic in `04_BOOK_DATA_PATCH.md § 2` and `09_PROMPT_LIBRARY.md P9` reads `RELEASE_DATE` but doesn't pin TZ. | Pin pricing math to UTC. `RELEASE_DATE` stored as ISO 8601 UTC. Server reads `Date.now() < RELEASE_DATE_UTC + 14d * 86400000`. Document in `/preorder-policy`. Add snapshot test for boundary moments. | Michael | T-14 (2026-06-19) |
| **B4** | MailerLite primary cutover is hard, with no overlap period. If MailerLite API key, group IDs, or automation triggers misfire on Day 1, no subscriber lands anywhere — silent black-hole launch. | `01_WEBSITE_PRD_FINAL.md § 4.1 F44` says "replace Mailchimp." `07_LAUNCH_TIMELINE.md` Day 5 sets MailerLite up but doesn't test against real signups. | 7-day dual-write window: every signup writes to both Mailchimp and MailerLite. Mailchimp pauses sends but continues capture. Cutover only after 100 real signups land in MailerLite cleanly. | Michael | T-7 (2026-06-26) |
| **B5** | Supabase signed-URL strategy has no fallback for a Supabase outage. If the storage API is down on Day 7 (the refund wave window), refund-triggered access revocation can't proceed and paid customers get errors instead of files. | Single-vendor dependency. `01_WEBSITE_PRD_FINAL.md § 4.1 F43` and `09_PROMPT_LIBRARY.md P10` don't specify a fallback. | Tier-2 fallback: on Supabase 5xx, serve the file from a Vercel Blob private mirror with a 24h signed URL. Sync the bucket nightly. Document in `INTEGRATIONS.md § 22`. | Michael | T-7 |
| **B6** | The studio-site-orchestrator skill is v1.0.0 — first real use. Skill bugs, ambiguous instruction handling, or non-deterministic phase decisions could derail the launch mid-pipeline. There's no fallback orchestrator. | The OS itself notes it's tested on this build. Generic OS pre-mortem covered tool drift; this is the first-flight risk. | Run Phase 0–5 (brief lock through architecture) end-to-end on a `--dry-run` flag *before* T-21. If orchestrator output diverges from this PRD, file an issue + fall back to running `09_PROMPT_LIBRARY.md` prompts manually per phase. | Michael | T-28 (2026-06-05) |
| **B7** | Webhook signature verification is well-specified, but the integration test in `09_PROMPT_LIBRARY.md P9 § 6` is a *checklist item*, not an executable test. Easy to mark "done" without running. A forged webhook on launch day creates download tokens for free. | Pre-mortem's own observation: documented tests skip more often than coded tests. C3 in `06_PRE_MORTEM.md` mitigates the bug, not the human skip. | Convert the signature test into a real `server.test.ts` case that sends a forged event and asserts a 400. CI fails if the test isn't present. Phase 11 gate cannot close without the test going green in a CI run. | Michael | T-14 |
| **B8** | The bundle assumes the V4 EPUB passes epubcheck. If it doesn't, paid customers can't open the file on Kindle, Apple Books, or Calibre — instant refund spike. Bundle never references an epubcheck run. | Repo has V2, V3, V4 EPUBs but no CI step that runs epubcheck. `04_BOOK_DATA_PATCH.md` and `01_WEBSITE_PRD_FINAL.md § 4.1` both assume V4 is shippable. | Run `epubcheck CurlsAndContemplationV4.epub` (use the `epub-production` skill). Output green report into `Final edits/website/EPUBCHECK_REPORT.md`. Phase 11 gate cannot close if epubcheck fails. | Michael | T-21 |
| **B9** | `claims-evidence.md` is referenced but doesn't exist yet. Every public claim on `/`, `/about`, `/book` (Rihanna, IPPY, Guido Palau, Jimmy Paul) ships without substantiation logged. Legal exposure + retraction risk. | `06_PRE_MORTEM.md` C6/C7, `14_SECURITY_LEGAL_QA.md § B.5` reference the file. None of the 17 bundle files create it. | Create `Final edits/website/claims-evidence.md` with: claim text, source (URL/document/witness), date verified, expiry condition. Re-verify at T-7 and Strategy Lock gate. | Michael | T-21 |
| **B10** | Michael is the sole approver for all 9 gates **and** the talent **and** the operator **and** the designer **and** the marketer. Single point of failure for the entire launch. Any 48-hour unavailability (illness, gig, family) derails the timeline. | `13_HUMAN_APPROVAL_GATES.md § Gate roster` lists only Michael. No co-approver, no backup. | Identify one backup approver for non-money gates (a trusted peer — not necessarily for payment activation, but for design lock, brief lock, pre-mortem review). Document in `GATE_LEDGER.md`. If unavailable, accept the bus-factor as conscious. | Michael | T-21 |

---

## Tigers — Fast-Follow (6)

| # | Risk | Mitigation |
|---|---|---|
| **B11** | Substack RSS sync has minimal backoff. Substack rate-limits silently; the cron logs a warning Michael won't read until the second Substack post fails to broadcast. | Set Datadog monitor on `last_successful_sync_at` watermark. Page if > 24h. Implement exponential backoff (1m → 5m → 30m → fail). |
| **B12** | The PR Tier-1 outreach (Allure, Vogue, Refinery29) is aspirational. Without warm intros, cold-pitch response rate is ~0–2%. Energy spent here could be redirected to higher-ROI surfaces. | Time-box Tier-1 outreach to 6 hours total. Shift 80% of PR effort to Tier-2 (Behind the Chair, Modern Salon) where response rates are 10–20% and align with the launch list audience. |
| **B13** | The funnel generator prompt produces drafts. Variant tests are statistically meaningless until 1000 sessions per arm. For the first 30 days, every "winning variant" call is noise. | Defer variant tests until T+30 minimum. Run a single non-test variant during launch week. Use the generator prompt for the T+30 cycle. |
| **B14** | GA4 + consent banner is well-specified, but iOS/Safari ITP erodes attribution. By T+30, organic-from-paid attribution will be off by 20–40% — and the variant tests in B13 will be even noisier. | Adopt server-side conversion tracking (Stripe metadata → GA4 Measurement Protocol) for the conversion event. Treat client-side GA4 as directional only. |
| **B15** | Two ESPs (Resend transactional + MailerLite marketing) double launch-day moving parts. A misfire in either is a customer-facing failure. | Pre-launch: send a dummy transactional + a dummy marketing send 1h apart on T-3. Verify inbox placement on Gmail, Apple, Outlook. If either lands in Promotions, troubleshoot before launch. |
| **B16** | Lighthouse 95+ perf on mobile with Spline hero is aspirational. The fallback gate exists (`12_3D_AND_MOTION_SPEC.md`) but hasn't been tested with the V4 cover on a mid-tier Android. | Test on a $200 Android (the real-world median); if hero hits the budget, ship; if not, `HERO_3D_ENABLED=false` from launch and revisit T+30. |

---

## Tigers — Track (3)

| # | Risk | Watch |
|---|---|---|
| **B17** | V5/V6 EPUB someday — `book-data.ts` versions filename but not revision metadata. | Add a `revision` field at V5 time. Not a launch-blocker. |
| **B18** | EU/UK VAT — Stripe Tax handles US but international VAT is incomplete. | Monitor international sales > 5% of revenue; address if it crosses threshold. |
| **B19** | 90-day retrospective scheduled but cancellable under post-launch fatigue. | Pre-book the retrospective on Michael's calendar at T+88 (`mcp__plugin_small-business_google_calendar` if connected). Make it a calendar invite, not a doc. |

---

## Paper Tigers (5)

| Risk | Why it isn't real |
|---|---|
| "Amazon will retaliate against direct sales." | Amazon doesn't notice single-title authors at this scale. Direct-sell + KDP coexist routinely. |
| "We need a Next.js / SSR rewrite for SEO." | Single-author preorder site with 30 routes. Static meta + JSON-LD is sufficient. Lighthouse SEO 100 reachable on the current stack. |
| "Multi-language site needed at launch." | English-first audience. Spanish or French is a Phase-3 question. |
| "A competitor will copy the funnel." | Execution + Michael's celebrity-roster credibility are the moat. Markup is not. |
| "Vercel can't handle launch traffic." | Even a viral launch day for an author is ~10K sessions. Vercel's auto-scaling handles this without intervention. |

---

## Elephants (10) — the unspoken risks

| # | Elephant | Acknowledge / Assess / Decide |
|---|---|---|
| **E1** | Michael's emotional investment in his first book launch will override gate discipline under pressure. The bundle is process-armor; the operator can disarm it. | **Acknowledge:** named explicitly. **Assess:** real Tiger in disguise. **Decide:** the human-approval-gate ledger is the structural fix. Print it out. Put it next to the laptop. Approve in writing, not just verbally. |
| **E2** | 5,776 lines of bundle. Realistic chance Michael skims, not reads. Critical decisions live in single sentences that get missed. | **Acknowledge:** named. **Assess:** Track. **Decide:** Read the 7 surfaced files end-to-end before Strategy Lock. The other 10 are reference material; skim the table of contents in each. |
| **E3** | "Rihanna's day-to-day hairstylist" is the marketing engine and is *current* — gigs end. If the relationship changes pre-launch, the entire credibility stack is exposed. | **Acknowledge:** named in `06_PRE_MORTEM.md` C6. **Assess:** Tiger. **Decide:** verify current at every gate. Have a "former" fallback copy ready. The book stands on its own; the celebrity claim is amplification, not foundation. |
| **E4** | The book itself (V4 EPUB) hasn't been independently QA'd in this bundle's context. Maybe it has — but the bundle assumes it. A bad book + a great site = bad outcome. | **Acknowledge:** named. **Assess:** depends on prior QA. **Decide:** confirm 2+ real readers (not Michael, not co-author) have read V4 end-to-end and signed off on quality before Strategy Lock. Refund rate target < 5% requires content that earns it. |
| **E5** | studio-site-build-os is Michael's own framework. First production use is his own launch. If it fails here, it's a confidence-shaking moment for both the site AND the framework. | **Acknowledge:** named. **Assess:** Track. **Decide:** dry-run Phase 0–5 (B6 mitigation). Document the bugs. The framework getting better through this launch is acceptable; the launch failing because of the framework is not. |
| **E6** | No warmed launch list. "2000 subscribers by T+90" assumes the lead-magnet flywheel works on cold traffic. Without warm intros, that's a steep ask. | **Acknowledge:** named. **Assess:** real risk to the success-metric, not to the launch. **Decide:** soften the T+90 target if cold-traffic conversion underperforms by T+30. The launch is the start of the list, not the harvest. |
| **E7** | Solo operator burnout. Michael is design + code + copy + ops + marketing + the talent. The bundle creates leverage but the executor is one person. | **Acknowledge:** named. **Assess:** Track. **Decide:** identify three things Michael will NOT do during launch week (no new content, no podcast bookings, no personal commitments). Time-box the launch to 4 working hours/day. If exceeded > 3 days running, pause. |
| **E8** | IPPY Award decision is out of Michael's hands. Momentum depends partly on whether a result lands pre-launch. | **Acknowledge:** named in `06_PRE_MORTEM.md` Elephant. **Assess:** unrelated to bundle quality. **Decide:** pre-write the "if IPPY result" comms variant per `06_PRE_MORTEM.md`. The launch must succeed without it. |
| **E9** | $19.99 is high for an indie hairstylist business book. Conversion economics may not support paid acquisition. | **Acknowledge:** named. **Assess:** Track. **Decide:** measure organic-only conversion through T+30 before spending on Meta/Google ads. If LTV < CAC, lower price or drop the paid funnel; do not raise CAC. |
| **E10** | Finder's Book "next turn" handoff assumes Michael has time to spec a second site while launching the first. Realistic? Maybe not. | **Acknowledge:** named. **Assess:** elephant + opportunity cost. **Decide:** Finder's Book brief lock comes T+30 at the earliest. The launch + 30-day stabilization comes first. |

---

## Mitigation summary — owner + decision date

All 10 Launch-Blocking Tigers have:
- Named owner: Michael (all 10)
- Decision date: between T-28 (2026-06-05) and T-7 (2026-06-26)
- Concrete mitigation embedded in this file

The Phase 19 `[GATE]` (Pre-Mortem Review) cannot close until every row in the table above has a green check in `GATE_LEDGER.md`.

---

## Elephant escalation flags

Three Elephants warrant explicit re-classification as Tigers (per skill heuristic — "the room got quiet"):

- **E3** → Reclassify as Launch-Blocking Tiger if Rihanna gig status changes between today and Strategy Lock.
- **E4** → Already de-facto Launch-Blocking (covers content quality, the actual product).
- **E6** → Reclassify as Fast-Follow if T+30 subscriber count < 800.

The other 7 stay as Elephants — acknowledged, not gated.

---

## Pre-launch readiness scorecard

| Category | Status |
|---|---|
| Bundle completeness | ✅ 17 files + this pre-mortem + push script |
| Brief lock readiness | ✅ `01_WEBSITE_PRD_FINAL.md` is the brief |
| Design lock readiness | ⚠️ ACISS palette defined; awaiting Phase 4 direction lock |
| Architecture lock readiness | ⚠️ awaiting Phase 5 — depends on B1 (web/ verification) |
| Stripe readiness | ⚠️ awaiting Phase 11 + B3 + B7 fixes |
| Supabase readiness | ⚠️ awaiting B5 fallback wiring |
| MailerLite readiness | ⚠️ awaiting B4 dual-write window |
| EPUB readiness | ⚠️ awaiting B8 epubcheck run |
| Claims substantiation | ⚠️ awaiting B9 `claims-evidence.md` creation |
| Operator readiness | ⚠️ Elephant E7 — Michael's own discipline |

7 of 10 readiness items require **one action each before Strategy Lock**. None are blocking by themselves; the combination is the load-bearing path.

---

## What this pre-mortem suggests for Path A (the bundle is approved)

If you approve the bundle and proceed to Phase 0:

1. **First action:** B1 — clone, build, smoke. If `web/` is broken, fix or rebuild before anything else.
2. **Before T-21:** close B1, B2, B6, B8, B9, B10.
3. **Before T-14:** close B3, B7.
4. **Before T-7:** close B4, B5.
5. **Throughout:** revisit Elephants E1, E2 weekly — they're the silent ways this launch fails.

---

## What this pre-mortem suggests for the bundle itself

Two amendments the bundle should incorporate (the orchestrator will pick these up at Phase 19):

1. **Amend `06_PRE_MORTEM.md`** to add B1–B10 from this file under § Tigers — Launch-Blocking. They're meta-risks but they're now project-specific.
2. **Amend `14_SECURITY_LEGAL_QA.md`** to include `claims-evidence.md` as a required artifact, not just a referenced one. Move it to Part D as an open question.

---

## Sign-off (Phase 19 gate)

The Pre-Mortem Review gate at Phase 19 cannot close until:
- [ ] B1–B10 each have evidence + date + sign-off in `GATE_LEDGER.md`
- [ ] B11–B16 are scheduled in the post-launch sprint
- [ ] B17–B19 are noted in the risk-register
- [ ] Elephants E1–E10 are individually acknowledged in writing
- [ ] This file is committed alongside `06_PRE_MORTEM.md`

```
<gate_request>
Gate: Pre-Mortem Review (Phase 19)
About to: Approve launch readiness against the bundle pre-mortem.
Verified: B1–B10 each closed with evidence in GATE_LEDGER.md.
Irreversible: launch decision proceeds; Phase 20 preview deploy unlocks.
Approve? (reply: approve / go / run it)
</gate_request>
```

---

## Calibration note (per skill instructions)

> "Pre-mortem findings are reviewed against actual outcomes post-launch to calibrate future sessions."

Post-launch (T+30), re-open this file. For each of B1–B19 + E1–E10, mark which actually mattered. Recalibrate which patterns are real risks vs anxiety for the next launch (Finder's Book).

---

*The bundle is comprehensive. The launch is operator-shaped. The orchestrator is process-armor. The pre-mortem is the calibration loop. None of these work alone.*

— Method: Klein 2007 / Kahneman 2011 prospective hindsight · 14-day failure framing · Tiger/Paper Tiger/Elephant classification.
