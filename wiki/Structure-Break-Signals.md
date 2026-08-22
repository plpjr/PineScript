# Structure Break Signals

[← Home](Home.md)

Structure Break Signals v9.0 is a facts-only key-level and break-event reader.
It calculates from the loaded chart bars and active settings. It does not call
a level support or resistance, predict whether it will hold, score a trade, or
recommend an entry, exit, target, or direction.

## What appears on the chart

The default chart is a four-line map:

- `Above 1` and `Above 2` are the two selected clusters from upper reference
  sources.
- `Below 1` and `Below 2` are the two selected clusters from lower reference
  sources.
- Aqua identifies above levels and orange identifies below levels. One family
  is thinner and more transparent; each additional independent family makes
  the line thicker and brighter, capped at width 4.
- A right-edge label contains only side/rank, exact price, and independent
  reference count: for example, `Above 1 · 29488.50 · 3 refs`.

The line tooltip lists the source families, pivot-observation count, cluster
mean, current ATR tolerance, current ATR distance, oldest/newest constituent
age, and the completed reaction evidence for the monitored level. Historical
break lines are optional and default to zero so they do not clutter the live
map. Pivot labels and HH/LH/HL/LL text no longer exist.

## How a key level is calculated

The engine keeps factual source records from:

1. confirmed chart-timeframe pivot highs and lows;
2. the prior completed selected-session high and low;
3. the completed opening-range high and low; and
4. the completed overnight high and low, when overnight bars are loaded.

A pivot uses `ta.pivothigh(high, N, N)` or `ta.pivotlow(low, N, N)`. It is not
known until `N` later bars complete. Pivot records remain available for 500
bars by default, and the complete source registry is capped at 200 records.
Session-derived records are replaced when their corresponding period completes
again. A source is consumed after a completed close clears it by the effective
ATR clearance.

Nearby repeated pivots contribute to one `Pivot` family while their observation
count remains visible in the tooltip. Sources within `Cluster tolerance`
(0.20 current ATR by default) are consolidated. The cluster price is the
equal-weight mean of the participating family prices, so repeated pivots cannot
outvote Prior Session, Opening Range, or Overnight. The displayed `refs` number
is the count of unique families, from one to four.

Clusters beyond `Maximum distance` (10 current ATR by default) or below the
configured minimum family count are excluded. The engine ranks the remainder
by:

1. more unique families;
2. smaller current distance from price; and
3. newest constituent as the final tie-break.

It displays the selected number per side, then orders that selected subset by
distance so `Above 1` and `Below 1` are the nearest displayed boundaries. The
reference count is factual agreement only. It is not a claim that the level is
stronger, more likely to hold, or a target.

## Break candidates and confirmation

The nearest displayed level becomes the monitored boundary. An above candidate
begins when a completed close exceeds `Above 1` by the effective ATR clearance;
the below rule is mirrored. At that instant the script freezes the level price,
family count, source IDs, ATR, candle range/body, volume multiple, session
state, and initial clearance.

The visible line stays pinned to the frozen price while confirmation is being
evaluated. A close back across the level cancels the candidate and releases the
pin. A completed confirmation consumes the exact constituent records, creates
the bounded broken-level return record, and lets the engine select the next
qualified cluster. Labels and alerts use factual wording such as `Closed above
key level · 3 refs`.

## Span, location, and state

The dashboard uses `Above 1` and `Below 1` for immediate geometry:

- **Span:** `(Above 1 - Below 1) / current ATR`.
- **Location:** `(close - Below 1) / (Above 1 - Below 1) × 100`.
- **Nearest boundary:** the smaller absolute current ATR distance.
- **Compressed / expanded:** the raw price span compared with the prior
  complete selected-pair generation. It updates only when either selected
  cluster identity changes.

The current state says building, monitoring, candidate, canceled, or confirmed.
Missing facts use explicit text such as `No second qualified cluster`,
`Evidence building: 8 of 20`, or `Overnight unavailable: no overnight bars
loaded`.

## Reaction evidence

Each unique cluster generation is identified by its sorted constituent source
IDs. Its first approach can begin one reaction observation; the approach candle
is excluded. The observation freezes side, family count, session state, ATR
regime, cluster price, and ATR.

The configured race measures whether price first reaches the reaction distance
away from the level or a completed close reaches the close-through distance.
Both thresholds in one OHLC candle are ambiguous because their intrabar order
cannot be proved. The dashboard can state `Stronger measured`, `Weaker
measured`, `No measured separation`, or `Evidence building` against ordinary
bars from the same loaded chart.

