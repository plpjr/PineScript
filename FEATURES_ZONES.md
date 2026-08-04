# Key Zone Map v1.2 — Feature Guide

*(Formerly "Support/Resistance Zones" — renamed, same script.)*

**File:** `Key_Zone_Map.pine` · **TradingView indicator name:** "Key Zone Map
v1.2" · **Companion:** `Structure_Break_Signals.pine` (`FEATURES_STRUCTURE.md`)

This is the zones half of what used to be one combined indicator with
**Structure Break Signals** — split out because the two do genuinely
different jobs. This script's one job: tell you the nearest
support/resistance zones above and below price, why several independent
detectors agree on them, and how often zones with that much agreement have
actually gotten hit before.

> Looking for BOS/CHoCH break labels, the confidence score, or alerts? Those
> live in the companion script, **Structure Break Signals** — see
> `FEATURES_STRUCTURE.md`.

---

## 1. Swing detection (`① Swing detection`)

> **Question:** what counts as a swing high/low, and which one is the
> "current nearest" one right now?
> **Helps with:** establishes the anchor point — the swing zone — that
> every other zone type gets measured against for confluence.

- **Swing pivot length** — how many bars must sit on each side of a candle
  for it to count as a swing high/low. Lower (2–4) detects more, smaller,
  faster-forming zones. Higher (7–12) keeps fewer, major zones, with more
  lag (a swing can't confirm until this many bars after it forms).
- **ATR length** — lookback for the ATR used by every size/overlap
  threshold in this script: the swing filter, zone lifecycle margins (hold
  confirmation), and confluence overlap. 14 is standard for intraday.
- **Filter minor swings by size** — ON means a pivot only counts as a zone
  if it moved far enough (in ATR) from the last opposite swing, filtering
  tiny wiggles inside consolidation. Recommend leaving ON.
- **Min swing size (× ATR)** — how far a pivot must be from the previous
  opposite swing to count as a real zone, in ATR, when the filter above is
  on. 0.0–0.2 is very sensitive. 0.4–0.6 is balanced. 1.0+ keeps only large
  structural swings.
- **Auto-adapt to timeframe** — scales every "extend right" and "lookback"
  window (zone box widths, order-block search depth, liquidity pivot
  memory) so it represents the same slice of real time on every chart,
  instead of a fixed bar count that means 50 minutes on a 1-minute chart and
  over a week on a 4-hour chart. Each scaled value is capped at that
  setting's own manual maximum, so it can never reach a value you couldn't
  have picked by hand. OFF = every bar-count setting below means exactly
  what you typed, unscaled.

**How "the nearest zone" is decided here, and why it can differ from the
companion script:** this script has no break-quality filters, presets, or
confirmation delay. The moment price closes through the current watched
swing high/low, structure has moved on to the next one — a RAW break, not a
filtered/graded one. That's deliberate: this script isn't grading break
events, so gating when a zone gets replaced behind fakeout filters designed
for scoring signals doesn't apply here. The practical effect is that the
"Watch high"/"Watch low" shown in this script's table can differ slightly
from the companion script's, which waits for a higher-quality break before
moving on.

---

## 2. Zones — shared style (`② Zones — shared style`)

> **Question:** how should every zone type look and behave, without
> repeating the same settings four separate times?
> **Helps with:** one place to control color, fade, border, and the entire
> confluence/hit-rate mechanism for all zone types at once.

One place controls the look and behavior of every zone type:

- **Bullish zone colour** — base colour for every zone that favours longs:
  swing low zones, bullish order blocks, bullish FVGs, and sell-side
  liquidity pools.
- **Bearish zone colour** — base colour for every zone that favours shorts:
  swing high zones, bearish order blocks, bearish FVGs, and buy-side
  liquidity pools.
- **Active zone opacity** — fill/border transparency for a live, untested
  zone. Higher = more see-through; lower this if zones feel too faint
  against your chart background.
- **Extra fade once tested/mitigated** — added transparency once a zone has
  been touched or filled, so used zones visually recede and only live,
  untouched zones jump out at you.
- **Max active zones per type** — oldest zone of each type (order block /
  FVG / liquidity pool) auto-deletes once this many are on the chart. Keeps
  you under TradingView's object caps and the chart readable.
- **Zone border width** — thickness of every zone box's border — swing
  zones, order blocks, FVGs, and liquidity pools all share this one
  control. Raise it if zones are hard to see against your chart background.
  (Border *style* — Solid/Dashed/Dotted — is set independently per zone
  type in each type's own section below, since that's what visually tells
  the types apart.)
- **Show confluence + historical hit-rate** — the master toggle for the
  scoring layer covered in full in §7. Checks whether an order block, FVG,
  and/or liquidity pool overlap the nearest swing zone, and remembers (from
  this chart's own history) how often zones with that much agreement
  actually got touched before failing. OFF = zone boxes still draw and
  label their own type, just without the confluence/hit-rate layer.
- **Hold confirmation margin (× ATR)** — how far price must close back away
  from a zone, beyond its near edge, to count as a confirmed "hold" rather
  than just a touch. A zone can be touched without holding — price can wick
  in and plow straight through moments later. Higher = stricter, fewer
  touches qualify as a genuine hold; lower (0) means almost any close back
  outside the zone counts.
- **Min overlap to count as confluence** — how much two zones must overlap
  — as a fraction of the SMALLER zone's own range — to count as confluence,
  instead of any touch at all. 0.0 = any overlap counts, even a single tick
  brushing the edge. 0.3 (default) = the zones must share at least 30% of
  the smaller one's range. 1.0 = the smaller zone must sit almost entirely
  inside the larger one.
- **Min sample size before showing a rate** — hides the hit-rate/hold-rate
  percentage until at least this many zones at that confluence level have
  resolved, showing `(building)` with the current count instead. A rate
  built from 1-2 samples is noise dressed up as a number. Raise this for
  more confirmation before trusting a rate; lower it to see numbers sooner
  at the cost of reliability.

---

## 3. Swing zones (`③ Swing zones`)

> **Question:** where's the nearest support/resistance area right now, not
> just the exact price?
> **Helps with:** gives you the headline "where to watch" zone the whole
> script is built around.

The headline feature: the current nearest swing high/low, shown as a
visible **area**, not just a price.

- **Shade swing high/low zones** — the master toggle. Draws the current
  watched swing high and swing low as a shaded box instead of just a thin
  line — the exact area price needs to break for a signal to fire, made
  impossible to miss. The box spans wick-to-body of the pivot candle: the
  wick is the exact extreme, the body edge is where real conviction
  started, so the zone reflects the whole area price likely reacts from,
  not just one tick. Watched high is labelled **Resistance**; watched low
  is labelled **Support**. Only ever shows the *current* nearest zone on
  each side — a planning tool for what's coming, not a history log.
- **Extend zone right (bars)** — how far the swing zone box is drawn
  forward from the current bar. Purely visual, doesn't affect detection.
  Scales with Auto-adapt to timeframe.
- **Border style** *(Solid / Dashed / Dotted, default Dashed)* — border
  style for swing zone boxes, independent of the other three zone types.
  Dashed by default so swing zones read as visually distinct from order
  blocks (solid) and FVGs (dotted) at a glance.

---

## 4. Order blocks (`④ Order blocks`)

> **Question:** where did the move that broke this level actually
> originate?
> **Helps with:** flags high-probability re-entry zones on a retest — the
> classic "institutional footprint" trade.

- **Show order blocks** — the master toggle. An order block is the last
  opposite-coloured candle before an impulsive break of the current swing
  zone — the candle where the move likely originated. Bullish OB = last
  down-close candle before a break up. Bearish OB = last up-close candle
  before a break down. Traders watch these as high-probability entry zones
  on a retest. Lifecycle: the box grows while untested, fades ("(tested)")
  the first time price wicks back into it, shows "(held)" if price then
  closes back away by the hold margin (a confirmed rejection, not just a
  touch), and deletes once price *closes* all the way through the far side
  (invalidated).
- **Search back this many bars** — how far back from the break candle to
  search for the origin candle.
- **Extend box right (bars)** — how far an ACTIVE (untested) order block
  box is drawn forward while price hasn't returned to it yet. Scales with
  Auto-adapt to timeframe.
- **Border style** *(Solid / Dashed / Dotted, default Solid)* — border
  style for order block boxes, independent of the other three zone types.

---

## 5. Fair value gaps (`⑤ Fair value gaps`)

> **Question:** where did price leave an imbalance behind that it's
> statistically likely to come back and fill?
> **Helps with:** marks zones price tends to revisit before continuing,
> independent of any structure break.

- **Show fair value gaps** — the master toggle. An FVG is a classic
  3-candle imbalance: the wick of candle 1 doesn't overlap the wick of
  candle 3, leaving a gap the market moved through without trading. Price
  often returns to "fill" this gap before continuing. Bullish FVG = gap
  left behind an up move (support-ish). Bearish FVG = gap left behind a
  down move (resistance-ish). Lifecycle: fades ("(tested)") on first
  partial fill, shows "(held)" if price closes back away by the hold
  margin, deletes once fully filled.
- **Min gap size (× ATR)** — filters out tiny, insignificant gaps. 0.0
  shows every gap, even one tick wide. 0.05–0.15 is balanced, hiding noise
  on choppy instruments. 0.3+ keeps only large, obvious imbalances.
- **Extend box right (bars)** — how far an unfilled FVG box is drawn
  forward while price hasn't returned to fill it. Scales with Auto-adapt to
  timeframe.
- **Border style** *(Solid / Dashed / Dotted, default Dotted)* — border
  style for the FVG box itself, separate from the midline style below.
- **Show 50% midline (CE)** — draws a line through the middle of the gap —
  the "consequent encroachment" level some traders treat as the real
  reaction point rather than the whole gap.
- **Midline width** — thickness of the FVG midline. Only applies when the
  midline is on.
- **Midline style** *(Solid / Dashed / Dotted, default Dotted)* — line
  style for the FVG midline.

---

## 6. Liquidity zones (`⑥ Liquidity zones`)

> **Question:** where are stop-losses and breakout orders resting that
> price might get drawn toward?
> **Helps with:** anticipates sweep/stop-hunt behavior, so a wick toward one
> of these levels doesn't catch you off guard.

- **Show liquidity zones** — the master toggle. Marks equal (or
  near-equal) highs and lows as resting liquidity pools — clusters of
  stop-losses and breakout orders that price is statistically drawn toward
  before reversing. **Buy-side liquidity** = equal highs, sitting above
  price. **Sell-side liquidity** = equal lows, sitting below price. A move
  toward one of these zones followed by a sharp reversal is a classic
  "liquidity sweep." Lifecycle: fades ("(swept)") the moment price wicks
  through (a sweep attempt), shows "(held)" if price closes back away by
  the hold margin (the sweep failed to hold), and deletes once a *close*
  confirms the level is consumed — whether or not price reversed, the
  resting liquidity is gone either way.
- **Equal-level tolerance (× ATR)** — how close two swing points must be,
  in ATR, to count as "equal" and form a pool. Smaller = only near-identical
  levels cluster. Larger = merges more distant swings into one pool, which
  can overstate how "equal" they really were.
- **Pivot lookback (bars)** — how far back to look for a matching prior
  pivot when deciding whether a new pivot forms a liquidity pool. Longer
  catches older equal highs/lows; shorter keeps only recent, more relevant
  pools.
- **Extend zone right (bars)** — how far an unswept liquidity zone is drawn
  forward. Scales with Auto-adapt to timeframe.
- **Border style** *(Solid / Dashed / Dotted, default Solid)* — border
  style for liquidity zone boxes, independent of the other three zone
  types.

---

## 7. Confluence + historical hit-rate

> **Question:** how many independent signals agree on this zone, and has
> that agreement actually mattered historically?
> **Helps with:** separates a zone that's genuinely worth watching from one
> that just happens to be nearby, using this chart's own track record
> instead of a guess.

This is what ties the four zone types into one answer: **is the nearest
zone worth watching, and how do we know?** All controlled from `② Zones —
shared style` (settings covered there); this section explains the mechanism
itself in full.

- **Confluence**: whenever the swing-high or swing-low zone is the nearest
  one above/below price, it's checked against every active order block,
  FVG, and liquidity pool *that shares its directional bias* (a resistance
  zone only checks bearish-biased boxes; a support zone only checks
  bullish ones). Each type that overlaps by at least the minimum-overlap
  threshold adds 1 to a confluence count (0–3), shown on the zone's label
  and in the status table's Resistance/Support rows.
- **Historical hit-rate, tracked separately per zone type**: every order
  block, FVG, and liquidity pool is tagged at the moment it's created with
  how many of the *other two* detector types already overlapped it (0, 1,
  or "2+"). Each type keeps its own set of buckets — an order block's
  history and a liquidity pool's are never blended together, since there's
  no reason to assume they behave the same way.
- **Held, tracked alongside hit**: for each bucket, the script also tracks
  how many of the touched zones went on to be confirmed *held* (closed back
  away by the hold margin) rather than just touched.
- **Display picks the most-sampled type, and names it**: the nearest zone
  shows the hit rate / hold rate of whichever overlapping type has the
  largest sample size at that confluence level, labelled so you know which
  one it is — e.g. `Resistance · 2 conf · OB hit 74%/held 41% (n=31)` —
  rather than quietly averaging different zone types into one misleading
  number.
- **Read this as a frequency count, not a prediction.** It's built entirely
  from this chart's own history. Changing ANY input restarts the count from
  zero, since TradingView recalculates the whole script from bar 1 when an
  input changes.

---

## 8. Display (`⑦ Display`)

> **Question:** what status information is visible at a glance, without
> hunting for boxes on the chart?
> **Helps with:** surfaces the current watched levels and the
> confluence/hit-rate read in one corner panel.

- **Status table** — corner panel showing swing length + ATR, the current
  watch high/low, and the nearest Resistance/Support confluence + hit-rate
  rows.
- **Table position** *(Top Right / Top Left / Bottom Right / Bottom Left)* —
  which corner the status table is anchored to. Move it if it overlaps
  another indicator's panel, the price scale, or the companion Structure
  Break Signals script's own table.
- **Raw pivot markers** — small triangles on every detected swing high/low,
  including ones the ATR filter rejected. Useful for diagnosing why a zone
  isn't showing up where you'd expect one — turn this on to see whether the
  pivot was detected but filtered out, or never detected at all.

---

## Recommended techniques

**1. Prioritize sample size over raw confluence count.** A zone showing `3
conf` with `n=4` is a coin flip dressed up as a strong signal. A zone showing
`2 conf` with `n=60` is real evidence. Until `Min sample size before showing
a rate` has actually been cleared for a given confluence level, treat the
zone on confluence count alone and don't lean on the percentage.

**2. Trade the HELD rate, not the hit rate, for fade/reversal setups.** Hit
rate answers "does price get here?" — that's attention, not respect. Held
rate answers "does price actually reject once it arrives?" A zone with a
90% hit rate but a 30% held rate is a magnet, not a wall — price visits it
constantly and mostly blows through. If your plan is to fade a zone, the
held rate is the number that matters.

**3. Read the box label as a live trade manager, not just a static
marker.** "(tested)" on a zone you're relying on means your thesis is now
being actively challenged — tighten stops or scale out rather than waiting
to find out. "(held)" means the zone just did its job — that's validation,
and often the highest-confidence moment to add or hold with confidence. The
box disappearing entirely means the level failed outright — if your trade
depends on it, that's your exit signal, not a "wait and see."

**4. Don't retune settings mid-session and expect the hit-rate numbers to
still mean anything immediately.** Every input change restarts every
confluence bucket at `n=0` (TradingView recalculates the whole script from
bar 1). If you're actively tuning `Min overlap to count as confluence` or
any zone-type setting, expect the rates to read `(building)` for a while
afterward — that's expected, not broken.

**5. Let the table tell you which detector to trust on this instrument,
don't assume one is universally best.** The Resistance/Support rows name
whichever type (OB, FVG, or Liquidity) has the largest sample size at the
current confluence level. Over time this tells you, empirically, which
detector actually works on what you're trading — that's more useful than
assuming order blocks (or any one type) are inherently superior.

**6. Treat liquidity pools as "likely wick target," not "reversal
guaranteed."** A liquidity zone marks where stops are statistically
resting — price is drawn there, but that doesn't mean it reverses there.
Check the zone's held rate specifically before treating a sweep as your
reversal trigger; a low held rate means sweeps on this instrument tend to
run, not snap back.

**7. Consider a top-down layout: Key Zone Map on a higher timeframe, Structure Break Signals on your execution timeframe.** These are separate
indicator instances, so this means two chart layouts (or two panes) — but
mapping the macro zones on, say, a 1H chart while you time entries on a 5M
with Structure Break Signals gives you zone context that a single-timeframe
view can't.

---

## Using both scripts together

The two were one indicator before being split for a reason — they answer
different halves of the same question, and are most useful read side by
side on the same chart:

1. **Key Zone Map tells you WHERE.** Watch the nearest Resistance/Support
   zone as price approaches it — check its confluence count and, once
   there's enough sample size, its hit/held rate.
2. **Structure Break Signals tells you WHETHER something real happened
   there.** As price interacts with that zone, watch for a CHoCH or BOS
   with a strong confidence score (55+, ideally 75+) at or near the same
   level.
3. **Agreement between the two is the highest-confidence setup available.**
   A zone showing "(held)" in Key Zone Map at the same time Structure Break
   Signals prints a high-score CHoCH in the rejecting direction is two
   independent systems confirming the same read — meaningfully stronger
   than either alone.
4. **Use the retest alert as the entry trigger once the zone shows
   "(held)."** Structure Break Signals' `Retest Support`/`Retest
   Resistance` alerts already favor higher-confidence entries; requiring
   the Key Zone Map box to also show a confirmed hold before acting on that
   alert filters out the retests that are least likely to matter.
5. **If you're trading a breakout THROUGH a zone instead of a bounce off
   it**, look for the inverse combination: the zone transitioning from
   "(tested)" to gone (invalidated) at the same time Structure Break
   Signals fires a high-score BOS through it. Both systems agreeing the
   level failed is stronger confirmation than a break with no zone context,
   or a failed zone with no structural confirmation.
6. **Manage the trade using the opposite zone as your target.** If you
   entered off a Support bounce, Key Zone Map's Resistance row is your
   nearest logical target — read straight off the table rather than eyeballing
   the chart.

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
