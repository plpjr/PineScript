# Structure Break Signals v7.8 — Feature Guide

*(Formerly "BOS / CHoCH Structure" — renamed, same script. As of v7.5, the
BOS/CHoCH labels themselves are renamed to classic Dow Theory swing terms —
HH, LL, LH, HL — see §1 below.)*

**File:** `Structure_Break_Signals.pine` · **TradingView indicator name:**
"Structure Break Signals v7.8" · **Companion:** `Key_Zone_Map.pine`
(`FEATURES_ZONES.md`)

This indicator does one job: grade individual structure **break events**. It
labels continuation breaks (**HH** / **LL**) and reversal breaks (**LH** /
**HL**) with a 0–100 confidence score, so you can tell a marginal break from
an emphatic one at a glance.

> Looking for the zone/support-resistance/confluence side of things? That
> lives in the companion script, **Key Zone Map** — see `FEATURES_ZONES.md`.
> The two used to be one combined indicator; they were split so each stays
> focused on one job and fits in one TradingView indicator slot on its own.

---

## 1. The core signals: HH, LL, LH, and HL

> **Question:** what is the indicator actually detecting in the first place?
> **Helps with:** establishes the four events — continuation vs. reversal, up
> vs. down — that every other section exists to filter, grade, or visually
> style.

Everything else in the indicator exists to filter, grade, or contextualize
these four events. They're built from the same two underlying break types
BOS/CHoCH used to name — a **continuation** break (with the trend) or a
**reversal** break (against the trend) — just labelled with the classic Dow
Theory swing term for what actually just broke:

- **HH (Higher High)** — price closes above a swing high, and that high sits
  *above the swing high before it*: continuation. A new Higher High.
- **LL (Lower Low)** — price closes below a swing low, and that low sits
  *below the swing low before it*: continuation. A new Lower Low.
- **LH (Lower High)** — price closes above a swing high that sits *below the
  previous one*: reversal. The Lower High capping the downtrend just broke —
  the first sign it may be turning up.
- **HL (Higher Low)** — price closes below a swing low that sits *above the
  previous one*: reversal. The Higher Low supporting the uptrend just broke —
  the first sign it may be turning down.

In other words: HH/LL are "the trend did it again," LH/HL are "the level that
was defining the trend just gave way."

**Which of the four you get is decided by the pivot sequence itself** — the
indicator compares the level that broke against the swing before it on that
same side. As of v7.6 that comparison *is* the definition; earlier versions
inferred it from the direction of the previous break, which could label a
break of a genuinely lower high as "HH" whenever the prior break had been
bullish. The alerts read the same comparison, so the alert you receive always
matches the label drawn on that bar.

Both draw a line at the broken level and (optionally) a label. Color and line
style are separately configurable per type (`⑦ HH/LL lines (continuation)`,
`⑧ LH/HL lines (reversal)`) so you can tell them apart at a glance without
reading text.

---

## 2. Sensitivity presets (`① Sensitivity presets`)

> **Question:** how strict should the whole indicator be, without
> hand-tuning a dozen individual filters?
> **Helps with:** gets you to a sensible starting configuration for your
> timeframe and trading style in one control, plus a fine-tune dial for
> small adjustments afterward.

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
  window (HH/LL/LH/HL line length, retest window) so each spans the same real
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

> **Question:** what actually counts as a swing high or low in the first
> place?
> **Helps with:** defines the raw pivots everything downstream — breaks,
> the score, alerts — is built on top of. Get this wrong and every other
> section is working from the wrong foundation.

- **Swing engine** *(Pivot (fixed bars) / Directional change (adaptive))* —
  *how* a swing gets confirmed. The deepest choice in the indicator, since
  everything downstream is built on the swings it produces. **Pivot** is the
  classic: a bar is a swing high once N bars on each side are lower.
  Predictable, but the confirmation lag is a fixed *bar count*, so it means
  completely different amounts of real time and real movement in a dead lunch
  hour versus a news release. **Directional change** confirms an extreme the
  moment price retraces a set multiple of ATR away from it — a sharp reversal
  confirms almost immediately, a slow drift takes as long as it needs. The
  trigger is a real market event (price actually turned) instead of a clock,
  and being ATR-scaled it means the same thing across timeframes and
  volatility regimes. In practice it gets you the same swings *earlier*,
  which matters most on fast reversals; pivot mode is more familiar and
  easier to eyeball against a chart. Internal structure (⑥) always uses the
  pivot engine — it exists to read a faster, smaller scale, which a short
  fixed pivot length already does well.
