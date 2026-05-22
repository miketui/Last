# Claims Evidence — Curls & Contemplation

**Required artifact** per pre-mortem fix B9. Every public claim made on `/`, `/book`, `/about`, or marketing copy must have a dated source in this file. Updated before the Phase 15 Legal Publication gate.

**Owner:** Michael David Warren Jr.
**Last verified:** 2026-05-22 (placeholder — refresh at every gate)
**Storage:** committed in `Last/Final edits/website/claims-evidence.md`. Never publicly indexed (path is repo-only, not on the live site).

---

> ## ⛔ BLOCKER — THIS FILE IS NOT YET COMPLETE
>
> Every `[PLACEHOLDER]` and `[YYYY-MM-DD]` below is unfilled. **No public page, email, or
> ad making any of these claims may ship until its row is completed with real, dated evidence.**
> This is a hard gate, not a formality:
>
> - "Rihanna's day-to-day hairstylist," "IPPY," "Guido Palau," and "Jimmy Paul" are legal
>   claims. Shipping them unsubstantiated invites a cease-and-desist or an FTC complaint.
> - **This file cannot be auto-filled.** Only Michael can supply the call sheets, pay stubs,
>   written confirmations, and screenshots. Do not delete a claim to "unblock" it — either
>   substantiate it, or remove it from the site and email copy as well.
> - The Phase 15 Legal Publication gate **cannot close** while any row here is a placeholder.
>
> **Status: 🔴 0 of 7 claim groups substantiated. Owner: Michael.**

---

## Schema

For each claim, capture:

- **Claim text** — exactly as it appears in copy
- **Surface** — which pages/emails carry it
- **Source** — paystub, contract, screenshot, written confirmation, URL
- **Date verified** — last time the source was checked
- **Expiry condition** — when the claim could become inaccurate (e.g., "if Rihanna gig ends")
- **Fallback copy** — what to swap in if claim becomes inaccurate
- **Approver** — who confirmed accuracy

---

## Claim 1 — "Rihanna's day-to-day hairstylist"

- **Surface:** `/`, `/book`, `/about`, S1-E1 welcome email, OG meta descriptions
- **Source:** [PLACEHOLDER — confirm via call sheet, pay stub, agency confirmation, or signed letter. Attach screenshot or scan.]
- **Date verified:** [YYYY-MM-DD]
- **Expiry condition:** if Michael's day-to-day role on Rihanna's team ends, this claim becomes "Former day-to-day hairstylist" or omits the relationship.
- **Fallback copy:** "Hairstylist for Rihanna's editorial and live appearances" (if reduced role) OR "Among the hairstylists who have worked with Rihanna" (if minimal).
- **Approver:** Michael
- **Notes:** Highest-leverage claim in the marketing. Verify at every gate. Verify weekly during pre-order phase.

---

## Claim 2 — "IPPY Awards submission — Category 47"

- **Surface:** `/`, `/book`, `/about`, footer credibility row
- **Source:** [PLACEHOLDER — IPPY confirmation email or receipt. Attach.]
- **Date verified:** [YYYY-MM-DD]
- **Expiry condition:** if an actual result lands (winner, medalist, honorable mention, or non-placement), update the claim accordingly.
- **Fallback copy:** if no result and time has passed → "IPPY Awards 2026 entrant" (passive); if disqualified → remove entirely.
- **Approver:** Michael
- **Notes:** **Never inflate.** "Submission" stays "submission" until a verifiable result lands. "Winner" / "Finalist" without documentation = legal exposure (per `14_SECURITY_LEGAL_QA.md § B.5`).

---

## Claim 3 — "Trained under Guido Palau"

- **Surface:** `/about`, S1-E1 welcome email
- **Source:** [PLACEHOLDER — paystub, assistant credit, written confirmation, or signed letter from Guido Palau or his team.]
- **Date verified:** [YYYY-MM-DD]
- **Expiry condition:** none (historical claim once verified).
- **Fallback copy:** if the relationship is informal mentorship rather than formal assistant work → "Studied under Guido Palau" (which carries different legal weight). Disclose accurately.
- **Approver:** Michael
- **Notes:** Industry credibility claim. Verifiable via call sheet credits or editorial credit lines.

---

## Claim 4 — "Trained under Jimmy Paul"

