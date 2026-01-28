// Database module using Bun's built-in SQLite
// Per SOW: customers, orders, portal_tokens, download_tokens, webhook_events, subscribers

import { Database } from "bun:sqlite";

// Initialize database
const db = new Database("curls.db");

// Enable WAL mode for better performance
db.exec("PRAGMA journal_mode = WAL;");

// Create tables with SOW-compliant schema
db.exec(`
  -- Customers table
  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    name TEXT,
    country TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Orders table
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    stripe_payment_intent_id TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    status TEXT CHECK(status IN ('pending', 'succeeded', 'refunded', 'partial')) DEFAULT 'pending',
    currency TEXT DEFAULT 'USD',
    amount_total INTEGER NOT NULL,
    amount_tax INTEGER DEFAULT 0,
    coupon TEXT,
    utm TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
  );

  -- Portal tokens (unguessable tokens for order portal access)
  CREATE TABLE IF NOT EXISTS portal_tokens (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    order_id TEXT NOT NULL REFERENCES orders(id),
    token TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Download tokens (tokenized downloads with limits)
  CREATE TABLE IF NOT EXISTS download_tokens (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    order_id TEXT NOT NULL REFERENCES orders(id),
    format TEXT CHECK(format IN ('epub', 'pdf')) NOT NULL,
    token TEXT UNIQUE NOT NULL,
    max_downloads INTEGER DEFAULT 3,
    downloads_used INTEGER DEFAULT 0,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Webhook events (idempotency tracking)
  CREATE TABLE IF NOT EXISTS webhook_events (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    stripe_event_id TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    payload TEXT,
    received_at TEXT DEFAULT (datetime('now'))
  );

  -- Subscribers (email list)
  CREATE TABLE IF NOT EXISTS subscribers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    name TEXT,
    source TEXT,
    tags TEXT,
    confirmed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
  CREATE INDEX IF NOT EXISTS idx_orders_payment_intent ON orders(stripe_payment_intent_id);
  CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON download_tokens(token);
  CREATE INDEX IF NOT EXISTS idx_download_tokens_order ON download_tokens(order_id);
  CREATE INDEX IF NOT EXISTS idx_portal_tokens_token ON portal_tokens(token);
  CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
  CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
`);

// Generate secure random token
export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Customer operations
export function upsertCustomer(email: string, name?: string, country?: string) {
  const stmt = db.prepare(`
    INSERT INTO customers (email, name, country)
    VALUES (?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
      name = COALESCE(excluded.name, customers.name),
      country = COALESCE(excluded.country, customers.country)
    RETURNING *
  `);
  return stmt.get(email.toLowerCase(), name ?? null, country ?? null) as Customer;
}

export function getCustomerByEmail(email: string) {
  return db.prepare("SELECT * FROM customers WHERE email = ?").get(email.toLowerCase()) as Customer | null;
}

// Order operations
export function createOrder(data: {
  stripePaymentIntentId: string;
  customerId: string;
  amountTotal: number;
  amountTax?: number;
  currency?: string;
  coupon?: string;
  utm?: Record<string, string>;
}) {
  const stmt = db.prepare(`
    INSERT INTO orders (stripe_payment_intent_id, customer_id, amount_total, amount_tax, currency, coupon, utm)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `);
  return stmt.get(
    data.stripePaymentIntentId,
    data.customerId,
    data.amountTotal,
    data.amountTax ?? 0,
    data.currency ?? "USD",
    data.coupon ?? null,
    data.utm ? JSON.stringify(data.utm) : null
  ) as Order;
}

export function updateOrderStatus(orderId: string, status: "pending" | "succeeded" | "refunded" | "partial") {
  const stmt = db.prepare(`
    UPDATE orders SET status = ?, completed_at = CASE WHEN ? = 'succeeded' THEN datetime('now') ELSE completed_at END
    WHERE id = ?
    RETURNING *
  `);
  return stmt.get(status, status, orderId) as Order;
}

export function getOrderByPaymentIntent(paymentIntentId: string) {
  return db.prepare("SELECT * FROM orders WHERE stripe_payment_intent_id = ?").get(paymentIntentId) as Order | null;
}

export function getOrderById(orderId: string) {
  return db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as Order | null;
}

export function getOrderByPortalToken(token: string) {
  const result = db.prepare(`
    SELECT o.*, pt.token as portal_token
    FROM orders o
    JOIN portal_tokens pt ON o.id = pt.order_id
    WHERE pt.token = ?
  `).get(token) as (Order & { portal_token: string }) | null;
  return result;
}

export function getAllOrders() {
  return db.prepare(`
    SELECT o.*, c.email as customer_email, c.name as customer_name
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    ORDER BY o.created_at DESC
  `).all() as (Order & { customer_email: string; customer_name: string })[];
}

// Portal token operations
export function createPortalToken(orderId: string) {
  const token = generateToken();
  const stmt = db.prepare(`
    INSERT INTO portal_tokens (order_id, token)
    VALUES (?, ?)
    RETURNING *
  `);
  return stmt.get(orderId, token) as PortalToken;
}

export function getPortalToken(token: string) {
  return db.prepare("SELECT * FROM portal_tokens WHERE token = ?").get(token) as PortalToken | null;
}

