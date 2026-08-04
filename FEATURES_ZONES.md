# Support/Resistance Zones v1.0 — Feature Guide

This is the zones half of what used to be one combined indicator with **BOS /
CHoCH Structure** — split out because the two do genuinely different jobs.
This script's one job: tell you the nearest support/resistance zones above
and below price, why several independent detectors agree on them, and how
often zones with that much agreement have actually gotten hit before.

> Looking for BOS/CHoCH break labels, the confidence score, or alerts? Those
> live in the companion script, **BOS / CHoCH Structure** — see
> `FEATURES.md`.

---

## 1. Swing detection (`① Swing detection`)

- **Swing pivot length** — how many bars must sit on each side of a candle
  for it to count as a swing high/low. Lower = more, smaller, faster-forming
  zones. Higher = fewer, major zones, more lag.
- **ATR length** — lookback for the ATR used by every size/overlap threshold
  in this script.
- **Filter minor swings by size / Min swing size (× ATR)** — a pivot only
  counts as a zone if it moved far enough from the last opposite swing,
  filtering tiny wiggles inside consolidation.
- **Auto-adapt to timeframe** — rescales every extend-right and lookback
  window (zone box widths, order-block search depth, liquidity pivot memory)
  so each spans the same real amount of time on every chart, instead of a
  fixed bar count that means 50 minutes on a 1-minute chart and over a week
  on a 4-hour chart. Each scaled value is capped at that setting's own manual
  min/max.

**How "the nearest zone" is decided here, and why it can differ from the
companion script:** this script has no break-quality filters, presets, or
confirmation delay. The moment price closes through the current watched
swing high/low, structure has moved on to the next one — a RAW break, not a
filtered/graded one. That's deliberate: this script isn't grading break
events, so gating when a zone gets replaced behind fakeout filters designed
for scoring signals doesn't apply here. The practical effect is that the
"Watch high"/"Watch low" shown in this script's table can differ slightly
from the BOS/CHoCH script's, which waits for a higher-quality break before
moving on.

---

## 2. Zones — shared style (`② Zones — shared style`)

One place controls the look and behavior of every zone type:

- **Bullish / Bearish zone colour** — bullish = anything favoring longs
  (swing low zones, bullish order blocks, bullish FVGs, sell-side liquidity).
  Bearish = the mirror, favoring shorts.
- **Active zone opacity / Extra fade once tested** — solid = still live and
  untested; faint = already been tapped once, treat with more caution.
- **Max active zones per type** — caps how many of each zone type stay on
  chart at once (oldest auto-deletes).
- **Show confluence + historical hit-rate** — the master toggle for the
  scoring layer described in §7. OFF just leaves every box labelled with its
  type, no scoring.
- **Hold confirmation margin (× ATR)** — how far price must close back away
  from a zone, beyond its near edge, to count as a confirmed "hold" rather
  than just a touch. A zone can be touched without being respected — price
  can wick in and plow straight through.
- **Min overlap to count as confluence** — how much two zones must overlap,
  as a fraction of the smaller zone's own range, to count as confluence
  instead of any edge touch at all.
- **Min sample size before showing a rate** — hides hit-rate/hold-rate
  percentages until a confluence bucket has enough resolved samples, showing
  `(building)` with the running count instead. A rate from 1-2 samples is
  noise dressed up as a number.

---

## 3. Swing zones (`③ Swing zones`)

The headline feature: the current nearest swing high/low, shown as a visible
**area**, not just a price.

- **What it draws**: a box from the swing candle's wick (the exact extreme)
  to its body edge (where real conviction started), for both the current
  watched high (labelled **Resistance**) and watched low (labelled
  **Support**).
- **Tells you**: the *whole* area price likely needs to work through — not
  one exact tick. The wick edge is the hard extreme; the body edge is where
  the market actually accepted price.
- Only ever shows the *current* nearest zone on each side — a planning tool
  for what's coming, not a history log.

---

## 4. Order blocks (`④ Order blocks`)

- **What it is**: the last opposite-colored candle before an impulsive break
  of the current swing zone — the candle where the move likely originated.
  Bullish OB = last down-close candle before a break up. Bearish OB = last
  up-close candle before a break down.
- **Tells you**: a high-probability reaction zone. Price often returns to
  retest an order block before continuing in the breakout direction.
