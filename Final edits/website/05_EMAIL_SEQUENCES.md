# Email Sequences — Curls & Contemplation

Seven sequences, fully written. Each email has subject, preview text, plain-text body, send delay, merge tags, segment/group, ESP target (Resend transactional vs MailerLite broadcast), and the Phase 12 gate it falls under.

**Voice:** confident, direct, not corporate. Reads like Michael talking to a freelance hairstylist over coffee. No "Elevate your craft" / "Unlock your potential" / "In today's fast-paced world." Runs through `humanizer` and `brand-voice:enforce-voice` before deploy.

**Globals:**
- From: `Michael David <hello@curlsandcontemplation.com>`
- Reply-to: `hello@curlsandcontemplation.com`
- Physical address (CAN-SPAM): TAYLKOMB LLC mailing address — confirm at Legal Gate (Phase 15)
- Unsubscribe link: every email; one-click compliant
- UTM: `utm_source={ESP}&utm_medium=email&utm_campaign={sequence}&utm_content={email_step}`
- Footer: physical address · unsubscribe · privacy link · "You're getting this because..."

---

## Sequence index

| # | Name | Trigger | Emails | ESP | Group | Gate |
|---|---|---|---|---|---|---|
| S1 | Welcome | New subscriber to `Subscribers` | 4 over 7 days | MailerLite automation | Subscribers | Phase 12 |
| S2 | Pre-Order Confirmation | `payment_intent.succeeded` (preorder) | 1 immediate | Resend transactional | Pre-Orders | Phase 11 |
| S3 | Launch Reminders | In `Pre-Orders` group | 3 (T-7, T-3, T-day) | MailerLite automation | Pre-Orders | Phase 12 |
| S4 | Post-Purchase | `payment_intent.succeeded` (postorder) | 3 over 14 days | Resend + MailerLite | Post-Order Customers | Phase 11+12 |
| S5 | Lead Magnet Delivery | `/api/free-resource` (Pricing Kit) | 1 immediate | Resend transactional | Pricing Kit | Phase 12 |
| S6 | Refund Notice | `charge.refunded` | 1 immediate | Resend transactional | Refunded | Phase 11 |
| S7 | Substack Broadcast | New Substack post via cron | 1 per post | MailerLite broadcast | Subscribers minus Substack Synced | Phase 12 |

---

## S1 — Welcome (4 emails, 7 days)

### S1-E1 — Day 0 (immediate)

- **Subject:** Hey from Michael — a quick note before the inbox-noise starts
- **Preview:** What you're going to get from me. And what you won't.
- **Send delay:** 0 min after signup
- **Segment:** `Subscribers` (excludes `Pre-Orders` and `Post-Order Customers`)

```
Hi {{first_name|fallback:"there"}},

Thanks for subscribing. I'm Michael David — hairstylist for Rihanna day to day, and the author of Curls & Contemplation, the book I wrote because nobody handed me a manual for any of this.

Here's what you'll get from me:

  · Field notes from the chair — pricing, networking, the business side
  · The Pricing Confidence Kit (free; link below)
  · Updates on the book launch (pre-order is $15.99 — bonus bundle included)
  · The occasional behind-the-scenes from the editorial side

Here's what you won't:

  · Daily emails. I respect your inbox.
  · Generic affiliate pitches.
  · "Quick question, hopping in your DMs" sales tactics.

The Pricing Confidence Kit — the thing every freelance hairstylist I know should already have — is yours:

  → {{pricing_kit_url}}

Hit reply if you want. I read every one.

— Michael

—
Curls & Contemplation · {{physical_address}}
Unsubscribe: {{unsubscribe_url}} · Privacy: https://curlsandcontemplation.com/privacy
```

### S1-E2 — Day 2

- **Subject:** The first chapter, free — and why I started this
- **Preview:** Chapter 1 PDF, plus the conversation that started the book.

```
{{first_name|fallback:"Hi"}} —

I want to send you the first chapter of the book, free.

Chapter 1 — "Unveiling Your Creative Odyssey" — is the chapter I wish someone had handed me when I went freelance. It's not theory. It's the questions I had to answer to stop renting my craft and start building it.

  → {{sample_chapter_url}}

It exists because of one conversation. A hairstylist I'd assisted for years told me she was getting out — not because the work failed her, but because nobody ever showed her the business behind it. That's the gap this book fills.

If the first chapter lands with you, the rest is a pre-order:

  → https://curlsandcontemplation.com/book

Pre-order is $15.99 and includes the full bonus bundle — EPUB + PDF, the Pricing Confidence Kit, the chapter workbook, and free lifetime updates. That price holds through the 90-day pre-order window and the first 14 days after launch. After that, $17.99.

— Michael
```

### S1-E3 — Day 4

