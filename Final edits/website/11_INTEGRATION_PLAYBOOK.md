# Integration Playbook — Third-Party App Configuration

Every third-party service the Curls launch depends on, with the exact configuration steps, credentials needed, OAuth flow, the MCP server (if any), and the Phase + Gate that activates it. **Stop at every gate.** Every credential is set in Vercel env vars, never the repo.

---

## Quick map

| Service | Role | MCP | OAuth | Phase | Gate |
|---|---|---|---|---|---|
| Stripe | Payments | ✅ Stripe MCP | API keys | 11 | Payment Activation |
| Supabase | Private storage + signed URLs | ✅ Supabase MCP | API keys | 11 | Architecture Lock + Payment Activation |
| Resend | Transactional email | — (REST) | API key + DNS | 0 + 12 | Automation Activation |
| MailerLite | Primary CRM / marketing email | ✅ MailerLite MCP | API key | 12 | Automation Activation |
| Vercel | Hosting | ✅ Vercel MCP | OAuth | 0, 20, 21 | Production Launch |
| Namecheap | DNS | — | manual | 21 | Production Launch |
| Cloudflare Turnstile | Bot protection | — | site key + secret | 14 | (no gate; security-hardening) |
| GA4 | Analytics (consent-gated) | — | property | 13 | (no gate; SEO/discovery) |
| Sentry | Error tracking (PII-safe) | — | DSN | 14 | (no gate) |
| Datadog | APM | ✅ Datadog MCP | OAuth | 21 | Production Launch |
| PagerDuty | Incident routing | ✅ PagerDuty MCP | OAuth | 21 | Production Launch |
| Substack | RSS sync | — (web_fetch) | manual | 12 | Automation Activation |
| Figma | Design source | ✅ Figma MCP | OAuth | 4, 7 | Design Lock |
| Adobe | Asset generation | ✅ Adobe MCP | OAuth | 9 | (no gate; assets) |
| Higgsfield | Visual generation | ✅ Higgsfield MCP | API key | 9 | (no gate; assets) |
| 21st.dev Magic | Component generation | ✅ Magic MCP | API key | 8 | (no gate; non-hero) |
| Gamma | Deck generation (launch-week assets) | ✅ Gamma MCP | OAuth | 9 | optional |
| GitHub | Repo, Actions | ✅ GitHub MCP | OAuth | 0, 18, 20 | Production Launch |
| Notion / Linear / Asana / Slack | Project + ops | ✅ each | OAuth | 0 | optional |
| DocuSign | Retailer contracts | ✅ DocuSign MCP | OAuth | Post-launch | Legal |
| QuickBooks | Reconciliation | ✅ QuickBooks MCP | OAuth | Post-launch | Finance |
| Canva | Social variants | ✅ Canva MCP | OAuth | 9 | optional |
| Ahrefs | SEO research | ✅ Ahrefs MCP | OAuth | 13 | optional |
| HubSpot / Klaviyo | Alt CRM/ESP | ✅ each | OAuth | — | not used (MailerLite primary) |
| Amazon KDP / B&N / Waterstones / Indigo | Paperback retailers | — | manual | 2 (T+1+) | Strategy Lock |

---

## 1. Stripe

**MCP:** `mcp__d6c1a2a4-1d72-471d-b62b-a737bf5b6e67__*`
**Credentials:** `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PREORDER`, `STRIPE_PRICE_ID_REGULAR`

**Configuration:**

1. Sign in to Stripe Dashboard. Use **test mode** until Phase 11 gate.
2. Create products:
   ```
   mcp__d6c1a2a4-1d72-471d-b62b-a737bf5b6e67__create_product
   name: "Curls & Contemplation eBook (Launch)"
   description: "EPUB + PDF bundle, direct download"
   ```
3. Create prices:
   ```
   mcp__d6c1a2a4-1d72-471d-b62b-a737bf5b6e67__create_price
   product: {product_id_from_step_2}
   unit_amount: 1799
   currency: usd
   ```
   Repeat for $19.99 regular. Capture both `price_*` IDs into `.env`.
