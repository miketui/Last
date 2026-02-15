#!/usr/bin/env bun
/**
 * Database initialization script
 * Run this once to create all required tables
 * Usage: bun setup-database.ts
 */

import { db } from "./lib/database";

console.log("🚀 Initializing database...\n");

try {
  // Create customers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  console.log("✅ Created customers table");

  // Create orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      stripe_payment_intent_id TEXT UNIQUE NOT NULL,
      amount_total INTEGER NOT NULL,
      amount_tax INTEGER DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'pending',
      coupon TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);
  console.log("✅ Created orders table");

  // Create portal_tokens table
  db.exec(`
    CREATE TABLE IF NOT EXISTS portal_tokens (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);
  console.log("✅ Created portal_tokens table");

  // Create download_tokens table
  db.exec(`
    CREATE TABLE IF NOT EXISTS download_tokens (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      format TEXT NOT NULL,
      max_downloads INTEGER NOT NULL DEFAULT 3,
      downloads_used INTEGER NOT NULL DEFAULT 0,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);
  console.log("✅ Created download_tokens table");

  // Create subscribers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      source TEXT,
      tags TEXT,
      mailchimp_id TEXT,
      subscribed_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  console.log("✅ Created subscribers table");

  // Create email_queue table
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_queue (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      template TEXT NOT NULL,
      data TEXT NOT NULL,
      scheduled_for TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      last_attempt_at TEXT,
      sent_at TEXT,
      error TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  console.log("✅ Created email_queue table");

  // Create email_sequences table
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_sequences (
      id TEXT PRIMARY KEY,
      subscriber_email TEXT NOT NULL,
      sequence_name TEXT NOT NULL,
      current_step INTEGER NOT NULL DEFAULT 0,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_email_sent_at TEXT,
      completed INTEGER NOT NULL DEFAULT 0
    )
  `);
  console.log("✅ Created email_sequences table");

  // Create broadcasts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS broadcasts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      cta_text TEXT,
      cta_url TEXT,
      segment TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      scheduled_for TEXT,
      sent_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  console.log("✅ Created broadcasts table");

  // Create webhooks table (idempotency)
  db.exec(`
    CREATE TABLE IF NOT EXISTS webhooks (
      id TEXT PRIMARY KEY,
      event_id TEXT UNIQUE NOT NULL,
      event_type TEXT NOT NULL,
      event_data TEXT NOT NULL,
      processed_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  console.log("✅ Created webhooks table");

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);
    CREATE INDEX IF NOT EXISTS idx_portal_tokens_order_id ON portal_tokens(order_id);
    CREATE INDEX IF NOT EXISTS idx_download_tokens_order_id ON download_tokens(order_id);
    CREATE INDEX IF NOT EXISTS idx_download_tokens_token ON download_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
    CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_for ON email_queue(scheduled_for);
    CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
    CREATE INDEX IF NOT EXISTS idx_webhooks_event_id ON webhooks(event_id);
  `);
  console.log("✅ Created indexes");

  console.log("\n✨ Database initialization complete!");
  console.log("📊 Database location: ./curls.db\n");

} catch (error) {
  console.error("❌ Database initialization failed:", error);
  process.exit(1);
}
