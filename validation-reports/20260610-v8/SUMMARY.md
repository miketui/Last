# v8-20260610 Build — Validation Summary

**Artifact:** `Curls-and-Contemplation-v8-20260610.epub` (rebuilt from `Final edits/` sources)
**Date:** 2026-06-10

## Changes from FINAL (2026-06-10T04:12Z build)

ACISS palette enforced in `Final edits/OEBPS/style/style.css` per council verdict
(path b-lite) and Pre-Mortem T2 mitigation:

| Was (generic/off-brand) | Now (ACISS) |
|---|---|
| `#008080` default teal (×9) | `#145B4B` Deep Jade |
| `#D4AF37` default gold (×3) | `#B08D57` Antique Gold |
| `#00A86B` jade accent | `#145B4B` Deep Jade |
| `#C8A951` near-retired gold (×2) | `#B08D57` Antique Gold |
| `#006666` / `#339999` teal shades | `#0E4036` / `#3A7D6C` jade derivatives |
| `#B8962E` / `#E0C564` gold shades | `#8F7142` / `#C9AC7E` gold derivatives |
| `#33BB88` jade-light | `#C7D9D2` Soft Jade Mist |
| teal/gold rgba tints | jade/gold rgba tints |

No XHTML/SVG content carried hardcoded off-brand colors (verified by grep).

## Gates

- **Official EPUBCheck (v3.3 rules): 0 fatals / 0 errors / 0 warnings / 0 infos** — see `epubcheck.txt`.
  Resolves Pre-Mortem T3 (this is the first build of these sources to pass the official validator).
- **ACISS audit (`tools/aciss-audit.py`, EPUB checks):** see `aciss-audit-epub.json`
  - PASS aciss_palette — 16 ACISS token uses; 0 retired/generic (resolves T2)
  - PASS nav_ncx_parity (40/40), image_alt_text (38/38), internal_links, bibliography (88 URLs)
  - **FAIL isbn_in_opf — still UUID-only.** Open decision (Pre-Mortem T1): Bowker vs KDP-free.
    If Bowker: insert ISBN into copyright page + `content.opf` `dc:identifier`, rebuild, re-run gates.

## Still open (cannot be resolved in-repo)

1. **ISBN decision + insertion** (T1, launch-blocking) — owner: Michael.
2. **PDF interior rebuild** with the corrected stylesheet (print PDF badges sampled `#47B9B1`
   teal family) → then re-freeze page count → spine math → cover wrap (T4 sequencing).
3. **Kindle device test** light/dark/sepia for forced dark panels (T6).
