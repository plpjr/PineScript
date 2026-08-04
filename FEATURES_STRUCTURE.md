# Structure Break Signals v7.2 — Feature Guide

*(Formerly "BOS / CHoCH Structure" — renamed, same script.)*

**File:** `Structure_Break_Signals.pine` · **TradingView indicator name:**
"Structure Break Signals v7.2" · **Companion:** `Key_Zone_Map.pine`
(`FEATURES_ZONES.md`)

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
  current trend. Tells you: the existing trend just got confirmation:
  continuation.
- **CHoCH (Change of Character)** — price closes beyond a swing level
  *against* the current trend. Tells you: the prevailing bias may be ending:
  the first sign of a reversal.

Both draw a line at the broken level and (optionally) a label. Color and line
style are separately configurable per type (`⑦ BOS lines`, `⑧ CHoCH lines`) so
you can tell them apart at a glance without reading text.

---

## 2. Sensitivity presets (`① Sensitivity presets`)

- **Preset** *(dropdown: Very Loose / Loose / Balanced / Strict / Very
  Strict / Custom)* — one control that sets every filter threshold in `③
  Break quality filters` and `② Core structure` at once.
  - `Very Loose` — catches almost every structure break. Use to see raw
    structure, or on very slow instruments.
  - `Loose` — slightly filtered. Good for scalping lower timeframes where
    you accept noise in exchange for earlier entries.
  - `Balanced` — sensible default for intraday futures on 5M–15M. Starting
    point for most people.
  - `Strict` — only well-defined breaks with real displacement. Fewer
    signals, later, higher quality.
  - `Very Strict` — only major structure. Use on higher timeframes, or when
    you only want A+ setups.
  - `Custom` — ignores the preset entirely and uses every manual value in
    the sections below.
  - Tells you: how much noise vs. lag you're trading off. Looser = more
    signals, earlier, noisier. Stricter = fewer signals, later, cleaner.
- **Fine tune (1 = strictest, 10 = loosest)** — nudges the chosen preset up
  or down without switching presets. 5 = the preset exactly as designed.
  Above 5 progressively loosens (more signals, earlier, noisier); below 5
  progressively tightens (fewer signals, later, cleaner). Ignored when
  Preset = Custom. Practical use: if a preset is close but gives slightly
  too many signals, drop this to 3–4 rather than jumping to the next preset
  down.
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
  decision from how far to draw or look back once one fires. OFF = every
  bar-count setting means exactly what you typed, unscaled.

---

## 3. Core structure (`② Core structure`)

- **Swing pivot length** — how many bars must sit on each side of a candle
  for it to count as a swing high/low. THE most important setting in the
  indicator: it directly sets your confirmation lag (a swing of length 5
  can't be confirmed until 5 bars after it forms — that lag is unavoidable
  with pivot detection). Lower (2–4) detects small swings: more structure
  points, more signals, more noise, but less lag. Higher (7–12) keeps only
  major swings: cleaner structure, far fewer signals, more lag. Only used
  when Preset = Custom.
- **ATR length** — lookback for the ATR used by every size-based filter in
  the indicator. Shorter (7–10) reacts fast to volatility changes, so
  filters tighten and loosen quickly — good for sessions with sharp
  volatility shifts. Longer (20–50) is smoother and more stable, less
  reactive to a single volatile bar. 14 is standard and used in every
  preset, not just Custom.
- **Filter minor swings by size** — ON means a pivot only counts as
  structure if it moved far enough from the last opposite swing, removing
  the tiny wiggles inside consolidation that would otherwise get labelled as
  structure. OFF means every detected pivot counts, including micro-swings
  inside chop. Recommend leaving ON; turn off only if you specifically want
  to see raw, unfiltered pivot structure.
- **Min swing size (× ATR)** — how far a pivot must be from the previous
  opposite swing to count as structure, measured in ATR. 0.0–0.2 is very
  sensitive, almost nothing filtered. 0.4–0.6 is balanced — filters obvious
  chop while keeping real swings. 1.0+ keeps only large structural swings.
  Move it up if consolidation is being labelled as structure; move it down
  if it's missing swings you'd clearly mark by hand. Only used when
  Preset = Custom.

---

## 4. Break-quality filters (`③ Break quality filters`)

Each of these answers one question: *is this break real, or a fakeout?* All
are ignored unless Preset = Custom, except where noted.

- **Require break strength** — requires price to close beyond the level by a
  meaningful amount, not just one tick past it. ON filters out marginal
  breaks that clear the level by a hair and immediately fail back inside —
  one of the highest-value filters here. OFF means any close past the level
  counts, even by a single tick. Strongly recommend ON.