- **Reversal threshold (× ATR)** — directional-change mode only; this is what
  replaces Swing pivot length. How far price must pull back from an extreme
  before that extreme is confirmed as a swing. Lower (0.5–1.0) confirms
  quickly and detects small swings — the analogue of a short pivot length,
  but adaptive. 1.5 is a balanced start. Higher (2.5–4.0) means only real
  reversals confirm a swing.
- **Swing pivot length** — pivot mode only. How many bars must sit on each
  side of a candle for it to count as a swing high/low. In pivot mode this is
  THE most important setting: it directly sets your confirmation lag (a swing of length 5
  can't be confirmed until 5 bars after it forms — that lag is unavoidable
  with pivot detection). Lower (2–4) detects small swings: more structure
  points, more signals, more noise, but less lag. Higher (7–12) keeps only
  major swings: cleaner structure, far fewer signals, more lag. Only used
  when Preset = Custom.
- **Volatility measure** *(ATR (Wilder) / Median true range)* — which
  estimate of "normal bar size" every ATR-scaled threshold is built on:
  break clearance, displacement, min swing size, equal-level tolerance, and
  all six score thresholds. **ATR (Wilder)** is the standard running average
  of true range — familiar, but it's a *mean* of a right-skewed variable, so
  one news bar at 10× normal size lifts it for many bars afterward and
  quietly tightens every threshold at once. The practical effect is that the
  indicator goes quiet right after the most informative move of the session.
  **Median true range** takes the middle bar of the lookback instead, so a
  single outlier barely moves it. Caveat worth knowing before you switch:
  median true range reads roughly **10–20% lower** than ATR on the same
  data, because it ignores the fat right tail a mean gets pulled by — so
  every ATR-multiple setting becomes effectively *looser*. Raise your
  multiples by about 15% if you want to hold sensitivity constant.
- **Volatility lookback** — lookback for whichever measure you picked above.
  Shorter (7–10) reacts fast to volatility changes, so filters tighten and
  loosen quickly — good for sessions with sharp volatility shifts. Longer
  (20–50) is smoother and more stable, less reactive to a single volatile
  bar. 14 is standard and used in every preset, not just Custom.
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

> **Question:** is this break real, or a fakeout?
> **Helps with:** separates genuine structural breaks from noise before
> they're ever labelled on your chart — this is where most of the
> signal-quality work in the indicator actually happens.

All of these are ignored unless Preset = Custom, except where noted.

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
  accepted. ON: if the part of the wick sitting past the level is bigger than
  the part of the *body* sitting past the level, the break is skipped —
  useful for filtering liquidity sweeps that get mislabelled as breaks. OFF:
  wick shape is ignored. Tradeoff: this can filter out genuine
  sweep-then-reverse setups you may actually want to trade — turn on only if
  wick-fakeouts are your main problem. *(v7.6 corrected what this measures:
  it previously compared the candle's entire upper/lower wick against the
  close's clearance, which coincides with the intended test for a plain
  breakout candle but not for one that closes past the level while bearish,
  or that opens already past it. If you had this on, expect it to trigger
  somewhat more often now — it is catching cases it used to miss.)*
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
- **Volume baseline** *(Simple average / Median / Time of day)* — what
  "normal volume" means for this bar. Feeds both the volume filter and the
  volume component of the confidence score. **Simple average** is a rolling
  mean and the weakest choice intraday: volume is strongly U-shaped through
  a session, so at 10:00 the trailing mean is contaminated by the opening
  surge and almost nothing passes, while at 12:00 it sits in the lunch lull
  and almost everything does — the filter ends up measuring *what time it
  is* as much as participation. **Median** uses the same window but the
  middle value, so one block print stops dragging the baseline around;
  still time-biased, just less noisily. **Time of day** (default) compares
  this bar against the same slot on previous days, which is the
  construction that actually removes the U-shape and is what "relative
  volume" means everywhere else. Older days decay in weight so the baseline
  tracks the instrument's current activity rather than its whole history.
  It needs a few sessions to warm up and falls back to the median on
  non-intraday charts.
- **Volume lookback (average/median)** — lookback for the Simple average and
  Median baselines. Ignored by Time of day, which keeps its own per-slot
  history. Shorter (10) compares against very recent activity and adapts
  quickly within a session. Longer (50) compares against a broader
  baseline, less affected by a single busy period. 20 is a reasonable
  intraday default.
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

> **Question:** does the broader context make this break worth acting on?
> **Helps with:** filters breaks by trend alignment and trading session, so
> you only see signals that fit how and when you actually trade.

