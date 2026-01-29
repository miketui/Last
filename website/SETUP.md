# 🚀 Curls & Contemplation - Quick Setup Guide

This guide will help you get your book website up and running in under 30 minutes.

## ✅ Prerequisites

- [Bun](https://bun.sh/) installed (v1.0+)
- A Stripe account (for payments)
- A Resend account (for transactional emails)
- Optional: Mailchimp account (for marketing emails)
- Optional: Cloudflare Turnstile (for bot protection)

---

## 📦 Step 1: Install Dependencies

```bash
cd website
bun install
```

---

## 🗄️ Step 2: Initialize Database

Run the database setup script to create all required tables:

```bash
bun setup-database.ts
```

This creates a SQLite database at `curls-contemplation.db` with all necessary tables.

---

## 🔑 Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your values:

### Required (Minimum to Run):
```env
SITE_URL=http://localhost:3000
RELEASE_DATE=2026-03-15T16:00:00.000Z
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
FROM_EMAIL=hello@curlsandcontemplation.com
FROM_NAME=Curls & Contemplation
```

### Optional (but Recommended):
```env
MAILCHIMP_API_KEY=...
MAILCHIMP_LIST_ID=...
TURNSTILE_SITE_KEY=0x...
TURNSTILE_SECRET_KEY=0x...
ADMIN_API_KEY=your_secure_admin_key
CRON_SECRET=your_secure_cron_secret
```

---

## 📚 Step 4: Add Book Files

Place your book files in the `private` directory:

```bash
mkdir -p private
# Copy your files:
# private/CurlsAndContemplation.epub
# private/CurlsAndContemplation.pdf
```

Or use the files from the parent directory:
```bash
cp ../CurlsAndContemplationV4.epub ./private/CurlsAndContemplation.epub
# Convert to PDF or use existing PDF
```

---

## 🎁 Step 5: Add Free Resource Files

Create the Pricing Confidence Kit PDF or add it to public/downloads:

```bash
mkdir -p public/downloads
# Add your pricing-confidence-kit.pdf here
# Or use the provided sample
```

**Temporary workaround:** You can use any PDF as a placeholder:
```bash
cp ../CurlsAndContemplation-POD-6x9.pdf ./public/downloads/pricing-confidence-kit.pdf
```

---

## 🎨 Step 6: Update POD Retailer Links (Optional)

Edit `frontend.tsx` and replace placeholder links with real product URLs:

```typescript
const POD_LINKS = {
  US: {
    amazon: 'https://www.amazon.com/dp/YOUR_ASIN',
    barnesNoble: 'https://www.barnesandnoble.com/w/...',
  },
  // ... UK, CA
};
```

---

## 🚀 Step 7: Start Development Server

```bash
bun --hot server.ts
```

Visit: http://localhost:3000

---

## ✅ Step 8: Test Core Flows

### Test Email Capture:
1. Go to http://localhost:3000
2. Scroll to "Get Your Pricing Confidence Kit"
3. Enter an email and submit
4. Check your terminal for email logs

### Test Checkout Flow:
1. Click "Buy eBook"
2. Fill in email and info
3. Use Stripe test card: `4242 4242 4242 4242`
4. Expiry: Any future date
5. CVC: Any 3 digits
6. Check terminal for webhook events

### Test Download Portal:
1. After successful checkout, check database:
   ```bash
   bun -e "import { db } from './lib/database.ts'; console.log(db.prepare('SELECT * FROM portal_tokens').all())"
   ```
2. Visit the portal URL with the token
3. Test download links

---

## 🔧 Stripe Setup

### 1. Create Product and Price:
1. Go to: https://dashboard.stripe.com/test/products
2. Create a new product: "Curls & Contemplation eBook"
3. Set price: $19.99
4. Note: The app uses custom Payment Intents, not Products

### 2. Set Up Webhook:
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `http://localhost:3000/api/stripe/webhooks` (for local testing)
4. Select events:
   - `payment_intent.succeeded`
   - `charge.refunded`
5. Copy webhook signing secret to `.env`

### 3. Test with Stripe CLI (Optional):
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
stripe trigger payment_intent.succeeded
```

---

## 📧 Resend Setup

1. Go to: https://resend.com/domains
2. Add and verify your domain
3. Get API key from: https://resend.com/api-keys
4. Add to `.env`:
   ```env
   RESEND_API_KEY=re_...
   FROM_EMAIL=hello@yourdomain.com
   ```

---

## 📮 Mailchimp Setup (Optional)

1. Create an Audience: https://admin.mailchimp.com/audience/
2. Get API key: https://admin.mailchimp.com/account/api/
3. Find List ID in Audience Settings
4. Add to `.env`:
   ```env
   MAILCHIMP_API_KEY=...
   MAILCHIMP_LIST_ID=...
   ```

---

## 🔒 Cloudflare Turnstile Setup (Optional)

1. Go to: https://dash.cloudflare.com/
2. Create a Turnstile widget
3. Choose "Managed" mode
4. Add your domain
5. Copy Site Key and Secret Key to `.env`

---

## 🌐 Deployment (Vercel Recommended)

### 1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/curls-website.git
git push -u origin main
```

### 2. Deploy to Vercel:
1. Go to: https://vercel.com/new
2. Import your repository
3. Add environment variables from `.env`
4. Deploy!

### 3. Configure Webhooks:
Update Stripe webhook endpoint to production URL:
```
https://yourdomain.com/api/stripe/webhooks
```

### 4. Set Up Cron Jobs:
Vercel automatically runs cron jobs from `vercel.json`:
- Email queue processing: Every 5 minutes
- Release day fulfillment: March 15, 2026 at 4:00 PM UTC

---

## 🧪 Testing Checklist

- [ ] Email subscription works
- [ ] Free resource download works
- [ ] Checkout flow completes
- [ ] Stripe webhook processes payment
- [ ] Download tokens are created
- [ ] Portal page loads with correct data
- [ ] Downloads work (EPUB & PDF)
- [ ] Email automation sends welcome emails
- [ ] Pre-order confirmation emails send
- [ ] Admin API endpoints work (with auth)
- [ ] Mobile responsive design works
- [ ] All pages load correctly

---

## 🆘 Troubleshooting

### Database errors:
```bash
# Reset database
rm curls-contemplation.db
bun setup-database.ts
```

### Email not sending:
- Check Resend dashboard for logs
- Verify FROM_EMAIL is verified in Resend
- Check terminal for error messages

### Stripe webhook not working:
- Check webhook signing secret matches
- Verify endpoint URL is correct
- Use Stripe CLI for local testing

### Downloads not working:
- Verify book files exist in `private/` directory
- Check download token expiration dates
- Verify token is valid in database

---

## 📞 Support

Need help? Check:
- Server logs in terminal
- Browser console for frontend errors
- Database queries: `bun -e "import { db } from './lib/database.ts'; console.log(db.prepare('SELECT * FROM table_name').all())"`

---

## 🎉 You're Ready!

Your author website is now set up and ready to sell books!

Next steps:
1. Customize content in `book-data.ts` and `chapter-content.ts`
2. Add more free resources to the resources page
3. Create email sequences in `email-automation.ts`
4. Set up Google Analytics tracking
5. Launch! 🚀
