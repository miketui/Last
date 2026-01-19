// Database schema using Bun's built-in SQLite
import { Database } from "bun:sqlite";

// Initialize database
const db = new Database("website.db");

// Create tables
db.run(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    stripe_session_id TEXT UNIQUE,
    stripe_payment_intent TEXT,
    product_type TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS download_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT 5,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    source TEXT,
    confirmed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create indexes for performance
db.run(`CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_orders_session ON orders(stripe_session_id)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_tokens_token ON download_tokens(token)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)`);

// Types
export interface Customer {
  id: number;
  email: string;
  created_at: string;
}

export interface Order {
  id: number;
  customer_id: number;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  product_type: string;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export interface DownloadToken {
  id: number;
  order_id: number;
  token: string;
  download_count: number;
  max_downloads: number;
  expires_at: string;
  created_at: string;
}

export interface Subscriber {
  id: number;
  email: string;
  source: string | null;
  confirmed: number;
  created_at: string;
}

// Customer operations
export function getOrCreateCustomer(email: string): Customer {
  const normalizedEmail = email.toLowerCase().trim();

  // Try to find existing customer
  const existing = db.query<Customer, [string]>(
    "SELECT * FROM customers WHERE email = ?"
  ).get(normalizedEmail);

  if (existing) return existing;

  // Create new customer
  db.run("INSERT INTO customers (email) VALUES (?)", [normalizedEmail]);
  return db.query<Customer, [string]>(
    "SELECT * FROM customers WHERE email = ?"
  ).get(normalizedEmail)!;
}

export function getCustomerByEmail(email: string): Customer | null {
  return db.query<Customer, [string]>(
    "SELECT * FROM customers WHERE email = ?"
  ).get(email.toLowerCase().trim());
}

// Order operations
export function createOrder(
  customerId: number,
  productType: string,
  amountCents: number,
  stripeSessionId?: string
): Order {
  db.run(
    `INSERT INTO orders (customer_id, product_type, amount_cents, stripe_session_id)
     VALUES (?, ?, ?, ?)`,
    [customerId, productType, amountCents, stripeSessionId || null]
  );

  return db.query<Order, [string | null]>(
    "SELECT * FROM orders WHERE stripe_session_id = ? ORDER BY id DESC LIMIT 1"
  ).get(stripeSessionId || null)!;
}

export function updateOrderStatus(
  stripeSessionId: string,
  status: string,
  paymentIntent?: string
): Order | null {
  const now = status === 'completed' ? new Date().toISOString() : null;

  db.run(
    `UPDATE orders SET status = ?, stripe_payment_intent = ?, completed_at = ?
     WHERE stripe_session_id = ?`,
    [status, paymentIntent || null, now, stripeSessionId]
  );

  return db.query<Order, [string]>(
    "SELECT * FROM orders WHERE stripe_session_id = ?"
  ).get(stripeSessionId);
}

export function getOrderById(orderId: number): Order | null {
  return db.query<Order, [number]>(
    "SELECT * FROM orders WHERE id = ?"
  ).get(orderId);
}

export function getOrdersByEmail(email: string): Order[] {
  const customer = getCustomerByEmail(email);
  if (!customer) return [];

  return db.query<Order, [number]>(
    "SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC"
  ).all(customer.id);
}

export function getCompletedOrdersByEmail(email: string): Order[] {
  const customer = getCustomerByEmail(email);
  if (!customer) return [];

  return db.query<Order, [number, string]>(
    "SELECT * FROM orders WHERE customer_id = ? AND status = ? ORDER BY created_at DESC"
  ).all(customer.id, 'completed');
}

// Download token operations
export function createDownloadToken(orderId: number, expiryHours: number = 72): DownloadToken {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();

  db.run(
    `INSERT INTO download_tokens (order_id, token, expires_at) VALUES (?, ?, ?)`,
    [orderId, token, expiresAt]
  );

  return db.query<DownloadToken, [string]>(
    "SELECT * FROM download_tokens WHERE token = ?"
  ).get(token)!;
}

export function getDownloadToken(token: string): DownloadToken | null {
  return db.query<DownloadToken, [string]>(
    "SELECT * FROM download_tokens WHERE token = ?"
  ).get(token);
}

export function validateAndIncrementDownload(token: string): { valid: boolean; reason?: string; token?: DownloadToken } {
  const downloadToken = getDownloadToken(token);

  if (!downloadToken) {
    return { valid: false, reason: 'Token not found' };
  }

  // Check expiry
  if (new Date(downloadToken.expires_at) < new Date()) {
    return { valid: false, reason: 'Token has expired' };
  }

  // Check download limit
  if (downloadToken.download_count >= downloadToken.max_downloads) {
    return { valid: false, reason: 'Download limit reached' };
  }

  // Increment download count
  db.run(
    "UPDATE download_tokens SET download_count = download_count + 1 WHERE token = ?",
    [token]
  );

  return {
    valid: true,
    token: { ...downloadToken, download_count: downloadToken.download_count + 1 }
  };
}

export function getTokensByOrderId(orderId: number): DownloadToken[] {
  return db.query<DownloadToken, [number]>(
    "SELECT * FROM download_tokens WHERE order_id = ? ORDER BY created_at DESC"
  ).all(orderId);
}

// Subscriber operations
export function addSubscriber(email: string, source: string): Subscriber | null {
  const normalizedEmail = email.toLowerCase().trim();

  try {
    db.run(
      "INSERT OR IGNORE INTO subscribers (email, source) VALUES (?, ?)",
      [normalizedEmail, source]
    );
    return db.query<Subscriber, [string]>(
      "SELECT * FROM subscribers WHERE email = ?"
    ).get(normalizedEmail);
  } catch {
    return null;
  }
}

export function getSubscriber(email: string): Subscriber | null {
  return db.query<Subscriber, [string]>(
    "SELECT * FROM subscribers WHERE email = ?"
  ).get(email.toLowerCase().trim());
}

export function confirmSubscriber(email: string): boolean {
  const result = db.run(
    "UPDATE subscribers SET confirmed = 1 WHERE email = ?",
    [email.toLowerCase().trim()]
  );
  return result.changes > 0;
}

// Utility functions
function generateSecureToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Export database for direct queries if needed
export { db };
