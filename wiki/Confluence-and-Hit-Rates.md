# Confluence & Hit Rates

[← Home](Home.md) · Part of [Key Zone Map](Key-Zone-Map.md)
(`② Zones — shared style`)

This is what ties the four detectors into one answer: **is the nearest zone
worth watching, and how do we know?**

---

## What the label actually says

```
Resistance · 2 conf · OB hit ≥58%/held ≥31% (n=44)
     |         |        |      |        |       |
     |         |        |      |        |       +-- 44 order blocks at this
     |         |        |      |        |           confluence level have
     |         |        |      |        |           resolved so far
     |         |        |      |        |
     |         |        |      |        +-- of those, at least 31% produced a
     |         |        |      |            confirmed rejection (95% conf.)
     |         |        |      |
     |         |        |      +-- at least 58% were touched at all
     |         |        |
     |         |        +-- the stat is drawn from ORDER BLOCK history
     |         |            (the best-sampled overlapping type)
     |         |
     |         +-- 2 of the other 3 detector types overlap this zone
     |
     +-- this is the swing-high zone above price
```

---

## Confluence

Whenever the swing-high or swing-low zone is the nearest one above/below price,
it's checked against every active order block, FVG and liquidity pool **that
shares its directional bias** — a resistance zone only checks bearish-biased
boxes, a support zone only bullish ones.

Each type that overlaps by at least `Min overlap to count as confluence` adds
**1** to a count of 0–3, shown on the zone label and in the status table.

**Overlap is measured as a fraction of the smaller zone's own range**, not in
absolute price. That's what stops a huge box from "confluencing" with
everything it happens to span.

| `Min overlap` | Effect |
|---|---|
| `0.0` | Any overlap counts, even a tick brushing the edge |
| `0.3` *(default)* | Zones must share ≥30% of the smaller one's range |
| `1.0` | The smaller zone must sit almost entirely inside the larger |

---

## Historical hit rates

Here's the part that makes this more than a count.

**Every order block, FVG and liquidity pool is tagged at birth** with how many
of the *other two* detector types already overlapped it. That tag is its
**confluence bucket**: 0, 1, 2, or 3+.

When the zone finally resolves — invalidated, filled, consumed, or aged out —
its outcome is logged into that bucket:

| Outcome tracked | Meaning |
|---|---|
| **total** | The zone resolved. Denominator |
| **hit** | Price reached it at all before it died |
| **held** | Price reached it *and* closed back away by the hold margin |

**Each detector type keeps its own set of buckets.** An order block's history
and a liquidity pool's are never blended, because there's no reason to assume
they behave alike.

### Display picks the best-sampled type, and names it

The zone shows the rates of whichever overlapping type has the **largest sample
size** at that confluence level, labelled so you know which — `OB`, `FVG` or
`Liq`. It does not quietly average different zone types into one misleading
number.

> **This doubles as a research tool.** Over weeks, whichever type keeps getting
> named is the detector that actually generates the most resolved evidence on
> *your* instrument. That's more useful than assuming order blocks (or any one
> type) are universally best.

---

## Hit rate versus held rate

The single most important distinction on this page.

| | Question it answers | What it tells you |
|---|---|---|
| **Hit rate** | Does price *get* here? | Attention. The zone is a magnet |
| **Held rate** | Does price *reject* once it arrives? | Respect. The zone is a wall |

A zone with **90% hit and 30% held is a magnet, not a wall** — price visits it
constantly and mostly blows straight through.

- **Fading / reversal setups → held rate is the number that matters.**
- **Target selection → hit rate is the number that matters** (you want price to
  *reach* your target).

---

<a id="wilson"></a>

## Why the rates show a `≥` sign

By default `Confidence-adjusted rates` is ON, and rates display as `≥58%`
rather than `58%`.

### The problem with raw percentages

14 hits out of 20 reads as "70%". But with only 20 samples, the true underlying
rate could plausibly sit anywhere from roughly **46% to 88%**. The number looks
far more precise than the evidence behind it — and you're using it to decide
which zones to trade.

Worse, when ranking: **3-for-3 and 300-for-300 both print "100%"**, and the
first one would outrank the second in any ordering built on the point estimate.

### What the Wilson lower bound does

It shows the rate you can be **95% confident the zone type beats**.

- Large sample → the bound sits close to the observed rate.
- Small sample → it pulls sharply toward zero.

So a lucky 3-for-3 stops outranking a solid 60-for-100. This is the standard
method for ranking proportions across uneven sample sizes, and it's preferred
over the textbook normal approximation because that one misbehaves exactly
where zone statistics live — small `n`, and proportions near 0 or 1.

| Observed | n | Displayed as `≥` |
|---|---|---|
| 100% (3/3) | 3 | ~44% |
| 100% (30/30) | 30 | ~89% |
| 70% (14/20) | 20 | ~48% |
| 70% (70/100) | 100 | ~61% |

Turn it **off** if you'd rather read raw observed percentages — simpler to
interpret, but it treats a 5-sample rate and a 500-sample rate as equally
trustworthy.

---

## Sample size gating

`Min sample size before showing a rate` (default `20`) hides the percentage
entirely until that many zones at that confluence level have resolved, showing
`(building)` with the current count instead.

The Wilson bound already penalises thin samples, so this is a second, blunter
guard — useful mainly because a `(building)` label is an unambiguous signal to
*not lean on this number yet*, whereas a low percentage might be misread as
"this zone type is bad."

> **Buckets fill slowly.** As of v1.5 buckets are 0 / 1 / 2 / 3+ rather than
> 0 / 1 / 2+, which is more informative — the old top bucket pooled a four-way
> confluence with a two-way one — but spreads the same history across more
> buckets. Expect longer warm-up, especially at 3+ confluence.

---

## The hard limits of these numbers

Read this section before you put weight on any of it.

**1. It's this chart's history only.** Not a backtest, not a database, not a
model. It is a frequency count over whatever bars TradingView has loaded.

**2. Every input change resets everything to zero.** TradingView recalculates
the whole script from bar 1 when any input changes, so every bucket restarts
at `n=0`. If you are actively tuning, the rates are meaningless until they
rebuild.

**3. It describes the past, not the future.** A 70% held rate is a statement
about 44 zones that already resolved. It is not a probability for the next one.

**4. Zones still alive are never counted.** Only resolved zones enter the
statistics, so there's a mild survivorship effect: a zone that's been sitting
untouched for 400 bars contributes nothing until it dies.

**5. Regime changes aren't detected.** The counts weight a zone from six months
ago identically to one from yesterday. If the instrument's character changed,
the numbers lag that.

---

## Practical reading guide

| What you see | How to read it |
|---|---|
| `3 conf · (building) n=4` | Strong agreement, **no evidence yet**. Trade the confluence count, ignore the absent rate |
| `2 conf · OB hit ≥61%/held ≥44% (n=80)` | Solid sample, genuinely useful. This is what the feature is for |
| `1 conf · Liq hit ≥70%/held ≥12% (n=55)` | A magnet, not a wall. Fine as a target, poor as a fade |
| `0 conf` | Only the swing zone itself. Not nothing — it's still the nearest structural level — but nothing else agrees |
| Rates suddenly all say `(building)` | You changed a setting. Expected |
