# 🚀 Deployment Checklist

Use this checklist to ensure your website is production-ready before launch.

## Pre-Deployment Checklist

### ✅ 1. Environment Configuration

- [ ] Copy `.env.example` to `.env` on production server
- [ ] Set `SITE_URL` to production domain (e.g., `https://curlsandcontemplation.com`)
- [ ] Set `NODE_ENV=production`
- [ ] Configure all required API keys:
  - [ ] `STRIPE_SECRET_KEY` (use live key, not test)
  - [ ] `STRIPE_PUBLISHABLE_KEY` (use live key, not test)
  - [ ] `STRIPE_WEBHOOK_SECRET` (from production webhook)
  - [ ] `RESEND_API_KEY`
  - [ ] `FROM_EMAIL` (verified domain)
  - [ ] `MAILCHIMP_API_KEY` (optional)
  - [ ] `MAILCHIMP_LIST_ID` (optional)
  - [ ] `ADMIN_API_KEY` (generate strong random key)
  - [ ] `CRON_SECRET` (generate strong random key)
- [ ] Set `RELEASE_DATE` to your actual launch date (ISO 8601 format)

### ✅ 2. Content & Assets

- [ ] Book files uploaded to `private/` directory:
  - [ ] `CurlsAndContemplation.epub`
  - [ ] `CurlsAndContemplation.pdf`
- [ ] Free resource PDF created:
  - [ ] `public/downloads/pricing-confidence-kit.pdf`
- [ ] Author photo present: `public/images/Michael.jpeg`
- [ ] Book cover present: `public/images/cover.png`
- [ ] Custom fonts loaded: `public/fonts/`

### ✅ 3. Database

- [ ] Run `bun setup-database.ts` on production
- [ ] Verify database file permissions
- [ ] Set up database backups (daily recommended)

### ✅ 4. Stripe Configuration

- [ ] Switch to live mode in Stripe dashboard
- [ ] Create production webhook endpoint:
  - URL: `https://yourdomain.com/api/stripe/webhooks`
  - Events: `payment_intent.succeeded`, `charge.refunded`
- [ ] Update `STRIPE_WEBHOOK_SECRET` with production secret
- [ ] Test checkout with real card (then refund)
- [ ] Configure Stripe tax settings (if applicable)
- [ ] Set up Stripe dispute notifications

### ✅ 5. Email Configuration

- [ ] Verify domain in Resend
- [ ] Test transactional emails:
  - [ ] Welcome email
  - [ ] Pre-order confirmation
  - [ ] Purchase thank you
  - [ ] eBook delivery
- [ ] Set up Mailchimp audience (if using)
- [ ] Create email templates with branding
- [ ] Set up email automation sequences

### ✅ 6. Security

- [ ] Enable HTTPS/SSL certificate
- [ ] Set up Cloudflare Turnstile for bot protection
- [ ] Configure rate limiting on API endpoints
- [ ] Secure admin endpoints with strong `ADMIN_API_KEY`
- [ ] Review and test webhook signature verification
- [ ] Enable CORS if needed
- [ ] Set up security headers (CSP, X-Frame-Options, etc.)

### ✅ 7. Cron Jobs (Vercel)

- [ ] Verify `vercel.json` cron configuration
- [ ] Test email queue processing:
  ```
  POST /api/cron/process-emails
  Authorization: Bearer CRON_SECRET
  ```
- [ ] Test release day fulfillment:
  ```
  POST /api/cron/release-ebook
  Authorization: Bearer CRON_SECRET
  ```
- [ ] Set up monitoring for cron job failures

### ✅ 8. Analytics & Tracking

- [ ] Set up Google Analytics 4
- [ ] Add `GA_MEASUREMENT_ID` to `.env`
- [ ] Configure conversion tracking for purchases
- [ ] Set up Facebook Pixel (optional)
- [ ] Configure UTM tracking for campaigns

### ✅ 9. SEO & Metadata

- [ ] Update page titles and descriptions
- [ ] Verify Open Graph tags for social sharing
- [ ] Submit sitemap to Google Search Console: `/sitemap.xml`
- [ ] Verify robots.txt allows indexing: `/robots.txt`
- [ ] Set up Google Search Console property
- [ ] Add structured data (schema.org) for book
- [ ] Test social sharing preview on Twitter/Facebook

### ✅ 10. Domain & DNS

- [ ] Purchase domain name
- [ ] Configure DNS records for Vercel:
  - A record: `76.76.21.21`
  - CNAME record: `cname.vercel-dns.com`
- [ ] Add domain to Vercel project
- [ ] Verify domain email for Resend
- [ ] Set up www redirect (optional)

