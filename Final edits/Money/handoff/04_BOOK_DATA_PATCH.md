# Patch — `web/lib/book-data.ts` (FINAL EPUB metadata)

Updates the live book metadata to point at `CurlsAndContemplationV4.epub` (the FINAL, locked file) plus POD-6x9 PDF, schema.org `Book` JSON-LD seed, and the new $17.99 launch / $19.99 regular pricing.

**Scope:** money-touching surface — requires Phase 11 `[GATE: payment activation]` before going live.

---

## 1. Before — locate the export

Open `Last/web/lib/book-data.ts`. The current export looks like (approximate, per v1.0 PRD § 15):

```ts
export const bookData = {
  title: "Curls & Contemplation",
  subtitle: "A Freelance Hairstylist's Guide to Creative Excellence",
  author: "Michael David Warren",
  price: 19.99,
  epubPath: "/private/CurlsAndContemplation.epub",
  pdfPath: "/private/CurlsAndContemplation.pdf",
  releaseDate: "2026-XX-XX",
  isbn: "",
  // ... other fields
};
```

---

## 2. After — paste replacement (canonical)

Replace the export with:

```ts
// web/lib/book-data.ts
import type { Book, Person, Organization } from "schema-dts";

/**
 * Curls & Contemplation — FINAL EPUB metadata.
 * Source: CurlsAndContemplationV4.epub in repo root.
 * Locked 2026-05-22. Any change to this object requires re-approval at the
 * Strategy Lock gate; price changes require Payment Activation gate (Phase 11).
 */
export const bookData = {
  title: "Curls & Contemplation",
  subtitle: "A Freelance Hairstylist's Guide to Creative Excellence",
  author: {
    name: "Michael David Warren Jr.",
    handle: "Michael David",
    url: "https://michaeldavidjr.beauty",
  },
  publisher: {
    name: "TAYLKOMB LLC",
    url: "https://taylkomb.com",
  },

  // pricing — gated by RELEASE_DATE env, pinned to UTC (pre-mortem fix B3)
  pricing: {
    launchUSD: 17.99,                       // active until RELEASE_DATE_UTC + 14 days
    regularUSD: 19.99,                      // active from RELEASE_DATE_UTC + 15 days onward
    currency: "USD",
    stripePriceIdLaunch: process.env.STRIPE_PRICE_ID_PREORDER ?? "",
    stripePriceIdRegular: process.env.STRIPE_PRICE_ID_REGULAR ?? "",
    /**
     * Returns the active price tier for a given timestamp. All math is in UTC.
     * RELEASE_DATE is read as ISO 8601 (e.g., "2026-07-03T00:00:00Z").
     * Bundle pre-mortem fix B3: previous version did not pin TZ, allowing
     * a buyer at 11:59 PT on Day 14 vs 12:01 ET to see different prices.
     */
    activeTierAt(nowMs: number = Date.now()): "launch" | "regular" {
      const release = Date.parse(process.env.RELEASE_DATE ?? "");
      if (!Number.isFinite(release)) return "launch";  // pre-launch → always launch tier
      const cutoffMs = release + 14 * 86_400_000;       // +14 days in UTC ms
      return nowMs < cutoffMs ? "launch" : "regular";
    },
    activePriceIdAt(nowMs?: number): string {
      return this.activeTierAt(nowMs) === "launch"
        ? this.stripePriceIdLaunch
        : this.stripePriceIdRegular;
    },
  },

  // EPUB — locked file
  epub: {
    filename: "CurlsAndContemplationV4.epub",
    supabasePath: "books/curls-and-contemplation/v4.epub",  // private bucket
    bytes: 0,  // TODO: fill from `stat CurlsAndContemplationV4.epub` at build time
    mimeType: "application/epub+zip",
    epubVersion: "3.3",
    accessibility: {
      conformsTo: "EPUB Accessibility 1.1 - WCAG 2.1 Level AA",
      hazards: ["none"],
      accessModes: ["textual"],
    },
  },

  // PDF — POD-6x9 print-ready + digital read
  pdf: {
    filename: "CurlsAndContemplation-POD-6x9.pdf",
    supabasePath: "books/curls-and-contemplation/pod-6x9.pdf",
    bytes: 0,  // TODO: fill at build time
    mimeType: "application/pdf",
    pageCount: 0,  // TODO
  },

  // identifiers
  isbn13Ebook: "",      // TODO: fill once issued
  isbn13Paperback: "",  // TODO
  language: "en-US",
  pages: 0,             // TODO from PDF

  // dates — confirm at Strategy Lock gate
  releaseDate: process.env.RELEASE_DATE ?? "",   // ISO-8601 YYYY-MM-DD
  lastModified: "2026-05-22T00:00:00Z",

  // schema.org Book JSON-LD seed (rendered by web/lib/jsonld.ts)
  schemaSeed: {
    "@context": "https://schema.org",
    "@type": "Book",
    name: "Curls & Contemplation",
    alternateName: "A Freelance Hairstylist's Guide to Creative Excellence",
    bookFormat: "https://schema.org/EBook",
    inLanguage: "en-US",
    author: {
      "@type": "Person",
      name: "Michael David Warren Jr.",
      alternateName: "Michael David",
      url: "https://michaeldavidjr.beauty",
    } as Person,
    publisher: {
      "@type": "Organization",
      name: "TAYLKOMB LLC",
      url: "https://taylkomb.com",
    } as Organization,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: 17.99,
      availability: "https://schema.org/PreOrder",
      url: "https://curlsandcontemplation.com/book",
      validFrom: "2026-05-22",
      // validThrough set dynamically based on RELEASE_DATE + 14d
    },
  } satisfies Partial<Book>,

  // credibility (rendered on /, /book, /about; verified consent before going live)
  credibility: [
    "Rihanna's day-to-day hairstylist",
    "IPPY Awards submission — Category 47",
    "Trained under Guido Palau and Jimmy Paul",
  ],
} as const;

export type BookData = typeof bookData;
```