4. **Webhook endpoint:** `https://curlsandcontemplation.com/api/stripe/webhooks`. Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `charge.dispute.created`.
5. Enable **Stripe Tax** on the product. Set `tax_behavior: exclusive` (US sales-tax friendly).
6. **Test:** card `4242 4242 4242 4242`, any future expiry, any CVC. Confirm:
   - Webhook fires with valid signature
   - Order row created in SQLite
   - Download token issued (Supabase path resolves)
   - Refund via dashboard → token revoked, S6 email sent
7. **Phase 11 gate:** flip to live keys, run **one** live $17.99 transaction with your own card, refund immediately, confirm both legs.

**Security:** `STRIPE_SECRET_KEY` is server-only. Webhook payloads are signature-verified before any state change. Never log card data — Stripe's masked output is the only safe surface.

---

## 2. Supabase

**MCP:** `mcp__f0cedb5d-b90d-4b65-bbe3-c96c97c7f36b__*`
**Credentials:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

**Configuration:**

1. Create a Supabase project (free tier is fine for launch):
   ```
   mcp__f0cedb5d-b90d-4b65-bbe3-c96c97c7f36b__list_organizations
   # then
   mcp__f0cedb5d-b90d-4b65-bbe3-c96c97c7f36b__create_project
   name: "curls-and-contemplation"
   region: us-east-1
   ```
2. Storage → create bucket `curls-deliverables`. **Visibility: PRIVATE.** Disable public URLs.
3. Upload files via dashboard or CLI:
   - `books/curls-and-contemplation/v4.epub` (the V4 EPUB)
   - `books/curls-and-contemplation/pod-6x9.pdf`
4. Apply migration `web/migrations/2026-05-22-v2-launch.sql` via `apply_migration`.
5. Wire `web/lib/supabase.ts` per `10_FOUNDATION_FILES.md § 5`.
6. **Test:** issue a signed URL via `signedEpubUrl()`; confirm:
   - URL expires in 24h
   - Without service key, you cannot list the bucket contents
   - The signed URL serves only the file requested

**Security:** `SUPABASE_SERVICE_ROLE_KEY` is server-only. RLS policies do not apply to storage; the bucket privacy + signed URL pattern is the entire gate.

---

## 3. Resend

**MCP:** none — REST API
**Credentials:** `RESEND_API_KEY`, `FROM_EMAIL`, `FROM_NAME`

**Configuration:**

1. Sign up at `resend.com`. Verify your domain (`curlsandcontemplation.com`).
2. Add DNS records (Namecheap):
   - `MX 10 send.resend.com` (or per dashboard)
   - SPF `v=spf1 include:resend.com ~all`
   - DKIM (3 CNAMEs from dashboard)
   - DMARC `v=DMARC1; p=quarantine; rua=mailto:dmarc@curlsandcontemplation.com`
3. **Warm-up:** send 10 emails per day to known-good inboxes for 7 days before launch.
4. Audience setup: optional — only used for re-engagement.
5. **Test:** send the S2 Pre-Order Confirmation template to a test inbox. Inbox-placement should be Primary (Gmail), not Promotions.

**Security:** `RESEND_API_KEY` server-only. Email content templates checked into repo (no PII). Real subscriber emails only appear at send time.

---

## 4. MailerLite (primary CRM)

**MCP:** `mcp__122e7fb1-db70-4a3a-a188-5a00e26bf2cf__*`
**Credentials:** `MAILERLITE_API_KEY` + 7 group IDs

**Configuration:**

1. Sign in to `mailerlite.com` (account: `warrenm115@gmail.com`).
2. Get API key: Integrations → API → Generate new token. Scope: full.
3. Create the 7 groups via MCP:
   ```
   mcp__122e7fb1-db70-4a3a-a188-5a00e26bf2cf__create_group  name: "Subscribers"
   # …repeat for: Pricing Kit, Sample Chapter, Pre-Orders, Post-Order Customers, Refunded, Substack Synced
   ```
   Capture each `id` into `.env` (`MAILERLITE_GROUP_SUBSCRIBERS=...`).