### ✅ 11. POD Retailer Links

- [ ] Get ISBN for paperback version
- [ ] Get Amazon ASIN for each region (US, UK, CA)
- [ ] Update POD links in `frontend.tsx`:
  ```typescript
  const POD_LINKS = {
    US: {
      amazon: 'https://www.amazon.com/dp/YOUR_ASIN',
      barnesNoble: 'https://www.barnesandnoble.com/w/...',
    },
    UK: { ... },
    CA: { ... },
  };
  ```
- [ ] Test each retailer link

### ✅ 12. Testing

- [ ] Test complete purchase flow:
  - [ ] Home page loads
  - [ ] Navigation works
  - [ ] Checkout completes
  - [ ] Email sends
  - [ ] Portal access works
  - [ ] Downloads work
- [ ] Test free resource flow:
  - [ ] Email capture works
  - [ ] PDF delivery works
  - [ ] Welcome sequence triggers
- [ ] Test on multiple devices:
  - [ ] Desktop (Chrome, Firefox, Safari)
  - [ ] Mobile (iOS Safari, Android Chrome)
  - [ ] Tablet
- [ ] Test accessibility:
  - [ ] Keyboard navigation
  - [ ] Screen reader compatibility
  - [ ] Color contrast
- [ ] Load testing (optional):
  - [ ] Simulate traffic spike
  - [ ] Monitor database performance
  - [ ] Check email queue handling

### ✅ 13. Performance

- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Optimize images (WebP format, lazy loading)
- [ ] Enable Vercel Edge caching
- [ ] Monitor Core Web Vitals
- [ ] Set up performance monitoring (e.g., Vercel Analytics)

### ✅ 14. Legal & Compliance

- [ ] Review Privacy Policy for GDPR compliance
- [ ] Review Terms of Service
- [ ] Add cookie consent banner (if required)
- [ ] Verify refund policy is clear
- [ ] Add DMCA/copyright notice

### ✅ 15. Backups & Monitoring

- [ ] Set up automated database backups
- [ ] Configure uptime monitoring (e.g., UptimeRobot)
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure log aggregation
- [ ] Set up alerts for:
  - [ ] Payment failures
  - [ ] Email delivery failures
  - [ ] Webhook processing errors
  - [ ] Server errors

### ✅ 16. Launch Day Preparation

- [ ] Prepare launch email announcement
- [ ] Schedule social media posts
- [ ] Prepare press release (if applicable)
- [ ] Brief affiliate partners (if applicable)
- [ ] Set up customer support email
- [ ] Prepare FAQ document
- [ ] Test pre-order to post-launch transition
- [ ] Have refund process ready

---

## Post-Deployment Tasks

### Week 1:
- [ ] Monitor error logs daily
- [ ] Check email delivery rates
- [ ] Review Stripe dashboard for issues
- [ ] Monitor website analytics
- [ ] Respond to customer support emails
- [ ] Review conversion rates

### Week 2-4:
- [ ] Analyze user behavior (heat maps, session recordings)
- [ ] A/B test headline and CTAs
- [ ] Optimize email sequences based on open rates
- [ ] Create additional content (blog posts, videos)
- [ ] Gather and display customer testimonials

### Ongoing:
- [ ] Weekly database backups review
- [ ] Monthly security audits
- [ ] Quarterly performance optimization
- [ ] Regular content updates
- [ ] Email list hygiene (remove bounces)

---

## Emergency Contacts

Keep these handy for launch day:

- **Stripe Support**: https://support.stripe.com/
- **Resend Support**: support@resend.com
- **Vercel Support**: https://vercel.com/support
- **Domain Registrar**: [Your registrar]
- **Developer Contact**: [Your email/phone]

---

## Quick Commands for Production

```bash
# Check production health
curl https://yourdomain.com/api/health

# View recent orders (requires ADMIN_API_KEY)
curl -H "Authorization: Bearer YOUR_ADMIN_KEY" \
  https://yourdomain.com/api/admin/orders

# View email stats
curl -H "Authorization: Bearer YOUR_ADMIN_KEY" \
  https://yourdomain.com/api/admin/email-stats

# Manually trigger email queue processing
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://yourdomain.com/api/cron/process-emails

# Manually trigger release day fulfillment (after launch date)
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://yourdomain.com/api/cron/release-ebook
```

---

## 🎉 Ready to Launch!

Once all items are checked off, you're ready to launch your book website!

Remember:
- Test thoroughly before announcing
- Have a support plan ready
- Monitor closely in the first 48 hours
- Be prepared to iterate based on user feedback

Good luck with your launch! 🚀
