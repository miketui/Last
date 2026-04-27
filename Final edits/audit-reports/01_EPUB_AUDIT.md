# EPUB Audit Detail

## EPUB candidates in `Last/Final edits/final/`

| File | Size | ZIP entries | Last modified (in zip) |
|------|-----:|------------:|------------------------|
| `CurlsAndContemplation-FINAL.epub`    | 4,418,246 B | 90 | 2026-04-16 14:25 |
| `CurlsAndContemplation-V2-FINAL.epub` | 4,417,609 B | 90 | 2026-04-17 14:50 |
| `CurlsAndContemplation-V3-FINAL.epub` | 4,417,634 B | 90 | 2026-04-17 19:12 |

V3 is the latest. V3's internal `OEBPS/` is byte-identical to `Last/Final edits/OEBPS/`. V3 differs from V2 in only 2 files (`28-Conclusion.xhtml`, `7-Preface.xhtml`).

## Phase-1 finding: multiple EPUBs in `final/`
**Severity:** MEDIUM. **Area:** EPUB. **Evidence:** `ls Last/Final edits/final/` shows three `.epub` files. **Why it matters:** any of the three could be uploaded by mistake. **Repair:** keep only the canonical EPUB in `final/`; archive the older versions elsewhere.

## V3 — structural checks

### ZIP / mimetype
- mimetype is the **first** entry, **STORED** (uncompressed), and contains `application/epub+zip` exactly. ✅
- `META-INF/container.xml` is well-formed and points to `OEBPS/content.opf`. ✅

### OPF metadata
- `dc:identifier` (`urn:uuid:c8d4e5f6-…`), `dc:title`, `dc:language` (`en`), `dc:creator` (Michael David Warren Jr.), `dc:publisher` (TAYLKOMB LLC), `dc:date` (2026-03-27), description, subjects, rights, `dcterms:modified` all present. ✅
- Schema.org accessibility metadata present (`accessMode`, `accessModeSufficient`, `accessibilityFeature`, `accessibilityHazard=none`, `accessibilitySummary`). ✅
- `<meta name="cover" content="cover-image"/>` present (EPUB 2 fallback). ✅

### Manifest (49 items)
- Every manifest `href` resolves to an entry inside the archive. ✅ (All 49 OK.)
- `properties="cover-image"` is set on `images/cover.png`. ✅
- `properties="nav"` is set on `nav.xhtml`. ✅
- One manifest entry, `img-brushstroke-svg` → `OEBPS/images/brushstroke.svg`, was flagged by my custom audit script as never referenced. **This is a false positive**: 18 chapter XHTMLs reference it via `<picture><source srcset="../images/brushstroke.svg" type="image/svg+xml"/>…</picture>`. The script only inspected `<img src>` and `<link href>`. No action required.

### Spine (47 itemrefs, all linear="yes" except the worksheet fallback)
- Every spine `idref` resolves to a manifest item. ✅
- Reading order (front matter → 4 part dividers + 16 chapters → back matter) is internally consistent.

### NAV (`OEBPS/nav.xhtml`)
- Two `<nav>` elements present: `epub:type="toc"` and `epub:type="landmarks"`. ✅
- 36 toc entries; covers Dedication, Creative Identity Audit, Affirmation Odyssey, Preface, Chapters I–XVI, Conclusion, Quiz Key, Self-Assessment, Affirmations Close, Continued Learning, Acknowledgments, About the Author, and 8 journaling/worksheet pages, Bibliography. ✅
- Landmarks: cover, toc, bodymatter (Begin Reading → Preface), bibliography. ✅

### NCX (`OEBPS/toc.ncx`)
- Well-formed; 36 navPoints, ordered with `playOrder` 1–36.
- `dtb:uid` matches OPF `dc:identifier`. ✅

### XHTML well-formedness
- `xmllint --noout` succeeds on **all 49 XHTML files**. ✅

### Internal IDs / fragment links
- No duplicate IDs found within any single XHTML file. ✅
- All internal `<a href>` references resolve to existing files; all fragment IDs that are referenced exist in their target file. ✅

### Image references
- 38 `<img>` elements across 49 XHTML files. **All have non-empty `alt` attributes.** ✅
- All `<img src>`, `<source srcset>`, and `xlink:href` SVG image targets resolve inside the archive. ✅
- No filename case mismatches detected. ✅

### CSS references
- 3 stylesheets: `style/style.css`, `style/fonts.css`, `style/print.css`. All linked from `<link rel="stylesheet">` resolve. ✅
- Inline comment confirms `@import` was intentionally removed in favour of direct `<link>` tags.

### Font references
- 6 WOFF2 font files in `OEBPS/fonts/`. Every `@font-face url('../fonts/…')` target exists. ✅
- 3 `font-family` aliases (`Lato` → Montserrat, `Playfair Display` → Libre Baskerville). Intentional and reasonable.

### Unmanifested files in archive
- None. ✅

### Manifest items never referenced
- Only `img-brushstroke-svg` (false positive — see Manifest section).

### Mojibake / encoding
- No `â€™`, `â€œ`, `â€"`, `Ã©`, etc. ✅
- No `U+FFFD` replacement characters. ✅
- No empty `<p>` tags, no `<script>` tags, no inline `style="…"` attributes anywhere in source XHTML. ✅

## Issues — V3 EPUB

| ID | Severity | Area | Evidence | Why it matters | Repair |
|----|----------|------|----------|----------------|--------|
| EPUB-01 | MEDIUM | EPUB / Packaging | Three `.epub` files exist in `final/` | Risk of uploading wrong version | Keep only V3 in `final/`; move V1/V2 to an `archive/` folder |
| EPUB-02 | MANUAL REVIEW | Navigation / Text Integrity | NAV labels diverge from XHTML `<title>` for ~6 entries (Ch X, Conclusion, 30-SelfAssessment, 31-affirmations-close, 6-AffirmationOdyssey, 35-JournalingStart) | Two different "official" titles for the same section can confuse readers and TOC search | Decide canonical title and align both `<title>` and NAV label |
| EPUB-03 | MANUAL REVIEW | EPUB / Validation | EPUBCheck not available in this sandbox | Some validation rules (XMLNS, properties exhaustiveness, MathML/SVG details, RemoteResources flags, etc.) cannot be confirmed by hand-rolled scripts alone | Run `epubcheck CurlsAndContemplation-V3-FINAL.epub` locally; resolve any errors before upload |

## Issues — V1, V2 EPUBs (older candidates still in `final/`)

V1 and V2 produce the same audit results as V3 (one false-positive about brushstroke.svg). They are not the current candidate; they should not be uploaded. No deeper triage performed beyond confirming structural validity and the same false positive.
