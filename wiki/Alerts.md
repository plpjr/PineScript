# Alerts

[← Home](Home.md) · Provided by
[Structure Break Signals](Structure-Break-Signals.md)

Both scripts have alerts. They answer different questions, and you'll usually
want some of each:

- **[Structure Break Signals](#structure-break-signals-alerts)** — *did
  something structural just happen?* Break confirmations and retests.
- **[Key Zone Map](#key-zone-map-alerts)** — *did price reach, respect, or
  break a level I was watching?* Zone touches and lifecycle events.

---

<a id="structure-break-signals-alerts"></a>

## Structure Break Signals — the six alert conditions

| Alert | Fires when | Read as |
|---|---|---|
| **HH (Continuation)** | An up break confirms above a high that sits above the previous high | Uptrend confirmed itself again |
| **LL (Continuation)** | A down break confirms below a low that sits below the previous low | Downtrend confirmed itself again |
| **LH (Reversal Up)** | An up break confirms above a high that sits *below* the previous high | The downtrend's ceiling gave way — earliest, riskiest reversal read |
| **HL (Reversal Down)** | A down break confirms below a low that sits *above* the previous low | The uptrend's floor gave way |
| **Retest Support** | Price returns to a recently broken level from above and holds | Generally a **higher-confidence entry than the original break** |
| **Retest Resistance** | Price returns to a recently broken level from below and holds | Same, mirrored |

The four break alerts are split by type specifically so you can wire
**reversals and continuations to different notification channels** — most
people want to be interrupted by one and not the other.

> **The alert always matches the label.** Both read the same classification, so
> a break drawn as `HH` can never fire the `LH (Reversal Up)` alert. In v7.5
> and earlier both were derived from a running bias flag — they agreed with
> each other, but could jointly mislabel a break. v7.6 moved both onto the
> pivot sequence together.

---

## Setting one up

1. Right-click the chart → **Add alert**, or press `Alt+A`.
2. Under **Condition**, select **Structure Break Signals**.
3. In the second dropdown, pick one of the six conditions above.
4. Set **Options** — see the timing note below.
5. Configure notification (app, email, webhook) and **Create**.

Repeat per condition. TradingView alerts are one-condition-each, so a full
setup is typically 2–4 separate alerts.

### Alert message variables

The built-in messages already include ticker and price:

```
New HH — bullish continuation on {{ticker}} @ {{close}}
LH broken — bullish reversal on {{ticker}} @ {{close}}
Price retesting broken support level on {{ticker}} @ {{close}}
```

You can overwrite the message in the alert dialog and use any TradingView
placeholder (`{{interval}}`, `{{time}}`, `{{exchange}}`, …).

### Including the score in an alert

The script exposes its break data as named plots, so alert messages can
interpolate them directly:

```
{{plot("Break type")}} on {{ticker}} @ {{close}} — score {{plot("Break score")}}, level {{plot("Break level")}}
```

Available: `Break score`, `Break type` (`1`=HH `2`=LL `3`=LH `4`=HL),
`Break level`, `Break clearance (ATR)`, `Retest fired`, `ATR`, `Bias`. Full
table under [Data export](Structure-Break-Signals.md#data-export).

This is the difference between an alert that says something happened and one
you can act on — or log — without opening the chart.

---

## Timing: once per bar close

**Set alert frequency to `Once Per Bar Close`.**

The break conditions evaluate against `close`, which on a forming bar is the
*current price* and updates every tick. On any other frequency setting, a break
that appears mid-bar and fails before the bar closes will still have fired your
alert.

This is the standard live-bar caveat for close-based indicators, not a defect —
but it matters more here than usual, because a mid-bar break that fails is
precisely the fakeout the filters exist to reject.

The same applies to what you see on the chart: a label can appear on the
forming bar and vanish before it closes. Once a bar closes, its labels are
final.

> Retest alerts are already gated to confirmed bars internally, so they don't
> have this issue.

---

## Which alerts are worth having

**If you trade reversals:** `LH (Reversal Up)` and `HL (Reversal Down)`, plus
both retests. The reversal alerts get your attention; the retests give you the
actual entry.

**If you trade continuations:** `HH` and `LL` only, and largely ignore the
reversal alerts.

**If you want the highest-quality subset only:** set `Minimum score to signal`
to your [calibrated cutoff](Confidence-Score.md#calibration) first. Alerts
respect that gate, so a scored-out break fires nothing.

**If you want the retest alerts to be more selective:** raise `Minimum score to
signal` — a retest only fires if the *original break* cleared the score gate.
Also consider tightening `Retest proximity (× ATR)` from `0.20` to `0.10–0.15`.

---

## Repeat retests

As of v7.8, a level can retest more than once, gated by `Bars before a level
can retest again` (default `10`, scales with auto-adapt).

The reasoning: **a level that holds a second retest is stronger evidence than
one that held once.** The previous behaviour retired a level permanently after
its first retest, which discarded the better signal.

If you preferred one-alert-per-level, turn off `Allow repeat retests of a
level` in `⑤ Display & history`.

---

<a id="key-zone-map-alerts"></a>

## Key Zone Map — the seven alert conditions

Added in v1.7. Before that this script was entirely silent — every zone event
was a text change on a box you had to be watching at the time, which made the
most actionable thing it produces also the easiest thing to miss.

| Alert | Fires when | Read as |
|---|---|---|
| **Resistance zone touched** | Price first reaches the nearest swing-high zone | You're at the level you were watching. Decision point |
| **Support zone touched** | Price first reaches the nearest swing-low zone | Same, mirrored |
| **Zone held (bullish)** | Any bullish zone confirmed a rejection | Support defended — the strongest "this zone worked" signal |
| **Zone held (bearish)** | Any bearish zone confirmed a rejection | Resistance defended |
| **Zone held (either direction)** | Either of the above | One alert if you don't want to wire two |
| **Zone invalidated** | Any zone failed — price closed through it | If a trade depended on that level, this is your exit, not a "wait and see" |
| **Liquidity swept** | A liquidity pool was probed through | Possible stop-run. Check the pool's held rate before treating it as a reversal |

**Touch alerts fire on the transition into the zone**, not every bar price sits
inside it — otherwise a level price camps on would notify continuously.

> **Note the inversion for liquidity.** A buy-side pool sits *above* price as
> resistance, so a buy-side pool holding is a **bearish** event. The alerts
> account for this; the directional split is by what the event means, not by
> which array it came from.

### Which to wire

**Trading reactions off levels:** `Support/Resistance zone touched` to get your
attention, then `Zone held` in the matching direction as confirmation. That
pair is the core loop of the zone workflow.

**Trading breakouts:** `Zone invalidated` — a level failing is your signal, and
it's the one the visual-only design made easiest to miss.

**Combining with the companion script:** pair `Zone held` with a high-score
`HH`/`LL`/`LH`/`HL` in the same direction. Two independent systems agreeing is
the highest-confidence read available — see [Playbooks → Using both scripts
together](Playbooks.md#using-both-scripts-together).

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Alert never fires | `Minimum score to signal` is gating everything, or a `Draw …lines` master switch is off for that type |
| Alert fires then the label disappears | Alert frequency isn't `Once Per Bar Close` — see [timing](#timing-once-per-bar-close) |
| Retest alerts spam | Raise `Bars before a level can retest again`, or turn off `Allow repeat retests` |
| Too many reversal alerts in chop | Raise the preset strictness, or `Min bars between breaks` |
| Alert message lacks context | Overwrite it in the alert dialog with extra `{{placeholders}}` |

More at [Troubleshooting](Troubleshooting.md).