4. Build S1, S3, S4 automations via dashboard or MCP `create_automation`. Trigger = group join. Steps per `05_EMAIL_SEQUENCES.md`.
5. Create a webhook for unsubscribe sync:
   ```
   mcp__122e7fb1-db70-4a3a-a188-5a00e26bf2cf__create_webhook
   url: https://curlsandcontemplation.com/api/mailerlite/webhook
   events: ["subscriber.unsubscribed", "subscriber.bounced"]
   ```
6. **Test:** add `test+ml@curlsandcontemplation.com` via MCP → confirm S1-E1 lands inside 60s.

**Security:** API key server-only. Webhook payloads verified by shared secret (`MAILERLITE_WEBHOOK_SECRET`, separate from API key).

---

## 5. Vercel

**MCP:** `mcp__c4c0c8ed-15e2-4a3b-9001-0768775a3fa8__*`
**OAuth:** Vercel account → install Vercel app

**Configuration:**

1. Create project from `miketui/Last` repo. Root directory = `web/`.
2. Build command per `web/vercel.json`.
3. Add **per-environment** env vars (Local / Preview / Production). Never share values across environments.
4. Configure custom domain `curlsandcontemplation.com`. Follow Vercel DNS instructions to point Namecheap CNAME/A.
5. Crons (already in `vercel.json`):
   - `/api/cron/process-emails` every 5 min
   - `/api/cron/release-ebook` 09:00 UTC daily
   - `/api/cron/substack-sync` every 6h
   - `/api/cron/token-cleanup` 03:00 UTC daily
6. **Phase 20 gate:** preview deploy, walk full funnel mobile + desktop in Claude in Chrome, then production deploy.

**Security:** `CRON_SECRET` bearer token required on every cron endpoint. Vercel calls auto-include `x-vercel-cron-signature` — verify it server-side.

---

## 6. Namecheap (DNS)

**MCP:** none
**Access:** Namecheap account login

**Configuration:**

1. Sign in. Domain → Advanced DNS.
2. Records:
   - `A` apex → Vercel IP (per Vercel dashboard, usually `76.76.21.21`)
   - `CNAME` `www` → `cname.vercel-dns.com`
   - Resend DKIM/SPF/DMARC records (§ 3 Resend)
   - Optional `_dmarc` TXT
3. **Pre-flip check:** verify TTL is ≤ 300s temporarily so rollback is fast.
4. **Phase 21:** flip apex; monitor for 60 minutes.

---

## 7. Cloudflare Turnstile

**MCP:** none
**Credentials:** `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`

**Configuration:**

1. Sign in to Cloudflare → Turnstile → Add site.
2. Domain `curlsandcontemplation.com`. Widget type: invisible (or managed — managed is the safer default).
3. Add the widget to every public form: `/`, `/resources` (Pricing Kit), `/checkout` email step, `/about` contact (if added).
4. Server: verify token against `https://challenges.cloudflare.com/turnstile/v0/siteverify` on every form submit. Reject if score < 0.5.
5. **Test:** open in a clean browser; Turnstile should auto-pass. Try via curl with no token → must return 400.

---

## 8. GA4 (consent-gated)

**MCP:** none (Amplitude MCP available if migrating)
**Credentials:** `GA4_MEASUREMENT_ID`

**Configuration:**

1. Create GA4 property → Web data stream → measurement ID `G-XXXXXX`.
2. Wire into the SPA only after consent is granted:
   ```ts
   if (isAnalyticsOn()) loadGA4(GA4_MEASUREMENT_ID);
   ```
3. Set up consent mode (`gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied' })`) on page load.
4. Events to fire (consent-gated):
   - `email_subscribe` (lead magnet, newsletter)
   - `lead_magnet_download` (Pricing Kit, Sample Chapter)
   - `checkout_start`, `checkout_complete`
   - `chapter_view`, `blog_read_complete`
   - `exit_intent_shown`, `exit_intent_converted`
5. **Privacy:** IP-anonymized by default. Never set user-level identifiers tied to PII.

---

## 9. Sentry

**MCP:** none
**Credentials:** `SENTRY_DSN`

**Configuration:**

1. Sentry project → Bun (or generic JavaScript) → DSN.
2. Init in `server.ts` with `beforeSend` filter:
   ```ts
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
     beforeSend(event) {
       // strip emails, tokens, card data
       const s = JSON.stringify(event).replace(/[\w.-]+@[\w.-]+/g, "[email]");
       return JSON.parse(s);
     },
     tracesSampleRate: 0.1,
   });
   ```