- **Surface:** `/about`, S1-E1 welcome email
- **Source:** [PLACEHOLDER — same evidence standard as Claim 3.]
- **Date verified:** [YYYY-MM-DD]
- **Expiry condition:** none (historical claim once verified).
- **Fallback copy:** "Studied under Jimmy Paul" or omit.
- **Approver:** Michael

---

## Claim 5 — Testimonials (real-name only, written consent)

For each testimonial used on `/`, `/book`, or in emails (S1-E3 mentions Tasha L., Jordan M. as placeholders):

| # | Name | Role | Location | Quote (verbatim) | Consent (written? signed?) | Date received | Surface |
|---|---|---|---|---|---|---|---|
| 1 | [PLACEHOLDER] | [PLACEHOLDER] | [PLACEHOLDER] | "[exact text]" | Written via [email/contract] on [date] | YYYY-MM-DD | S1-E3 |
| 2 | [PLACEHOLDER] | [PLACEHOLDER] | [PLACEHOLDER] | "[exact text]" | Written via [email/contract] on [date] | YYYY-MM-DD | /book |

**Rule:** if consent is not in writing, the testimonial is not used — even if the quote was offered. Verbal consent is not sufficient for published claims.

---

## Claim 6 — Bestseller badge (post-launch)

- **Surface:** `bestseller-badge/badges.json` consumed on `/` and `/book` strip
- **Condition for use:** book must actually appear on a recognized list (Amazon Top 100 in category, Goodreads "Best Books" featured list, or comparable). Internal best-seller-by-revenue claims need framing ("Curls bestseller list" not "Bestseller").
- **Source per badge:** screenshot of the list page with the book visible + date.
- **Expiry condition:** badge becomes "achieved" (past tense) after 90 days. Live badges expire automatically per `bestseller-badge/` config.
- **Approver:** Michael + Phase 15 legal gate

---

## Claim 7 — Book content claims

| Claim | Source | Verified |
|---|---|---|
| "16 chapters across 4 parts" | TOC in CurlsAndContemplationV4.epub | [YYYY-MM-DD] |
| "EPUB + PDF bundle" | files in repo root | [YYYY-MM-DD] |
| "$15.99 pre-order price" | Stripe price ID PREORDER | [YYYY-MM-DD] |
| "$17.99 regular price" | Stripe price ID REGULAR | [YYYY-MM-DD] |
| "Pre-order bonus bundle (Pricing Kit, workbook, lifetime updates, bonus chapter)" | bonus assets in repo + `17_WEBSITE_COPY.md` | [YYYY-MM-DD] |
| "Direct download, no Amazon" | architecture in PRD § 3 | [YYYY-MM-DD] |
| "30-day refund policy" | `/refund-policy` page | [YYYY-MM-DD] |
| "7-day download link, 3 attempts" | `download_tokens` schema | [YYYY-MM-DD] |

---

## Claims that are NOT made (deliberate omissions)

| Claim type | Why we don't make it |
|---|---|
| "Bestselling author" (without verified list) | False until evidenced. |
| "Award-winning" (without verified award) | Same. |
| "Endorsed by [celebrity]" | Endorsement requires written consent, which we don't have. |
| "100,000 hairstylists trust this book" | We don't have the data and the number isn't real. |
| Medical, hair-loss, or scalp-condition claims | The book is craft + business, not medical. |
| Income-guarantee claims | "Triple your rate" / "earn six figures" — never. The book teaches; it doesn't promise. |

---

## Update cadence

- **Pre-launch:** verify Claims 1–5 weekly during the 7 weeks before launch.
- **Launch week:** verify Claim 1 (Rihanna) on the morning of launch.
- **Post-launch:** verify Claims 1 + 2 monthly. Re-verify Claims 6 + 7 as new entries land.

---

## Audit log

| Date | Reviewer | Claims checked | Outcome | Notes |
|---|---|---|---|---|
| 2026-05-22 | (template) | — | — | File created from pre-mortem fix B9 |
| | | | | |

---

*This file is the substantiation gate. Phase 15 Legal Publication cannot close until every claim above has real evidence and a recent verification date. Forbidden until substantiated: "winner", "finalist", "Bestseller" — these carry legal weight beyond marketing.*
