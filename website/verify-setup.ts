#!/usr/bin/env bun
/**
 * Setup Verification Script
 * Checks that all required files and configurations are present
 * Usage: bun verify-setup.ts
 */

import { existsSync } from "fs";
import { db } from "./lib/database";

console.log("🔍 Verifying Curls & Contemplation Setup...\n");

interface CheckResult {
  name: string;
  status: "✅" | "⚠️" | "❌";
  message: string;
}

const results: CheckResult[] = [];

// Check environment variables
console.log("📋 Checking Environment Variables...");
const requiredEnvVars = [
  "STRIPE_SECRET_KEY",
  "STRIPE_PUBLISHABLE_KEY",
  "RESEND_API_KEY",
  "FROM_EMAIL",
];

const optionalEnvVars = [
  "STRIPE_WEBHOOK_SECRET",
  "MAILCHIMP_API_KEY",
  "TURNSTILE_SECRET_KEY",
  "ADMIN_API_KEY",
  "CRON_SECRET",
];

requiredEnvVars.forEach((varName) => {
  const value = process.env[varName];
  if (!value || value.includes("your_") || value.includes("...")) {
    results.push({
      name: varName,
      status: "❌",
      message: "Missing or placeholder value",
    });
  } else {
    results.push({
      name: varName,
      status: "✅",
      message: "Configured",
    });
  }
});

optionalEnvVars.forEach((varName) => {
  const value = process.env[varName];
  if (!value || value.includes("your_") || value.includes("...")) {
    results.push({
      name: varName,
      status: "⚠️",
      message: "Optional - not configured",
    });
  } else {
    results.push({
      name: varName,
      status: "✅",
      message: "Configured",
    });
  }
});

// Check database
console.log("\n🗄️  Checking Database...");
try {
  const tables = [
    "customers",
    "orders",
    "portal_tokens",
    "download_tokens",
    "subscribers",
    "email_queue",
    "email_sequences",
    "broadcasts",
    "webhooks",
  ];

  tables.forEach((table) => {
    try {
      const result = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number };
      results.push({
        name: `Table: ${table}`,
        status: "✅",
        message: `${result.count} records`,
      });
    } catch (error) {
      results.push({
        name: `Table: ${table}`,
        status: "❌",
        message: "Table not found",
      });
    }
  });
} catch (error) {
  results.push({
    name: "Database",
    status: "❌",
    message: "Database not initialized. Run: bun setup-database.ts",
  });
}

// Check book files
console.log("\n📚 Checking Book Files...");
const bookFiles = [
  { path: "./private/CurlsAndContemplation.epub", name: "EPUB File" },
  { path: "./private/CurlsAndContemplation.pdf", name: "PDF File" },
];

bookFiles.forEach(({ path, name }) => {
  if (existsSync(path)) {
    results.push({
      name,
      status: "✅",
      message: "Present",
    });
  } else {
    results.push({
      name,
      status: "❌",
      message: `Missing at ${path}`,
    });
  }
});

// Check free resource
console.log("\n🎁 Checking Free Resource...");
if (existsSync("./public/downloads/pricing-confidence-kit.pdf")) {
  results.push({
    name: "Pricing Kit PDF",
    status: "✅",
    message: "Present",
  });
} else {
  results.push({
    name: "Pricing Kit PDF",
    status: "⚠️",
    message: "Missing - create or use placeholder",
  });
}

// Print results
console.log("\n" + "=".repeat(70));
console.log("📊 Setup Verification Results");
console.log("=".repeat(70) + "\n");

const grouped = {
  "✅": results.filter((r) => r.status === "✅"),
  "⚠️": results.filter((r) => r.status === "⚠️"),
  "❌": results.filter((r) => r.status === "❌"),
};

Object.entries(grouped).forEach(([status, items]) => {
  if (items.length > 0) {
    console.log(`${status} ${items.length} items:`);
    items.forEach((item) => {
      console.log(`   ${item.name}: ${item.message}`);
    });
    console.log("");
  }
});

// Summary
const critical = grouped["❌"].length;
const warnings = grouped["⚠️"].length;
const passed = grouped["✅"].length;

console.log("=".repeat(70));
console.log(`Total: ${passed} passed, ${warnings} warnings, ${critical} critical issues`);
console.log("=".repeat(70) + "\n");

if (critical === 0 && warnings === 0) {
  console.log("🎉 Perfect! Your setup is complete and ready to go!");
  console.log("\nStart the server with: bun --hot server.ts\n");
} else if (critical === 0) {
  console.log("✅ Your setup is functional but has some optional features not configured.");
  console.log("\nYou can start the server with: bun --hot server.ts");
  console.log("Configure optional features later for full functionality.\n");
} else {
  console.log("⚠️  Critical issues found. Please fix them before starting:");
  grouped["❌"].forEach((item) => {
    console.log(`   • ${item.name}: ${item.message}`);
  });
  console.log("\nSee SETUP.md for detailed instructions.\n");
  process.exit(1);
}
