# Admin Dashboard Setup Guide

This guide explains how to set up and use the admin dashboard for your Curls & Contemplation eBook sales platform.

## Quick Start

1. **Access the dashboard** at `/admin` (e.g., `http://localhost:3000/admin`)

2. **Default credentials** (CHANGE IN PRODUCTION!):
   - Username: `admin`
   - Password: `admin123`

3. **Log in** and start tracking your business metrics

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Admin Dashboard Credentials
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_secure_password

# Optional: API Key for programmatic access
ADMIN_API_KEY=your_api_key_for_scripts
```

### Security Best Practices

1. **Change default credentials immediately** in production
2. Use strong, unique passwords (16+ characters with mixed case, numbers, symbols)
3. Sessions expire after 24 hours
4. All admin endpoints require authentication

## Dashboard Features

### Overview Page
- **Total Revenue** - Lifetime sales total
- **Today's Revenue** - Sales from the current day
- **Monthly Revenue** - Sales from the current month
- **Total Subscribers** - Email list size
- **Customer Count** - Unique purchasers
- **Download Stats** - Total and daily downloads
- **Refund Count** - Number of refunded orders
- **Email Queue** - Pending and sent emails

### Orders Page
- View all orders with status filtering
- Filter by: succeeded, pending, refunded
- See customer details, amounts, coupons used
- Order status breakdown with totals

### Subscribers Page
- Complete email list with source tracking
- Search by email or name
- View tags and subscription date
- Source statistics (where subscribers came from)

### Customers Page
- All customers with order history
- Lifetime value calculation
- Top customers ranking
- Order count per customer

### Analytics Page
- Revenue by day (bar chart visualization)
- New subscribers by day
- Traffic statistics:
  - Total page views
  - Unique visitors
  - Top pages
  - Top referrers
- Adjustable time period (7/30/90 days)

## API Access

The admin dashboard uses these API endpoints. You can also access them programmatically.

### Authentication

```bash
# Login to get session token
curl -X POST https://your-site.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'

# Response: {"success":true,"token":"abc123...","expiresIn":86400000}
```

### Dashboard Endpoints

All endpoints require `Authorization: Bearer <token>` header.

```bash
# Get dashboard stats
curl https://your-site.com/api/admin/dashboard/stats \
  -H "Authorization: Bearer abc123..."

# Get orders
curl "https://your-site.com/api/admin/dashboard/orders?all=true" \
  -H "Authorization: Bearer abc123..."

# Get subscribers
curl https://your-site.com/api/admin/dashboard/subscribers \
  -H "Authorization: Bearer abc123..."

# Get customers
curl https://your-site.com/api/admin/dashboard/customers \
  -H "Authorization: Bearer abc123..."

# Get analytics (with custom period)
curl "https://your-site.com/api/admin/dashboard/analytics?days=30" \
  -H "Authorization: Bearer abc123..."
```

### Using API Key Instead of Session

You can also use the `ADMIN_API_KEY` for programmatic access:

```bash
curl https://your-site.com/api/admin/dashboard/stats \
  -H "Authorization: Bearer your_admin_api_key"
```

## Traffic Tracking

Page views are automatically tracked for analytics. The system:

1. Records page path, referrer, and user agent
2. Hashes IP addresses for privacy
3. Calculates unique visitors
4. Identifies top pages and referrers

### Manual Tracking (if needed)

```bash
curl -X POST https://your-site.com/api/track \
  -H "Content-Type: application/json" \
  -d '{"path":"/book","referrer":"https://google.com"}'
```

## Database Tables

The admin dashboard uses these SQLite tables:

### admin_sessions
Stores active admin login sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Unique ID |
| token | TEXT | Session token |
| created_at | TEXT | Creation timestamp |
| expires_at | TEXT | Expiration timestamp |

### page_views
Stores traffic analytics data.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Unique ID |
| path | TEXT | Page path |
| referrer | TEXT | Referring URL |
| user_agent | TEXT | Browser info |
| ip_hash | TEXT | Hashed IP for privacy |
| created_at | TEXT | View timestamp |

## Troubleshooting

### Can't log in
1. Check ADMIN_USERNAME and ADMIN_PASSWORD in `.env`
2. Restart the server after changing env vars
3. Clear browser cache/cookies

### Stats not showing
1. Verify database file exists (`curls.db`)
2. Check for errors in server logs
3. Ensure tables are created (run server once)

### Traffic not tracking
1. Check browser console for API errors
2. Verify `/api/track` endpoint responds
3. Admin pages (`/admin/*`) are not tracked

### Session expired
1. Sessions last 24 hours by default
2. Log in again to get new session
3. Check server time is correct

## Mobile Access

The admin dashboard is responsive and works on mobile devices:
- Sidebar collapses to icon-only mode
- Tables scroll horizontally
- Charts adapt to screen size

## Exporting Data

Currently, data export is via API. Example scripts:

### Export Subscribers to CSV

```bash
#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}' | jq -r '.token')

curl -s "http://localhost:3000/api/admin/dashboard/subscribers" \
  -H "Authorization: Bearer $TOKEN" | \
  jq -r '.subscribers[] | [.email, .name, .source, .created_at] | @csv' > subscribers.csv
```

### Export Orders to CSV

```bash
#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}' | jq -r '.token')

curl -s "http://localhost:3000/api/admin/dashboard/orders?all=true" \
  -H "Authorization: Bearer $TOKEN" | \
  jq -r '.orders[] | [.created_at, .customer_email, .amount_total, .status] | @csv' > orders.csv
```

## Future Enhancements

Planned features (not yet implemented):
- [ ] Email template editor
- [ ] Coupon code management
- [ ] Refund processing from dashboard
- [ ] Export to Excel/Google Sheets
- [ ] Custom date range picker
- [ ] Real-time updates via WebSocket

---

## Support

For issues or questions:
1. Check server logs for errors
2. Verify environment variables
3. Review this documentation
4. Check the main README.md

---

Built for the Curls & Contemplation eBook Sales Platform.
