# BUILD MANIFEST — Curls & Contemplation, Final Pre-Publication Build
**Build date:** June 10, 2026 · **Branch:** `claude/curls-contemplation-final-build-qbhl74`
**Policy:** Phase 3 council verdict — SUBTRACT, DON'T CITE. Source of truth: `Final edits/OEBPS/xhtml/`.

## Deliverables
| File | Description |
|---|---|
| `Curls-and-Contemplation-FINAL.epub` | EPUB 3.3, packaged mimetype-first (stored), epubcheck-clean |
| `Curls-and-Contemplation-POD-Royal-6_69x9_61-FINAL.pdf` | KDP Royal 6.69×9.61 in POD interior, Chromium/Skia render, fonts embedded |
| `BUILD-MANIFEST.md` | This file |

## Decisions supplied by Michael (June 10, 2026)
| Key | Decision |
|---|---|
| ISBN_PAPERBACK / ISBN_EBOOK | Not yet purchased ("I have to buy number first") → placeholder ISBN block **removed** from copyright page so no placeholder can ship. Re-add real numbers + 5-minute rebuild after purchase. |
| CHRISTO_ANECDOTE | FALSE → fictionalized to "a master curl specialist" (Ch XVI) |
| CHAPMAN_CASE | Drop the unverified Utah location, keep the case study (Ch IV) |
| WORKSHEET_URL | REWRITE-HONEST → all CTAs and the fallback page rewritten honestly (no dead-end download promise) |

## Toolchain (installed and verified this session)
| Tool | Version |
|---|---|
| OpenJDK | 21.0.10 |
| epubcheck | 5.1.0 (official W3C jar) |
| poppler-utils (pdfinfo/pdftotext/pdftoppm/pdffonts) | 24.02.0 |
| Ghostscript | 10.02.1 |
| xmllint / libxml | 20914 |
| Chromium (Playwright, render engine) | 148.0.7778.96 |
| python3 + lxml, beautifulsoup4, pypdf 6.13.1, reportlab, Pillow | installed |
| zip/unzip | system |

## Phase 1 finding dispositions

### Blocker
| ID | Disposition |
|---|---|
| B1 | **Fixed (decided-by-Michael).** Placeholder ISBN block deleted from `2-Copyright.xhtml`; nothing fake can print. Real ISBNs to be inserted post-purchase (v1.0 rebuild, ~5 min). |

