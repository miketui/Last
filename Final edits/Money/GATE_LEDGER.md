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
| Backup approver (non-money gates) | **TBD — Michael to name a trusted peer / co-author / agent** |
| Money gates (no delegation) | Payment Activation, Production Launch — Michael only |
| Legal Publication | Michael + attorney for claims |

> Action: replace the TBD above before Phase 0 closes, or record a conscious
> decision to accept the bus-factor.

---

## The 9 gates

### 1. Strategy Lock (Phase 2)
- Approved by:
- Date:
- Scope:
- Notes:

### 2. Brief Lock (Phase 3)
- Approved by:
- Date:
- Scope:
- Notes:

### 3. Design Lock (Phase 4)
- Approved by:
- Date:
- Scope:
- Notes:

### 4. Architecture Lock (Phase 5)
- Approved by:
- Date:
- Scope:
- Notes:

### 5. Payment Activation (Phase 11) — money gate, Michael only
- Approved by:
- Date:
- Scope:
- Notes:

### 6. Automation Activation (Phase 12)
- Approved by:
- Date:
- Scope:
- Notes:

### 7. Legal Publication (Phase 15) — Michael + attorney
- Approved by:
- Date:
- Scope:
- Notes:

### 8. Pre-Mortem Review (Phase 19)
- Approved by:
- Date:
- Scope:
- Notes:

### 9. Production Launch (Phase 20) — money gate, Michael only
- Approved by:
- Date:
- Scope:
- Notes:

---

## Launch-blocking Tiger tracker

The Phase 19 Pre-Mortem Review gate cannot close until every row below has a
status, the test/evidence that proves the fix, the fix's file path, and a date.

### Project Tigers — C1–C10 (`handoff/06_PRE_MORTEM.md`)

| Tiger | Status | Evidence / test | Fix file path | Date | Approved by |
|---|---|---|---|---|---|
| C1 V4 EPUB metadata pinned | | grep + test | | | |
| C2 Pricing tiers ($17.99 / $19.99) | | snapshot test | | | |
| C3 Webhook signature verified | | fail-closed test | | | |
| C4 Private EPUB storage | | `site:` filetype search clean | | | |
| C5 FTC preorder policy page | | `/preorder-policy` 200 | | | |
| C6 Rihanna claim current | | dated source in `claims-evidence.md` | | | |
| C7 IPPY claim accurate | | dated source in `claims-evidence.md` | | | |
| C8 ACISS palette codemod | | verify-no-hardcoded green | | | |
| C9 Bestseller badge truthful | | `badges.json` verified | | | |
| C10 MailerLite cutover | | Mailchimp keys frozen | | | |

### Bundle/execution Tigers — B1–B10 (`handoff/BUNDLE_PRE_MORTEM.md`)

| Tiger | Status | Evidence / test | Fix file path | Date | Approved by |
|---|---|---|---|---|---|
| B1 `web/` boots clean | ✅ baseline | `GET / -> 200` on :3000, 7 routes | `web/server.ts` | 2026-05-22 | (audit) |
| B2 Codemod sweeps html/svg/tex/py | | verify-no-hardcoded extended | | | |
| B3 Pricing TZ pinned to UTC | | boundary snapshot test | | | |
| B4 MailerLite dual-write window | | 100 real signups land clean | | | |
| B5 Supabase outage fallback | | Vercel Blob mirror wired | | | |
| B6 Orchestrator dry-run | | Phase 0–5 dry-run logged | | | |
| B7 Webhook test is executable | | `server.test.ts` forged-event 400 | | | |
| B8 V4 EPUB epubcheck green | | `EPUBCHECK_REPORT.md` | | | |
| B9 `claims-evidence.md` filled | | dated evidence per public claim | | | |
| B10 Backup approver named | | this file, top section | | | |

> B1 baseline recorded 2026-05-22: `cd web && bun install && bun server.ts`
> serves `GET / -> 200` on port 3000 with all SITEMAP routes registered.
> Remaining B-Tigers open.

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
