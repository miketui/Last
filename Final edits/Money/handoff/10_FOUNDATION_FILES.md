# Foundation Files — Curls & Contemplation

Paste-ready file contents. Every file below either creates net-new or replaces a stub. File paths are absolute within the `Last/` repo.

---

## 1. `web/public/robots.txt`

```
# Curls & Contemplation — robots.txt
User-agent: *
Disallow: /admin
Disallow: /admin/
Disallow: /portal/
Disallow: /download/
Disallow: /api/
Disallow: /thank-you
Disallow: /checkout
Allow: /

# Optional: block LLM crawlers (toggle via LLM_CRAWLERS_ALLOWED env)
User-agent: GPTBot
Disallow: /
User-agent: CCBot
Disallow: /
User-agent: anthropic-ai
Disallow: /
User-agent: Google-Extended
Disallow: /

Sitemap: https://curlsandcontemplation.com/sitemap.xml
```

---

## 2. `web/scripts/build-sitemap.ts`

```ts
// web/scripts/build-sitemap.ts
// Generates web/public/sitemap.xml at build time.
import { writeFileSync } from "node:fs";
import { bookData } from "../lib/book-data";

const ORIGIN = process.env.SITE_URL ?? "https://curlsandcontemplation.com";
const today = new Date().toISOString().slice(0, 10);

type Route = { path: string; priority: number; changefreq: string };
const routes: Route[] = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/book", priority: 0.9, changefreq: "monthly" },
  { path: "/chapters", priority: 0.8, changefreq: "monthly" },
  { path: "/blog", priority: 0.7, changefreq: "weekly" },
  { path: "/faq", priority: 0.8, changefreq: "monthly" },
  { path: "/about", priority: 0.8, changefreq: "monthly" },
  { path: "/resources", priority: 0.7, changefreq: "monthly" },
  { path: "/privacy", priority: 0.3, changefreq: "yearly" },
  { path: "/terms", priority: 0.3, changefreq: "yearly" },
  { path: "/refund-policy", priority: 0.3, changefreq: "yearly" },
  { path: "/preorder-policy", priority: 0.3, changefreq: "yearly" },
  { path: "/digital-delivery-policy", priority: 0.3, changefreq: "yearly" },
  { path: "/cookies", priority: 0.3, changefreq: "yearly" },
  { path: "/accessibility", priority: 0.3, changefreq: "yearly" },
];

const chapterSlugs = [
  "unveiling-your-creative-odyssey",
  "refining-your-creative-toolkit",
  "reigniting-your-creative-fire",
  "the-art-of-networking-in-freelance-hairstyling",
  "cultivating-creative-excellence-through-mentorship",
  "mastering-the-business-of-hairstyling",
  "embracing-wellness-and-self-care",
  "advancing-skills-through-continuous-education",
  "stepping-into-leadership",
  "crafting-enduring-legacies",
  "advanced-digital-strategies-for-freelance-hairstylists",
  "financial-wisdom-building-sustainable-ventures",
  "embracing-ethics-and-sustainability-in-hairstyling",
  "the-impact-of-ai-on-the-beauty-industry",
  "cultivating-resilience-and-well-being-in-hairstyling",
  "tresses-and-textures-embracing-diversity-in-hairstyling",
];
for (const slug of chapterSlugs) {
  routes.push({ path: `/chapter/${slug}`, priority: 0.6, changefreq: "monthly" });
}

const blogSlugs = [
  "pricing-strategy-for-freelance-hairstylists",
  "networking-secrets-for-hairstylists",
  "overcoming-creative-burnout",
];
for (const slug of blogSlugs) {
  routes.push({ path: `/blog/${slug}`, priority: 0.6, changefreq: "weekly" });
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) =>
      `  <url>
    <loc>${ORIGIN}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

writeFileSync("./public/sitemap.xml", xml);
console.log(`✓ sitemap.xml — ${routes.length} routes`);
```

Wire into `package.json`:

```json
"scripts": {
  "build:sitemap": "bun run scripts/build-sitemap.ts",
  "build": "bun run scripts/build-meta.ts && bun run scripts/build-sitemap.ts && bun build server.ts ..."
}
```

---

## 3. `web/lib/seo.ts`

```ts
// web/lib/seo.ts
// Helmet helpers for per-route <head>.
export interface SeoProps {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  ogType?: "website" | "article" | "book" | "product";
  noindex?: boolean;
  twitter?: { card?: "summary" | "summary_large_image"; site?: string };
}

