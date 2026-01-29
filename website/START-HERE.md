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
5. **Deploy to Vercel** - Follow deployment guide

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

## 📚 Appendix C: File Locations Reference

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
