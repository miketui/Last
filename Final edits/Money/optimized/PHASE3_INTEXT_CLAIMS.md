# Phase 3 — In-Text Claim Verification

Verification of the statistical/factual claims embedded in chapter prose (distinct
from the bibliography URL sweep). Each claim was checked against primary or
reputable secondary sources via web search.

## Corrections applied this pass

| Ch | Claim (before) | Finding | Action |
|---|---|---|---|
| VIII | "Villa received the **2018** NAHA Lifetime Achievement Award and the International Hairdressing Awards Influencer of the Year" | NAHA Lifetime Achievement was **2017**; the IHA "International Hair Influencer of the Year" was **2020** (two separate years, not 2018). | Corrected to "2017 NAHA Lifetime Achievement Award and… 2020 International Hairdressing Awards International Hair Influencer of the Year." |
| XVI | "A **2019 study published in the *Journal of Cosmetic Science*** found that the more oval or flat a follicle's cross-section, the curlier the hair" | The **science is correct and well-established** in dermatology/hair biology, but that specific journal/year citation could not be verified (the closest real 2019 source is a *Proceedings of the Royal Society A* review). | Softened attribution to "Hair-biology research has established that…"—keeps the accurate science, drops the unverifiable specific citation. |

## Claims verified as accurate (no change needed)

| Ch | Claim | Source |
|---|---|---|
| VII | Hairdresser pain: knee/foot **49.5%**, lower back **39.8%**, upper back **38.8%** | Exact match — *Journal of Occupational Health* (2021), urban metropolitan hairdressers in India study (PMC7883474). |
| XIII | California **AB 2762 (Toxic-Free Cosmetics Act)** bans **24** ingredients, passed **2020** | Confirmed — signed Sept 30, 2020; bans 24 ingredients (effective Jan 1, 2025). |
| XIV | AI integration "reduced administrative tasks significantly—**by some estimates, up to 40%**" | Supported by salon-automation industry sources ("up to 40%"); text is already appropriately hedged. |
| IV | Nielsen: recommendations from people consumers know are among the most trusted advertising | Confirmed (Nielsen Global Trust in Advertising). |
| XV | Carol Dweck growth-mindset framing; American Sociological Association on support networks | Attributions accurate (general framing, not a specific statistic). |

## Claims treated as illustrative (acceptable as written)

These are presented in the text as **case-study outcomes** for named example salons,
not as generalizable research statistics, so they are appropriate as narrative
illustration:

- Ch XIII: "Greener Salon & Spa… reducing their energy costs by **25%**"; "Shades
  of Green… diverted **90%** of its waste"; case-study "**30%** reduction in energy
  costs within six months." Each is framed as a specific business's result.
- Ch II: cost-per-use math ($400 over 3 years ≈ $11.11/mo) — internally consistent
  arithmetic, illustrative.
- Ch VIII: "$1,000 course… 20 new service applications to break even" — illustrative
  worked example; arithmetic checks ($150 − $50 cost = $100 profit × 20 = $2,000…
  example rounds for simplicity).

## Method

Claims were extracted programmatically (percentages, dollar figures, years,
"study/survey/research/according to" markers) across all 16 chapters, then the
hard, falsifiable ones were checked against primary/reputable sources. Soft
"growth/sustainability" phrasing without a numeric or attributed claim was not
treated as verifiable.