- **Min clearance beyond level (× ATR)** — how far past the level the close
  must be, in ATR, when break strength is required. 0.05 is barely filtered.
  0.10–0.20 is balanced, removing tick-through fakeouts. 0.30+ keeps only
  decisive breaks — notably fewer signals, later entries. Tradeoff: raising
  this improves quality but you enter later and can miss breaks that were
  real but shallow.
- **Require displacement candle** — requires the candle that breaks the
  level to have real size relative to recent volatility. ON rejects breaks
  on a tiny indecision candle — genuine institutional breaks usually come
  with expansion. OFF lets any candle break structure, including dojis.
  Recommend ON; this is the second-highest-value filter after break
  strength.
- **Min candle range (× ATR)** — how large the breaking candle's full range
  must be, in ATR, when displacement is required. 0.3 is permissive, most
  candles qualify. 0.6–0.8 is balanced, requiring visible expansion. 1.2+
  keeps only strong impulsive candles — few signals. Move it up if you're
  seeing weak breaks that stall immediately; move it down if real breaks are
  being skipped in low-volatility sessions.
- **Also require body > 50% of range** — an additional conviction test on
  top of the range test. ON means the candle body must be more than half its
  total range, so a long-wicked rejection candle won't count as a break even
  if its range is large. OFF means only total range matters. Turn ON if
  you're getting breaks on candles that spiked through and closed back near
  their open.
- **Reject long-wick breaks** — rejects breaks where the candle left a large
  wick beyond the level, which suggests the move was rejected rather than
  accepted. ON: if the wick past the level is bigger than the body past the
  level, the break is skipped — useful for filtering liquidity sweeps that
  get mislabelled as breaks. OFF: wick shape is ignored. Tradeoff: this can
  filter out genuine sweep-then-reverse setups you may actually want to
  trade — turn on only if wick-fakeouts are your main problem.
- **Require volume expansion** — requires the breaking candle to trade above
  its recent average volume. ON rejects breaks on thin volume, since real
  structure breaks usually come with participation. OFF ignores volume
  entirely. Important: only meaningful on instruments with reliable volume
  data — futures generally work well, but some CFD and forex feeds use
  synthetic volume that makes this filter behave unpredictably. Verify your
  feed before trusting it.
- **Min volume (× average)** — how much above average volume the breaking
  candle must be, when volume expansion is required. 1.0 is merely average
  volume. 1.2–1.5 is clear expansion, balanced. 2.0+ keeps only
  high-participation breaks — very restrictive.
- **Volume average length** — lookback for the average-volume comparison.
  Shorter (10) compares against very recent activity and adapts quickly
  within a session. Longer (50) compares against a broader baseline, less
  affected by a single busy period. 20 is a reasonable intraday default.
- **Merge near-equal levels** — treats levels that sit within a small band
  of each other as the same level. ON prevents the indicator printing two
  labels for what is really one double top or double bottom. OFF treats
  each pivot as distinct even if nearly identical. Recommend ON — equal
  highs/lows are common, and double-labelling them clutters the chart.
- **Equal-level tolerance (× ATR)** — how close two levels must be to count
  as the same level, when merging is on. 0.05 merges only near-identical
  prices. 0.15 is balanced. 0.30+ aggressively merges nearby levels, which
  can suppress genuinely separate breaks.
- **Min bars between breaks (cooldown)** — forces a gap between labelled
  breaks. 0 means no cooldown; breaks can print on consecutive bars. 3–5 is
  balanced, stopping rapid-fire labelling during chop. 8+ is heavily
  throttled — only well-separated structure shifts appear. Tradeoff: a high
  cooldown can suppress a genuine fast reversal that legitimately breaks
  structure twice in quick succession.
- **Confirmation bars after break** — waits N bars after a break and only
  labels it if price is *still* beyond the level. 0 labels immediately on
  the breaking candle's close. 1–2 waits for follow-through, cutting
  fakeouts noticeably. 3–5 is very conservative, but the label arrives well
  after the move started. This is the most direct quality-vs-lag dial in the
  whole indicator — every bar you add here is a bar of entry you give up.
  Use it if fakeouts cost you more than late entries do. (Available in every
  preset, not just Custom.)
- **Strict: full body beyond level** — requires both the open and the close
  to be beyond the level, not just the close. ON means the entire candle
  body must clear the level — very restrictive, meaningfully later. OFF
  means a close beyond the level is enough (standard). Most people should
  leave this OFF and use break strength instead, which achieves a similar
  goal with less lag.

---

## 5. Context filters (`④ Context filters`)

