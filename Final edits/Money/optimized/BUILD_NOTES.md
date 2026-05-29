# Optimized Publication Build — Curls & Contemplation

Page-by-page styling/layout pass focused on reducing the print-on-demand page
count, fixing layout/formatting issues, and producing publication-ready files.

## Artifacts

| File | Format | Spec |
|---|---|---|
| `Curls-and-Contemplation-POD-Royal-6.69x9.61-INTERIOR.pdf` | Print interior | KDP **Royal 6.69 × 9.61 in**, **464 pages**, all fonts embedded, page numbers |
| `Curls-and-Contemplation-PUBLICATION.epub` | Reflowable EPUB | EPUB 3.3, **0 EPUBCheck errors/warnings** |

Checksums in `SHA256SUMS.txt`.

## Headline results

- **POD page count: 607 → 464** (target was < 490). ✅
- **Blank pages: ~78 (original canonical) / 33 (interim) → 0.** ✅
- Trim: 6.69 × 9.61 in (KDP Royal). ✅
- **All fonts embedded** (KDP requirement; the folio overlay embeds Montserrat). ✅
- Continuous page-number folios (suppressed on front-matter display pages,
  standalone quote pages, and chapter/part title openers). ✅
- EPUB passes EPUBCheck 5.1.0 (EPUB 3.3) with no errors or warnings. ✅

## What changed (source)

All edits are in `Final edits/OEBPS/` (the canonical EPUB source).

`style/print.css`
- Tightened body typography (10.5pt, line-height 1.34) and heading/box spacing.
- Removed `break-after: page` on quizzes / worksheets / image-quotes (these were
  manufacturing a trailing blank page before each following section).
- Reset screen `min-height: 100vh/90vh` full-page shells to `0` for print — the
  page box (9.61in) is taller than the text area (~8.11in), so `100vh` had been
  overflowing every such page onto a near-empty second page.
- Added `box-sizing: border-box` and neutralized `break-before` on each file's
  first element (per-file render no longer emits a leading blank).
- Hid web-only "Download the Worksheet Pack" CTAs in print (they often occupied
  an otherwise blank page).
- Compressed quiz and worksheet typography so each fits a single page.
- Fixed the title-page heading overflow (`body.title-page-body h1.main-title`
  was 4.5rem ≈ 47pt and ran "CONTEMPLATION" off both edges → 17pt, black).

`xhtml/9-chapter-i-...xhtml`
- Moved Chapter I "Key Takeaways" out of the quiz page into the chapter content
  (the quiz page is now strictly the 4 multiple-choice questions). Other
  chapters already keep Key Takeaways in the body.

## Chapter structure (verified, all 16)

Each chapter renders as: **title-page opener** (brushstroke + roman numeral,
Cinzel title, scripture, "Introduction", drop cap) → content → endnotes →
**chapter quiz** (single page, 4 MCQ) → **chapter worksheet** (single page) →
**image-quote** (single page, last page of the chapter).

## How to rebuild

```bash
# POD interior PDF (Chromium / Skia — the canonical engine), 6.69x9.61, folios,
# blank-page removal, embedded fonts:
python3 build-pod-chromium.py  out.pdf

# Publication EPUB:
cd "Final edits"
zip -X -0 out.epub mimetype
zip -rX -9 out.epub META-INF OEBPS
```

`build-pod-prince.py` is also provided (PrinceXML 16) as an alternative engine.

## Notes / follow-ups

- Margins are uniform 0.75in left/right (KDP gutter min for a 301–500pp interior)
  and 0.6in top/bottom; Chromium print cannot alternate recto/verso gutters.
- The chapter openers and full-page image-quotes use heavy dark backgrounds by
  design (kept per direction); these are ink-heavy on a B&W interior.
- A full editorial fact-check of body copy was **not** part of this layout pass.
