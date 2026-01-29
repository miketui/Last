# 🎯 START HERE - Complete Step-by-Step Setup Guide

**Time Required:** 15-20 minutes
**Difficulty:** Beginner-friendly

Follow these steps **in order** to get your book website running.

---

## ✅ Step 1: Open Terminal and Navigate to Project

```bash
cd ~/Last/website
```

**Expected Output:** You should be in the website directory.

**Verify:**
```bash
pwd
# Should show: /home/warrenm115/Last/website
```

---

## ✅ Step 2: Run Automated Setup Script

This script will:
- Install dependencies
- Create database
- Set up directories
- Copy book files

```bash
./quick-start.sh
```

**Expected Output:**
```
✅ Bun is installed
✅ Dependencies installed
✅ Database initialized
✅ Directories created
✅ EPUB file found
✅ PDF file found
```

**What if you see errors?**
- If "permission denied": Run `chmod +x quick-start.sh` then try again
- If "Bun not installed": Install Bun first (see Appendix A below)

---

## ✅ Step 3: Create Your Environment File

```bash
cp .env.example .env
```

**Expected Output:** File `.env` is created (no output means success)

**Verify:**
```bash
ls -la .env
# Should show: -rw-r--r-- 1 user user ... .env
```

---

## ✅ Step 4: Get Stripe API Keys (5 minutes)

### 4.1 Go to Stripe Dashboard
1. Open browser: https://dashboard.stripe.com/register
2. Create account (or login if you have one)
3. Click "Developers" in top menu
4. Click "API keys" in left sidebar

### 4.2 Copy Your Keys
You'll see two keys:

**Publishable key** (starts with `pk_test_`):
```
pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz...
```

**Secret key** (starts with `sk_test_`):
```
sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz...
```

⚠️ **IMPORTANT:** Use TEST keys (with `_test_`) for now, not LIVE keys!

### 4.3 Create Webhook

1. Still in Stripe dashboard, click "Webhooks" in left sidebar
2. Click "+ Add endpoint"
3. **Endpoint URL:** Enter `http://localhost:3000/api/stripe/webhooks`
4. Click "Select events"
5. Search and check these two events:
   - ✅ `payment_intent.succeeded`
   - ✅ `charge.refunded`
6. Click "Add events"
7. Click "Add endpoint"
8. Copy the **Signing secret** (starts with `whsec_`)

**You should now have 3 values:**
- Publishable key: `pk_test_...`
- Secret key: `sk_test_...`
- Webhook secret: `whsec_...`

---

## ✅ Step 5: Get Resend API Key (3 minutes)

### 5.1 Sign Up for Resend
1. Open browser: https://resend.com/signup
2. Create account (free tier is perfect)
3. Verify your email

### 5.2 Get API Key
1. Go to: https://resend.com/api-keys
2. Click "Create API Key"
3. Name it: "Curls Website"
4. Click "Add"
5. **Copy the key** (starts with `re_`)

**Example:**
```
re_123abc456def789ghi...
```

⚠️ **Copy it now!** You can only see it once.

---

## ✅ Step 6: Edit Your .env File

Now we'll add all the keys you collected.

### 6.1 Open .env File

**Option A - Using nano (recommended for beginners):**
```bash
nano .env
```

**Option B - Using vi:**
```bash
vi .env
```

**Option C - Using VS Code:**
```bash
code .env
```

### 6.2 Find and Replace These Lines

The file has placeholders. You'll replace them with your actual keys.

**FIND THIS LINE:**
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

**REPLACE WITH YOUR KEY:**
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz...
```

---

**FIND THIS LINE:**
```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

**REPLACE WITH YOUR KEY:**
```bash
STRIPE_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz...
```

---

**FIND THIS LINE:**
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**REPLACE WITH YOUR KEY:**
```bash
STRIPE_WEBHOOK_SECRET=whsec_abc123def456...
```

---

**FIND THIS LINE:**
```bash
RESEND_API_KEY=re_your_resend_api_key_here
```

**REPLACE WITH YOUR KEY:**
```bash
RESEND_API_KEY=re_123abc456def789ghi...
```

---

**FIND THIS LINE:**
```bash
FROM_EMAIL=hello@curlsandcontemplation.com
```