---

## 3. The 5-line minimum patch

If you want the absolute smallest diff that flips production to V4 + new pricing without the full refactor above, here is the 5-line drop-in replacement for the existing object's key lines:

```diff
- title: "Curls & Contemplation",
- price: 19.99,
- epubPath: "/private/CurlsAndContemplation.epub",
- pdfPath: "/private/CurlsAndContemplation.pdf",
- releaseDate: "2026-XX-XX",
+ title: "Curls & Contemplation",
+ pricing: { launchUSD: 17.99, regularUSD: 19.99, currency: "USD" },
+ epubPath: "/private/CurlsAndContemplationV4.epub",
+ pdfPath: "/private/CurlsAndContemplation-POD-6x9.pdf",
+ releaseDate: process.env.RELEASE_DATE ?? "",
```

Use the 5-line version only as an emergency bridge. The canonical block (§ 2) is the target.

---

## 4. Byte-size + page-count fill (build step)

Add to `web/scripts/build-meta.ts` (called from `vercel.json` `buildCommand` before bundling):

```ts
// web/scripts/build-meta.ts
import { statSync } from "node:fs";
import { writeFileSync } from "node:fs";

const epub = statSync("../CurlsAndContemplationV4.epub").size;
const pdf  = statSync("../CurlsAndContemplation-POD-6x9.pdf").size;

const out = `// generated — do not edit
export const fileSizes = { epub: ${epub}, pdf: ${pdf} } as const;
`;

writeFileSync("./lib/file-sizes.generated.ts", out);
console.log(`✓ EPUB ${(epub/1e6).toFixed(2)}MB · PDF ${(pdf/1e6).toFixed(2)}MB`);
```

Then in `book-data.ts`:

```ts
import { fileSizes } from "./file-sizes.generated";
// ...
epub: { ...bookData.epub, bytes: fileSizes.epub },
pdf:  { ...bookData.pdf,  bytes: fileSizes.pdf  },
```

