# Confidence Score

[← Home](Home.md) · Part of [Structure Break Signals](Structure-Break-Signals.md)
(`⑨ Confidence score`, `⑩ Score tuning`)

> ## ⚠️ Measured, not assumed — read this first
>
> This page describes how the score is *built*. As of v7.14 there is finally
> data on how well it *works*, and it is not flattering.
>
> Over 32 MNQ 15M breaks (75 days), with `Minimum score to signal` at 0 so
> nothing was filtered out:
>
> - **The distribution is degenerate.** Scores ran **64–100**, median **88.5**,
>   84% at or above 80, and **nothing at all below 60** — exactly the failure
>   [Calibration](#calibration) warns about, now confirmed on real data.
> - **No measurable relationship to outcome.** Correlating score against what
>   price did over the following 20 bars: Spearman **−0.18**, permutation
>   **p = 0.34**. Win rates were flat across score terciles (6/10, 6/10, 7/12).
>   That is not evidence the score is backwards — it is evidence the sample is
>   far too small to tell, and that no positive relationship is visible in it.
>
> **What to do with that.** Do not treat a 94 as meaningfully better than a 78;
> nothing supports it yet. **Read the ATR clearance on the label instead** — it
> is measured directly, it varies properly between breaks, and it is shown by
> default from v7.14.
>
> v7.14 raised the clearance and displacement thresholds (below), which spreads
> the score somewhat — median 88.5 → 83, and 3% now fall below 60 — but does
> not fix it. Breaks arrive roughly once per 157 bars, so settling this
> properly needs data pooled across several instruments.

The break-quality filters are binary: a break either qualifies or it doesn't.
A break that cleared the level by 0.21 ATR and one that cleared it by 1.4 ATR
both just say `HH`. The score grades *how well* it passed, 0–100.

---

## Reading a score

| Score | Reading |
|---|---|
| **75+** | Emphatic |
| **55–75** | Solid |
| **40–55** | Marginal |
| **< 40** | Weak — passed the filters, but barely |

These bands are a starting frame, **not a rule**. The whole point of the score
is that you determine your own cutoff empirically — see
[Calibration](#calibration).

---

## The six components

| # | Component | Default weight | Full marks at | What it sees |
|---|---|---|---|---|
| 1 | Clearance beyond level | **30** | `0.60 × ATR` | How far past the level the close landed |
| 2 | Displacement | **25** | `1.50 × ATR` | How large the breaking candle was |
| 3 | Body conviction | **15** | body = `0.80` of range | Whether it closed near its extreme |
| 4 | Volume participation | **15** | `1.60 ×` baseline | Whether anyone showed up |
| 5 | Size of leg broken | **15** | `2.00 × ATR` | Whether the swing being broken was substantial |
| 6 | Follow-through | **10** | `1.00 × ATR` | Whether price kept going afterward |

Each component produces a 0–1 fraction of its full-marks target, multiplied by
its normalised weight.

### How independent are these really?

The honest answer, and it matters for tuning: **components 1–3 are not
independent of each other.** Clearance, displacement and body conviction all
describe *the same breaking candle* from different angles. A big candle
mechanically tends to clear the level further. They rise and fall together, so
their combined 70 points carry meaningfully less than 70 points of distinct
information.

**Components 4, 5 and 6 are what add something the others cannot see:**

- **Volume** is external to price action entirely.
- **Leg size** is the only component reading *structural context* rather than
  the breaking candle.
- **Follow-through** is the only component describing what happened *after* the
  break.

If you want the score to discriminate better, raising 4–6 relative to 1–3
generally does more than fiddling with thresholds.

---

### 1. Clearance beyond level — weight 30

How far beyond the level the close landed, in ATR. Carries the most weight
because it is the single most reliable indicator of a real break.

**Full marks · clearance (× ATR)** — default `0.60` **(raised from 0.40 in
v7.14)**. Lower (0.25) is easier to max out, so scores cluster high and
discriminate less between good and great. Higher means only emphatic breaks
score well.

> If almost every break scores 85+, your thresholds are too easy. Raise this
> and displacement first.

That is exactly what happened: at `0.40` this component was saturating on
ordinary breaks and nothing scored below 60. `0.60` is the value this page had
recommended all along for the symptom it turned out to have.

### 2. Displacement — weight 25

The breaking candle's full range relative to recent volatility.

**Full marks · candle range (× ATR)** — default `1.50` **(raised from 1.20 in
v7.14)**, for the same saturation reason as clearance above. Raise further if
your instrument breaks with obvious expansion; lower on instruments that grind
rather than impulse.

### 3. Body conviction — weight 15

Body as a fraction of total range — did the candle close near its extreme, or
leave a long rejection wick?

**Full marks · body % of range** — default `0.80`. Scoring starts from `0.35`
and rises to this value, so a long-wicked rejection candle earns nothing here
even if its range was large.

> This is the gentler alternative to `Reject long-wick breaks`: it *penalises*
> wick-fakeouts in the score rather than rejecting them outright.

### 4. Volume participation — weight 15

Volume against the [baseline](Structure-Break-Signals.md#volume) you selected.

**Full marks · volume (× average)** — default `1.60`. Scoring starts from
`0.70×` and rises to this value.

> **Set this weight to 0 if your feed has synthetic or unreliable volume**
> (many forex and CFD feeds). Its share is redistributed across the other
> measures, so you lose nothing — the score stays on a 0–100 scale. On futures,
> volume is real and worth keeping.

If volume data is missing entirely, this component returns a **neutral
half-score** rather than penalising the break.

<a id="leg-size"></a>

### 5. Size of leg broken — weight 15

How large the swing being broken was — a big, well-formed leg giving way means
more than a shallow one.

**Full marks · leg size (× ATR)** — default `2.00`. Raise on higher timeframes
where legs are naturally larger.

> **v7.6 fixed this component.** It was frequently contributing a flat neutral
> half-score instead of a real measurement, because the structural reference it
> reads was being wiped on every break. It now measures properly — so scores on
> trending instruments shifted, usually **up** for breaks of large legs and
> **down** for breaks of shallow ones. **If you tuned `Minimum score to signal`
> before v7.6, re-check it.**

<a id="follow-through"></a>

### 6. Follow-through — weight 10

How far price actually ran past the level during the confirmation window,
measured from the level to the furthest point reached in the break's
direction.

**Full marks · follow-through (× ATR)** — default `1.00`. Raise on instruments
that trend hard after breaking; lower on ones that grind.

> **Requires `Confirmation bars after break` ≥ 1**
> ([③ Break quality filters](Structure-Break-Signals.md#break-quality-filters)).
> That waiting period is *where the measurement happens*. At 0 confirmation
> bars there is no "after" yet, so this returns a neutral half-score for every
> break — the same fallback the volume component uses on feeds without real
> volume.

This is the most genuinely independent measure in the score: the other five all
read the breaking candle or the structure around it, while this one reads what
the market did next.

> **v7.9 changed the `Confirmation bars` default from 0 to 1 specifically so
> this component works.** Between v7.7 and v7.9 it shipped enabled at weight 10
> but structurally unmeasurable on default settings — a flat constant added to
> every break, carrying weight it could not use. It now varies per break.
> **Scores shifted again as a result; re-check `Minimum score to signal`.**
>
> Setting `Confirmation bars` back to 0 is a legitimate choice if entry timing
> matters more to you — but zero this weight at the same time, so its share
> redistributes rather than sitting inert.

---

## How the weights work

**Weights are relative and auto-normalised to 100.** You never have to make
them add up.

Zeroing a component redistributes its share across the rest, rather than
silently capping the maximum achievable score. This matters: without
normalisation, setting the volume weight to 0 would cap every score at 85 and
shift every threshold you had tuned underneath you.

```
normalised weight_i = 100 x weight_i / sum(all weights)
```

So `30/25/15/15/15/10` and `60/50/30/30/30/20` produce identical scores.

### The minimum-score gate and follow-through

There's a subtlety worth knowing. The `Minimum score to signal` gate has to run
*before* the confirmation window that follow-through is measured over has even
started. So the gate evaluates using a **neutral follow-through allowance** —
the same half-score an unmeasurable component always falls back to.

Without that, a non-zero follow-through weight would make every candidate score
short of its own maximum and quietly tighten whatever cutoff you'd tuned.

---

## Calibration

**Do not set `Minimum score to signal` by guessing.** Setting it blind is just
a slower, more opaque way of tightening the break-quality filters.

1. Run with **`Minimum score to signal` = 0** and **`Show score on label` = ON**
   for 1–2 weeks on your actual instrument and timeframe.
2. Log every break — its score, direction, type (HH/LL/LH/HL), and what
   happened next — into a journal or spreadsheet.
3. Once you have **~20–30 logged events**, look at where the outcomes actually
   separate. That number is your cutoff.
4. Set `Minimum score to signal` to what you observed.
5. **Re-check quarterly.** Thresholds drift as volatility regimes change.

> **Watch for a degenerate distribution.** If almost everything scores 85+, the
> score isn't discriminating and the cutoff will be meaningless. Raise
> `Full marks · clearance` and `Full marks · candle range` first, then re-run.
> Conversely, if nothing clears 50, lower them.

Once you've settled on a cutoff you can turn `Show score on label` off for a
cleaner chart — the gate keeps working.

---

## Tuning cheatsheet

| Symptom | Try |
|---|---|
| Almost every break scores 85+ | Raise `Full marks · clearance` (→0.60) and `· candle range` (→1.5) |
| Nothing scores above 50 | Lower those same two |
| Score doesn't separate winners from losers | Shift weight from clearance/displacement toward volume, leg size and follow-through |
| Volume feed is synthetic | Set `Weight · volume participation` to 0 |
| Wick-fakeouts scoring too well | Raise `Weight · body conviction` |
| Want the score to reward continuation of the move | Set `Confirmation bars` to 1–2 and raise `Weight · follow-through` |
| Scores changed after upgrading | Expected — see the v7.6 note under [leg size](#leg-size) |
