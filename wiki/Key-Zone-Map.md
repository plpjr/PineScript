# Key Zone Map

[← Home](Home.md) · **File:** `Key_Zone_Map.pine` · **Version:** v1.6 ·
**Companion:** [Structure Break Signals](Structure-Break-Signals.md)

One job: tell you the nearest support/resistance zones above and below price,
why several independent detectors agree on them, and how often zones with that
much agreement have actually gotten hit before.

> Looking for HH/LL/LH/HL break labels or the confidence score? Those live in
> [Structure Break Signals](Structure-Break-Signals.md). This script has its
> own [zone-lifecycle alerts](Alerts.md#key-zone-map-alerts) as of v1.7 — a
> different thing from break alerts.

**Jump to:** [① Swing detection](#swing-detection) · [② Shared
style](#zones-shared-style) · [③ Swing zones](#swing-zones) · [④ Order
blocks](#order-blocks) · [⑤ FVGs](#fair-value-gaps) · [⑥
Liquidity](#liquidity-zones) · [⑦ Display](#display) · [Confluence & hit
rates](Confluence-and-Hit-Rates.md)

---

## Reading the chart

| What you see | What it means |
|---|---|
| **Green box** | A zone favouring longs — swing low, bullish OB, bullish FVG, or sell-side liquidity |
| **Red box** | A zone favouring shorts — swing high, bearish OB, bearish FVG, or buy-side liquidity |
| **Solid, bright box** | Live and untouched — worth watching closely |
| **Faded + `(tested)` / `(swept)`** | Touched at least once. Lower priority, not dead |
| **`(held)`** | Touched *and* confirmed rejection — the strongest "this zone worked" state |
| **Box gone** | Invalidated or fully filled — no longer relevant |
| **`· 2 conf`** on a label | Two other detector types overlap this zone |
| **`OB hit ≥58%/held ≥31% (n=44)`** | Historical rates for that confluence level — see [Confluence & Hit Rates](Confluence-and-Hit-Rates.md) |
| **Status table** | Swing/ATR, watched levels, and the nearest Resistance/Support read |

Border style tells the types apart at a glance: swing zones **dashed**, order
blocks **solid**, FVGs **dotted**, liquidity **solid**.

---

## The four detectors

| Detector | What it marks | Directional bias |
|---|---|---|
| **Swing zones** (③) | The current nearest swing high/low, as an area | Resistance above, Support below |
| **Order blocks** (④) | Where an impulsive move originated | Bullish OB = support-ish |
| **Fair value gaps** (⑤) | Imbalances price tends to return and fill | Bullish FVG = support-ish |
| **Liquidity pools** (⑥) | Equal highs/lows where stops rest | Buy-side above, sell-side below |

The swing zone is the **anchor** — the headline "watch this level" box. The
other three exist largely to answer *how much independent agreement is there
on this level*, which is the [confluence
layer](Confluence-and-Hit-Rates.md).

---

<a id="swing-detection"></a>

## ① Swing detection

> **Question:** what counts as a swing high/low, and which is the current
> nearest one?
> **Helps with:** establishes the anchor every other zone type gets measured
> against for confluence.

| Setting | Default | Range |
|---|---|---|
| Swing engine | `Pivot (fixed bars)` | Pivot / Directional change |
| Reversal threshold (× ATR) | `1.5` | 0.1–10.0 |
| Swing pivot length | `5` | 1–50 |
| ATR length | `14` | 1–200 |
| Filter minor swings by size | `ON` | |
| Min swing size (× ATR) | `0.5` | ≥ 0.0 |
| Auto-adapt to timeframe | `ON` | |

**Swing engine** / **Reversal threshold** — see **[Swing
Engines](Swing-Engines.md)**. If you run both scripts, **keep this matched
across them.**

**Swing pivot length** *(pivot mode only)* — lower (2–4) gives more, smaller,
faster-forming zones; higher (7–12) keeps fewer major zones with more lag.

**ATR length** — the lookback for every size/overlap threshold here: the swing
filter, hold margins, and confluence overlap. 14 is standard for intraday.

**Filter minor swings by size** + **Min swing size** — a pivot only becomes a
zone if it moved far enough from the last opposite swing. `0.0–0.2` is very
sensitive, `0.4–0.6` balanced, `1.0+` keeps only large structural swings.

**Auto-adapt to timeframe** — see [Concepts](Concepts.md#timeframe-adaptation).

> ### Why "watch high/low" can differ from the companion script
>
> This script has no break-quality filters, presets, or confirmation delay. The
> moment price closes through the watched swing, structure moves on — a **raw**
> break, not a graded one. That's deliberate: this script isn't grading break
> events, so gating zone replacement behind fakeout filters designed for
> scoring signals doesn't apply.
>
> The practical effect is that the `Watch high` / `Watch low` in this table can
> differ from Structure Break Signals', which waits for a higher-quality break
> before moving on. See [Concepts → Raw vs. graded
> break](Concepts.md#raw-break-vs-graded-break).

---

<a id="zones-shared-style"></a>

## ② Zones — shared style

> **Question:** how should every zone type look and behave, without repeating
> the same settings four times?
> **Helps with:** one place for colour, fade, border, and the entire
> confluence/hit-rate mechanism.

| Setting | Default | Range |
|---|---|---|
| Bullish zone colour | `#22C55E` green | |
| Bearish zone colour | `#EF4444` red | |
| Active zone opacity | `82` | 0–95 |
| Extra fade once tested/mitigated | `12` | 0–40 |
| Max active zones per type | `20` | 1–100 |
| Zone border width | `1` | 1–4 |
| Show confluence + historical hit-rate | `ON` | |
| Hold confirmation margin (× ATR) | `0.5` | ≥ 0.0 |
| Min overlap to count as confluence | `0.3` | 0.0–1.0 |
| Min sample size before showing a rate | `20` | ≥ 1 |
| Confidence-adjusted rates | `ON` | |

**Bullish / Bearish zone colour** — one colour each, shared by every zone type
of that directional bias. Type is distinguished by *border style*, set per type
in each section below.

**Active zone opacity** — transparency for a live untested zone. Higher = more
see-through. Lower it if zones feel too faint against your background.

**Extra fade once tested/mitigated** — added transparency once touched, so used
zones recede and only live ones jump out.

**Max active zones per type** — the oldest zone of each type auto-deletes past
this count. Keeps you under TradingView's object caps and the chart readable.

**Hold confirmation margin (× ATR)** — how far price must close back *away*
from a zone, beyond its near edge, to count as a confirmed hold rather than
just a touch. A zone can be touched without holding — price can wick in and
plow through moments later. Higher is stricter; `0` means almost any close back
outside counts.

**Min overlap to count as confluence** — how much two zones must overlap, *as a
fraction of the smaller zone's own range*, to count. `0.0` counts a single tick
brushing the edge; `0.3` (default) requires sharing 30% of the smaller zone;
`1.0` requires the smaller to sit almost entirely inside the larger.

**Show confluence + historical hit-rate**, **Min sample size**, and
**Confidence-adjusted rates** are the statistics layer — covered in full on
**[Confluence & Hit Rates](Confluence-and-Hit-Rates.md)**.

---

<a id="swing-zones"></a>

## ③ Swing zones

> **Question:** where's the nearest support/resistance *area* right now, not
> just the exact price?
> **Helps with:** the headline "where to watch" zone the whole script is built
> around.

| Setting | Default | Range |
|---|---|---|
| Shade resistance zone (swing high) | `ON` | |
| Shade support zone (swing low) | `ON` | |
| Extend zone right (bars) | `20` | 0–200 |
| Border style | `Dashed` | |

Draws the current watched swing high/low as a shaded box rather than a thin
line — the exact area price must break, made impossible to miss.

**The box spans wick-to-body of the swing candle.** The wick is the exact
extreme; the body edge is where real conviction started. The zone therefore
reflects the whole area price is likely to react from, not one tick.

Watched high is labelled **Resistance**, watched low **Support**. Only ever
shows the *current* nearest zone per side — this is a planning tool for what's
coming, not a history log. Independent toggles per side.

---

<a id="order-blocks"></a>

## ④ Order blocks

> **Question:** where did the move that broke this level actually originate?
> **Helps with:** flags re-entry zones on a retest — the classic
> "institutional footprint" trade.

| Setting | Default | Range |
|---|---|---|
| Show bullish order blocks | `ON` | |
| Show bearish order blocks | `ON` | |
| Min impulse displacement (× ATR) | `0.8` | ≥ 0.0 |
| Search back this many bars | `15` | 1–50 |
| Extend box right (bars) | `30` | 0–300 |
| Border style | `Solid` | |

An order block is the **last opposite-coloured candle before an impulsive
break** of the current swing zone — the candle where the move likely
originated. Bullish OB = last down-close candle before a break up; bearish OB =
last up-close candle before a break down.

**Min impulse displacement (× ATR)** — how far the breaking move must actually
*travel* before it earns an order block.

> This is **the most effective single control for cutting order-block
> clutter.** A break can be technically true and completely limp — price closes
> a tick through the swing and stalls. Without this gate, every one of those
> mints a zone, and the chart fills with boxes marking impulsive moves that
> never happened.
>
> `0.0` = no gate (the pre-v1.6 behaviour). `0.5–1.0` balanced. `1.5+` leaves
> order blocks only after violent breaks.

**Search back this many bars** — how far back from the break candle to look for
the origin candle.

**Extend box right** — how far an *active* (untested) box is drawn forward.
Once touched, the box stops extending.

---

<a id="fair-value-gaps"></a>

## ⑤ Fair value gaps

> **Question:** where did price leave an imbalance it's statistically likely to
> come back and fill?
> **Helps with:** marks zones price tends to revisit before continuing,
> independent of any structure break.

| Setting | Default | Range |
|---|---|---|
| Show bullish FVGs | `ON` | |
| Show bearish FVGs | `ON` | |
| Min gap size (× ATR) | `0.05` | ≥ 0.0 |
| Extend box right (bars) | `30` | 0–300 |
| Border style | `Dotted` | |
| Show 50% midline (CE) | `OFF` | |
| Midline width | `1` | 1–4 |
| Midline style | `Dotted` | |

A classic 3-candle imbalance: the wick of candle 1 doesn't overlap the wick of
candle 3, leaving a range the market moved through without trading. Price often
returns to fill it before continuing.

**Min gap size (× ATR)** — `0.0` shows every gap, even one tick wide.
`0.05–0.15` is balanced, hiding noise on choppy instruments. `0.3+` keeps only
large obvious imbalances.

**Show 50% midline (CE)** — the *consequent encroachment* level, which some
traders treat as the real reaction point rather than the whole gap. The midline
is tracked with its gap and deleted with it.

---

<a id="liquidity-zones"></a>

## ⑥ Liquidity zones

> **Question:** where are stop-losses and breakout orders resting that price
> might get drawn toward?
> **Helps with:** anticipates sweep/stop-hunt behaviour, so a wick toward one
> of these doesn't catch you off guard.

| Setting | Default | Range |
|---|---|---|
| Show buy-side liquidity (equal highs) | `ON` | |
| Show sell-side liquidity (equal lows) | `ON` | |
| Equal-level tolerance (× ATR) | `0.12` | ≥ 0.01 |
| Pivot lookback (bars) | `150` | 20–500 |
| Extend zone right (bars) | `40` | 0–300 |
| Border style | `Solid` | |

Marks equal (or near-equal) highs and lows as resting liquidity — clusters of
stops and breakout orders price is statistically drawn toward before reversing.

- **Buy-side liquidity** = equal highs, above price.
- **Sell-side liquidity** = equal lows, below price.

A move toward one of these followed by a sharp reversal is a classic **liquidity
sweep**.

**Lifecycle differs slightly from other types:** fades to `(swept)` the moment
price *wicks* through, shows `(held)` if price closes back away by the hold
margin (the sweep failed), and deletes once a *close* confirms the level is
consumed — whether or not price reversed, the resting liquidity is gone.

**Equal-level tolerance (× ATR)** — how close two swings must be to count as
"equal." Larger values merge more distant swings into one pool, which can
overstate how equal they really were.

**Pivot lookback** — how far back to look for a matching prior pivot. Longer
catches older equal highs/lows; shorter keeps only recent, more relevant pools.

> **Treat liquidity pools as "likely wick target," not "reversal guaranteed."**
> Price being drawn there doesn't mean it reverses there. Check the pool's
> **held** rate specifically before treating a sweep as a reversal trigger — a
> low held rate means sweeps on this instrument tend to run, not snap back.

---

<a id="display"></a>

## ⑦ Display

| Setting | Default | |
|---|---|---|
| Status table | `ON` | |
| Table position | `Top Right` | Top/Bottom × Left/Right |
| Raw pivot markers | `OFF` | |

**Status table** — swing length + ATR, current watch high/low, and the nearest
Resistance/Support confluence + hit-rate rows.

**Table position** — move it if it overlaps the companion script's table.

**Raw pivot markers** — triangles on every detected swing, *including ones the
ATR filter rejected*. Use this to diagnose why a zone isn't appearing where
you'd expect one.

---

<a id="alerts-and-export"></a>

## Alerts and data export

**Seven alerts** (v1.7): resistance/support zone touched, zone held (bullish,
bearish, or either), zone invalidated, liquidity swept. Full reference at
[Alerts → Key Zone Map](Alerts.md#key-zone-map-alerts).

Before v1.7 this script was silent — every zone event was a text change on a
box you had to be watching, which made a confirmed hold both the most
actionable thing here and the easiest to miss.

**Eleven data-window plots** for CSV export via *Export chart data…* and for
`{{plot("...")}}` in alert messages:

| Column | Encoding |
|---|---|
| `Zone event` | `1`=tested `2`=held `3`=invalidated `4`=liquidity swept |
| `Hold direction` | `1`=bullish `-1`=bearish |
| `Swing zone touched` | `1`=resistance `-1`=support |
| `Watch high` / `Watch low` | Current watched levels |
| `ATR` | Context |
| `Active order blocks` / `Active FVGs` / `Active liquidity` | Live count per detector |

> **Confluence and hit/held rates are deliberately not exported.** They're
> computed only on the last bar — rerunning the overlap scan every bar would
> multiply the script's cost by the number of active zones. Read them off the
> status table.

---

## Recommended techniques

**1. Prioritise sample size over raw confluence count.** A zone showing `3 conf`
with `n=4` is a coin flip dressed up as a strong signal. `2 conf` with `n=60` is
real evidence.

**2. Trade the HELD rate, not the hit rate, for fade setups.** Hit rate answers
"does price get here?" — that's attention, not respect. Held rate answers "does
price actually reject once it arrives?" A zone with 90% hit and 30% held is a
magnet, not a wall.

**3. Read the box label as a live trade manager.** `(tested)` on a zone you're
relying on means your thesis is being actively challenged — tighten or scale
rather than waiting to find out. `(held)` is validation. The box disappearing
means the level failed outright — that's an exit signal, not a "wait and see."

**4. Don't retune mid-session and expect the rates to still mean anything.**
Every input change restarts every confluence bucket at `n=0`, because
TradingView recalculates from bar 1. Expect `(building)` for a while afterward.

**5. Let the table tell you which detector to trust on this instrument.** The
Resistance/Support rows name whichever type has the largest sample at the
current confluence level. Over time that tells you empirically which detector
works on what *you* trade — more useful than assuming order blocks are
inherently superior.

**6. Consider a top-down layout.** Key Zone Map on a higher timeframe,
Structure Break Signals on your execution timeframe. Two chart layouts, but
macro zone context a single-timeframe view can't give you.
