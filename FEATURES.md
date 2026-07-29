# BOS / CHoCH Structure v5.2 — Feature Guide

This indicator does two jobs: it labels **structure breaks** (BOS/CHoCH) with a
confidence score, and it shades the **zones** — swing areas, order blocks, fair
value gaps, liquidity pools — that those breaks originate from and react to.
This doc walks through every feature, what it draws, and what it's telling you
when you look at it.

---

## 1. The core signals: BOS and CHoCH

Everything else in the indicator exists to filter, grade, or contextualize
these two events.

- **BOS (Break of Structure)** — price closes beyond a swing level *with* the
  current trend. Tells you: the existing trend just got confirmation: continuation.
- **CHoCH (Change of Character)** — price closes beyond a swing level *against*
  the current trend. Tells you: the prevailing bias may be ending: the first
  sign of a reversal.

Both draw a line at the broken level and (optionally) a label. Color and line
style are separately configurable per type (`⑦ BOS lines`, `⑧ CHoCH lines`) so
you can tell them apart at a glance without reading text.

---

## 2. Sensitivity presets (`① Sensitivity presets`)

- **Preset** — one dropdown that sets every filter threshold at once: `Very
  Loose → Loose → Balanced → Strict → Very Strict`, or `Custom` to unlock every
  manual value in the sections below. Tells you: how much noise vs. lag
  you're trading off. Looser = more signals, earlier, noisier. Stricter =
  fewer signals, later, cleaner.
- **Fine tune (1–10)** — nudges the chosen preset up or down without switching
  presets. 5 = preset as-is; above 5 loosens, below 5 tightens. Ignored on
  Custom. Use this instead of jumping presets when one is "almost right."

---

## 3. Core structure (`② Core structure`)