const ORIGIN = process.env.SITE_URL ?? "https://curlsandcontemplation.com";

export function seoTags(p: SeoProps) {
  const og = p.ogImage ?? "/og/home.png";
  const twitter = p.twitter ?? { card: "summary_large_image" };
  return `
<title>${escape(p.title)}</title>
<meta name="description" content="${escape(p.description)}">
<link rel="canonical" href="${p.canonical}">
${p.noindex ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow">'}
<meta property="og:title" content="${escape(p.title)}">
<meta property="og:description" content="${escape(p.description)}">
<meta property="og:url" content="${p.canonical}">
<meta property="og:image" content="${ORIGIN}${og}">
<meta property="og:type" content="${p.ogType ?? "website"}">
<meta property="og:site_name" content="Curls & Contemplation">
<meta name="twitter:card" content="${twitter.card}">
${twitter.site ? `<meta name="twitter:site" content="${twitter.site}">` : ""}
<meta name="twitter:title" content="${escape(p.title)}">
<meta name="twitter:description" content="${escape(p.description)}">
<meta name="twitter:image" content="${ORIGIN}${og}">
  `.trim();
}

function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
```

---

## 4. `web/lib/jsonld.ts`

```ts
// web/lib/jsonld.ts
// schema.org JSON-LD blocks per surface.
import { bookData } from "./book-data";

const ORIGIN = process.env.SITE_URL ?? "https://curlsandcontemplation.com";

export const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TAYLKOMB LLC",
  url: "https://taylkomb.com",
  logo: `${ORIGIN}/og/taylkomb-logo.png`,
  founder: { "@type": "Person", name: "Michael David Warren Jr." },
};

export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Michael David Warren Jr.",
  alternateName: "Michael David",
  url: ORIGIN + "/about",
  sameAs: ["https://michaeldavidjr.beauty"],
  jobTitle: "Author, Hairstylist",
  affiliation: { "@type": "Organization", name: "TAYLKOMB LLC" },
};

export function bookJsonLd(launchState: "preorder" | "available") {
  return {
    ...bookData.schemaSeed,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: launchState === "preorder" ? bookData.pricing.launchUSD : bookData.pricing.regularUSD,
      availability: launchState === "preorder"
        ? "https://schema.org/PreOrder"
        : "https://schema.org/InStock",
      url: `${ORIGIN}/book`,
    },
  };
}

export function articleJsonLd(p: {
  title: string;
  slug: string;
  description: string;
  datePublished: string;
  image: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description: p.description,
    image: `${ORIGIN}${p.image}`,
    datePublished: p.datePublished,
    author: personJsonLd,
    publisher: orgJsonLd,
    mainEntityOfPage: `${ORIGIN}/blog/${p.slug}`,
  };
}