- **Only signal with EMA trend** — suppresses breaks that go against a
  longer-term EMA. ON: bullish breaks only print when price is above the
  EMA, bearish breaks only when below — aligns signals with the prevailing
  trend. OFF: all breaks print regardless of trend context. Important
  tradeoff: this will suppress the very first LH/HL of a genuine reversal,
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

> **Question:** what actually shows up on the chart, and how much of it
> sticks around?
> **Helps with:** controls visual presentation and clutter — none of this
> changes detection, only what you see and how far back it's kept.

- **HH/LL/LH/HL labels** — text labels on each break. Turn off for a cleaner
  chart if the coloured lines are enough.
- **Label size** *(Tiny / Small / Normal)* — text size for break labels. Use
  Tiny on dense lower-timeframe charts.
- **Verbose labels (show ATR clearance)** — ON appends how many ATR the
  break cleared beyond the level directly to the label (e.g. `HH +0.3` or
  `LH -0.2`), useful for quickly judging break quality without opening
  the table.
- **Live (unbroken) high level / Live (unbroken) low level** — independent
  toggles, one per side. A dotted line showing the swing high (or low)
  price is *currently* working against, before any break. This is the most
  useful setting for live trading: it shows what needs to break for a
  signal to fire, so you can plan the trade before the label appears. Turn
  off one side if you only trade one direction.
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
  structure bias: bullish = continuation (HH/LL) colour, bearish = reversal
  (LH/HL) colour, neutral = default. Independent of background tint.
- **Status table** — corner panel showing current bias, the exact watched
  levels, bars since the last break, ATR, active preset, last score, and
  pending state. The numeric levels are the useful part: copy them straight
  into your trade journal rather than reading them off the chart.
- **Table position** *(Top Right / Top Left / Bottom Right / Bottom Left)* —
  which corner the status table is anchored to. Move it if it overlaps
  another indicator's panel, the price scale, or the companion Key Zone
  Map script's own table.
- **Max breaks to draw (0 = unlimited)** — limits how many historical
  HH/LL/LH/HL lines and labels remain on chart; oldest auto-delete when
  exceeded. 0 means no limit (may hit TradingView's 500-object cap on busy
  charts). 50 keeps the chart clean on intraday timeframes. Live levels and
  pivot markers aren't counted against this.
- **Show unconfirmed break preview** — when Confirmation bars > 0, draws a
  faint ghost marker at the break level while waiting for confirmation, so
  you can see the break forming in real time rather than waiting blindly.
- **Preview line style / Preview line width** — style and thickness of the
  unconfirmed-preview line, independently configurable.
- **Show retest-support marker / Show retest-resistance marker** —
  independent toggles, one per side. Draws a small triangle at the bar
  where that retest fires (price returns to a broken level and holds),
  colored to match the continuation/reversal palette (support = continuation
  colour, resistance = reversal colour). The `Retest Support`/`Retest
  Resistance` alerts (`⑪ Alerts`)
  already fire either way — this makes the event visible on the chart
  itself, not only in your alert log.
- **Retest marker size** *(Tiny / Small / Normal)* — size of the retest
  marker triangles. Applies to both markers above.
- **Retest proximity (× ATR)** — how close the close must come to a broken
  level for the bar to count as a retest of it. Tighter (0.05–0.15) counts
  only near-exact returns: fewer, cleaner retests, but you miss ones that
  reacted slightly early. 0.20 is balanced. Wider (0.4+) counts anything in
  the neighbourhood. *(Was fixed at 0.20 with no way to adjust it before
  v7.8.)*
- **Allow repeat retests of a level** — whether a level can fire more than
  one retest over its lifetime. ON (default) lets a level retest again after
  the cooldown below, because a level that holds *twice* is stronger evidence
  than one that held once — retiring it after the first test threw away the
  better signal. OFF gives each level exactly one firing ever, which is the
  pre-v7.8 behaviour.
- **Bars before a level can retest again** — minimum bars between two retests
  of the *same* level. Stops price hovering on a level from re-firing
  continuously while still letting a genuine second visit register. Scales
  with "Auto-adapt to timeframe".

---

## 7. Internal structure (`⑥ Internal structure`, optional)

> **Question:** is there a faster, smaller-scale structure happening inside
> the current leg?
> **Helps with:** gives you a second, quicker read for entry timing within
> a bias set by the main structure, without replacing it.

Runs a second, faster swing-length pass alongside the main one.

- **Show internal structure** — the master toggle for this whole feature.
  ON tracks a second, faster swing length for minor structure inside the
  current leg: **i-HH/i-LL** = a minor break *with* the higher-timeframe
  trend, useful for entry timing; **i-LH/i-HL** = a minor break *against*
  the higher-timeframe trend, an early small-scale warning the current leg
  may be losing steam before the main-structure LH/HL would ever fire. Must
  be ON for either event type below to be detected at all.
