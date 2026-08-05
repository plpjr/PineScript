# Structure Break Signals

[← Home](Home.md) · **File:** `Structure_Break_Signals.pine` · **Version:**
v7.8 · **Companion:** [Key Zone Map](Key-Zone-Map.md)

One job: grade individual structure **break events**. It labels continuation
breaks (**HH** / **LL**) and reversal breaks (**LH** / **HL**) with a 0–100
confidence score, so you can tell a marginal break from an emphatic one at a
glance.

> Looking for zones, support/resistance areas and confluence? That's the
> companion script, [Key Zone Map](Key-Zone-Map.md).

**Jump to:** [① Presets](#sensitivity-presets) · [② Core
structure](#core-structure) · [③ Break quality](#break-quality-filters) ·
[④ Context](#context-filters) · [⑤ Display](#display-history) ·
[⑥ Internal](#internal-structure) · [⑦⑧ Lines](#line-styling) ·
[⑨⑩ Score](#confidence-score) · [Alerts](Alerts.md)

---

## Reading the chart

| What you see | What it means |
|---|---|
| **Dotted lines** above and below price | The swing high/low currently being watched — what must break for anything to fire |
| **Solid sky-blue line + label** (`HH` / `LL`) | A continuation break confirmed at that level |
| **Dashed orange line + label** (`LH` / `HL`) | A reversal break — the level that had been defining the trend just failed |
| **Number on the label** (`HH 82`) | The [confidence score](Confidence-Score.md), 0–100 |
| **Faint version of either** | Low score — [`Fade low-score breaks`](#confidence-score) is on |
| **Small triangle** below/above a bar | A retest of a previously broken level fired there |
| **Faint ghost line** | An unconfirmed break waiting out the confirmation window |
| **Status table** | Current bias, exact watched levels, bars since last break, last score, pending state |

The **numeric levels in the table are the most useful part** — copy them into
a journal rather than reading prices off the chart by eye.

---

<a id="sensitivity-presets"></a>

## ① Sensitivity presets

> **Question:** how strict should the whole indicator be, without hand-tuning
> a dozen filters?
> **Helps with:** one control that gets you to a sensible starting
> configuration, plus a dial for small adjustments after.

| Setting | Default | Range |
|---|---|---|
| Preset | `Balanced` | Very Loose / Loose / Balanced / Strict / Very Strict / Custom |
| Fine tune | `5` | 1–10 |
| Auto-adapt to timeframe | `ON` | |

**Preset** sets every threshold in `③ Break quality filters` and `② Core
structure` at once.

| Preset | Use for | Effect |
|---|---|---|
| `Very Loose` | Seeing raw structure; very slow instruments | Catches almost every break |
| `Loose` | Scalping low timeframes | Slightly filtered; earlier entries, more noise |
| `Balanced` | 5M–15M intraday futures | The tuning target for all defaults |
| `Strict` | 1H swing trading | Only well-defined breaks with real displacement |
| `Very Strict` | 4H+ / A+ setups only | Major structure only |
| `Custom` | Hand-tuning | Ignores the preset; uses every manual value below |

**Fine tune** nudges a preset without switching to the next one. `5` is the
preset exactly as designed; above 5 progressively loosens, below 5 tightens.
Ignored when Preset = Custom. *Practical use:* if a preset is close but gives
slightly too many signals, drop to 3–4 rather than jumping a whole preset.

**Auto-adapt to timeframe** — see [Concepts → Timeframe
adaptation](Concepts.md#timeframe-adaptation).

---

<a id="core-structure"></a>

## ② Core structure

> **Question:** what actually counts as a swing high or low?
> **Helps with:** defines the raw pivots everything downstream is built on.
> Get this wrong and every other section works from a bad foundation.

| Setting | Default | Range |
|---|---|---|
| Swing engine | `Pivot (fixed bars)` | Pivot / Directional change |
| Reversal threshold (× ATR) | `1.5` | 0.1–10.0 |
| Swing pivot length | `5` | 1–50 |
| Volatility measure | `ATR (Wilder)` | ATR / Median true range |
| Volatility lookback | `14` | 1–200 |
| Filter minor swings by size | `ON` | |
| Min swing size (× ATR) | `0.5` | ≥ 0.0 |

**Swing engine** and **Reversal threshold** get their own page —
see **[Swing Engines](Swing-Engines.md)**. Short version: the default fixed-bar
pivot detector has a confirmation lag measured in bars, which means different
things at different times of day; the adaptive alternative confirms on a
volatility-scaled retracement instead.

**Swing pivot length** *(pivot mode only)* — how many bars must sit on each
side of a candle for it to count as a swing. In pivot mode this is **the** most
important setting, because it directly sets your confirmation lag. Lower (2–4)
detects small swings: more signals, more noise, less lag. Higher (7–12) keeps
only major swings. *Only used when Preset = Custom.*

**Volatility measure / lookback** — see [Concepts → Why everything is measured
in ATR](Concepts.md#why-everything-is-measured-in-atr). Note the warning there:
switching to median true range makes every threshold effectively **looser**.

**Filter minor swings by size** — ON means a pivot only counts as structure if
it moved far enough from the last opposite swing, removing the tiny wiggles
inside consolidation. Leave ON unless you specifically want raw unfiltered
pivots.

**Min swing size (× ATR)** — how far, in ATR. `0.0–0.2` filters almost
nothing; `0.4–0.6` is balanced; `1.0+` keeps only large structural swings.
Move up if consolidation is being labelled as structure; move down if it's
missing swings you'd mark by hand. *Custom only.*

---

<a id="break-quality-filters"></a>

## ③ Break quality filters

> **Question:** is this break real, or a fakeout?
> **Helps with:** separates genuine breaks from noise before anything is
> drawn. Most of the signal-quality work happens here.

*All of these are ignored unless Preset = Custom, except where noted.*

| Setting | Default | Range |
|---|---|---|
| Require break strength | `ON` | |
| Min clearance beyond level (× ATR) | `0.10` | ≥ 0.0 |
| Require displacement candle | `ON` | |
| Min candle range (× ATR) | `0.6` | ≥ 0.0 |
| Also require body > 50% of range | `OFF` | |
| Reject long-wick breaks | `OFF` | |
| Require volume expansion | `OFF` | |
| Min volume (× average) | `1.2` | ≥ 0.1 |
| Volume baseline | `Time of day` | Simple average / Median / Time of day |
| Volume lookback | `20` | 1–200 |
| Merge near-equal levels | `ON` | |
| Equal-level tolerance (× ATR) | `0.15` | ≥ 0.0 |
| Min bars between breaks | `3` | 0–100 |
| Confirmation bars after break | `0` | 0–5 |
| Strict: full body beyond level | `OFF` | |

### The two highest-value filters

**Require break strength** + **Min clearance** — price must close beyond the
level by a meaningful amount, not one tick past it. This is the single most
effective filter here; it kills the marginal breaks that clear by a hair and
immediately fail back inside. `0.05` is barely filtered, `0.10–0.20` is
balanced, `0.30+` keeps only decisive breaks at the cost of later entries.

**Require displacement candle** + **Min candle range** — the breaking candle
must have real size relative to recent volatility. Rejects breaks on a tiny
indecision candle. `0.3` is permissive, `0.6–0.8` requires visible expansion,
`1.2+` keeps only strong impulsive candles.

### Candle-shape filters

**Also require body > 50% of range** — a conviction test on top of the range
test. Turn ON if you're getting breaks on candles that spiked through and
closed back near their open.

**Reject long-wick breaks** — if the part of the wick sitting past the level
is bigger than the part of the *body* past the level, skip the break. Useful
against liquidity sweeps mislabelled as breaks. **Tradeoff:** this also filters
out genuine sweep-then-reverse setups you may want. Turn on only if
wick-fakeouts are specifically your problem.

> *v7.6 corrected what this measures.* It previously compared the candle's
> entire wick against the close's clearance — which coincides with the intended
> test for a plain breakout candle, but not for one closing past the level
> while bearish, or opening already past it. If you had this on, expect it to
> trigger somewhat more often now; it is catching cases it used to miss.

### Volume

**Require volume expansion** + **Min volume** — the breaking candle must trade
above its baseline. `1.0` is merely average, `1.2–1.5` is clear expansion,
`2.0+` is very restrictive.

> **Only meaningful on instruments with real volume data.** Futures generally
> work well. Many CFD and forex feeds report synthetic volume that makes this
> filter behave unpredictably — verify your feed before trusting it, and
> consider setting the volume score weight to 0 instead.

**Volume baseline** — what "normal volume" means for this bar. Feeds both the
filter above and the volume component of the [score](Confidence-Score.md).

| Option | Behaviour |
|---|---|
| `Simple average` | Rolling mean. **Weakest choice intraday:** volume is strongly U-shaped through a session, so at 10:00 the trailing mean is contaminated by the opening surge and almost nothing passes; at 12:00 it sits in the lunch lull and almost everything does. The filter ends up measuring *what time it is* as much as participation |
| `Median` | Same window, middle value. One block print stops dragging the baseline around. Still time-biased, just less noisily |
| `Time of day` *(default)* | Compares this bar against the **same slot on previous days**, which is the construction that actually removes the U-shape and what "relative volume" means elsewhere. Older days decay in weight so the baseline tracks current activity rather than the whole history. Needs a few sessions to warm up; falls back to median on non-intraday charts |

**Volume lookback** applies to the average and median baselines only; time of
day keeps its own per-slot history.

### Deduplication and throttling

**Merge near-equal levels** + **Equal-level tolerance** — treats levels within
a small band as the same level, so a double top doesn't print two labels.
`0.05` merges only near-identical prices, `0.15` is balanced, `0.30+`
aggressively merges and can suppress genuinely separate breaks.

**Min bars between breaks** — forces a gap between labelled breaks. `0` allows
consecutive bars, `3–5` stops rapid-fire labelling in chop, `8+` is heavily
throttled. **Tradeoff:** a high cooldown can suppress a genuine fast reversal
that legitimately breaks structure twice in quick succession.

**Confirmation bars after break** — waits N bars and only labels the break if
price is *still* beyond the level. This is **the most direct quality-vs-lag
dial in the indicator** — every bar you add is a bar of entry you give up.
`0` labels immediately; `1–2` cuts fakeouts noticeably; `3–5` is very
conservative. *Available in every preset, not just Custom.*

> Setting this to 1 or more is also what makes the
> [follow-through score component](Confidence-Score.md#follow-through)
> measurable.

**Strict: full body beyond level** — requires both open and close beyond the
level. Very restrictive and meaningfully later. Most people should leave this
OFF and use break strength instead, which achieves a similar goal with less
lag.

---

<a id="context-filters"></a>

## ④ Context filters

> **Question:** does the broader context make this break worth acting on?
> **Helps with:** filters by trend alignment and session, so you only see
> signals that fit how and when you actually trade.

| Setting | Default | Range |
|---|---|---|
| Only signal with EMA trend | `OFF` | |
| EMA length | `50` | 1–500 |
| Restrict to a session | `OFF` | |
| Session window | `0930-1600` | |

**Only signal with EMA trend** — suppresses breaks that go against a
longer-term EMA.

> **This will hide the setup reversal traders are looking for.** The first
> LH/HL of a genuine reversal is *by definition* against the prevailing trend,
> which is exactly what this filter removes. Only run it if you exclusively
> take with-trend continuation trades.

**EMA length** — shorter (20) follows price closely and flips often; longer
(100–200) defines a slower, structural trend.

**Restrict to a session** + **Session window** — only detect breaks inside a
time window, in exchange time. `0930-1600` is the US cash session,
`0830-1130` the US morning, `0200-0500` London. **Set your chart timezone
correctly or the window won't land where you expect.**

---

<a id="display-history"></a>

## ⑤ Display & history

> **Question:** what shows up on the chart, and how much sticks around?
> **Helps with:** presentation and clutter. None of this changes detection.

| Setting | Default | |
|---|---|---|
| HH / LL / LH / HL labels | `ON` | |
| Label size | `Small` | Tiny / Small / Normal |
| Verbose labels (ATR clearance) | `OFF` | |
| Live (unbroken) high level | `ON` | |
| Live (unbroken) low level | `ON` | |
| Live level line width | `1` | 1–4 |
| Live level line style | `Dotted` | |
| Extend live level right (bars) | `20` | 0–200 |
| Raw pivot markers | `OFF` | |
| Tint background by bias | `OFF` | |
| Color candles by bias | `OFF` | |
| Status table | `ON` | |
| Table position | `Top Right` | |
| Max breaks to draw | `50` | 0–200 (0 = unlimited) |
| Show unconfirmed break preview | `ON` | |
| Preview line style / width | `Dotted` / `1` | |
| Show retest-support marker | `ON` | |
| Show retest-resistance marker | `ON` | |
| Retest marker size | `Small` | |
| Retest proximity (× ATR) | `0.20` | 0.01–2.0 |
| Allow repeat retests of a level | `ON` | |
| Bars before a level can retest again | `10` | 1–200 |

### The live levels are the point

**Live (unbroken) high / low level** — dotted lines showing the swing high and
low price is *currently* working against, before any break. This is the most
useful setting in the script for live trading: it shows what needs to break
for a signal to fire, so you can plan before the label appears. Independent
toggles, so turn off one side if you only trade one direction.

### Diagnosis

**Raw pivot markers** — triangles on every detected swing, *including ones the
filters rejected*. If the indicator is missing structure you'd mark by hand,
turn this on to see whether the pivot was detected but filtered out, or never
detected at all. See [Troubleshooting](Troubleshooting.md).

**Verbose labels** — appends the ATR clearance to each label (`HH +0.3`), for
judging break quality without opening the table.

### History limits

**Max breaks to draw** — oldest lines and labels auto-delete past this count.
`0` means unlimited, which can hit TradingView's 500-object cap on busy
charts. `50` keeps intraday charts clean. Live levels and pivot markers aren't
counted against it.

> This limit also governs how many internal-structure drawings are kept. Before
> v7.6 those were untracked and would silently evict your main structure lines.

### Retests

**Retest proximity (× ATR)** — how close the close must come to a broken level
to count as a retest. Tighter (0.05–0.15) counts only near-exact returns;
`0.20` is balanced; wider (0.4+) counts anything in the neighbourhood.

**Allow repeat retests** — whether a level can fire more than once. ON
(default) lets it retest again after the cooldown, because **a level that holds
twice is stronger evidence than one that held once**. OFF gives each level
exactly one firing ever.

**Bars before a level can retest again** — stops price hovering on a level from
re-firing every bar, while still letting a genuine second visit register.

---

<a id="internal-structure"></a>

## ⑥ Internal structure

> **Question:** is there a faster, smaller-scale structure inside the current
> leg?
> **Helps with:** a second, quicker read for entry timing within a bias set by
> the main structure — without replacing it.

| Setting | Default | Range |
|---|---|---|
| Show internal structure | `OFF` | |
| Show internal HH/LL | `ON` | |
| Show internal LH/HL | `ON` | |
| Internal swing length | `3` | 1–20 |
| Internal HH/LL colour | `#38BDF8` | |
| Internal LH/HL colour | `#FB923C` | |
| Internal line style | `Dotted` | |
| Internal line width | `1` | 1–3 |
| Internal line transparency | `65` | 0–90 |

Runs a second, faster swing pass alongside the main one, drawn thin and
semi-transparent so it doesn't compete visually. Events are labelled `i-HH`,
`i-LL`, `i-LH`, `i-HL`.

- **i-HH / i-LL** — a minor break *with* the trend. Useful for entry timing.
- **i-LH / i-HL** — a minor break *against* the trend. An early small-scale
  warning the current leg may be losing steam, well before the main-structure
  reversal would fire.

**Internal swing length** must be smaller than the main swing pivot length;
2–3 is typical. Internal structure always uses the pivot engine regardless of
your [swing engine](Swing-Engines.md) choice.

> **Intended use is entry timing, not bias.** Set the main swing length long to
> define higher-timeframe bias, then use a short internal length to catch the
> pullback that gives you a tighter entry within it.

---

<a id="line-styling"></a>

## ⑦ ⑧ Line styling

> **Question:** how should a confirmed break look?
> **Helps with:** lets continuation and reversal breaks be visually distinct —
> or matched — entirely independently.

Two mirrored groups: `⑦ HH/LL lines (continuation)` and `⑧ LH/HL lines
(reversal)`.

| Setting | ⑦ Continuation | ⑧ Reversal |
|---|---|---|
| Colour | `#38BDF8` sky blue | `#FB923C` orange |
| Line style | `Solid` | `Dashed` |
| Line width | `2` | `2` |
| Extend lines right (bars) | `0` | `50` |
| Vertical marker on bar | `OFF` | `ON` |
| Vertical marker style / width | `Dotted` / `1` | `Dotted` / `1` |
| Draw lines | `ON` | `ON` |

The defaults differ in **style, not just colour**, so the two remain
distinguishable for colourblind users.

**Extend lines right** — continuation defaults to 0 (line stops at the break
bar, cleanest). Reversal defaults to 50, because LH/HL levels often act as
ongoing support/resistance so some extension is useful — but "forever"
clutters the chart. Both scale with auto-adapt.

**Vertical marker** — a tick on the exact confirmation bar. Off for
continuation, on for reversal, since reversal signals are the easiest to
misread in real time.

**Draw lines** — the master switch per type. It turns off **the line AND the
label**, so disabling continuation actually hides those breaks entirely rather
than leaving an unexplained label with no line under it.

---

<a id="confidence-score"></a>

## ⑨ Confidence score

> **Question:** how good was this break, not just whether it happened?

| Setting | Default | Range |
|---|---|---|
| Score every break 0-100 | `ON` | |
| Minimum score to signal | `0` | 0–100 |
| Show score on label | `ON` | |
| Fade low-score breaks | `ON` | |

The filters above are pass/fail. The score tells you *how well* a break
passed — a break that barely qualified and one that qualified emphatically
both used to just say `HH`. Now they say `HH 42` and `HH 91`.

**Minimum score to signal** — breaks below this aren't labelled at all.
**Start at 0.** Setting it blind is just a slower way of tightening the
filters; the point of the score is to let the chart tell you where your cutoff
is. See [Calibration](Playbooks.md#calibrating-the-confidence-score).

**Fade low-score breaks** — low scorers draw more transparently, so
high-confidence structure stands out without reading numbers.

**Full breakdown of the six components, their weights, thresholds and tuning:
[Confidence Score](Confidence-Score.md).**

---

## ⑩ Score tuning (advanced)

Per-measure weights and full-marks thresholds. Covered in full on the
**[Confidence Score](Confidence-Score.md)** page.

---

## Alerts

Four break alerts plus two retest alerts. See **[Alerts](Alerts.md)**.

---

## Recommended techniques

**1. Match the preset to your timeframe before touching anything else.** Use
the fine-tune dial to nudge a preset that's *almost* right rather than jumping
to the next one.

**2. Run the score at zero before you gate anything with it.** A week or two
with `Minimum score to signal = 0` and scores shown. Set the minimum to what
you *observed*, not a guess.

**3. Treat LH/HL and HH/LL as two different jobs.** LH/HL is a reversal
alert — the earliest, riskiest read. HH/LL is a continuation confirmation —
the trend proving itself again. If you trade reversals, use LH/HL to get your
attention, then wait for a retest or same-direction HH/LL before committing
size. If you trade continuations, largely ignore LH/HL.

**4. Let the retest alert do entry timing, not the raw break.** A level
retested and holding is higher-confidence than the original break. Chasing the
break candle means worse fills and more fakeout exposure.

**5. Turn off the EMA trend filter if you trade reversals.** It will actively
hide the setup you're looking for.

**6. Use internal structure for entry timing, not bias.**

**7. Restrict to your actual session if you don't trade 24 hours.** Overnight
chop generates structure that isn't actionable for you anyway.