// Download token operations
export function createDownloadToken(orderId: string, format: "epub" | "pdf", expiresInDays: number = 7) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
  const stmt = db.prepare(`
    INSERT INTO download_tokens (order_id, format, token, expires_at)
    VALUES (?, ?, ?, ?)
    RETURNING *
  `);
  return stmt.get(orderId, format, token, expiresAt) as DownloadToken;
}

export function getDownloadToken(token: string) {
  return db.prepare("SELECT * FROM download_tokens WHERE token = ?").get(token) as DownloadToken | null;
}

export function getDownloadTokensByOrder(orderId: string) {
  return db.prepare("SELECT * FROM download_tokens WHERE order_id = ?").all(orderId) as DownloadToken[];
}

export function incrementDownloadCount(tokenId: string) {
  const stmt = db.prepare(`
    UPDATE download_tokens
    SET downloads_used = downloads_used + 1
    WHERE id = ?
    RETURNING *
  `);
  return stmt.get(tokenId) as DownloadToken;
}

export function extendDownloadToken(tokenId: string, additionalDays: number = 7) {
  const stmt = db.prepare(`
    UPDATE download_tokens
    SET expires_at = datetime(expires_at, '+' || ? || ' days'),
        downloads_used = 0,
        max_downloads = max_downloads + 3
    WHERE id = ?
    RETURNING *
  `);
  return stmt.get(additionalDays, tokenId) as DownloadToken;
}

export function revokeDownloadTokens(orderId: string) {
  return db.prepare(`
    UPDATE download_tokens
    SET max_downloads = 0
    WHERE order_id = ?
  `).run(orderId);
}

// Check if download is valid
export function isDownloadValid(token: DownloadToken): { valid: boolean; reason?: string } {
  const now = new Date();
  const expiresAt = new Date(token.expires_at);

  if (token.downloads_used >= token.max_downloads) {
    return { valid: false, reason: "Download limit reached" };
  }
  if (now > expiresAt) {
    return { valid: false, reason: "Download link expired" };
  }
  return { valid: true };
}

// Webhook event operations (idempotency)
export function recordWebhookEvent(stripeEventId: string, type: string, payload: object) {
  try {
    const stmt = db.prepare(`
      INSERT INTO webhook_events (stripe_event_id, type, payload)
      VALUES (?, ?, ?)
      RETURNING *
    `);
    return stmt.get(stripeEventId, type, JSON.stringify(payload)) as WebhookEvent;
  } catch (error: any) {
    if (error.message?.includes("UNIQUE constraint failed")) {
      return null; // Already processed
    }
    throw error;
  }
}

export function wasWebhookProcessed(stripeEventId: string): boolean {
  const result = db.prepare("SELECT 1 FROM webhook_events WHERE stripe_event_id = ?").get(stripeEventId);
  return result !== null;
}

// Subscriber operations
export function addSubscriber(email: string, source: string, name?: string, tags?: string[]) {
  try {
    const stmt = db.prepare(`
      INSERT INTO subscribers (email, name, source, tags)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        name = COALESCE(excluded.name, subscribers.name),
        tags = CASE
          WHEN subscribers.tags IS NULL THEN excluded.tags
          ELSE subscribers.tags || ',' || excluded.tags
        END
      RETURNING *
    `);
    return stmt.get(email.toLowerCase(), name ?? null, source, tags?.join(",") ?? null) as Subscriber;
  } catch {
    return null;
  }
}

export function getSubscriber(email: string) {
  return db.prepare("SELECT * FROM subscribers WHERE email = ?").get(email.toLowerCase()) as Subscriber | null;
}

export function updateSubscriberTags(email: string, tags: string[]) {
  const subscriber = getSubscriber(email);
  if (!subscriber) return null;

  const existingTags = subscriber.tags ? subscriber.tags.split(",") : [];
  const newTags = [...new Set([...existingTags, ...tags])].join(",");

  return db.prepare(`
    UPDATE subscribers SET tags = ? WHERE email = ?
    RETURNING *
  `).get(newTags, email.toLowerCase()) as Subscriber;
}

export function confirmSubscriber(email: string) {
  return db.prepare(`
    UPDATE subscribers SET confirmed = 1 WHERE email = ?
    RETURNING *
  `).get(email.toLowerCase()) as Subscriber | null;
}

// Get orders without download tokens (for launch-day release)
export function getOrdersWithoutDownloadTokens() {
  return db.prepare(`
    SELECT o.*, c.email as customer_email, c.name as customer_name
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    LEFT JOIN download_tokens dt ON o.id = dt.order_id
    WHERE o.status = 'succeeded' AND dt.id IS NULL
  `).all() as (Order & { customer_email: string; customer_name: string })[];
}

// Types
export interface Customer {
  id: string;
  email: string;
  name: string | null;
  country: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  stripe_payment_intent_id: string;
  customer_id: string;
  status: "pending" | "succeeded" | "refunded" | "partial";
  currency: string;
  amount_total: number;
  amount_tax: number;
  coupon: string | null;
  utm: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface PortalToken {
  id: string;
  order_id: string;
  token: string;
  created_at: string;
}

export interface DownloadToken {
  id: string;
  order_id: string;
  format: "epub" | "pdf";
  token: string;
  max_downloads: number;
  downloads_used: number;
  expires_at: string;
  created_at: string;
}

export interface WebhookEvent {
  id: string;
  stripe_event_id: string;
  type: string;
  payload: string;
  received_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  source: string;
  tags: string | null;
  confirmed: number;
  created_at: string;
}

// Export the database instance for direct queries if needed
export { db };
