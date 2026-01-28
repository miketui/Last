# Email Automation System

This document explains the fully autonomous email system for the Curls & Contemplation website. The system handles all email communications from newsletter signups to purchase confirmations with minimal human intervention.

## Overview

The email automation system handles:
- **Newsletter Welcome Sequence**: Automated welcome and nurture emails for new subscribers
- **Pre-Order Flow**: Confirmation + launch reminder sequence
- **Post-Launch Purchase Flow**: Instant thank you with download links
- **Newsletter Broadcasts**: One-time sends to subscriber segments

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMAIL AUTOMATION FLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  USER ACTION           TRIGGERED EMAILS                         │
│  ───────────           ─────────────────                        │
│                                                                 │
│  Newsletter Signup ──► Welcome Email (immediate)                │
│       │                    │                                    │
│       │                    ├──► Nurture #1 (48 hours)           │
│       │                    ├──► Nurture #2 (96 hours)           │
│       │                    └──► Nurture #3 (168 hours/7 days)   │
│       │                                                         │
│       └──────────────► Added to Mailchimp (tag: lead_freebie)   │
│                                                                 │
│  Pre-Order ──────────► Pre-Order Confirmation (immediate)       │
│       │                    │                                    │
│       │                    ├──► 7-Day Launch Reminder           │
│       │                    ├──► 1-Day Launch Reminder           │
│       │                    └──► Launch Day Email                │
│       │                                                         │
│       └──────────────► Added to Mailchimp (tag: customer_preorder)
│                                                                 │
│  Post-Launch Purchase ► Purchase Thank You + Downloads          │
│       │                                                         │
│       └──────────────► Added to Mailchimp (tag: customer_postlaunch)
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Required Environment Variables

Add these to your `.env` file:

```bash
# Transactional Email (Resend)
RESEND_API_KEY=re_your_resend_api_key_here

# Email Configuration
FROM_EMAIL=hello@curlsandcontemplation.com
FROM_NAME=Curls & Contemplation
SITE_URL=https://curlsandcontemplation.com

# Marketing Email (Mailchimp)
MAILCHIMP_API_KEY=your_mailchimp_api_key-us1
MAILCHIMP_SERVER=us1
MAILCHIMP_LIST_ID=your_audience_list_id

# Admin/Cron Authentication
ADMIN_API_KEY=your_secure_admin_api_key_here
CRON_SECRET=your_secure_cron_secret_here

# Release Date for Pre-Orders
RELEASE_DATE=2026-03-15T16:00:00.000Z
```

## Setting Up Cron Jobs

The email queue needs to be processed regularly. Set up these cron jobs:

### Option 1: Vercel Cron (Recommended for Vercel deployments)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-emails",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/release-ebook",
      "schedule": "0 16 15 3 *"
    }
  ]
}
```

### Option 2: External Cron Service (cron-job.org, EasyCron, etc.)

Set up HTTP POST requests:

1. **Email Queue Processing** (every 5 minutes):
   ```
   POST https://yourdomain.com/api/cron/process-emails
   Header: Authorization: Bearer YOUR_CRON_SECRET
   ```

2. **Launch Day Release** (on release date):
   ```
   POST https://yourdomain.com/api/cron/release-ebook
   Header: Authorization: Bearer YOUR_CRON_SECRET
   ```

### Option 3: Server-Side Cron (if self-hosting)

Add to crontab:

```bash
# Process email queue every 5 minutes
*/5 * * * * curl -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/process-emails

# Check for launch day (daily at 4 PM UTC)
0 16 * * * curl -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/release-ebook
```

## Email Sequences

### 1. Welcome Subscriber Sequence

Triggered when someone:
- Signs up for the newsletter
- Downloads the free lead magnet

**Emails in sequence:**

| Position | Email | Delay | Purpose |
|----------|-------|-------|---------|
| 1 | Welcome Email | Immediate | Thank them, deliver freebie link |
| 2 | Nurture #1 | 48 hours | Value: Pricing mistakes |
| 3 | Nurture #2 | 96 hours | Social proof: Case study |
| 4 | Nurture #3 | 168 hours | Soft sell: Book intro |

### 2. Pre-Order Sequence

Triggered when someone pre-orders before launch date.

**Emails in sequence:**

| Email | Timing | Purpose |
|-------|--------|---------|
| Pre-Order Confirmation | Immediate | Order summary, what to expect |
| 7-Day Reminder | 7 days before launch | Build anticipation |
| 1-Day Reminder | 1 day before launch | Tomorrow's the day! |
| Launch Day | On release date | Download links |

### 3. Post-Launch Purchase

Triggered when someone purchases after launch date.

**Single email with download links sent immediately.**

## API Endpoints

### Public Endpoints

```bash
# Subscribe to newsletter (triggers welcome sequence)
POST /api/subscribe
Content-Type: application/json
{
  "email": "user@example.com",
  "name": "John Doe",
  "source": "website"
}

# Request free resource (triggers welcome sequence + delivers resource)
POST /api/free-resource
Content-Type: application/json
{
  "email": "user@example.com",
  "name": "John Doe",
  "resource": "pricing_kit"
}
```

### Admin Endpoints

All admin endpoints require `Authorization: Bearer YOUR_ADMIN_API_KEY`

```bash
# Get email automation stats
GET /api/admin/email-stats
Response: { queued, sent, failed, broadcasts, activeSequences }

# List subscribers (optionally by segment/tag)
GET /api/admin/newsletter/subscribers
GET /api/admin/newsletter/subscribers?segment=lead_freebie
Response: { count, segment, subscribers: [...] }

