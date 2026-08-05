# Changelog

[← Home](Home.md)

Both scripts version independently. The authoritative history lives in each
`.pine` file's header comment; this page is the readable summary.

**Current:** Structure Break Signals **v7.8** · Key Zone Map **v1.6**

---

## Upgrading — what to re-check

If you're coming from **v7.5 / v1.3 or earlier**, three changes alter behaviour
rather than just adding options. Nothing needs reconfiguring, but these are
worth knowing before you trust the output:

| Change | Version | What to do |
|---|---|---|
| **Confidence scores shifted** — the leg-size component was frequently returning a neutral half-score instead of measuring, and follow-through was added | v7.6, v7.7 | **Re-check `Minimum score to signal`** if you had tuned it |
| **Zone hit rates now show a confidence-adjusted `≥` figure** and buckets were split finer | v1.5, v1.6 | Numbers will read lower and take longer to fill. [Why](Confluence-and-Hit-Rates.md#wilson) |
| **`Reject long-wick breaks` triggers more often** — it was measuring the wrong two quantities | v7.6 | If you had it on, expect more rejections; it's catching cases it used to miss |

Two new opt-in features default to the *old* behaviour, so nothing changes
unless you choose it: the [directional-change swing
engine](Swing-Engines.md) and `Median true range`.

One new gate defaults to **on**: Key Zone Map's `Min impulse displacement`
(`0.8 × ATR`) means fewer order blocks than before. Set it to `0` for the old
behaviour.

---

# Structure Break Signals

## v7.8 — Adaptive swing engine

- **New `Swing engine` choice.** The pivot detector's confirmation lag is a
  fixed bar count: at swing length 5, every swing confirms exactly 5 bars later
  whether the market moved 3 ticks or 30 points. The new **directional change**
  engine confirms an extreme once price retraces a volatility-scaled distance
  from it, so the trigger is the market actually turning rather than a clock.
  Pivot mode remains the default. See [Swing Engines](Swing-Engines.md).
- `Retest proximity (× ATR)` is now an input — was hardcoded at `0.20`.
- **Levels can retest more than once**, gated by a per-level cooldown instead
  of a one-shot flag. A level that holds a *second* retest is stronger evidence
  than one that held once. Toggle off for the old behaviour.

## v7.7 — Stronger statistics

- **`Volume baseline` is selectable and defaults to `Time of day`.** Intraday
  volume is strongly U-shaped, so the old trailing mean was contaminated by the
  opening surge at 10:00 and sat in the lunch lull at 12:00 — the filter was
  measuring what time it was as much as participation. Each bar is now compared
  against the same slot on previous days, with older days decaying in weight.
- **`Volatility measure` is selectable:** ATR (Wilder) or median true range.
  ATR is a mean of a right-skewed variable, so one 10× news bar lifts it for
  many bars and tightens every threshold at once. *Median reads ~10–20% lower,
  so multiples become effectively looser on switching.*
- **Sixth score component: follow-through** (default weight 10). Clearance,
  displacement and body conviction all describe the same candle and move
  together; follow-through measures how far price actually ran past the level
  during the confirmation window. Neutral half-score when `Confirmation bars =
  0`. See [Confidence Score](Confidence-Score.md#follow-through).

## v7.6 — Correctness fixes

*No new settings, no new features.*

- **HH/LL/LH/HL is now decided by the pivot sequence, not a running bias flag.**
  A break of a genuinely *lower* high printed `HH` whenever bias was still
  bullish from an earlier move. The label is now true by construction. Internal
  structure got the same fix.
- **Alerts were moved onto the same decision as the labels.** In v7.5 both
  read the bias flag, so they agreed with each other while both being open to
  the mislabelling above. Repointing only the labels would have made the two
  disagree, so both now read one shared classification.
- **The swing-size filter is no longer bypassed after every break.** Both
  structural references reset to `na` on a break, and an `na` reference
  short-circuits the minimum-swing-size test to true — so the first pivot after
  every break skipped filtering entirely.
- **The score's leg-size component works in trends again.** It reads the
  opposite reference, which the reset above kept wiping, so it silently fell
  back to a neutral half-score whenever a trend produced consecutive highs
  without an intervening pivot low.
- **`Reject long-wick breaks` measures the right two quantities.** It compared
  the *entire* wick against the close's clearance; it now compares
  wick-beyond-level against body-beyond-level.
- **Internal structure no longer evicts main structure.** Its lines and labels
  were created untracked and never deleted; since `max_lines_count` is one
  shared pool per script, enabling internal structure silently deleted the
  oldest HH/LL/LH/HL drawings.
- **`max_bars_back` raised 100 → 500**, every lookback input capped. Swing
  length 60 and volume length 200 were both legal and both threw *"requested
  historical offset is beyond the historical buffer's limit."*

## v7.5 — HH / LL / LH / HL terminology

- BOS and CHoCH labels and settings renamed throughout to classic Dow Theory
  swing terminology. Continuation up → `HH`, continuation down → `LL`, reversal
  up → `LH`, reversal down → `HL`. Renamed everywhere: chart labels, input
  titles, tooltips, group headers, alerts, and internal naming.
- `⑦ BOS lines` → `⑦ HH/LL lines (continuation)`; `⑧ CHoCH lines` → `⑧ LH/HL
  lines (reversal)`.
- No behaviour change — terminology only.

## v7.4 — Independent enable/disable per side

- Every combined toggle split into independent pairs (live levels, retest
  markers, internal structure event types).

## v7.3 — Full line customization + retest marker

- Vertical markers, internal structure and the unconfirmed preview got their own
  style/width controls.
- **New:** retest events draw a triangle on the chart, not just an alert.
- Status table position became a dropdown.

## v7.2 — Renamed, more line control

- Renamed from *BOS / CHoCH Structure* to **Structure Break Signals**.
- Live level lines got their own width/style/extend controls.
- Internal structure lines got independent colours instead of reusing the main
  ones.

## v7.1 — Feature toggles fully disable their feature

- `Draw …lines` now hides that type's **label as well as its line**. Previously
  turning off a type left an unexplained label with no line under it.

## v7.0 — Split into two scripts

- Zones, order blocks, FVGs, liquidity pools and the confluence/hit-rate system
  moved out into **Key Zone Map**. No behaviour change to what remained.

## v5.3 — Timeframe adaptation

- `Auto-adapt to timeframe` rescales every extend-right and lookback window so
  it spans the same real time on every chart. Clamped to each setting's own
  manual range. Deliberately does not touch swing length, filter thresholds or
  score weights.

## v5.2 — Smart money zones

- Swing zones, order blocks, fair value gaps and liquidity zones added. *(All
  later moved to Key Zone Map in v7.0.)*

## v5.1 — Confidence scoring

- Every break graded 0–100 across five measures, with an optional minimum-score
  gate and low-score fading. Every component user-adjustable.
- *Rationale: the existing filters are binary, so a break that barely qualified
  and one that qualified emphatically looked identical.*

## Earlier

- Retest alerts stopped re-firing every bar while price sat on a level.
- Retest arrays no longer grow without bound.
- Divide-by-zero guard on clearance when `Confirmation bars = 0`.
- `lastBrokenHigh/Low` reset on opposite breaks — fixed false duplicate
  suppression.

---

# Key Zone Map

## v1.6 — Adaptive swing engine + order block quality

- **New `Swing engine` choice** mirroring the companion script. Keep it matched
  across both. See [Swing Engines](Swing-Engines.md).
- **Order blocks now require the breaking move to displace** (default
  `0.8 × ATR`). Previously any raw break minted one with no quality gate
  whatsoever — including breaks that closed a tick through the level and
  stalled, marking impulsive moves that never happened. Set to `0` for the old
  behaviour.

## v1.5 — Stronger statistics

- **Hit/held rates are confidence-adjusted by default** via the Wilson score
  lower bound (95%), shown with `≥`. A raw proportion carries no indication of
  how much evidence backs it — 3-for-3 and 300-for-300 both print "100%", and
  the first would outrank the second in any ranking built on the point
  estimate. Toggleable.
- **Confluence buckets widened** from 0 / 1 / 2+ to 0 / 1 / 2 / 3+. The old top
  bucket pooled a four-way confluence with a two-way one.

## v1.4 — Correctness fixes

*No new settings, no new features.*

- **FVG midlines are tracked with their gap and deleted with it.** They were
  drawn with a bare `line.new` that was never removed, so they outlived their
  own gap, accumulated without bound, and — since `max_lines_count` is one
  shared pool — the oldest were silently evicted while their boxes stayed on
  the chart. They now also follow the box's right edge instead of freezing at
  creation width.
- **`max_bars_back` raised 100 → 500**, swing and ATR inputs capped.

## v1.3 — Independent enable/disable per side

- Every zone type's single toggle split in two: swing zones →
  Resistance/Support, order blocks → Bull/Bear, FVGs → Bull/Bear, liquidity →
  Buy-side/Sell-side.
- Turning a side off only stops **new** zones being created; existing ones keep
  tracking their lifecycle normally rather than freezing.

## v1.2 — Per-type border style + table position

- Each zone type got its own border style, since that's what tells the types
  apart at a glance.
- Status table position became a dropdown — useful when it overlaps the
  companion script's table.

## v1.1 — Renamed, more border/line control

- Renamed from *Support/Resistance Zones* to **Key Zone Map**.
- Zone border width became a shared control; FVG midline got its own
  width/style.

## v1.0 — Split from the combined script

- Created in Structure Break Signals v7.0, carrying over order blocks, fair
  value gaps, liquidity pools, confluence scoring and the historical hit-rate
  system unchanged.
