# Curls & Contemplation — Sitemap + SEO

**Domain (placeholder):** `https://curlsandcontemplation.com` — confirm at Strategy Lock gate.
**Generated:** 2026-05-22
**Authority:** Phase 13 (SEO / schema / discovery) of `studio-site-orchestrator`.

---

## Convention

| Field | Rule |
|---|---|
| `title` | ≤60 characters; primary keyword front; brand suffix `\| Curls & Contemplation` only where space allows |
| `description` | ≤155 characters; verb-first; one promise, one CTA hint; no clickbait |
| `canonical` | always self-canonical unless explicitly cross-domain (mdw-portfolio links use cross-canonical) |
| `og:image` | 1200×630 PNG, ACISS-styled, generated via Adobe MCP per route family |
| `priority` | `1.0` home · `0.9` `/book` · `0.8` chapter index, FAQ, about · `0.7` blog index, resources · `0.6` chapter previews, blog posts · `0.3` legal · `0.0` admin/portal/download (noindex) |
| `changefreq` | `weekly` blog · `monthly` chapter + book · `yearly` legal · `daily` home (pre-launch only) |

---

## Public marketing routes

### `/` — Home

| Field | Value |
|---|---|
| title | `Curls & Contemplation — The Hairstylist's Guide to Creative Excellence` |
| description | `By Rihanna's day-to-day hairstylist. Pre-order the freelance hairstylist's guide that turns a craft into a career. Pre-order $15.99.` |
| canonical | `https://curlsandcontemplation.com/` |
| og:image | `/og/home.png` |
| JSON-LD | `WebSite` + `Person` (Michael David) + `Organization` (TAYLKOMB LLC) |
| priority | `1.0` |
| changefreq | `daily` (pre-launch), `weekly` (post-launch) |
| robots | `index, follow` |

### `/book` — Book sales page

| Field | Value |
|---|---|
| title | `The Book — Curls & Contemplation by Michael David Warren Jr.` |
| description | `Pre-order the freelance hairstylist's playbook. 16 chapters, 4 parts, IPPY-submitted. EPUB + PDF + bonus bundle. Pre-order $15.99.` |
| canonical | `https://curlsandcontemplation.com/book` |
| og:image | `/og/book.png` |
| JSON-LD | `Book` (schema.org/Book with isbn, author, publisher, offers, aggregateRating placeholder) + `BreadcrumbList` |
| priority | `0.9` |
| changefreq | `monthly` |
| robots | `index, follow` |

### `/chapters` — Chapter index

| Field | Value |
|---|---|
| title | `All 16 Chapters — Curls & Contemplation` |
| description | `Browse the full table of contents. From creative odyssey to leadership and legacy — 16 chapters across 4 parts.` |
| canonical | `https://curlsandcontemplation.com/chapters` |
| og:image | `/og/chapters.png` |
| JSON-LD | `CollectionPage` + `BreadcrumbList` |
| priority | `0.8` |
| changefreq | `monthly` |
| robots | `index, follow` |

### `/chapter/:slug` — Chapter preview (×16)

Pattern: `title` = `{Chapter Title} — Curls & Contemplation`; `description` = chapter pull-quote (155 char trim). JSON-LD = `CreativeWork` + `BreadcrumbList`. Priority `0.6`. All 16 indexed.

