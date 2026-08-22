# Opening Range Breakout Toolkit

[← Home](Home.md)

Opening Range Breakout Toolkit v1.0 is a daily, facts-only ORB indicator. It
measures the opening range from loaded chart bars, monitors completed closes at
its boundaries, and summarizes completed sessions. It does not place orders or
claim that a break, return, or historical proportion predicts the next move.

## Default daily workflow

1. Set `Trading session` in the symbol's exchange time. The default is
   `09:30–16:00`.
2. Set `Opening range minutes`. The default is 30 minutes.
3. Use a chart interval that divides the requested range cleanly, such as 1, 5,
   10, or 15 minutes for a 30-minute range.
4. During the opening interval, the high/low lines are dashed and the dashboard
   says `Opening range building`.
5. After completion, the lines become solid. Read state → OR High/Low → width →
   close location → nearest boundary → confirmed facts → historical context.
6. Use named alerts for completed facts. Use `Any alert() function call` for
   candidate and transition awareness.

## What is calculated

- **OR High / OR Low:** the highest high and lowest low of bars whose opening
  timestamps fall before the configured cutoff.
- **OR midpoint:** the equal midpoint of the observed high and low.
- **Width:** raw price width and width divided by ATR at range completion.
- **Location:** `(close - OR Low) / (OR High - OR Low) × 100`. Values below 0
  or above 100 mean the close is outside the range.
- **Boundary distance:** current distance to OR High and OR Low in current ATR.
- **Opening volume:** sum of volume reported by the included chart bars.

If the chart interval is too coarse to represent the requested cutoff exactly,
the Research dashboard reports the effective observed duration. The indicator
does not fabricate lower-timeframe bars.

## Candidate and confirmation rules

An above candidate starts when a completed close is above OR High by the
configured ATR clearance. The below rule is mirrored. The script freezes the
boundary, ATR, initial clearance, candle range/body, volume multiple, and
candidate bar.

`Confirmation bars = 0` confirms that first qualifying close. With a higher
setting, additional completed closes must remain beyond the frozen boundary. A
close back across the boundary cancels the candidate. Each side can confirm at
most once per selected session; both sides can confirm in the same session.

## Broken-boundary returns

After confirmation, the boundary must first move outside the configured ATR
return band. A later new overlap with the band counts as a return only when the
bar closes on the broken side and meets the minimum age. This prevents the
break candle from counting as its own return and prevents one continuous visit
from firing repeatedly.

## Historical observations

The indicator retains up to 200 completed sessions by default and reports:

- above-only, below-only, both, and neither confirmation proportions;
- first-confirmation counts by side, with same-bar ambiguity kept separate;
- median opening-range width in ATR;
- median minutes from effective range completion to first confirmation;
- median maximum extension above and below in completion-bar ATR;
- return proportions conditional on the matching side having confirmed; and
- the proportion of sessions with a confirmed break that later closed back
  inside the opening range.

The dashboard withholds these proportions until the configured minimum number
of completed sessions is available. These are in-sample descriptions of loaded
chart history, not probabilities, validation, or trading instructions.

## Dashboard modes

- **Compact:** immediate state, range boundaries, geometry, current-session
  break facts, and historical readiness.
- **Standard:** Compact plus completed-session outcomes, first-confirmation
  counts, extension medians, and return/back-inside proportions.
- **Research:** Standard plus requested versus effective range duration,
  timeframe compatibility, opening volume, median range ATR, and median time to
  first confirmation.

## Alerts

Named conditions are available for opening-range completion, confirmed above
and below closes, and returns to upward/downward-broken boundaries. Dynamic
alerts provide candidate start, cancellation, one-bar-remaining, and optional
return-band arm transitions. Set TradingView alert frequency to `Once Per Bar
Close`.

## Limits

- Calculations use the chart timeframe only; v1.0 makes no lower-timeframe or
  higher-timeframe request.
- Session strings are interpreted in exchange time and must be configured for
  the market being viewed.
- OHLC bars cannot reveal intrabar ordering.
- Missing volume remains unavailable rather than being inferred.
- Historical outcomes are tied to the loaded bars and current settings; a
  settings change causes TradingView to recalculate the entire history.