3. **No PII in breadcrumbs.** Manually scrub `req.body.email` etc.
4. Alert rules: payment-flow errors page on call, all others digest daily.

---

## 10. Datadog (post-launch APM)

**MCP:** `mcp__plugin_engineering_datadog__authenticate`
**OAuth:** run authenticate flow

**Configuration:**

1. Wire Datadog APM via `dd-trace` for Bun (alpha) OR via Vercel's Datadog integration (preferred — zero-code).
2. Dashboards: `/api/checkout`, `/api/stripe/webhooks`, `/api/download/:token` latency + error rate.
3. Monitor on:
   - Webhook signature failure > 0 (paging)
   - `/api/download/:token` 4xx burst > 10 / min (likely abuse)
   - p95 LCP > 2.5s (perf budget)

---

## 11. PagerDuty

**MCP:** `mcp__plugin_engineering_pagerduty__authenticate`

**Configuration:**

1. Service `curls-and-contemplation-production`.
2. Escalation policy: Michael primary, no secondary (solo author).
3. Datadog → PagerDuty integration; route only the paging-grade monitors above.

---

## 12. Substack

**MCP:** none (use `mcp__workspace__web_fetch` to poll RSS)
**Credentials:** `SUBSTACK_FEED_URL` (e.g., `https://michaeldavid.substack.com/feed`)

**Configuration:**

1. Confirm RSS is enabled (it is by default on Substack).
2. The cron at `/api/cron/substack-sync` polls every 6h. New posts get staged in `posts_substack`.
3. **Manual approval per broadcast** before MailerLite sends — Phase 12 gate.
4. Buyer-only Substack post: create one Substack post with `Paid` audience; surface it in Curls's S4-E2 email via a `?ref=buyer-{token}` deep link. (Substack doesn't authenticate the ref param — the buyer-only-ness is the goodwill / on-site claim, not a cryptographic gate.)

---

## 13. Figma

**MCP:** `mcp__84219576-b93a-4259-9c34-4472cc312654__*`
**OAuth:** Figma account approval

**Configuration:**

1. Create a Figma library file for ACISS components.
2. Wire `figma:figma-generate-design` to produce the design lock in Figma.
3. `figma:figma-generate-library` for the component system.
4. `figma:figma-code-connect` to map Figma components → React components in `web/components/`.
5. **Phase 4 + 7:** designer reviews; Code Connect map ships before frontend-design uses it.

---

## 14. Adobe Creative Cloud

**MCP:** `mcp__3860784d-4fbb-40ca-b7b7-8289bb0ab199__*`
**OAuth:** `mcp__plugin_adobe-for-creativity_Adobe_for_creativity__authenticate`

**Configuration:**

1. **MUST call `mcp__3860784d-4fbb-40ca-b7b7-8289bb0ab199__adobe_mandatory_init` first** in every session.
2. Asset generation: OG images, badge variants, author photo retouch.
3. License: Adobe MCP outputs carry CC commercial license; record per-asset in `claims-evidence.md` § Assets.

---

## 15. Higgsfield AI

**MCP:** `mcp__0398c468-8543-4bc5-a786-af192bc31a97__*`
**Credentials:** account login or API key per Higgsfield onboarding

**Configuration:**

1. Workspace: pick the one Michael David uses.
2. Asset budget: pre-launch generations capped at $50 in credits.
3. Use cases:
   - One editorial hero motion clip (optional — Tier-2)
   - Background section detail (subtle)
   - Substack thumbnail variants
4. **Never** generate images of identifiable celebrity clients.

---

## 16. 21st.dev Magic

**MCP:** `mcp___21st-dev_magic__*`
**Credentials:** `TWENTYFIRST_API_KEY` (FREE — get at `21st.dev/magic`)

**Configuration:**

1. Install: `npx @21st-dev/cli@latest install claude --api-key <key>`
2. Use for non-hero components only.
3. Every Magic output passes `/engineering:code-review` before merge.

---

## 17. Gamma (decks)

**MCP:** `mcp__ced490fe-3f00-49d7-a17a-a8d10e358abd__*`
**OAuth:** browser OAuth