| # | Slug | Title (used in `<title>`) | Description seed |
|---|---|---|---|
| 1 | `unveiling-your-creative-odyssey` | Unveiling Your Creative Odyssey | The first chapter — where craft becomes calling. Read the opening of the freelance hairstylist's guide. |
| 2 | `refining-your-creative-toolkit` | Refining Your Creative Toolkit | What goes in the kit, what stays out — the working toolkit of a deliberate hairstylist. |
| 3 | `reigniting-your-creative-fire` | Reigniting Your Creative Fire | Burnout, plateaus, and the work of staying in love with the craft. |
| 4 | `the-art-of-networking-in-freelance-hairstyling` | The Art of Networking | The non-scammy way to build the room you want to walk into. |
| 5 | `cultivating-creative-excellence-through-mentorship` | Cultivating Excellence Through Mentorship | How to find a mentor — and be one — without losing the year. |
| 6 | `mastering-the-business-of-hairstyling` | Mastering the Business of Hairstyling | Rates, contracts, taxes, and the conversations freelance schools skip. |
| 7 | `embracing-wellness-and-self-care` | Embracing Wellness and Self-Care | The body the chair takes back — and how to give it less to take. |
| 8 | `advancing-skills-through-continuous-education` | Advancing Skills Through Education | The CE habit that keeps a freelance career bookable for 20 years. |
| 9 | `stepping-into-leadership` | Stepping Into Leadership | When the chair becomes a team — leadership for hairstylists. |
| 10 | `crafting-enduring-legacies` | Crafting Enduring Legacies | What gets remembered after the last booking. |
| 11 | `advanced-digital-strategies-for-freelance-hairstylists` | Advanced Digital Strategies | Owned audience, paid audience, and what to actually post. |
| 12 | `financial-wisdom-building-sustainable-ventures` | Financial Wisdom — Sustainable Ventures | The freelance financial stack: cash, taxes, retirement, the second venture. |
| 13 | `embracing-ethics-and-sustainability-in-hairstyling` | Ethics and Sustainability | The product-choice question that has gotten serious. |
| 14 | `the-impact-of-ai-on-the-beauty-industry` | The Impact of AI on Beauty | What AI takes, what it can't, and how to stay valuable to a client. |
| 15 | `cultivating-resilience-and-well-being-in-hairstyling` | Resilience and Well-Being | The long career — what makes one possible. |
| 16 | `tresses-and-textures-embracing-diversity-in-hairstyling` | Tresses and Textures — Embracing Diversity | The portfolio every hairstylist owes the people in their chair. |

### `/blog` — Blog index

| Field | Value |
|---|---|
| title | `Field Notes — Curls & Contemplation Blog` |
| description | `Pricing, networking, burnout, and craft. Field notes for freelance hairstylists from Michael David Warren Jr.` |
| canonical | `https://curlsandcontemplation.com/blog` |
| og:image | `/og/blog.png` |
| JSON-LD | `Blog` + `BreadcrumbList` |
| priority | `0.7` |
| changefreq | `weekly` |
| robots | `index, follow` |

### `/blog/:slug` — Blog post (×3 launch)

| Slug | Title (in `<title>`) | Description |
|---|---|---|
| `pricing-strategy-for-freelance-hairstylists` | Pricing Strategy for Freelance Hairstylists | The pricing conversation every freelance hairstylist avoids — and how to have it without flinching. |
| `networking-secrets-for-hairstylists` | Networking Secrets for Hairstylists | The non-scammy network. How to build the room you want to walk into. |
| `overcoming-creative-burnout` | Overcoming Creative Burnout | The burnout playbook for a creative career — without leaving the chair. |

JSON-LD on each: `Article` (with `author`, `publisher`, `image`, `datePublished`) + `BreadcrumbList`.

### `/faq` — FAQ

| Field | Value |
|---|---|
| title | `FAQ — Pre-Order, Downloads, Refunds \| Curls & Contemplation` |
| description | `Answers on pre-order timing, EPUB and PDF delivery, refunds, and reading on Kindle. 20+ questions, six categories.` |
| canonical | `https://curlsandcontemplation.com/faq` |
| og:image | `/og/faq.png` |
| JSON-LD | `FAQPage` (all Q/A pairs) + `BreadcrumbList` |
| priority | `0.8` |
| changefreq | `monthly` |
| robots | `index, follow` |

FAQ categories: Purchase & Download · Book Content · Pricing & Payment · Interactive Features · Support · About the Author.

### `/about` — About the author

| Field | Value |
|---|---|
| title | `About Michael David Warren Jr. — Rihanna's Hairstylist, Author` |
| description | `Rihanna's day-to-day hairstylist. Trained under Guido Palau and Jimmy Paul. IPPY Awards submission Category 47. The story behind the book.` |
| canonical | `https://curlsandcontemplation.com/about` |
| og:image | `/og/about.png` |
| JSON-LD | `Person` + `BreadcrumbList` (cross-link to mdw-portfolio with cross-canonical) |
| priority | `0.8` |
| changefreq | `monthly` |
| robots | `index, follow` |

### `/resources` — Free downloads

| Field | Value |
|---|---|
| title | `Free Downloads — Pricing Kit + Sample Chapter` |
| description | `The Pricing Confidence Kit and the first chapter — free. For freelance hairstylists rebuilding their rate from the inside out.` |
| canonical | `https://curlsandcontemplation.com/resources` |
| og:image | `/og/resources.png` |
| JSON-LD | `ItemList` (DigitalDocument × 2) + `BreadcrumbList` |
| priority | `0.7` |
| changefreq | `monthly` |
| robots | `index, follow` |

