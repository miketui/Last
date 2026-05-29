# Phase 4 — Pre-Publication Integrity Audit & Pre-Mortem

Full pre-publication sweep of the canonical artifacts and EPUB source. Every check
below was run programmatically against the files on `main`.

## Result: PASS — no blocking defects found

The manuscript is internally consistent and KDP-uploadable. The only outstanding
items are **owner decisions** (ISBNs, color-vs-grayscale interior, spine/proof),
documented under Pre-Mortem.

---

## 1. EPUB structure (`content.opf`)

| Check | Result |
|---|---|
| Manifest items | 81 |
| Spine itemrefs | 48 |
| Spine idrefs missing from manifest | **0** |
| Manifest hrefs missing on disk | **0** |
| XHTML on disk not in manifest | **0** |
| Spine reading order | Cover → HalfTitle → Title → Copyright → TOC → … → Bibliography ✓ |
| Non-linear items | `worksheet-download-fallback` correctly `linear="no"` ✓ |

## 2. Metadata & accessibility (EPUB)

All present: `dc:title`, `dc:creator` (Michael David), `dc:language` (en),
`dc:identifier` (urn:uuid), `dc:date`, `dc:publisher` (TAYLKOMB LLC), `dc:rights`,
`dcterms:modified`, cover meta, nav property.

Accessibility metadata complete: `schema:accessMode`, `accessModeSufficient`,
`accessibilityFeature`, `accessibilityHazard`, `accessibilitySummary`. ✓

## 3. EPUBCheck 5.1.0

```
Messages: 0 fatals / 0 errors / 0 warnings / 0 infos
```

## 4. Table of Contents — page-number accuracy (the key print check)

- Print TOC links: **39**, broken: **0** (every target file + anchor resolves).
- TOC folio numbers: **36**, monotonic non-decreasing, range **6–456**.
- **TOC folios vs PDF page-map: 0 mismatches** — every printed TOC page number
  equals the actual absolute page where that section begins.
- Printed-folio spot checks: body pages (18, 19, 48, 167, 300, 456) print their
  correct folio; chapter-opener and front-matter pages suppress the folio **by
  design** (per BUILD_NOTES) — verified, not a defect.

## 5. Images

- Images missing `alt` text: **0**
- `<img src>` targets missing on disk: **0**

## 6. POD interior PDF (KDP print spec)

| Check | Result |
|---|---|
| Pages | 465 |
| Trim | 481.92 × 691.92 pt = **6.693 × 9.61 in** (KDP Royal 6.69 × 9.61) ✓ |
| Fonts | All embedded + subset (Cinzel Decorative, Montserrat, Libre Baskerville, DejaVu); **0 non-embedded** ✓ |
| Blank pages | 0 |

## 7. Reproducibility

A fresh rebuild produced a PDF that is **content-identical** to the shipped file:
same 465 pages, byte-identical extracted text (586,665 chars). Hashes differ only
because Chromium/Ghostscript embed timestamps and randomized font-subset tags —
expected; the build is content-reproducible.

---

## Pre-Mortem — "what could go wrong at KDP upload" (owner decisions)

These are **not defects**; they are choices to confirm before publishing.

1. **Color images on a B&W interior — HIGHEST RISK.** The interior PDF contains
   RGB (18) and ICC (19) images alongside grayscale (36), from the dark chapter
   openers and full-page image-quotes (kept per direction).
   - **At KDP:** if you select a **black-and-white** interior, KDP auto-converts
     these to grayscale — the heavy dark backgrounds may band, posterize, or look
     muddy in print. If you select a **premium/standard color** interior, the book
     prices significantly higher and the page cost jumps.
   - **Recommendation:** order a physical proof and decide deliberately, or convert
     the interior to true grayscale before upload for predictable B&W output.

2. **Placeholder ISBNs.** Copyright page still reads `978-X-XXXXXXX-X-X` for both
   paperback and e-book. Must be replaced with real ISBNs before publishing.

3. **Cover spine width.** Must be recalculated for **465 pages** (white/cream paper
   choice affects mils/page) and the cover regenerated to match.

4. **Physical proof.** Order a KDP printed proof to confirm: the dark openers read
   cleanly in the chosen interior mode, gutter margins are comfortable at 465 pp
   (current build uses uniform 0.75 in L/R; the Prince build offers true mirrored
   recto/verso gutters if a license is available — see BUILD_NOTES).

5. **Bleed.** Current trim is exact with no bleed. The full-bleed dark pages will
   print to the trim edge only if the interior is built with bleed; confirm whether
   KDP flags the dark openers as needing bleed, or accept the white hairline margin.

---

## Verdict

Digitally, the book is **ready**: EPUB validates clean, print TOC page numbers are
accurate, fonts embed, structure and accessibility metadata are complete. The
remaining gate is physical/commercial (color decision, ISBNs, spine, proof) — all
owner actions.
