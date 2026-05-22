# Human Approval Gates — Curls & Contemplation

The `human-approval-gate` skill enforces 9 scoped gates. Each gate stops before a high-consequence action and requires explicit human approval. **Silence, enthusiasm, or "looks good" on a different topic is NOT approval.**

This file is the ledger template. Live state lives at `Final edits/MONEY/GATE_LEDGER.md` and is committed after each approval.

---

## Gate behavior contract

For every `[GATE]`:

1. **State what is about to happen** — one sentence.
2. **List what was verified** — the tests that prove it is safe.
3. **List the irreversible part** — what cannot be taken back.
4. **Ask for explicit approval** — accept `approve` / `go` / `run it` / `ship it`. Anything else = not approval.
5. **Record approval** — timestamp + scope + approver in `GATE_LEDGER.md`.

Approval is **scoped**. Approving the preorder flow does not approve the production deploy. Approving Stripe test mode does not approve Stripe live mode.

---

## The 9 gates (in order)

### 1. Strategy Lock (Phase 2)

**Action:** lock the goal, audience, funnel, primary CTA, secondary CTA, domain, MailerLite group IDs, real release date.
**Verified:**
- Goal stated in `brief.md`
- One primary CTA per surface
- `RELEASE_DATE` is a real date (not "TBD")
**Irreversible:** the rest of the pipeline anchors to this date. Slips trigger FTC consent-or-refund flow.
**Approval format:**
```
<gate_request>
Gate: Strategy Lock
About to: Lock the launch strategy for Curls & Contemplation.
Goal: Pre-order capture + email list compounding.
Domain: curlsandcontemplation.com
Release date: 2026-XX-XX
Primary CTA: "Pre-order — $15.99"
Secondary CTA: "Get the first chapter free"
Verified: brief.md drafted; CTAs single per surface; RELEASE_DATE set.
Irreversible: pipeline math + legal preorder commitment.
Approve? (reply: approve / go / run it)
</gate_request>
```

### 2. Brief Lock (Phase 3)

**Action:** lock `brief.md` after `/impeccable:impeccable` polish.
**Verified:** AI-tell sweep passed; CTAs reviewed; ACISS palette referenced correctly.
**Irreversible:** design + code phases freeze the brief; revisions = rework.

### 3. Design Lock (Phase 4)

**Action:** lock palette, typography, motion language, forbidden patterns.
**Verified:** `design-direction.md` produced; `/design:design-critique` + `/impeccable:impeccable critique` passes.
**Irreversible:** components and assets generated against this lock.

### 4. Architecture Lock (Phase 5)

**Action:** lock routes, data model, commerce flow, webhook endpoints, file-storage strategy.
**Verified:** `architecture.md` reviewed; Stripe + Supabase decisions documented.
**Irreversible:** API and DB shape lock.

### 5. Payment Activation (Phase 11)

**Action:** flip Stripe from test to live mode.
**Verified:**
- Test-mode purchase passed (card 4242…) — order created, token issued, EPUB downloads
- Webhook signature verified — sandboxed forged event rejected
- Refund path tested — token revoked, S6 email sent
- One live $15.99 transaction with Michael's own card succeeded and refunded
**Irreversible:** real customer cards can now be charged.

### 6. Automation Activation (Phase 12)

**Action:** turn on MailerLite + Resend live sequences.
**Verified:**
- Test signup verified each automation (S1, S3, S4) landed correctly
- Resend transactional templates (S2, S4-E1, S5, S6) test-sent and inboxed
- Unsubscribe webhook verified
- Group taxonomy locked
**Irreversible:** real subscribers receive emails.

### 7. Legal Publication (Phase 15)

**Action:** publish `/privacy`, `/terms`, `/refund-policy`, `/preorder-policy`, `/digital-delivery-policy`, `/cookies`, `/accessibility`.
**Verified:**
- Owner or attorney reviewed each page
- FTC preorder rule: real date, delay/refund language, contact
- CCPA/CPRA consent banner gates analytics
- Claims (Rihanna, IPPY, Guido Palau, Jimmy Paul) substantiated in `claims-evidence.md`
**Irreversible:** public legal claims now live; modifications must follow versioned policy.

### 8. Pre-Mortem Review (Phase 19)

**Action:** review the project pre-mortem; verify every Launch-Blocking Tiger is closed.
**Verified:**
- C1–C10 in `06_PRE_MORTEM.md` each have evidence + fix file path
- Fast-Follow Tigers (C11–C16) scheduled
- Risk register reviewed against repo state
**Irreversible:** approves launch on these specific risks.

