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
| EPUB | `optimized/Curls-and-Contemplation-PUBLICATION.epub` | `2fc5fc6ab6b25ebe26acfe4814e999d93dc7a5f3eaa4dc319ff5efb45f2f6b2e` | KDP EPUB |
| Print PDF | `optimized/Curls-and-Contemplation-POD-Royal-6.69x9.61-INTERIOR.pdf` | `91754012845e3b0975b5b73d0c93470b3f52339d3d420d5f69ac877240594cbc` | POD Royal 6.69×9.61 |

- Print interior: **462 pages**, Royal 6.69 × 9.61 in, all fonts embedded,
  continuous page-number folios, page-numbered table of contents, 0 blank pages.
- EPUB: EPUB 3.3, **0 EPUBCheck errors/warnings**, accessibility metadata present.

## Publication Rule

Only the two artifacts listed above are canonical for publication. Every other
EPUB/PDF in this directory — including the previous `Curls-and-Contemplation-V2-FINAL.epub`
and `Curls-and-Contemplation-POD-6x9-FINAL.pdf` — is **archival/superseded** and
must not be uploaded for distribution.

## Pre-publication checklist (owner action)

- [ ] Replace the placeholder ISBNs on the copyright page with real ISBNs.
- [ ] Recalculate the cover spine width for 462 pages and regenerate the cover.
- [ ] Order a KDP physical proof (verify the dark openers/quote pages in B&W).
