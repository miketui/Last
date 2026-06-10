# Curls & Contemplation — Phase 2 Pre-Mortem
## "It is six months after launch, and the book has failed. Why?"
### June 9, 2026 — seeded by the Phase 1 forensic findings

Classification scheme:
- **TIGER** — real, will bite, must be actively mitigated.
- **PAPER TIGER** — looks scary, low actual probability or low actual damage.
- **ELEPHANT** — the thing in the room nobody wants to name; not a discrete event but a structural truth.

---

## Failure Scenarios

### T1. TIGER (LAUNCH-BLOCKING) — "The fabrication thread gets pulled."
A reviewer, a stylist on TikTok, or a journalist googles "Greener Salon & Spa New York 25% energy" or "TJ Maxx Styled by Runway incubator," finds nothing, and posts "this book's case studies are made up." Once one example fails, every real example becomes suspect — including the genuinely verified ones (Coombes, Villa, Mielle). For a book whose subtitle promise is *wisdom*, fabrication is the single most lethal attack vector, and the named-real-person variants (Pecis as a fictional character's mentor; Nikki Nelms' invented practices; uncited Kimble/Twine quotes) add legal-adjacent exposure to the credibility exposure.
- **Evidence:** Phase 1 M6–M11, m16, m22 — five likely-invented businesses in Ch XIII alone; 6+ unverifiable verbatim quotes; composite naming a real mentor.
- **Mitigation:** 48-hour "anonymize-or-source" sweep: every named person/business either gets a citation that resolves, gets anonymized ("a Seattle salon"), or gets cut. Move composite disclosures into body text. Delete unverifiable quotation marks (paraphrase instead).
- **Owner:** Michael (with the existing 32-row citation workbook as the tracking surface).
- **Decision date:** June 13, 2026 — before any rebuild.

### T2. TIGER (LAUNCH-BLOCKING) — "Zondervan sends a letter, or KDP quality-flags the scripture."
Seventeen-plus NIV epigraphs with no copyright notice. The gratis license (≤500 verses, <25% of work) almost certainly covers the usage volume, but the license is **conditional on printing the exact notice**. Without it, the quotation is unlicensed. Worst case is not a lawsuit; it's a takedown/quality complaint during your launch window — the highest-leverage two weeks of the campaign.
- **Evidence:** M5; Ch VII's "(NIV)" tag confirms the translation.
- **Mitigation:** Add the standard NIV notice to the copyright page; normalize translation tagging; verse-count to confirm gratis-license fit (it fits).
- **Owner:** Michael.
- **Decision date:** June 11, 2026 (same edit session as ISBN insertion).

### T3. TIGER (LAUNCH-BLOCKING) — "Kindle buyers feel baited."
~18 locations tell ebook buyers to "Download the Printable Worksheet Pack" and route to a page that offers no download and suggests buying the print edition. For a $9.99 Kindle buyer, that reads as an upsell trap. Expected outcome: a handful of 1–2★ reviews in week one ("worksheets don't exist") — and early reviews disproportionately weight the lifetime rating.
- **Evidence:** M3; fallback file inspected directly.
- **Mitigation (preferred):** Ship the real worksheet pack as a MailerLite-gated download (you already have the funnel infrastructure, group 182303148544623709) — converts the liability into a list-building engine. Fallback: rewrite the CTA honestly.
- **Owner:** Michael; MailerLite automation is paste-ready from the funnel build.
- **Decision date:** June 16, 2026 — pack live before upload, or CTA rewritten.

### T4. TIGER — "The London bio quietly poisons the brand story."
"Michael is based in London" contradicts the LA-based positioning on michaeldavidjr.beauty, press outreach, and the RESET/TAYLKOMB ecosystem. A podcast booker or journalist who fact-checks the bio against the site finds a discrepancy on page one of due diligence — small, but it's the kind of small that kills bookings silently.
- **Evidence:** M12; About the Author page, both editions.
- **Mitigation:** One-paragraph rewrite (LA-based, Brooklyn-raised, London chapter as history). Re-voice "mum" if keeping American register.
- **Owner:** Michael. **Decision date:** June 11, 2026.

### T5. TIGER — "Death by a thousand citation cuts."
Five chapters with no in-text markers, orphaned bibliography entries, seven endnote↔bibliography URL mismatches, a bootleg Bandura PDF link, a misattributed PubMed study, and a discontinued app (Woebot) recommended as a resource. No single item sinks the book; together they hand any hostile close-reader (an IPPY judge, a trade reviewer, a rival educator) a pattern story: "sloppy scholarship."
- **Evidence:** M13, m7, m10, m17, m18.
- **Mitigation:** One mechanical citation-hygiene pass against the existing 90-URL workbook; relabel unanchored lists "Selected References"; delete orphans; fix the seven URL pairs; swap Woebot for an active alternative.
- **Owner:** Michael. **Decision date:** June 18, 2026.