### 9. Production Launch (Phase 20)

**Action:** deploy to production domain, flip DNS, launch broadcast.
**Verified:**
- Vercel preview walked end-to-end on mobile + desktop
- Live payment re-test (card + refund) on production passed
- DNS records (CNAME/A) confirmed before flip
- Monitoring (Sentry, Datadog, uptime, alerting) live
- Pre-launch checklist green from `verify-build.sh`
**Irreversible:** the site is now public; first customer transaction can happen any moment.

---

## Bundled / waived gates (FORBIDDEN)

Never "approve everything" or "ship it all" in one reply. The orchestrator will:
- **Reject bundled approvals.** "Approve all gates" gets a counter-prompt: "Please approve each gate individually. Which would you like to approve first?"
- **Refuse to back-fill skipped gates.** If a gate was skipped under pressure, the orchestrator pauses the next gate until the skipped one is closed.

---

## Pre-approval reasoning (what the gate request must always show)

Each `<gate_request>` includes the orchestrator's reasoning trail so you can audit the recommendation:

```
<work_log>
  Assumptions: Stripe test mode confirmed; webhook signature verified.
  Approach: Flip env STRIPE_SECRET_KEY from test to live; deploy preview; run live $15.99 charge + refund.
  Uncertainty: Stripe Tax behavior in foreign jurisdictions — Phase 18 follow-up.
</work_log>
```

If `<work_log>` shows unresolved Uncertainty on something that affects this gate, do NOT approve — ask for resolution first.

---

## Approval ledger format (`GATE_LEDGER.md`)

```markdown
# Gate Ledger — Curls & Contemplation

## 1. Strategy Lock
- Approved by: Michael David Warren Jr.
- Date: <ISO 8601 timestamp of approval>          (example row — fill in at gate time)
- Scope: Launch strategy locked. RELEASE_DATE=<TBD — set at this gate>. Domain=curlsandcontemplation.com.
- Notes: First gate of pipeline.

## 2. Brief Lock
- Approved by:
- Date:
- Scope:
- Notes:

## … (gates 3–9 below)
```

---

## When a gate fails

Failed gate → the orchestrator stops cold. It will NOT:
- Try a workaround
- Propose a "smaller" approval
- Move to the next phase

The orchestrator will:
1. Report the failure in plain language.
2. Ask what to change.
3. Wait.

Example:
> "Payment Activation gate failed: test webhook didn't fire (404 on `/api/stripe/webhooks`). I haven't flipped to live. The fix is to deploy the latest webhook handler — would you like me to run `vercel --prod` against the preview branch first?"

---

## Emergency-undo conventions

If a gate is approved by mistake:

| Gate approved in error | Undo |
|---|---|
| Strategy / Brief / Design / Architecture | Revert PR; re-run gate prompt. |
| Payment Activation | Switch `STRIPE_SECRET_KEY` back to test in Vercel. Refund any live transactions. |
| Automation Activation | Pause MailerLite automations via dashboard; queue an apology email if any send fired. |
| Legal Publication | 410 the legal page until corrected; consent banner stays. |
| Pre-Mortem | Re-open the closed Tiger in `06_PRE_MORTEM.md`. |
| Production Launch | Revert DNS to a known-good record; serve maintenance page. |

Every undo is recorded in `GATE_LEDGER.md` with reason + corrective action + new gate run.

---

## Gate roster — who can approve (pre-mortem fix B10)

The original spec had Michael as sole approver for all 9 gates. That's a bus-factor of 1.
Pre-mortem B10 adds a backup approver for the gates that can be reviewed without
live financial credentials.

| Gate | Primary | Backup approver (B10) |
|---|---|---|
| Strategy Lock | Michael | a trusted peer / co-author / agent |
| Brief Lock | Michael | same backup as above |
| Design Lock | Michael | same |
| Architecture Lock | Michael | same |
| Payment Activation | Michael (only — Stripe live access not delegable) | — |
| Automation Activation | Michael | same backup (read-only review of test sends OK) |
| Legal Publication | Michael **+** attorney for claims | — |
| Pre-Mortem Review | Michael | same backup as Strategy |
| Production Launch | Michael (only — final go) | — |

The backup approver is named in `GATE_LEDGER.md` before Phase 0 closes (B10). If
the backup is unavailable when a non-money gate is up, Michael may proceed alone —
the goal is to avoid silent delay, not to add friction.

---

*The gate skill is what separates a studio build from a vibe build. Approve thoughtfully; the orchestrator does not get tired of asking.*
