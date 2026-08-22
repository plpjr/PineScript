# Structure Break Signals

[← Home](Home.md)

Structure Break Signals v8.4 is a guided facts-only reader for confirmed pivot
structure. It reports calculations from loaded chart bars and active settings.
It does not estimate probability, rank trade quality, recommend a direction,
or place orders.

## What appears on the chart

- Confirmed pivot highs and lows: `H`/`L` for the first observation,
  `HH`/`LH`/`LL`/`HL` relative to the prior confirmed same-side pivot, and
  `EH`/`EL` for exactly equal pivots.
- Active unbroken high and low with exact price, current ATR distance, and the
  number of separate entries into the selected ATR band (`approaches`).
- A measured evidence label on each active high and low: `Stronger measured`,
  `Weaker measured`, `No measured separation`, or `Evidence building`.
- Confirmed break lines after the close remains beyond the pivot for the
  configured delay. Optional labels separate initial-cross clearance from
  confirmation-bar clearance.
- Return markers for previously broken levels. A return requires price to move
  away first, enter the current ATR band on a new transition, and close on the
  broken side of the level.
- A selectable Compact, Standard, or Research dashboard. All three lead with
  the current factual state; Research restores the full facts and evidence
  panels.

## Quick setup and dashboard

`Structure profile` changes only the structural event definition. It never
changes ATR length, evidence horizons, return rules, or session calculations.

| Profile | Effective pivot / clearance / confirmation |
|---|---|
| Fast | `3 / 0.05 ATR / 0` |
| Standard | `5 / 0.10 ATR / 1` |
| Broad | `10 / 0.10 ATR / 1` |
| Custom | The three numeric Structure inputs |

Custom is the default to preserve existing saved behavior. The dashboard
always prints the effective values being used.

- **Compact** shows setup, current state, active boundaries, nearest boundary,
  structure span/location, latest confirmation, and evidence readiness.
- **Standard** adds immutable event measurements, ATR/volume context, optional
  session rows, and long-horizon break/baseline summaries.
- **Research** keeps the complete v8.2 fact set and enables the separate
  nine-row cohort table.

`Show session context in dashboard` controls the optional Standard-dashboard
rows. Research always shows the complete session facts. Calculations and Data
Window exports continue when the switch is off.

## How the main calculations work

### Pivots and relationships

`ta.pivothigh(high, N, N)` and `ta.pivotlow(low, N, N)` require `N` bars on
both sides of the pivot. The label therefore appears `N` bars after the actual
pivot. That delay prevents the script from claiming an unconfirmed swing.
Relationships use permanent prior-pivot history even after an active level has
broken, so clearing a break level cannot corrupt the next `HH/LH/LL/HL` label.

### Break candidates and confirmations

An upward candidate begins when a completed close is more than the configured
ATR clearance above the active high; downward is mirrored. The script freezes
the candidate bar, level, ATR, clearance, candle range/body, volume multiple,
and session state at that instant. Later bars cannot rewrite them. A confirmed
event occurs only after the configured number of additional completed closes
remain beyond that same frozen level.

### Active structural context

When a newly confirmed pivot creates a complete active high/low pair, the
script stores a structural snapshot:

- **Span:** `abs(active high - active low) / current ATR`.
- **Location:** `(close - lower boundary) / span × 100`.
- **Age:** bars since each boundary's source pivot.
- **Nearest boundary:** the smaller absolute ATR distance from the close.
- **Compressed/expanded:** the new pair's raw price width compared with the
  previous complete structural snapshot. It updates on a new pivot, not on
  every candle.

These describe the current chart geometry; they do not say that compression
must expand or that a nearby boundary must break.

### Active-level stronger / weaker evidence

The script does not assign points for age, touches, swing size, or appearance.
Those would be assumptions. Instead, it measures the first completed approach
to every confirmed structural level and compares the completed history with
ordinary starting bars from the same loaded chart.

- For a **high**, reaction is reached when price trades the configured ATR
  distance below the level before a completed close clears the configured
  close-through distance above it.
- For a **low**, the calculation is mirrored.
- The approach-bar ATR is frozen. The approach candle itself is excluded.
- Both thresholds on one candle is ambiguous because OHLC bars cannot prove
  order. Neither threshold by the reaction horizon is unresolved. Both remain
  in the denominator as non-reactions, which makes the rate conservative.
- Only the first approach to a level creates an observation, preventing repeat
  entries at one level from dominating the sample.

At pivot confirmation, the indicator also counts same-side references within
the configured ATR tolerance: prior-session high/low, opening-range high/low,
and overnight high/low. Missing references are not counted. The comparison
first tries to match side + reference count + selected-session state + ATR
regime. If that cohort is too small, it transparently falls back to reference
count and then level side. The tooltip names the cohort actually used and the
specific references overlapping the current level.

`Stronger measured` is shown only when the level reaction rate minus the
ordinary-bar rate has a 95% normal-approximation interval entirely above zero.
`Weaker measured` requires the interval entirely below zero. If it overlaps
zero, the factual result is `No measured separation`. Both sample sets must
meet `Minimum level samples`; otherwise the result is `Evidence building`.

These labels mean stronger or weaker **against the displayed chart-history
baseline under this exact definition**. They are in-sample descriptions, not
probabilities that the active level will hold. The ordinary-bar comparison is
also not the same as the separately researched shifted-price placebo; use the
label to compare defined observations, not as proof of a tradable edge.

### Post-break evidence

