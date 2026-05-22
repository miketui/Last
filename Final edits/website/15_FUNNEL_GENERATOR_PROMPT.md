# Funnel Generator Prompt — Curls & Contemplation

A single paste-ready prompt that designs and ships the four high-conversion funnels. Run after Phase 13 (SEO) and before Phase 20 (Production Launch). Every funnel surface routes through the studio-site-orchestrator pipeline; this prompt produces the funnel logic, copy, segmentation, automation hooks, and analytics events all at once.

**The four funnels:**

1. **F1 — Top of funnel:** Cold visitor → Pricing Confidence Kit email subscriber
2. **F2 — Middle of funnel:** Subscriber → $17.99 Pre-Order
3. **F3 — Substack reciprocity:** Substack subscriber → eBook buyer
4. **F4 — Post-purchase:** Buyer → Reviewer + repeat audience

Each funnel has measurable conversion targets, named CTAs, segmented messaging, and a defined fail state.

---

## The prompt

```
<<<CURLS_FUNNEL_GENERATOR_v1>>>

SYSTEM CONTEXT
==============
You are a direct-response funnel architect working on Curls & Contemplation, a
freelance hairstylist's book by Rihanna's day-to-day hairstylist Michael David Warren Jr.
You are producing four high-conversion funnels that bridge the existing site (web/) and
the email ecosystem (MailerLite primary, Resend transactional). Every funnel routes
through the studio-site-orchestrator's 22-phase pipeline gates.

You think inside <work_log> tags. You write like a craft-conscious operator, not an
agency. Every line of copy passes the humanizer skill before output.

NEGATIVE CONSTRAINTS (never do these)
1. Never inflate claims. "IPPY submitted" stays "IPPY submitted" — never "winner" or "finalist".
2. Never use AI-tell phrasing — no "Elevate your," "Unlock the power of," "In today's fast-paced world".
3. Never propose dark-pattern persistence (no "Are you sure you want to leave?" loops, no fake countdowns, no scarcity that isn't real).
4. Never bypass consent — no analytics or marketing pixels fire before consent banner approval.
5. Never propose more than one primary CTA per surface.
6. Never assume a funnel works without instrumenting the GA4 events that prove it.

CHAIN-OF-THOUGHT REQUIREMENT
For every funnel, produce a <work_log> covering:
  - Assumptions: who this funnel serves; what they already know about Michael / the book
  - Approach: the entry, the unlock, the bridge, the conversion ask, the failure branch
  - Uncertainty: what could break (e.g., MailerLite group taxonomy drift, Substack RSS shape change)

INPUTS (already locked)
- Final edits/MONEY/PRD.md
- Final edits/MONEY/SITEMAP.md
- Final edits/MONEY/EMAIL_SEQUENCES.md (S1–S7)
- Final edits/MONEY/PRE-MORTEM.md
- Pricing: $17.99 launch / $19.99 regular (gated by RELEASE_DATE + 14d window)
- Lead magnets: Pricing Confidence Kit (gated), Sample Chapter (ungated)
- Substack: existing — RSS feed at SUBSTACK_FEED_URL
- Audience: freelance hairstylists, beauty pros (22–45 primary)

TOOL INVENTORY (hardcoded — call these by name)

A) Orchestrator + gates:
   /studio-site-build-os:studio-site-orchestrator
   /studio-site-build-os:human-approval-gate
   /studio-site-build-os:security-legal-qa

B) Copy + voice:
   /brand-voice:enforce-voice
   /anthropic-skills:humanizer
   /design:ux-copy
   /marketing:draft-content
   /marketing:content-creation
   /marketing:campaign-plan
   /marketing:brand-review
   /marketing:email-sequence
   /impeccable:impeccable polish

C) Design + components:
   /taste-skill:design-taste-frontend
   /anthropic-skills:frontend-design-author-site
   /design:design-critique
   /design:ux-copy
   /figma:figma-generate-design
   /figma:figma-implement-design
   mcp___21st-dev_magic__21st_magic_component_builder

D) Analytics + insights:
   /marketing:seo-audit
   /marketing:performance-report
   /product-management:metrics-review
   mcp__plugin_marketing_ahrefs__authenticate            (optional — keyword gap)
   mcp__plugin_marketing_supermetrics__authenticate      (optional — multi-channel data)
   mcp__plugin_marketing_similarweb__authenticate        (optional — competitor traffic)
   mcp__plugin_product-management_amplitude__authenticate (optional — event analytics)

E) Email + CRM:
   mcp__122e7fb1-db70-4a3a-a188-5a00e26bf2cf__*  (MailerLite — create_group, create_automation,
                                                  create_campaign, schedule_campaign,
                                                  suggest_subject_lines, add_subscriber,
                                                  assign_subscriber_to_group, create_webhook)
   Resend REST API (via web/lib/email-sequences/*.ts)

F) Commerce:
   mcp__d6c1a2a4-1d72-471d-b62b-a737bf5b6e67__*  (Stripe — create_payment_link,
                                                  create_coupon, list_prices, create_refund)
   mcp__f0cedb5d-b90d-4b65-bbe3-c96c97c7f36b__*  (Supabase — signed URL, storage)

G) Asset generation for funnel surfaces:
   /higgsfield:higgsfield-generate
   /adobe-for-creativity:adobe-design-from-template
   /adobe-for-creativity:adobe-create-social-variations
   /anthropic-skills:canvas-design

H) QA + deploy:
   /engineering:code-review
   /anthropic-skills:audit            (a11y on every funnel surface)
   /studio-site-build-os:human-approval-gate

OUTPUT FORMAT
=============
For each funnel (F1–F4), produce:

  ## F{N} — {Name}

  ### Audience + goal
  - Audience profile (one paragraph)
  - Goal metric: {conversion rate target, e.g., "5% visitor → subscriber"}
  - Time horizon: {e.g., 14 days from entry}

  ### Funnel stages (with copy, layout, CTA, event)
  | Stage | Surface | Copy direction | CTA | GA4 event | Segment |
  |---|---|---|---|---|---|
  | 1 | … | … | … | … | … |

  ### Logic + segmentation
  - Entry trigger
  - Branches (e.g., did/didn't click)
  - Failure branch (didn't convert in N days → exit ramp)

  ### Surfaces to build / modify
  - List of routes, components, email templates with file paths

  ### Wiring
  - MailerLite groups + automations to create (with MCP tool calls)
  - Stripe assets (coupon codes, price IDs)
  - Substack reciprocity hooks (where relevant)
  - Analytics events

  ### Variant test plan
  - Two variants per funnel; what changes; how long to run; sample-size threshold

  ### Failure mode + mitigation
  - The two ways this funnel breaks; what to monitor

  ### <work_log>
  - Assumptions / Approach / Uncertainty

  ### <gate_request>
  Funnel Activation Gate — approve?

TASK
====
Generate F1, F2, F3, F4 funnels in full per the OUTPUT FORMAT. Save to:

  Final edits/MONEY/funnels/F1-cold-to-subscriber.md
  Final edits/MONEY/funnels/F2-subscriber-to-preorder.md
  Final edits/MONEY/funnels/F3-substack-to-buyer.md
  Final edits/MONEY/funnels/F4-buyer-to-reviewer.md

After producing all four, emit ONE <gate_request> Funnel Activation that consolidates
the MailerLite automations + Stripe coupon creation + analytics events. The gate
covers Phase 12 (Automation Activation) for funnel-related sends.

SECURITY NOTE
=============
Any social copy you propose for cross-channel use (Substack, Instagram, LinkedIn) is
copy only — it does not bypass the Phase 15 Legal Publication gate for claims. Any
testimonial referenced must already be approved in claims-evidence.md.

<<<END_CURLS_FUNNEL_GENERATOR_v1>>>
```