- **Only signal with EMA trend** — suppresses breaks that go against a
  longer-term EMA. ON: bullish breaks only print when price is above the
  EMA, bearish breaks only when below — aligns signals with the prevailing
  trend. OFF: all breaks print regardless of trend context. Important
  tradeoff: this will suppress the very first CHoCH of a genuine reversal,
  because that's precisely the signal that fires against the trend. If you
  trade reversals, leave this OFF.
- **EMA length** — length of the trend EMA used by the filter above. Shorter
  (20) follows price closely and flips often. Longer (100–200) defines a
  slower, more structural trend. Only applies when the trend filter is ON.
- **Restrict to a session** — only detects structure breaks inside a chosen
  time window. ON ignores overnight and low-liquidity chop, which produces a
  lot of low-quality structure. OFF analyses all bars. Useful if you trade a
  specific window, since breaks outside your session aren't actionable
  anyway.
- **Session window** — the time window to analyse, in exchange time, e.g.
  `0930-1600` (US regular cash session), `0830-1130` (US morning only),
  `0200-0500` (London session). Set your chart timezone correctly or this
  window won't land where you expect.

---

## 6. Display & history (`⑤ Display & history`)

- **BOS / CHoCH labels** — text labels on each break. Turn off for a cleaner
  chart if the coloured lines are enough.
- **Label size** *(Tiny / Small / Normal)* — text size for break labels. Use
  Tiny on dense lower-timeframe charts.
- **Verbose labels (show ATR clearance)** — ON appends how many ATR the
  break cleared beyond the level directly to the label (e.g. `BOS +0.3` or
  `CHoCH -0.2`), useful for quickly judging break quality without opening
  the table.
- **Live (unbroken) levels** — dotted lines showing the levels price is
  *currently* working against, before any break. This is the most useful
  setting for live trading: it shows what needs to break for a signal to
  fire, so you can plan the trade before the label appears.
- **Live level line width** — thickness of the live level lines.
- **Live level line style** *(Solid / Dashed / Dotted, default Dotted)* —
  dotted by default so live levels read as "not confirmed yet," visually
  distinct from the solid/dashed confirmed break lines.
- **Extend live level right (bars)** — how far the live level line is drawn
  forward from the current bar. Scales with "Auto-adapt to timeframe" like
  every other extend setting, so it means the same amount of real time on
  every chart.
- **Raw pivot markers** — small triangles on every detected swing high/low,
  including ones the filters rejected. Useful for diagnosis: if the
  indicator is missing structure you'd mark by hand, turn this on to see
  whether the pivot was detected but filtered out, or never detected at
  all.
- **Tint background by bias** — colours the chart background by current
  structure bias. Some find it useful for at-a-glance context; others find
  it distracting.
- **Color candles by bias** — colours OHLC candles based on current
  structure bias: bullish = BOS colour, bearish = CHoCH colour, neutral =
  default. Independent of background tint.
- **Status table** — corner panel showing current bias, the exact watched
  levels, bars since the last break, ATR, active preset, last score, and
  pending state. The numeric levels are the useful part: copy them straight
  into your trade journal rather than reading them off the chart.
- **Max breaks to draw (0 = unlimited)** — limits how many historical
  BOS/CHoCH lines and labels remain on chart; oldest auto-delete when
  exceeded. 0 means no limit (may hit TradingView's 500-object cap on busy
  charts). 50 keeps the chart clean on intraday timeframes. Live levels and
  pivot markers aren't counted against this.
- **Show unconfirmed break preview** — when Confirmation bars > 0, draws a
  faint ghost marker at the break level while waiting for confirmation, so
  you can see the break forming in real time rather than waiting blindly.

---

## 7. Internal structure (`⑥ Internal structure`, optional)

Runs a second, faster swing-length pass alongside the main one.

- **Show internal structure** — the master toggle for this whole feature.
  ON tracks a second, faster swing length for minor structure inside the
  current leg: **i-BOS** = a minor break *with* the higher-timeframe trend,
  useful for entry timing; **i-CHoCH** = a minor break *against* the
  higher-timeframe trend, an early small-scale warning the current leg may
  be losing steam before the main-structure CHoCH would ever fire.
- **Internal swing length** — must be smaller than the main Swing pivot
  length. 2–3 is typical.
- **Internal BOS colour / Internal CHoCH colour** — independently
  configurable, no longer forced to match the main BOS/CHoCH colours (⑦/⑧)
  — set them apart, or match them if you'd rather the two read as one
  family.
- **Internal line width** — thickness of internal structure lines.
- **Internal line transparency** — how faded internal lines/labels are.
  Drawn thin and semi-transparent by default so they don't compete visually
  with the main structure lines.