- **Show internal HH/LL / Show internal LH/HL** — independent display
  toggles, mirroring the main structure's `⑦ HH/LL lines (continuation)` /
  `⑧ LH/HL lines (reversal)` split. Lets you show just one internal event
  type without the other. Only apply when the master switch above is on.
- **Internal swing length** — must be smaller than the main Swing pivot
  length. 2–3 is typical.
- **Internal HH/LL colour / Internal LH/HL colour** — independently
  configurable, no longer forced to match the main continuation/reversal
  colours (⑦/⑧) — set them apart, or match them if you'd rather the two
  read as one family.
- **Internal line style** *(Solid / Dashed / Dotted)* — style for internal
  structure lines, shared between i-HH/i-LL and i-LH/i-HL.
- **Internal line width** — thickness of internal structure lines.
- **Internal line transparency** — how faded internal lines/labels are.
  Drawn thin and semi-transparent by default so they don't compete visually
  with the main structure lines.

---

## 8. HH/LL lines and LH/HL lines (`⑦ HH/LL lines (continuation)`, `⑧ LH/HL lines (reversal)`)

> **Question:** how should a confirmed break actually look on the chart?
> **Helps with:** lets continuation (HH/LL) and reversal (LH/HL) breaks be
> visually distinct — or matched — entirely independently of each other.

Two mirrored groups, one per break type, so continuation and reversal breaks
can look and behave completely differently on the chart if you want them to.
Defaults: continuation is solid sky-blue, reversal is dashed orange —
deliberately different styles, not just colors, so they're distinguishable
even for colorblind users.

- **Colour** — continuation colour (default sky blue, used for HH and LL)
  marks a break *with* the existing trend, confirming continuation.
  Reversal colour (default orange, used for LH and HL) marks a break
  *against* the existing trend, signalling a possible reversal.
- **Line style** *(Solid / Dashed / Dotted)* — continuation defaults to
  Solid, which reads as more definitive, suiting continuation signals.
  Reversal defaults to Dashed, distinguishing it from continuation at a
  glance.
- **Line width** — thickness of the line. Raise if you're on a large
  monitor or find them hard to see.
- **Extend lines right (bars)** — how many bars to draw the line forward
  from the break bar. Continuation defaults to 0 (line stops at the break
  bar, cleanest). Reversal defaults to 50 (enough to see retests without
  clutter) — LH/HL levels often act as ongoing support/resistance, so some
  extension is useful, but "forever" clutters the chart. Adjust to your
  timeframe: lower on 1M, higher on 1H+. Both scale with "Auto-adapt to
  timeframe."
- **Vertical marker on bar** — draws a small vertical tick on the exact bar
  where the break was confirmed, making the timing unambiguous.
  Continuation defaults OFF; reversal defaults ON, since LH/HL signals are
  the easiest to misread in real time and the precise bar is worth showing.
- **Vertical marker style / Vertical marker width** — style and thickness
  of the vertical tick, independently configurable per type. Only applies
  when the vertical marker above is on.
- **Draw HH/LL lines / Draw LH/HL lines** — the master switch per type.
  Turns off the line AND the label for that type, so turning off HH/LL
  fully hides continuation breaks (not just their line) if you only care
  about LH/HL reversals, or vice versa.

---

## 9. Confidence score (`⑨ Confidence score`)

> **Question:** how good was this break, not just whether it happened?
> **Helps with:** replaces a flat pass/fail with a 0–100 grade, so you can
> tell a marginal break from an emphatic one at a glance.

The filters above are pass/fail. The score tells you *how well* a break
passed — a break that barely qualified and one that qualified emphatically
both used to just say "HH." Now they say "HH 42" and "HH 91."

- **Score every break 0-100** — the master toggle. Grades each break on how
  well it passed instead of a simple pass/fail. Built from six measures
  (default weights, auto-normalised to 100; full breakdown and tuning in
  `⑩ Score tuning`, next section): clearance beyond the level (30),
  displacement of the candle (25), body conviction (15), volume
  participation (15), size of the leg broken (15), and follow-through (10).
  Worth knowing how independent these actually are: the first three all
  describe the same breaking candle from different angles, so they rise and
  fall together — volume, leg size and follow-through are what add
  information the others can't see. Rough reading: 75+ is emphatic, 55–75 is
  solid, below 40 is marginal.
- **Minimum score to signal** — breaks scoring below this aren't labelled at
  all. 0 labels everything, score is display-only — start here. Recommended
  workflow: run at 0 for a week with scores shown, watch which scores
  actually worked on your instrument, *then* set this to the number you
  observed rather than guessing. Setting this blind is just a slower way of
  tightening the filters above — the point of the score is to let the chart
  tell you where your cutoff is.