export function faqJsonLd(qa: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map((x) => ({
      "@type": "Question",
      name: x.question,
      acceptedAnswer: { "@type": "Answer", text: x.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((x, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: x.name,
      item: x.url,
    })),
  };
}

export function jsonLdScript(obj: object): string {
  return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
}
```

---

## 5. `web/lib/supabase.ts`

```ts
// web/lib/supabase.ts
// Signed-URL EPUB/PDF delivery. Bucket is private.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

export async function signedEpubUrl(): Promise<string> {
  const { data, error } = await supabase.storage
    .from("curls-deliverables")
    .createSignedUrl("books/curls-and-contemplation/v4.epub", 86400);  // 24h TTL
  if (error || !data) throw new Error("Signed URL failed: " + error?.message);
  return data.signedUrl;
}

export async function signedPdfUrl(): Promise<string> {
  const { data, error } = await supabase.storage
    .from("curls-deliverables")
    .createSignedUrl("books/curls-and-contemplation/pod-6x9.pdf", 86400);
  if (error || !data) throw new Error("Signed URL failed: " + error?.message);
  return data.signedUrl;
}
```

---

## 6. `web/lib/mailerlite.ts`

```ts
// web/lib/mailerlite.ts
// Primary CRM. Replaces lib/mailchimp.ts.
const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY!;
const BASE = "https://connect.mailerlite.com/api";

async function ml<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${MAILERLITE_API_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!r.ok) throw new Error(`MailerLite ${path}: ${r.status} ${await r.text()}`);
  return r.json() as Promise<T>;
}

export async function addSubscriber(email: string, name: string | undefined, groupId: string) {
  return ml(`/subscribers`, {
    method: "POST",
    body: JSON.stringify({
      email,
      fields: { name: name ?? "" },
      groups: [groupId],
    }),
  });
}

export async function tagSubscriber(email: string, groupId: string) {
  // assign existing subscriber to additional group
  return ml(`/subscribers/${encodeURIComponent(email)}/groups/${groupId}`, { method: "POST" });
}

export async function removeFromGroup(email: string, groupId: string) {
  return ml(`/subscribers/${encodeURIComponent(email)}/groups/${groupId}`, { method: "DELETE" });
}

export async function createBroadcast(p: { name: string; subject: string; from: string; html: string; groups: string[] }) {
  return ml(`/campaigns`, {
    method: "POST",
    body: JSON.stringify({
      name: p.name,
      type: "regular",
      emails: [{ subject: p.subject, from: p.from, content: p.html, type: "html" }],
      groups: p.groups,
    }),
  });
}
```

---

## 7. `web/lib/substack-sync.ts`

```ts
// web/lib/substack-sync.ts
// Poll Substack RSS, dedupe by GUID, stage MailerLite broadcasts.
import { Database } from "bun:sqlite";

const db = new Database(process.env.DATABASE_URL ?? "./data/site.db");
const SUBSTACK_FEED = process.env.SUBSTACK_FEED_URL!;  // e.g., https://michaeldavid.substack.com/feed

interface Item {
  guid: string;
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

export async function pollSubstack(): Promise<Item[]> {
  const r = await fetch(SUBSTACK_FEED, {
    headers: { "User-Agent": "Curls-Contemplation-Sync/1.0" },
  });
  if (!r.ok) throw new Error(`Substack RSS: ${r.status}`);
  const xml = await r.text();
  return parseRss(xml);
}

function parseRss(xml: string): Item[] {
  // minimal parser; production uses a hardened RSS lib
  const items: Item[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRe.exec(xml))) {
    const block = m[1];
    items.push({
      guid:        extract(block, /<guid[^>]*>([\s\S]*?)<\/guid>/),
      title:       cleanCdata(extract(block, /<title>([\s\S]*?)<\/title>/)),
      link:        extract(block, /<link>([\s\S]*?)<\/link>/),
      pubDate:     extract(block, /<pubDate>([\s\S]*?)<\/pubDate>/),
      description: cleanCdata(extract(block, /<description>([\s\S]*?)<\/description>/)),
    });
  }
  return items;
}

function extract(s: string, re: RegExp): string { const m = re.exec(s); return m ? m[1].trim() : ""; }
function cleanCdata(s: string): string { return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "").trim(); }

export async function syncToMailerLite() {
  const items = await pollSubstack();
  for (const it of items) {
    const seen = db.query("SELECT id FROM posts_substack WHERE guid = ?").get(it.guid);
    if (seen) continue;
    db.run(
      "INSERT INTO posts_substack (id, guid, title, slug, url, published_at, synced_to_mailerlite, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))",
      crypto.randomUUID(),
      it.guid,
      it.title,
      slugify(it.title),
      it.link,
      it.pubDate,
    );
    // STAGE only — manual approval required before broadcast (Phase 12 gate)
    console.log("staged for approval:", it.title);
  }
}

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
```

---

## 8. `web/lib/consent.ts`

```ts
// web/lib/consent.ts
// CCPA/CPRA consent state. Gated until user opts in.
type ConsentState = { analytics: boolean; marketing: boolean; ts: number; version: "v1" };

const KEY = "curls.consent.v1";
const CURRENT_VERSION = "v1";

export function getConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(KEY) ?? "null"); } catch { return null; }
}

