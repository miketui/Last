# Pre-Mortem + Council Review — Optimized Build

Final-output review of the two artifacts in this folder. `/llm-council` and
`/pre-mortem` are not registered skills in this environment, so both exercises
were performed directly and are recorded here.

## Validator / tool results (all green)

| Check | Tool | Result |
|---|---|---|
| EPUB conformance | EPUBCheck 5.1.0 (EPUB 3.3) | **0 fatals / 0 errors / 0 warnings** |
| XHTML well-formedness (all 48 files) | xmllint | **All well-formed** |
| OPF + NCX well-formedness | xmllint | **OK** |
| PDF structure | qpdf --check | **No syntax/stream errors** |
| Embedded fonts (KDP) | pdffonts | **0 non-embedded** (Helvetica issue fixed) |
| Blank pages | rasterize + ink analysis | **0 of 464** |
| Page size | pdfinfo | **481.92 × 691.92 pt = 6.69 × 9.61 in (Royal)** |
| Page numbers | overlay | Present; suppressed on openers/quotes/front matter |
| Image alt text | grep | **37/37 images have alt** |
| PDF size | Ghostscript /printer 300dpi | 24 MB → **9.6 MB** |

## Pre-mortem — "It's launch day and it went wrong. Why?"

| Risk | Verdict | Mitigation in this build |
|---|---|---|
| KDP rejects PDF for non-embedded fonts | **Resolved** | Folio font (Montserrat) embedded; pdffonts shows 0 unembedded |
| Wrong trim size | **Resolved** | Exactly 6.69 × 9.61 in on every page |
| Blank pages padding the count / interrupting flow | **Resolved** | 32 manufactured blanks dropped; 0 remain |
| Over budget on page count | **Resolved** | 464 pp (target < 490) |
| Invisible/white-on-white text | **Checked** | No page below 0.43% ink; dark pages render white text legibly |
| Quiz/worksheet spilling to 2 pages | **Resolved** | Single-page across all 16 chapters; Ch I Key Takeaways moved to body |
| EPUB invalid for retailers | **Resolved** | Passes EPUBCheck 3.3 clean |
| Title overflow / clipped headline | **Resolved** | Title-page heading reduced 4.5rem→17pt, fits trim |
| Gutter too tight for binding | **Watch** | 0.75in inside (KDP min for 301–500 pp); uniform (Chromium can't alternate) |
| Heavy ink on 24 dark pages (cost/show-through) | **Accept** | Kept by direction; flagged for author |
| Editorial errors in body copy | **Out of scope** | Layout pass only; a full fact-check was not performed |

No launch **blockers** remain for upload; the watch/accept items are noted for
the author's call.

## Council review (five lenses)

1. **Production / KDP** — Trim, embedded fonts, no blanks, single PDF, valid
   EPUB: upload-ready. Keep inside margin ≥ 0.75in (met).
2. **Typography** — 10.5/1.34 Libre Baskerville body, consistent heading scale,
   drop-cap chapter openers, single-page quizzes/worksheets. Clean and even.
3. **Editorial / structure** — Every chapter follows opener → content →
   endnotes → quiz (4 MCQ) → worksheet → image-quote. Key Takeaways live in
   chapter content. Front/back matter intact.
4. **Accessibility** — All images carry alt text; language + title + creator
   set; ligatures disabled in print so copy/paste & screen readers extract
   cleanly.
5. **Reader / bestseller experience** — Continuous flow (no dead pages),
   professional title page, branded chapter openers, consistent interactive
   pages. Reads as a finished, premium interactive workbook.

## Honest limitations

- Page numbers are a stamped overlay (continuous), not CSS margin boxes, because
  EPUBCheck rejects `@page` margin boxes in EPUB CSS and Chromium ignores them.
- Recto/verso gutter alternation is not applied (Chromium print limitation);
  margins are uniform and meet KDP minimums.
- This was a layout/formatting/packaging pass — not a copyedit or fact-check of
  the prose.
