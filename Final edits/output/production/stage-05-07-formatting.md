# STAGES 05-07 + 13-14 — FORMATTING REPORT
## Date: 2026-04-16T02:30:00Z

---

## Stage 5 — Style Guide: VERIFIED
- CSS variables confirmed: Teal #008080, Gold #D4AF37, Jade #00A86B
- Font stack: Cinzel Decorative (display), Libre Baskerville (body), Montserrat (UI)
- Heading hierarchy consistent: H1 → Cinzel/display, H2-H6 → Montserrat/uppercase
- Color palette integrated across 2,991 lines of style.css
- Print CSS: 1,229 lines with @page rules, mirrored margins, widow/orphan control

## Stage 6 — EPUB Build: PASS
- **File**: CurlsAndContemplation-FINAL.epub (4.3 MB)
- **Structure**: 82 files in EPUB package (47 XHTML, 3 CSS, 22 images, 6 fonts, 3 metadata, 1 container)
- **epubcheck result**: ZERO fatals / ZERO errors / ZERO warnings / ZERO infos
- **Spine**: 44 itemrefs in reading order + 1 non-linear (worksheet fallback)
- **Navigation**: nav.xhtml (EPUB3) + toc.ncx (EPUB2 fallback) both present and valid

## Stage 13 — EPUB Flow QA: PASS
- All 47 XHTML files included in spine order
- Endnote back-links verified (ch1-fnref-1 ↔ ch1-fn-1 pattern across all chapters)
- Chapter structure consistent: title → body → endnotes → quiz → worksheet → image quote
- Image alt text present on all meaningful images
- Semantic EPUB landmarks: cover, toc, bodymatter, bibliography

## Stage 7 — PDF Build: COMPLETE
- **File**: CurlsAndContemplation-KDP-ROYAL.pdf (5.3 MB)
- **Page count**: 423 pages
- **Trim size**: 6.69" × 9.61" (KDP Royal)
- **Interior**: B&W on white, no bleed
- **Margins**: Gutter 0.95" (verso left / recto right), outside 0.70", top/bottom 0.75"
- **Typography**: 11pt body, orphans/widows: 3, justified, hyphenation enabled
- **Build tool**: WeasyPrint 68.1 with float-free overrides

## Stage 14 — PDF Pagination: NOTED
- Page breaks enforced at each XHTML file boundary
- Chapter openers start on new pages (via `break-before: page`)
- Cover page rendered full-bleed (zero margins)
- Font embedding handled by WeasyPrint from WOFF2 sources
- Note: Drop caps rendered inline (not floated) due to WeasyPrint limitations — visually acceptable

## Known Limitations
- WeasyPrint does not support `<picture>` elements — PNG fallback used
- Drop caps are inline rather than floated — functional but less visually dramatic than CSS float version
- Running headers/footers not implemented (WeasyPrint lacks full @page margin content support)
- Roman numeral front matter page numbering not implemented (WeasyPrint limitation)