export function setConsent(p: { analytics: boolean; marketing: boolean }) {
  const next: ConsentState = { ...p, ts: Date.now(), version: CURRENT_VERSION };
  localStorage.setItem(KEY, JSON.stringify(next));
  // also persist to server for the consent_log table
  fetch("/api/consent", { method: "POST", body: JSON.stringify(next), headers: { "Content-Type": "application/json" } }).catch(() => {});
  // fire GA4 consent update
  (window as any).gtag?.("consent", "update", {
    analytics_storage: p.analytics ? "granted" : "denied",
    ad_storage: p.marketing ? "granted" : "denied",
  });
}

export function isAnalyticsOn() { return !!getConsent()?.analytics; }
export function isMarketingOn() { return !!getConsent()?.marketing; }
```

---

## 9. `web/.env.example` (extended)

```
# ============================================================
# Curls & Contemplation — environment variable NAMES only.
# Real values set per environment in Vercel Local / Preview / Production.
# ============================================================

# --- Site ---
SITE_URL=
RELEASE_DATE=
LLM_CRAWLERS_ALLOWED=false

# --- Stripe (primary commerce) ---
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PREORDER=
STRIPE_PRICE_ID_REGULAR=

# --- Resend (transactional email) ---
RESEND_API_KEY=
FROM_EMAIL=hello@curlsandcontemplation.com
FROM_NAME=Michael David
PHYSICAL_ADDRESS=

# --- MailerLite (primary CRM) ---
MAILERLITE_API_KEY=
MAILERLITE_GROUP_SUBSCRIBERS=
MAILERLITE_GROUP_PRICING_KIT=
MAILERLITE_GROUP_SAMPLE_CHAPTER=
MAILERLITE_GROUP_PREORDERS=
MAILERLITE_GROUP_POSTORDER=
MAILERLITE_GROUP_REFUNDED=
MAILERLITE_GROUP_SUBSTACK_SYNCED=

# --- Supabase (private storage + signed URLs) ---
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_BUCKET=curls-deliverables

# --- Substack sync ---
SUBSTACK_FEED_URL=

# --- Cloudflare Turnstile ---
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# --- Analytics + monitoring ---
GA4_MEASUREMENT_ID=
SENTRY_DSN=
DATADOG_API_KEY=
DATADOG_APP_KEY=

# --- 21st.dev Magic (build-time, not app runtime) ---
TWENTYFIRST_API_KEY=

# --- Admin ---
ADMIN_USERNAME=
ADMIN_PASSWORD=
ADMIN_API_KEY=
DOWNLOAD_TOKEN_SECRET=
CRON_SECRET=

# --- Deprecated (kept for 30d migration window only) ---
# MAILCHIMP_API_KEY=
# MAILCHIMP_SERVER_PREFIX=
# MAILCHIMP_LIST_ID=
```

---

## 10. `web/vercel.json` (updated)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "bun install && bun run scripts/build-meta.ts && bun run scripts/build-sitemap.ts && bun build server.ts --target=bun --outfile=dist/server.js",
  "outputDirectory": "dist",
  "framework": null,
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' https://js.stripe.com https://challenges.cloudflare.com https://www.googletagmanager.com 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' https: data: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.stripe.com https://api.mailerlite.com https://*.supabase.co https://www.google-analytics.com; frame-src https://js.stripe.com https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self'" }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    },
    {
      "source": "/(admin|portal|download)(.*)",
      "headers": [
        { "key": "X-Robots-Tag", "value": "noindex, nofollow" }
      ]
    }
  ],
  "crons": [
    { "path": "/api/cron/process-emails",   "schedule": "*/5 * * * *" },
    { "path": "/api/cron/release-ebook",    "schedule": "0 9 * * *" },
    { "path": "/api/cron/substack-sync",    "schedule": "0 */6 * * *" },
    { "path": "/api/cron/token-cleanup",    "schedule": "0 3 * * *" }
  ]
}
```

---

## 11. Migration SQL (apply via Supabase + local SQLite)

`web/migrations/2026-05-22-v2-launch.sql`:

