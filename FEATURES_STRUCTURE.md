# Structure Break Signals v7.2 — Feature Guide

*(Formerly "BOS / CHoCH Structure" — renamed, same script.)*

This indicator does one job: grade individual structure **break events**. It
labels BOS (Break of Structure) and CHoCH (Change of Character) with a
0–100 confidence score, so you can tell a marginal break from an emphatic one
at a glance.

> Looking for the zone/support-resistance/confluence side of things? That
> lives in the companion script, **Key Zone Map** — see `FEATURES_ZONES.md`.
> The two used to be one combined indicator; they were split so each stays
> focused on one job and fits in one TradingView indicator slot on its own.

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
- **Auto-adapt to timeframe** — rescales every *extend-right* and *lookback*
  window (BOS/CHoCH line length, retest window) so each spans the same real
  amount of time on every chart, instead of a fixed bar count. Tells you: a
  50-bar setting is 50 minutes on a 1-minute chart and over a week on a
  4-hour chart if left unscaled — this keeps it meaning the same thing when
  you flip timeframes, so you don't have to retune those settings by hand
  every time. Each scaled value is capped at that setting's own manual
  min/max, so it never reaches a value you couldn't have picked yourself.
  Deliberately leaves swing pivot length, filter thresholds, and score
  weights alone — those still come from the Preset/Fine-tune dial, since
  changing what *counts* as a valid break based on timeframe is a different
  decision from how far to draw or look back once one fires.

---

## 3. Core structure (`② Core structure`)

- **Swing pivot length** — how many bars must sit on each side of a candle for
  it to count as a swing high/low. THE most important setting: it sets your
  confirmation lag (a length-5 swing can't be confirmed until 5 bars later).
  Lower = more, smaller, faster swings. Higher = fewer, major, slower swings.
- **ATR length** — lookback for the ATR used by every size-based filter in the
  indicator. Shorter reacts faster to volatility changes; longer is smoother
  and more stable.
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

- **Live (unbroken) levels** — dotted lines showing the levels price is
  *currently* working against. Tells you: what needs to break for the next
  signal, before it happens — the most useful setting for planning a trade
  live. Width, style, and how far it extends right are all independently
  configurable, and the extend length scales with "Auto-adapt to timeframe"
  like every other extend setting.
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
structure lines. Internal BOS/CHoCH colors are independently configurable
(no longer forced to match the main BOS/CHoCH colors), so you can make the
two visually distinct or matching, your call.

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

## 9. Alerts

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

1. **Lines with labels** (BOS/CHoCH) = confirmation that structure actually
   broke, with a 0–100 score telling you how convincingly.
2. **The table** = your at-a-glance status: current bias, exact levels to
   watch, and how strong the last break was.

If you also run the **Key Zone Map** companion script on the same chart,
that's where the "which level is worth watching, and why" question lives —
this script answers "did structure actually break, and how well."
