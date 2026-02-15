// Screenshot generator for Pre-Order and Post-Launch states
// Usage: bun scripts/screenshots.ts
//
// Generates 22 screenshots in website/screenshots/:
// - 11 State A (Preorder): A_preorder_*.png
// - 11 State B (Postlaunch): B_postlaunch_*.png

import { chromium, type Browser, type Page } from "playwright";
import { seedTestData, PREORDER_PORTAL_TOKEN, POSTLAUNCH_PORTAL_TOKEN } from "./seed-test-data";

const BASE_URL = "http://localhost:3000";
const SCREENSHOTS_DIR = `${import.meta.dir}/../screenshots`;
const SERVER_SCRIPT = `${import.meta.dir}/../server.ts`;
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

// Wait for server to be ready
async function waitForServer(url: string, maxAttempts = 30): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`${url}/api/health`);
      if (res.ok) {
        console.log("[Screenshots] Server is ready");
        return;
      }
    } catch {
      // Server not ready yet
    }
    await Bun.sleep(1000);
  }
  throw new Error("Server failed to start within timeout");
}

// Start server with custom RELEASE_DATE
function startServer(releaseDate: string): ReturnType<typeof Bun.spawn> {
  const proc = Bun.spawn(["bun", SERVER_SCRIPT], {
    env: {
      ...process.env,
      RELEASE_DATE: releaseDate,
      STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder_for_screenshots",
      ADMIN_USERNAME,
      ADMIN_PASSWORD,
      NODE_ENV: "development",
    },
    stdout: "pipe",
    stderr: "pipe",
  });
  return proc;
}

// Login to admin and return session token
async function adminLogin(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
  });
  const data = await res.json();
  if (!data.token) throw new Error("Admin login failed");
  return data.token;
}

// Take a screenshot with retry for page load
async function takeScreenshot(page: Page, url: string, filename: string): Promise<void> {
  console.log(`  Capturing: ${filename}`);
  await page.goto(url, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {
    // Fallback: just wait for DOM
    return page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
  });
  // Extra wait for React rendering
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: `${SCREENSHOTS_DIR}/${filename}`,
    fullPage: true,
  });
}

// Take all screenshots for a given state
async function takeStateScreenshots(
  browser: Browser,
  prefix: string,
  portalToken: string,
  adminToken: string
): Promise<void> {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  // Public pages
  await takeScreenshot(page, `${BASE_URL}/`, `${prefix}_home.png`);
  await takeScreenshot(page, `${BASE_URL}/book`, `${prefix}_book.png`);
  await takeScreenshot(page, `${BASE_URL}/checkout`, `${prefix}_checkout.png`);
  await takeScreenshot(page, `${BASE_URL}/thank-you`, `${prefix}_thankyou.png`);
  await takeScreenshot(page, `${BASE_URL}/portal/${portalToken}`, `${prefix}_portal.png`);
  await takeScreenshot(page, `${BASE_URL}/blog`, `${prefix}_blog.png`);
  await takeScreenshot(page, `${BASE_URL}/blog/pricing-strategy-for-freelance-hairstylists`, `${prefix}_blog_post.png`);
  await takeScreenshot(page, `${BASE_URL}/faq`, `${prefix}_faq.png`);
  await takeScreenshot(page, `${BASE_URL}/resources`, `${prefix}_resources.png`);

  // Admin login page (no token set)
  await takeScreenshot(page, `${BASE_URL}/admin`, `${prefix}_admin_login.png`);

  // Admin dashboard (set token in localStorage then navigate)
  await page.evaluate((token) => {
    localStorage.setItem("adminToken", token);
  }, adminToken);
  await page.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle", timeout: 15000 }).catch(() =>
    page.goto(`${BASE_URL}/admin`, { waitUntil: "domcontentloaded", timeout: 15000 })
  );
  await page.waitForTimeout(2000); // Wait for dashboard data to load
  await page.screenshot({
    path: `${SCREENSHOTS_DIR}/${prefix}_admin_dashboard.png`,
    fullPage: true,
  });

  await page.close();
}

async function main() {
  console.log("[Screenshots] Starting screenshot generation...\n");

  // Ensure screenshots directory exists and is clean
  const { rmSync, mkdirSync } = await import("fs");
  try { rmSync(SCREENSHOTS_DIR, { recursive: true }); } catch {}
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  // Seed test data
  console.log("[Screenshots] Seeding test data...");
  seedTestData();

  // Create dummy ebook files if they don't exist (for download validation)
  const epubPath = `${import.meta.dir}/../private/CurlsAndContemplation.epub`;
  const pdfPath = `${import.meta.dir}/../private/CurlsAndContemplation.pdf`;
  if (!(await Bun.file(epubPath).exists())) {
    await Bun.write(epubPath, "placeholder epub for testing");
  }
  if (!(await Bun.file(pdfPath).exists())) {
    await Bun.write(pdfPath, "placeholder pdf for testing");
  }

  // Launch browser
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // ==========================================
  // STATE A: Pre-Order (release 30 days from now)
  // ==========================================
  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  console.log(`\n[Screenshots] STATE A: Pre-Order (RELEASE_DATE=${futureDate})`);

  let server = startServer(futureDate);
  await waitForServer(BASE_URL);

  const adminTokenA = await adminLogin();
  console.log("[Screenshots] Admin logged in for State A");

  await takeStateScreenshots(browser, "A_preorder", PREORDER_PORTAL_TOKEN, adminTokenA);
  console.log("[Screenshots] State A complete\n");

  server.kill();
  await Bun.sleep(1000);

  // Re-seed data (fresh DB for state B since server.ts re-creates tables)
  seedTestData();

  // ==========================================
  // STATE B: Post-Launch (release 30 days ago)
  // ==========================================
  const pastDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  console.log(`[Screenshots] STATE B: Post-Launch (RELEASE_DATE=${pastDate})`);

  server = startServer(pastDate);
  await waitForServer(BASE_URL);

  const adminTokenB = await adminLogin();
  console.log("[Screenshots] Admin logged in for State B");

  await takeStateScreenshots(browser, "B_postlaunch", POSTLAUNCH_PORTAL_TOKEN, adminTokenB);
  console.log("[Screenshots] State B complete\n");

  server.kill();
  await browser.close();

  // Verify screenshots
  const { readdirSync } = await import("fs");
  const files = readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith(".png")).sort();
  console.log(`[Screenshots] Generated ${files.length} screenshots:`);
  files.forEach(f => console.log(`  ${f}`));

  if (files.length < 22) {
    console.error(`\n[Screenshots] WARNING: Expected 22 screenshots, got ${files.length}`);
    process.exit(1);
  }

  console.log("\n[Screenshots] All screenshots generated successfully!");
}

main().catch((err) => {
  console.error("[Screenshots] Fatal error:", err);
  process.exit(1);
});