```sql
-- Curls & Contemplation v2 — schema migration (2026-05-22)
-- Applies to local SQLite (web/) and is mirrored to Supabase if used as primary DB.

-- New tables
CREATE TABLE IF NOT EXISTS posts_substack (
  id TEXT PRIMARY KEY,
  guid TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  url TEXT NOT NULL,
  published_at TEXT NOT NULL,
  synced_to_mailerlite INTEGER NOT NULL DEFAULT 0,
  broadcast_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS consent_log (
  id TEXT PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  analytics_consent INTEGER NOT NULL,
  marketing_consent INTEGER NOT NULL,
  region TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS gate_ledger (
  id TEXT PRIMARY KEY,
  gate_name TEXT NOT NULL,
  approved_by TEXT NOT NULL,
  scope_approved TEXT NOT NULL,
  approved_at TEXT NOT NULL DEFAULT (datetime('now')),
  notes TEXT
);

-- Altered tables
ALTER TABLE download_tokens ADD COLUMN supabase_path TEXT;
ALTER TABLE download_tokens ADD COLUMN signed_url_expires_at TEXT;
ALTER TABLE subscribers     ADD COLUMN mailerlite_subscriber_id TEXT;
ALTER TABLE subscribers     ADD COLUMN mailerlite_groups TEXT;
ALTER TABLE orders          ADD COLUMN launch_state TEXT;
ALTER TABLE orders          ADD COLUMN price_tier TEXT;

CREATE INDEX IF NOT EXISTS idx_posts_substack_guid ON posts_substack(guid);
CREATE INDEX IF NOT EXISTS idx_consent_log_created ON consent_log(created_at);
CREATE INDEX IF NOT EXISTS idx_gate_ledger_name    ON gate_ledger(gate_name);
```

---

## 12. `web/scripts/verify-build.sh`

```bash
#!/usr/bin/env bash
# web/scripts/verify-build.sh — pre-deploy gates.
set -euo pipefail

echo "=== Curls verify-build.sh ==="

# 1. Secrets must not be in repo
if git ls-files | xargs grep -lE 'sk_live_|whsec_[a-zA-Z0-9]{20,}|SUPABASE_SERVICE_ROLE_KEY=' 2>/dev/null; then
  echo "✗ committed secret detected"; exit 1
fi

# 2. Legacy palette must not appear in production files
if grep -rIE '#2B9999|#C9A961' web/styles web/components web/frontend.tsx 2>/dev/null; then
  echo "✗ legacy palette remains"; exit 1
fi

# 3. EPUB must be V4
if ! grep -q 'CurlsAndContemplationV4.epub' web/lib/book-data.ts; then
  echo "✗ book-data.ts not pointed at V4"; exit 1
fi
if grep -E 'CurlsAndContemplation(V2|V3)?\.epub' web/lib/book-data.ts; then
  echo "✗ stale EPUB reference in book-data.ts"; exit 1
fi

# 4. Required legal routes must be defined
for route in privacy terms refund-policy preorder-policy digital-delivery-policy cookies accessibility; do
  if ! grep -q "\"/${route}\"" web/server.ts; then
    echo "✗ /${route} route missing"; exit 1
  fi
done

# 5. ENV vars required for production
for var in STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET STRIPE_PRICE_ID_PREORDER STRIPE_PRICE_ID_REGULAR \
           RESEND_API_KEY MAILERLITE_API_KEY SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY \
           TURNSTILE_SECRET_KEY DOWNLOAD_TOKEN_SECRET CRON_SECRET; do
  if [[ -z "${!var:-}" ]]; then echo "✗ env $var unset"; exit 1; fi
done

# 6. ACISS tokens build
( cd packages/aciss-tokens && npm run build && npm run verify )

# 7. Type + tests
( cd web && bun run tsc --noEmit && bun test )

echo "✓ all verify gates green"
```

Run via `vercel.json` `buildCommand` or manually before deploy.

---

## 13. CSP `connect-src` allowlist rationale

| Domain | Reason |
|---|---|
| `https://api.stripe.com` | Payment intents, prices, refunds |
| `https://api.mailerlite.com` | Subscriber add/tag/group sync |
| `https://*.supabase.co` | Signed URL fetch + JWT |
| `https://www.google-analytics.com` | GA4 hits (consent-gated) |

Anything else added to `connect-src` requires a `security-legal-qa` review.

---

*All files above are paste-ready. Pre-commit hooks defined in `04_BOOK_DATA_PATCH.md` and `03_ACISS_TOKENS_SPEC.md` keep them from drifting.*