# Create a newsletter broadcast
POST /api/admin/newsletter/broadcast
Content-Type: application/json
{
  "name": "March Newsletter",
  "subject": "Exciting Updates!",
  "content": "<p>HTML content here...</p>",
  "ctaText": "Learn More",          // optional
  "ctaUrl": "https://...",          // optional
  "segment": "lead_freebie",        // optional, filters subscribers
  "scheduledFor": "2026-03-01T15:00:00Z"  // optional
}
Response: { message, broadcast }

# Queue a broadcast for sending
POST /api/admin/newsletter/send
Content-Type: application/json
{
  "broadcastId": "abc123..."
}
Response: { message, queuedCount }
```

### Cron Endpoints

All cron endpoints require `Authorization: Bearer YOUR_CRON_SECRET`

```bash
# Process email queue
POST /api/cron/process-emails
Response: { message, sent, failed, stats }

# Release pre-orders on launch day
POST /api/cron/release-ebook
Response: { message, fulfilled, total }
```

## Mailchimp Integration

The system automatically syncs subscribers to Mailchimp with tags for segmentation:

| Tag | Applied When |
|-----|--------------|
| `lead_freebie` | Newsletter signup or lead magnet download |
| `customer_preorder` | Pre-order placed |
| `customer_postlaunch` | Purchase after launch |
| `refunded` | Order refunded |

### Setting Up Mailchimp

1. **Create an API Key:**
   - Go to Mailchimp → Account → API Keys
   - Create a new key

2. **Get your List/Audience ID:**
   - Go to Audience → Settings → Audience name and defaults
   - Copy the Audience ID

3. **Get your Server Prefix:**
   - Look at your Mailchimp URL: `https://us1.admin.mailchimp.com`
   - Your prefix is `us1`

4. **Add to environment:**
   ```bash
   MAILCHIMP_API_KEY=your_api_key-us1
   MAILCHIMP_SERVER=us1
   MAILCHIMP_LIST_ID=your_audience_id
   ```

## Database Tables

The automation system creates these tables automatically:

```sql
-- Email sequences configuration
email_sequences (id, name, description, trigger_type, is_active, created_at)

-- Individual emails within sequences
sequence_emails (id, sequence_id, position, subject, template_key, delay_hours, is_active)

-- Queued emails waiting to be sent
email_queue (id, recipient_email, recipient_name, subject, template_key,
             template_data, scheduled_for, sequence_id, status, attempts, sent_at)

-- Track subscriber progress through sequences
subscriber_sequence_progress (id, subscriber_email, sequence_id,
                              last_email_position, started_at, completed_at, is_active)

-- Newsletter broadcasts
newsletter_broadcasts (id, name, subject, template_key, segment,
                       scheduled_for, status, sent_count, created_at)
```

## Customizing Email Templates

Email templates are defined in `/lib/email-automation.ts`. Each template has:
- Subject line
- HTML version
- Plain text version

To customize, edit the template generator functions:
- `generateWelcomeEmail()` - Welcome email
- `generateNurtureEmail1/2/3()` - Nurture sequence
- `generatePreorderThanksEmail()` - Pre-order confirmation
- `generateLaunchReminderEmail()` - Launch reminders
- `generateLaunchDayEmail()` - Launch day announcement
- `generatePurchaseThanksEmail()` - Post-launch purchase
- `generateNewsletterEmail()` - Newsletter broadcasts

## Testing the System

### Test Welcome Sequence

```bash
# Subscribe a test email
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User", "source": "test"}'

# Check queued emails
curl http://localhost:3000/api/admin/email-stats \
  -H "Authorization: Bearer YOUR_ADMIN_KEY"

# Process queue (send emails)
curl -X POST http://localhost:3000/api/cron/process-emails \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Test Newsletter Broadcast

```bash
# Create broadcast
curl -X POST http://localhost:3000/api/admin/newsletter/broadcast \
  -H "Authorization: Bearer YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Broadcast",
    "subject": "Test Newsletter",
    "content": "<p>Hello! This is a test newsletter.</p>"
  }'

# Queue for sending (note the broadcastId from response)
curl -X POST http://localhost:3000/api/admin/newsletter/send \
  -H "Authorization: Bearer YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"broadcastId": "YOUR_BROADCAST_ID"}'

# Process queue
curl -X POST http://localhost:3000/api/cron/process-emails \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Monitoring

### Check Email Stats

```bash
curl http://localhost:3000/api/admin/email-stats \
  -H "Authorization: Bearer YOUR_ADMIN_KEY"
```

Response:
```json
{
  "queued": 15,
  "sent": 243,
  "failed": 2,
  "broadcasts": 5,
  "activeSequences": 48
}
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

Response includes email automation status.

## Troubleshooting

### Emails Not Sending

1. **Check RESEND_API_KEY is set** - Without it, emails are logged but not sent
2. **Check cron is running** - `/api/cron/process-emails` must run every 5 minutes
3. **Check email stats** - Look for `failed` count in stats

### Duplicate Emails

The system prevents duplicates through:
- Sequence enrollment checks (won't re-enroll active subscribers)
- Email queue deduplication

### Emails Going to Spam

1. Set up SPF/DKIM records for your domain in Resend
2. Use a professional FROM_EMAIL address
3. Avoid spam trigger words in subjects

## Human Review Points

While the system is autonomous, you may want to review:

1. **Before Launch**: Check pre-order count and scheduled reminder emails
2. **Newsletter Content**: Always review broadcast content before queuing
3. **Weekly Stats**: Monitor sent/failed ratios
4. **Monthly**: Review nurture sequence conversion rates

## Security Notes

- All admin endpoints require `ADMIN_API_KEY`
- All cron endpoints require `CRON_SECRET`
- Use different values for these keys
- Rotate keys periodically
- Keep `.env` file out of version control
