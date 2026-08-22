# Getting Started

[← Home](Home.md)

---

## 1. Load the scripts into TradingView

Both are Pine Script v5 indicators. Nothing is installed from the TradingView
public library — you paste the source in yourself.

1. Open any chart → **Pine Editor** (bottom panel).
2. **Open → New indicator**, select all the boilerplate, delete it.
3. Paste the entire contents of `Structure_Break_Signals.pine`.
4. **Save**, give it a name, then **Add to chart**.
5. Repeat from step 2 with `Key_Zone_Map.pine` if you want the zone half, or
   `Opening_Range_Breakout_Toolkit.pine` for the daily ORB workflow.

The scripts remain separate because one reports structure events and the other
maps persistent price regions. This keeps their chart roles and settings clear.

The ORB toolkit is also separate: it resets around one explicitly configured
daily session and should not inherit every general-purpose structure setting.

> **If the editor throws a compile error**, don't start editing settings —
> check [Troubleshooting → Compile
> errors](Troubleshooting.md#compile-and-runtime-errors) first.

---

## 2. Which one do you actually need?

You do not have to run both.

**Run only Structure Break Signals if** you want a clean map of calculated key
levels and completed-close facts when price moves through one. It is the more
self-contained of the two.

**Run only Key Zone Map if** you trade reactions off levels and want to know
which levels have historically mattered on your instrument. It draws no
signals — it maps terrain.

**Run both if** you want the full workflow: Key Zone Map tells you *where* to
pay attention, Structure Break Signals tells you *whether something real
happened* when price got there. See [Playbooks → Using both scripts
together](Playbooks.md#using-both-scripts-together).

**Run Opening Range Breakout Toolkit if** your daily process begins with a
defined session opening range and you want its exact boundaries, completed-close
state, returns, and loaded-history session facts in one compact indicator.

---

## 3. Structure Break Signals — the five-minute setup

1. Add the indicator and open its settings. Leave **Structure profile =
   Custom** to preserve the numeric defaults or any saved settings. Choose
   **Standard** if you want the documented `pivot 5 / clearance 0.10 ATR /
   confirmation 1` definition. Fast and Broad change event definitions, not
   expected performance.
2. Leave **Dashboard detail = Standard**. Read it from top to bottom: current
   state → Above/Below levels → nearest boundary → span/location → pending or
   latest confirmed break → historical evidence. Hover a key-level label for
   exact source families, pivot observations, ages, tolerance, distance, and
   reaction evidence.
3. Leave **Show session context in dashboard = OFF** unless session ranges are
   meaningful for the market. When enabled, enter the selected and overnight
   periods in the symbol's exchange time.
4. For notifications, use a named alert condition for completed breaks or
   returns. Use **Any alert() function call** only for the enabled candidate or
   transition notices.
5. Wait until **Historical evidence** says `Ready`. Before then, the displayed
   count is still building toward the configured minimum. Active-level
   evidence has its own minimum and says `Evidence building` until both the
   structural-level and ordinary-bar samples are large enough.

The three guided profiles are market-neutral because they use bar counts and
ATR-normalized clearance:

| Profile | Effective definition | What changes |
|---|---|---|
| `Fast` | Pivot 3 · clearance 0.05 ATR · confirm 0 | More responsive, smaller structural turns |
| `Standard` | Pivot 5 · clearance 0.10 ATR · confirm 1 | Documented middle definition |
| `Broad` | Pivot 10 · clearance 0.10 ATR · confirm 1 | Broader turns with a 10-bar known pivot delay |
| `Custom` | Uses the numeric Structure inputs | Preserves existing configurations |

### Key Zone Map

| Setting | Do this | Why |
|---|---|---|
| `Swing pivot length` | Match Structure Break Signals if running both | Keeps the two agreeing on what a swing is |
| `Show confluence + historical hit-rate` | Leave ON | This is the entire point of the script |
| `Min sample size before showing a rate` | Leave at 20 | Stops you trusting a 3-sample percentage |
| Zone types (③–⑥) | Leave all ON initially | Turn types off later once you see which clutter *your* chart |

---

## 4. What you should see

**Structure Break Signals** should show up to four dotted horizontal levels:
`Above 1`, `Above 2`, `Below 1`, and `Below 2`. Their labels show exact price
and independent reference count. The guided dashboard appears in the top right;
the separate evidence table appears only in Research detail. Pivot labels and
HH/LH/HL/LL text are intentionally absent. Historical break drawings default
to zero so the live map remains clean.

**Key Zone Map** should show a shaded box above and below price labelled
`Resistance` and `Support`, plus boxes for order blocks, gaps and liquidity
pools as they form.

If you see nothing at all after a few hundred bars, see [Troubleshooting → No
signals appear](Troubleshooting.md#no-signals-or-zones-appear).

---

## 5. The first week

Resist the urge to tune. Both scripts summarize loaded history, so their sample
counts need time to build:

- Structure Break Signals withholds event-cohort statistics until the selected
  cohort reaches its minimum sample count. Compare completed break observations
  with the displayed non-break baseline; do not convert an early difference
  into a rule.
- A stronger/weaker key-level evidence row describes separation from its
  loaded-chart ordinary-bar baseline under one exact reaction definition. It
  does not select the displayed lines, claim a live level will hold, or provide
  a trade instruction.
- Key Zone Map's **[hit rates](Confluence-and-Hit-Rates.md)** need zones to
  actually resolve before the numbers mean anything, and **every settings
  change resets the count to zero** because TradingView recalculates the
  script from bar 1.

The full procedures are in [Playbooks → Calibration](Playbooks.md#calibration).

---

## 6. Where to go next

- **[Concepts](Concepts.md)** — the vocabulary. Worth 10 minutes before you
  start changing things.
- **[Structure Break Signals](Structure-Break-Signals.md)** — exact event,
  evidence, session, and export definitions.
- **[Playbooks](Playbooks.md)** — concrete timeframe setups and workflows.
