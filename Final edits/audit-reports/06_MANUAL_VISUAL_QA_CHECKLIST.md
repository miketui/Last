# Manual Visual QA Checklist

This checklist enumerates the proofs that **must** be performed by a human on a real device before publication. The audit could not perform any of these in the sandbox.

## EPUB visual QA — open `CurlsAndContemplation-V3-FINAL.epub` in:

- [ ] Apple Books (macOS or iPad)
- [ ] Kindle Previewer 3 (Amazon's KDP-required preview tool)
- [ ] Adobe Digital Editions (or Thorium)
- [ ] One additional reading system (Calibre / Google Play Books / Kobo)

For each reader confirm:

1. **Cover (`xhtml/0-Cover.xhtml`, image `cover.png`)** — fills the cover slot, no cropping, image not pixelated.
2. **Half title (`0a-HalfTitle.xhtml`)** — typography correct.
3. **Title page (`1-TitlePage.xhtml`)** — author, publisher (TAYLKOMB LLC), and title render with correct fonts (Cinzel Decorative for the main title).
4. **Copyright page (`2-Copyright.xhtml`)** — copyright year (2026), publisher, ISBN if present.
5. **Table of Contents (`3-TableOfContents.xhtml`)** — visually identical or a superset of the system TOC.
6. **Dedication (`4-Dedication.xhtml`)** — italic styling preserved.
7. **Creative Identity Audit (`5-SelfAssessment.xhtml`)** — interactive worksheet renders; lines/checkboxes visible.
8. **Affirmation Odyssey (`6-AffirmationOdyssey.xhtml`)** — worksheet style.
9. **Preface and preface quote (`7-Preface.xhtml`, `7a-preface-quote.xhtml`)** — quote image displays at full width without overflow.
10. **Each Part divider (`8`, `12`, `18`, `24`)** — full-page Roman numeral dividers render cleanly.
11. **Each chapter (`9`–`27`)** — title, brushstroke ornament (PNG/SVG), drop cap, body text, endnotes / quiz / worksheet, and quote image at end render correctly. **All 16 chapters.**
12. **Conclusion (`28-Conclusion.xhtml`) + conclusion quote (`28a-conclusion-quote.xhtml`)**.
13. **Quiz Key (`29-QuizKey.xhtml`)** — answer table renders.
14. **Self-Assessment Worksheet (`30-SelfAssessment.xhtml`)** — note: page `<title>` is "Business Health Check"; verify which is canonical.
15. **Affirmations Close (`31-affirmations-close.xhtml`)** — note: page `<title>` is "The Artist's Manifesto".
16. **Continued Learning Commitment (`32-…`)**, **Acknowledgments (`33-…`)**, **About the Author (`34-…`, image `Michael.jpeg`)**.
17. **Journaling Start (`35-…`)** — note: page `<title>` is "Interactive Journaling Guide".
18. **Manifesting Journal, Journal Page, Professional Development, SMART Goals, Self-Care Journal, Vision Journal, Doodle Page (`36`–`42`)** — interactive worksheets render with intended grid/lines.
19. **Bibliography (`43-bibliography.xhtml`)** — long list typography legible; URLs do not overflow.
20. **Worksheet download fallback (`worksheet-download-fallback.xhtml`)** — confirm you intend the `linear="no"` flag to keep this off the linear reading order.

For each chapter additionally confirm:

- Drop cap aligns; first line not crashed into image.
- Brushstroke ornament behind chapter Roman numeral renders (PNG fallback when SVG fails on older Kindles).
- No table or list runs off the right margin.
- All emoji / special characters render (curly apostrophes, em dashes, ✓ in pledge lists).

## PDF print QA — open `CurlsAndContemplation-V3-FINAL.pdf` (or whichever PDF is chosen as canonical) in Acrobat / Preview / Foxit:

For the **whole document**:

- [ ] Run Acrobat **Preflight → Digital Printing (B/W) or Color** profile.
- [ ] Run `qpdf --check filename.pdf` (zero warnings expected).
- [ ] Run `pdffonts filename.pdf` — every line should show `emb yes`.
- [ ] Confirm page count matches the canonical interior (348 if KDP-ROYAL is canonical, or ~579–587 for WeasyPrint variants — pick one, document it).
- [ ] Confirm consistent page size on every page (not just the first — use Acrobat Preflight or `pdfinfo -box` to enumerate).
- [ ] Confirm ICC color profile and that color images are not unintentionally CMYK / gray.

Spot-check at minimum these pages (page numbers will shift between the 348-page and 581-page versions; use Acrobat's bookmark / outline panel):

1. Cover (if interior includes it; or confirm cover is uploaded separately).
2. Title page.
3. Copyright page.
4. Table of Contents.
5. First chapter opener (Chapter I).
6. A representative interior page of Chapter I.
7. End of Chapter I — confirm quote page (`chapter-i-quote.jpeg`) renders, and that the chapter ending does not bleed into the next chapter unexpectedly.
8. Each subsequent chapter opener (Chapters II–XVI). 16 spot-checks total.
9. Each chapter quote page (16).
10. Self-Assessment / worksheet pages — confirm any check-boxes, lines, and grids print correctly at full bleed.
11. Quiz Key — confirm the answer key table is readable at print size.
12. Bibliography — confirm long URLs wrap rather than truncate.
13. Final back-matter page — confirm there is no orphan bleed page or blank page.

## Image / cover sanity (required before upload)

- [ ] Verify `OEBPS/images/cover.png` is at least 1600 × 2560 px (KDP minimum) and ≤ 50 MB.
- [ ] Verify `OEBPS/images/Michael.jpeg` (author photo) is at least 600 px on the long edge.
- [ ] All 16 chapter quote images render at intended page size without obvious compression artefacts.

## Font / licensing sanity

- [ ] Confirm OFL / EULA text is retained somewhere reachable for: Libre Baskerville, Cinzel Decorative, Montserrat.

## Accessibility (optional but recommended for EPUB)

- [ ] VoiceOver pass on Apple Books with at least the cover, chapter I, and bibliography.
- [ ] Confirm `epub:type` semantics survive in the reading system (some readers expose `epub:type="bibliography"` etc. as section labels).

## Sign-off

Before upload, the human reviewer should sign off on this checklist and either store it with the project or attach to the publication record.
