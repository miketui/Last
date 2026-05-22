# Security + Legal QA — Curls & Contemplation

Two checklists. Nothing reaches production with an unchecked box. Inherits the generic `security-legal-qa` skill from `studio-site-build-os`; this file adds Curls-specific items.

**Not legal advice.** Legal copy is reviewed by Michael or attorney at the Phase 15 Legal Publication gate.

---

## Part A — Security checklist

### A.1 Secrets + environment

- [ ] `.env.example` committed with variable **names only** — no values
- [ ] No real secret in client-side bundle, repo history, or commit log
- [ ] Vercel env vars set per environment (Local / Preview / Production), never hardcoded
- [ ] `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `MAILERLITE_API_KEY`, `DOWNLOAD_TOKEN_SECRET`, `CRON_SECRET`, `TURNSTILE_SECRET_KEY` all server-only
- [ ] `git log -p` spot-check: no `sk_live_`, `whsec_`, `service_role`, `AKIA`, `AIza`, JWT-shaped strings
- [ ] `verify-build.sh` greps for committed secret patterns and fails the build if found

### A.2 Surface hardening

- [ ] CSP header set per `web/vercel.json` (script-src whitelisted; no `*`)
- [ ] HSTS enabled with `includeSubDomains; preload`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `X-Frame-Options: DENY` (or CSP `frame-ancestors 'none'`)
- [ ] `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- [ ] Cloudflare Turnstile on every public form (`/`, `/resources`, `/checkout` email step, `/about` contact, every `/api/free-resource`, `/api/subscribe`, `/api/checkout`)
- [ ] Rate limiting per IP: 10 reqs/5 min on `/api/download/:token`, `/api/checkout`, `/api/subscribe`
- [ ] Zod validation on every serverless function input; reject malformed payloads with 400

### A.3 Payments + webhooks

- [ ] Stripe webhook signature verified on every event before any state change
- [ ] Webhook idempotency: store `event.id` in `webhook_events`, dedup
- [ ] Checkout metadata includes `customer_email`, `product`, `launch_state`, `utm_*`
- [ ] Refund path revokes download tokens within 1 second of `charge.refunded`
- [ ] Test-mode + live-mode keys kept separate; live keys only in Production env
- [ ] One live $15.99 transaction tested + refunded (recorded in build log)

### A.4 Secure digital fulfillment

- [ ] EPUB + PDF in **private** Supabase bucket — never public
- [ ] Per-customer download token: cryptographically random, 7-day expiry, 3-download cap
- [ ] Order record links email → product → token
- [ ] Manual resend path documented in `/portal/:token`
- [ ] Refund revokes the token (sets `revoked = 1`)
- [ ] Token attempts logged with hashed IP — abuse pattern paged via Datadog monitor

### A.5 Hygiene

- [ ] `npm audit` clean (or known issues triaged + accepted)
- [ ] Logs PII-safe — no emails, tokens, card data; Sentry `beforeSend` scrubber tested
- [ ] Admin routes behind `ADMIN_USERNAME`/`ADMIN_PASSWORD` + 24h session token
- [ ] Sentry tracesSampleRate ≤ 0.1; PII filter active
- [ ] No third-party `connect-src` beyond the whitelist in `vercel.json`
- [ ] No mixed-content warnings (every asset HTTPS)

### A.6 Curls-specific (this build)

- [ ] V4 EPUB byte-size verified at build time (no stale fingerprint)
- [ ] ACISS codemod has eliminated legacy palette in production source
- [ ] Substack RSS responses sanitized before reuse (untrusted external content)
- [ ] MailerLite API timeout = 5s; failures logged but never block checkout
- [ ] Supabase signed URL audit weekly: check no public URLs leaked

---

## Part B — Legal + consent checklist

### B.1 Required pages (all live before Phase 15 gate)

- [ ] `/privacy` — data collected, why, who shared with, retention, user rights
- [ ] `/terms` — terms of use
- [ ] `/refund-policy` — refund rules + window (30 days, no questions asked, common pattern)
- [ ] `/preorder-policy` — **real release date**, delay/refund language, delivery method, contact
- [ ] `/digital-delivery-policy` — how files are delivered, token expiry, resend path
- [ ] `/cookies` — what cookies/trackers, why, consent state link
- [ ] `/accessibility` — WCAG 2.2 AA conformance statement + contact for issues