**Configuration:**

1. Optional: generate the launch-week press/press-release deck.
2. Themes: pick ACISS-adjacent (dark + champagne accent).
3. Output: PPTX + share link.

---

## 18. GitHub

**MCP:** `mcp__plugin_engineering_github__authenticate`
**OAuth:** repo `miketui/Last`

**Configuration:**

1. Approve OAuth scope: contents (read+write), pull requests, actions, workflows.
2. Branch protection on `main`:
   - require PR, ≥ 1 review
   - require `verify-build.sh` and CI checks to pass
   - block force-push
3. GitHub Action: on PR, run `verify-no-hardcoded` + `bun test` + Lighthouse CI.

---

## 19. Project + ops connectors (optional, useful)

| Service | When to use |
|---|---|
| Notion | Project knowledge base, gate-ledger backup |
| Linear | Issue tracking for fast-follow Tigers |
| Asana / ClickUp / Monday | Alternates — pick one, not all |
| Slack | Internal launch broadcast / oncall (solo: skip) |
| Atlassian | Only if you bring on a contractor team |

Each is `mcp__plugin_*__authenticate`. Connect lazily — only when needed.

---

## 20. Retailers (no MCP, manual)

| Retailer | Step | When |
|---|---|---|
| Amazon KDP | Paperback listing + Look Inside | T+1 (after launch confirmed direct sales work) |
| Barnes & Noble Press | Paperback | T+1 |
| Waterstones | Paperback (UK) | T+7 |
| Indigo | Paperback (CA) | T+7 |
| Apple Books | EPUB | T+14 |
| Google Play Books | EPUB | T+14 |

Each gets a single button on `/book` in the "Also available" row. Direct sales stay primary (better margin, owned list).

---

## 21. Credentials checklist (Phase 0)

A green checklist before Phase 0 closes:

- [ ] Stripe test+live keys captured in Vercel (Local + Preview + Production)
- [ ] Stripe webhook endpoint reachable from Vercel (sandbox event fires)
- [ ] Supabase project + bucket private + V4 EPUB + POD-6x9 PDF uploaded
- [ ] Resend domain validated DKIM + SPF + DMARC; warmup started
- [ ] MailerLite API key + 7 groups created
- [ ] Vercel project + custom domain
- [ ] Namecheap DNS targets ready (not yet flipped)
- [ ] Turnstile site key + secret
- [ ] GA4 property + consent mode test passes
- [ ] Sentry DSN + breadcrumb scrubber test passes
- [ ] GitHub OAuth + branch protection
- [ ] All MCPs in `08_MASTER_AI_BUILDER_PROMPT.md § J` reachable (`claude mcp list`)

Only then does the orchestrator move to Phase 1 (Discovery).

---

## 21.5 — Vercel Blob fallback for Supabase (pre-mortem fix B5)

The bundle's original delivery path was Supabase-only. If Supabase has a regional outage during the refund window, customers see errors instead of files. Fallback wiring:

1. Add env `BLOB_READ_WRITE_TOKEN` (already in `.env.example`).
2. Mirror the EPUB + PDF to a Vercel Blob private bucket:
   ```
   curl -X POST "https://blob.vercel-storage.com/books/curls-and-contemplation/v4.epub" \
     -H "authorization: Bearer $BLOB_READ_WRITE_TOKEN" \
     -H "content-type: application/epub+zip" \
     --data-binary "@CurlsAndContemplationV4.epub"
   ```
3. Schedule `/api/cron/blob-sync` nightly to confirm hashes match Supabase.
4. In `web/lib/supabase.ts`, wrap `createSignedUrl` with `withFallback`:
   ```ts
   export async function signedEpubUrl(): Promise<string> {
     try {
       return await supabaseSignedEpubUrl();
     } catch (e) {
       console.warn("[delivery] Supabase failed, falling back to Blob:", e);
       return await blobSignedEpubUrl();   // Vercel Blob signed URL
     }
   }
   ```
5. Failover test (required before Phase 11 gate): pause the Supabase project,
   request a download, expect 200 from the Blob mirror, expect token state
   (attempts/expiry) to remain consistent with SQLite.