Each non-dual confirmed break starts an observation at its confirmation close.
The confirmation-bar ATR is frozen as the unit of measurement. At the selected
short, medium, and long horizons (5/10/20 bars by default), the script records:

- maximum favorable excursion (MFE), in frozen ATR;
- maximum adverse excursion (MAE), in frozen ATR;
- close displacement at the horizon, signed in the break direction;
- which ±ATR threshold was reached first;
- first eligible broken-level return age; and
- whether any later close crossed back through the broken level.

If both thresholds occur inside one OHLC candle, the outcome is `X` (same-bar
ambiguous), because bar data cannot prove the intrabar order. `N` means neither
threshold was reached.

The baseline uses actual completed non-break starting bars and the same forward
horizons. Downward events mirror the baseline direction. Depending on the
selected cohort, baseline samples can match direction, selected-session state,
and ATR regime. They cannot match pivot relationship, break clearance,
volume-at-cross, or confirmation delay because a non-break bar has none of
those facts. The table says `base ≤D/S/ATR` to make that limit visible.

All table values are historical medians or proportions. The table displays
sample counts immediately but withholds statistics until `Minimum cohort
samples` is reached. A break/baseline difference is not labelled an edge.

## Session and range context

Every loaded bar contributes to pivots, candidates, confirmations, active
levels, evidence, and broken-level returns. `Display events only inside
session` filters drawings and alerts by the event's confirmation bar only; it
does not remove the event from calculations or exports.

The facts table reports:

- elapsed minutes from the selected-session start using completed chart bars;
- current session range in ATR and close location inside it;
- ATR distances to the current session high and low;
- whether the close is above, below, or inside the prior completed session;
- opening-range high/low from bars whose opening time is within the configured
  opening minutes; and
- a separately calculated overnight high/low and current relation.

Overnight values remain blank when overnight bars are absent. Current/prior
session rollover also works on regular-session-only charts by detecting the
trading-day change.

## Advance notices

Transition alerts are available for the first entry into an active boundary's
band, break-candidate start/cancellation, one configured confirmation bar
remaining, a broken level moving outside its return band, and a new re-entry
into that band. They fire on completed bars and respect the display-session
filter. In TradingView, create one alert using **Any alert() function call**.

These are preparation notices about state changes—not early break signals.

`Advance notice detail` determines which dynamic messages are sent:

- **Confirmed only:** no dynamic `alert()` calls. The four named confirmed
  break/return conditions remain available.
- **Candidates:** candidate start, cancellation, and one-bar-remaining notices.
- **All transitions:** Candidates plus active-boundary approaches and
  broken-level arm/re-entry preparation.

The existing `Enable transition alerts` switch remains the master control.

## Compact glossary

| Term | Plain meaning |
|---|---|
| ATR | Average true range over the configured lookback; used to express distances in a scale that travels across markets. |
| Clearance | How far a completed close is beyond the frozen pivot level, divided by ATR. |
| Approach | One new transition into the ATR band around an active boundary. It does not mean the level held. |
| Structure span | Distance between the active high and low, divided by current ATR. |
| Structure location | Close position from the lower boundary (`0%`) to upper boundary (`100%`). Values outside 0–100 mean the close is outside the pair. |
| MFE / MAE | Maximum favorable/adverse excursion observed after a confirmed break, measured in the event's frozen ATR. |
| Baseline | Actual ordinary non-break starting bars measured over the same future horizons. |
| Stronger / weaker measured | The completed level-reaction rate is statistically above/below its ordinary-bar baseline under the configured first-hit definition. |
| F / A / X / N | Favorable first / adverse first / both in one bar with unknown order / neither threshold. |

## Example chart reading

Suppose the Standard dashboard shows:

> Current structure: Up candidate · 0/1 bars
>
> Active high: HH · 20,150 · 0.08 ATR away · age 14 · 2 approaches
>
> Structure: 3.20 ATR wide · close at 92% · compressed
>
> Historical evidence: Ready · 24 breaks / 612 ordinary bars

This proves only that a completed close created an upward candidate against the
shown active high, price is near the upper boundary of the current pair, the
pair is narrower than the prior snapshot, and enough matching historical
events exist to display their summaries. It does not prove that the candidate
will confirm or that price should be bought or sold.

## Settings summary

| Group | Controls |
|---|---|
| Quick setup | Structure profile, dashboard detail, and optional session rows |
| Structure | Pivot confirmation, ATR lookback, initial clearance, and confirmation delay |
| Session facts | Display filter, selected session, opening-range minutes, and overnight session |
| Display | Pivot/break history bounds, live levels/tags, line width, and facts table |
| Broken-level returns | ATR tolerance, eligible age, expiration, repeat cooldown, and record cap |
| Event evidence | Horizons, threshold, cohort, minimum sample count, history caps, and table |
| Advance notices | Dynamic transition master switch and detail level |
| Active-level evidence | Reaction horizon, reaction and close-through distances, reference tolerance, minimum samples, and history cap |

## Export fields

The Data Window exports event direction/relationship, source and candidate
bars, immutable initial-cross facts, confirmation facts, return events and
record lifecycle counts, ATR/volume, active-structure metrics, session/range
context, resolved post-break measurements, and packed advance-event codes.

Advance codes are `1/-1` active high/low approach, `2/-2` candidate start,
`3/-3` cancellation, `4/-4` one bar remaining, `5/-5` broken level armed, and
`6/-6` broken-level band re-entry. Separate event-count output reports how many
transition types occurred on the same bar.

The script intentionally excludes scores, probabilities, entries, stops,
targets, and strategy orders.
