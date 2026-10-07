# Sizing Reference: Formulas, Anchors, and Sources

Contents: 1. Sample-size formula · 2. Quick-reference tables · 3. Duration math · 4. Multiple comparisons · 5. Stable-delivery floor · 6. Practitioner kill/judge anchors (attributed) · 7. Proxy-metric evidence · 8. Academic reality check · 9. Spend-tier guidance · 10. Naming-convention source

## Table of Contents

- [1. Sample-size formula](#1-sample-size-formula)
- [2. Quick-reference tables (sample per cell)](#2-quick-reference-tables-sample-per-cell)
- [3. Duration math and bounds](#3-duration-math-and-bounds)
- [4. Multiple comparisons](#4-multiple-comparisons)
- [5. Stable-delivery floor](#5-stable-delivery-floor)
- [6. Practitioner kill/judge anchors - attributed](#6-practitioner-killjudge-anchors---attributed)
- [7. Proxy-metric evidence](#7-proxy-metric-evidence)
- [8. Academic reality check](#8-academic-reality-check)
- [9. Spend-tier guidance](#9-spend-tier-guidance)
- [10. Naming-convention source](#10-naming-convention-source)

## 1. Sample-size formula

Two-proportion test, per cell, alpha 0.05 two-tailed (Z = 1.96), 80% power (Z = 0.84):

```
n = ( 1.96 × sqrt(2 × p̄ × (1−p̄)) + 0.84 × sqrt(p1(1−p1) + p2(1−p2)) )² / (p2 − p1)²
```

p1 = baseline rate; p2 = p1 × (1 + relative MDE); p̄ = (p1 + p2) / 2.

Shortcut (within a few percent, using p̄): `n ≈ 16 × p̄(1−p̄) / MDE²`, MDE in absolute terms. Worked: 5% baseline, detecting a 1-point absolute lift (5%→6%): 16 × 0.055 × 0.945 / 0.0001 ≈ **8,300 per cell** (the exact formula gives ~8,100).

Worked anchors, computed from the exact formula above:

- 2% baseline, 50% relative lift (2%→3%): ~3,800 per cell.
- 5% baseline, 20% relative lift (5%→6%): ~8,100 per cell.
- 5% baseline, 5% relative lift (5%→5.25%): ~122,000 per cell.
- Halving the MDE roughly quadruples n; a 1% baseline needs ~5× the sample of a 5% baseline for the same relative MDE.

Published calculators disagree with these by a few percent because they differ on pooled vs unpooled variance. That spread is irrelevant next to the decision the number drives - do not chase it.

The "~100 conversions per variant" and "25-50 conversions minimum" rules that circulate correspond roughly to detecting only large (>30-50%) relative effects; the "100-400 conversions per variant" band is community convention with no single traceable authority. Use them as what they are: thresholds for a Directional read, not for a Powered one.

## 2. Quick-reference tables (sample per cell)

| Baseline | 10% rel. lift | 20% rel. lift | 50% rel. lift |
| -------- | ------------- | ------------- | ------------- |
| 1%       | 163,000       | 43,000        | 7,700         |
| 3%       | 53,000        | 14,000        | 2,500         |
| 5%       | 31,000        | 8,100         | 1,500         |
| 10%      | 15,000        | 3,800         | 700           |

Per cell - double each figure for the two-cell total, and multiply by the number of cells for the whole test. Units are observations at the metric's denominator (impressions for CTR, clicks for post-click CVR, and so on). Read the table before promising anyone a significance-tested creative winner on a conversion metric.

## 3. Duration math and bounds

```
required duration (days) = required sample per cell / projected daily events per cell
projected daily events   = daily cell budget / cost per event
```

- Floor: one full week minimum, always - day-of-week composition; two business cycles for B2B.
- Ceiling: ~4-6 weeks - beyond it, novelty decay, fatigue, and external events contaminate the read, and the opportunity cost of blocked test slots compounds.
- If required duration exceeds the ceiling, those are the only four levers, ranked by power recovered per unit of effort and learning given up: **up-funnel read > wider MDE > fewer cells > more budget**. Per-axis breakdown and the re-ranking conditions are in SKILL.md section 4, where the choice is made.

## 4. Multiple comparisons

Testing k variants against control inflates family-wise error. Standard correction: divide alpha by the number of comparisons (Bonferroni).

Practical effect: ~3 variants raises required sample per cell roughly 30-40%. Media buyers rarely apply it; the plan should either correct alpha or reduce the cell count - and must at minimum disclose how many comparisons the test runs.

## 5. Stable-delivery floor

- Delivery algorithms need roughly **50 optimization events per cell per rolling 7 days** for stable delivery; below that the cell stays delivery-limited and its numbers are unstable regardless of sample math. The count is per cell (ad-set level), not per asset.
- Minimum daily budget per cell ≈ **target CPA × 50 ÷ 7**. Example: $35 CPA → ~$250/day/cell.
- Fixes when the floor cannot be met, ranked by events recovered per unit of effort: **consolidate cells** (near-zero - a restructure before launch) **> optimize on a higher-funnel event with more volume** (a decision plus a tracking check) **> improve signal capture** (server-side event feeds - an engineering project, highest ceiling, slowest, and the only one carrying a consent-scope review). Re-rank when server-side capture already exists, which makes the third fix near-free and moves it first.
- Perspective: crossing from delivery-limited to stable is worth a modest ~5-10% efficiency gain. The floor matters for read validity, not as a performance unlock - "spend more to escape learning" is bad advice when unit economics are already poor.
- Roughly half of low-budget campaigns never stabilize; over-segmentation (too many thin cells) is the most common self-inflicted cause.

## 6. Practitioner kill/judge anchors - attributed

Treat these as starting defaults to adapt against account history, not laws. Adopt exactly one - they contradict each other. Rows are in efficiency order (decision quality per unit of test spend burned): **Hott > Denney > CTC > Bachman > Faris**; the per-axis breakdown, the default rung, and the conditions that reorder it are in SKILL.md section 6, where the choice is made.

| Source                                    | Rule                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Barry Hott                                | Rejects mechanical ad-level CPA kill rules: "Ad-level CPA and ROAS is irrelevant! The system isn't trying to get you the best CPA on every individual ad, it's trying to get you the most possible conversions for your overall budget." Method: comparative benchmarking of new ads against the best ads' spend/CPA range in a controlled fixed-budget environment. Also the named "champion vs challenger" framing |
| Dara Denney (Thesis; Motion)              | Budget per test ≈ avg CPA × 50 conversions (e.g. $35 CPA → $1,750 total, ~$250/day for a week); 6 ads per test; do not evaluate before day 3; kill an ad at 2× average CPA with no purchase; kill the ad set if no winner after 5-7 days; scale winners by +50-100%, done 2-3 times                                                                                                                                  |
| Common Thread Collective (Taylor Holiday) | Kill on spend thresholds, not time: no activation by $500-1,000 spend (~72 hours to 7 days) → kill; allow 10-15% of testing budget for longer-runway ads                                                                                                                                                                                                                                                             |
| Jess Bachman (FireTeam)                   | "Until you at least spend enough to get a purchase or spend 3-4 times your CPA at least, you haven't given that new creative a chance to prove itself"                                                                                                                                                                                                                                                               |
| Andrew Faris (AJF Growth)                 | No manual kill rule; launch new creative into the evergreen structure under bid caps so the platform enforces the CPA ceiling; on when to pause: "never"                                                                                                                                                                                                                                                             |
| Motion (vendor blog)                      | Minimum before evaluating: ≥2,000 impressions, 50-100 clicks, or 3-5 purchases per creative, and ≥3 days runtime; kill at CTR <50% of control or CPA >25% worse than target sustained 48-72h; ~10,000 impressions or 1,000 conversions for directional reads. Explicitly decides winners on comparative thresholds, not statistical significance                                                                     |

**Folklore correction - do not launder this.** The ubiquitous "spend 1× CPA before judging / 3× CPA before killing" rules are **untraceable folklore**: repeated across agency blogs, attributed to no identifiable originator, and sometimes mis-attributed to Barry Hott, who publishes the opposite position (above). The closest properly attributed anchors are Bachman's "3-4× CPA before judging" and Denney's "2× CPA no-purchase kill". Cite those, with their names, or cite nothing.

The impression-threshold convention (~1,000-2,000 impressions before judging a hook-rate gate) is common practice, not an authoritative rule.

## 7. Proxy-metric evidence

- Funnel Insiders: an analysis of $1.47M in ad spend across client accounts found **no statistically significant correlation between thumbstop (hook) rate alone and revenue**.
- Two ads at an identical hook rate can differ several-fold in return, because the gate metric says nothing about how many of those viewers were still watching at the call to action.
- Published hook-rate "good" bands conflict from ~18% to ~40% across vendors - set gate thresholds from the account's own trailing median, never from a published band.
- Practitioner consensus: hook rate is most predictive in cold prospecting, least at bottom-funnel; high hook rate + low conversion usually signals an offer/landing-page problem. Gates must be compared like-for-like by placement, or a placement-mix shift crowns an accidental winner.

## 8. Academic reality check

- **Lewis & Rao, "The Unfavorable Economics of Measuring the Returns to Advertising"** (Quarterly Journal of Economics 130(4), 2015): across 25 large field experiments, "informative advertising experiments can easily require more than 10 million person-weeks"; "the median confidence interval on return on investment is over 100 percentage points wide."
- **Gordon, Zettelmeyer, Bhargava & Chapsky** (Marketing Science 38(2), 2019): 15 large ad experiments; observational methods (the pixel/last-click reads most kill decisions rely on) "often fail to produce the same effects as the randomized experiments," typically overestimating effectiveness.
- **Braun & Schwartz** (Journal of Marketing, 2025, DOI 10.1177/00222429241275886): even platform-native A/B tests are confounded by **divergent delivery** - platforms "deliver different ads to distinct and undetectably optimized mixes of users that vary across ads, even during the test," which can "confound the magnitude, and even the sign, of ad A/B test results." Only holdout/lift designs isolate the creative effect.

Implication for the plan: in-platform results - including deterministic splits - are relative screening reads. Reserve geo-holdout / conversion-lift designs for channel-level and big-swing decisions where causality is worth its cost.

## 9. Spend-tier guidance

| Monthly spend | What testing can honestly be                                                                                                                         | Practitioner guidance                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Under ~$20k   | No significance. Proxy-gated screening only: gate metric kills obvious losers cheaply, then relative CPA picks scalers. 5-15 concept-level ads/month | Testing viability generally starts around $20k/month (Denney)                                            |
| $20k-100k     | Dedicated fixed-budget test structure, one concept per cell, 4-6 assets each; Denney's numeric defaults apply                                        | ~2 concepts/week × 2 hooks × 2 visuals at $30-100k (Savannah Sanchez); ~10-15 ads per $50k (Manson Chen) |
| $100k-1M      | Full program: dedicated test cells plus cost-cap throttles; 40-70 new ads/month at 8-figure scale (CTC)                                              | Layer a rolling incrementality program to validate that in-platform winners are causal                   |
| $1M+          | Continuous: 80-150 ads/month (CTC); winners recycled; incrementality on top                                                                          | Testing-budget share: Denney recommends ≥20% of spend on testing; CTC 40-50% early-stage, 20-30% mature  |

Outlier economics (CTC, single-agency data across 170+ brands - strong prior, not a universal constant):

- The top 3.5% of ads generate 66% of spend.
- ~79% of ads never reach $1,000 spend before being killed.
- Discovery of an outlier takes ~18-81 days.

Creative testing is a power-law portfolio game - plan volume accordingly (if outliers are ~3.5% of tests and you need 3/month, plan ~86 tests/month).

## 10. Naming-convention source

The structured variant-name pattern in SKILL.md follows documented practice: Growth-Rocket's format `HOOK-Question_FORMAT-UGC_OFFER-FreeTrial_V03`, and Motion's naming glossary encoding source, format/concept, messaging, hook, product, talent, asset length, offer, landing-page type, and test parameters.

Three-level discipline:

- Campaign encodes objective/funnel/geo.
- Cell (ad set) encodes audience/optimization.
- Asset encodes concept/hook/format/version.

Creative-reporting tools are syntactic parsers - garbage in, garbage out.
