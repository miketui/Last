# Curls & Contemplation — V7 Pre-Publication Forensic Audit
## Phase 1 Final Report — June 9, 2026

**Artifacts audited:**
- `Curls-and-Contemplation-PUBLICATION.epub` (9.96 MB, 48-file spine, 84 files total)
- `Curls-and-Contemplation-POD-Royal-6_69x9_61-INTERIOR.pdf` (465 pages, 6.693×9.61 in trim, Ghostscript build dated May 29, 2026)

---

## VERDICT: **FIX-FIRST** (do not upload to KDP yet)

The production engineering is strong — clean validation, correct quiz key, accurate printed TOC, sound ROI math, embedded fonts, KDP-passing gutters, and only one widow in 465 pages. What blocks launch is **content integrity**: one hard blocker (placeholder ISBNs), a legal exposure (NIV scripture permission), a credibility exposure (a pattern of likely-invented named businesses/people and unverifiable verbatim quotes attributed to real industry figures), an ebook-buyer trust exposure (dead-end "download" CTAs in ~18 locations), and a factually wrong author bio ("based in London"). All are fixable in days, not weeks.

---

## COVERAGE & METHOD STATEMENT (read this first)

1. Every spine file — front matter, Preface, Affirmation Odyssey, Chapters I–XVI, Conclusion, all 15 back-matter files, and the 119-entry bibliography — was read **line-by-line in full** during this audit. No file is reported clean without a full read.
2. All 16 chapter quizzes were cross-verified against the Quiz Key: **16/16 answer sets match** (I:BBCB II:CADB III:ACBD IV:BCBB V:BBBC VI:BCBB VII:DACB VIII:BCAD IX:CBCB X:CCBC XI:BCCC XII:BBCB XIII:BCCB XIV:CCBB XV:BCBC XVI:BBCB).
3. **epubcheck could not be installed** (network proxy returned 403 on every distribution channel). A custom structural validator was substituted, covering OPF manifest/spine integrity, file presence, ID uniqueness, nav/NCX parsing, and internal href resolution: **0 fatal / 0 errors / 0 warnings**. Run official epubcheck locally before upload as belt-and-braces.
4. No subagent tooling was available in this environment; all work was performed directly by one auditor pass.
5. The PDF is a **465-page** build (the "334 pages" figure in prior project notes is stale — it referred to an earlier interior).
6. Fact-checks were performed against model knowledge (cutoff Jan 2026) without live web search; items marked "unverifiable" should be confirmed or cut, not assumed wrong.

---

## FINDINGS REGISTRY

Severity: **B** = Blocker (cannot ship), **M** = Major (ship-risk: legal, credibility, or reader-trust), **m** = Minor (quality/consistency), **N** = Nit.

### Blockers

| ID | Location | Issue | Fix |
|----|----------|-------|-----|
| B1 | Copyright page, both editions | ISBN placeholders `978-X-XXXXXXX-X-X` still present. | Insert real ISBNs (or KDP-assigned), rebuild both artifacts. |

### Majors

