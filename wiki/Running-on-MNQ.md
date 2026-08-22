# Running on MNQ

[← Home](Home.md)

Suggested chart setup for viewing factual market-structure information on the
Micro E-mini Nasdaq-100 future.

## Chart setup

| Setting | Suggested starting value |
|---|---|
| Symbol | `MNQ1!` or the active MNQ contract |
| Timeframe | 15 minutes |
| Chart timezone | Exchange time |
| Session display | Extended hours, if you want overnight structure included |

`MNQ1!` is a continuous contract and can contain artificial gaps at contract
rolls. Treat structure formed immediately around a roll with care: the chart
data is real, but the discontinuity is a property of the continuous series.

## Indicator setup

Start with the defaults for both indicators. Confirm these choices before
interpreting the display:

- **Swing pivot length** defines how many bars must pass before a pivot is
  confirmed. A pivot length of 5 means a pivot is confirmed five bars after it
  occurred; that delay is inherent to the definition.
- **Session filter** controls which breaks are displayed. If regular-hours-only
  is selected, overnight breaks are omitted from the display by design.
- **ATR settings** determine the unit used for displayed distances and
  tolerances. ATR is a measurement scale, not a forecast.
- **Zone and confluence settings** change which calculated regions Key Zone Map
  draws. They do not establish that a region will hold or reverse price.

## Reading the display

Use the indicators to establish facts visible in the current chart data:

1. Read the latest confirmed HH, HL, LH, or LL sequence.
2. Check the exact price and ATR distance to the nearest confirmed levels.
3. Check the break clearance, timestamp, and session for any recent break.
4. Use Key Zone Map to see calculated region overlap, age, and in-chart
   frequency counts.

The indicators do not generate orders, define risk, or recommend a direction.
They make the underlying chart calculations legible so you can apply your own
trading plan and risk controls.