- **Show score on label** — appends the score to each label, e.g. "HH 82."
  Turn off for a cleaner chart once you've settled on a minimum score.
- **Fade low-score breaks** — draws low-scoring breaks more transparently so
  high-confidence structure stands out at a glance without reading numbers.
  A 90-score break is drawn solid; a 40-score break is drawn faint.

---

## 10. Score tuning, advanced (`⑩ Score tuning (advanced)`)

> **Question:** what should the score actually reward, and how much should
> each factor count?
> **Helps with:** lets you hand-tune the scoring formula's weights and
> thresholds to match how your specific instrument actually breaks, instead
> of trusting a one-size-fits-all default.

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
  the breaking candle itself. *(v7.6: this component was frequently
  contributing a flat neutral half-score instead of a real measurement,
  because the reference it reads was being wiped on every break. It now
  measures properly, so scores on trending instruments will shift — usually
  up for breaks of large legs and down for breaks of shallow ones. If you had
  tuned `Minimum score to signal` against the old behaviour, re-check it.)*

- **Weight · follow-through** (default 10) — how much the score cares that
  price kept *going* after clearing the level rather than stalling the moment
  it got there. This is the most genuinely independent measure in the score:
  clearance, displacement and body conviction all describe the same breaking
  candle, while this one describes what happened next. **Requires
  `Confirmation bars after break` ≥ 1** — that waiting period is where the
  follow-through gets measured. At 0 confirmation bars there is no "after"
  yet, so it returns a neutral half-score for every break, exactly like the
  volume component does on feeds without real volume. The minimum-score gate
  applies the same neutral allowance, so turning this weight on doesn't
  silently tighten a cutoff you'd already tuned.

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
- **Full marks · follow-through (× ATR)** (default 1.00) — how far beyond the
  level price must travel during the confirmation window to earn the full
  follow-through score. Measured from the level to the furthest point reached
  in the break's direction, so a break that clears and keeps running scores
  high while one that clears and immediately stalls scores near zero. Raise
  on instruments that trend hard after breaking; lower on ones that grind.

---

## 11. Alerts

> **Question:** how do I find out about a signal without watching the
> chart?
> **Helps with:** wires specific, already-graded events (HH/LL/LH/HL,
> retests) to TradingView's alert system so you don't have to stare at the
> screen.

- **LH (Reversal Up) / HL (Reversal Down)**, **HH (Continuation) / LL
  (Continuation)** — fire the instant a break confirms, split by type so
  you can wire different notification channels to reversals vs.
  continuations.
- **Retest Support / Resistance** — fires when price returns to a *recently
  broken* level and holds it (closes back on the correct side). Tells you:
  this is generally a higher-confidence entry than the original break, since
  the level has now been defended twice. De-duplicated so a level sitting on
  the alert threshold doesn't spam you every bar. Also draws a small
  triangle marker on the chart at the same bar (see `Show retest-support
  marker`/`Show retest-resistance marker`, `⑤ Display & history`), so the
  event is visible without opening your alert log.

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

**3. Treat LH/HL and HH/LL as two different jobs, not one signal repeated
twice.** LH/HL is a *reversal alert* — the trend may be turning, but it's the
riskiest, earliest read. HH/LL is a *continuation confirmation* — the trend is
already established and just proved itself again. If you trade reversals,
use LH/HL to get your attention, then look for a retest or a same-direction
HH/LL before committing size. If you trade continuations, largely ignore
LH/HL and lean on HH/LL + a high score.

**4. Let the retest alert do the entry timing, not the raw break.** The docs
already say it plainly: a level that gets retested and holds is
higher-confidence than the original break. Chasing the break candle itself
means worse fills and more fakeout exposure. Use `Retest Support` /
`Retest Resistance` as your actual trigger where your style allows for the
extra wait.

**5. Turn off the EMA trend filter if you trade reversals — it will actively
hide the setup you're looking for.** It's designed to suppress
against-trend signals, but the first LH/HL of a real reversal is *by
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

1. **Lines with labels** (HH/LL/LH/HL) = confirmation that structure actually
   broke, with a 0–100 score telling you how convincingly.
2. **The table** = your at-a-glance status: current bias, exact levels to
   watch, and how strong the last break was.

If you also run the **Key Zone Map** companion script on the same chart,
that's where the "which level is worth watching, and why" question lives —
this script answers "did structure actually break, and how well." See
**"Using both scripts together"** in `FEATURES_ZONES.md` for the combined
workflow.
