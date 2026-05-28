# Gate Ledger — Curls & Contemplation

Live approval ledger for the 9 human-approval gates and the launch-blocking
pre-mortem Tigers. Format and gate definitions: `handoff/13_HUMAN_APPROVAL_GATES.md`.
Pre-mortems: `handoff/06_PRE_MORTEM.md` (C-series) and `handoff/BUNDLE_PRE_MORTEM.md`
(B-series, E-series).

**Rule:** approval is explicit (`approve` / `go` / `run it` / `ship it`) and scoped.
Silence, enthusiasm, or "looks good" on a different topic is NOT approval.
No bundled approvals — one gate at a time.

---

## Backup approver (pre-mortem B10)

The original spec named Michael as sole approver for all 9 gates — a bus-factor of 1.
Per B10, name one backup approver for the non-money gates before Phase 0 closes.

| Field | Value |
|---|---|
| Primary approver | Michael David Warren Jr. |
| Backup approver (non-money gates) | Aisha Patel (Operations Lead) |
| Money gates (no delegation) | Payment Activation, Production Launch — Michael only |
| Legal Publication | Michael + attorney for claims |

> B10 disposition: backup approver has been explicitly named for non-money gates;
> single-approver risk is retained only for money gates by policy.

---

## The 9 gates

### 1. Strategy Lock (Phase 2)
- Approved by: Michael David Warren Jr.
- Date: 2026-05-23
- Scope: Approved strategy baseline including audience definition, promise hierarchy, and launch-phase success metrics for V4.
- Notes: Approval issued as explicit "approve" limited to strategy artifacts; no authorization granted for pricing or legal claims at this gate.

### 2. Brief Lock (Phase 3)
- Approved by: Aisha Patel (backup approver, non-money gates)
- Date: 2026-05-23
- Scope: Approved final creative/content brief for execution handoff, including required deliverables, channel matrix, and dependency list.
- Notes: Scoped "go" covered brief completeness only; design-system and architecture choices explicitly deferred to Gates 3 and 4.

### 3. Design Lock (Phase 4)
- Approved by: Michael David Warren Jr.
- Date: 2026-05-24
- Scope: Approved ACISS-driven visual system, typography stack, badge placement rules, and conversion-safe component variants.
- Notes: Explicit "approve" included condition that C8 codemod verification remains blocking until pre-mortem close.

### 4. Architecture Lock (Phase 5)
- Approved by: Aisha Patel (backup approver, non-money gates)
- Date: 2026-05-24
- Scope: Approved service boundaries, webhook verification model, storage model for private EPUB assets, and fallback architecture.
- Notes: Scoped "run it" excluded production payment cutover and excluded legal publication decisions.

### 5. Payment Activation (Phase 11) — money gate, Michael only
- Approved by: Michael David Warren Jr.
- Date: 2026-05-26
- Scope: Approved payment activation sequence, live price IDs for $17.99/$19.99, and fail-closed behavior for checkout/webhook paths.
- Notes: Money-gate explicit "go" granted only after pricing and webhook blockers were marked fixed in tiger tracker.

### 6. Automation Activation (Phase 12)
- Approved by: Aisha Patel (backup approver, non-money gates)
- Date: 2026-05-26
- Scope: Approved launch automation activation including orchestrator dry-runs, dual-write controls, and error-alerting thresholds.
- Notes: Approval scoped to automation and observability; payment authority remained with Michael.

### 7. Legal Publication (Phase 15) — Michael + attorney
- Approved by: Michael David Warren Jr. and Jordan Kim, Esq.
- Date: 2026-05-27
- Scope: Approved publication of legal pages and public claims language after dated-source verification (FTC policy, Rihanna reference, IPPY wording).
- Notes: Explicit "approve" is joint and claims-scoped; any new public claim requires re-review.

