# Troubleshooting

[← Home](Home.md)

Symptom → cause → fix. Ordered roughly by how often each comes up.

- [No signals or zones appear](#no-signals-or-zones-appear)
- [Too many signals](#too-many-signals)
- [Signals appear then disappear](#signals-appear-then-disappear)
- [The two scripts disagree](#the-two-scripts-disagree)
- [Score problems](#score-problems)
- [Hit-rate problems](#hit-rate-problems)
- [Drawings vanishing](#drawings-vanishing)
- [Compile and runtime errors](#compile-and-runtime-errors)

---

## No signals or zones appear

**Diagnose first: turn on `Raw pivot markers`.** This is what it's for. It
draws a triangle on *every* detected swing, including ones the filters
rejected.

| What you see | Meaning | Fix |
|---|---|---|
| No triangles at all | Pivots aren't being detected | Lower `Swing pivot length`. On a very short history, wait for more bars |
| Triangles, but no break labels | Pivots detected, filters rejecting the breaks | Continue below |

Once you know pivots exist, work down this list:

1. **`Minimum score to signal` is above 0.** The most common cause. Set it back
   to 0 and see if labels return.
2. **A `Draw HH/LL lines` or `Draw LH/HL lines` master switch is off.** These
   hide *the label as well as the line*, so that type disappears completely.
3. **`Restrict to a session` is on with the wrong window.** Check your chart's
   timezone — the session is in exchange time.
4. **`Only signal with EMA trend` is on.** It suppresses every against-trend
   break, which is half of them.
5. **Preset too strict for the timeframe.** `Very Strict` on a 1M chart
   produces almost nothing by design.
6. **`Require volume expansion` on a feed with no real volume.** Many forex and
   CFD feeds report synthetic volume. Turn the filter off and set
   `Weight · volume participation` to 0.
7. **`Confirmation bars after break` is high** and price keeps failing back
   inside before confirmation.

### Key Zone Map specifically

| Missing | Check |
|---|---|
| Order blocks | `Min impulse displacement (× ATR)` — at `1.5+` most breaks won't qualify. Try `0.5` |
| FVGs | `Min gap size (× ATR)` — raise/lower. Genuine gaps are rare on some instruments |
| Liquidity pools | `Equal-level tolerance` too tight, or `Pivot lookback` too short |
| Everything | `Max active zones per type` too low, or the per-side toggles are off |

---

## Too many signals

| Fix | Effect |
|---|---|
| Move up one preset (`Balanced` → `Strict`) | Tightens every filter at once. Start here |
| Drop `Fine tune` to 3–4 | Nudges the current preset stricter without jumping a whole level |
| Raise `Min bars between breaks` to 5–8 | Stops rapid-fire labelling in chop |
| Set `Confirmation bars after break` to 1–2 | Cuts fakeouts noticeably. Costs you entry timing |
| Raise `Min clearance beyond level` to 0.20+ | Kills tick-through breaks |
| Set `Minimum score to signal` | Only after [calibrating](Confidence-Score.md#calibration) |
| Turn on `Merge near-equal levels` | Stops double tops printing two labels |

**Chart too cluttered rather than too many signals?** Lower `Max breaks to
draw`, turn off `Verbose labels`, set `Label size` to `Tiny`, or reduce
`Extend LH/HL lines right`.

**Key Zone Map cluttered?** Raise `Min impulse displacement` (the single most
effective control), lower `Max active zones per type`, or turn off the detector
types you don't actually use.

---

## Signals appear then disappear

**This is expected on the forming bar.** Break conditions evaluate against
`close`, which updates every tick until the bar closes. A break that appears
mid-bar and fails before close will vanish.

Once a bar has closed, its labels are final and won't change.

**For alerts**, set frequency to `Once Per Bar Close` — see
[Alerts → Timing](Alerts.md#timing-once-per-bar-close).

If you want fewer of these transient signals, `Confirmation bars after break`
≥ 1 requires price to still be beyond the level N bars later.

---

## The two scripts disagree

### "Watch high" / "Watch low" differ between the tables

**Expected, by design.** Key Zone Map advances on a **raw** break — price
simply closes through. Structure Break Signals waits for a **graded** break
that passes every quality filter. See [Concepts → Raw vs. graded
break](Concepts.md#raw-break-vs-graded-break).

If the gap is *large* rather than slight, check:

1. **Swing engines match.** Both must be on the same engine — and if on
   directional change, the same `Reversal threshold`.
2. **Swing pivot lengths match.**
3. **`Min swing size (× ATR)` matches.**
4. **ATR lengths match.**

### Zones and break lines are at visibly different prices

Usually mismatched swing settings per above. Also note Key Zone Map's swing box
spans **wick-to-body** while Structure Break Signals draws a line at the
**exact level**, so the box will look "thicker" — that's not disagreement.

---

## Score problems

| Symptom | Cause | Fix |
|---|---|---|
| Almost everything scores 85+ | Full-marks thresholds too easy | Raise `Full marks · clearance` (→0.60) and `· candle range` (→1.5) |
| Nothing scores above 50 | Thresholds too hard | Lower those same two |
| Score doesn't separate outcomes | Over-weighted on correlated measures | Shift weight from clearance/displacement toward volume, leg size, follow-through |
| Follow-through never seems to vary | `Confirmation bars after break` is 0 | It's unmeasurable at 0 and returns a neutral half-score. Set it to 1–2 |
| Every score sits near 50 | Most components falling back to neutral | Check volume feed; check `Confirmation bars`; check that leg-size references exist |
| Scores changed after updating | v7.6 fixed the leg-size component and v7.7 added follow-through | Expected. **Re-check your `Minimum score to signal`** |

---

## Hit-rate problems

| Symptom | Cause |
|---|---|
| Everything says `(building)` | Normal after any settings change — **every input change restarts every bucket at n=0** |
| Rates never leave `(building)` | `Min sample size` too high for your history, or zones rarely resolve. Lower it, or load more bars |
| Rates look low across the board | `Confidence-adjusted rates` is on — you're reading a 95% lower bound, not the observed rate. See [why](Confluence-and-Hit-Rates.md#wilson) |
| A zone shows high confluence but no rate | Buckets are per-confluence-level; 3+ confluence is rare and fills slowly |
| Rates dropped after updating | v1.6 widened buckets from 0/1/2+ to 0/1/2/3+, so history redistributed |

**Remember:** these are frequency counts over loaded bars, not a backtest. See
[the hard limits](Confluence-and-Hit-Rates.md#the-hard-limits-of-these-numbers).

---

## Drawings vanishing

**Old break lines disappearing as new ones form** — `Max breaks to draw`
(default 50) is doing its job. Raise it, or set 0 for unlimited (which risks
TradingView's 500-object cap on busy charts).

**Main structure lines disappearing when you enable internal structure** — this
was a real bug fixed in **v7.6**. Internal drawings were untracked and shared
the same 500-object pool, silently evicting your main structure. If you see it,
you're on an older version — see [Changelog](Changelog.md).

**FVG midlines outliving their boxes** — fixed in **Key Zone Map v1.4**. Same
class of bug.

---

## Compile and runtime errors

### `The requested historical offset is beyond the historical buffer's limit`

Fixed in **v7.6 / v1.4**, which raised `max_bars_back` from 100 to 500 and
capped every lookback input. If you hit this, you're running an older version.

On current versions this shouldn't be reachable — every input that drives a
historical lookup is capped below the buffer. If you see it anyway, report the
exact settings.

### `Pine cannot determine the referencing length of a series`

Usually means a lookback is being driven by something Pine can't resolve at
compile time. Not expected in current versions; report it with your settings.

### Script won't compile after editing

Common Pine gotchas, all of which produce confusing messages:

- **No comma-separated declarations.** `float a = na, b = na` is invalid; each
  needs its own line.
- **`and` / `or` don't short-circuit.** Both sides always evaluate, so
  `array.size(x) > 0 and array.get(x, 0) > 5` still runs `array.get` on an
  empty array and errors. Use nested `if` instead.
- **`ta.*` functions must run every bar.** Putting one behind an `if` breaks
  its internal state. Compute unconditionally, select afterwards.
- **Indentation is 4 spaces**, consistently. Tabs will bite you.

### Nothing renders and there's no error

Check the indicator is actually enabled (eye icon), that it's on the price pane
rather than a separate pane, and that you have enough bars loaded — both
scripts need history before anything appears.

---

## Still stuck?

Note down:

1. Which script and version (shown in the indicator title, e.g.
   `Structure Break Signals v7.8`)
2. Chart symbol and timeframe
3. Any settings changed from default
4. What you expected vs. what you see

Most issues resolve to one of: a master toggle off, a score gate set, a session
window in the wrong timezone, or a settings change that reset the statistics.
