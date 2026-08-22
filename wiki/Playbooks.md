# Playbooks

[← Home](Home.md)

Concrete setups and workflows. Everything here assumes **you place the trade
manually** — these are analysis tools, not a system.

- [Timeframe setups](#timeframe-setups)
- [Using both scripts together](#using-both-scripts-together)
- [Single-script workflows](#single-script-workflows)
- [Calibration](#calibration)
- [Strategy fit, ranked](#strategy-fit-ranked)

---

## Timeframe setups

A top-down routine for multi-timeframe futures work: Daily → 4H → 1H → 15M →
5M. Adapt freely; the point is that each timeframe has a *job*.

### Higher timeframe (Daily / 4H) — bias context only

| Setting | Value | Why |
|---|---|---|
| Pivot confirmation bars | `5–10` | Larger values define broader confirmed turns but add the same number of bars of known delay. |
| Confirmation bars after initial cross | `1` | Separates the first cross from one additional completed close. |
| Display events only inside session | `OFF` | Higher-timeframe structure should not be hidden by an intraday display window. |

You are not trading this chart. You are answering one question: **is the last
confirmed break a continuation (HH/LL) or a reversal (LH/HL)?**

### Execution timeframe (1H / 15M) — where the plan gets built

| Setting | Value | Why |
|---|---|---|
| Pivot confirmation bars | `5` | Default confirmed structure scale. |
| Minimum initial close beyond level | `0.10–0.20 ATR` | A transparent clearance rule; the export preserves the exact value. |
| Confirmation bars after initial cross | `1–2` | Reports a longer or shorter factual confirmation delay. |
| Display events only inside session | Optional | Filters drawings/alerts only; calculations remain all-session. |
| Event evidence cohort | `Relation + session + ATR` | Compares the latest event with prior events sharing those measured facts. |

### Entry timeframe (5M) — trigger only

| Setting | Value | Why |
|---|---|---|
| Pivot confirmation bars | `3–5` | More responsive structure with a known 3–5 bar confirmation delay. |
| Confirmation bars after initial cross | `0–1` | Choose immediate completed-close confirmation or one additional close. |
| Advance notices | `ON` if useful | Reports approaches and candidate state changes without calling them confirmed breaks. |
| Display events only inside session | Optional | Match only the notification window you actually monitor. |

### Shared across all timeframes

Keep the evidence horizons in ascending order. Interpret ATR, volume multiple,
candle body/range, clearance, session, and structural location as separate
measurements. v8.3 intentionally does not combine them into a quality score.

### Key Zone Map alongside

| Setting | Value |
|---|---|
| Swing engine + pivot length | **Match Structure Break Signals on the same chart** |
| Show confluence + hit-rate | `ON` |
| Hold confirmation margin | `0.5 × ATR` (default) — lower to `0.15` if too few holds register |
| Min overlap to count as confluence | `0.3` |
| Min sample size before showing a rate | `15–20` |
| Min impulse displacement (order blocks) | `0.8 × ATR` |
| All four detector types | `ON` initially — turn off what clutters *your* chart |

---

## Using both scripts together

They were one indicator before being split, and they're most useful read side
by side.

**1. Key Zone Map tells you WHERE.**
Watch the nearest Resistance/Support zone as price approaches. Check its
confluence count and — once sample size clears — its hit/held rate.

**2. Structure Break Signals tells you WHAT confirmed there.**
As price interacts with the zone, record the `HH/LL/LH/HL` relationship, exact
level, initial and confirmation clearance, delay, and session/structure context.

**3. Treat agreement as a journalable condition, not a conclusion.**
A zone lifecycle event and a same-area structure event are two recorded facts.
Use exports to test whether that combination behaves differently from its
baseline before assigning it more weight.

**4. Use alerts to bring the chart back to your attention.**
Broken-level return alerts and zone lifecycle alerts report completed events;
advance notices report preparation states. None is an entry instruction.

**5. For movement through a zone, record both timestamps.**
Compare zone invalidation with the structure break's candidate and confirmation
bars. The timing difference is directly measurable and can be tested later.

**6. Manage using the opposite zone as your target.**
Entered off a Support bounce? Key Zone Map's Resistance row is your nearest
logical target. Read it off the table rather than eyeballing the chart.

---

## Single-script workflows

### Structure Break Signals only

1. **Daily/4H:** note the last confirmed relationship and current active
   structural span/location.
2. **1H/15M:** observe whether a candidate starts, cancels, or confirms and keep
   the initial-cross and confirmation facts separate.
3. **At a confirmed break:** read its exact clearance, delay, ATR/volume, and
   selected-session context.
4. **After the configured long horizon:** use the evidence table to compare the
   completed cohort with the non-break baseline; do not treat a small sample as
   a forecast.
5. **Export and journal** the measurements you actually use in decisions so
   they can be checked out of sample.

### Key Zone Map only

1. **Daily/4H or 1H:** identify the nearest untested Resistance/Support zone.
   Note the confluence count.
2. Wait for either **`(held)`** — rejection confirmed, trade the bounce — or
   the zone going **invalidated/gone** while price closes through — trade the
   breakout.
3. Use the opposite-side zone as your target, read off the status table.
4. **Verify manually**, size and place the trade yourself.
5. **Journal** confluence count, hit/held rate, and outcome.

---

## Calibration

Structure Break Signals has no confidence score to tune. Its evidence layer
needs history, a stated cohort, and an honest comparison with its baseline.

1. Keep the default minimum of at least 20 completed event samples; more is
   better.
2. Export chart data and filter rows where `Evidence resolved · relationship
   code` is present.
3. Record symbol, timeframe, session, settings, and date range with every
   export.
4. Form a hypothesis from one period, then test it unchanged on a later period
   or another liquid symbol.
5. Prefer effects that remain directionally consistent across samples. A large
   in-sample difference from a tiny cohort is a research lead, not an edge.

### Reviewing confluence

1. **Set your zone settings and then leave them alone.** Every input change
   restarts every confluence bucket at `n=0`.
2. Watch which detector type the table keeps naming as best-sampled at your
   typical confluence level. That tells you empirically which detector actually
   works on your instrument.
3. Don't trust a rate until sample size clears your threshold — until then,
   trade on confluence count alone.
4. Remember [the limits](Confluence-and-Hit-Rates.md#the-hard-limits-of-these-numbers):
   it's a frequency count over loaded bars, not a backtest.

---

## No strategy ranking

The indicators do not contain enough out-of-sample evidence to rank trading
methods or assign fit percentages. The useful comparison is empirical: define
the exact chart condition, export it, compare it with an appropriate baseline,
and then test the unchanged condition on later data. The v8.3 evidence table is
a faster first pass for structure breaks, not a substitute for that process.

---

## Open items

**Session window and instruments.** Set the selected session and overnight
session to the exchange periods you actually want measured. Use `Display events
only inside session` only when you want to hide drawings and alerts; it does not
change detection or the evidence dataset.

Note that **session restriction is not a native setting in Key Zone Map** —
that filter lives only in Structure Break Signals. If you want session
filtering on zones too, it has to be handled via chart session settings or
applied by eye.
