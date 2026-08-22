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

## Structure Break Signals — confirmed events and advance transitions

Four named alert conditions describe confirmed observed events. They do not
call a break a continuation or reversal and do not call a return a successful
hold.

| Alert | Fires when |
|---|---|
| **Key level closed above** | A close above the frozen `Above 1` cluster completes its configured confirmation delay. |
| **Key level closed below** | A close below the frozen `Below 1` cluster completes its configured confirmation delay. |
| **Return to upward-broken level** | Price first moved above the return band, then re-entered it and closed at or above the level. |
| **Return to downward-broken level** | Mirrored: price moved below, re-entered, and closed at or below the level. |

The break alert records the frozen level and independent reference-family
count. v9.0 intentionally has no pivot-relationship classification or
relationship export.

The script also supplies dynamic, transition-only notices for:

- first approach to the current Above 1 or Below 1 band;
- upward/downward candidate start or cancellation;
- one configured confirmation bar remaining;
- an upward/downward broken level becoming armed after price moves away; and
- a new entry into an armed broken level's band.

Create one alert using **Any alert() function call** to receive these messages.
`Enable transition alerts` is the on-chart master switch. These alerts indicate
that a measurable state changed; they are not early confirmation or trade
recommendations.

| Advance notice detail | Dynamic messages received |
|---|---|
| `Confirmed only` | None. Use the four named conditions for completed events. |
| `Candidates` | Candidate start, cancellation, and one configured confirmation bar remaining. |
| `All transitions` | Candidate notices plus active-boundary approaches and broken-level arm/re-entry preparation. |

`All transitions` is the default to preserve v8.2 behavior. A developing user
who wants a quieter setup can choose `Candidates`.

---

## Setting one up

1. Right-click the chart → **Add alert**, or press `Alt+A`.
2. Under **Condition**, select **Structure Break Signals**.
3. In the second dropdown, pick one of the four confirmed-event conditions, or
   **Any alert() function call** for the categories selected by `Advance notice
   detail`.
4. Set **Options** — see the timing note below.
5. Configure notification (app, email, webhook) and **Create**.

Repeat per named condition. One **Any alert() function call** alert covers every
enabled dynamic category.

### Alert message variables

The built-in messages include ticker and confirmation-bar close:

```
A completed close confirmed above a frozen key level on {{ticker}} @ {{close}}
Price returned to a previously upward-broken key level and closed at or above it on {{ticker}} @ {{close}}
```

You can overwrite the message in the alert dialog and use any TradingView
placeholder (`{{interval}}`, `{{time}}`, `{{exchange}}`, …).

### Including measured fields in an alert

The script exposes its break data as named plots, so alert messages can
interpolate them directly:

```
direction {{plot("Break direction")}} on {{ticker}} @ {{close}} — level {{plot("Break level")}}, initial {{plot("Initial-cross clearance · ATR")}} ATR, confirmed {{plot("Confirmation clearance · ATR")}} ATR
```

Direction is `1` for above and `-1` for below. The four former relationship and
active-boundary slots now expose Key level above 1/below 1/above 2/below 2.
Candidate and confirmation measurements, family count, session flags, returns,
and excursion facts are also available as named plots. See [Export
fields](Structure-Break-Signals.md#export-fields).

---

## Timing: once per bar close

**Set alert frequency to `Once Per Bar Close`.**

The script gates confirmations, broken-level returns, and advance transitions
to completed bars.
`Once Per Bar Close` remains the clearest matching TradingView alert setting
and avoids platform-level intrabar notification ambiguity.

The session filter also applies at the event bar. When enabled, outside-session
events remain in exported data and still update structure, but their drawings
and alerts are suppressed.

Repeated broken-level returns require price to move outside the ATR band again
and satisfy `Minimum bars between repeated returns`. This prevents one extended
visit from generating an alert on every candle.

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

**Combining with the companion script:** compare a zone lifecycle event with a
confirmed key-level break and its measured context. Agreement is a fact worth
recording, not proof of a higher-probability trade. See [Playbooks →
Using both scripts together](Playbooks.md#using-both-scripts-together).

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Structure alert never fires | Check that the alert uses this indicator version, the intended condition, and that the optional session display filter includes the event bar. |
| Alert fires then the label disappears | Alert frequency isn't `Once Per Bar Close` — see [timing](#timing-once-per-bar-close) |
| Return alerts repeat too often | Raise `Minimum bars between repeated returns`. |
| Too many advance notices | Turn off `Enable transition alerts`, or create named confirmed-event alerts instead of `Any alert() function call`. |
| Alert message lacks context | Overwrite it in the alert dialog with extra `{{placeholders}}` |

More at [Troubleshooting](Troubleshooting.md).