---

## 8. BOS lines and CHoCH lines (`⑦ BOS lines`, `⑧ CHoCH lines`)

Two mirrored groups, one per break type, so BOS and CHoCH can look and
behave completely differently on the chart if you want them to. Defaults:
BOS is solid sky-blue, CHoCH is dashed orange — deliberately different
styles, not just colors, so they're distinguishable even for colorblind
users.

- **Colour** — BOS colour (default sky blue) marks a break *with* the
  existing trend, confirming continuation. CHoCH colour (default orange)
  marks a break *against* the existing trend, signalling a possible
  reversal.
- **Line style** *(Solid / Dashed / Dotted)* — BOS defaults to Solid, which
  reads as more definitive, suiting continuation signals. CHoCH defaults to
  Dashed, distinguishing it from BOS at a glance.
- **Line width** — thickness of the line. Raise if you're on a large
  monitor or find them hard to see.
- **Extend lines right (bars)** — how many bars to draw the line forward
  from the break bar. BOS defaults to 0 (line stops at the break bar,
  cleanest). CHoCH defaults to 50 (enough to see retests without clutter) —
  CHoCH levels often act as ongoing support/resistance, so some extension is
  useful, but "forever" clutters the chart. Adjust to your timeframe: lower
  on 1M, higher on 1H+. Both scale with "Auto-adapt to timeframe."
- **Vertical marker on bar** — draws a small vertical tick on the exact bar
  where the break was confirmed, making the timing unambiguous. BOS
  defaults OFF; CHoCH defaults ON, since CHoCH signals are the easiest to
  misread in real time and the precise bar is worth showing.
- **Draw BOS lines / Draw CHoCH lines** — the master switch per type. Turns
  off the line AND the label for that type, so turning off BOS fully hides
  BOS (not just its line) if you only care about CHoCH reversals, or vice
  versa.

---

## 9. Confidence score (`⑨ Confidence score`)

The filters above are pass/fail. The score tells you *how well* a break
passed — a break that barely qualified and one that qualified emphatically
both used to just say "BOS." Now they say "BOS 42" and "BOS 91."

- **Score every break 0-100** — the master toggle. Grades each break on how
  well it passed instead of a simple pass/fail. Built from five independent
  measures (full breakdown and tuning in `⑩ Score tuning`, next section):
  clearance beyond the level (0–30), displacement of the candle (0–25), body
  conviction (0–15), volume participation (0–15), and size of the leg broken
  (0–15). Rough reading: 75+ is emphatic, 55–75 is solid, below 40 is
  marginal.
- **Minimum score to signal** — breaks scoring below this aren't labelled at
  all. 0 labels everything, score is display-only — start here. Recommended
  workflow: run at 0 for a week with scores shown, watch which scores
  actually worked on your instrument, *then* set this to the number you
  observed rather than guessing. Setting this blind is just a slower way of
  tightening the filters above — the point of the score is to let the chart
  tell you where your cutoff is.
- **Show score on label** — appends the score to each label, e.g. "BOS 82."
  Turn off for a cleaner chart once you've settled on a minimum score.
- **Fade low-score breaks** — draws low-scoring breaks more transparently so
  high-confidence structure stands out at a glance without reading numbers.
  A 90-score break is drawn solid; a 40-score break is drawn faint.

---

## 10. Score tuning, advanced (`⑩ Score tuning (advanced)`)

Per-measure weight and "full marks" threshold, for when you want to
hand-tune exactly what the score rewards. Weights are relative and
auto-normalised to 100 no matter what you type — zeroing one redistributes
its share across the rest instead of silently capping the score and
shifting every threshold you had tuned.

**Weights — how much each measure is worth:**

- **Weight · clearance beyond level** (default 30) — how much the score
  cares that price closed well past the level rather than barely past it.
  This is the single most reliable indicator of a real break, which is why
  it carries the most weight by default.
- **Weight · displacement** (default 25) — how much the score cares that
  the breaking candle was large relative to recent volatility. Raise if
  your instrument breaks with obvious expansion; lower on instruments that
  grind rather than impulse.
- **Weight · body conviction** (default 15) — how much the score cares that
  the candle closed near its extreme rather than leaving a long rejection
  wick. Raise if wick-fakeouts are your main problem — this penalises them
  without rejecting them outright, unlike the wick-reject filter.
- **Weight · volume participation** (default 15) — how much the score
  cares about volume expansion on the breaking candle. Set this to 0 if
  your feed has synthetic or unreliable volume (many forex/CFD feeds) — its
  share redistributes to the other measures, so you lose nothing. On
  futures, volume is real and worth keeping.
