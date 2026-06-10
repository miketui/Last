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

## POD PDF rebuild (Chromium) — `CurlsAndContemplation-POD-Royal-v8-20260610.pdf`

Built with `build-pod-chromium.py` (Chromium/Skia per spine file, merged, continuous folios).

- **Badge fix:** the old `#47B9B1` teal badge came from `OEBPS/images/brushstroke.png`/`.svg`
  (hardcoded `#4ECDC4`/`#3BA99C` — raster/SVG, untouchable by CSS). Both recolored to
  Deep Jade `#145B4B` / `#0E4036` (luminance-preserving). Rebuilt badge samples `#155445` ✓.
- **No blank pages:** 33 manufactured blanks dropped at build; final 465-page ink census
  found **0 pages under 0.25% ink** (DoodlePage intentional pages retained).
- **No truncation:** all 46 spine files present in page map; bibliography closes naturally
  on p465; extracted word count 85,623 ≥ EPUB body (~81,978).
- **Fonts: 639 total, 0 non-embedded.** (Fixed: reportlab folio overlay injected a dead
  non-embedded Helvetica reference on every stamped page; stripped in `build-pod-chromium.py`.)
- **Trim:** 481.92 × 691.92 pt = 6.69" × 9.61" exact, no bleed (inset panels).
- Note: continuous-flow layout (no recto-padding blanks) means chapter openers are not
  forced to recto — deliberate "no blank pages" decision, supersedes the recto standard.

## Interior freeze + spine math (KDP B&W, white paper, 0.002252"/page)

- **Page count (FROZEN): 465**
- **Spine width: 1.0472" (26.60 mm)**
- **Cover wrap flat size (with 0.125" bleed): 14.6772" × 9.8600"**

Any interior change (e.g. ISBN insertion) that reflows pages re-opens this freeze —
re-run the build and recompute before commissioning the wrap.

## Still open (cannot be resolved in-repo)

1. **ISBN decision + insertion** (T1, launch-blocking) — owner: Michael.
   Note: inserting the ISBN block on the copyright page may reflow page count → redo spine math.
2. **Cover wrap** — can now be commissioned against the frozen spec above (after ISBN decision).
3. **Kindle device test** light/dark/sepia for forced dark panels (T6).