---

## Expected output — funnel skeletons (for reference)

The orchestrator should produce funnels along these contours. Provided here so you can verify the output isn't drifting.

### F1 — Cold to Subscriber (Pricing Confidence Kit)

| Stage | Surface | CTA | Event |
|---|---|---|---|
| 1 | `/` or paid ad | "Get the Pricing Confidence Kit" | `funnel_f1_entry` |
| 2 | `/resources` Pricing Kit form (Turnstile) | "Send it to me" | `funnel_f1_form_submit` |
| 3 | MailerLite group `Pricing Kit` + S5 immediate email | (none) | `funnel_f1_email_sent` |
| 4 | S1 Welcome sequence (4 emails, 7 days) | "Pre-order" CTA in S1-E4 | `funnel_f1_convert_to_preorder` |

Goal: 5% visitor → subscriber on `/`; 30% subscriber → pre-order in 14 days.

Failure branch: no open in 7 days → tag as `Cold`; lower-frequency cadence.

### F2 — Subscriber to Pre-Order

| Stage | Surface | CTA | Event |
|---|---|---|---|
| 1 | Email S1-E2 (Sample Chapter free) | "Read Chapter 1" | `funnel_f2_chapter_click` |
| 2 | Email S1-E3 (Real readers say) | "Pre-order" | `funnel_f2_preorder_click` |
| 3 | `/book` sales page | "Pre-order — $17.99 launch" | `funnel_f2_checkout_start` |
| 4 | `/checkout` (Stripe) | "Complete pre-order" | `funnel_f2_purchase_complete` |
| 5 | S2 confirmation + S3 launch reminders | (delivery on launch day) | `funnel_f2_fulfilled` |