- **Swing pivot length** — how many bars must sit on each side of a candle for
  it to count as a swing high/low. THE most important setting: it sets your
  confirmation lag (a length-5 swing can't be confirmed until 5 bars later).
  Lower = more, smaller, faster swings. Higher = fewer, major, slower swings.
- **ATR length** — lookback for the ATR used by every size-based filter and
  every zone threshold in the indicator. Shorter reacts faster to volatility
  changes; longer is smoother and more stable.
- **Filter minor swings by size / Min swing size (× ATR)** — a pivot only
  counts as real structure if it moved far enough (in ATR) from the last
  opposite swing. Tells you: whether a wiggle is genuine structure or just
  noise inside consolidation.

---

## 4. Break-quality filters (`③ Break quality filters`)

Each of these answers one question: *is this break real, or a fakeout?*

- **Require break strength / Min clearance (× ATR)** — price must close past
  the level by a minimum distance, not just one tick. Tells you: how decisively
  price cleared the level.
- **Require displacement candle / Min candle range (× ATR)** — the breaking
  candle itself must have real size relative to recent volatility. Tells you:
  whether the break came with an impulsive move or a weak drift-through.
- **Also require body > 50% of range** — on top of range, the candle's body
  must dominate its wick. Filters spike-and-close-back candles.
- **Reject long-wick breaks** — if the wick beyond the level is bigger than
  the body beyond it, the break is skipped. Tells you: the move looked more
  like a rejection/sweep than an accepted break.
- **Require volume expansion / Min volume (× average) / Volume average
  length** — the breaking candle must trade above its recent average volume.
  Tells you: whether real participation backed the move. Only trust this on
  feeds with real volume (futures generally yes; synthetic forex/CFD feeds,
  verify first).
- **Merge near-equal levels / Equal-level tolerance (× ATR)** — treats levels
  within a small band as the same level, so a double top/bottom doesn't print
  two separate breaks.
- **Min bars between breaks (cooldown)** — forces a gap between labelled
  breaks so chop doesn't rapid-fire labels.
- **Confirmation bars after break** — waits N bars after a break and only
  labels it if price is *still* beyond the level. Tells you: this is the
  direct lag-vs-fakeout dial — every bar added here is a bar of entry given up
  in exchange for fewer false signals.
- **Strict: full body beyond level** — requires both open and close past the
  level, not just the close. Rarely needed; break strength usually achieves
  the same goal with less lag.

---

## 5. Context filters (`④ Context filters`)

- **Only signal with EMA trend / EMA length** — suppresses breaks that go
  against a longer-term EMA. Tells you: whether a break aligns with the bigger
  picture. Warning: this will suppress the very first CHoCH of a genuine
  reversal, since that signal is *defined* by going against the trend. Leave
  off if you trade reversals.
- **Restrict to a session / Session window** — only evaluates structure inside
  a chosen time window (e.g. US cash session). Tells you: ignores breaks
  formed in low-liquidity/overnight chop that aren't actionable for your
  session anyway.

---

## 6. Display & history (`⑤ Display & history`)

Mostly cosmetic, but a few items are informational:

- **Live (unbroken) levels** — dotted lines (paired with the swing zone boxes,
  see §8) showing the levels price is *currently* working against. Tells you:
  what needs to break for the next signal, before it happens — the most
  useful setting for planning a trade live.
- **Raw pivot markers** — shows every detected swing, including ones the
  filters rejected. Tells you (diagnostically): whether a swing you'd mark by
  hand was detected-but-filtered, or never detected at all.
- **Status table** — corner panel with current bias, exact watched levels,
  bars since last break, ATR, active preset, last score, and pending state.
  The watched-level numbers are meant to be copied straight into a trade
  journal.
- **Verbose labels** — appends ATR clearance to each label (e.g. `BOS +0.3`).
- **Max breaks to draw** — auto-deletes the oldest BOS/CHoCH lines/labels once
  this count is exceeded, to keep the chart clean and under TradingView's caps.

---

## 7. Internal structure (`⑥ Internal structure`, optional)

Runs a second, faster swing-length pass alongside the main one.

- **i-BOS** — a minor break *with* the higher-timeframe trend. Tells you:
  short-term continuation inside the current leg — useful for entry timing.
- **i-CHoCH** — a minor break *against* the higher-timeframe trend. Tells you:
  an early, small-scale warning that the current leg may be losing steam,
  before the main-structure CHoCH would ever fire.

Drawn thin and semi-transparent so it doesn't compete visually with the main
structure lines.

---

## 8. Confidence score (`⑨ Confidence score`, `⑩ Score tuning`)

The filters above are pass/fail. The score tells you *how well* a break
passed — a break that barely qualified and one that qualified emphatically
both used to just say "BOS." Now they say "BOS 42" and "BOS 91."

Built from five independent 0–100-weighted measures:

| Measure | Default weight | Tells you |
|---|---|---|
| Clearance beyond the level | 30 | How far past the level price actually closed. |
| Displacement | 25 | How large the breaking candle was vs. recent volatility. |
| Body conviction | 15 | Whether the candle closed near its extreme, or left a rejection wick. |
| Volume participation | 15 | Whether real trading activity backed the move (0 this if your feed has synthetic volume — its share redistributes automatically). |
| Size of the leg broken | 15 | Whether the swing being broken was substantial, structural context rather than the breaking candle itself. |

Weights are auto-normalized to 100 no matter what you type, so zeroing one
never silently caps the score. Rough reading: **75+ emphatic, 55–75 solid,
below 40 marginal.**

- **Minimum score to signal** — breaks below this score aren't labelled at
  all. Recommended workflow: run at 0 for a while with scores shown, see what
  actually worked on your instrument, *then* set the cutoff — don't guess it.
- **Fade low-score breaks** — draws low-scoring breaks more transparently so
  strong structure jumps out without reading numbers.
- **Score tuning (`⑩`)** — per-measure weight and "full marks" threshold, for
  when you want to hand-tune exactly what the score rewards.

---

## 9. Smart Money Zones — shared style (`⑪ Zones — shared style`)

One place controls the look of every zone type below:

- **Bullish zone colour** — used for anything that favors longs: swing low
  zones, bullish order blocks, bullish FVGs, sell-side liquidity pools.
- **Bearish zone colour** — used for anything that favors shorts: swing high
  zones, bearish order blocks, bearish FVGs, buy-side liquidity pools.
- **Active zone opacity** — how solid a live, untested zone looks.
- **Extra fade once tested/mitigated** — how much fainter a zone gets once
  price has interacted with it. Tells you at a glance: solid = still live and
  untested; faint = already been tapped once, treat with more caution.
- **Max active zones per type** — caps how many of each zone type stay on
  chart at once (oldest auto-deletes), independent per type.

---

## 10. Swing zones (`⑫ Swing zones`)

Upgrades the "live level" concept into a visible **area**, not just a price.

- **What it draws**: a box from the swing candle's wick (the exact extreme)
  to its body edge (where real conviction started), for both the current
  watched high and watched low.
- **Tells you**: the *whole* area price likely needs to work through to
  break structure — not one exact tick, but a zone of reaction. The wick edge
  is the hard extreme; the body edge is where the market actually accepted
  price. A touch that only reaches the wick edge is a weaker test than a close
  through the body edge.
- Only ever shows the *current* watched high/low (matches the existing "live
  level" design) — it's a planning tool for what's coming, not a history log.

---

## 11. Order blocks (`⑬ Order blocks`)

- **What it is**: the last opposite-colored candle before an impulsive break —
  the candle where the move that broke structure likely originated. A
  bullish OB is the last down-close candle before a break up; a bearish OB is
  the last up-close candle before a break down.
- **Tells you**: a high-probability reaction zone. Price often returns to
  retest an order block before continuing in the breakout direction — this is
  the "institutional footprint" traders watch for entries.
- **Box lifecycle** (this is the important part to read on the chart):
  - **Solid, growing** = still untested. Nobody has returned to it yet.
  - **Faded** = price has wicked back into it once (a retest happened).
  - **Gone** = price *closed* all the way through the far side — the block
    failed and is no longer valid support/resistance.
- **Search back this many bars** — how far behind the break candle to look
  for the origin candle. Note: with `Confirmation bars` > 0 the search starts
  from the confirmation bar, not the original impulse bar, so the found
  candle can be slightly off from the "textbook" one at higher confirmation
  settings.

---

## 12. Fair value gaps (`⑭ Fair value gaps`)

- **What it is**: a classic 3-candle imbalance — candle 1's wick doesn't
  overlap candle 3's wick, leaving a gap the market moved through without
  trading. Bullish FVG = gap left behind an up move; bearish = behind a down
  move.
- **Tells you**: a zone price statistically tends to return to and "fill"
  before continuing — because the market skipped trading there the first
  time, there's unfinished business.
- **Box lifecycle**: same solid → faded → gone pattern as order blocks, but
  keyed to fill instead of touch — faded once price partially fills the gap,
  gone once price closes all the way through it (fully filled).
- **Min gap size (× ATR)** — filters out one-tick noise gaps so only
  meaningful imbalances draw.
- **50% midline (CE)** — optional dotted line at the gap's midpoint. Some
  traders treat this "consequent encroachment" level as the real reaction
  point rather than the whole gap.

---

## 13. Liquidity zones (`⑮ Liquidity zones`)

- **What it is**: equal (or near-equal) highs/lows within an ATR tolerance —
  clusters of resting stop-losses and breakout orders.
  - **Buy-side liquidity** = equal highs, sitting *above* price.
  - **Sell-side liquidity** = equal lows, sitting *below* price.
- **Tells you**: where price is statistically drawn toward before reversing —
  these levels act as magnets because there's real, resting order flow there.
  A move toward one of these zones followed by a sharp reversal is a classic
  "liquidity sweep."
- **Box lifecycle**:
  - **Solid** = untouched pool, still resting.
  - **Faded** = price has wicked through it (a sweep attempt) but hasn't
    closed beyond it yet.
  - **Gone** = price *closed* beyond the level — the resting liquidity has
    been consumed, whether or not price reversed afterward.
- **Equal-level tolerance (× ATR)** — how close two swings must be to count
  as "equal." Smaller = only near-identical levels cluster.
- **Pivot lookback (bars)** — how far back a matching prior pivot can be found.

---

## 14. Alerts

- **CHoCH Bullish / Bearish**, **BOS Bullish / Bearish** — fire the instant a
  break confirms, split by type so you can wire different notification
  channels to reversals vs. continuations.
- **Retest Support / Resistance** — fires when price returns to a *recently
  broken* level and holds it (closes back on the correct side). Tells you:
  this is generally a higher-confidence entry than the original break, since
  the level has now been defended twice. De-duplicated so a level sitting on
  the alert threshold doesn't spam you every bar.

---

## Reading the chart at a glance

Once everything is on, here's the mental model:

1. **Boxes** (swing zones, order blocks, FVGs, liquidity pools) = *where* to
   look for reactions. Solid = untested and worth watching closely. Faded =
   already used once, lower priority. Gone = no longer relevant.
2. **Lines with labels** (BOS/CHoCH) = *confirmation* that structure actually
   broke, with a 0–100 score telling you how convincingly.
3. **The table** = your at-a-glance status: current bias, exact levels to
   watch, and how strong the last break was.

The general workflow: watch the live swing zone / order block / FVG / liquidity
boxes for price approaching a zone, then use the BOS/CHoCH label + score to
confirm whether structure actually broke there or held.
