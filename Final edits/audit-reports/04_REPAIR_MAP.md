# Repair Map

For every issue found, this maps the final-output symptom to the most likely source-of-truth file and gives a recommended repair (no repair has been applied yet).

| ID | Severity | Where surfaces (final output) | Likely source / cause | Recommended repair | Priority |
|----|----------|-------------------------------|-----------------------|--------------------|----------|
| EPUB-01 | MEDIUM | 3 EPUBs in `Last/Final edits/final/` | Build pipeline keeps multiple historical builds | Move V1/V2 EPUBs out of `final/` (e.g. `final/archive/`); leave only `CurlsAndContemplation-V3-FINAL.epub` | 1 |
| PDF-02 | HIGH | 4 PDFs in `Last/Final edits/final/` with page counts 348/579/581/587 | Two different render engines (Chromium vs WeasyPrint) plus interim drafts kept side-by-side | Choose canonical print PDF; move the others out of `final/` | 1 |
| PDF-01 | BLOCKER (pending external confirmation) | `CurlsAndContemplation-KDP-ROYAL-FINAL.pdf` shows 42 of 45 `/FontDescriptor` objects with `/FontFile*` | Chromium / Skia print path likely relied on system fonts that did not embed | Run `pdffonts` to identify the 3 unembedded fonts; if confirmed, regenerate using WeasyPrint (which embeds 12/12) or change Chromium export to embed all fonts | 2 |
| PDF-03 | MEDIUM | KDP-ROYAL PDF lacks `/TrimBox` and `/BleedBox` | Chromium PDF export does not emit explicit page boxes | If keeping the Chromium PDF: post-process with Acrobat Preflight to add a TrimBox; or use the WeasyPrint output, which already includes both | 3 |
| PDF-04 | MEDIUM | All 4 PDFs untagged | WeasyPrint and Chromium do not emit a struct tree by default | Acceptable for a print interior. If an "accessible PDF" deliverable is required, tag manually in Acrobat or regenerate via WeasyPrint with PDF/UA settings | 5 |
| EPUB-02 / SRC-01 | MANUAL REVIEW | Reader UI shows different chapter title in TOC vs page header | Source files: 6 XHTML `<title>` elements diverge from `nav.xhtml`/`toc.ncx` labels | Decide canonical title for each section, then update **both** the XHTML `<title>` and the NAV/NCX label to match | 4 |
| EPUB-03 | MANUAL REVIEW | EPUB upload may surface validator errors not detectable by hand-rolled scripts | Sandbox lacks EPUBCheck | Run external EPUBCheck (4.2.6+) on V3 EPUB; resolve errors before upload | 2 |
| PDF-05 | MANUAL REVIEW | Different print PDFs have wildly different page counts (348 vs 581) | Different CSS / engines | Author / publisher decision: which interior is canonical | 1 |
| PDF-06 | MANUAL REVIEW | Print PDF visual fidelity unverified | Cannot render in sandbox | Visual proof in Acrobat / Preview using `06_MANUAL_VISUAL_QA_CHECKLIST.md` | 4 |
| PDF-07 | MANUAL REVIEW | qpdf / Preflight not run | Sandbox lacks tooling | Run `qpdf --check` and Acrobat Preflight (or PitStop) | 4 |
| SRC-02 | MANUAL REVIEW | None on output side | Font licensing | Keep OFL.txt for all four typefaces with the project; confirm SIL OFL coverage allows commercial publication | 6 |
| SRC-03 | MANUAL REVIEW | None on output side | `OEBPS/images/cover.png` dimensions unverified | Confirm image is ≥1600×2560 px and within KDP cover spec | 6 |
| (false positive) | LOW | "manifest item never referenced" warning | Audit script ignored `<source srcset>` | No action needed — `brushstroke.svg` is properly used in 18 chapter pages |

## Source files that need no repair

- All 49 source XHTML files (well-formed, valid, alt-text complete, no mojibake, no inline styles).
- `content.opf`, `nav.xhtml`, `toc.ncx` (well-formed; cross-consistent).
- All 3 CSS files (no broken url() targets, intentional `display:none` only).
- All 6 WOFF2 fonts and all 21 images (present, correctly referenced, all magic numbers valid).