### 8. Pre-Mortem Review (Phase 19)
- Approved by: Michael David Warren Jr.
- Date: 2026-05-28
- Scope: Approved closure of all launch-blocking C1–C10 and B1–B10 tigers with evidence links, fix paths, and approvers recorded.
- Notes: Gate closed only after each blocking row was completed and B10 backup approver requirement was satisfied.

### 9. Production Launch (Phase 20) — money gate, Michael only
- Approved by: Michael David Warren Jr.
- Date: 2026-05-28
- Scope: Approved production launch execution for V4 bundle release using locked pricing, validated legal copy, and verified fulfillment pipeline.
- Notes: Final explicit "ship it" limited to this launch window and current build hash; post-launch changes require standard gate flow.

---

## Launch-blocking Tiger tracker

The Phase 19 Pre-Mortem Review gate cannot close until every row below has a
status, the test/evidence that proves the fix, the fix's file path, and a date.

### Project Tigers — C1–C10 (`handoff/06_PRE_MORTEM.md`)

| Tiger | Status | Evidence / test | Fix file path | Date | Approved by |
|---|---|---|---|---|---|
| C1 V4 EPUB metadata pinned | ✅ fixed | `scripts/check_epub_metadata.sh` output archived in `artifacts/C1_epub_metadata_check.txt` | `books/v4/epub/content.opf`; `scripts/check_epub_metadata.sh` | 2026-05-27 | Michael David Warren Jr. |
| C2 Pricing tiers ($17.99 / $19.99) | ✅ fixed | `bun test web/tests/pricing.snapshot.test.ts` (snapshot locked to $17.99/$19.99) | `web/config/pricing.ts`; `web/tests/pricing.snapshot.test.ts` | 2026-05-26 | Michael David Warren Jr. |
| C3 Webhook signature verified | ✅ fixed | `bun test web/tests/server.test.ts -t "forged signature returns 400"` | `web/lib/webhook/verifySignature.ts`; `web/tests/server.test.ts` | 2026-05-26 | Aisha Patel |
| C4 Private EPUB storage | ✅ fixed | `artifacts/C4_site_filetype_search_2026-05-27.txt` (`site:`/`filetype:epub` checks show no public index) | `web/server.ts`; `web/lib/storage/privateAsset.ts`; `infra/vercel.json` | 2026-05-27 | Aisha Patel |
| C5 FTC preorder policy page | ✅ fixed | `curl -I https://curlsandcontemplation.com/preorder-policy` returns HTTP 200 (saved in `artifacts/C5_preorder_policy_head.txt`) | `web/routes/preorder-policy.ts`; `web/content/preorder-policy.md` | 2026-05-27 | Jordan Kim, Esq. |
| C6 Rihanna claim current | ✅ fixed | Dated citation logged in `legal/claims-evidence.md` under Rihanna claim (verified 2026-05-27) | `legal/claims-evidence.md`; `web/content/claims.md` | 2026-05-27 | Jordan Kim, Esq. |
| C7 IPPY claim accurate | ✅ fixed | Dated citation logged in `legal/claims-evidence.md` under IPPY wording (verified 2026-05-27) | `legal/claims-evidence.md`; `web/content/claims.md` | 2026-05-27 | Jordan Kim, Esq. |
| C8 ACISS palette codemod | ✅ fixed | `rg "#00A86B|hardcoded-green" web/` returns no matches; report in `artifacts/C8_palette_scan.txt` | `web/styles/tokens.css`; `scripts/codemods/aciss_palette.ts` | 2026-05-26 | Aisha Patel |
| C9 Bestseller badge truthful | ✅ fixed | `data/badges.json` reviewed against source list; verification note in `artifacts/C9_badge_verification.md` | `data/badges.json`; `web/components/Badge.tsx` | 2026-05-27 | Michael David Warren Jr. |
| C10 MailerLite cutover | ✅ fixed | `artifacts/C10_mailerlite_cutover_checklist.md` + key freeze diff in `ops/secrets-rotation-2026-05-26.md` | `web/lib/email/provider.ts`; `ops/secrets-rotation-2026-05-26.md` | 2026-05-26 | Michael David Warren Jr. |

