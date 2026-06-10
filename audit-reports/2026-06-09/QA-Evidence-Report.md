# QA Evidence Report — Curls & Contemplation FINAL Files
**Date:** June 9, 2026 · **Auditor:** Claude (forensic pipeline, all findings tool-verified this session)
**Files:** `Curls-and-Contemplation-FINAL.epub` (9.96 MB) · `Curls-and-Contemplation-POD-Royal-6_69x9_61-FINAL.pdf` (9.92 MB, 480 pp)
**Build timestamp (both files):** 2026-06-10T04:12Z — built hours before this audit. This is a NEW build, not the previously validated V7 (334 pp).

## VERDICT: NO-GO — 2 launch-blocking items, both decisions only you can make

---

## Stage 1 — Investigation (ground truth)

| Property | EPUB | PDF |
|---|---|---|
| Format | EPUB 3.0, 84 files, 48 spine items | PDF 1.6, Ghostscript 10.02.1 producer |
| Pages / TOC | nav 40 = NCX 40 (parity ✓) | 480 pages |
| Trim | — | 481.92 × 691.92 pt = **6.6933" × 9.6100"** exact (KDP-supported 6.69×9.61 trim, no bleed — design uses inset panels, so bleed not required) |
| Fonts | 6 WOFF2 (Libre Baskerville ×3, Montserrat ×2, Cinzel Decorative) | 622 instances: 420 TrueType, 198 CID TrueType, 4 Type 3 — **0 non-embedded** |
| Identifier | `urn:uuid:b815780c-…` (UUID, **no ISBN**) | **No ISBN anywhere** (verified: 0 matches in full text) |
| Author/metadata | Pen name "Michael David" public, legal name in copyright ✓ | Copyright page correct, no ISBN block |
| Word count | ~81,978 | — |

## Stage 2 — Validation

**EPUB structural audit (custom epubcheck-equivalent — see caveat): 0 errors / 0 warnings**
- mimetype first + STORED ✓ · all 84 XML/XHTML files well-formed ✓ · manifest ↔ zip parity ✓ (no missing, no undeclared)
- All spine idrefs valid ✓ · exactly 1 nav doc ✓ · 1 cover-image property ✓
- **0 broken internal links, 0 broken fragments, 0 broken image refs, 0 missing CSS/font URLs, 0 images missing alt**
- Accessibility metadata block present (schema.org access modes, hazards: none) ✓

⚠️ **Caveat:** official epubcheck could NOT run — the sandbox egress proxy blocked GitHub, Maven Central, PyPI, npm, and apt (`x-deny-reason: host_not_allowed` despite "Allowed Domains: *"). You can update network settings in this environment, or run `epubcheck` locally — the audit above covers the major error classes but is not the official 0/0/0/0.

**PDF print audit:**
- All 16 chapter openers + all 4 part openers land on **recto (odd) pages** — 20/20 ✓
- TOC page-number accuracy: 5/5 spot checks MATCH (pp. 49, 69, 81, 133, 211) ✓
- Drop caps render on chapter openers ✓ · folios hidden on opener pages ✓ · folio bottom-center on body pages ✓
- Dark-panel census: **28 of 480 pages** dark (preface, chapter-opener spreads, conclusion) — ~6%, acceptable POD ink coverage
- **No running headers anywhere** — deviation from your locked standard (title verso / chapter recto)
- Front matter uses **continuous Arabic folios** (Dedication = p7, Ch I = p19) — deviation from your locked standard (Roman front matter, Ch1 = page 1 recto)
- PDF is not tagged (accessibility) — normal for POD interiors

## Stage 3 — Edit-pass text QA

- Placeholders (ISBN-X, TK, TODO, lorem, [INSERT…]): **0 in both files**
- Straight quotes in body: **0** · Mojibake/encoding artifacts: **0** · Double spaces (PDF): **0** · Spaced ellipses: **0**
- "Hyphen-as-dash" hits (44) are all inside `<title>` tags ("Chapter IV - Curls & Contemplation") — invisible to readers, cosmetic only
- Bibliography: 88 external URLs present in EPUB ✓

## Stage 4 — Playwright render verification

- Chapter I, nav.xhtml, QuizKey rendered headless Chromium: **zero console errors, zero failed resource requests**
- `document.fonts`: Libre Baskerville + Cinzel Decorative `loaded` ✓
- Drop cap, scripture blockquote, gold rules, footnote superscript links all render in flow ✓

## Brand / design-system finding (Tier 1)

CSS color census of the production stylesheets:
- Teal in use: **`#008080`** (×9) — not Deep Jade `#145B4B`, and not even the retired `#2B9999`
- Gold in use: **`#d4af37`** (×3) — not Antique Gold `#B08D57`
- **Zero ACISS tokens appear in any stylesheet.** Print PDF chapter badges sample at `#47B9B1` (teal family). "Black leads. Gold elevates. Jade distinguishes" is not what these files implement.

## Blocker list (full detail in Pre-Mortem registry)

1. **ISBN — LAUNCH-BLOCKING.** The old "placeholder" blocker was resolved by *deletion*, not insertion. No ISBN exists in either file. KDP paperback requires an ISBN at upload. If using KDP's free ISBN, the interior can legally stay as-is (decide consciously); if you own Bowker ISBNs, the copyright page and EPUB `dc:identifier` must carry them before upload.
2. **ACISS regression — LAUNCH-BLOCKING decision.** Either ratify `#008080`/`#d4af37` as the book's final art direction (overriding ACISS for this product) or rebuild CSS tokens. Ship-with-intent, not by accident.
3. **Official epubcheck — FAST-FOLLOW gate.** Run locally before upload; this build is hours old and has never passed the official validator.
4. **Cover wrap** (known, out of scope for these files): back+spine still required for KDP paperback.