### B.2 FTC pre-order compliance (mail/internet-order rule)

- [ ] `/preorder-policy` carries a stated, reasonable release date
- [ ] Consent-or-refund language if delivery slips by > 30 days
- [ ] Pre-order CTA labels "pre-order" (not "buy now") until launch
- [ ] Receipt email (S2) restates the release date and refund right
- [ ] If delay → automated email to all `Pre-Orders` group: notify, request consent, offer refund

### B.3 CCPA / CPRA (California seller — Michael)

- [ ] Cookie/consent banner present on first visit
- [ ] Analytics + marketing trackers **blocked until consent granted**
- [ ] GA4 default consent state = denied
- [ ] "Do Not Sell or Share My Personal Information" link in footer
- [ ] Privacy policy includes CCPA disclosures (categories of PI collected, sources, purposes, sharing)
- [ ] User-rights request flow: email `hello@curlsandcontemplation.com`; documented response SLA (15 days)

### B.4 GDPR (Europe — best-effort, not in primary funnel)

- [ ] Legal basis for processing (consent for marketing; contract for transactional)
- [ ] DPA-equivalent terms with sub-processors (Stripe, MailerLite, Resend, Supabase, Vercel)
- [ ] Right-to-erasure flow documented (manual via support)
- [ ] No DPO required (small scale + no special-category data)

### B.5 Claims substantiation (pre-mortem fix B9 — REQUIRED ARTIFACT)

`Final edits/website/claims-evidence.md` is a **required** artifact, not a referenced
one. The file must exist with dated evidence for every claim before the Phase 15
Legal Publication gate. The bundle ships with a starter template at the same path
— populate it during Phase 0 (B9 in `07_LAUNCH_TIMELINE.md`).

Every public claim must have an entry:

- [ ] "Rihanna's day-to-day hairstylist" — current employment confirmation (dated, source)
- [ ] "IPPY Awards submission — Category 47" — submission receipt or screenshot (dated)
- [ ] "Trained under Guido Palau and Jimmy Paul" — paystub, assistant credit, or written confirmation
- [ ] Each testimonial: name, role, location, written consent to use, date
- [ ] Bestseller-badge claim (if any): which list, when, source

**Forbidden until substantiated:** "winner", "finalist", "Bestseller" — these have legal weight beyond marketing.

### B.5.1 EPUB QA gate (pre-mortem fix B8)

`epubcheck CurlsAndContemplationV4.epub` must report clean before Phase 11.
Output goes to `Final edits/website/EPUBCHECK_REPORT.md`. Use the `epub-production`
skill:

```
/anthropic-skills:epub-production
mode: validate
input: CurlsAndContemplationV4.epub
output: Final edits/website/EPUBCHECK_REPORT.md
```

If red: fix the EPUB before any payment activation. A broken EPUB is the fastest
path to a refund wave.

### B.6 Accessibility (WCAG 2.2 AA)

Run via `/anthropic-skills:audit`:

- [ ] Semantic HTML on every page
- [ ] Heading hierarchy correct (one h1, logical h2-h6)
- [ ] All form inputs have labels (visible or `aria-label`)
- [ ] Focus rings preserved (gold on obsidian; visible)
- [ ] Keyboard nav full coverage; skip-to-content link
- [ ] Color contrast: Gold-on-Obsidian large only; small body uses Gold-Tint; Jade body links use Jade-Link
- [ ] `prefers-reduced-motion: reduce` honored
- [ ] Alt text on every image; decorative images have `alt=""`
- [ ] No autoplay video/audio
- [ ] Forms announce errors via `aria-live`

### B.7 Tax + retailer

- [ ] Stripe Tax enabled on the product
- [ ] State sales-tax behavior: `tax_behavior: exclusive` (added at checkout)
- [ ] US 1099-K threshold awareness: Stripe issues if > $5K/yr (was $600 — confirm current threshold per IRS at launch)
- [ ] Paperback retailer links go live only after pre-launch ship date and only via author-direct accounts (Amazon KDP, B&N Press, Waterstones, Indigo)

---

## Part C — Pre-deploy security script (excerpt from `verify-build.sh`)

