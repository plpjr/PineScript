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
5. Repeat from step 2 with `Key_Zone_Map.pine` if you want the zone half too.

Both scripts fit within a free TradingView account's indicator limit when run
as two separate indicators. That constraint is a large part of why they were
split rather than kept as one.

> **If the editor throws a compile error**, don't start editing settings —
> check [Troubleshooting → Compile
> errors](Troubleshooting.md#compile-and-runtime-errors) first.

---

## 2. Which one do you actually need?

You do not have to run both.

**Run only Structure Break Signals if** you trade breaks and continuations and
mostly want to know whether a move through a level was real. It is the more
self-contained of the two.

**Run only Key Zone Map if** you trade reactions off levels and want to know
which levels have historically mattered on your instrument. It draws no
signals — it maps terrain.

**Run both if** you want the full workflow: Key Zone Map tells you *where* to
pay attention, Structure Break Signals tells you *whether something real
happened* when price got there. See [Playbooks → Using both scripts
together](Playbooks.md#using-both-scripts-together).

---

## 3. First run — leave almost everything alone

Both ship with defaults chosen for **intraday futures on 5M–15M**. If that's
roughly your context, the only things worth touching on day one are:

### Structure Break Signals

| Setting | Do this | Why |
|---|---|---|
| `Preset` | Match it to your timeframe — see the table below | One control sets every filter at once |
| `Minimum score to signal` | **Leave at 0** | You have no idea what your cutoff is yet. See [Calibration](Playbooks.md#calibrating-the-confidence-score) |
| `Show score on label` | Leave ON | You're collecting data on what scores mean |
| `Only signal with EMA trend` | **Leave OFF** | It suppresses exactly the reversal signals you'd want to see |
| `Restrict to a session` | Turn ON once you know your window | Overnight chop generates structure you can't trade |

Preset by timeframe:

| Your chart | Preset | Notes |
|---|---|---|
| 1M–3M scalping | `Loose` | More signals, earlier, noisier — you filter manually |
| 5M–15M intraday | `Balanced` | What the defaults are tuned for |
| 1H swing | `Strict` | Fewer, more decisive breaks |
| 4H / Daily | `Very Strict` | Major structure only |

### Key Zone Map

| Setting | Do this | Why |
|---|---|---|
| `Swing pivot length` | Match Structure Break Signals if running both | Keeps the two agreeing on what a swing is |
| `Show confluence + historical hit-rate` | Leave ON | This is the entire point of the script |
| `Min sample size before showing a rate` | Leave at 20 | Stops you trusting a 3-sample percentage |
| Zone types (③–⑥) | Leave all ON initially | Turn types off later once you see which clutter *your* chart |

---

## 4. What you should see

**Structure Break Signals** should show two dotted lines (the swing high and
low currently being watched), a status table in the top right, and labelled
lines appearing when price breaks through one of them.

**Key Zone Map** should show a shaded box above and below price labelled
`Resistance` and `Support`, plus boxes for order blocks, gaps and liquidity
pools as they form.

If you see nothing at all after a few hundred bars, see [Troubleshooting → No
signals appear](Troubleshooting.md#no-signals-or-zones-appear).

---

## 5. The first week

Resist the urge to tune. Both scripts have a learning-based feature that needs
history before it means anything:

- Structure Break Signals' **[confidence score](Confidence-Score.md)** is
  display-only until you set a minimum. Spend a week watching which scores
  actually led to follow-through on your instrument, *then* set the cutoff to
  what you observed. Guessing it just tightens the filters slowly.
- Key Zone Map's **[hit rates](Confluence-and-Hit-Rates.md)** need zones to
  actually resolve before the numbers mean anything, and **every settings
  change resets the count to zero** because TradingView recalculates the
  script from bar 1.

The full procedures are in [Playbooks → Calibration](Playbooks.md#calibration).

---

## 6. Where to go next

- **[Concepts](Concepts.md)** — the vocabulary. Worth 10 minutes before you
  start changing things.
- **[Swing Engines](Swing-Engines.md)** — the single deepest setting in either
  script. Defaults to the conventional choice; the alternative is worth
  understanding.
- **[Playbooks](Playbooks.md)** — concrete timeframe setups and workflows.