### Majors
| ID | Disposition |
|---|---|
| M1 | **Fixed.** nav.xhtml: Parts I–IV are now links to their Part pages; toc.ncx rebuilt with nested Part navPoints (depth 2, 40 navPoints). Full parity with the print TOC structure. |
| M2 | **Fixed.** False `printPageNumbers` accessibility claim removed from content.opf (no page-list nav exists). |
| M3 | **Fixed (decided-by-Michael: REWRITE-HONEST).** All 11 "Download the Printable Worksheet Pack" CTAs rewritten with no-commitment copy ("This page works beautifully with your own notebook or journal. Companion printable resources, as they become available, are announced at michaeldavidjr.beauty — details here."); `worksheet-download-fallback.xhtml` rewritten to the same no-promise standard. Zero "Download the Printable" strings remain. (Phase 1's "~18 locations" resolved to exactly 11 CTA blocks + the fallback page in the EPUB sources.) |
| M4 | **Fixed (build).** `build-pod-final.py` pads blank versos so the Title page, all 4 Part openers, all 16 chapter openers, and the Conclusion land recto (odd folio). Verified in build output below. |
| M5 | **Fixed.** Standard Biblica/Zondervan NIV notice added verbatim to the copyright page; the lone "(NIV)" tag (Ch VII epigraph) removed so all epigraphs are tagged uniformly. |
| M6 | **Fixed (subtract).** Micaela Erlanger case study anonymized to "one celebrity fashion stylist"; invented 2022-book/TJ Maxx/WWD-quote specifics deleted; supporting endnote deleted and Ch IV endnotes renumbered (anchors verified both directions). |
| M7 | **Fixed (decided-by-Michael).** "small town in Utah" deleted; Chapman case retained without geography. |
| M8 | **Fixed (subtract).** Townsend quote converted to attribution-safe paraphrase (no quotation marks); non-locatable "PBA interview" endnote deleted. |
| M9 | **Fixed (subtract).** Composite disclosure moved into the body at the Marco Reyes introduction; James Pecis name removed ("a leading editorial stylist"); the composite's quotes no longer reference any real person; Vogue/Harper's Bazaar claims generalized to "major fashion publications"; endnote 6 already disclosed the composite and is retained, now consistent with the body. |
| M10 | **Fixed (subtract).** All five unverifiable Ch XIII businesses anonymized ("one New York salon", "a Los Angeles salon", "a Seattle salon", "one Atlanta salon", generic collectives); specific metrics softened to qualitative; Nikki Nelms claim removed. Zero hits for all five names + Nelms. |
| M11 | **Fixed (soften).** Ch XII: Bronner Bros./Rucker Roots/Mielle internal-process claims recast as industry-level illustrations. Ch XIV: Sephora fulfillment, L'Oréal "Idea Lab" (named program deleted), Orveon AI-formulation, Aveda predictive analytics, Estée Lauder ML forecasting, L'Oréal smart-factory — all recast as industry-level statements ("large beauty groups like…"). The correct Orveon/Shiseido acquisition fact retained. ModiFace and Novi/Good Face Project retained (verifiable, unflagged). |
| M12 | **Fixed.** Bio now reads "Brooklyn-raised, Michael is now based in Los Angeles."; "mum" → "mom"; London remains framed as the past Rihanna chapter. |
| M13 | **Fixed (minimum fix per registry).** Ch XV and XVI unanchored "Endnotes" relabeled "Selected References"; XVI orphans (Tippi Shorter Aveda page; Cosmo Prof World of Texture) deleted from the chapter list and from the bibliography. Ch XI/XII/XIV already used "Selected References". |

### Minors
| ID | Disposition |
|---|---|
| m1 | **Deferred to v1.1 (deliberate).** Roman-numeral front matter, running headers, and small-caps-after-drop-cap require a print-pipeline redesign; Phase 2 (PT4) and Phase 3 both class these as judge-level polish, not launch-blocking. The June-18 hard stop allocates those hours to the storefront. |
| m2 | **Fixed.** Canonical titles enforced on every surface: Ch IX "Stepping Into Leadership" (sr-only h1, conclusion h2, image alt); Ch X "Crafting Enduring Legacies" (HTML title, worksheet header, image alt); Ch XII "Financial Wisdom — Building Sustainable Ventures" (HTML title, nav, NCX, print TOC); Ch XVI "Tresses and Textures — Embracing Diversity in Hairstyling" (HTML title, title-line em dash, nav, NCX, print TOC). |
| m3 | **Fixed.** Ch VIII footnotes renumbered cleanly 1–18 (former 2a → 3); list reordered; all anchors verified both directions; zero byte-size drift. |
| m4 | **Fixed (build).** Front-matter imposition now conventional: half-title p.1 (recto) → blank → title p.3 (recto) → copyright p.4 (verso). |
| m5 | **Fixed.** Ch III adjacent markers now render "4,5" (comma separator; both anchors intact). |
| m6 | **Fixed.** Ch IV lead-in now "As the saying often attributed to Maya Angelou goes,". |
| m7 | **Fixed.** All seven endnote↔bibliography pairs canonicalized to one URL each (live-tested where reachable): People/Appleton (non-possessive slug, matching the Yahoo syndication slug; people.com hard-blocks bots), Dyson `hair-care/hair-dryers/supersonic-r` (HTTP 200; citation retitled to the consumer product), AOL `entertainment/jen-atkin-gets-candid-her-171015077.html` (both variants 200 and identical; current-format URL chosen), Green Circle `/how-it-works/` (200), OSHA `/hair-salons` (200), FTC `/legal-library/browse/rules/green-guides` (200; business-guidance variant 404), BLS `barbers-hairstylists-and-cosmetologists.htm` (current slug; bls.gov bot-blocks). NIST AI RMF: bibliography aligned to the chapter's DOI `https://doi.org/10.6028/NIST.AI.100-1`. T3: the bibliography's Smooth ID entry legitimately anchors the Ch II endnote and is retained; Ch XIII's Cura Luxe mention is a product example needing no citation (a Cura Luxe product URL could not be verified live, so none was invented). |
| m8 | **Fixed.** All seven drifted quizzes realigned to body content with answer letters preserved and unambiguous: II Q4 (B), IV Q1 (B), VIII Q3 (A), IX Q2 (B) and Q3 (C), XI Q2 (C), XIII Q2 (C); XII Q3 she→they pronoun drift fixed (C). All other quiz blocks byte-identical to the audited state. |
| m9 | **Fixed.** Ch VI and Ch IX worksheets now use the standard "[Chapter Title] — Reflection & Planning" header. |
| m10 | **Fixed.** Bandura citation: publisher corrected to W.H. Freeman; bootleg uky.edu PDF link and "accessed" clause deleted (print-book citation needs no link; no replacement URL invented). |
| m11 | **Fixed.** Ch VII markers now read 1–5 in reading order (India-study note ↔ Atkin note swapped consistently); section 3.B's Actionable Steps moved back into 3.B (verbatim) with heading normalized to the section's inline style. |
| m13 | **Fixed.** "Understanding Business Entity Structures" moved verbatim to before the Selected References. |
| m14 | **Fixed.** All 16 †/‡/§ symbols removed from Ch X headers (the registry's "symbol removal" option; resolves the duplicate-‡ defect too). |
| m15 | **Fixed.** Olaplex reworded to the product model: "its patented bond-building products are now used in salons worldwide…". |
| m16 | **Fixed (subtract).** Kimble quote → paraphrase; Twine quote → paraphrase, "educator" descriptor removed (kept "founder of Briogeo Hair Care"); François consultation advice was already paraphrase (no quotation marks) and is retained with his name; "Shannon King" and "Lala Inuti" anonymized to role descriptions with paraphrase. |
| m17 | **Fixed (verified against live PubMed).** PMID 20385661 is Wahlström J, Mathiassen SE, Liv P, Hedlund P, Ahlgren C, Forsman M, *Annals of Occupational Hygiene* 54(5), 2010, 584–594. Corrected in the Ch XV reference and the bibliography. |
| m18 | **Fixed.** Woebot (discontinued) replaced with the SAMHSA National Helpline (1-800-662-4357, 24/7); "National Suicide Prevention Lifeline" renamed "988 Suicide & Crisis Lifeline" (legacy 800 number retained). |
| m19 | **Fixed.** Roosevelt attribution hedged: "— commonly attributed to Eleanor Roosevelt". |
| m20 | **Fixed.** `.quote-box` keep-together rule added to print.css; the "I lead with integrity." manifesto callout can no longer split. Post-build widow scan below. |
| m21 | **Fixed (build).** One folio rule, applied uniformly: folios print on every page EXCEPT (a) inserted blanks, (b) the front-matter display files, (c) the standalone image-quote pages, and (d) the first page of every spine file (all section openers are folio-free — including the Preface, Conclusion, and back-matter openers Phase 1 flagged as inconsistent). |
| m22 | **Fixed (subtract).** Jackie Carr → "one stylist" in the rural Midwest (metrics softened); "Textured Hair Elevated Summit" → "national textured-hair education events". |
| m23 | **Fixed (decided-by-Michael: FALSE).** Christo/Christo Fifth Avenue mentorship fictionalized to "a master curl specialist"; zero "Christo" occurrences remain anywhere in the sources. |

### Nits
| Item | Disposition |
|---|---|
| sba.gov/event/71739 (Ch VI ×1, Ch XII ×1) | Fixed → evergreen https://www.sba.gov/business-guide |
| Ch V fn 1 psycnet URL | Fixed → https://doi.org/10.1037/0021-9010.89.1.127 (DOI registration verified; full volume/issue/pages added) |
| Ch VII India-study generalization | Fixed → "In one study of urban hairdressers in India, nearly half reported…" |
| @md.warren handle vs pen name | Retained deliberately (registry: "likely intentional — confirm"). Flagged for Michael below. |
| Ch IV truncated award name | Fixed → "British Hairdressing Awards Hall of Fame" |
| Ch IV "My Networking Journey" heading | Fixed → "Networking Journeys: From Wallflower to Connected Professional" |
| Ch IX Jill Buck / Matt Swinney | Retained (registry: claims generic/safe) |
| Ch XIV "up to 40%" | Fixed → qualitative ("substantially reduced administrative tasks") |
| Ch XIII "up to 30% energy" general stat | Fixed (removed in the M10 sweep). The 30% figure inside the anonymous illustrative case study remains as story detail; the quiz no longer repeats it. |
| PDF p.250 mirror-margin flip | Obsolete — the rebuilt PDF uses uniform margins throughout (same as the audited May-29 build); no per-page mirror flip exists. |
| Footnote "↑" backlinks printing in POD | Fixed — `a.backlink { display: none }` added to print.css (EPUB keeps the functional backlinks; logged as an intentional parity difference). |
| Bibliography: Palau under "G"; Healthline parenthetical | Fixed — re-alphabetized as "Palau, Guido" under P; editorial parenthetical deleted |

### Pre-mortem / council items
| ID | Disposition |
|---|---|
| E1 (anecdote policy) | **Fixed.** Composite-anecdote Author's Note added to the copyright page; Ch V composite disclosed in body text. |
| T6 (ISBN slips rebuild) | **Mitigated.** `978-X` grep gate run on sources and both built artifacts (0 hits); ISBN block removed entirely pending purchase. |
| E3 (grep gates automated) | **Done.** Full gate list run this build (output below); rerunnable. |

## Verification gates (outputs from this build)

**epubcheck 5.1.0** on `Curls-and-Contemplation-FINAL.epub`:
```
Validating using EPUB version 3.3 rules.
No errors or warnings detected.
Messages: 0 fatals / 0 errors / 0 warnings / 0 infos
```

**XML well-formedness:** all 46 XHTML files + nav.xhtml + toc.ncx + content.opf pass `xmllint --noout` (49/49).

**Grep gates** across all EPUB/PDF sources — every pattern returned **0 hits**:
`978-X`, `based in London`, `Download the Printable`, `XXXXXXX`, `Greener Salon`, `Shades of Green`, `Sustainable Shears`, `True Eco Beauty`, `Eco Salon Collective`, `Nikki Nelms`, `James Pecis`, `Erlanger`, `Shannon King`, `Lala Inuti`, `Jackie Carr`, `Textured Hair Elevated`, `Christo`, `Woebot`, `van der Molen`, `TJ Maxx`, `Idea Lab`, `sba.gov/event`, `uky.edu`, `psycnet`, `(NIV)`, `Sustaining Excellence`, `National Suicide Prevention Lifeline`, plus all seven superseded URL slugs.

**Quiz key:** 16/16 chapters re-verified. The Quiz Key file is unchanged (I:BBCB II:CADB III:ACBD IV:BCBB V:BBBC VI:BCBB VII:DACB VIII:BCAD IX:CBCB X:CCBC XI:BCCC XII:BBCB XIII:BCCB XIV:CCBB XV:BCBC XVI:BBCB). Git diff proves quiz edits are confined to the eight realigned questions (II Q4, IV Q1/Q3-stem, VIII Q3, IX Q2/Q3, XI Q2, XII Q3, XIII Q2); each preserves its answer letter and remains unambiguous; the other chapters' quiz blocks are byte-identical.

**PDF gates:**
```
pdfinfo:  Pages: 480 · Page size: 481.92 x 691.92 pts (= 6.693 x 9.61 in, KDP Royal trim)
pdffonts: every font row embedded (yes); 0 Helvetica / 0 non-embedded fonts
          (the raw Chromium+overlay build carried an unused non-embedded
          Helvetica resource from the folio overlays; the Ghostscript
          /prepress finishing pass — same as the audited May-29 pipeline —
          strips it. Verified post-pass.)
Recto openers (physical page from the build's page map — all odd):
  Title 3 · Part I 17 · Ch I 19 · Ch II 49 · Ch III 69 · Part II 79 ·
  Ch IV 81 · Ch V 107 · Ch VI 133 · Ch VII 157 · Ch VIII 175 ·
  Part III 209 · Ch IX 211 · Ch X 239 · Ch XI 267 · Ch XII 295 ·
  Ch XIII 325 · Part IV 359 · Ch XIV 361 · Ch XV 391 · Ch XVI 415 ·
  Conclusion 439
  Build assertion: "All recto-required openers land on odd pages."
Imposition: 33 manufactured blanks dropped; 13 recto-padding blanks inserted
  (folio-free, counted in pagination); margins identical to the audited
  build (0.75in left/right, 0.6in top/bottom — gutters unchanged).
Printed TOC: re-injected from the final page map; programmatic parity check
  of all 36 entries against the page map: OK.
Widow/orphan re-scan (every page, text-extraction heuristic, ≤2 stranded
  short lines flags a page): 1 hit — p.1, which is the half-title display
  page ("CURLS & / CONTEMPLATION"), not a widow. Zero genuine candidates.
  Two real strands found and fixed during the build: the Ch XV intro tail
  (p.393, fixed via intro-paragraph keep-together) and the Conclusion
  valediction (p.442, fixed by wrapping the closing paragraph + signature
  in a keep-together container).
Folio rule (m21): one uniform rule — no folio on inserted blanks,
  front-matter display files, standalone image-quote pages, or the first
  page of any spine file; folios on every other page.
Note: final page count is 480 (audited build was 465): +13 recto blanks,
  +2 net reflow from the integrity edits and keep-together rules.
```

## EPUB ↔ PDF parity — intentional differences (complete list)
1. The PDF excludes `0-Cover.xhtml` (KDP wants a separate cover file) and `worksheet-download-fallback.xhtml` (non-linear, EPUB-only).
2. Worksheet-pack CTA asides are visible in the EPUB and hidden in print (`.epub-download-cta`/CTA print rules — pre-existing) — the honest rewrite therefore only surfaces in the EPUB.
3. Endnote "↑" backlinks are functional in the EPUB and suppressed in print (new `a.backlink` rule, this build).
4. The printed TOC page numbers (`toc-page-number` spans) are populated for print and hidden by the reflowable EPUB styling (pre-existing).
5. The PDF inserts blank versos for recto imposition and stamps physical-page folios; the EPUB reflows.
No unintentional content differences: both artifacts are packaged/rendered from the identical `Final edits/OEBPS` source tree in the same build session.

## File-change list (complete)
- `Final edits/OEBPS/content.opf` — printPageNumbers removed; dcterms:modified stamped at build
- `Final edits/OEBPS/nav.xhtml` — Part links; canonical XII/XVI titles
- `Final edits/OEBPS/toc.ncx` — rewritten with nested Parts; canonical titles
- `Final edits/OEBPS/style/print.css` — quote-box keep-together; backlink suppression
- `Final edits/OEBPS/xhtml/2-Copyright.xhtml` — ISBN block removed; NIV notice; Author's Note
- `Final edits/OEBPS/xhtml/3-TableOfContents.xhtml` — canonical XII/XVI titles; folios re-injected from the new page map
- `Final edits/OEBPS/xhtml/5-SelfAssessment.xhtml`, `6-AffirmationOdyssey.xhtml`, `30-SelfAssessment.xhtml`, `35-JournalingStart.xhtml`, `36-ManifestingJournal.xhtml` (also m19), `37-journal-page.xhtml`, `38-professional-development.xhtml`, `39-SMARTGoals.xhtml`, `40-self-care-journal.xhtml`, `41-VisionJournal.xhtml`, `42-DoodlePage.xhtml` — honest CTA rewrite (11 files)
- `Final edits/OEBPS/xhtml/worksheet-download-fallback.xhtml` — honest rewrite
- `Final edits/OEBPS/xhtml/9…` (Ch I): untouched
- `Final edits/OEBPS/xhtml/10…` (Ch II): Dyson canonical URL + retitle; People canonical URL; quiz Q4
- `Final edits/OEBPS/xhtml/11…` (Ch III): m5 marker comma; AOL canonical URL
- `Final edits/OEBPS/xhtml/13…` (Ch IV): M6, M7, M8, m6, quiz Q1/Q3 stems, heading, award name, endnote renumber
- `Final edits/OEBPS/xhtml/14…` (Ch V): M9 (composite disclosure, Pecis removal, publication claims), psycnet→DOI
- `Final edits/OEBPS/xhtml/15…` (Ch VI): Bandura, worksheet header, SBA link
- `Final edits/OEBPS/xhtml/16…` (Ch VII): NIV tag; m11 marker order + steps move; India qualification
- `Final edits/OEBPS/xhtml/17…` (Ch VIII): m3 renumber 1–18; quiz Q3 stem
- `Final edits/OEBPS/xhtml/19…` (Ch IX): m2 "Into"; m9 header; quiz Q2/Q3; BLS canonical URL
- `Final edits/OEBPS/xhtml/20…` (Ch X): m2 titles; m14 daggers; m15 Olaplex
- `Final edits/OEBPS/xhtml/21…` (Ch XI): quiz Q2 alignment
- `Final edits/OEBPS/xhtml/22…` (Ch XII): m2 title; M11 softening ×3; m13 section move; quiz Q3; SBA link
- `Final edits/OEBPS/xhtml/23…` (Ch XIII): M10 anonymization; energy-stat softening; quiz Q2; Green Circle/FTC/OSHA canonical URLs
- `Final edits/OEBPS/xhtml/25…` (Ch XIV): M11 softening ×5; 40% removed
- `Final edits/OEBPS/xhtml/26…` (Ch XV): M13 relabel; m16 Kimble; m17 Wahlström; m18 SAMHSA + 988
- `Final edits/OEBPS/xhtml/27…` (Ch XVI): M13 relabel + orphans; m16 Twine/King/Inuti; m22 Carr/Summit; m23 Christo; m2 title
- `Final edits/OEBPS/xhtml/43-bibliography.xhtml` — Wahlström; Palau; Healthline; NIST DOI; orphan deletions
- `build-pod-final.py`, `build-epub-final.sh` — build scripts (new)

## For Michael — not asked, but you should know
1. **The `@md.warren` Instagram handle** on the About the Author page exposes the Warren surname against the Michael David pen name. The audit flagged it as "likely intentional — confirm." It ships as-is; change it in one line if not intentional.
2. **The worksheet copy makes no time-bound promise** — it says companion resources "as they become available" are announced at michaeldavidjr.beauty, which stays true whether the MailerLite pack ships next week or never. Shipping the pack (Phase 2 T3) is still the funnel win, but the book no longer depends on it.
3. **ISBNs remain the only open blocker** for the version of record: buy them, re-add the ISBN block to `2-Copyright.xhtml`, re-run the two build scripts, re-run epubcheck — under ten minutes total.
4. **Three soft claims the audit did not flag were additionally hedged in this build:** Ch XVI licensing claim now reads "a growing advocacy movement is pushing to make texture competency part of licensing requirements"; Ch XIV now says DaySmart Salon "advertises AI-assisted features designed to…" (vendor marketing is verifiable by nature); Ch VII now frames the Jen Atkin routine as her own interview account ("In interviews, Atkin has described…"), matching its Hoffman Institute citation.
