# Worked Example Test Plans

Contents: 1. B2C ecommerce plan (full math) · 2. B2B lead-gen plan (Directional default) · 3. Negative example

All numbers below are illustrative scenario inputs; the formulas they run through are the ones in SKILL.md section 4.

## Table of Contents

- [1. B2C ecommerce - three angle concepts vs champion](#1-b2c-ecommerce---three-angle-concepts-vs-champion)
- [2. B2B lead gen - Directional by default](#2-b2b-lead-gen---directional-by-default)
- [3. Negative example - what this skill must never emit](#3-negative-example---what-this-skill-must-never-emit)

## 1. B2C ecommerce - three angle concepts vs champion

Scenario inputs:

- DTC skincare brand.
- Protected test budget $27,000/month ($900/day).
- Target CPA $30; observed CPC $1.50.
- Click→purchase rate 2.0%; click→add-to-cart rate 8%.
- Decision: which of three new messaging angles earns next quarter's production budget.

Feasibility math, shown so the plan can be audited:

- 4 cells (control + 3 concepts) at $225/day each. Stable-delivery floor = $30 × 50 ÷ 7 ≈ $214/day → passes. Projected conversions ≈ 225 ÷ 30 = 7.5/day ≈ 52/week per cell → clears ~50/week.
- Projected clicks ≈ 225 ÷ 1.50 = 150/day per cell.
- Powered check on purchase rate at a 25% relative MDE (2.0%→2.5%): required n ≈ 13,800 clicks/cell → ~92 days at 150 clicks/day → far beyond the 4-6 week ceiling → **not Powered on purchase**.
- Move the read up-funnel: add-to-cart at 8% baseline, 25% relative MDE (8%→10%): required n ≈ 3,200 clicks/cell → ~22 days → within bounds → **Powered on add-to-cart**.
- Purchases accumulated by day 22: 7.5/day × 22 ≈ 165/cell → enough for a relative CPA ranking, only detects very large gaps → **Directional on cost per purchase**.

```
CREATIVE TEST PLAN - Q3 angle test, 2026-08-26
decision    : winning angle gets Q4 production budget; losers' angles retired
hypothesis  : because reviews mention "routine takes too long" 3x more than price,
              a time-saved angle will lower cost per purchase ~20% vs the
              ingredient-story champion, for cold prospecting, by day 22
isolation   : single variable: angle (concept-level execution held to same
              format mix per cell) - high-leverage lever
structure   : 3 test cells + control champion, concurrent; manual fixed-budget
              cells $225/day each; automated creative-optimization: off
metrics     : gate = hook rate vs account trailing median, per placement,
              read only at >=2,000 impressions per asset
              primary = cost per purchase (decision), add-to-cart rate (powered read)
              guardrails = frequency, CPM vs account baseline, refund rate
cells       : C01_ANG-champion_V01 (control) | $225/day | 4 assets
              projected 52 conv/wk | VERDICT: reference cell, same rules
              C02_ANG-timesaved  | $225/day | 4 assets
              C03_ANG-sensitive-skin | $225/day | 4 assets
              C04_ANG-social-proof  | $225/day | 4 assets
              each test cell: projected ~52 conv/wk, ~150 clicks/day
              required (purchase, 25% MDE): n=13,800 clicks, ~$20,700, ~92d
                -> VERDICT: Directional read on cost per purchase
              required (add-to-cart, 25% MDE): n=3,200 clicks, ~$4,800, ~22d
                -> VERDICT: Powered on add-to-cart by day 22
              kill: asset at $60 spend (2x CPA) with zero purchases;
                    cell at $1,000 spend with no activated asset
              scale: best cell +50-100% budget; first scale step is its own read
              iterate: cell that wins add-to-cart but loses CPA -> landing-page
                       check before any creative iteration
schedule    : launch Mon | earliest evaluation day 3 | hard stop day 22 or
              3,200 clicks/cell, whichever first | inconclusive -> keep control
naming      : C##_ANG-<angle>_HOOK-<type>_FMT-<format>_TAL-<creator>_V##
caveats     : manual cells share auctions - overlap noted; divergent delivery
              means even a "Powered" read is relative, not causal; CPA verdict
              is directional and will be reported as a ranking, not a winner
              at 95% confidence
```

Note the double read standard, stated per metric: the cell is Powered on add-to-cart and Directional on purchase, and the plan says which claim each metric may make.

## 2. B2B lead gen - Directional by default

Scenario inputs:

- B2B security SaaS.
- Test budget $12,000/month ($400/day); CPL $80 on the form event.
- CRM-fed qualified-lead rate ~35% (cost per qualified ≈ $229).
- 90-day sales cycle.
- Decision: does a practitioner-fear angle beat the compliance-checklist champion.

Feasibility math:

- Stable-delivery floor on the lead event = $80 × 50 ÷ 7 ≈ $571/day per cell. Even a single test cell + control at $200/day each sits far below it → every cell is delivery-limited on the lead event. Raising budget is not available; consolidating below 2 cells is impossible (a test needs a control).
- Projected leads at $200/day ≈ 2.5/day ≈ 105 per cell over 6 weeks; ~37 qualified per cell. No MDE reachable at significance.
- Verdict, declared: **no cell can be Powered - this plan is a screening plan**, judged on relative ranking over a 6-week window with lagging quality guardrails.

```
CREATIVE TEST PLAN - practitioner-fear angle screen, 2026-08-26
decision    : challenger replaces champion in always-on prospecting if it ranks
              better on cost per qualified lead without breaching quality
hypothesis  : because sales calls open with breach anecdotes, a practitioner-fear
              angle will lower cost per CRM-qualified lead ~20% vs the
              compliance champion over 6 weeks (magnitude is a screening target,
              not a significance claim)
isolation   : bundled - unlearnable at element level (angle + new visuals + new
              copy change together; labelled so no element-level insight is
              mined from the result)
structure   : 1 test cell + control, $200/day each, 3 assets per cell; manual
              fixed budgets; automated creative-optimization: off
metrics     : gate = CTR vs account trailing median, per placement
              primary = cost per CRM-qualified lead (fed back from CRM,
              never raw form fills)
              guardrails = lead-to-qualified rate >= account trailing median;
              frequency (small audience saturates by design); CPL drift
cells       : both cells: projected ~17 leads/wk - below the ~50/wk stable-
              delivery floor ($571/day needed at $80 CPL)
              required for Powered: not reachable at any acceptable MDE
              -> VERDICT: Directional read, declared; delivery-limited flagged
              kill: asset at $320 spend (4x CPL) with zero leads; cell decision
              deferred to week 6 - no mid-window kills on a 17/wk event
              scale: replace champion only if challenger ranks better on cost
              per qualified AND quality guardrail holds; +50% budget max
schedule    : launch Mon | earliest evaluation day 14 | hard stop day 42
              | inconclusive -> keep champion | second look at day ~130:
              opportunity creation per cell after one sales cycle
naming      : C##_ANG-<angle>_FMT-<format>_V##
caveats     : sample cannot support significance - all reads are judgment plus
              ranking; revenue verdict arrives one sales cycle after the
              creative verdict and is scheduled, not skipped
```

## 3. Negative example - what this skill must never emit

> "Variant B won with 40 conversions vs 28 at 97% confidence after 4 days. Scaling it 3x."

Everything wrong with it, in order:

1. The sample is an order of magnitude below the required n for any realistic MDE, so the "97% confidence" is a peeked artifact.
2. Day 4 is before the pre-registered evaluation moment and inside the novelty window.
3. The cells ran under campaign-level automatic budget allocation, so "B" had 3× the spend and a different delivered audience (divergent delivery) - the comparison was never even.
4. The 3× scale step ignores regression to the mean on a low-spend winner.

The honest version of the same data: "Directional: B ranks ahead of A on CPA at day 4; no verdict until the pre-registered stop; allocation was uneven, so the ranking is provisional."
