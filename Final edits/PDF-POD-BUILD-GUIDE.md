# PDF Print-on-Demand (POD) Build Guide
## Curls & Contemplation: A Stylist's Interactive Journey
### By Michael David

---

## Print Production Spec Sheet

| Spec | Value |
|------|-------|
| **Trim Size** | 6.69" x 9.61" |
| **Interior Ink** | Black & white |
| **Paper** | White |
| **Bleed** | No bleed |
| **Binding** | Perfect bound softcover |
| **Book Type** | Premium guided workbook / journey journal / nonfiction hybrid |
| **Fonts** | Embedded in final PDF |
| **Proof Required** | Yes — order physical proof before final approval |

---

## Interior Layout Structure

### Front Matter
1. Title Page
2. Copyright Page
3. Table of Contents
4. Dedication
5. First Self-Assessment Worksheet
6. Affirmation Odyssey Worksheet
7. Preface
8. Preface Quote Page

### Main Body — 4 Parts, 16 Chapters

**Part I: Foundations of Creative Hairstyling**
- Chapter I: Unveiling Your Creative Odyssey
- Chapter II: Refining Your Creative Toolkit
- Chapter III: Reigniting Your Creative Fire

**Part II: Building Your Professional Practice**
- Chapter IV: The Art of Networking in Freelance Hairstyling
- Chapter V: Cultivating Creative Excellence Through Mentorship
- Chapter VI: Mastering the Business of Hairstyling
- Chapter VII: Embracing Wellness and Self-Care
- Chapter VIII: Advancing Skills Through Continuous Education

**Part III: Advanced Business Strategies**
- Chapter IX: Stepping Into Leadership
- Chapter X: Crafting Enduring Legacies
- Chapter XI: Advanced Digital Strategies for Freelance Hairstylists
- Chapter XII: Financial Wisdom — Building Sustainable Ventures
- Chapter XIII: Embracing Ethics and Sustainability in Hairstyling

**Part IV: Future-Focused Growth**
- Chapter XIV: The Impact of AI on the Beauty Industry
- Chapter XV: Cultivating Resilience and Well-Being in Hairstyling
- Chapter XVI: Tresses and Textures — Embracing Diversity in Hairstyling

### Back Matter
- Conclusion
- Conclusion Quote Page
- Quiz Key
- Self-Assessment Worksheet
- Affirmations Close Worksheet
- Continued Learning Commitment
- Acknowledgments
- About the Author
- Journaling Start
- Manifesting Journal
- Journal Page
- Professional Development Worksheet
- SMART Goals Worksheet
- Self-Care Journal
- Vision Journal
- Doodle Page
- Bibliography

---

## Chapter Layout Pattern

Each chapter follows this exact flow:

1. **Chapter Title Page**
   - Centered Roman numeral / chapter marker (teal accent)
   - Stacked chapter title (strong white typography on black background)
   - Scripture block (gold rule accent)
   - "INTRODUCTION" heading
   - Drop-cap opening paragraph

2. **Chapter Body**
   - Clean, high-contrast body text
   - Generous margins with strong gutter allowance

3. **Endnotes**
   - Clearly labeled ENDNOTES section
   - Page break after

4. **Quiz Page**
   - Starts on a new page

5. **Worksheet Page**
   - Starts on a new page
   - May run to 2 pages only if truly necessary for writing space

6. **Image Quote Page**
   - Final page of the chapter
   - Grayscale image with quote overlay

---

## Visual Style

- Premium black-background chapter opener system
- Strong white title typography
- Teal chapter numeral / marker accent
- Gold scripture-rule accent
- Clean, high-contrast body text
- Grayscale image quote pages

---

## Print Design Priorities