**REPLACE WITH YOUR EMAIL (for now use any email):**
```bash
FROM_EMAIL=michael@curlsandcontemplation.com
```

⚠️ **Note:** For production, this email must be verified in Resend. For testing, any email works.

---

**OPTIONALLY UPDATE RELEASE DATE:**
```bash
RELEASE_DATE=2026-03-15T16:00:00.000Z
```

Change to your actual book launch date if you know it.

---

### 6.3 Save the File

**If using nano:**
1. Press `Ctrl + X`
2. Press `Y` (yes to save)
3. Press `Enter` (confirm filename)

**If using vi:**
1. Press `Esc`
2. Type `:wq`
3. Press `Enter`

**If using VS Code:**
1. Press `Ctrl + S` (or `Cmd + S` on Mac)
2. Close the editor

---

## ✅ Step 7: Verify Your Setup

Run the verification script to check everything is configured correctly:

```bash
bun verify-setup.ts
```

**Expected Output:**
```
✅ 10+ items: Configured
⚠️ 5 items: Optional - not configured
❌ 0 items: (should be zero!)

✅ Your setup is functional but has some optional features not configured.
```

**If you see ❌ Critical issues:**
- Check that you saved the .env file correctly
- Make sure you copied the complete API keys (they're long!)
- Verify there are no extra spaces or quotes around the keys

---

## ✅ Step 8: Start Your Website!

```bash
bun --hot server.ts
```

**Expected Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Curls & Contemplation - eBook Sales Platform
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Server running at: http://localhost:3000
Launch State: PRE-ORDER
Release Date: 2026-03-15T16:00:00.000Z

Email Automation:
  Queued: 0 | Sent: 0 | Active Sequences: 0

Pages:
  /              Homepage
  /book          Sales Page
  /chapters      Chapter Index
  ...
```

**🎉 SUCCESS!** Your website is now running!

---

## ✅ Step 9: Test Your Website

### 9.1 Open in Browser

Open your browser and go to:
```
http://localhost:3000
```

**You should see:**
- Beautiful homepage with book cover
- "Curls & Contemplation" title
- "Buy eBook" button
- "Get Free Pricing Kit" section

---

### 9.2 Test Email Capture (2 minutes)

1. Scroll down to "Get Your Pricing Confidence Kit"
2. Enter your email: `test@example.com`
3. Enter name: `Test User`
4. Click "Send Me the Free Kit"

**Expected Result:**
- ✅ Success message appears
- ✅ In terminal, you'll see: `[Subscribe] New subscriber: test@example.com`
- ✅ Email queued (check terminal logs)

---

### 9.3 Test Checkout Flow (3 minutes)

1. Click "Buy eBook" button
2. Fill in:
   - **Name:** Test Buyer
   - **Email:** buyer@example.com
3. Leave coupon blank
4. Click "Continue to Payment"

5. Use Stripe test card:
   - **Card Number:** `4242 4242 4242 4242`
   - **Expiry:** `12/34` (any future date)
   - **CVC:** `123` (any 3 digits)
   - **ZIP:** `12345` (any 5 digits)

6. Click "Pay $19.99"

**Expected Result:**
- ✅ Payment processes successfully
- ✅ Redirects to "Thank You" page
- ✅ In terminal, you'll see: `[Webhook] Processing: payment_intent.succeeded`
- ✅ Order created in database

---

### 9.4 Test Download Access (2 minutes)

1. In terminal, check for portal token:
```bash
bun -e "import { db } from './lib/database.ts'; const tokens = db.prepare('SELECT * FROM portal_tokens').all(); console.log(tokens);"
```

2. You'll see output like:
```json
[
  {
    id: "abc123",
    order_id: "order_xyz",
    token: "tok_abc123def456",
    created_at: "2025-01-28T..."
  }
]
```

3. Copy the token value (e.g., `tok_abc123def456`)

4. Visit in browser:
```
http://localhost:3000/portal/tok_abc123def456
```
(Replace with your actual token)

**Expected Result:**
- ✅ Portal page loads
- ✅ Shows "Your Order Portal"
- ✅ If before release date: Shows "Pre-Order Confirmed"
- ✅ If after release date: Shows download links for EPUB and PDF

---

## ✅ Step 10: Check Database

Verify everything was saved correctly:

```bash
# Check customers
bun -e "import { db } from './lib/database.ts'; console.log('Customers:', db.prepare('SELECT * FROM customers').all())"

# Check orders
bun -e "import { db } from './lib/database.ts'; console.log('Orders:', db.prepare('SELECT * FROM orders').all())"

# Check subscribers
bun -e "import { db } from './lib/database.ts'; console.log('Subscribers:', db.prepare('SELECT * FROM subscribers').all())"
```

**You should see:**
- 1 customer (from test purchase)
- 1 order (from test purchase)
- 1 subscriber (from email capture)

---

## 🎉 Congratulations! Setup Complete!

Your website is fully functional and ready for development/testing!

---

## 📋 What Works Right Now

✅ **Homepage** - Full sales page with all sections
✅ **Book Page** - Detailed sales copy
✅ **Chapters** - All 16 chapter previews
✅ **About Page** - Author bio and credentials
✅ **Resources** - Free downloads page
✅ **Checkout** - Complete payment flow
✅ **Email Capture** - Lead magnet system
✅ **Downloads** - Secure file delivery
✅ **Order Portal** - Customer dashboard
✅ **Database** - All tables and data storage
✅ **Email Queue** - Automated email system

---

## 🔜 What to Do Next

### For Testing/Development:
1. **Browse the website** - Click through all pages
2. **Test mobile view** - Resize browser window
3. **Try different test cards** - See Stripe docs for more test cards
4. **Check email logs** - See what emails would be sent

### To Customize:
1. **Edit content** - Modify `book-data.ts` and `chapter-content.ts`
2. **Change colors** - Edit `styles/main.css` design system
3. **Update POD links** - Edit `frontend.tsx` retailer links
4. **Add more resources** - Create PDFs and add to resources

### For Production Launch:
1. **See DEPLOYMENT.md** - Complete pre-launch checklist
2. **Get real domain** - Purchase and configure DNS
3. **Switch to live Stripe keys** - Use production API keys
4. **Verify email domain** - Set up Resend with custom domain
5. **Deploy to Railway** - See Railway Deployment Guide below (recommended!)
6. **OR Deploy to Vercel** - Alternative deployment option

---

## 🚂 Railway Deployment Guide (10 Minutes)

Railway is perfect for deploying your book website! It's simple, affordable, and handles everything automatically.

### Why Railway?
- ✅ **Easy Setup** - Connect GitHub, click deploy
- ✅ **Automatic Deploys** - Push to GitHub = auto-deploy
- ✅ **Built-in Database** - SQLite works perfectly
- ✅ **Fair Pricing** - $5/month for hobby projects
- ✅ **Custom Domains** - Easy domain setup
- ✅ **Bun Support** - Native Bun runtime support

---

### Step 1: Prepare Your Repository (2 minutes)

Make sure all your changes are pushed to GitHub:

```bash
cd ~/Last/website
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

---

### Step 2: Sign Up for Railway (1 minute)

1. Go to: https://railway.app/
2. Click "Login" (top right)
3. Click "Login with GitHub"
4. Authorize Railway to access your GitHub

---

### Step 3: Create New Project (2 minutes)

1. Click "**New Project**" (big purple button)
2. Click "**Deploy from GitHub repo**"
3. Find and select: **miketui/Last**
4. Railway will detect it's a monorepo
5. Click "**Add variables**" (we'll do this in next step)

---

### Step 4: Configure Root Directory (Important!)

Since your website is in a subfolder, you need to tell Railway:

1. In your project dashboard, click on your service
2. Click "**Settings**" tab
3. Scroll to "**Root Directory**"
4. Enter: `website`
5. Click "**Update**"

---

### Step 5: Add Environment Variables (5 minutes)

1. Click "**Variables**" tab in your Railway project
2. Click "**+ New Variable**"
3. Add each variable one by one:

**Required Variables:**

```bash
SITE_URL
# Value: Will be provided by Railway (wait for deployment)
# For now use: https://your-project.up.railway.app

NODE_ENV=production

RELEASE_DATE=2026-03-15T16:00:00.000Z

STRIPE_PUBLISHABLE_KEY=pk_live_...
# ⚠️ Use LIVE keys for production! (pk_live_ not pk_test_)

STRIPE_SECRET_KEY=sk_live_...
# ⚠️ Use LIVE keys for production! (sk_live_ not sk_test_)

STRIPE_WEBHOOK_SECRET=whsec_...
# Get this after creating webhook (see Step 7)

RESEND_API_KEY=re_...

FROM_EMAIL=hello@curlsandcontemplation.com

FROM_NAME=Curls & Contemplation

ADMIN_API_KEY=
# Generate a secure random key:
# In terminal: openssl rand -base64 32

CRON_SECRET=
# Generate a secure random key:
# In terminal: openssl rand -base64 32
```

**Optional Variables:**

```bash
MAILCHIMP_API_KEY=...
MAILCHIMP_SERVER_PREFIX=us1
MAILCHIMP_LIST_ID=...

TURNSTILE_SITE_KEY=0x...
TURNSTILE_SECRET_KEY=0x...

GA_MEASUREMENT_ID=G-...
```

**How to add each variable:**
1. Click "+ New Variable"
2. Enter variable name (e.g., `STRIPE_SECRET_KEY`)
3. Enter value (e.g., `sk_live_abc123...`)
4. Press Enter or click outside
5. Repeat for all variables

---

### Step 6: Generate Secure Keys (1 minute)

In your terminal, generate secure keys for admin and cron:

```bash
# Generate ADMIN_API_KEY
openssl rand -base64 32

# Generate CRON_SECRET
openssl rand -base64 32
```

Copy these values and add them to Railway variables.

---

### Step 7: Deploy! (2 minutes)

1. Click "**Deploy**" button (if not already deploying)
2. Railway will automatically:
   - Install Bun
   - Install dependencies
   - Build your project
   - Start the server
3. Wait for "**Success**" status (usually 1-2 minutes)

**Your website is now LIVE!** 🎉

---

### Step 8: Get Your Railway URL

1. Go to "**Settings**" tab
2. Scroll to "**Domains**"
3. You'll see a URL like: `your-project.up.railway.app`
4. Click to copy it

**Update your SITE_URL:**
1. Go back to "**Variables**" tab
2. Find `SITE_URL`
3. Update value to: `https://your-project.up.railway.app`
4. Railway will automatically redeploy

---

### Step 9: Update Stripe Webhook (Important!)

Your webhook endpoint has changed! Update it in Stripe:

1. Go to: https://dashboard.stripe.com/webhooks
2. Click on your webhook (or create new one)
3. Update endpoint URL to:
   ```
   https://your-project.up.railway.app/api/stripe/webhooks
   ```
   (Replace with your actual Railway URL)
4. Make sure these events are selected:
   - `payment_intent.succeeded`
   - `charge.refunded`
5. Copy the **Signing secret**
6. Add to Railway variables as `STRIPE_WEBHOOK_SECRET`

---

### Step 10: Set Up Custom Domain (Optional, 5 minutes)

1. In Railway, go to "**Settings**" → "**Domains**"
2. Click "**+ Custom Domain**"
3. Enter your domain: `curlsandcontemplation.com`
4. Railway gives you DNS records to add:

**Add these to your domain registrar:**
```
Type: CNAME
Name: @  (or leave blank)
Value: [railway-provided-value].railway.app
```

```
Type: CNAME
Name: www
Value: [railway-provided-value].railway.app
```

5. Wait 5-10 minutes for DNS propagation
6. Update `SITE_URL` in Railway to your custom domain
7. Update Stripe webhook URL to custom domain

---

### Step 11: Set Up Cron Jobs (Optional but Recommended)

Railway doesn't have built-in cron, but you can use external services:

**Option A: Cron-Job.org (Free)**

1. Sign up: https://cron-job.org/
2. Create new cron job:
   - **Title:** Process Email Queue
   - **URL:** `https://your-project.up.railway.app/api/cron/process-emails`
   - **Schedule:** Every 5 minutes
   - **Request Method:** POST
   - **Headers:** Add `Authorization: Bearer YOUR_CRON_SECRET`

3. Create second cron job:
   - **Title:** Release Day Fulfillment
   - **URL:** `https://your-project.up.railway.app/api/cron/release-ebook`
   - **Schedule:** Set to your release date/time
   - **Request Method:** POST
   - **Headers:** Add `Authorization: Bearer YOUR_CRON_SECRET`

**Option B: EasyCron (Free tier)**

1. Sign up: https://www.easycron.com/
2. Create similar cron jobs as above

**Option C: GitHub Actions (Free)**

Add `.github/workflows/cron.yml` to your repo:

```yaml
name: Cron Jobs
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes

jobs:
  process-emails:
    runs-on: ubuntu-latest
    steps:
      - name: Process Email Queue
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-project.up.railway.app/api/cron/process-emails
```

---

### Step 12: Monitor Your Deployment

**Check Logs:**
1. In Railway dashboard, click "**View Logs**"
2. You'll see real-time server output
3. Look for any errors

**Check Build:**
1. Click "**Deployments**" tab
2. See all your deployments
3. Click any deployment to see build logs

**Check Database:**
Your SQLite database persists in Railway's volume storage automatically!

---

### Railway Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] Railway account created
- [ ] Project created from GitHub repo
- [ ] Root directory set to `website`
- [ ] All environment variables added
- [ ] Secure keys generated for ADMIN_API_KEY and CRON_SECRET
- [ ] Deployment successful
- [ ] SITE_URL updated with Railway URL
- [ ] Stripe webhook updated with Railway URL
- [ ] Webhook secret added to Railway variables
- [ ] Custom domain configured (optional)
- [ ] Cron jobs set up (optional but recommended)
- [ ] Website tested in production

---

### Testing Your Railway Deployment

1. **Visit your site:** `https://your-project.up.railway.app`
2. **Test checkout:** Use Stripe LIVE mode (real card, then refund)
3. **Test email capture:** Should send real emails via Resend
4. **Check logs:** Monitor in Railway dashboard for any errors

---

### Railway Tips & Tricks

**Automatic Deploys:**
- Push to GitHub → Railway auto-deploys
- No manual deployment needed!

**Monitoring:**
- Railway shows resource usage
- Set up alerts for high usage
- Monitor costs in billing section

**Database Backups:**
```bash
# Download your database
railway run sqlite3 curls-contemplation.db .dump > backup.sql
```

**Environment Variables:**
- Update anytime in Railway dashboard
- Railway auto-restarts with new values

**Rollback:**
- Go to "Deployments" tab
- Click "..." on previous deployment
- Click "Redeploy"

---

### Railway vs Vercel Comparison

| Feature | Railway | Vercel |
|---------|---------|--------|
| **Bun Support** | ✅ Native | ✅ Native |
| **SQLite** | ✅ Works great | ⚠️ Requires Turso |
| **Pricing** | $5/month | $20/month Pro |
| **Setup** | Simple | More complex |
| **Cron Jobs** | External service | Built-in |
| **WebSockets** | ✅ Supported | ❌ Serverless |
| **Best For** | Full apps | Static/serverless |

**Recommendation:** Use Railway! It's simpler and cheaper for this project.

---

### Railway Cost Estimate

**Hobby Plan:** $5/month includes:
- ✅ 512MB RAM
- ✅ 1GB disk
- ✅ Unlimited deploys
- ✅ Custom domains

**Your website will use:**
- ~100MB RAM
- ~200MB disk
- Well within free tier limits!

**Expected cost:** $5/month (fixed)

---

## 🆘 Troubleshooting

### Server won't start
**Error:** `Cannot find module './lib/database'`
- **Fix:** Make sure you ran `bun install` first

**Error:** `Database locked`
- **Fix:** Stop all other instances of the server, then try again

### Stripe payment fails
**Error:** `No such payment_intent`
- **Fix:** Check that STRIPE_SECRET_KEY is correct (should start with `sk_test_`)

**Error:** `Invalid API Key`
- **Fix:** Make sure you copied the complete key, no spaces or quotes

### Email not sending
**Error:** `Unauthorized`
- **Fix:** Verify RESEND_API_KEY is correct (should start with `re_`)

**Error:** `Domain not verified`
- **Fix:** For testing, this is OK. For production, verify domain in Resend

### Webhook not working
**Error:** `No signature found`
- **Fix:** Check STRIPE_WEBHOOK_SECRET is set correctly

**Webhook not firing:**
- **Fix:** Use Stripe CLI for local testing:
  ```bash
  stripe listen --forward-to localhost:3000/api/stripe/webhooks
  ```

### Port already in use
**Error:** `Address already in use`
- **Fix:**
  ```bash
  # Find process using port 3000
  lsof -i :3000
  # Kill it
  kill -9 [PID]
  # Or use different port
  PORT=3001 bun --hot server.ts
  ```

### Railway-Specific Issues

**Deployment fails:**
- Check "View Logs" in Railway for error details
- Verify `Root Directory` is set to `website`
- Make sure all environment variables are set

**Database errors on Railway:**
- Railway automatically persists SQLite in volume storage
- Database resets? Check if volume is attached in Settings → Volumes

**Webhooks not working:**
- Verify webhook URL uses Railway domain
- Check STRIPE_WEBHOOK_SECRET is correct
- Test webhook: `railway run curl https://your-site.railway.app/api/health`

**Site not updating:**
- Push changes to GitHub
- Railway should auto-deploy (check Deployments tab)
- Force redeploy: Deployments → "..." → Redeploy

**Environment variables not working:**
- Changes take effect after restart
- Railway auto-restarts when variables change
- Check spelling of variable names

---

## 📞 Need More Help?

1. **Check logs in terminal** - Errors are usually shown there
2. **Read SETUP.md** - More detailed setup information
3. **Read DEPLOYMENT.md** - Production deployment guide
4. **Check database** - Use the bun commands above to inspect data

---

## 📚 Appendix A: Installing Bun

If you don't have Bun installed:

```bash
curl -fsSL https://bun.sh/install | bash
```

Then restart your terminal and try again.

**Verify installation:**
```bash
bun --version
# Should show: 1.0.0 or higher
```

---

## 📚 Appendix B: Stripe Test Cards

Use these for testing different scenarios:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`
- **Insufficient funds:** `4000 0000 0000 9995`

All test cards:
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any valid ZIP code

---

## 📚 Appendix C: Railway CLI (Optional)

For advanced users who want to use Railway CLI:

### Install Railway CLI
```bash
npm install -g @railway/cli
```

### Login to Railway
```bash
railway login
```

### Link Your Project
```bash
cd ~/Last/website
railway link
```

### Useful Commands
```bash
# View logs
railway logs

# Run commands in Railway environment
railway run bun verify-setup.ts

# Open project in browser
railway open

# Add environment variable
railway variables set KEY=VALUE

# Check status
railway status
```

---

## 📚 Appendix D: File Locations Reference

```
website/
├── .env                    ← Your API keys (created in Step 3)
├── curls-contemplation.db  ← Database (created in Step 2)
├── server.ts               ← Backend server
├── frontend.tsx            ← React frontend
├── index.html              ← HTML template
├── lib/
│   ├── database.ts         ← Database functions
│   ├── stripe.ts           ← Stripe integration
│   ├── email.ts            ← Email sending
│   └── email-automation.ts ← Email sequences
├── public/
│   ├── images/             ← Cover, author photo
│   ├── downloads/          ← Free resources
│   └── fonts/              ← Custom fonts
└── private/                ← Book files (EPUB, PDF)
```

---

## ✅ Checklist Summary

Print this and check off as you complete each step:

- [ ] Step 1: Navigate to project directory
- [ ] Step 2: Run quick-start.sh
- [ ] Step 3: Create .env file
- [ ] Step 4: Get Stripe API keys (3 keys)
- [ ] Step 5: Get Resend API key
- [ ] Step 6: Edit .env with all keys
- [ ] Step 7: Run verify-setup.ts
- [ ] Step 8: Start server with bun
- [ ] Step 9: Test website in browser
  - [ ] Test email capture
  - [ ] Test checkout
  - [ ] Test download portal
- [ ] Step 10: Verify database has data

**Total Time:** 15-20 minutes

---

🎉 **You're all set!** Happy selling! 📚