This is an in-sample comparison, not predictive validation and not the
project's separate paired shifted-price placebo test. Reaction evidence never
selects a line and never changes line thickness or brightness.

## Post-break evidence

Each confirmed break freezes its direction, family count, session and ATR
regimes, initial-close measurements, confirmation delay, anchor, level, and
ATR. At the configured 5/10/20-bar horizons it records MFE, MAE, final signed
displacement, the first ±ATR threshold reached, first eligible broken-level
return age, and whether a later close crossed back through the level.

Evidence cohorts are `Side only`, `Side + family count`, `Family count +
session`, `Family count + session + ATR`, and `Full context`. Ordinary baseline
bars can match session and ATR regime but do not possess a key-level family
count, clearance, volume-at-cross, or confirmation delay. The dashboard shows
sample counts immediately and withholds comparisons until the configured
minimum is reached.

## Dashboard and five-minute workflow

1. Leave `Structure profile = Custom` to preserve the numeric inputs, or choose
   Standard for the documented `pivot 5 / clearance 0.10 ATR / confirmation 1`
   definition.
2. Read top to bottom: state → Above/Below levels → nearest boundary → span and
   location → pending/latest break → reaction and post-break evidence.
3. Enable session context only when it is relevant, and enter all sessions in
   the symbol's exchange time.
4. Use candidate notices for awareness and named alert conditions for completed
   events.
5. Wait for each evidence row to say `Ready` before interpreting its historical
   comparison.

`Compact` shows the immediate map and readiness. `Standard` adds source and
evidence summaries. `Research` preserves every non-relationship fact and shows
the separate detailed evidence table.

## Inputs

| Group | Controls |
|---|---|
| Quick setup | Structure profile, dashboard detail, optional session rows |
| Structure | Pivot confirmation, ATR lookback, initial clearance, confirmation delay |
| Session facts | Display filter, selected session, opening-range minutes, overnight session |
| Display | Break drawings, live map/labels, base line width, dashboard position |
| Key levels | 1–3 levels per side, tolerance, maximum distance, pivot age, minimum families |
| Broken-level returns | Return band, age window, cooldown, bounded record count |
| Event evidence | Horizons, first-hit threshold, family-count cohorts, sample bounds |
| Advance notices | Dynamic-alert master switch and detail level |
| Key-level evidence | First-approach race, sample minimum, bounded history |

## Alerts

Named conditions cover confirmed above/below breaks and returns to previously
broken levels. `Any alert() function call` covers the enabled candidate and
transition notices. All use completed bars and respect the display-session
filter. See [Alerts](Alerts.md).

## Compact glossary

| Term | Plain meaning |
|---|---|
| ATR | Average true range; the current unit used to compare distances across symbols and timeframes. |
| Clearance | Completed-close distance beyond a frozen key level, divided by ATR. |
| Reference family | One independent calculation type: Pivot, Prior Session, Opening Range, or Overnight. |
| Approach | One new entry into the ATR band around a level; it does not mean the level held. |
| Span / location | Distance between Above 1 and Below 1 in ATR / the close's percentage position inside it. |
| MFE / MAE | Maximum favorable/adverse excursion observed after a confirmed break in frozen ATR. |
| Baseline | Ordinary non-break chart bars measured over the same future horizons. |
| F / A / X / N | Favorable first / adverse first / both in one candle / neither. |

## Example chart reading

> Current state: Above candidate · 0/1 bars
>
> Above 1: 29,488.50 · 3 refs · 0.08 ATR
>
> Span/location: 3.20 ATR · close at 92% · compressed
>
> Historical evidence: Ready · 24 breaks / 612 ordinary bars

This proves that a completed close created a candidate at the shown frozen
cluster, three independent reference families contributed to that cluster, the
close is near the upper edge of the current pair, the pair is narrower than the
prior generation, and the historical cohort has reached its minimum sample.
It does not prove that the candidate will confirm or that the level will hold.

## Export fields

The four former relationship/active-boundary slots now export `Key level above
1`, `Key level below 1`, `Key level above 2`, and `Key level below 2`.
Direction, candidate source bar, immutable initial-close facts, confirmation
facts, family count, returns, excursions, session/range values, and packed
advance-event codes remain available. Relationship codes and HH/LH/HL/LL
exports are intentionally removed in this breaking v9.0 release.

The script intentionally contains no strategy, orders, probability, score,
entry, stop, or target logic.
