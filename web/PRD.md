# Product Requirements Document (PRD)

## Curls & Contemplation — eBook Sales Platform

**Product:** Author website and digital commerce platform for *Curls & Contemplation: A Freelance Hairstylist's Guide to Creative Excellence* by Michael David Warren

**Version:** 1.0
**Date:** 2026-02-16
**Status:** Pre-Launch (Pre-Order Phase)

---

## 1. Product Overview

### 1.1 Purpose

A direct-to-consumer eBook sales platform that enables Michael David Warren (Rihanna's day-to-day hairstylist) to sell his book directly to readers, capture leads, nurture prospects via automated email sequences, and manage orders — all without relying on Amazon or third-party storefronts.

### 1.2 Target Audience

- **Primary:** Freelance hairstylists looking to grow their business and creative skills
- **Secondary:** Beauty industry professionals (salon owners, cosmetology students)
- **Tertiary:** Fans of Rihanna/celebrity culture interested in behind-the-scenes insights

### 1.3 Business Model

| Item | Price | Format |
|------|-------|--------|
| eBook (primary) | $19.99 | EPUB + PDF bundle |
| Pricing Confidence Kit (lead magnet) | Free | PDF |
| Sample Chapter | Free | PDF |
| Paperback (external links) | TBD | Amazon/B&N/Waterstones/Indigo |

---

## 2. Product Architecture

### 2.1 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Runtime | Bun | Fast startup, built-in bundler, TypeScript-native |
| Server | Bun.serve() | No Express overhead, native route handling, WebSocket support |
| Database | SQLite via bun:sqlite | Zero-config, embedded, sufficient for single-author commerce |
| Frontend | React 19 SPA | Client-side routing, component reuse |
| Bundling | Bun HTML imports | No Webpack/Vite needed, automatic TSX transpilation |
| Payments | Stripe Payment Elements | PCI-compliant, supports multiple payment methods |
| Transactional Email | Resend | Developer-friendly API, good deliverability |
| Marketing Email | Mailchimp | List management, segmentation, industry standard |
| Bot Protection | Cloudflare Turnstile | Privacy-friendly CAPTCHA alternative |
| Analytics | Google Analytics + Custom | GA for traffic, custom SQLite for business metrics |
| Deployment | Railway | Bun-native hosting, persistent SQLite volumes |

### 2.2 System Diagram

```
┌─────────────────────────────────────────────────┐
│                   Browser (SPA)                  │
│  React 19 · Client-side Router · Stripe.js      │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────┐
│              Bun.serve() (port 3000)             │
│                                                   │
│  ┌─────────┐  ┌──────────┐  ┌────────────────┐  │
│  │  Pages   │  │   API    │  │  Static Files  │  │
│  │  (SPA)   │  │ Handlers │  │  /public/*     │  │
│  └─────────┘  └────┬─────┘  └────────────────┘  │
│                     │                             │
│  ┌──────────────────▼──────────────────────────┐ │
│  │              Business Logic                  │ │
│  │  lib/stripe · lib/email · lib/email-auto    │ │
│  └──────────────────┬──────────────────────────┘ │
│                     │                             │
│  ┌──────────────────▼──────────────────────────┐ │
│  │           SQLite Database (bun:sqlite)       │ │
│  │  customers · orders · tokens · subscribers   │ │
│  │  email_queue · webhook_events · page_views   │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
         │              │              │
    ┌────▼────┐   ┌────▼────┐   ┌────▼─────┐
    │  Stripe  │   │  Resend  │   │ Mailchimp│
    │ Payments │   │  Email   │   │ Marketing│
    └─────────┘   └─────────┘   └──────────┘
```

---

## 3. Functional Requirements

### 3.1 Public Pages

| # | Page | Route | Requirements |
|---|------|-------|-------------|
| F1 | Homepage | `/` | Hero with 3D book cover, value proposition, social proof, email capture CTA, exit-intent modal |
| F2 | Book Sales Page | `/book` | Full-length sales page: problem/solution framing, benefits grid, table of contents, author credentials, testimonials, pricing, buy CTA |
| F3 | Chapter Index | `/chapters` | Grid of all 16 chapters organized by 4 parts, each linking to preview |
| F4 | Chapter Preview | `/chapter/:slug` | Individual chapter excerpt with Bible quote, key takeaways, pull quotes, CTA to purchase |
| F5 | Blog | `/blog` | Blog index with 3 initial posts, categories, read time estimates |
| F6 | Blog Post | `/blog/:slug` | Full post with navigation to prev/next, related chapters CTA |
| F7 | FAQ | `/faq` | 20+ questions in accordion UI, organized into 6 categories |
| F8 | About | `/about` | Full author biography, credentials (Rihanna, celebrity clients), story arc |
| F9 | Resources | `/resources` | Free downloads hub — Pricing Confidence Kit, sample chapter, worksheets |
| F10 | Checkout | `/checkout` | 2-step form: email/name capture → Stripe Payment Element, coupon code field |
| F11 | Thank You | `/thank-you` | Post-purchase confirmation with order details and next steps |
| F12 | Order Portal | `/portal/:token` | Secure download portal with pre-order countdown or download links |
| F13 | Privacy Policy | `/privacy` | Legal page |
| F14 | Terms of Service | `/terms` | Legal page |
| F15 | Refund Policy | `/refund-policy` | Legal page |

### 3.2 Admin Pages

| # | Feature | Route | Requirements |
|---|---------|-------|-------------|
| F16 | Admin Login | `/admin` | Username/password auth, 24-hour session tokens |
| F17 | Dashboard | `/admin` (authenticated) | Revenue totals, order count, subscriber count, download count, email queue status |
| F18 | Order Management | `/admin` (orders tab) | List/filter orders by status, view order details |
| F19 | Subscriber Management | `/admin` (subscribers tab) | View all subscribers, filter by source |
| F20 | Analytics | `/admin` (analytics tab) | Revenue by day chart, subscriber growth, traffic stats, top pages |

### 3.3 Commerce Features

| # | Feature | Requirements |
|---|---------|-------------|
| F21 | Pre-Order Mode | Before RELEASE_DATE: accept payments, show countdown, hold fulfillment |
| F22 | Post-Launch Mode | After RELEASE_DATE: immediate download delivery on purchase |
| F23 | Stripe Payment | Payment Elements integration, metadata tracking (email, name, UTM) |
| F24 | Coupon Codes | Validate discount codes via Stripe API, apply to payment intent |
| F25 | Download Tokens | Time-limited (7 days), usage-limited (3 downloads), extendable |
| F26 | Portal Tokens | Persistent unguessable URLs for order access, no login required |
| F27 | Webhook Processing | Idempotent handling of `payment_intent.succeeded` and `charge.refunded` |
| F28 | Refund Handling | Revoke download tokens, cancel queued emails, update Mailchimp tags |
| F29 | Release Day Cron | Bulk fulfill all pre-orders: create download tokens, send delivery emails |
| F30 | Rate Limiting | IP-based rate limiting on download endpoint (10 req / 5 min) |

### 3.4 Email Automation

| # | Sequence | Trigger | Emails |
|---|----------|---------|--------|
| F31 | Welcome Sequence | New subscriber | 4 emails over 7 days (welcome → value → social proof → soft sell) |
| F32 | Pre-Order Confirmation | Payment succeeded (pre-launch) | Immediate confirmation + portal link |
| F33 | Launch Reminders | Pre-order exists | 7 days before, 3 days before, launch day notification |
| F34 | Purchase Thank You | Payment succeeded (post-launch) | Immediate with download links + day 3 check-in + day 14 review ask |
| F35 | Lead Magnet Delivery | Free resource request | Immediate delivery email with download link |
| F36 | Refund Notice | Charge refunded | Confirmation of refund processing |
| F37 | Newsletter Broadcasts | Admin-initiated | Segmented sends to subscriber list |
| F38 | Email Queue Processing | Cron (every 5 min) | Batch process up to 100 pending emails per run |

### 3.5 Lead Generation

| # | Feature | Requirements |
|---|---------|-------------|
| F39 | Email Subscription | Form with email + optional name, Turnstile protection |
| F40 | Pricing Confidence Kit | Gated download: email required, triggers nurture sequence |
| F41 | Sample Chapter | Ungated download: no email required, top-of-funnel |
| F42 | Exit Intent Modal | Appears when cursor leaves viewport (after 5s delay), offers lead magnet |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| # | Requirement |
|---|-------------|
| NF1 | Page load < 2s on 3G connection (SPA with bundled assets) |
| NF2 | Server response < 100ms for API endpoints |
| NF3 | SQLite handles up to 10K concurrent reads without degradation |
| NF4 | Font preloading via `<link rel="preload">` for WOFF2 assets |

### 4.2 Security

| # | Requirement |
|---|-------------|
| NF5 | Stripe webhook signature verification on all payment events |
| NF6 | Idempotent webhook processing (no duplicate order creation) |
| NF7 | Admin session tokens with 24-hour expiry |
| NF8 | Cron endpoints protected with bearer token auth |
| NF9 | Download tokens: cryptographically random, time-limited, usage-limited |
| NF10 | IP hashing for analytics (privacy-preserving) |
| NF11 | Turnstile bot protection on public forms |
| NF12 | Rate limiting on download endpoints |
| NF13 | Private book files outside public directory |

### 4.3 SEO

| # | Requirement |
|---|-------------|
| NF14 | Dynamic `robots.txt` with disallow rules for private routes |
| NF15 | XML sitemap covering all public pages, blog posts, and chapters |
| NF16 | Semantic HTML structure with proper heading hierarchy |
| NF17 | Open Graph meta tags for social sharing |

### 4.4 Reliability

| # | Requirement |
|---|-------------|
| NF18 | Graceful degradation when Stripe/Resend/Mailchimp are unavailable |
| NF19 | Email queue with retry logic (failed emails stay in queue) |
| NF20 | SQLite WAL mode for concurrent read/write safety |

---

## 5. Database Schema

### 5.1 Tables

```
customers
├── id (TEXT PRIMARY KEY)
├── email (TEXT UNIQUE)
├── name (TEXT)
├── country (TEXT)
├── created_at (TEXT)
└── updated_at (TEXT)

orders
├── id (TEXT PRIMARY KEY)
├── customer_id (TEXT FK → customers)
├── stripe_payment_intent_id (TEXT UNIQUE)
├── amount_total (INTEGER, cents)
├── amount_tax (INTEGER, cents)
├── currency (TEXT)
├── status (TEXT: pending|succeeded|refunded)
├── coupon (TEXT)
├── utm_source / utm_medium / utm_campaign (TEXT)
├── created_at (TEXT)
└── updated_at (TEXT)

portal_tokens
├── id (TEXT PRIMARY KEY)
├── order_id (TEXT FK → orders)
├── token (TEXT UNIQUE)
└── created_at (TEXT)

download_tokens
├── id (TEXT PRIMARY KEY)
├── order_id (TEXT FK → orders)
├── token (TEXT UNIQUE)
├── format (TEXT: epub|pdf)
├── expires_at (TEXT)
├── max_downloads (INTEGER, default 3)
├── downloads_used (INTEGER, default 0)
├── revoked (INTEGER, default 0)
└── created_at (TEXT)

webhook_events
├── id (TEXT PRIMARY KEY)
├── event_id (TEXT UNIQUE)
├── event_type (TEXT)
├── data (TEXT JSON)
└── created_at (TEXT)

subscribers
├── id (TEXT PRIMARY KEY)
├── email (TEXT UNIQUE)
├── name (TEXT)
├── source (TEXT)
├── tags (TEXT JSON)
├── status (TEXT: active|unsubscribed)
├── created_at (TEXT)
└── updated_at (TEXT)

email_queue
├── id (TEXT PRIMARY KEY)
├── to_email (TEXT)
├── subject (TEXT)
├── html (TEXT)
├── text (TEXT)
├── status (TEXT: pending|sent|failed)
├── sequence_id (TEXT)
├── scheduled_for (TEXT)
├── attempts (INTEGER)
├── created_at (TEXT)
└── sent_at (TEXT)

email_sequences
├── id (TEXT PRIMARY KEY)
├── subscriber_email (TEXT)
├── sequence_name (TEXT)
├── current_step (INTEGER)
├── status (TEXT: active|completed|cancelled)
├── created_at (TEXT)
└── updated_at (TEXT)

broadcasts
├── id (TEXT PRIMARY KEY)
├── name (TEXT)
├── subject (TEXT)
├── content (TEXT)
├── cta_text (TEXT)
├── cta_url (TEXT)
├── segment (TEXT)
├── status (TEXT: draft|queued|sent)
├── scheduled_for (TEXT)
├── sent_count (INTEGER)
├── created_at (TEXT)
└── sent_at (TEXT)

page_views
├── id (INTEGER PRIMARY KEY)
├── path (TEXT)
├── referrer (TEXT)
├── user_agent (TEXT)
├── ip_hash (TEXT)
└── created_at (TEXT)

admin_sessions
├── id (TEXT PRIMARY KEY)
├── token (TEXT UNIQUE)
├── expires_at (TEXT)
└── created_at (TEXT)
```

---

## 6. API Specification

### 6.1 Public Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/subscribe` | Add email subscriber | Turnstile |
| POST | `/api/free-resource` | Request lead magnet delivery | Turnstile |
| POST | `/api/checkout` | Create Stripe payment intent | Turnstile |
| GET | `/api/checkout/config` | Get Stripe publishable key + pricing | None |
| POST | `/api/validate-coupon` | Validate discount code | None |
| POST | `/api/stripe/webhooks` | Stripe webhook receiver | Stripe signature |
| GET | `/api/portal/:token` | Get order data for portal page | Portal token |
| POST | `/api/portal/extend` | Extend download token validity | Portal token |
| POST | `/api/track` | Record page view analytics | None |
| GET | `/api/health` | System health check | None |
| GET | `/download/:token` | Download eBook file | Download token |

### 6.2 Admin Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/admin/login` | Authenticate admin | Username/Password |
| POST | `/api/admin/logout` | Destroy session | Session token |
| GET | `/api/admin/verify` | Validate session | Session token |
| GET | `/api/admin/dashboard/stats` | Dashboard summary | Session/API key |
| GET | `/api/admin/dashboard/orders` | Order list + stats | Session/API key |
| GET | `/api/admin/dashboard/subscribers` | Subscriber list | Session/API key |
| GET | `/api/admin/dashboard/customers` | Customer list | Session/API key |
| GET | `/api/admin/dashboard/analytics` | Revenue/traffic data | Session/API key |
| GET | `/api/admin/orders` | Simple order list | API key |
| GET | `/api/admin/email-stats` | Email queue stats | API key |
| GET | `/api/admin/newsletter/subscribers` | Segmented subscribers | API key |
| POST | `/api/admin/newsletter/broadcast` | Create broadcast | API key |
| POST | `/api/admin/newsletter/send` | Queue broadcast | API key |

### 6.3 Cron Endpoints

| Method | Endpoint | Schedule | Auth |
|--------|----------|----------|------|
| POST | `/api/cron/process-emails` | Every 5 minutes | CRON_SECRET |
| POST | `/api/cron/release-ebook` | Launch day only | CRON_SECRET |

---

## 7. Design System

### 7.1 Brand Identity

| Element | Value |
|---------|-------|
| Primary Color | Teal `#2B9999` |
| Accent Color | Gold `#C9A961` |
| Ink (headings) | `#1a1a1a` |
| Body Text | `#444444` |
| Background | `#ffffff` |
| Cream (sections) | `#f9f7f2` |

### 7.2 Typography

| Usage | Font | Weight |
|-------|------|--------|
| Display / Titles | Cinzel Decorative | 700 |
| Body / Prose | Libre Baskerville | 400, 400i |
| UI / Headings | Montserrat | 400, 500, 600, 700 |

### 7.3 Component Library

- **Navigation:** Sticky header on scroll, mobile hamburger menu
- **Hero Section:** Full-width with 3D animated book cover
- **Buttons:** Primary (teal), Gold (accent), Outline variants
- **Forms:** Email capture with optional Turnstile widget
- **Cards:** Testimonials, chapter previews, blog posts
- **Accordion:** FAQ items with expand/collapse animation
- **Modals:** Exit-intent overlay with lead magnet offer
- **Footer:** Full site navigation, social links, legal pages

---

## 8. Content Inventory

### 8.1 Book Structure (16 Chapters, 4 Parts)

**Part I: Foundations of Creative Excellence**
1. Unveiling Your Creative Odyssey
2. Refining Your Creative Toolkit
3. Reigniting Your Creative Fire
4. The Art of Networking in Freelance Hairstyling

**Part II: Growing Your Craft and Career**
5. Cultivating Creative Excellence Through Mentorship
6. Mastering the Business of Hairstyling
7. Embracing Wellness and Self-Care
8. Advancing Skills Through Continuous Education

**Part III: Leadership and Legacy**
9. Stepping Into Leadership
10. Crafting Enduring Legacies
11. Advanced Digital Strategies for Freelance Hairstylists
12. Financial Wisdom: Building Sustainable Ventures

**Part IV: The Future of the Craft**
13. Embracing Ethics and Sustainability in Hairstyling
14. The Impact of AI on the Beauty Industry
15. Cultivating Resilience and Well-Being in Hairstyling
16. Tresses and Textures: Embracing Diversity in Hairstyling

### 8.2 Blog Posts (Initial)

1. "Pricing Strategy for Freelance Hairstylists"
2. "Networking Secrets for Hairstylists"
3. "Overcoming Creative Burnout"

### 8.3 FAQ Categories (6)

1. Purchase & Download
2. Book Content
3. Pricing & Payment
4. Interactive Features
5. Support
6. About the Author

### 8.4 Lead Magnets

| Resource | Gate | Components |
|----------|------|-----------|
| Pricing Confidence Kit | Email required | Rate calculator, price increase scripts, value articulation guide |
| Sample Chapter | No gate | Chapter 1 excerpt |

---

## 9. Launch Phases

### Phase 1: Pre-Order (Current)

- Accept pre-order payments at $19.99
- Capture leads via Pricing Kit and subscription forms
- Send automated welcome + pre-order confirmation sequences
- Admin dashboard for monitoring
- Release date countdown on portal pages

### Phase 2: Launch Day

- Cron job triggers bulk fulfillment of all pre-orders
- Download tokens created and emails sent to all pre-order customers
- Site switches from "Pre-Order" to "Buy Now" messaging
- Launch day email broadcast to full subscriber list

### Phase 3: Post-Launch (Ongoing)

- Immediate download delivery on purchase
- Ongoing email nurture sequences
- Blog content publishing
- Analytics monitoring and optimization
- Potential paperback link integration (Amazon, B&N, etc.)

---

## 10. Environment Configuration

### Required Variables

```
STRIPE_PUBLISHABLE_KEY    # Stripe frontend key
STRIPE_SECRET_KEY         # Stripe backend key
STRIPE_WEBHOOK_SECRET     # Webhook signature verification
RESEND_API_KEY           # Transactional email service
FROM_EMAIL               # Sender email address
FROM_NAME                # Sender display name
ADMIN_USERNAME           # Admin dashboard login
ADMIN_PASSWORD           # Admin dashboard password
ADMIN_API_KEY            # API key for admin endpoints
CRON_SECRET              # Auth token for cron endpoints
RELEASE_DATE             # ISO 8601 launch date
```

### Optional Variables

```
MAILCHIMP_API_KEY        # Marketing email integration
MAILCHIMP_SERVER_PREFIX  # Mailchimp data center
MAILCHIMP_LIST_ID        # Mailchimp audience ID
TURNSTILE_SITE_KEY       # Cloudflare bot protection (frontend)
TURNSTILE_SECRET_KEY     # Cloudflare bot protection (backend)
GA_MEASUREMENT_ID        # Google Analytics tracking
SITE_URL                 # Production domain (default: http://localhost:3000)
NODE_ENV                 # development | production
```

---

## 11. Deployment

### Railway (Recommended)

```
Build:  curl -fsSL https://bun.sh/install | bash && cd web && bun install
Start:  cd web && bun run server.ts
Port:   3000
Volume: /data (for SQLite persistence)
```

### External Cron Jobs

| Job | Endpoint | Schedule | Service |
|-----|----------|----------|---------|
| Process Email Queue | `POST /api/cron/process-emails` | Every 5 minutes | cron-job.org / EasyCron |
| Release Fulfillment | `POST /api/cron/release-ebook` | Launch day, once | Manual or scheduled |

### DNS / SSL

- Custom domain via Railway or Cloudflare
- SSL auto-provisioned by Railway
- Stripe webhook URL must match production domain

---

## 12. Testing Strategy

### Manual Testing Checklist

- [ ] Homepage renders with all sections
- [ ] Navigation works across all pages
- [ ] Email subscription form submits successfully
- [ ] Free resource download triggers email
- [ ] Checkout flow completes with Stripe test card (4242 4242 4242 4242)
- [ ] Webhook processes payment and creates order
- [ ] Portal page shows order status
- [ ] Download links work for EPUB and PDF
- [ ] Admin login and dashboard load
- [ ] Admin stats reflect actual data
- [ ] Coupon validation works
- [ ] Exit intent modal appears
- [ ] Mobile responsive layout works
- [ ] Sitemap.xml and robots.txt are valid

### Automated Tests

- `bun test` — runs `server.test.ts`
- Database schema creation and query functions
- API endpoint response codes
- Email template rendering

---

## 13. Risk Register

| Risk | Impact | Mitigation |
|------|--------|-----------|
| SQLite concurrency limits | Medium | WAL mode enabled; sufficient for expected traffic (~1K orders) |
| Email deliverability | High | Use Resend (good reputation); verify domain SPF/DKIM/DMARC |
| Stripe webhook failures | High | Idempotent processing; Stripe auto-retries for 72 hours |
| Single-server deployment | Medium | Railway health checks + auto-restart; daily SQLite backups |
| EPUB/PDF piracy | Low | Time-limited + usage-limited tokens; acceptable risk for digital goods |
| Bot abuse on forms | Medium | Turnstile protection; rate limiting on download endpoint |

---

## 14. Success Metrics

| Metric | Target (90 days post-launch) |
|--------|------------------------------|
| eBook Sales | 500+ units |
| Email Subscribers | 2,000+ |
| Conversion Rate (visitor → subscriber) | > 5% |
| Conversion Rate (subscriber → purchase) | > 3% |
| Customer Satisfaction (refund rate) | < 5% |
| Email Open Rate | > 30% |
| Page Load Time (LCP) | < 2.5s |

---

## 15. File Manifest

```
web/
├── server.ts                        # Main server (all routes + API handlers)
├── frontend.tsx                     # React SPA (all pages + components)
├── index.html                       # HTML entry point
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── .env.example                     # Environment template
├── setup-database.ts                # Database initialization script
├── verify-setup.ts                  # Configuration validation
├── quick-start.sh                   # One-command setup script
├── server.test.ts                   # Server tests
├── railway.toml                     # Railway deployment config
├── nixpacks.toml                    # Nixpacks build config
│
├── lib/
│   ├── database.ts                  # SQLite schema + all queries
│   ├── stripe.ts                    # Stripe payment logic
│   ├── email.ts                     # Resend transactional emails
│   ├── email-automation.ts          # Email sequences + queue
│   ├── book-data.ts                 # Book metadata + TOC
│   ├── chapter-content.ts           # 16 chapter previews
│   ├── blog-data.ts                 # Blog post content
│   └── faq-data.ts                  # FAQ questions + categories
│
├── components/
│   ├── AdminDashboard.tsx           # Admin dashboard UI
│   ├── BlogComponents.tsx           # Blog index + post pages
│   ├── FAQComponent.tsx             # FAQ accordion
│   └── SampleChapterBanner.tsx      # Chapter download CTA
│
├── styles/
│   └── main.css                     # Complete design system (1600+ lines)
│
├── public/
│   ├── images/                      # Book cover, author photo
│   ├── downloads/                   # Free PDFs (pricing kit, sample chapter)
│   └── fonts/                       # Cinzel, Montserrat, Libre Baskerville (WOFF2)
│
├── private/                         # Book files (not publicly served)
│   ├── CurlsAndContemplation.epub
│   └── CurlsAndContemplation.pdf
│
├── scripts/
│   ├── screenshots.ts               # Playwright screenshot automation
│   └── seed-test-data.ts            # Test data generation
│
├── docs/
│   ├── ADMIN-DASHBOARD.md           # Admin feature docs
│   └── EMAIL-AUTOMATION.md          # Email system docs
│
├── PRD.md                           # This document
├── README.md                        # Project overview
├── SETUP.md                         # Setup instructions
├── DEPLOYMENT.md                    # Deployment checklist
└── START-HERE.md                    # Beginner-friendly guide
```
