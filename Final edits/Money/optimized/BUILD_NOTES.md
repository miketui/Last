# Optimized Publication Build — Curls & Contemplation

Page-by-page styling/layout pass focused on reducing the print-on-demand page
count, fixing layout/formatting issues, and producing publication-ready files.

## Artifacts

| File | Format | Spec |
|---|---|---|
| `Curls-and-Contemplation-POD-Royal-6.69x9.61-INTERIOR.pdf` | Print interior | KDP **Royal 6.69 × 9.61 in**, **465 pages**, all fonts embedded, **true grayscale (B&W)**, page numbers, page-numbered TOC |
| `Curls-and-Contemplation-PUBLICATION.epub` | Reflowable EPUB | EPUB 3.3, **0 EPUBCheck errors/warnings** |

Checksums in `SHA256SUMS.txt`.

## Headline results

- **POD page count: 607 → 465** (target was < 490). ✅
- **Blank pages: ~78 (original canonical) / 33 (interim) → 0.** ✅
- Trim: 6.69 × 9.61 in (KDP Royal). ✅
- **All fonts embedded** (KDP requirement; the folio overlay embeds Montserrat). ✅
- Continuous page-number folios (suppressed on front-matter display pages,
  standalone quote pages, and chapter/part title openers). ✅
- **Print TOC now carries page numbers** (auto-generated from the build's page
  map via `inject-toc-folios.py`; hidden in the reflowable EPUB). ✅
- **Copyright page completed**: legal © holder (Michael David Warren Jr.,
  written as Michael David), First Edition line, ISBN placeholders, liability
  disclaimer, "Printed in the United States of America". ✅
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
# blank-page removal, embedded fonts. Writes page-map.json alongside the PDF:
python3 build-pod-chromium.py  out.pdf

# Refresh the print TOC page numbers from the latest build, then rebuild once
# more so the TOC reflects final pagination (it converges in one pass):
python3 inject-toc-folios.py            # reads page-map.json from the build above
python3 build-pod-chromium.py  out.pdf  # 2nd pass: bakes injected TOC folios into final PDF

# Finalize the interior: embed fonts, 300dpi, and convert to TRUE GRAYSCALE so
# KDP prints a predictable B&W interior (no auto-conversion surprises, no color
# pricing). This is the canonical interior PDF:
gs -dBATCH -dNOPAUSE -sDEVICE=pdfwrite \
   -sProcessColorModel=DeviceGray -sColorConversionStrategy=Gray -dOverrideICC=true \
   -dEmbedAllFonts=true -dSubsetFonts=true -dCompatibilityLevel=1.6 \
   -dDownsampleColorImages=true -dColorImageResolution=300 \
   -dDownsampleGrayImages=true -dGrayImageResolution=300 -dAutoRotatePages=/None \
   -sOutputFile=Curls-and-Contemplation-POD-Royal-6.69x9.61-INTERIOR.pdf  out.pdf

# Publication EPUB (stays full-color; grayscale is print-only):
cd "Final edits"
zip -X -0 out.epub mimetype
zip -rX -9 out.epub META-INF OEBPS
```

`build-pod-prince.py` is also provided (PrinceXML 16) as an alternative engine.
Unlike Chromium, Prince honors the `@page :left/:right` rules in `print.css`, so
it produces a **mirrored recto/verso gutter** (0.95in inside / 0.70in outside) —
preferred for the final perfect-bound interior if a Prince license is available.

## Notes / follow-ups

- The canonical Chromium build uses uniform 0.75in left/right margins (meets
  KDP's gutter minimum for a 301–500pp interior) and 0.6in top/bottom; Chromium
  print cannot alternate recto/verso gutters. Use the Prince build for true
  mirrored gutters.
- The chapter openers and full-page image-quotes use heavy dark backgrounds by
  design (kept per direction). The interior PDF is now converted to **true
  grayscale** (DeviceGray; 0 RGB/ICC images), so KDP prints a predictable B&W
  interior — verified that the dark openers render cleanly with no banding. Still
  order a printed proof to confirm ink coverage on the heavy dark pages.
- ISBNs on the copyright page are placeholders (`978-X-…`) — drop in the real
  KDP-assigned/owned ISBNs before publishing, and recalculate the cover spine
  width for 465 pages.
- An editorial fact-check of the high-visibility claims was performed; see
  `FACT_CHECK.md`. A line-by-line citation audit is still recommended.