---

## Commerce routes

### `/checkout`

| Field | Value |
|---|---|
| title | `Checkout — Curls & Contemplation` |
| description | `Complete your pre-order. Direct EPUB + PDF bundle, secure Stripe checkout, refund within 30 days.` |
| canonical | `https://curlsandcontemplation.com/checkout` |
| robots | `noindex, follow` |

### `/thank-you`

| Field | Value |
|---|---|
| title | `Thank You — Order Confirmed` |
| description | `Your order is in. Check your inbox for confirmation and your secure download link.` |
| canonical | `https://curlsandcontemplation.com/thank-you` |
| robots | `noindex, nofollow` |

### `/portal/:token` and `/download/:token`

`robots: noindex, nofollow` · per-customer token URLs · stripped from sitemap.

---

## Legal routes (all `priority: 0.3, changefreq: yearly, robots: index, follow`)

| Route | Title |
|---|---|
| `/privacy` | `Privacy Policy — Curls & Contemplation` |
| `/terms` | `Terms of Service — Curls & Contemplation` |
| `/refund-policy` | `Refund Policy — Curls & Contemplation` |
| `/preorder-policy` | `Pre-Order Policy — Curls & Contemplation` |
| `/digital-delivery-policy` | `Digital Delivery Policy — Curls & Contemplation` |
| `/cookies` | `Cookies & Tracking — Curls & Contemplation` |
| `/accessibility` | `Accessibility Statement — Curls & Contemplation` |

JSON-LD on each: `WebPage` + `BreadcrumbList`.

---

## Admin routes (all `robots: noindex, nofollow`)

`/admin` · `/admin/orders` · `/admin/subscribers` · `/admin/analytics` · `/admin/broadcasts` — auth-gated, omitted from sitemap.xml.

---

## API + cron (all `robots: noindex, nofollow`, excluded from sitemap)

`/api/subscribe` · `/api/free-resource` · `/api/checkout` · `/api/stripe/webhooks` · `/api/portal/:token` · `/api/download/:token` · `/api/track` · `/api/health` · `/api/admin/*` · `/api/cron/process-emails` · `/api/cron/release-ebook` · `/api/cron/substack-sync` · `/api/cron/token-cleanup`.

---

## XML sitemap (generated)

Generator script lives at `web/scripts/build-sitemap.ts` — see `10_FOUNDATION_FILES.md`. Output `web/public/sitemap.xml`. Includes only routes flagged `index` above. Regenerated on every build via `vercel.json` build hook.

---

## robots.txt (final)

```
# Curls & Contemplation — robots.txt
User-agent: *
Disallow: /admin
Disallow: /admin/
Disallow: /portal/
Disallow: /download/
Disallow: /api/
Disallow: /thank-you
Disallow: /checkout
Allow: /

Sitemap: https://curlsandcontemplation.com/sitemap.xml
```

(Also blocks `gpt-bot`, `cc-bot`, `anthropic-ai` if author opts to — set in env `LLM_CRAWLERS_ALLOWED=false`.)

---

## OG image generation

Per `09_PROMPT_LIBRARY.md` Phase 9 (Visual Assets), run:

```
/adobe-for-creativity:adobe-design-from-template
template: "1200x630 social-share"
ACISS palette
For each route family (home, book, chapters, faq, about, resources, blog), generate one OG image with title overlay.
Output: /web/public/og/{route}.png
Record commercial-use license in build log.
```

Higgsfield optional for the home hero OG only (cinematic editorial style).

---

## Cross-canonical decisions

| Surface | Cross-canonical to | Why |
|---|---|---|
| `/about` author bio block | `michaeldavidjr.beauty/about` | Portfolio site owns the canonical author profile |
| `/chapter/the-impact-of-ai-on-the-beauty-industry` | Substack `/p/ai-and-beauty-industry` (if cross-posted) | Substack carries the long-form expansion |

Implementation: `<link rel="canonical" href="{external}" />` only where the external page is the primary version. Otherwise self-canonical.

---

*This sitemap is the lock document for the SEO phase. The orchestrator does not enter Phase 13 (SEO / schema / discovery) without this approved.*