```bash
# 1. Secret scan
git grep -lE 'sk_live_|sk_test_[A-Za-z0-9]{20,}|whsec_[A-Za-z0-9]{20,}|service_role|AKIA|AIza[0-9A-Za-z\-_]{35}|eyJ[A-Za-z0-9_=]+\.[A-Za-z0-9_=]+\.' \
  -- web/ packages/ Final\ edits/ scripts/ \
  && { echo "✗ committed secret detected"; exit 1; } || echo "✓ no secrets in repo"

# 2. CSP header sanity check
grep -q 'Content-Security-Policy' web/vercel.json || { echo "✗ CSP missing"; exit 1; }

# 3. Robots disallow check
for p in '/admin' '/portal' '/download' '/api' '/checkout' '/thank-you'; do
  grep -q "Disallow: $p" web/public/robots.txt || { echo "✗ robots missing $p"; exit 1; }
done

# 4. Required legal routes
for r in privacy terms refund-policy preorder-policy digital-delivery-policy cookies accessibility; do
  grep -q "\"/$r\"" web/server.ts || { echo "✗ /$r route missing"; exit 1; }
done

# 5. CCPA banner present
grep -q 'ConsentBanner' web/frontend.tsx || { echo "✗ ConsentBanner not mounted"; exit 1; }

# 6. JSON-LD render check (build-time)
bun run scripts/check-jsonld.ts || { echo "✗ JSON-LD failures"; exit 1; }

echo "✓ security + legal pre-deploy script green"
```

---

## Part D — Open-question coverage (must be resolved before Phase 15 gate)

| Question | Owner | Resolved? | Pre-mortem ID |
|---|---|---|---|
| Physical mailing address for CAN-SPAM footer | Michael | | |
| Attorney of record for legal copy review | Michael | | |
| ISBN-13 (eBook + paperback) | Michael / publisher | | |
| Refund-window length (30 days proposed) | Michael | | |
| Pre-order delay threshold for consent-or-refund (30 days proposed) | Michael / attorney | | |
| Real release date (RELEASE_DATE env, ISO 8601 UTC) | Michael (Strategy Lock) | | B3 |
| Tax-form readiness (1099-K threshold) | Michael / accountant | | |
| Substack post selected for buyer-only deep-link | Michael | | |
| Approved testimonial set with written consent | Michael | | |
| GDPR sub-processor list current | Michael | | |
| `claims-evidence.md` populated with dated evidence | Michael | | B9 |
| `EPUBCHECK_REPORT.md` clean for V4 EPUB | Michael | | B8 |
| Backup approver named in `GATE_LEDGER.md` | Michael | | B10 |
| `web/` baseline smoke-test passed | Michael | | B1 |
| Orchestrator dry-run completed | Michael | | B6 |

---

## Part E — Incident response

Inherit `engineering:incident-response` skill. Curls-specific:

| Incident | Trigger | First action |
|---|---|---|
| Stripe webhook failure spike | Datadog monitor > 5/min | Page Michael; pause checkout; investigate logs |
| Supabase signed URL leak | Public URL found in search index | Rotate service key immediately; audit token table |
| Resend deliverability drop | Bounce rate > 5% | Pause sends; check reputation; warm up again |
| MailerLite mis-fire | Wrong group received an automation | Pause automation; send manual correction; document |
| DNS outage | Site unreachable | Revert DNS; serve Vercel maintenance page |
| Card-data exposure (any kind) | Any | Notify Michael immediately; rotate keys; PCI breach process |
| Accessibility complaint | Email to `accessibility@` | Acknowledge in 24h; fix in 7 days; document in `accessibility-log.md` |

Postmortem: blameless, 5-whys, written within 7 days, filed in `Final edits/MONEY/postmortems/`.

---

## Sign-off (Phase 14 + 15 gates)

**Security Hardening (Phase 14):**
- Approved by: ___________
- Date: ___________
- Scope: All Part A checks green

**Legal Publication (Phase 15):**
- Approved by: ___________ (Michael) and/or ___________ (attorney)
- Date: ___________
- Scope: Pages live; claims substantiated; consent banner gates analytics

---

*This file is the lock document for both the security and legal gates. The orchestrator does not enter Phase 16 (a11y QA) until Part A is green, or Phase 20 (preview deploy) until Part B is green.*
