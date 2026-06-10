# Curls & Contemplation — Production Repository

**Curls & Contemplation: A Stylist's Interactive Journey** by Michael David (TAYLKOMB LLC).
This repository is the organized production home for the book: the audited, post-remediation
source of truth, the final retail artifacts, the build pipeline, the audit record, and the
raw working files migrated from `miketui/Last` (`Final edits/`).

## Layout

| Folder | What it is |
|---|---|
| `book/` | **The canonical EPUB source** (post-audit, all remediations applied): `mimetype`, `META-INF/`, and `OEBPS/` (content.opf, nav.xhtml, toc.ncx, all chapter/back-matter XHTML, styles, fonts, images). Edit here; everything else is generated or archival. |
| `release/` | **The final, fully verified retail artifacts**: `Curls-and-Contemplation-FINAL.epub` (epubcheck 5.1.0: 0/0/0/0), `Curls-and-Contemplation-POD-Royal-6_69x9_61-FINAL.pdf` (480 pp, 6.69×9.61 in KDP Royal, all fonts embedded, recto chapter openers), `BUILD-MANIFEST.md` (every audit finding's disposition + all verification-gate output), and `page-map.json` (spine file → first printed page). |
| `build/` | **The build pipeline**, path-adapted to this repo: `build-epub-final.sh` (OCF packaging, mimetype-first), `build-pod-final.py` (Chromium/Skia render → blank-drop → recto padding → folio stamping; finish with the Ghostscript `/prepress` pass documented in the manifest), `inject-toc-folios.py` (printed-TOC page numbers from page-map.json), `scan-widows.py` (widow/orphan QA scan), `validate_outputs.py` (structural validator), `PDF-POD-BUILD-GUIDE.md` (print spec + KDP checklist), `fonts/` (folio-overlay font). |
| `audit/` | **The audit record**: the three-phase pre-publication forensic audit (`CC-V7-Phase1-Forensic-Audit-Report.md`, `CC-V7-Phase2-Premortem.md`, `CC-V7-Phase3-LLM-Council.md`), `VALIDATION-REPORT.md`, and the earlier `audit-reports/` set. |
| `marketing/` | Raw funnel and web material: `Money/` (launch/funnel program, gate ledger, handoff docs, the audited baseline artifacts under `Money/optimized/`) and `website/`. |
| `archive/` | Superseded builds and miscellany, kept verbatim: `final/`, `output/`, `outputs/` (older EPUB/PDF generations), `pdf/` (earlier print pipeline), `Claude-code/`, `files 33.zip`. Nothing in here is the version of record. |

## Rebuilding the artifacts

```bash
# 1. EPUB (stamps dcterms:modified, packages mimetype-first)
bash build/build-epub-final.sh out/Curls-and-Contemplation-FINAL.epub

# 2. POD PDF (two-pass: build → inject TOC folios → rebuild → Ghostscript finish)
python3 build/build-pod-final.py out/pod-raw.pdf
python3 build/inject-toc-folios.py --map out/page-map.json   # only if page map changed
python3 build/build-pod-final.py out/pod-raw.pdf
gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -dCompatibilityLevel=1.6 \
   -dPDFSETTINGS=/prepress -dEmbedAllFonts=true -dSubsetFonts=true \
   -dAutoRotatePages=/None -o out/Curls-and-Contemplation-POD-FINAL.pdf out/pod-raw.pdf

# 3. Gates (see release/BUILD-MANIFEST.md for the full list)
java -jar epubcheck.jar out/Curls-and-Contemplation-FINAL.epub   # must be 0/0/0/0
python3 build/scan-widows.py out/Curls-and-Contemplation-POD-FINAL.pdf
pdffonts out/Curls-and-Contemplation-POD-FINAL.pdf                # all embedded
```

Requires: python3 (playwright + Chromium, pypdf, reportlab, Pillow, lxml), Java 17+ with
epubcheck 5.x, poppler-utils, Ghostscript.

## The one open item

The copyright page (`book/OEBPS/xhtml/2-Copyright.xhtml`) carries **no ISBNs** — the
placeholder block was removed so nothing fake could ship. When ISBNs are purchased: re-add
the ISBN block, rebuild both artifacts, re-run epubcheck and the manifest's grep gates
(about ten minutes end to end). Everything else passed every gate on June 10, 2026 — see
`release/BUILD-MANIFEST.md`.