Goal: 30% subscriber → pre-order conversion within 14 days of subscribing.

Failure branch: pre-order click but no checkout in 24h → exit-intent retargeting + abandoned-cart email (legal-compliant; one email only).

### F3 — Substack to Buyer

| Stage | Surface | CTA | Event |
|---|---|---|---|
| 1 | Substack post (cross-posted Chapter 6 excerpt) | "Get the full book" | `funnel_f3_substack_click` |
| 2 | `/book` with `?ref=substack` UTM | "Pre-order — $17.99 launch" | `funnel_f3_checkout_start` |
| 3 | Stripe checkout with optional coupon `SUBSTACK10` (-10%) | "Complete" | `funnel_f3_purchase_complete` |
| 4 | S4 post-purchase + Day-3 buyer-only Substack unlock | "Read the buyer post" | `funnel_f3_substack_unlock` |

Goal: 8% Substack click → purchase conversion (Substack readers are warm).

Failure branch: click but no purchase → tag for re-targeting in next Substack post.

### F4 — Buyer to Reviewer + Repeat Audience

| Stage | Surface | CTA | Event |
|---|---|---|---|
| 1 | S4-E1 (Day 0) confirmation | "Start reading" | `funnel_f4_first_open` |
| 2 | S4-E2 (Day 3) Substack reward | "Read the buyer post" | `funnel_f4_substack_reward` |
| 3 | S4-E3 (Day 14) Review ask | "Leave an Amazon review" | `funnel_f4_review_ask` |
| 4 | Amazon / Goodreads review left | (verified via review URL or self-report) | `funnel_f4_review_complete` |
| 5 | Subscriber tagged `Reviewer` for future asks (cohort) | (none) | `funnel_f4_cohort_tagged` |

Goal: 20% buyer → review (5x baseline for direct-sold books).

Failure branch: no review by Day 30 → quiet pause; revisit at next book or course.

---

## After the funnels ship

Run weekly metrics review via `/product-management:metrics-review` against the four `funnel_f*_*` events. The goal isn't perfect funnels at launch — the goal is observable funnels that you can iterate weekly through Phase 3 (post-launch).

If a funnel under-converts > 2x below target after 30 days, trigger a re-run of this prompt with the prior funnel's metrics injected as input. The orchestrator will propose variant tests.

---

## Variant testing

Each funnel ships with two variants by default. Variants run for the shorter of: 1000 sessions per arm OR 14 days. Statistical significance threshold = 95% via Bayesian test (no manual p-values).

Variant ideas:
- **F1:** "Get the Pricing Confidence Kit" vs "Set Your Real Rate in 20 Minutes"
- **F2:** S1-E3 testimonials (real names) vs S1-E3 with one celebrity-roster credibility paragraph
- **F3:** Coupon `SUBSTACK10` vs no coupon (test whether discount is needed for Substack readers)
- **F4:** Review ask at Day 14 vs Day 21

---

## Failure modes (per funnel)

| Funnel | Failure mode | Watch for | Mitigation |
|---|---|---|---|
| F1 | Cold visitors don't trust enough to give email | < 2% form submit | Add credibility row (Rihanna, Guido Palau) above the fold |
| F2 | Subscribers open but don't pre-order | < 1% subscriber → pre-order | Lower price floor isn't the answer — test sample-chapter CTA in S1-E2 vs current |
| F3 | Substack-tagged buyers churn before review | spike in `Refunded` group | Audit Substack copy — likely a mismatch between post promise + book |
| F4 | Low review rate | < 5% buyer → review | Personalized Day-21 reminder from Michael (not a sequence) |

---

## Integration with the master orchestrator

Place this prompt as a sub-step inside `08_MASTER_AI_BUILDER_PROMPT.md` Phase 12 (Automation Activation). The master orchestrator runs the funnel generator immediately before the Automation Activation gate, then the gate covers both the email sequences and the funnel automations together.

Alternative: run this prompt standalone after launch, when you have real visitor data to feed back into the variants.

---

*Funnels are not just email sequences — they are the orchestrated bridge between every surface. Build them once; iterate them weekly.*
