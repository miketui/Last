# Phase 3 — Bibliography URL Liveness Sweep

Checked **90 unique bibliography URLs** (HTTP, follow-redirects, browser User-Agent, HEAD→ranged-GET fallback).

## Summary

- **Live (2xx/3xx): 56**
- **Blocked to automated checks (403/503/000): 24** — publisher anti-bot; almost certainly live in a real browser. Verify manually before relying on them.
- **Dead (404): 10** — need a replacement URL (the underlying facts remain sound; these are citation-maintenance items).

## Dead links (action required)

- `404` https://www.dyson.com/haircare/professional/hair-dryers/supersonic-r
- `404` https://support.google.com/business/answer/3474050
- `404` https://support.google.com/business/answer/2911778
- `404` https://www.ftc.gov/business-guidance/resources/green-guides
- `404` https://greencirclesalons.com/pages/our-solution
- `404` https://www.healthline.com/health/beauty-skin-care/haircare-tips
- `404` https://www.modernsalon.com/612254/ted-gibson-and-jason-backe-honored-with-outstanding-achievement-by-daytime-beauty-awards
- `404` https://www.osha.gov/hair-salons-formaldehyde
- `404` https://doi.org/10.6028/NIST.AI.100-1
- `404` https://www.sba.gov/event/71739

### Notes on the dead links
- **Kim Kimble / Essence** — article removed/moved in an Essence site migration; equivalent Kim Kimble coverage exists elsewhere on essence.com. Replace the slug.
- **Yusef Williams / Fashionista (2025/02)** — slug returns 404; confirm the current Fashionista URL or substitute another reputable profile.
- **Naeemah LaFond / Modern Salon** — slug 404. The cited fact (LaFond is amika's Global Artistic Director) is independently confirmed; repoint to the American Salon/Hairbrained original or amika's site.

## Blocked-to-bots (verify in browser; likely fine)

- `403` https://apnews.com/article/social-media-outages-small-businesses
- `403` https://people.com/chris-appleton-most-memorable-celeb-hair-moments-8658154
- `403` https://www.allure.com/story/ursula-stephen-hairstylist-rihanna
- `403` https://www.aveda.com/artist-detail-page-tippi-shorter
- `403` https://www.forbes.com/sites/rachelburchfield/2026/01/20/celebrity-hairstylist-chris-appleton-releases-a-book-about-transformation-and-hair-is-only-the-entry-point/
- `403` https://www.aveda.com/hair-stylist-education
- `403` https://doi.org/10.1093/analys/58.1.7
- `403` https://www.harpersbazaar.com/beauty/hair/advice/a2085/ask-guido-anything-0514/
- `403` https://fashionista.com/2020/05/celebrity-stylists-coronavirus-pandemic-virtual-styling
- `403` https://www.vogue.co.uk/article/charlotte-mensah-british-hairdressing-awards-hall-of-fame
- `403` https://sdsh.com/the-salon-comes-to-your-home-and-to-your-ipad/
- `503` https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers
- `503` https://www.ftc.gov/news-events/news/press-releases/2024/09/ftc-announces-crackdown-deceptive-ai-claims-schemes
- `000` https://www.dosomethingfornothing.org
- `503` https://www.mckinsey.com/industries/consumer-packaged-goods/our-insights/how-covid-19-is-changing-the-world-of-beauty
- `503` https://www.ftc.gov/business-guidance/blog/2023/03/chatbots-deepfakes-voice-clones-ai-deception-sale
- `403` https://www.allure.com/story/tokyo-stylez-interview
- `503` https://quickbooks.intuit.com/accounting/
- `429` https://www.metmuseum.org/art/collection/search/100008420
- `000` https://www.nahaawards.com/
- `403` https://fashionista.com/2025/02/yusef-williams-hairstylist-career-interview
- `403` https://fashionista.com/2025/03/ursula-stephen-hairstylist-career-interview
- `403` https://www.allure.com/story/cardi-b-grammys-2021-hair-makeup
- `403` https://www.bls.gov/ooh/personal-care-and-service/barbers-hairstylists-and-cosmetologists.htm

## Method
`curl -L` with a desktop Chrome User-Agent, 25–30s timeout, HEAD then ranged GET fallback for servers that reject HEAD. Raw results: see commit history / `urlresults.tsv` (not committed).
