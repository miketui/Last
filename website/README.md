# Curls & Contemplation - Author Website

A complete, production-ready eBook sales platform built with **Bun**, **React**, and **TypeScript**. Features include secure payments, email automation, download management, blog, FAQ, and an admin dashboard.

---

## Features

### E-commerce & Payments
- **Stripe Integration** - Secure payment processing with Payment Elements
- **Pre-order & Post-launch Modes** - Automatic fulfillment switching based on `RELEASE_DATE`
- **Coupon System** - Promotional pricing support
- **Order Portal** - Customer dashboard with secure download tokens
- **Refund Handling** - Automatic token revocation on `charge.refunded`
- **Multi-region POD Links** - Amazon, Barnes & Noble, Waterstones, Indigo (update URLs in `frontend.tsx`)

### Email Marketing
- **Resend Integration** - Transactional email delivery
- **Mailchimp Integration** - Optional marketing automation and segmentation
- **Email Sequences** - Welcome, pre-order, purchase, nurture campaigns (4 automated sequences)
- **Lead Magnet** - Free Pricing Confidence Kit with email gate
- **Newsletter Broadcasts** - Admin-controlled email campaigns
- **Email Queue** - Automated processing via cron jobs
- **Token Extension Emails** - Customers notified when download links are extended

### Content Marketing
- **Blog Section** - SEO-optimized articles with 3 starter posts (`/blog`)
- **Sample Chapter Download** - Top-of-funnel lead magnet, no email gate (`/downloads/`)
- **FAQ Section** - 20+ questions with accordion UI (`/faq`)
- **Chapter Previews** - 16 interactive chapter preview pages (`/chapter/:slug`)
- **Resources Page** - Free downloadable worksheets and tools (`/resources`)