---

## 5. Acceptance checks (post-patch)

```bash
# typecheck
cd Last/web && bun run tsc --noEmit

# unit test (server.test.ts asserts pricing + paths)
bun test --filter book-data

# preview build
bun --hot server.ts
# visit http://localhost:3000/book
# confirm: price reads $17.99, JSON-LD has Book@PreOrder, og:title carries V4

# Stripe test charge
# - use test card 4242 4242 4242 4242
# - verify webhook fires with metadata.product=curls-ebook, launch_state=preorder
# - verify Supabase signed URL serves CurlsAndContemplationV4.epub
```

### Required real tests in `web/server.test.ts` (pre-mortem fix B7)

The previous version of this bundle treated Stripe webhook signature verification
as a checklist item. The fix is a real failing test. Add:

```ts
// web/server.test.ts
import { expect, test } from "bun:test";
import Stripe from "stripe";

test("rejects webhook with bad signature (B7)", async () => {
  const fakePayload = JSON.stringify({ id: "evt_test_bad", type: "payment_intent.succeeded" });
  const res = await fetch("http://localhost:3000/api/stripe/webhooks", {
    method: "POST",
    headers: { "stripe-signature": "t=1,v1=deadbeef", "Content-Type": "application/json" },
    body: fakePayload,
  });
  expect(res.status).toBe(400);
});

test("accepts webhook with valid signature (B7)", async () => {
  const payload = JSON.stringify({ id: "evt_test_good", type: "payment_intent.succeeded", data: {} });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
  const sig = stripe.webhooks.generateTestHeaderString({
    payload, secret: process.env.STRIPE_WEBHOOK_SECRET!,
  });
  const res = await fetch("http://localhost:3000/api/stripe/webhooks", {
    method: "POST",
    headers: { "stripe-signature": sig, "Content-Type": "application/json" },
    body: payload,
  });
  expect(res.status).toBeLessThan(300);
});

test("pricing tier flips at RELEASE_DATE + 14d UTC (B3)", () => {
  process.env.RELEASE_DATE = "2026-07-03T00:00:00Z";
  const launch = bookData.pricing.activeTierAt(Date.UTC(2026, 6, 16, 23, 59, 59));
  const regular = bookData.pricing.activeTierAt(Date.UTC(2026, 6, 17, 0, 0, 1));
  expect(launch).toBe("launch");
  expect(regular).toBe("regular");
});
```

CI fails the Phase 11 gate if any of these tests are missing or red. The Phase 11
`[GATE: payment activation]` cannot close without all three green in CI.

---

## 6. Migration of stale references

After landing the patch, run:

```bash
# find any code still pointing at V1
grep -r "CurlsAndContemplation.epub" web/ Final\ edits/MONEY/ pdf/ pub/
grep -r "CurlsAndContemplationV2" web/
grep -r "CurlsAndContemplationV3" web/
# expect: no matches in web/lib/, web/server.ts, web/frontend.tsx
# V2/V3/V4 may remain referenced in build scripts (pub/, pdf/) for archive — leave them
```

If any stale path remains in `web/`, the codemod from `03_ACISS_TOKENS_SPEC.md § 5` doesn't cover it — patch manually.

---

## 7. Backup before patching

```bash
git checkout -b feat/v4-epub-metadata
cp web/lib/book-data.ts web/lib/book-data.v1-backup.ts
# patch
git add web/lib/book-data.ts web/lib/book-data.v1-backup.ts
git commit -m "feat(book-data): point at CurlsAndContemplationV4.epub + ACISS pricing tiers"
```

Open the PR. Run `engineering:code-review` skill before merge. Approval recorded against the Architecture Lock gate (Phase 5).

---

*This patch ships money-touching metadata. Approval required at Phase 11 `[GATE: payment activation]` before pushing live. Test-mode acceptance check in § 5 must pass first.*
