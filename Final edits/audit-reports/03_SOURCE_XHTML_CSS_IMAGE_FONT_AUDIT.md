# Source File Audit Detail (`Last/Final edits/OEBPS/`)

## Folder inventory

```
Last/Final edits/OEBPS/
├── content.opf       (16,591 B)
├── nav.xhtml         ( 5,485 B)
├── toc.ncx           ( 7,738 B)
├── fonts/    (6 files, 379 KB)
├── images/   (21 files, 3.7 MB)
├── style/    (3 files: fonts.css, style.css, print.css)
└── xhtml/    (49 .xhtml files, 0–60 KB each)
```

This folder is **byte-identical** to the `OEBPS/` directory inside `CurlsAndContemplation-V3-FINAL.epub` (`diff -rq` reports zero differences). Every fix made here will land identically in any rebuilt V3 EPUB.

> Note on path casing: the audit prompt wrote `Last/Final edits/OEBPS/Xhtml/` (capital `X`). The actual on-disk folder is lowercase `xhtml/`. Inside the EPUB the manifest also uses lowercase `xhtml/`, so EPUB readers will be consistent. No action needed unless contributors document the path with a capital X.

## XHTML — 49 files

- `xmllint --noout` succeeds on every file. ✅
- Every file has `xmlns="http://www.w3.org/1999/xhtml"`, `xml:lang`, and `lang`. ✅
- Every file has a `<title>` element. ✅
- No duplicate IDs within any single file. ✅
- 38 `<img>` elements; **0 missing alt, 0 empty alt**. ✅
- 0 inline `style="…"` attributes. ✅
- 0 `<script>` tags. ✅
- 0 empty `<p></p>` paragraphs. ✅
- 0 mojibake patterns. 0 `U+FFFD` replacement characters. ✅
- All internal links and fragments resolve. ✅
- All image paths (`<img src>`, `<source srcset>`) resolve case-sensitively. ✅
- 16 chapter files (`9-` through `27-` matching `chapter-i…chapter-xvi`); each references its expected `chapter-N-quote.jpeg`. ✅
- No heading-level skips detected (no h1→h3 jumps). ✅

### NAV vs `<title>` divergence (MANUAL REVIEW)

The `<nav epub:type="toc">` label and the page `<title>` give different names for some sections. EPUB readers usually display the NAV label, but Apple Books, Kindle "Go to" search, and screen readers can also read the `<title>`. Aligning them is recommended.

| File | NAV label | XHTML `<title>` |
|------|-----------|-----------------|
| `20-chapter-x-crafting-enduring-legacies.xhtml` | "X. Crafting Enduring Legacies" | "Chapter X - Sustaining Excellence and Building Your Legacy" |
| `28-Conclusion.xhtml` | "Conclusion" | "Conclusion - The Enduring Legacy of the Conscious Hairstylist" |
| `30-SelfAssessment.xhtml` | "Self-Assessment Worksheet" | "Business Health Check - Curls & Contemplation" |
| `31-affirmations-close.xhtml` | "Affirmations Close Worksheet" | "The Artist's Manifesto - Curls & Contemplation" |
| `6-AffirmationOdyssey.xhtml` | "Affirmation Odyssey Worksheet" | "Affirmation Odyssey - Curls & Contemplation" |
| `35-JournalingStart.xhtml` | "Journaling Start" | "Interactive Journaling Guide - Curls & Contemplation" |

The remaining ~30 files differ only by an appended " - Curls & Contemplation" suffix in `<title>` — a minor cosmetic inconsistency, not a content issue.

## CSS — `OEBPS/style/`

### `fonts.css` (3,649 B)
- 12 `@font-face` declarations across 4 typefaces (Libre Baskerville reg/it/bold, Cinzel Decorative, Montserrat reg/bold) plus aliases (`Lato`, `Playfair Display`).
- All `src: url('../fonts/…woff2')` targets resolve relative to `OEBPS/style/`. ✅
- `font-display: swap` on every face (acceptable for EPUB; readers ignore but it does not break anything).

### `style.css` (63,038 B)
- Uses `position: absolute` for decorative elements only (chapter-number-brush overlay, list `::before` markers, certificate corner decorations, body title-page corner-deco). All have a positioned ancestor. Acceptable in modern EPUB3.
- `display: none` is used intentionally for `.hidden`, `.toc-page-number` (hidden in EPUB; shown in print via `print.css`), and Web-only CTAs.
- `.sr-only` uses clip-path / static positioning (e-reader-safe pattern). ✅
- Comment confirms `@import url('fonts.css')` was removed in favour of explicit `<link>` tags. ✅