| ID | Location | Issue | Fix |
|----|----------|-------|-----|
| M1 | EPUB nav.xhtml + toc.ncx | 36 entries instead of 43 — the Part divisions are absent from both navigation documents (print TOC has all 43). | Regenerate nav/NCX with Part entries. |
| M2 | content.opf | OPF declares `printPageNumbers` accessibility feature but the EPUB contains **no page-list nav**. False accessibility metadata. | Either add a page-list nav or remove the claim. |
| M3 | 10 chapter worksheets + Business Health Check + 7 journal pages (~18 locations, EPUB) | "Download the Printable Worksheet Pack" CTAs route to `worksheet-download-fallback.xhtml`, which offers **no download** and tells ebook buyers to use the print edition. Review-bait for Kindle customers. | Stand up the real download URL (gated by MailerLite — this is also a list-building asset), or rewrite the fallback honestly ("pack coming — join the list"), or strip the CTA from the EPUB. |
| M4 | PDF pp. 66, 76, 126, 150, 168, 202, 230, 284 | 8 chapters open **verso** (left-hand page), violating the recto-opener standard declared in your own production spec. | Insert blanks / reflow so all chapter openers fall recto. |
| M5 | Every chapter epigraph | All 17+ epigraphs are NIV Bible quotations with **no scripture permission/translation notice**. Ch VII tags "(NIV)" — confirming the translation — while no other epigraph does. Zondervan/Biblica require a specific copyright notice for NIV quotation. | Add the standard NIV notice to the copyright page (usage appears within the ≤500-verse gratis license); normalize "(NIV)" tagging. |
| M6 | Ch IV | Micaela Erlanger case study entirely uncited: "2022 book" (her known book is 2018's *How to Accessorize*), an unrecognized "TJ Maxx Styled by Runway incubator," and an unverifiable verbatim 2021 WWD quote. | Verify against WWD or cut/replace the case study. |
| M7 | Ch IV | Heather Chapman described as "small town in Utah" — uncited and likely wrong (the known bridal educator of that name is Louisiana-based). | Verify or remove the geographic claim. |
| M8 | Ch IV | Mark Townsend verbatim quote cited only to a non-locatable "PBA interview" (endnote admits no URL/date). | Source it or paraphrase without quotation marks. |
| M9 | Ch V | "Marco Reyes" composite (disclosed only in endnote 6) names **real stylist James Pecis** as the fictional protagonist's mentor, with invented verbatim quotes and claimed Vogue/Harper's Bazaar features. Real-person-attribution hazard. | Move the composite disclosure into the body intro and remove or fictionalize the Pecis attribution. |
| M10 | Ch XIII | Cluster of likely-invented named businesses with specific metrics, all uncited: "Greener Salon & Spa" (NY, −25% energy cost), "Shades of Green" (LA, 90% waste diversion — fn 2 cites Green Circle generally, not this salon), "Sustainable Shears" (Seattle), "True Eco Beauty Salon" (Atlanta surcharge), "Eco Salon Collective." Plus an uncited specific behavioral claim about real stylist **Nikki Nelms** (cost-breakdown/sustainability practices). Only 2 endnotes in the book's longest chapter. | Replace named-business claims with verifiable examples or anonymize ("one New York salon…"), and cut/source the Nelms claim. |
| M11 | Ch XII + XIV | Uncited internal-operations claims about real companies stated as fact: Bronner Bros. seasonal cash-flow reviews; Rucker Roots' pricing process; Mielle's cost accounting (XII); Sephora "eco-conscious fulfillment centers"; L'Oréal "Idea Lab"; Orveon AI-formulation; Aveda predictive analytics; Estée Lauder ML forecasting (XIV). (The Orveon/Shiseido acquisition fact itself is correct.) | Soften to industry-level statements ("brands like…") or add sources. |
| M12 | About the Author | **"Michael is based in London."** You are based in Los Angeles; London was the Rihanna work period. The surrounding framing ("calls his mum") reinforces the error. Printed on a permanent page in both editions. | Correct to LA (Brooklyn-raised) and re-voice the paragraph. |
| M13 | Ch XI, XII, XIV, XV, XVI | Citation apparatus is broken in 5 of 16 chapters: XI/XII/XIV use unnumbered "Selected References" with **zero in-text markers**; XV/XVI label numbered lists "Endnotes" but also have **zero in-text markers** (unanchored), and XVI's list contains **orphaned entries** never referenced in the body (Tippi Shorter Aveda page; Cosmo Prof World of Texture). Chapters I–X and XIII use properly marked endnotes. | Pick one apparatus. Minimum fix: relabel XV/XVI lists "Selected References" and delete orphans; full fix: add markers. |

### Minors

| ID | Location | Issue |
|----|----------|-------|
| m1 | PDF interior | Production-spec misses: no Roman-numeral front matter, Ch 1 does not start on page 1, no running headers, no small-caps first word after drop caps. (Drop caps themselves render correctly; doubled letters in extraction are sr-only a11y markup.) |
| m2 | Ch IX, X, XII, XVI; nav | Title inconsistencies: Ch X HTML title **and worksheet** say "Sustaining Excellence and Building Your Legacy" while H1/TOC say "Crafting Enduring Legacies" (mismatch inside one file); Ch IX "into/Into"; XII/XVI em-dash vs colon variance between surfaces; several nav labels differ from H1s. |
| m3 | Ch VIII | Footnote sequence runs 1, 2, **2a**, 3–17 (anchor works; numbering is nonstandard). |
| m4 | Front matter | Title page falls verso / copyright recto — inverted from convention. |
| m5 | Ch III | Adjacent markers `<sup>4</sup><sup>5</sup>` render as "45" (sole instance). |
| m6 | Ch (epigraph/quote) | "People will never forget how you made them feel" attributed to Maya Angelou — Quote Investigator attributes to Carl W. Buehner. |
| m7 | Endnotes vs Bibliography | **7 URL mismatches** for the same sources: People/Chris Appleton (`-s-most` vs `-most`); Dyson (`/haircare/professional/...supersonic-r-professional` vs `/hair-care/...supersonic-r`); AOL/Jen Atkin (two entirely different slugs+dates); Green Circle (`/pages/our-solution` vs `/how-it-works/`); OSHA (`/hair-salons-formaldehyde` vs `/hair-salons`); FTC Green Guides (`/business-guidance/...` vs `/legal-library/...`); BLS (`barbers-hairdressers` old slug vs `barbers-hairstylists` current). Plus: bibliography's T3 entry cites the Smooth ID flat iron while Ch XIII discusses the Cura Luxe dryer; NIST AI RMF cited via DOI in-chapter, via nist.gov in bibliography. |
| m8 | Quizzes | Quiz/body drift — quizzes assert content the chapter never teaches (7 confirmed): Ch II Q4 (weekly disinfection / 6–12-month sharpening), Ch IV Q1 (Gibson "asking about challenges"), Ch VIII Q3 ("West Africa and Japan" appear only in the quiz), Ch IX Q2 ("emotional intelligence… team members" — quiz-only) and Q3 ("leadership style" — quiz-only), Ch XI Q2 ("cohesive brand identity… **her** community" vs a modest they-pronoun case study), Ch XIII Q2 (embellishes the case-study outcome). Pronoun drift she/they also in Ch XII Q3. Answer keys remain unambiguous, but the questions test untaught material. |
| m9 | Ch VI & IX worksheets | Use bare "Reflection Questions:" instead of the standard "[Title] — Reflection & Planning" header used by all other chapters. |
| m10 | Ch VI endnote 1 | Links a bootleg full-text PDF of Bandura's *Self-Efficacy* (uky.edu personal page) and cites publisher as "Worth Publishers" (commonly W.H. Freeman). Link the publisher/WorldCat instead. |
| m11 | Ch VII | Footnote markers appear out of reading order (1, 3, 2, 4, 5); section 3.B's Actionable Steps are displaced after 3.C's. |
| m13 | Ch XII | Body section "Understanding Business Entity Structures" is misplaced **after** the Selected References, before the quiz. |
| m14 | Ch X | †/‡/§ phase symbols decorate every Actionable Steps header with **no legend anywhere**, and ‡ is assigned to both Phase 2 *and* Phase 3. |
| m15 | Ch X | Olaplex described as "licensing its patented bond-building formula to salons worldwide" — mischaracterizes a public company's business model (it sells products); the cited Olaplex pages won't support a licensing claim. |
| m16 | Ch XV, XVI | Uncited verbatim quotes attributed to real people: Kim Kimble ("Challenges have always driven me…"), Nancy Twine ("You cannot solve a problem…" — also mislabeled "educator"), Vernon François (specific consultation advice); plus quotes from **unverifiable persons** "Shannon King" (salon owner/texture specialist) and "Lala Inuti" (marketing specialist). |
| m17 | Ch XV endnote 6 / bibliography | "Nina B. van der Molen et al." attributed to PMID 20385661 — that PMID's hairdresser upper-arm-posture study is by the Wahlström group; author, volume, and year look misattributed. Verify against PubMed. |
| m18 | Ch XV resources | **Woebot** recommended although its consumer app was discontinued in 2025; "National Suicide Prevention Lifeline" is the pre-2022 name (now 988 Suicide & Crisis Lifeline; legacy 800 number still listed is fine). |
| m19 | Manifesting Journal | Eleanor Roosevelt "future belongs to those who believe in the beauty of their dreams" — famously disputed attribution, presented flatly (while the nearby Aristotle quote is properly hedged "commonly attributed"). |
| m20 | PDF p. 434 | The book's single widow: the "I lead with integrity" manifesto callout splits across pp. 433–434, stranding its final line atop p. 434. |
| m21 | PDF folios | Page numbers hidden on chapter openers but visible on Preface (p. 12), Conclusion (p. 425), and back-matter openers — inconsistent suppression rule. |
| m22 | Ch XVI | "Jackie Carr in Rural Midwest" case study — unverifiable named person with detailed business claims; "Textured Hair Elevated Summit" — unverifiable organization name. |
| m23 | Ch XVI anecdote | First-person claim of mentorship "with curl specialist Christo of Christo Fifth Avenue" names a real, specific person as your mentor. **Author must confirm this is literally true**; your documented training lineage is Guido Palau / Jimmy Paul / Jawara. |

### Nits

| Location | Issue |
|----------|-------|
| Ch VI, XII (×2) | `sba.gov/event/71739` cited three times — event links rot; swap for evergreen SBA pages. |
| Ch V fn 1 | psycnet full-text URL is likely paywalled; cite the DOI. |
| Ch VII | "Nearly half of hairdressers experience knee and foot pain" generalizes an India-specific urban study (PMC7883474) without qualification (bibliography entry is honest). |
| About the Author | `@md.warren` handle exposes the Warren surname against the pen-name strategy (likely intentional — confirm). |
| Ch IV | "British Hairdressing **Awards** Hall of Fame" name truncated in one body mention; heading "My Networking Journey: From Wallflower to Connected Professional" promises a personal story but delivers Mensah/Gibson cases. |
| Ch IX | Jill Buck and Matt Swinney used as uncited named examples (claims are generic/safe). |
| Ch XIV | "reduced administrative tasks… by some estimates, up to 40%" — hedged but unsourced. |
| Ch XIII | "businesses saving up to 30% on energy costs" — uncited (Energy Star-style stat). |
| PDF p. 250 | Mirror-margin flip (gutter on wrong side) on one page. |
| PDF endnotes | Footnote "↑" backlinks print in the POD edition (web artifact). |
| Bibliography | Guido Palau alphabetized under "G"; Healthline entry contains an editorial parenthetical "(general health and wellness resource)". |

### Verified clean (a non-exhaustive list of what passed)

- Quiz Key: 16/16 chapters match. ROI tables (Ch XIII): all math correct, including break-evens. AB 2762 (CA Toxic-Free Cosmetics Act, 2020, 24 ingredients): correct. Name-spelling consistency: François 28/0, LaFond 14/0, Janell Stephens (Camille Rose) correct. Vidal Sassoon, Joshua Coombes/#DoSomethingForNothing, Lisa Price→L'Oréal, Ted Gibson NYC→LA arc (consistent across Ch XII and XV), Sam Villa NAHA 2017, Mielle/Monique Rodriguez, Bread Beauty Supply, The Lip Bar, Oyin Handmade, The Mane Choice, Pattern Beauty, Christo Fifth Avenue (as a real business), Christin Brown/Tomahawk Salon, Diane Da Costa, Andre Walker (1997), Lorraine Massey (2001): all check out. Aristotle quote properly hedged. Sontag and Kouzes/Posner quotes genuine. 988/Crisis Text Line numbers correct. Mental-health orgs (Boris Lawrence Henson Fdn, Loveland, Beauty 2 The Streetz, Therapy for Black Girls, Open Path): all real. Disclaimers present in Ch XII (financial) and Ch XV (wellness), with a correct Ch VII↔XV cross-reference note. Timeline: no hard contradiction between "ten years into my career" (Ch II), "three years into my freelance journey" (Ch VII), and "more than twelve years" (bio) — anecdotes are set at different career points. 143 typo candidates from the edit-distance scan: all false positives. Parity differences between editions: intentional. Gutters ≥0.86 in (KDP-compliant). Printed TOC page numbers accurate. One widow in 465 pages (m20); zero orphans.

---

## PRIORITY FIX ORDER

1. **B1** ISBNs → rebuild.
2. **M5** NIV notice (legal; 10-minute copyright-page fix).
3. **M12** Author bio "based in London" → LA.
4. **M3** Worksheet-pack CTA: build the real funnel asset or rewrite honestly.
5. **M6–M11 + m16/m22** Fact-integrity sweep: cut, anonymize, or source every named person/business claim flagged above. (Fastest safe path: anonymize the invented-sounding businesses, delete the unverifiable verbatim quotes, keep the verified ones.)
6. **M9/m23** Real-person attribution: Pecis and Christo — confirm or fictionalize.
7. **M1/M2/M13** Navigation + citation apparatus.
8. **M4, m20, m21, m2, m13, m14** Layout/consistency pass.
9. Run official epubcheck locally; re-run quiz-key spot check after edits.

---

*Method disclosures repeated for the record: no subagents available; epubcheck uninstallable behind proxy (custom validator substituted, 0/0/0/0); fact-checks from model knowledge (Jan 2026 cutoff) without live search; 465-page PDF supersedes the stale 334-page note.*