- **Box lifecycle**:
  - **Solid, growing** = still untested.
  - **Faded, "(tested)"** = price has wicked back into it once.
  - **"(held)"** = price closed back away from it by the hold margin —
    a confirmed rejection, not just a touch.
  - **Gone** = price *closed* all the way through the far side (invalidated).
- **Search back this many bars** — how far behind the break candle to look
  for the origin candle.

---

## 5. Fair value gaps (`⑤ Fair value gaps`)

- **What it is**: a classic 3-candle imbalance — candle 1's wick doesn't
  overlap candle 3's wick, leaving a gap the market moved through without
  trading. Bullish FVG = gap left behind an up move; bearish = behind a down
  move.
- **Tells you**: a zone price statistically tends to return to and "fill"
  before continuing.
- **Box lifecycle**: same tested/held/gone pattern as order blocks, keyed to
  fill instead of touch — faded once price partially fills the gap, gone
  once fully filled.
- **Min gap size (× ATR)** — filters out one-tick noise gaps.
- **50% midline (CE)** — optional dotted line at the gap's midpoint, the
  "consequent encroachment" level some traders treat as the real reaction
  point.

---

## 6. Liquidity zones (`⑥ Liquidity zones`)

- **What it is**: equal (or near-equal) highs/lows within an ATR tolerance —
  clusters of resting stop-losses and breakout orders.
  - **Buy-side liquidity** = equal highs, above price.
  - **Sell-side liquidity** = equal lows, below price.
- **Tells you**: where price is statistically drawn toward before reversing —
  a move toward one of these zones followed by a sharp reversal is a classic
  "liquidity sweep."
- **Box lifecycle**:
  - **Solid** = untouched pool.
  - **"(swept)"** = price has wicked through it (a sweep attempt).
  - **"(held)"** = price closed back away — the sweep failed to hold.
  - **Gone** = price *closed* beyond the level — the resting liquidity has
    been consumed either way.
- **Equal-level tolerance (× ATR)** — how close two swings must be to count
  as "equal."
- **Pivot lookback (bars)** — how far back a matching prior pivot can be found.

---

## 7. Confluence + historical hit-rate

This is what ties the four zone types into one answer: **is the nearest
zone worth watching, and how do we know?**

- **Confluence**: whenever the swing-high or swing-low zone is the nearest
  one above/below price, it's checked against every active order block, FVG,
  and liquidity pool *that shares its directional bias*. Each type that
  overlaps by at least the minimum-overlap threshold (§2) adds 1 to a
  confluence count (0–3), shown on the zone's label and in the status
  table's Resistance/Support rows.
- **Historical hit-rate, tracked separately per zone type**: every order
  block, FVG, and liquidity pool is tagged at birth with how many of the
  *other two* detector types already overlapped it (0, 1, or "2+"). Each
  type keeps its own set of buckets — an order block's history and a
  liquidity pool's are never blended together.
- **Display picks the most-sampled type, and names it**: the nearest zone
  shows the hit rate / hold rate of whichever overlapping type has the
  largest sample size at that confluence level, labelled so you know which
  one it is — e.g. `Resistance · 2 conf · OB hit 74%/held 41% (n=31)`.
- **Read this as a frequency count, not a prediction.** It's built entirely
  from this chart's own history. Changing ANY input restarts the count from
  zero, since TradingView recalculates the whole script from bar 1 when an
  input changes.

---

## 8. Display (`⑦ Display`)

- **Status table** — corner panel: swing length + ATR, current watch
  high/low, and the Resistance/Support confluence + hit-rate rows.
- **Raw pivot markers** — every detected swing high/low, including ones the
  ATR filter rejected. Useful for diagnosing why a zone isn't showing up
  where you'd expect one.

---

## Reading the chart at a glance

1. **Solid boxes** = live, untested zones — worth watching closely.
2. **Faded / "(tested)" / "(swept)"** = already been touched once — lower
   priority, but not dead yet.
3. **"(held)"** = a confirmed rejection already happened here — the
   strongest form of "this zone worked."
4. **Gone** = invalidated or fully filled — no longer relevant.
5. **The Resistance/Support rows in the table** = the single fastest way to
   read "what's nearest, how much agrees on it, and how often that's
   actually mattered before" without hunting for the box on the chart.
