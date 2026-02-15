// Seed test data for screenshots and development
// Usage: bun scripts/seed-test-data.ts

import { db } from "../lib/database";
// Import email-automation to ensure email_queue table is created
import "../lib/email-automation";

// Known tokens for screenshot navigation
export const PREORDER_PORTAL_TOKEN = "preorder_test_token_abc123def456789012345678901234567890abcdef0123456789abcdef01";
export const POSTLAUNCH_PORTAL_TOKEN = "postlaunch_test_token_def456789012345678901234567890abcdef0123456789abcdef0123";
export const REFUNDED_PORTAL_TOKEN = "refunded_test_token_ghi789012345678901234567890abcdef0123456789abcdef012345";
export const EPUB_DOWNLOAD_TOKEN = "epub_download_token_001234567890abcdef0123456789abcdef0123456789abcdef012345";
export const PDF_DOWNLOAD_TOKEN = "pdf_download_token_0012345678901abcdef0123456789abcdef0123456789abcdef012345";

export function seedTestData() {
  console.log("[Seed] Starting test data seeding...");

  // Clean existing test data
  db.exec("DELETE FROM page_views");
  db.exec("DELETE FROM email_queue");
  db.exec("DELETE FROM download_tokens");
  db.exec("DELETE FROM portal_tokens");
  db.exec("DELETE FROM orders");
  db.exec("DELETE FROM customers");
  db.exec("DELETE FROM subscribers");
  db.exec("DELETE FROM webhook_events");
  db.exec("DELETE FROM admin_sessions");

  // Create customers
  const customer1Id = "cust_preorder_001";
  const customer2Id = "cust_postlaunch_002";
  const customer3Id = "cust_refunded_003";

  db.prepare(`INSERT INTO customers (id, email, name, country, created_at) VALUES (?, ?, ?, ?, ?)`).run(
    customer1Id, "buyer1@example.com", "Sarah Mitchell", "US", "2026-02-01T10:00:00.000Z"
  );
  db.prepare(`INSERT INTO customers (id, email, name, country, created_at) VALUES (?, ?, ?, ?, ?)`).run(
    customer2Id, "buyer2@example.com", "Jordan Williams", "US", "2026-02-05T14:30:00.000Z"
  );
  db.prepare(`INSERT INTO customers (id, email, name, country, created_at) VALUES (?, ?, ?, ?, ?)`).run(
    customer3Id, "buyer3@example.com", "Alex Rivera", "CA", "2026-02-03T09:15:00.000Z"
  );

  console.log("[Seed] Customers created");

  // Create orders
  const order1Id = "ord_preorder_001";
  const order2Id = "ord_postlaunch_002";
  const order3Id = "ord_refunded_003";

  // Order 1: Pre-order (succeeded, no downloads)
  db.prepare(`INSERT INTO orders (id, stripe_payment_intent_id, customer_id, status, currency, amount_total, amount_tax, coupon, created_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    order1Id, "pi_preorder_test_001", customer1Id, "succeeded", "USD", 1999, 0, null, "2026-02-01T10:05:00.000Z", "2026-02-01T10:05:00.000Z"
  );

  // Order 2: Post-launch (succeeded, with downloads)
  db.prepare(`INSERT INTO orders (id, stripe_payment_intent_id, customer_id, status, currency, amount_total, amount_tax, coupon, created_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    order2Id, "pi_postlaunch_test_002", customer2Id, "succeeded", "USD", 1999, 0, null, "2026-02-05T14:35:00.000Z", "2026-02-05T14:35:00.000Z"
  );

  // Order 3: Refunded
  db.prepare(`INSERT INTO orders (id, stripe_payment_intent_id, customer_id, status, currency, amount_total, amount_tax, coupon, created_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    order3Id, "pi_refunded_test_003", customer3Id, "refunded", "USD", 1999, 0, null, "2026-02-03T09:20:00.000Z", "2026-02-03T09:20:00.000Z"
  );

  // Some extra orders for dashboard data variety
  for (let i = 4; i <= 8; i++) {
    const dayOffset = i * 2;
    const date = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000).toISOString();
    db.prepare(`INSERT INTO customers (id, email, name, country, created_at) VALUES (?, ?, ?, ?, ?)`).run(
      `cust_extra_${i}`, `customer${i}@example.com`, `Customer ${i}`, "US", date
    );
    db.prepare(`INSERT INTO orders (id, stripe_payment_intent_id, customer_id, status, currency, amount_total, amount_tax, coupon, created_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      `ord_extra_${i}`, `pi_extra_test_${i}`, `cust_extra_${i}`, "succeeded", "USD", 1999, 0, null, date, date
    );
  }

  console.log("[Seed] Orders created");

  // Create portal tokens
  db.prepare(`INSERT INTO portal_tokens (id, order_id, token, created_at) VALUES (?, ?, ?, ?)`).run(
    "pt_preorder_001", order1Id, PREORDER_PORTAL_TOKEN, "2026-02-01T10:05:00.000Z"
  );
  db.prepare(`INSERT INTO portal_tokens (id, order_id, token, created_at) VALUES (?, ?, ?, ?)`).run(
    "pt_postlaunch_002", order2Id, POSTLAUNCH_PORTAL_TOKEN, "2026-02-05T14:35:00.000Z"
  );
  db.prepare(`INSERT INTO portal_tokens (id, order_id, token, created_at) VALUES (?, ?, ?, ?)`).run(
    "pt_refunded_003", order3Id, REFUNDED_PORTAL_TOKEN, "2026-02-03T09:20:00.000Z"
  );

  console.log("[Seed] Portal tokens created");

  // Create download tokens for post-launch order
  const epubExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const pdfExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(`INSERT INTO download_tokens (id, order_id, format, token, max_downloads, downloads_used, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    "dt_epub_002", order2Id, "epub", EPUB_DOWNLOAD_TOKEN, 3, 1, epubExpiry, "2026-02-05T14:35:00.000Z"
  );
  db.prepare(`INSERT INTO download_tokens (id, order_id, format, token, max_downloads, downloads_used, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    "dt_pdf_002", order2Id, "pdf", PDF_DOWNLOAD_TOKEN, 3, 0, pdfExpiry, "2026-02-05T14:35:00.000Z"
  );

  // Revoked download tokens for refunded order
  db.prepare(`INSERT INTO download_tokens (id, order_id, format, token, max_downloads, downloads_used, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    "dt_epub_003", order3Id, "epub", "revoked_epub_token_placeholder00000000000000000000000000000000000", 0, 0, "2026-02-10T09:20:00.000Z", "2026-02-03T09:20:00.000Z"
  );

  console.log("[Seed] Download tokens created");

  // Create subscribers with distinct sources
  db.prepare(`INSERT INTO subscribers (id, email, name, source, tags, confirmed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    "sub_001", "reader1@example.com", "Michelle T.", "home", "lead_freebie", 1, "2026-02-01T08:00:00.000Z"
  );
  db.prepare(`INSERT INTO subscribers (id, email, name, source, tags, confirmed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    "sub_002", "reader2@example.com", "Keisha J.", "resources", "lead_freebie,pricing_kit", 1, "2026-02-02T11:30:00.000Z"
  );
  db.prepare(`INSERT INTO subscribers (id, email, name, source, tags, confirmed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    "sub_003", "reader3@example.com", "Darnell B.", "blog", "blog_subscriber", 1, "2026-02-04T16:45:00.000Z"
  );
  db.prepare(`INSERT INTO subscribers (id, email, name, source, tags, confirmed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    "sub_004", "reader4@example.com", "Jasmine L.", "freebie_pricing_kit", "lead_freebie,pricing_kit", 1, "2026-02-06T09:00:00.000Z"
  );
  db.prepare(`INSERT INTO subscribers (id, email, name, source, tags, confirmed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    "sub_005", "reader5@example.com", "Tanya R.", "home", "lead_freebie", 0, "2026-02-08T20:15:00.000Z"
  );
  // Buyers are also subscribers
  db.prepare(`INSERT OR IGNORE INTO subscribers (id, email, name, source, tags, confirmed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    "sub_buyer1", "buyer1@example.com", "Sarah Mitchell", "checkout", "customer_preorder", 1, "2026-02-01T10:00:00.000Z"
  );
  db.prepare(`INSERT OR IGNORE INTO subscribers (id, email, name, source, tags, confirmed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    "sub_buyer2", "buyer2@example.com", "Jordan Williams", "checkout", "customer_postlaunch", 1, "2026-02-05T14:30:00.000Z"
  );

  console.log("[Seed] Subscribers created");

  // Create email_queue entries
  const now = new Date().toISOString();
  db.prepare(`INSERT INTO email_queue (id, recipient_email, recipient_name, subject, template_key, template_data, scheduled_for, status, attempts, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    "eq_001", "buyer1@example.com", "Sarah Mitchell", "Your pre-order is confirmed!", "preorder_confirmation", "{}", "2026-02-01T10:06:00.000Z", "sent", 1, "2026-02-01T10:05:00.000Z"
  );
  db.prepare(`INSERT INTO email_queue (id, recipient_email, recipient_name, subject, template_key, template_data, scheduled_for, status, attempts, sent_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    "eq_002", "buyer2@example.com", "Jordan Williams", "Your eBook is ready!", "ebook_ready", "{}", "2026-02-05T14:36:00.000Z", "sent", 1, "2026-02-05T14:36:00.000Z", "2026-02-05T14:35:00.000Z"
  );
  db.prepare(`INSERT INTO email_queue (id, recipient_email, recipient_name, subject, template_key, template_data, scheduled_for, status, attempts, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    "eq_003", "reader1@example.com", "Michelle T.", "Welcome to Curls & Contemplation!", "welcome", "{}", "2026-02-01T08:01:00.000Z", "sent", 1, "2026-02-01T08:00:00.000Z"
  );
  db.prepare(`INSERT INTO email_queue (id, recipient_email, recipient_name, subject, template_key, template_data, scheduled_for, status, attempts, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    "eq_004", "reader4@example.com", "Jasmine L.", "Your Pricing Confidence Kit", "free_resource", "{}", now, "pending", 0, now
  );
  db.prepare(`INSERT INTO email_queue (id, recipient_email, recipient_name, subject, template_key, template_data, scheduled_for, status, attempts, last_error, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    "eq_005", "invalid@bad-domain.xyz", null, "Welcome!", "welcome", "{}", "2026-02-03T12:00:00.000Z", "failed", 3, "Recipient not found", "2026-02-03T12:00:00.000Z"
  );
  db.prepare(`INSERT INTO email_queue (id, recipient_email, recipient_name, subject, template_key, template_data, scheduled_for, status, attempts, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    "eq_006", "buyer1@example.com", "Sarah Mitchell", "Reminder: Your eBook launches soon!", "preorder_reminder", "{}", new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), "pending", 0, now
  );

  console.log("[Seed] Email queue entries created");

  // Create page views for analytics
  const paths = ["/", "/book", "/chapters", "/blog", "/resources", "/faq", "/about", "/checkout"];
  for (let daysAgo = 0; daysAgo < 14; daysAgo++) {
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const viewCount = Math.floor(Math.random() * 20) + 5;
    for (let v = 0; v < viewCount; v++) {
      const path = paths[Math.floor(Math.random() * paths.length)];
      const hour = Math.floor(Math.random() * 24);
      const viewDate = new Date(date);
      viewDate.setHours(hour, Math.floor(Math.random() * 60));
      const ipHash = `hash_${Math.floor(Math.random() * 50).toString(16).padStart(4, "0")}`;
      db.prepare(`INSERT INTO page_views (path, referrer, user_agent, ip_hash, created_at) VALUES (?, ?, ?, ?, ?)`).run(
        path,
        Math.random() > 0.5 ? "https://google.com" : Math.random() > 0.5 ? "https://instagram.com" : null,
        "Mozilla/5.0 (Test)",
        ipHash,
        viewDate.toISOString()
      );
    }
  }

  console.log("[Seed] Page views created");

  // Create webhook events for the orders
  db.prepare(`INSERT INTO webhook_events (id, stripe_event_id, type, payload, received_at) VALUES (?, ?, ?, ?, ?)`).run(
    "wh_001", "evt_preorder_001", "payment_intent.succeeded", "{}", "2026-02-01T10:05:00.000Z"
  );
  db.prepare(`INSERT INTO webhook_events (id, stripe_event_id, type, payload, received_at) VALUES (?, ?, ?, ?, ?)`).run(
    "wh_002", "evt_postlaunch_002", "payment_intent.succeeded", "{}", "2026-02-05T14:35:00.000Z"
  );
  db.prepare(`INSERT INTO webhook_events (id, stripe_event_id, type, payload, received_at) VALUES (?, ?, ?, ?, ?)`).run(
    "wh_003", "evt_refund_003", "charge.refunded", "{}", "2026-02-07T11:00:00.000Z"
  );

  console.log("[Seed] Webhook events created");
  console.log("[Seed] Test data seeding complete!");
  console.log(`[Seed] Portal tokens for screenshots:`);
  console.log(`  Preorder:   /portal/${PREORDER_PORTAL_TOKEN}`);
  console.log(`  Postlaunch: /portal/${POSTLAUNCH_PORTAL_TOKEN}`);
}

// Run if called directly
if (import.meta.main) {
  seedTestData();
}