- Generous margins (0.75" top/bottom, 0.70" outside, 0.95" gutter minimum)
- Strong gutter allowance — the book is long
- Clean chapter starts (each chapter begins on a new page)
- Intentional blank verso pages only when needed
- Embedded fonts in final PDF
- High-resolution images for quote pages (300 DPI minimum)

---

## Workbook / Journal Logic

- Worksheet pages should remain usable for writing — prioritize function over compression
- Journal pages should have enough space to feel intentional
- Doodle / creative pages can remain open-ended
- In print, these pages prioritize function over compression
- Input fields render as blank lines (via `print.css` styling)
- The `.epub-download-cta` div is hidden in print (`display: none`)

---

## Required Tool: PrinceXML (or Alternative)

The `print.css` stylesheet uses PrinceXML-specific features (`@page`, margin boxes, `target-counter()`).

### Option A — PrinceXML (Recommended)
```bash
# Download from https://www.princexml.com/download/
# Install per platform instructions, then:

# Create ordered file list
cat > print-files.txt << 'LIST'
Final edits/OEBPS/xhtml/1-TitlePage.xhtml
Final edits/OEBPS/xhtml/2-Copyright.xhtml
Final edits/OEBPS/xhtml/3-TableOfContents.xhtml
Final edits/OEBPS/xhtml/4-Dedication.xhtml
Final edits/OEBPS/xhtml/5-SelfAssessment.xhtml
Final edits/OEBPS/xhtml/6-AffirmationOdyssey.xhtml
Final edits/OEBPS/xhtml/7-Preface.xhtml
Final edits/OEBPS/xhtml/7a-preface-quote.xhtml
Final edits/OEBPS/xhtml/8-Part-I-Foundations-of-Creative-Hairstyling.xhtml
Final edits/OEBPS/xhtml/9-chapter-i-unveiling-your-creative-odyssey.xhtml
Final edits/OEBPS/xhtml/10-chapter-ii-refining-your-creative-toolkit.xhtml
Final edits/OEBPS/xhtml/11-chapter-iii-reigniting-your-creative-fire.xhtml
Final edits/OEBPS/xhtml/12-Part-II-Building-Your-Professional-Practice.xhtml
Final edits/OEBPS/xhtml/13-chapter-iv-the-art-of-networking-in-freelance-hairstyling.xhtml
Final edits/OEBPS/xhtml/14-chapter-v-cultivating-creative-excellence-through-mentorship.xhtml
Final edits/OEBPS/xhtml/15-chapter-vi-mastering-the-business-of-hairstyling.xhtml
Final edits/OEBPS/xhtml/16-chapter-vii-embracing-wellness-and-self-care.xhtml
Final edits/OEBPS/xhtml/17-chapter-viii-advancing-skills-through-continuous-education.xhtml
Final edits/OEBPS/xhtml/18-Part-III-Advanced-Business-Strategies.xhtml
Final edits/OEBPS/xhtml/19-chapter-ix-stepping-into-leadership.xhtml
Final edits/OEBPS/xhtml/20-chapter-x-crafting-enduring-legacies.xhtml
Final edits/OEBPS/xhtml/21-chapter-xi-advanced-digital-strategies-for-freelance-hairstylists.xhtml
Final edits/OEBPS/xhtml/22-chapter-xii-financial-wisdom-building-sustainable-ventures.xhtml
Final edits/OEBPS/xhtml/23-chapter-xiii-embracing-ethics-and-sustainability-in-hairstyling.xhtml
Final edits/OEBPS/xhtml/24-Part-IV-Future-Focused-Growth.xhtml
Final edits/OEBPS/xhtml/25-chapter-xiv-the-impact-of-ai-on-the-beauty-industry.xhtml
Final edits/OEBPS/xhtml/26-chapter-xv-cultivating-resilience-and-well-being-in-hairstyling.xhtml
Final edits/OEBPS/xhtml/27-chapter-xvi-tresses-and-textures-embracing-diversity-in-hairstyling.xhtml
Final edits/OEBPS/xhtml/28-Conclusion.xhtml
Final edits/OEBPS/xhtml/28a-conclusion-quote.xhtml
Final edits/OEBPS/xhtml/29-QuizKey.xhtml
Final edits/OEBPS/xhtml/30-SelfAssessment.xhtml
Final edits/OEBPS/xhtml/31-affirmations-close.xhtml
Final edits/OEBPS/xhtml/32-continued-learning-commitment.xhtml
Final edits/OEBPS/xhtml/33-Acknowledgments.xhtml
Final edits/OEBPS/xhtml/34-AbouttheAuthor.xhtml
Final edits/OEBPS/xhtml/35-JournalingStart.xhtml
Final edits/OEBPS/xhtml/36-ManifestingJournal.xhtml
Final edits/OEBPS/xhtml/37-journal-page.xhtml
Final edits/OEBPS/xhtml/38-professional-development.xhtml
Final edits/OEBPS/xhtml/39-SMARTGoals.xhtml
Final edits/OEBPS/xhtml/40-self-care-journal.xhtml
Final edits/OEBPS/xhtml/41-VisionJournal.xhtml
Final edits/OEBPS/xhtml/42-DoodlePage.xhtml
Final edits/OEBPS/xhtml/43-bibliography.xhtml
LIST

# Build combined PDF
prince --input-list=print-files.txt \
       --style="Final edits/OEBPS/style/print.css" \
       --style="Final edits/OEBPS/style/fonts.css" \
       -o CurlsAndContemplation-Print.pdf
```

### Option B — WeasyPrint (Free, Open Source)
```bash
pip install weasyprint
# WeasyPrint does not support @page margin boxes, so page numbers
# and running headers will not render. Manual post-processing needed.
weasyprint "Final edits/OEBPS/xhtml/1-TitlePage.xhtml" output.pdf
```

### Option C — Bun Script with Puppeteer
```bash
bun install puppeteer
bun run scripts/build-pdf.ts
```

---

## Print CSS Configuration

The `print.css` at `Final edits/OEBPS/style/print.css` handles print-specific styling:

- **Page size**: Update `@page` to `6.69in 9.61in` for the correct trim
- **Page margins**: Asymmetric for gutter binding (0.95" inside, 0.70" outside)
- **Font embedding**: All fonts are in `Final edits/OEBPS/fonts/` (WOFF2 format)
- **Page breaks**: Chapters start on new pages via `.page-break-before`
- **Color handling**: B&W interior — grayscale images, no color ink
- **TOC page numbers**: Placeholder numbers in `<span class="toc-page-number">` — update after first PDF proof

**Important**: The `@bottom-center` page number rule is commented out for EPUB compatibility. For PrinceXML PDF builds, uncomment it in a print-specific copy:
```css
@page {
  size: 6.69in 9.61in;
  @bottom-center {
    content: counter(page);
    font-family: 'Montserrat', Arial, sans-serif;
    font-size: 9.5pt;
  }
}
```

---

## Image Requirements for Print

| Requirement | Status |
|-------------|--------|
| All images 300 DPI minimum | Check chapter quote JPEGs with `identify -verbose` |
| Color space: Grayscale for B&W interior | Convert sRGB images to grayscale before final export |
| Cover image: separate file, not in interior | `cover.png` needs separate high-res cover PDF |
| SVG fallback | `brushstroke.svg` used in print; PNG fallback for EPUB |

To check image DPI:
```bash
identify -verbose "Final edits/OEBPS/images/chapter-i-quote.jpeg" | grep -i resolution
```

---

## Pre-Upload Checklist for KDP

- [ ] **Trim size**: Confirm 6.69" x 9.61" in KDP setup
- [ ] **Interior ink**: Black & white
- [ ] **Paper**: White
- [ ] **Bleed**: No bleed
- [ ] **ISBN**: Assign Print ISBN (currently placeholder in `2-Copyright.xhtml`)
- [ ] **Cover PDF**: Separate cover file (front + spine + back) at 300 DPI
  - Spine width = page count x paper thickness (usually 0.002252" per page for white paper)
  - KDP Cover Calculator: https://kdp.amazon.com/en_US/cover-calculator
- [ ] **Interior PDF**: Generated from PrinceXML with embedded fonts
- [ ] **TOC page numbers**: Update placeholder numbers in `3-TableOfContents.xhtml` to match actual PDF pagination
- [ ] **Font embedding**: Verify all fonts embedded with `pdffonts CurlsAndContemplation-Print.pdf`
- [ ] **Proof copy**: Order a physical proof before approving for distribution

---

## Quick Build Commands

```bash
# Step 1: Update @page size to 6.69in x 9.61in in print.css
# Step 2: Uncomment @bottom-center in print.css for page numbers
# Step 3: Build PDF
prince --input-list=print-files.txt \
       --style="Final edits/OEBPS/style/print.css" \
       -o CurlsAndContemplation-Print.pdf

# Step 4: Verify fonts
pdffonts CurlsAndContemplation-Print.pdf

# Step 5: Check page count for spine calculation
pdfinfo CurlsAndContemplation-Print.pdf | grep Pages

# Step 6: Update TOC page numbers to match actual pagination
# Step 7: Rebuild PDF with corrected TOC
# Step 8: Generate cover PDF using KDP Cover Calculator dimensions
# Step 9: Upload interior + cover to KDP
```

---

## KDP Upload Configuration Summary

| Setting | Value |
|---------|-------|
| Trim | 6.69" x 9.61" |
| Ink | Black ink |
| Paper | White |
| Bleed | No bleed |
| Interior PDF | Fonts embedded |
| Proof | Required before final approval |

---

## Export / Production Intent

- **PDF** is fixed-layout for POD — this is the print master
- **EPUB** is separate and reflowable — do NOT treat EPUB styling as the print master
- Each format has its own CSS: `print.css` for PDF, `style.css` for EPUB

---

## Distribution Platforms

| Platform | Interior Format | Cover Format | Notes |
|----------|----------------|--------------|-------|
| Amazon KDP | PDF (embedded fonts) | PDF (with spine) | Free to publish, ~60% royalty |
| IngramSpark | PDF/X-1a preferred | PDF (with spine) | $49 setup, wider retail distribution |
| Barnes & Noble Press | PDF | PDF | Free, B&N retail only |
| Lulu | PDF | PDF | Free, global distribution option |

---

## Dual ISBN Strategy

Use separate ISBNs:
- **Print ISBN**: For the softcover POD edition
- **Digital ISBN**: For the EPUB edition (already in `content.opf` as placeholder)

Do NOT reuse the same ISBN for both formats. Purchase from Bowker (myidentifiers.com) or your national ISBN agency.