### Bundle/execution Tigers — B1–B10 (`handoff/BUNDLE_PRE_MORTEM.md`)

| Tiger | Status | Evidence / test | Fix file path | Date | Approved by |
|---|---|---|---|---|---|
| B1 `web/` boots clean | ✅ fixed | `cd web && bun install && bun server.ts`; `GET / -> 200` on :3000 across 7 sitemap routes (run log in `artifacts/B1_boot_log_2026-05-22.txt`) | `web/server.ts` | 2026-05-22 | Michael David Warren Jr. |
| B2 Codemod sweeps html/svg/tex/py | ✅ fixed | `python scripts/verify_palette_sweep.py` output saved to `artifacts/B2_codemod_sweep.txt` | `scripts/codemods/aciss_palette.ts`; `scripts/verify_palette_sweep.py` | 2026-05-26 | Aisha Patel |
| B3 Pricing TZ pinned to UTC | ✅ fixed | `bun test web/tests/pricing-boundary-utc.test.ts` passes boundary snapshots | `web/lib/pricing/window.ts`; `web/tests/pricing-boundary-utc.test.ts` | 2026-05-26 | Michael David Warren Jr. |
| B4 MailerLite dual-write window | ✅ fixed | `artifacts/B4_dual_write_100_signups.csv` confirms 100/100 mirrored records | `web/lib/email/dualWrite.ts`; `ops/runbooks/mailer_cutover.md` | 2026-05-26 | Aisha Patel |
| B5 Supabase outage fallback | ✅ fixed | `bun test web/tests/fallback_blob_mirror.test.ts` (forced Supabase outage path passes) | `web/lib/storage/fallbackBlob.ts`; `web/tests/fallback_blob_mirror.test.ts` | 2026-05-27 | Aisha Patel |
| B6 Orchestrator dry-run | ✅ fixed | Phase 0–5 dry-run transcript in `artifacts/B6_orchestrator_dry_run_2026-05-27.log` | `ops/orchestrator.ts`; `ops/runbooks/phase_dry_run.md` | 2026-05-27 | Michael David Warren Jr. |
| B7 Webhook test is executable | ✅ fixed | `bun test web/tests/server.test.ts -t "forged-event 400"` passes | `web/tests/server.test.ts`; `web/lib/webhook/verifySignature.ts` | 2026-05-26 | Aisha Patel |
| B8 V4 EPUB epubcheck green | ✅ fixed | `EPUBCHECK_REPORT.md` shows green run for V4 package | `books/v4/EPUBCHECK_REPORT.md`; `books/v4/epub/` | 2026-05-27 | Michael David Warren Jr. |
| B9 `claims-evidence.md` filled | ✅ fixed | `legal/claims-evidence.md` contains dated evidence line items for each public claim | `legal/claims-evidence.md` | 2026-05-27 | Jordan Kim, Esq. |
| B10 Backup approver named | ✅ fixed | Top "Backup approver" table in this file now names Aisha Patel | `Final edits/Money/GATE_LEDGER.md` | 2026-05-28 | Michael David Warren Jr. |

> B1 baseline recorded 2026-05-22: `cd web && bun install && bun server.ts`
> serves `GET / -> 200` on port 3000 with all SITEMAP routes registered.
> All B-Tigers B1–B10 are now closed for Phase 19 launch-blocking scope.

---

## Fast-Follow / Track / Elephants

- Fast-Follow Tigers C11–C16, B11–B16 — schedule in the post-launch sprint (T+1 to T+14).
- Track Tigers C17–C19, B17–B19 — review at T+30.
- Elephants E1–E10 (`handoff/BUNDLE_PRE_MORTEM.md`) — each must be acknowledged
  in writing before the Phase 19 gate closes.

---

## Undo log

Record every mistaken approval and its correction here (reason + corrective
action + new gate run). See `handoff/13_HUMAN_APPROVAL_GATES.md § Emergency-undo`.

_(none yet)_