### T6. TIGER — "ISBN placeholder slips through the rebuild."
Obvious, but pre-mortems exist because obvious things ship. A rebuild under deadline pressure that pulls the wrong source file reprints `978-X-XXXXXXX-X-X` into the paperback proof — costing a proof cycle (7–10 days) at the worst possible time.
- **Evidence:** B1.
- **Mitigation:** Make ISBN insertion a checklist gate with a grep (`978-X`) in the build script; order the physical proof early.
- **Owner:** Michael. **Decision date:** at rebuild, before upload.

### PT1. PAPER TIGER — "The verso chapter openers get the book rejected."
KDP does not reject books for verso openers; this is a craft standard, not a platform requirement. It matters for IPPY-class judging and professional polish, not for launch survival. Fix it in the layout pass (M4), but do not let it delay the integrity fixes.

### PT2. PAPER TIGER — "Quiz/body drift produces angry readers."
Seven quizzes reference material the chapters never teach (m8). Real flaw — but every answer key still resolves unambiguously, and self-assessment quizzes in trade nonfiction are read generously. Fix opportunistically when each chapter is opened for T1 edits; not launch-blocking on its own.

### PT3. PAPER TIGER — "epubcheck was never officially run."
The custom validator covered the structural failure modes that actually reject uploads, and the EPUB passed 0/0/0/0. Risk that official epubcheck finds a blocking error is low — but the mitigation costs five minutes on a local machine, so run it. Scary-sounding, cheap to retire.

### PT4. PAPER TIGER — "The widow on p. 434 / folio inconsistencies / dagger legend embarrass the typography."
One widow in 465 pages is an excellent ratio; folio suppression and the †/‡/§ legend are 30-minute fixes. Judges notice; buyers don't. Batch into the layout pass.

### E1. ELEPHANT — "The anecdotes are a memoir-integrity time bomb nobody has ruled on."
The book's first-person anecdotes oscillate between confessional honesty (Ch XI: "I haven't yet dedicated as much time to my socials as I should") and specific autobiographical claims (Ch XVI: mentorship under Christo Fifth Avenue; Ch VIII: "the workshop that changed everything"). Some are clearly composite/aspirational; some name real, living people. There is no stated policy — no author's note saying "some anecdotes are composites." The elephant: **only Michael knows which anecdotes are literally true**, and the book currently implies all of them are. One author's-note sentence ("Some client and learning anecdotes are composites; identifying details have been changed") retires the entire class of risk — but someone has to decide to write it.
- **Owner:** Michael. **Decision date:** June 13, 2026, alongside T1.

### E2. ELEPHANT — "The real risk isn't quality — it's that the launch engine fires into a void."
The audit can make the book bulletproof, and the book can still fail commercially if the three funnels, the tripwire, and the audience activation don't execute. Every week spent polishing m-level findings is a week not spent on the back+spine wrap (your own stated highest-priority design lever) and the launch calendar. The pre-mortem's structural truth: **integrity fixes are necessary but not sufficient; the binding constraint after June 18 is distribution, not manuscript quality.** Timebox the fixes (one week), then pivot hard to launch ops.

### E3. ELEPHANT — "One person is the entire QA, legal, fact-check, and production department."
Every mitigation above has the same owner. That is the single point of failure. Cheap hedges: have one trusted reader (e.g., Brandon or a Haus of Basquiat editor-adjacent contact) do a hostile-reviewer read of Chapters IV, V, XIII only (the fabrication-dense chapters) before upload; and run the grep-gates (ISBN placeholder, "Download the Printable", "based in London") as automated checks in the build script so human fatigue can't ship them.

---

## Launch-Blocking Summary Table

| ID | Scenario | Class | Mitigation | Owner | Decision date |
|----|----------|-------|------------|-------|---------------|
| T1 | Fabricated examples exposed | Tiger 🚫 | Anonymize-or-source sweep | Michael | Jun 13 |
| T2 | NIV permission gap | Tiger 🚫 | Add notice to copyright page | Michael | Jun 11 |
| T3 | Dead-end worksheet CTA | Tiger 🚫 | Ship gated pack via MailerLite | Michael | Jun 16 |
| T4 | "Based in London" bio | Tiger | Rewrite paragraph | Michael | Jun 11 |
| T5 | Citation-hygiene pattern | Tiger | Mechanical pass vs workbook | Michael | Jun 18 |
| T6 | ISBN slips rebuild | Tiger 🚫 | grep gate + early proof | Michael | At rebuild |
| E1 | Anecdote-truth policy | Elephant | Composite author's note | Michael | Jun 13 |
| E2 | Polishing past the point of leverage | Elephant | Timebox fixes; pivot to launch ops | Michael | Jun 18 hard stop |
| E3 | Single-owner QA | Elephant | Hostile-read of Ch IV/V/XIII + grep gates | Michael (+1 reader) | Before upload |

🚫 = cannot upload until resolved.