### `print.css` (31,546 B)
- Print-only `position: absolute` for `.chapter-number-brush` and `.corner-deco` (decorative).
- `display: none !important` for `.btn-join, .video-link, .web-only, .epub-download-cta` — correct: web-only elements are hidden in print.
- `.visually-hidden` switches to `position: static` with clip-path — accessible.
- No usage of `unicode-bidi`, `-webkit-region-overflow`, `column-fill`, or other features known to break Apple Books / Kindle / Adobe Digital Editions.

### CSS issues
None at the rule level. Visual rendering is a manual-QA item.

## Images — `OEBPS/images/` (21 files)

| File | Size | Used in |
|------|-----:|---------|
| `cover.png` | 2,162,154 B | `0-Cover.xhtml`, manifest `cover-image` |
| `Michael.jpeg` | 207,943 B | `34-AbouttheAuthor.xhtml` |
| `brushstroke.png` | 1,685 B | 18 chapter pages (chapter-number ornament) |
| `brushstroke.svg` | 885 B | 18 chapter pages (`<picture><source>`) |
| `preface-quote.jpeg` | 64,233 B | `7a-preface-quote.xhtml` |
| `chapter-i-quote.jpeg` … `chapter-xvi-quote.jpeg` | 60–93 KB each | 16 corresponding chapter quote pages |
| `conclusion-quote.jpeg` | 65,092 B | `28a-conclusion-quote.xhtml` |

- All 21 images have valid magic-number headers (PNG / JPEG). ✅
- Every image referenced from XHTML resolves. ✅
- Every image is referenced (no orphan images). ✅
- No filename case mismatches. ✅
- Image dimensions / DPI not verifiable in this sandbox (no Pillow / ImageMagick). The 2.16 MB `cover.png` is large enough that, at 300 DPI, it could easily exceed 6×9 in (manual review item).

## Fonts — `OEBPS/fonts/` (6 WOFF2 files)

| Font file | Size |
|-----------|-----:|
| `CinzelDecorative.woff2` | 20,756 B |
| `Montserrat-Bold.woff2` | 130,012 B |
| `Montserrat-Regular.woff2` | 126,576 B |
| `librebaskerville-bold.woff2` | 30,980 B |
| `librebaskerville-italic.woff2` | 41,056 B |
| `librebaskerville-regular.woff2` | 30,324 B |

- All 6 WOFF2 files are referenced from `fonts.css`. ✅
- All 6 WOFF2 files are listed in the OPF manifest with `media-type="font/woff2"`. ✅
- Licensing was not assessed (out of scope for a technical audit). All three families (Libre Baskerville, Cinzel Decorative, Montserrat) are commonly distributed under the SIL Open Font License, which permits embedding in EPUBs and PDFs, but **the author should retain the OFL.txt for each font in the project root or somewhere referenceable**, and confirm before commercial release. Flagged as **MANUAL REVIEW** for legal sign-off.

## OPF / NAV / NCX cross-checks

- OPF `dc:identifier` (`urn:uuid:c8d4e5f6-a1b2-4c3d-9e8f-0a1b2c3d4e5f`) matches NCX `dtb:uid`. ✅
- All 36 NAV `<a href>` targets exist in OPF manifest. ✅
- All 36 NCX `<content src=>` targets exist in OPF manifest. ✅
- NAV file set ≡ NCX file set (no missing on either side). ✅
- OPF `guide` references all exist as XHTML files. ✅

## Source-side issues to address

| ID | Severity | File | Note |
|----|----------|------|------|
| SRC-01 | MANUAL REVIEW | 6 XHTML files (see table above) | Reconcile NAV label vs `<title>` |
| SRC-02 | MANUAL REVIEW | `OEBPS/fonts/` | Confirm font-licensing files are kept with the project (OFL.txt) |
| SRC-03 | MANUAL REVIEW | `OEBPS/images/cover.png` | Confirm pixel dimensions are within KDP cover spec (typ. 1600×2560 minimum, ≤50 MB) |

No structural defects found in source XHTML, CSS, images, fonts, OPF, NAV, or NCX.