- **Weight · size of leg broken** (default 15) — how much the score cares
  that the swing being broken was a large, well-formed leg rather than a
  shallow one. The only component that reads structural context rather than
  the breaking candle itself.

**Thresholds — where each measure earns full marks:**

- **Full marks · clearance (× ATR)** (default 0.40) — clearance beyond the
  level that earns the full clearance score. Lower (0.25) is easier to max
  out — scores cluster high, less discrimination between good and great.
  Higher (0.60) means only emphatic breaks score well. If almost every break
  scores 85+, your thresholds are too easy — raise this and displacement
  first.
- **Full marks · candle range (× ATR)** (default 1.20) — breaking-candle
  range that earns the full displacement score.
- **Full marks · body % of range** (default 0.80) — body-to-range ratio
  that earns the full conviction score. 0.80 means the body is 80% of the
  candle's range; scoring starts from 0.35 and rises to this value.
- **Full marks · volume (× average)** (default 1.60) — volume multiple that
  earns the full participation score. Scoring starts from 0.70× average and
  rises to this value. Ignored when the volume weight is 0.
- **Full marks · leg size (× ATR)** (default 2.00) — size of the broken
  leg, in ATR, that earns the full structural score. Raise on higher
  timeframes where legs are naturally larger.

---

## 11. Alerts

- **CHoCH Bullish / Bearish**, **BOS Bullish / Bearish** — fire the instant a
  break confirms, split by type so you can wire different notification
  channels to reversals vs. continuations.
- **Retest Support / Resistance** — fires when price returns to a *recently
  broken* level and holds it (closes back on the correct side). Tells you:
  this is generally a higher-confidence entry than the original break, since
  the level has now been defended twice. De-duplicated so a level sitting on
  the alert threshold doesn't spam you every bar.

---

## Recommended techniques

**1. Match the preset to your timeframe and style before touching anything
else.** `Balanced` is tuned for 5–15M intraday futures. Scalping lower
timeframes: try `Loose` and accept more noise for earlier entries. Swing
trading on 1H+: `Strict` or `Very Strict` — you want fewer, more decisive
breaks, not every micro-swing. Use the Fine tune dial to nudge a preset
that's *almost* right rather than jumping to the next one.

**2. Run the score at zero before you gate anything with it.** Turn
`Minimum score to signal` off (0) for a week or two with `Show score on
label` on. Watch which scores actually led to follow-through on your
instrument. Set the minimum to *that* number, not a guess — the whole point
of the score is to let the chart tell you where your cutoff is, instead of
you tightening filters blind.

**3. Treat CHoCH and BOS as two different jobs, not one signal repeated
twice.** CHoCH is a *reversal alert* — the trend may be turning, but it's the
riskiest, earliest read. BOS is a *continuation confirmation* — the trend is
already established and just proved itself again. If you trade reversals,
use CHoCH to get your attention, then look for a retest or a same-direction
BOS before committing size. If you trade continuations, largely ignore CHoCH
and lean on BOS + a high score.

**4. Let the retest alert do the entry timing, not the raw break.** The docs
already say it plainly: a level that gets retested and holds is
higher-confidence than the original break. Chasing the break candle itself
means worse fills and more fakeout exposure. Use `Retest Support` /
`Retest Resistance` as your actual trigger where your style allows for the
extra wait.

**5. Turn off the EMA trend filter if you trade reversals — it will actively
hide the setup you're looking for.** It's designed to suppress
against-trend signals, but the first CHoCH of a real reversal is *by
definition* against the trend. Only run it if you exclusively take
with-trend continuation trades.

**6. Use internal structure for entry timing, not bias.** Set the main
`Swing pivot length` (② Core structure) longer to define your higher
timeframe bias, then turn on `⑥ Internal structure` with a short internal
swing length to catch the minor pullback/continuation that gives you a
tighter entry within that bias — rather than entering right on the big
structure break.

**7. Restrict to your actual session if you don't trade 24 hours.** Overnight
and low-liquidity chop generates a lot of structure that isn't actionable
for you anyway; filtering it out means the signals you do see are all ones
you could realistically act on.

---

## Reading the chart at a glance

1. **Lines with labels** (BOS/CHoCH) = confirmation that structure actually
   broke, with a 0–100 score telling you how convincingly.
2. **The table** = your at-a-glance status: current bias, exact levels to
   watch, and how strong the last break was.

If you also run the **Key Zone Map** companion script on the same chart,
that's where the "which level is worth watching, and why" question lives —
this script answers "did structure actually break, and how well." See
**"Using both scripts together"** in `FEATURES_ZONES.md` for the combined
workflow.
