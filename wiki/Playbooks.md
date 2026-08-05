# Playbooks

[← Home](Home.md)

Concrete setups and workflows. Everything here assumes **you place the trade
manually** — these are analysis tools, not a system.

- [Timeframe setups](#timeframe-setups)
- [Using both scripts together](#using-both-scripts-together)
- [Single-script workflows](#single-script-workflows)
- [Calibration](#calibration)
- [Strategy fit, ranked](#strategy-fit-ranked)

---

## Timeframe setups

A top-down routine for multi-timeframe futures work: Daily → 4H → 1H → 15M →
5M. Adapt freely; the point is that each timeframe has a *job*.

### Higher timeframe (Daily / 4H) — bias context only

| Setting | Value | Why |
|---|---|---|
| Preset | `Strict` | Only major structure matters at this scale |
| Fine tune | `5` | |
| Confirmation bars after break | `1` | Small buffer against fakeouts |
| Only signal with EMA trend | **`OFF`** | You want to see the first LH/HL *against* the HTF trend — that's your reversal early-warning |
| EMA length | `100` | |
| Minimum score to signal | `0` | Until [calibrated](#calibrating-the-confidence-score) |

You are not trading this chart. You are answering one question: **is the last
confirmed break a continuation (HH/LL) or a reversal (LH/HL)?**

### Execution timeframe (1H / 15M) — where the plan gets built

| Setting | Value | Why |
|---|---|---|
| Preset | `Balanced` | |
| Fine tune | `4` | Slightly stricter — fewer marginal breaks to verify by hand |
| Confirmation bars after break | `1–2` | Also makes [follow-through](Confidence-Score.md#follow-through) measurable |
| Only signal with EMA trend | **`OFF`** | Same reason as above |
| Internal structure (⑥) | `ON`, length `2` | Entry timing once HTF bias is set |
| Restrict to a session | `ON` | Once you know your window |

### Entry timeframe (5M) — trigger only

| Setting | Value | Why |
|---|---|---|
| Preset | `Loose` → `Balanced` | Test both. Loose = earlier entries, more manual filtering |
| Confirmation bars after break | `0–1` | You're verifying manually anyway, so lag has low value here |
| Min bars between breaks | `3` | |
| Restrict to a session | `ON` | Matched to your window |

### Shared across all timeframes

| Setting | Value | Note |
|---|---|---|
| Require break strength | `ON` | |
| Min clearance beyond level | `0.15 × ATR` | Slightly above the `0.10` default |
| Require displacement candle | `ON` | |
| Min candle range | `0.7 × ATR` | |
| Require volume expansion | `ON` | Futures volume is real — keep it |
| Min volume | `1.3 ×` | |
| Volume baseline | `Time of day` | Removes the intraday U-shape |
| Reject long-wick breaks | **`OFF`** | You *want* to see liquidity-sweep rejections, not filter them — sweeps feed the reversal read |
| Merge near-equal levels | `ON`, `0.15 × ATR` | |
| Auto-adapt to timeframe | `ON` | Lets one settings profile travel across charts |

### Key Zone Map alongside

| Setting | Value |
|---|---|
| Swing engine + pivot length | **Match Structure Break Signals on the same chart** |
| Show confluence + hit-rate | `ON` |
| Hold confirmation margin | `0.5 × ATR` (default) — lower to `0.15` if too few holds register |
| Min overlap to count as confluence | `0.3` |
| Min sample size before showing a rate | `15–20` |
| Min impulse displacement (order blocks) | `0.8 × ATR` |
| All four detector types | `ON` initially — turn off what clutters *your* chart |

---

## Using both scripts together

They were one indicator before being split, and they're most useful read side
by side.

**1. Key Zone Map tells you WHERE.**
Watch the nearest Resistance/Support zone as price approaches. Check its
confluence count and — once sample size clears — its hit/held rate.

**2. Structure Break Signals tells you WHETHER something real happened there.**
As price interacts with the zone, watch for an HH/LL or LH/HL with a strong
score (55+, ideally 75+) at or near the same level.

**3. Agreement between the two is the highest-confidence read available.**
A zone showing `(held)` at the same time Structure Break Signals prints a
high-score LH/HL in the rejecting direction is two independent systems
confirming the same thing.

**4. Use the retest alert as the entry trigger once the zone shows `(held)`.**
`Retest Support` / `Retest Resistance` already favour higher-confidence
entries; requiring the zone box to *also* show a confirmed hold filters out the
retests least likely to matter.

**5. For breakouts THROUGH a zone, look for the inverse.**
The zone going from `(tested)` to gone (invalidated) at the same time a
high-score HH/LL fires through it. Both systems agreeing the level *failed* is
stronger than a break with no zone context, or a failed zone with no structural
confirmation.

**6. Manage using the opposite zone as your target.**
Entered off a Support bounce? Key Zone Map's Resistance row is your nearest
logical target. Read it off the table rather than eyeballing the chart.

---

## Single-script workflows

### Structure Break Signals only

1. **Daily/4H:** confirm bias — was the last confirmed break continuation
   (HH/LL) or reversal (LH/HL)?
2. **1H/15M:** watch for a same-direction high-score break. Use internal
   structure (`i-HH` / `i-LL`) for finer entry timing within that bias.
3. **5M:** use the **Retest** alert as the precise trigger. Never chase the raw
   break candle.
4. **Verify manually** on the chart; size and place the trade yourself.
5. **Journal** the break score and outcome every time — this is the feedback
   loop that tightens your score threshold.

### Key Zone Map only

1. **Daily/4H or 1H:** identify the nearest untested Resistance/Support zone.
   Note the confluence count.
2. Wait for either **`(held)`** — rejection confirmed, trade the bounce — or
   the zone going **invalidated/gone** while price closes through — trade the
   breakout.
3. Use the opposite-side zone as your target, read off the status table.
4. **Verify manually**, size and place the trade yourself.
5. **Journal** confluence count, hit/held rate, and outcome.

---

## Calibration

Both scripts have a learning-based feature that is meaningless until it has
history. Rushing this is the most common way to get bad results from either.

### Calibrating the confidence score

As of v7.9 this is a data export, not a transcription exercise. The script
plots its break data to the Data Window specifically so you can get it out —
see [Data export](Structure-Break-Signals.md#data-export).

1. Set **`Minimum score to signal` = 0** so nothing is filtered out. You are
   collecting the full distribution, including the breaks you'd normally
   reject — those are half the evidence.
2. Let it run on your actual instrument and timeframe. A week or two, or just
   load enough history.
3. **Chart menu → *Export chart data…*** → CSV.
4. In a spreadsheet, filter to rows where `Break score` is non-empty. That's
   one row per break, with type, level, clearance and ATR alongside.
5. Add your own **outcome** column. What counts as a win is your definition —
   "price moved 1×ATR in the break's direction before moving 1×ATR against"
   is a reasonable mechanical starting point, and `Break level` + `ATR` give
   you everything needed to compute it.
6. Bucket by score (0–40, 40–55, 55–70, 70–85, 85+) and compare outcome rates.
   **The cutoff is wherever the rate actually separates** — not a round number.
7. Set `Minimum score to signal` to that. **Re-check quarterly**, thresholds
   drift with volatility regimes.

> **Check the distribution before trusting the cutoff.** If almost everything
> scores 85+, the score isn't discriminating and any threshold is arbitrary —
> raise `Full marks · clearance` and `Full marks · candle range` first, then
> re-export. Full detail: [Confidence Score →
> Calibration](Confidence-Score.md#calibration).

> **Split by `Break type` too.** Continuation (`≤2`) and reversal (`≥3`) breaks
> may well have different useful cutoffs — the wiki argues throughout that they
> are different jobs, and this is how you'd actually find out on your
> instrument.

### Calibrating confluence

1. **Set your zone settings and then leave them alone.** Every input change
   restarts every confluence bucket at `n=0`.
2. Watch which detector type the table keeps naming as best-sampled at your
   typical confluence level. That tells you empirically which detector actually
   works on your instrument.
3. Don't trust a rate until sample size clears your threshold — until then,
   trade on confluence count alone.
4. Remember [the limits](Confluence-and-Hit-Rates.md#the-hard-limits-of-these-numbers):
   it's a frequency count over loaded bars, not a backtest.

---

## Strategy fit, ranked

Rough fit scores for a manual, multi-timeframe, journal-driven futures
approach. Treat as orientation, not gospel.

### Structure Break Signals alone

| Rank | Strategy | Fit | Why |
|---|---|---|---|
| 1 | **Score-gated continuation** (5M/15M, ignore LH/HL) | 84% | Simple, high signal-to-noise — but discards reversal setups entirely |
| 2 | **Reversal hunting off LH/HL** (EMA filter OFF) | 79% | Catches reversals early; noisier, needs more discretion at entry |
| 3 | **Loose preset, no score gate** | 41% | Useful for a calibration week to observe raw structure. Not a standing strategy |

### Key Zone Map alone

| Rank | Strategy | Fit | Why |
|---|---|---|---|
| 1 | **Confluence + held-rate zone trading** | 82% | Uses the full detector stack and the historical layer — the script's designed purpose |
| 2 | **Swing-zone only, no confluence** | 58% | Simpler and faster to read, but throws away the strongest part of the script |
| 3 | **Liquidity-sweep hunting only** | 55% | Narrow. Good if you specifically trade stop-runs; ignores OBs and FVGs |

### Both together

**~96%** — [the combined workflow above](#using-both-scripts-together). Zone
context plus graded structural confirmation is what the two were designed to
provide jointly, and neither half reaches it alone.

---

## Open items

**Session window and instruments.** Once your actual trading window is
confirmed, set `Restrict to a session` in Structure Break Signals to that exact
window so overnight and low-liquidity chop stops polluting the signal count.

Note that **session restriction is not a native setting in Key Zone Map** —
that filter lives only in Structure Break Signals. If you want session
filtering on zones too, it has to be handled via chart session settings or
applied by eye.