### Design & UX
- **3D Book Cover Animation** - Floating, interactive book display with hover tilt
- **Responsive Design** - Mobile-first, works on all devices
- **Custom Typography** - Cinzel Decorative, Montserrat, Libre Baskerville
- **Brand Colors** - Teal (#2B9999) & Gold (#C9A961) theme
- **Accessibility** - WCAG-compliant, semantic HTML, ARIA labels, skip-links

### Security & Performance
- **Security Headers** - X-Content-Type-Options, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy
- **Download Rate Limiting** - 10 requests per 5 minutes per IP on `/download/`
- **Cloudflare Turnstile** - Optional bot protection on forms
- **Download Tokens** - Expiring (7-day), limited-use (3 downloads) secure links
- **Webhook Verification** - Stripe signature validation
- **Admin Credentials** - Required via `.env` (no hardcoded fallbacks)
- **SQLite Database** - Fast, embedded data storage with 13 tables
- **HMR Support** - Hot module replacement for development

### Admin Dashboard
- **Secure Login** - Username/password authentication with 24-hour session tokens
- **Revenue Analytics** - Real-time sales tracking, daily/monthly revenue
- **Order Management** - View all orders, filter by status
- **Subscriber Management** - Email list overview, source tracking
- **Customer Insights** - Top customers, lifetime value
- **Traffic Analytics** - Page views, unique visitors, top pages
- **Email Statistics** - Queue status, sent/failed counts

### Analytics
- **Google Analytics** - Auto-initialized from `GA_MEASUREMENT_ID` env var (no code changes needed)
- **Built-in Page Tracking** - Server-side page view analytics via `/api/track`
- **Event Tracking** - Purchase, signup, download events sent to GA4

---

## Quick Start

### Prerequisites
- [Bun](https://bun.sh/) v1.0+ installed
- Stripe account (test mode works for development)
- Resend account (free tier available)
- Optional: Mailchimp, Cloudflare Turnstile, Google Analytics accounts

### Installation

```bash
cd ~/Last/website

# Run automated setup (installs deps, creates database, sets up files)
./quick-start.sh

# Configure environment variables
cp .env.example .env
nano .env  # Add your API keys

# Verify setup
bun verify-setup.ts

# Start development server
bun --hot server.ts
```

Visit: http://localhost:3000

See [START-HERE.md](./START-HERE.md) for detailed setup instructions.

---

## Project Structure

```
website/
├── server.ts                 # Bun server with routes, API, security headers
├── frontend.tsx              # React SPA with all pages + GA init
├── index.html                # HTML entry point
├── .env                      # Environment variables (create from .env.example)
├── .gitignore                # Excludes db, node_modules, private/, .env
├── curls.db                  # SQLite database (created by setup)
│
├── lib/
│   ├── database.ts           # Database schema & queries (13 tables)
│   ├── stripe.ts             # Stripe payment integration
│   ├── email.ts              # Resend email delivery
│   ├── email-automation.ts   # Email sequences & campaigns
│   ├── book-data.ts          # Book metadata, TOC, resources
│   ├── chapter-content.ts    # Chapter previews & excerpts
│   ├── blog-data.ts          # Blog posts content
│   └── faq-data.ts           # FAQ questions & answers
│
├── components/
│   ├── BlogComponents.tsx    # Blog page & post components
│   ├── FAQComponent.tsx      # FAQ accordion component
│   └── SampleChapterBanner.tsx  # Sample download CTAs
│
├── styles/
│   └── main.css              # Complete design system (~47KB)
│
├── public/
│   ├── images/               # Book cover, author photo
│   ├── downloads/            # Free resources & sample chapter
│   └── fonts/                # Custom web fonts (woff2)
│
├── private/                  # Secure book files (not publicly served)
│   ├── CurlsAndContemplation.epub
│   └── CurlsAndContemplation.pdf
│
├── scripts/
│   ├── seed-test-data.ts     # Seed database with test data
│   └── screenshots.ts        # Playwright screenshot generation
│
└── config/
    ├── railway.json          # Railway deployment config
    └── vercel.json           # Vercel deployment config
```

---

## Database Schema

The SQLite database includes **13 tables**:

| Table | Purpose |
|-------|---------|
| `customers` | Customer name, email, created date |
| `orders` | Purchase records with Stripe payment IDs |
| `portal_tokens` | Secure order portal access tokens |
| `download_tokens` | Time-limited, usage-limited download links |
| `webhook_events` | Idempotency tracking for Stripe webhooks |
| `subscribers` | Email list with source and tag segmentation |
| `admin_sessions` | Admin dashboard session tokens |
| `page_views` | Built-in traffic analytics |
| `email_sequences` | Multi-step email campaign definitions |
| `sequence_emails` | Individual emails within sequences |
| `email_queue` | Scheduled email processing queue |
| `subscriber_sequence_progress` | Tracks subscriber position in sequences |
| `newsletter_broadcasts` | Newsletter campaign records |

**Initialize:**
```bash
bun setup-database.ts
```

---

## API Endpoints

### Public

```
GET  /                        Homepage
GET  /book                    Sales page
GET  /chapters                Chapter index
GET  /chapter/:slug           Chapter preview
GET  /blog                    Blog index
GET  /blog/:slug              Blog post
GET  /faq                     FAQ page
GET  /about                   Author bio
GET  /resources               Free resources
GET  /checkout                Checkout page
GET  /thank-you               Post-purchase
GET  /portal/:token           Order portal
GET  /download/:token         Secure download (rate limited)

POST /api/subscribe           Email subscription
POST /api/free-resource       Lead magnet delivery
POST /api/checkout            Create Stripe payment intent
POST /api/validate-coupon     Coupon validation
POST /api/stripe/webhooks     Stripe webhook handler
POST /api/portal/extend       Extend download token (sends email)
GET  /api/portal/:token       Order portal data
GET  /api/checkout/config     Frontend config + GA ID + Turnstile key
GET  /api/health              Health check
POST /api/track               Page view analytics
```

### Admin (requires session token or ADMIN_API_KEY)

```
POST /api/admin/login                 Login (returns session token)
POST /api/admin/logout                Logout
GET  /api/admin/verify                Verify session

GET  /api/admin/dashboard/stats       Dashboard statistics
GET  /api/admin/dashboard/orders      Orders with filtering
GET  /api/admin/dashboard/subscribers Subscribers with source stats
GET  /api/admin/dashboard/customers   Customers with lifetime value
GET  /api/admin/dashboard/analytics   Revenue/traffic analytics

GET  /api/admin/orders                All orders
POST /api/admin/newsletter/broadcast  Create broadcast
POST /api/admin/newsletter/send       Queue broadcast
GET  /api/admin/newsletter/subscribers Subscriber list
GET  /api/admin/email-stats           Email statistics
```

### Cron (requires CRON_SECRET via Authorization header)

```
POST /api/cron/release-ebook     Launch day fulfillment
POST /api/cron/process-emails    Process email queue
```

---

## Configuration

### Required Environment Variables

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `SITE_URL` | Your production URL | Your domain |
| `RELEASE_DATE` | eBook launch date (ISO 8601) | Your schedule |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key (`pk_test_...` or `pk_live_...`) | [Stripe API Keys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...` or `sk_live_...`) | [Stripe API Keys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...`) | [Stripe Webhooks](https://dashboard.stripe.com/webhooks) |
| `RESEND_API_KEY` | Transactional email key (`re_...`) | [Resend API Keys](https://resend.com/api-keys) |
| `FROM_EMAIL` | Verified sender email | Your verified domain in Resend |
| `FROM_NAME` | Email sender display name | e.g. "Curls & Contemplation" |
| `ADMIN_USERNAME` | Admin dashboard login | Choose a strong username |
| `ADMIN_PASSWORD` | Admin dashboard password | Choose a strong password |
| `ADMIN_API_KEY` | Bearer token for admin API endpoints | Generate: `openssl rand -hex 32` |
| `CRON_SECRET` | Bearer token for cron endpoints | Generate: `openssl rand -hex 32` |

### Optional Environment Variables

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `MAILCHIMP_API_KEY` | Marketing automation | [Mailchimp API Keys](https://mailchimp.com/help/about-api-keys/) |
| `MAILCHIMP_SERVER_PREFIX` | Mailchimp datacenter (e.g. `us1`) | From your API key suffix |
| `MAILCHIMP_LIST_ID` | Audience/list ID | Mailchimp Audience settings |
| `TURNSTILE_SITE_KEY` | Bot protection (frontend) | [Cloudflare Turnstile](https://dash.cloudflare.com/turnstile) |
| `TURNSTILE_SECRET_KEY` | Bot protection (server) | [Cloudflare Turnstile](https://dash.cloudflare.com/turnstile) |
| `GA_MEASUREMENT_ID` | Google Analytics (`G-...`) | [GA4 Admin](https://analytics.google.com/) |
| `NODE_ENV` | `development` or `production` | Set per environment |

See [.env.example](./.env.example) for a copy-paste template.

---

## Webhooks

### Stripe Webhook

| Setting | Value |
|---------|-------|
| **Endpoint URL** | `https://yourdomain.com/api/stripe/webhooks` |
| **Events** | `payment_intent.succeeded`, `charge.refunded` |
| **Secret** | Copy `whsec_...` to `STRIPE_WEBHOOK_SECRET` in `.env` |

**Local testing:**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

### Cron Webhooks

Set these up in an external cron service (e.g. [cron-job.org](https://cron-job.org), EasyCron) if deploying to Railway:

| Job | URL | Schedule | Header |
|-----|-----|----------|--------|
| Process email queue | `POST /api/cron/process-emails` | Every 5 minutes | `Authorization: Bearer {CRON_SECRET}` |
| Release fulfillment | `POST /api/cron/release-ebook` | Launch day | `Authorization: Bearer {CRON_SECRET}` |

For Vercel, cron is configured in `vercel.json` automatically.

---

## Email Automation

### Automated Sequences

1. **Welcome Sequence** (on email signup)
   - Day 0: Welcome + first value email
   - Day 2: Education content
   - Day 5: Social proof + testimonials
   - Day 7: Soft pitch with offer

2. **Pre-order Confirmation** (purchase before launch)
   - Immediate: Order confirmation
   - 7 days before launch: Reminder
   - 3 days before: Get ready
   - Launch day: Download delivery

3. **Purchase Thank You** (purchase after launch)
   - Immediate: Download links + thank you
   - Day 3: How are you enjoying it?
   - Day 14: Request review/testimonial

4. **Token Extension** (when download link is extended)
   - Immediate: Email with new expiry date and portal link

---

## Deployment

### Railway (Recommended)

1. Push to GitHub
2. Create project at [railway.app](https://railway.app) → Deploy from GitHub
3. Set root directory to `website`
4. Add all environment variables from `.env.example`
5. Deploy (auto-detected from `railway.json`)
6. Set up custom domain in Railway settings
7. Create Stripe webhook pointing to your domain
8. Set up external cron service for email processing

### Vercel (Alternative)

1. Import project from GitHub
2. Set root directory to `website`
3. Add environment variables
4. Deploy (cron jobs configured in `vercel.json`)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full pre-launch checklist.

---

## Testing

### Stripe Test Cards
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

Expiry: Any future date | CVC: Any 3 digits | ZIP: Any 5 digits

### Run Tests
```bash
bun test
```

---

## Content Management

### Blog Posts
Edit `lib/blog-data.ts` to add/modify posts. Supports headings (`##`), lists (`-`), and paragraphs.

### FAQ Questions
Edit `lib/faq-data.ts` to add questions. Assign to existing categories.

### Book Content
- **Metadata:** `lib/book-data.ts`
- **Chapter Previews:** `lib/chapter-content.ts`
- **Resources:** `lib/book-data.ts` resources array

### POD Retailer Links
Update `frontend.tsx` `POD_LINKS` object with real ASINs/ISBNs from KDP/IngramSpark once available.

---

## Development Commands

```bash
bun --hot server.ts          # Start with hot reload
bun test                     # Run tests
bun setup-database.ts        # Initialize database
bun verify-setup.ts          # Validate configuration
bun install                  # Install dependencies
bun scripts/seed-test-data.ts  # Seed test data
```

---

## Security

- Security headers on all responses (X-Frame-Options, HSTS, etc.)
- Download rate limiting (10 req / 5 min per IP)
- Stripe webhook signature verification
- Download tokens expire after 7 days, max 3 uses
- Admin credentials required via `.env` (disabled if not set)
- Admin sessions expire after 24 hours
- Cron endpoints require bearer token
- Bot protection via Cloudflare Turnstile (optional)
- `.gitignore` excludes database, `.env`, `private/`, `node_modules/`

---

## Launch Checklist

### Content (you provide)
- [ ] Replace `private/CurlsAndContemplation.epub` with real eBook
- [ ] Replace `private/CurlsAndContemplation.pdf` with real eBook
- [ ] Replace `public/downloads/sample-chapter-*.pdf` with real sample chapter
- [ ] Update POD links in `frontend.tsx` with real ASINs/ISBNs

### Configuration (API keys & secrets)
- [ ] Create `.env` from `.env.example`
- [ ] Set `SITE_URL` to production domain
- [ ] Set `RELEASE_DATE` to launch date
- [ ] Add Stripe keys (`STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`)
- [ ] Add Stripe webhook secret (`STRIPE_WEBHOOK_SECRET`)
- [ ] Add Resend key (`RESEND_API_KEY`) and verify sender domain
- [ ] Set `FROM_EMAIL` and `FROM_NAME`
- [ ] Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` (strong values)
- [ ] Generate and set `ADMIN_API_KEY` and `CRON_SECRET`
- [ ] Optional: Set `GA_MEASUREMENT_ID`, `TURNSTILE_*`, `MAILCHIMP_*`

### Infrastructure
- [ ] Deploy to Railway or Vercel
- [ ] Create Stripe webhook endpoint
- [ ] Set up cron jobs for email queue processing
- [ ] Configure custom domain + SSL
- [ ] Run `bun verify-setup.ts` on production

### Validation
- [ ] Test complete purchase flow with test card
- [ ] Test email sequences end-to-end
- [ ] Test download portal and file downloads
- [ ] Test admin dashboard at `/admin`
- [ ] Test sample chapter download
- [ ] Monitor first real transactions

---

## Documentation

- **[START-HERE.md](./START-HERE.md)** - Beginner-friendly setup guide
- **[SETUP.md](./SETUP.md)** - Detailed configuration
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Pre-launch checklist
- **[.env.example](./.env.example)** - Environment variable reference

---

(c) 2026 Michael David Warren. All rights reserved.

Built with Bun, React, and TypeScript.