- **Subject:** Who this book is for (and who it isn't)
- **Preview:** Real readers, real names, real chair time.

```
{{first_name|fallback:"Hey"}} —

This book is for you if:

  · You're freelance or stepping out of the salon
  · You've ever priced yourself by what you think clients will tolerate
  · You've watched a peer build a brand while you built a portfolio
  · You're tired of pretending the business side will figure itself out

It is not for you if:

  · You want a shortcut to a celebrity client list (the book is about the work that earns it, not the trick to skipping it)
  · You want a step-by-step franchise blueprint
  · You're allergic to writing your own emails, contracts, and rate sheets

A couple of early readers — real hairstylists, real names — said it best:

  "I priced myself for the next ten years in a weekend." — Tasha L., NYC
  "The chapter on burnout was the chapter I needed three years ago." — Jordan M., Atlanta

If that's you, here's the pre-order:

  → https://curlsandcontemplation.com/book

— Michael
```

> Real-reader testimonials: pull two from your IPPY readers / advance copy round. Replace placeholders before send. Phase 15 legal gate verifies consent.

### S1-E4 — Day 7

- **Subject:** A soft ask — pre-order if it's a yes
- **Preview:** Three reasons launch buyers matter more than launch-day buyers.

```
{{first_name|fallback:"Hi"}} —

Last note before I go quiet for a while.

If the book is a yes for you, the pre-order is the move. Three reasons:

  1. Price. $15.99 now, $17.99 after launch + 14 days. That's it.
  2. The bundle. Every pre-order includes the EPUB + PDF, the Pricing Confidence Kit, the chapter workbook, free lifetime updates, and a pre-order-only bonus chapter — none of which comes with the $9.99 Kindle edition.
  3. You get everything the morning of release — no waiting on a retailer fulfillment queue. And every pre-order is a vote that puts the book in front of more hairstylists who need it.

  → https://curlsandcontemplation.com/book

If now isn't the moment, that's fine too. You'll still get the field notes. The Pricing Kit is yours regardless.

— Michael
```

---

## S2 — Pre-Order Confirmation (1 email, immediate)

- **Trigger:** Stripe `payment_intent.succeeded` with metadata `launch_state=preorder`
- **ESP:** Resend (transactional — never delayed by marketing throttling)
- **Subject:** Pre-order confirmed — your copy ships {{release_date}}
- **Preview:** Receipt, portal link, and what happens on launch day.

```
{{first_name|fallback:"Hello"}} —

Your pre-order is in. Thank you — this is the part of the launch that actually matters.

  Order: {{order_id}}
  Amount: ${{amount}} {{currency}}
  Date: {{order_date}}
  Email: {{customer_email}}

On launch day ({{release_date}}), you'll get an email with a secure download link for the EPUB and PDF. The link expires after 7 days and allows up to 3 downloads — if you need a resend, just reply to this email.

Your order portal:
  → {{portal_url}}

Save this URL — it's the home base for your order. Bookmark it.

Questions, replies, edits to your name on the receipt — hit reply.

— Michael

—
Curls & Contemplation · TAYLKOMB LLC · {{physical_address}}
Refund policy: https://curlsandcontemplation.com/refund-policy
```

---

## S3 — Launch Reminders (3 emails)

### S3-E1 — T-7

- **Subject:** One week until launch
- **Preview:** What to expect in your inbox on the morning of {{release_date}}.

```
{{first_name|fallback:"Hi"}} —

Seven days until {{release_date}}.

When the day arrives, you'll get one email from me with:

  · A secure download link for the EPUB
  · A secure download link for the POD-6x9 PDF
  · A short note on what to read first (Chapters 1, 6, and 11 if you're choosing)

The links live for 7 days, allow 3 downloads, and if anything breaks — reply, I'll resend.

Bookmark your portal in case you misplace anything:
  → {{portal_url}}

— Michael
```

### S3-E2 — T-3

- **Subject:** Three days. Pre-launch checklist.
- **Preview:** What to set up before the EPUB lands.

```
{{first_name|fallback:"Hey"}} —

Three days. Two quick housekeeping items:

  1. EPUB readers: if you don't have one, Apple Books is free on Mac/iPhone, Google Play Books is free on Android, and on a PC, Calibre is the classic. Kindle users — open Kindle for Mac/PC or "Send to Kindle" from Amazon (free; uploads the EPUB to your library).

  2. PDF: any PDF reader works. The POD-6x9 is also the print-ready file — if you ever want a paperback, it's the same file.

That's it. See you on the morning of {{release_date}}.

— Michael
```

### S3-E3 — T-day (launch morning)

- **Subject:** It's here. Your copy of Curls & Contemplation.
- **Preview:** Download links inside. Welcome to launch day.

```
{{first_name|fallback:"Hello"}} —

The book is here.

  → EPUB: {{download_epub_url}}
  → PDF (POD-6x9): {{download_pdf_url}}

Both links expire in 7 days and allow up to 3 downloads each. Lost them or need a resend? Reply to this email — I'll handle it.

If you'd like to start somewhere specific:
  · Chapter 1 — the "why I'm doing this" chapter
  · Chapter 6 — the business of hairstyling (the most-bookmarked chapter in the advance round)
  · Chapter 11 — advanced digital strategies (the one that earns its weight in social-media time saved)

When you finish, an Amazon review or a note back to me both help. The first more than the second, but I'll take the second too.

Welcome.

— Michael
```

---

## S4 — Post-Purchase (3 emails, 14 days)

### S4-E1 — Day 0 (instant; postorder only — different from S2)

- **Trigger:** Stripe `payment_intent.succeeded` with metadata `launch_state=postorder`
- **ESP:** Resend
- **Subject:** Your copy of Curls & Contemplation
- **Preview:** Download links inside. Thank you.

```
{{first_name|fallback:"Hello"}} —

Your order is confirmed. Here are your download links:

  → EPUB: {{download_epub_url}}
  → PDF (POD-6x9): {{download_pdf_url}}

7 days, up to 3 downloads each. Need a resend? Reply.

Where to start: Chapter 1 ("Unveiling Your Creative Odyssey") is the door in. Chapter 6 ("Mastering the Business of Hairstyling") is the most-bookmarked.

Welcome.

— Michael
```

### S4-E2 — Day 3

- **ESP:** MailerLite
- **Subject:** A quick check-in — and a Substack note for buyers
- **Preview:** What chapter are you on? Plus, a buyer-only post unlock.

```
{{first_name|fallback:"Hi"}} —

Three days in. Two things:

  1. Question — what chapter are you on? Reply with a number. I'm tracking the early pattern.

  2. As a buyer, you've earned access to a Substack post I keep behind a soft gate — "The Rate Conversation Nobody Has." It's a longer expansion of Chapter 6:

     → {{substack_buyer_url}}

(The link includes a buyer-tag in the URL — that's how it unlocks.)

— Michael
```

### S4-E3 — Day 14

- **ESP:** MailerLite
- **Subject:** If the book worked, one ask
- **Preview:** A review — Amazon or anywhere — moves more than I can.

```
{{first_name|fallback:"Hey"}} —

Two weeks in. If the book worked for you, the single biggest thing you can do for it is leave a review.

  · Amazon: {{amazon_url}}
  · Goodreads: {{goodreads_url}}

A real sentence from you moves more than a paid ad ever will. If it didn't work — reply with what missed. I'm taking notes for the next edition.

— Michael
```

---

## S5 — Lead Magnet Delivery (1 email, immediate)

- **Trigger:** `POST /api/free-resource` with `resource=pricing-kit`
- **ESP:** Resend
- **Subject:** Your Pricing Confidence Kit — open me
- **Preview:** The rate calculator, the scripts, the article. All inside.

```
{{first_name|fallback:"Hi"}} —

Here's the Pricing Confidence Kit:

  → {{pricing_kit_url}}

Inside:

  · The rate calculator (set your real number from your actual cost-of-living + craft hours)
  · The price-increase scripts (what to text, what to say in the chair)
  · The value-articulation guide (one page; print it; tape it to the back of your station mirror)

Use it. If a script lands a rate raise, reply and tell me — I keep score.

— Michael

—
P.S. The Kit is a sample of how the book treats every business question. If it earned the rate, the book is your next move.
  → https://curlsandcontemplation.com/book
```

---

## S6 — Refund Notice (1 email, immediate)

- **Trigger:** Stripe `charge.refunded`
- **ESP:** Resend (legally required acknowledgement)
- **Subject:** Refund confirmed — Curls & Contemplation
- **Preview:** Your refund is processing. Your download access has been revoked.

```
{{first_name|fallback:"Hi"}} —

Your refund is confirmed.

  Order: {{order_id}}
  Refund amount: ${{refund_amount}} {{currency}}
  Date: {{refund_date}}

Refunds typically post to your card within 5–10 business days, depending on your bank.

As part of the refund, your download links for the EPUB and PDF have been revoked. Your portal will show "Refunded" status.

If the refund was a misunderstanding — reply and I'll help sort it.

— Michael

—
Refund policy: https://curlsandcontemplation.com/refund-policy
```

---

## S7 — Substack Broadcast (1 per new post)

- **Trigger:** `web/scripts/substack-cron.ts` detects new RSS GUID
- **ESP:** MailerLite broadcast
- **Subject:** {{post_title}} — new field note
- **Preview:** {{post_excerpt|truncate:120}}
- **Send time:** Tuesday 10:00 ET or Thursday 10:00 ET, whichever is next; cron stages, broadcasts manual-approved (Phase 12 gate)

```
{{first_name|fallback:"Hi"}} —

New post on the Substack:

  {{post_title}}

  {{post_excerpt}}

  → Read: {{post_url}}

If the field notes are helpful, the book goes deeper — Chapter {{related_chapter_n}} expands on this idea:

  → https://curlsandcontemplation.com/book

— Michael
```

---

## MailerLite group taxonomy

| Group | When subscriber lands here | When they leave |
|---|---|---|
| `Subscribers` | Any signup | Unsubscribe |
| `Pricing Kit` | `/api/free-resource?resource=pricing-kit` | never (additive tag) |
| `Sample Chapter` | `/api/free-resource?resource=sample-chapter` | never (additive tag) |
| `Pre-Orders` | Stripe payment succeeds with `launch_state=preorder` | Refund |
| `Post-Order Customers` | Stripe payment succeeds with `launch_state=postorder` | Refund |
| `Refunded` | `charge.refunded` | manual |
| `Substack Synced` | Opened S7 broadcast | manual archive |

Group IDs are configured in `.env.production` per `10_FOUNDATION_FILES.md` § env. Group creation steps in `11_INTEGRATION_PLAYBOOK.md` § MailerLite.

---

## Sequence build — MailerLite automation triggers

Each automation in MailerLite is built once via the dashboard (or via `mcp__122e7fb1-db70-4a3a-a188-5a00e26bf2cf__create_automation` if the MCP is connected) with these triggers:

| Sequence | Trigger type | Trigger value |
|---|---|---|
| S1 Welcome | Subscriber joins group | `Subscribers` |
| S3 Launch Reminders | Subscriber joins group | `Pre-Orders` |
| S4-E2/E3 Post-Purchase nurture | Subscriber joins group | `Post-Order Customers` |
| S7 Substack | Manual broadcast queued by cron | — |

S2, S4-E1, S5, S6 are direct Resend API calls from `web/lib/email-sequences/*.ts` triggered by webhook or form post — never delayed through MailerLite.

---

## Pre-send checklist (every sequence)

- [ ] Subject + preview text reviewed (no AI-tell, no "Elevate")
- [ ] `humanizer` skill pass complete
- [ ] `brand-voice:enforce-voice` pass complete
- [ ] All merge tags resolved in test send
- [ ] Unsubscribe link works (one-click)
- [ ] Physical address visible in footer
- [ ] UTM parameters set
- [ ] CAN-SPAM compliant
- [ ] Phase 12 `[GATE: automation activation]` approval recorded in `GATE_LEDGER.md`

---

## Cutover — 7-day MailerLite + Mailchimp dual-write window (pre-mortem fix B4)

The bundle's original spec hard-cutover from Mailchimp to MailerLite. That's risky —
if MailerLite API key, group IDs, or automation triggers misfire on Day 1, no
subscriber lands anywhere and the launch list silently black-holes.

**Mitigation:** run a 7-day dual-write window before fully cutting over.

```ts
// web/lib/email-cutover.ts  (delete after 30 days post-launch)
import { addSubscriber as mlAdd } from "./mailerlite";
import { addToMailchimpAudience } from "./mailchimp";  // legacy adapter

export async function dualWriteSubscriber(p: { email: string; name?: string; mlGroupId: string }) {
  const results = await Promise.allSettled([
    mlAdd(p.email, p.name, p.mlGroupId),
    addToMailchimpAudience(p.email, p.name),
  ]);
  // Both succeed → green. Either fails → page + log without blocking signup.
  for (const r of results) {
    if (r.status === "rejected") console.error("[cutover] ESP write failed:", r.reason);
  }
  return { mailerlite: results[0].status, mailchimp: results[1].status };
}
```

**Cutover gate criteria** (Phase 12 `[GATE: automation activation]` cannot close until):
- [ ] 100 real signups successfully landed in **both** ESPs over a 24-hour rolling window
- [ ] Zero ESP write errors logged in the past 48 hours
- [ ] Test signup verification (next section) confirms automations fire on MailerLite side

Once green: pause Mailchimp automations (do not delete — capture-only); cutover is complete.

Delete `email-cutover.ts` + legacy Mailchimp env vars at T+30 (after the migration window).

---

## Test signup verification

Before any sequence goes live, run a test signup through the MailerLite MCP:

```
mcp__122e7fb1-db70-4a3a-a188-5a00e26bf2cf__add_subscriber
email: "test+verify@curlsandcontemplation.com"
group_id: {{Subscribers_id}}
```

Confirm:
- [ ] S1-E1 lands in test inbox within 60 seconds
- [ ] From/reply-to/footer all correct
- [ ] Links resolve
- [ ] Unsubscribe revokes membership in all groups

Only then approve the Phase 12 gate.

---

*Sequences are content-locked. Trigger wiring and group assignment are code work in `web/lib/email-sequences/`. Every send to a real subscriber requires the Phase 12 gate.*
