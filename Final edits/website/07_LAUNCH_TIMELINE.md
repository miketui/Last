# Launch Timeline — Curls & Contemplation

**Anchor:** `RELEASE_DATE` — the launch day. **Not yet set.** Chosen at the Strategy Lock `[GATE]`.
**Pre-order opens:** `PREORDER_OPEN = RELEASE_DATE − 90 days` — the 90-day pre-order campaign starts here.
**Build starts:** `BUILD_START = PREORDER_OPEN − build window`. Plan a build window of **8–11 calendar weeks** (the LLM Council's honest estimate is ≈55–75 solo working days — do not compress it).

Every date in this file is **relative**. There are no hardcoded calendar dates — they resolve once `RELEASE_DATE` is locked. Notation:

- `T` — launch day (`RELEASE_DATE`)
- `T−n` / `T+n` — n days before / after launch
- `P` — pre-order open day (`PREORDER_OPEN`, i.e. `T−90`)
- `P+n` — n days into the 90-day pre-order campaign
- `B` — build start (`BUILD_START`)

> **Worked example** (illustration only — not the plan): if `RELEASE_DATE` is later set to a
> date *D*, then `PREORDER_OPEN = D − 90d`, `T−14 = D − 14d`, and the build must finish by
> `D − 90d`. Lock one date; the whole calendar resolves. Never hardcode a date back into
> this file — a relative timeline cannot be "born late," which the previous version was.

---

## Phase 0 — Build (`BUILD_START → PREORDER_OPEN`) · "Make it real before you sell it"

**Objective:** the site, payments, digital delivery, and email are built, tested, and gated —
finished *before* pre-order opens. You cannot sell a 90-day pre-order on a site that does not
exist yet.

The 22-phase studio-site-orchestrator pipeline runs here. Honest scope: **≈55–75 solo working
days** (LLM Council estimate). Plan the calendar accordingly.

### Stage 0.1 — Pre-mortem fixes (first, before anything else)

Apply bundle pre-mortem fixes **B1, B6, B8, B9, B10** and demand-gate **C0** before the Phase 0
build proper begins. Without these, the rest is fiction.

| ID | Action |
|---|---|
| B1 | Clone `Last/`, `bun install` in `web/`, `bun --hot server.ts`, smoke every route in `02_SITEMAP.md`. Document the baseline. If `web/` does not boot clean, fix or rebuild before anything else. |
| B6 | Run the studio-site-orchestrator Phase 0–5 dry-run on a throwaway branch. Capture any divergence from the PRD. |
| B8 | Run `epubcheck CurlsAndContemplationV4.epub` → `EPUBCHECK_REPORT.md`. If red, fix the EPUB first. |
| B9 | Complete `claims-evidence.md` — real dated evidence for every Rihanna / IPPY / Guido Palau / Jimmy Paul claim. |
| B10 | Name one backup approver for non-money gates in `GATE_LEDGER.md`. |
| C0 | Set the 90-day pre-order **target number** (`06_PRE_MORTEM.md § Demand-validation gate`) and record it in `GATE_LEDGER.md`. |

### Stage 0.2 — The 22-phase build

Run the orchestrator (`08_MASTER_AI_BUILDER_PROMPT.md`). The phase order, the gates, and the
per-phase prompts (`09_PROMPT_LIBRARY.md`) are unchanged — only the calendar is relative now.

| Build block | What ships | Gate |
|---|---|---|
| Strategy + Brief | `brief.md` locked; `RELEASE_DATE` + `PREORDER_OPEN` set | Strategy Lock · Brief Lock |
| Design + ACISS | `design-direction.md`; `packages/aciss-tokens` builds; palette codemod merged | Design Lock |
| Architecture | routes, data model, commerce flow locked | Architecture Lock |
| Pages + Legal | all public marketing + 7 legal routes built | — |
| Commerce | Stripe ($15.99 pre-order / $17.99 regular), Supabase signed-URL delivery, webhook tests green | Payment Activation |
| Email + Funnels | MailerLite + Resend sequences, F1–F4 funnels, 7-day dual-write window | Automation Activation |
| Motion + SEO + Substack | motion layer, JSON-LD, Substack RSS sync | — |
| QA | WCAG 2.2 AA, Lighthouse ≥ 95, security + legal QA | Legal Publication · Pre-Mortem Review |
| Deploy | preview → production; site live and able to take a real pre-order | Production Launch |

**Phase 0 exits when the site is live and can accept a real pre-order.** That moment is `PREORDER_OPEN`.

---

## Phase 1 — Pre-Order Campaign (`PREORDER_OPEN → T−1`, 90 days) · "The demand test"

**Objective:** sell pre-orders for 90 days. This phase **is** the demand-validation gate
(`06_PRE_MORTEM.md § Demand-validation gate`). Price: **$15.99** with the full bonus bundle.

### Stage 1.1 — Open Push (`P → P+14`)

| Workstream | Action |
|---|---|
| Announce | Launch the pre-order to Michael's **owned audience first** — Instagram, set photos, peer stylists, existing list. This is the real traffic engine (`01_WEBSITE_PRD_FINAL.md § Owned-audience launch plan`). |
| Email | S1 Welcome sequence live for new subscribers; the existing list gets the pre-order announcement. |
| Lead magnets | Pricing Confidence Kit gated, Sample Chapter ungated — both feeding funnel F1. |
| Checkout | Daily smoke test: one test-card pre-order + refund. |

### Stage 1.2 — Sustain (`P+15 → P+75`)

| Workstream | Action |
|---|---|
| **Day-30 checkpoint** | **`P+30` — Demand-validation go/no-go.** Pre-orders ≥ ~25% of target → continue. Below → **stop the spend and reassess** per `06_PRE_MORTEM.md § Demand-validation gate`. |
| Email | S1 continues; S7 Substack broadcasts on cadence. |
| Content | Weekly field notes / Substack; cross-post one chapter excerpt. |
| Lead magnet | Keep F1 running; retarget `/book` non-converters (one compliant email). |
| Performance | Lighthouse on `/` and `/book` stays ≥ 95 perf, 100 a11y. |

### Stage 1.3 — Final Urgency (`P+76 → T−1`, last ~14 days)

| Workstream | Action |
|---|---|
| Email | "Pre-order price ends at launch" — $15.99 → $17.99. A real deadline; no fake countdowns. |
| Reminders | S3 Launch Reminders fire relative to each subscriber's `Pre-Orders` join date. |
| Badge | Pre-launch badge ("Pre-order now — launches on `RELEASE_DATE`") on `/` and `/book`. |
| Deploy | `T−6` final preview-deploy approval · `T−5` production re-verify + live payment re-test · `T−4` monitoring confirmed. |

---

## Phase 2 — Launch (`T`) · "Cascade"

| When | Action |
|---|---|
| `T−1` | Final smoke test of `/api/cron/release-ebook` in staging. Substack launch post staged. |
| `T` morning | Cron bulk-fulfils every `launch_state=preorder` order — download tokens + S3-E3 email. |
| `T` morning | Site copy flips: "Pre-Order" → "Buy Now"; `/book` headline updated. Paperback links (Amazon / B&N / Waterstones / Indigo) go live. |
| `T` morning | Launch broadcast to the full `Subscribers` group (manual approval). |
| `T` day | Sentry watch for token-download failures; first metrics check; review + refund triage. |

Pricing holds at **$15.99 through `T+14`**, then flips to **$17.99 at `T+15`** (UTC date math in
`/checkout`, per `04_BOOK_DATA_PATCH.md`).

---

## Phase 3 — Post-Launch (`T+1 → T+90`) · "Compounding"

### Sprint 1 — `T+1 → T+14`

| Workstream | Action |
|---|---|
| Post-purchase email | S4 sequence live; Day 3 + Day 14 sends. |
| Review campaign | `T+14` — S4-E3 asks for an Amazon / Goodreads review. |
| Fast-Follow Tigers | C11–C16 and B11–B16 closed out. |
| Substack | Two posts per week through the launch month. |

### Sprint 2 — `T+15 → T+30`

| Workstream | Action |
|---|---|
| Regular pricing | $17.99 tier activates automatically at `T+15` (date math in `/checkout`). |
| Mailchimp deprecation | Freeze keys; export final CSV; archive the list. |
| Token cleanup | First quarterly token-cleanup cron run. |
| Performance audit | Lighthouse on the full route list; remediate drift. |

### Sprint 3 — `T+31 → T+60`

| Workstream | Action |
|---|---|
| Track Tigers | C17–C19 monitored; act only if triggered. |
| Cross-site | Finder's Book handoff begins (next-turn bundle); ACISS tokens cross-consumed. |
| Portfolio | `michaeldavidjr.beauty` cross-canonical audit. |

### Sprint 4 — `T+61 → T+90`

| Workstream | Action |
|---|---|
| Quarterly review | 90-day metrics retrospective vs targets (`01_WEBSITE_PRD_FINAL.md § 10`). |
| Pre-mortem rerun | Re-run the `pre-mortem` skill against real launch data; calibrate. |
| Edition planning | Decide second-edition timing if metrics support it. |

---

## Timeline at a glance (relative)

```
B ───────────── build · 8–11 weeks ─────────────▶ P
P (= T−90) ────────── 90-day pre-order ──────────▶ T
   P+0  … P+14   Open Push
   P+15 … P+75   Sustain        ◀── P+30 demand go/no-go
   P+76 … T−1    Final Urgency
T ───────────── launch + 90 days ────────────────▶ T+90
   T+0  … T+14   Sprint 1   ($15.99 holds)
   T+15          regular price $17.99 activates
   T+15 … T+90   Sprints 2–4
```

To turn this into calendar dates: lock `RELEASE_DATE`, and every `B`, `P+n`, and `T±n` offset
resolves automatically. Keep this file relative — a launch-date slip then never silently
invalidates the plan.

---

## Gate ledger checkpoints (relative)

| Gate | Earliest | Latest |
|---|---|---|
| Strategy Lock | Build day 1 | before `PREORDER_OPEN` |
| Brief Lock | Build day 1 | before `PREORDER_OPEN` |
| Design Lock | Build week 1 | before `PREORDER_OPEN` |
| Architecture Lock | Build week 1–2 | before `PREORDER_OPEN` |
| Payment Activation | Build · commerce block | before `PREORDER_OPEN` |
| Automation Activation | Build · email block | before `PREORDER_OPEN` |
| Legal Publication | Build · QA block | before `PREORDER_OPEN` |
| Pre-Mortem Review | Build · QA block | before `PREORDER_OPEN` |
| Production Launch (pre-order site live) | end of build | `PREORDER_OPEN` |
| **Demand-validation go/no-go** | `P+30` | `P+30` |

All nine build gates close **before** pre-order opens. The site must be real before it sells.

---

*Timeline is the lock document for Phase 2 (Strategy Lock). The orchestrator does not begin the
build proper until this and the PRD are approved. Every date here is relative to `RELEASE_DATE`
— set that one date and the whole calendar resolves.*
