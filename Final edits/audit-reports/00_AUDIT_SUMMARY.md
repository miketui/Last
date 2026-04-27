# Publication Intake Audit — Summary

Date: 2026-04-27
Auditor: Read-only audit (no source files modified)
Scope: `Last/Final edits/final/` and `Last/Final edits/OEBPS/`

## Verdict

**NEEDS REPAIR BEFORE PUBLICATION** — primarily for the print PDFs.

Reasons:

1. The EPUB candidate (`CurlsAndContemplation-V3-FINAL.epub`) is structurally clean, well-formed, and almost certainly upload-ready, but no official EPUBCheck run was possible in this environment, so an external EPUBCheck pass is still required before final upload.
2. Multiple PDF candidates exist in `final/` with materially different page counts (348 vs 579/581/587). Only ONE can be the print interior; the others should be removed or moved out of `final/` to avoid uploading the wrong file.
3. `CurlsAndContemplation-KDP-ROYAL-FINAL.pdf` (Chromium/Skia, 348 pages) shows possible non-embedded fonts (42 of 45 `/FontDescriptor` objects carry `/FontFile*`). KDP rejects PDFs with non-embedded fonts. This must be reproduced and confirmed with `pdffonts` outside this sandbox.
4. The WeasyPrint PDFs (`-V2-FINAL.pdf`, `-V3-FINAL.pdf`, `-V3-INTERIOR-nocover.pdf`) all show 100% font embedding and have valid `/TrimBox` and `/BleedBox`, but page counts differ (587 / 581 / 579). The intended canonical print PDF must be selected and the rest removed from `final/`.
5. Three duplicate EPUB candidates exist in `final/` (`CurlsAndContemplation-FINAL.epub`, `-V2-FINAL.epub`, `-V3-FINAL.epub`). Only ONE should be present at upload time.
6. NAV labels and XHTML `<title>` elements diverge for ~6 sections (e.g. Chapter X nav says "Crafting Enduring Legacies" but `<title>` says "Sustaining Excellence and Building Your Legacy"). Manual review is required to decide which is canonical.
7. Visual QA (cover, copyright, TOC, chapter openers, quote pages, worksheets, back matter) has not been performed by a human in this audit and must be done before publication.

## Counts

Counts below match `05_ISSUE_LOG.csv` row-for-row.

| Severity | EPUB | PDF | Source | Total |
|----------|-----:|----:|-------:|------:|
| BLOCKER  | 0 | 1 — `PDF-01` (KDP-ROYAL: 42/45 FontDescriptors embedded; pending external `pdffonts` confirmation) | 0 | 1 |
| HIGH     | 0 | 1 — `PDF-02` (4 PDFs in `final/` with page counts 348/579/581/587) | 0 | 1 |
| MEDIUM   | 1 — `EPUB-01` (3 EPUB versions in `final/`) | 2 — `PDF-03` (no /TrimBox on KDP-ROYAL), `PDF-04` (all PDFs untagged) | 0 | 3 |
| LOW      | 0 | 0 | 0 | 0 |
| MANUAL REVIEW | 2 — `EPUB-02` (NAV vs `<title>` divergence), `EPUB-03` (external EPUBCheck) | 3 — `PDF-05` (page-count divergence editorial decision), `PDF-06` (visual QA), `PDF-07` (qpdf/Preflight) | 3 — `SRC-01` (NAV vs `<title>` source side), `SRC-02` (font OFL files), `SRC-03` (cover.png dimensions) | 8 |
| **Total**     | **3** | **7** | **3** | **13** |

Note on the `brushstroke.svg` "manifest item never referenced" line in the raw audit log: it was a false positive from the audit script (which only inspected `<img src>`/`<link href>`, not `<picture><source srcset>`). The SVG is in fact referenced from 18 chapter pages. It is not an issue and is not counted above. See `01_EPUB_AUDIT.md` for context.

## Files Audited

Final outputs (`Last/Final edits/final/`):
- `CurlsAndContemplation-FINAL.epub` (4,418,246 B, 90 entries, 2026-04-16)
- `CurlsAndContemplation-V2-FINAL.epub` (4,417,609 B, 90 entries, 2026-04-17 14:50)
- `CurlsAndContemplation-V3-FINAL.epub` (4,417,634 B, 90 entries, 2026-04-17 19:12) — current candidate
- `CurlsAndContemplation-KDP-ROYAL-FINAL.pdf` (15,248,415 B, PDF 1.4, 348 pages, Chromium/Skia)
- `CurlsAndContemplation-V2-FINAL.pdf` (5,368,897 B, PDF 1.7, 587 pages, WeasyPrint 68.1)
- `CurlsAndContemplation-V3-FINAL.pdf` (5,484,843 B, PDF 1.7, 581 pages, WeasyPrint 68.1)
- `CurlsAndContemplation-V3-INTERIOR-nocover.pdf` (3,257,784 B, PDF 1.7, 579 pages, WeasyPrint 68.1)

Source (`Last/Final edits/OEBPS/`): byte-identical to V3 EPUB internals; 49 XHTML files, 3 CSS files, 21 images, 6 fonts, OPF, NAV, NCX.

## Top-Priority Fix Order

1. Decide and keep ONE EPUB and ONE PDF in `final/`. Remove (or relocate) the other duplicates so the upload candidate is unambiguous.
2. Run external EPUBCheck (4.2.6+) on the chosen EPUB and resolve any errors it reports.
3. Run external `pdffonts` and a print-preflight check (PitStop / Acrobat preflight) on the chosen PDF and confirm 100% font embedding and trim/bleed correctness.
4. Reconcile NAV labels vs XHTML `<title>` for the six diverging entries (Chapter X, Conclusion, Self-Assessment back-matter, Affirmations Close, Affirmation Odyssey, Journaling Start).
5. Human visual QA on cover, copyright, TOC, every chapter opener, all 16 quote pages, every worksheet/journal page, and back matter.

See:
- `01_EPUB_AUDIT.md`
- `02_PDF_AUDIT.md`
- `03_SOURCE_XHTML_CSS_IMAGE_FONT_AUDIT.md`
- `04_REPAIR_MAP.md`
- `05_ISSUE_LOG.csv`
- `06_MANUAL_VISUAL_QA_CHECKLIST.md`
