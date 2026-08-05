# Concepts

[← Home](Home.md)

The shared vocabulary both scripts are built on. Ten minutes here will save
you a lot of confusion in the settings panels.

- [Swings, and the four break types](#swings-and-the-four-break-types)
- [Why everything is measured in ATR](#why-everything-is-measured-in-atr)
- [Timeframe adaptation](#timeframe-adaptation)
- [Watched levels](#watched-levels)
- [Raw break vs. graded break](#raw-break-vs-graded-break)
- [Zone lifecycle](#zone-lifecycle)
- [Glossary](#glossary)

---

## Swings, and the four break types

A **swing high** is a price peak the market turned away from; a **swing low**
is a trough. How a swing gets *confirmed* is a real choice with real
tradeoffs — see [Swing Engines](Swing-Engines.md).

Once you have a sequence of swings, Dow Theory names them by comparison to the
one before:

| Term | Means | Structural reading |
|---|---|---|
| **HH** | Higher High | Uptrend printed another peak — continuation |
| **LL** | Lower Low | Downtrend printed another trough — continuation |
| **LH** | Lower High | A peak *below* the last one. When price breaks above it, the downtrend's ceiling just gave way — reversal |
| **HL** | Higher Low | A trough *above* the last one. When price breaks below it, the uptrend's floor just gave way — reversal |

Structure Break Signals labels a break with whichever of these four applies:

```
        HH                          Break UP through a high that sits
       /  \        HH               ABOVE the previous high  ->  HH
      /    \      /  \
     /      \    /    \             Break UP through a high that sits
   HL        HL         ...         BELOW the previous high  ->  LH
                                    (the "LH" being broken is the
                                     lower high that just failed)
```

**The label is computed from the pivot sequence itself**, not from which
direction the last break happened to go. A break above a high is only called
`HH` if that high genuinely sits above the swing high before it. (Before
v7.6 this was inferred from a running bias flag, which could label a break of
a genuinely lower high as `HH`. See [Changelog](Changelog.md).)

### The older names

These events are widely called **BOS** (Break of Structure — a break *with*
the trend) and **CHoCH** (Change of Character — a break *against* it). The
mapping is exact:

| Old name | New label | |
|---|---|---|
| BOS bullish | **HH** | continuation up |
| BOS bearish | **LL** | continuation down |
| CHoCH bullish | **LH** | reversal up |
| CHoCH bearish | **HL** | reversal down |

Nothing about the detection changed in the rename — only what the labels say.
The scripts group the two continuation types together (`⑦ HH/LL lines`) and
the two reversal types together (`⑧ LH/HL lines`) for styling, because
continuation and reversal are the distinction you act on.

---

## Why everything is measured in ATR

Almost every size threshold in both scripts is expressed as a multiple of
**ATR** (average true range) rather than in points, ticks, or percent.

The reason: a "20-point break" is enormous on one instrument and noise on
another, and enormous in a quiet hour and noise during a news release. ATR
normalises for both at once. `Min clearance beyond level = 0.10 × ATR` means
"a tenth of a typical bar's range," which stays meaningful across instruments,
timeframes and volatility regimes without retuning.

### Choosing the volatility measure

Structure Break Signals lets you pick what "typical bar range" means
(`② Core structure → Volatility measure`):

| Measure | What it is | Behaviour |
|---|---|---|
| **ATR (Wilder)** *(default)* | Running average of true range | Standard and familiar. But it is a **mean** of a right-skewed variable, so one news bar at 10× normal size lifts it for many bars — and since every threshold scales with it, the indicator quietly goes *quiet* right after the most informative move of the session |
| **Median true range** | Middle bar of the lookback | A single outlier barely moves it. Thresholds stay put through spikes |

> **Switching loosens everything.** Median true range reads roughly **10–20%
> lower** than ATR on the same data, because it ignores the fat right tail a
> mean gets dragged by. Every ATR-multiple setting therefore becomes
> effectively *looser* when you switch, and you will get more signals. Raise
> your multiples by about 15% if you want to hold sensitivity constant.

Key Zone Map uses Wilder ATR throughout.

---

## Timeframe adaptation

Separately from ATR scaling, both scripts have bar-count settings — how far to
extend a line, how far back to search, how long a retest window stays open.

A bar count means wildly different amounts of *time* on different charts. 50
bars is 50 minutes on a 1M chart and more than a week on a 4H chart.

**`Auto-adapt to timeframe`** (on by default in both) rescales every
extend-right and lookback window so it spans the same real time on every
chart. Each scaled value is clamped to that setting's own manual min/max, so
auto-adapt can never produce a value you couldn't have typed yourself.

What it deliberately does **not** touch: swing pivot length, filter
thresholds, and score weights. Changing *what counts as a valid break* based
on timeframe is a different decision from *how far to draw once one fires* —
the former stays under your explicit control via the preset.

---

## Watched levels

Both scripts track exactly one **watched high** and one **watched low** at a
time: the nearest unbroken swing above and below price. These are what the
dotted "live level" lines in Structure Break Signals show, and what the
`Resistance` / `Support` boxes in Key Zone Map shade.

This is the most immediately useful output either script produces, because it
tells you **what needs to break for anything to happen** — before it happens.

### Wick anchoring

If price wicks above the watched high but closes back below it, the watched
level *rises to the wick extreme*. The logic: the market probed higher and got
rejected, so the real level to beat is now the probe high, not the original
pivot. This makes both scripts sweep-aware by default, at the cost of the
level ratcheting upward through repeated failed probes.

---

## Raw break vs. graded break

The two scripts deliberately disagree about when structure "moves on," and
this is the most common source of confusion when running both.

| | Structure Break Signals | Key Zone Map |
|---|---|---|
| Break definition | **Graded** — must pass clearance, displacement, volume, cooldown, wick and session filters, and optionally wait N confirmation bars | **Raw** — price simply closes through the level |
| Why | It is grading break *events*, so quality gates are the whole job | It is mapping *terrain*, and terrain moves on as soon as price moves on |

**Consequence:** the `Watch high` / `Watch low` values in the two status
tables can differ. That is expected, not a bug. Key Zone Map advances to the
next swing immediately; Structure Break Signals may still be watching the old
level because the break didn't clear its quality bar.

---

## Zone lifecycle

Every Key Zone Map box moves through the same states:

| State | Label | Meaning |
|---|---|---|
| Active | *(type name)* | Live, untouched. Box extends rightward as bars form |
| Touched | `(tested)` / `(swept)` | Price reached it at least once. Box fades and stops extending |
| Held | `(held)` | Price touched it *and then closed back away* by the hold margin — a confirmed rejection, not just a touch |
| Gone | box deleted | Invalidated: price closed all the way through (or the gap fully filled) |

The distinction between **touched** and **held** is the one that matters most.
A zone price visits constantly but blows through is a magnet, not a wall. See
[Confluence & Hit Rates → hit vs.
held](Confluence-and-Hit-Rates.md#hit-rate-versus-held-rate).

---

## Glossary

| Term | Definition |
|---|---|
| **ATR** | Average True Range. The scale unit for nearly every size threshold in both scripts |
| **BOS** | Break of Structure — legacy name for a continuation break (now HH / LL) |
| **CHoCH** | Change of Character — legacy name for a reversal break (now LH / HL) |
| **Clearance** | How far beyond the level the breaking bar closed, in ATR |
| **Confluence** | How many independent detectors agree on a zone (0–3) |
| **Consequent encroachment (CE)** | The 50% midline of a fair value gap |
| **Directional change** | A swing-confirmation method that triggers on a volatility-scaled retracement rather than a bar count. See [Swing Engines](Swing-Engines.md) |
| **Displacement** | The size of the breaking candle relative to recent volatility |
| **FVG** | Fair Value Gap — a 3-candle imbalance price often returns to fill |
| **Held rate** | Of zones that were touched, the fraction that produced a confirmed rejection |
| **Hit rate** | The fraction of zones of a given confluence level that price reached at all |
| **Internal structure** | An optional second, faster swing pass for entry timing inside a larger bias |
| **Liquidity pool** | Equal or near-equal highs/lows where stops cluster |
| **Order block** | The last opposite-coloured candle before an impulsive break — where a move likely originated |
| **Pivot** | A bar with N lower bars on each side (high) or N higher (low) |
| **Retest** | Price returning to a recently broken level and holding it |
| **Sweep** | A probe through a liquidity pool, often reversing immediately after |
| **Wilson lower bound** | A confidence-adjusted proportion that penalises small samples. See [Confluence & Hit Rates](Confluence-and-Hit-Rates.md#wilson) |