Token state always lives in SQLite — Blob is read-only mirror. This keeps refund-revokes-access correct even mid-failover.

## 21.6 — Substack RSS sync exponential backoff (pre-mortem fix B11)

Bundle's original cron polled every 6h with no backoff. Substack rate-limits silently.

Update `web/lib/substack-sync.ts`:
```ts
let backoffMs = 60_000;  // 1 minute
const MAX_BACKOFF = 30 * 60_000;  // 30 minutes
const RESET_AFTER = 24 * 3_600_000;  // reset backoff after 24h of success

export async function pollSubstackWithBackoff() {
  try {
    const items = await pollSubstack();
    backoffMs = 60_000;  // reset on success
    return items;
  } catch (e) {
    console.warn(`[substack] poll failed, backing off ${backoffMs}ms:`, e);
    await new Promise(r => setTimeout(r, backoffMs));
    backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF);
    throw e;
  }
}
```

Add a Datadog monitor on `posts_substack.last_successful_sync_at`. Page if > 24h.

## 21.7 — Server-side conversion tracking (pre-mortem fix B14)

Apple ITP + Safari erode client-side GA4 attribution by 20–40%. Path:

1. Stripe webhook fires → after recording the order in SQLite, also POST to GA4 Measurement Protocol:
   ```ts
   await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`, {
     method: "POST",
     body: JSON.stringify({
       client_id: order.customer_email_hashed,
       events: [{ name: "purchase", params: { value: order.amount, currency: "USD", transaction_id: order.id } }],
     }),
   });
   ```
2. Add `GA4_API_SECRET` to `.env.example`.
3. Treat client-side GA4 events as directional only.

## 21.8 — Pre-launch ESP dual-send sanity test (pre-mortem fix B15)

T-3 day action — verify both ESP paths land in the inbox, not Promotions:

1. Trigger one Resend transactional → "from <hello@curlsandcontemplation.com> to test+resend@curlsandcontemplation.com".
2. Trigger one MailerLite broadcast → same test address.
3. Open in Gmail, Apple Mail, and Outlook. Confirm Primary placement.
4. If either lands in Promotions or Spam: investigate `from-name`, DKIM/SPF/DMARC alignment, header asymmetry. Fix or accept the deliverability risk in writing.

## 21.9 — Tier-2 hero perf test on real mobile (pre-mortem fix B16)

Run on a $200 mid-tier Android (the real-world median) during Phase 17:

1. Open Chrome DevTools → Lighthouse → mobile.
2. Throttle: Slow 4G + 6x CPU.
3. Run on `/` with Spline scene enabled.
4. If LCP > 2.5s, INP > 200ms, or CLS > 0.1: ship with `HERO_3D_ENABLED=false`. Revisit at T+30 with real RUM data.

## 22. Failure runbooks (one-paragraph each)

**Stripe webhook stops firing.** Check Stripe Dashboard → Webhooks → recent attempts. If signature failure: rotate `STRIPE_WEBHOOK_SECRET` and redeploy. If endpoint 5xx: check Vercel logs. While debugging, queue intent IDs from Stripe Dashboard and replay via `stripe events resend`.

**MailerLite automation mis-fires to wrong group.** Pause automation immediately via MCP `update_automation_email` / dashboard. Identify affected subscribers via `list_subscribers`. Send a single correction email manually from `hello@`. Do not let the corrupted automation auto-correct — it will mis-fire again.

**Supabase signed URL leaks.** If a URL is shared publicly: regenerate by rotating the service-role key (Supabase Dashboard → Settings → API). Update Vercel env. All old signed URLs invalidate immediately. Audit `download_tokens` for the breach window.

**DNS flip leaves stale records.** Lower TTL to 300s 24h before flip. If a region misroutes after flip, roll back A record and wait for propagation. Communicate via email blast only if outage > 4 hours.

**Resend deliverability tanks during launch.** Check Resend dashboard for bounce/complaint rate. If above 5%: pause sends, audit list hygiene (no spam-trap addresses), warm up again. Resend support is responsive.

---

*Every integration above is gated. No production keys land before the relevant `[GATE]` is approved and recorded in `GATE_LEDGER.md`.*
