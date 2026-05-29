# Release Manifest

This manifest declares the **only canonical publication artifacts** for the `Money` package.

- Human version: **Money Release v3.0 (Optimized Publication Canonical)**
- Machine version: **money-release-3.0.0**
- Build timestamp (UTC): **2026-05-29**

## Canonical Artifacts

The canonical files now live in `optimized/` (page-count–optimized, KDP Royal,
embedded fonts, page-numbered TOC, EPUBCheck-clean). Checksums are maintained in
`optimized/SHA256SUMS.txt`.

| Format | Canonical filename | SHA256 | Distribution target |
|---|---|---|---|
| EPUB | `optimized/Curls-and-Contemplation-PUBLICATION.epub` | `c747fbc8c8018093255b0352b25df7e3c429cec4e00673fd96ea23f7ad04cb5a` | KDP EPUB |
| Print PDF | `optimized/Curls-and-Contemplation-POD-Royal-6.69x9.61-INTERIOR.pdf` | `ccc07810a10f5910544c63ee8c453d05fa6288000915d3feeaca7e0d48576dea` | POD Royal 6.69×9.61 |

- Print interior: **465 pages**, Royal 6.69 × 9.61 in, all fonts embedded,
  continuous page-number folios, page-numbered table of contents, 0 blank pages.
- EPUB: EPUB 3.3, **0 EPUBCheck errors/warnings**, accessibility metadata present.

## Publication Rule

Only the two artifacts listed above are canonical for publication. Every other
EPUB/PDF in this directory — including the previous `Curls-and-Contemplation-V2-FINAL.epub`
and `Curls-and-Contemplation-POD-6x9-FINAL.pdf` — is **archival/superseded** and
must not be uploaded for distribution.

## Pre-publication checklist (owner action)

- [ ] Replace the placeholder ISBNs on the copyright page with real ISBNs.
- [ ] Recalculate the cover spine width for 465 pages and regenerate the cover.
- [ ] Order a KDP physical proof (verify the dark openers/quote pages in B&W).
