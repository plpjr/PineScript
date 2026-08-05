# Backtesting

[← Home](Home.md) · **File:** `Structure_Break_Strategy.pine` *(generated)*

A `strategy()` version of [Structure Break
Signals](Structure-Break-Signals.md), built so one question can be answered
empirically rather than argued about:

> **Does the confidence score actually separate good breaks from bad ones?**

Everything in the wiki assumes it does. Nothing has ever tested it.

---

## Why it's generated, not written

`indicator()` and `strategy()` are mutually exclusive declarations, so this has
to be a second file. Maintaining a hand-written copy of ~1,700 lines of
detection logic would guarantee drift — and a drifted strategy is *worse than
no strategy*, because it would be measuring something other than what the
indicator does while looking authoritative.

So it's generated:

```bash
python3 tools/build_strategy.py
```

The detection body is carried over byte-for-byte. Exactly three things change:

| | Change | Why |
|---|---|---|
| 1 | `indicator(...)` → `strategy(...)` | Different script type |
| 2 | `alertcondition(...)` lines dropped | Pine rejects them in strategy scripts |
| 3 | `tools/strategy_tail.pine` appended | The trade logic |

Drawing code is deliberately kept — it's valid in a strategy and lets you
eyeball fills against the signals that produced them.

**Never edit `Structure_Break_Strategy.pine` directly.** Edit the indicator (for
detection) or `tools/strategy_tail.pine` (for trade rules), then regenerate.

```bash
python3 tools/build_strategy.py --check   # exit 1 if the checked-in file is stale
```

The generator is deterministic — no timestamps, no environment data — so a
stale file is a `git diff`, not a guess.

---

## Loading it

Same as the indicators: Pine Editor → paste `Structure_Break_Strategy.pine` →
Save → Add to chart. The **Strategy Tester** panel appears at the bottom.

Defaults: 100k capital, 10% of equity per trade, 0.01% commission, 1 tick
slippage, `process_orders_on_close = true`.

> That last one matters. The break conditions evaluate against `close`, so
> filling on the next bar's open would report entries the signal never actually
> offered — flattering the results for the wrong reason.

---

## Two warnings you will see, and must not "fix"

The strategy compiles with two warnings:

```
Warning: Strategies without `calc_on_every_tick = true` only calculate on
confirmed chart bars. In this case, `barstate.islast` may not initially
return `true` on realtime bars...
```

**Both are harmless, and the fix they suggest would corrupt your results.**

The two sites are the live-level lines and the status table — pure chart
furniture carried over from the indicator. Neither participates in a single
trade decision. The warning is aimed at indicator authors who need live-bar
state; a backtest runs on confirmed historical bars, where `barstate.islast`
behaves exactly as expected.

Setting `calc_on_every_tick = true` would:

- make the strategy evaluate intrabar, so results depend on tick sequences
  TradingView cannot faithfully replay — a well-known source of backtests that
  look good and cannot be reproduced;
- contradict `process_orders_on_close = true`, which is deliberately set so
  fills happen where the signal actually occurred.

If the visual clutter bothers you, switch off `Live (unbroken) high/low level`
and `Status table` in the strategy's own settings. The warnings are emitted at
compile time either way — they are about the code existing, not running.

---

## Trade logic (`⑫ Backtest`)

Every rule is an input, because the point is to *sweep* them rather than trust
one hardcoded set.

| Setting | Default | Options |
|---|---|---|
| Entry trigger | `Break` | Break / Retest |
| Trade direction | `Both` | Both / Continuation only / Reversal only |
| Stop placement | `ATR multiple` | ATR multiple / Beyond broken level |
| Stop distance (× ATR) | `1.5` | |
| Buffer beyond level (× ATR) | `0.25` | |
| Target | `R multiple` | R multiple / Opposite swing |
| Target (R) | `2.0` | |
| Exit on opposite break | `ON` | |

**Entry trigger** — the wiki argues throughout that a retest is a
higher-confidence entry than the raw break. Running both settings is how you
find out whether that's true on your instrument. *Note: retests don't carry a
break type, so the direction filter can't apply to them.*

**Trade direction** — the docs treat continuation (HH/LL) and reversal (LH/HL)
as two different jobs. This tests whether they actually perform differently.

**Stop placement** — `ATR multiple` keeps risk constant so R-multiples stay
comparable across settings. `Beyond broken level` is more structurally
meaningful but varies per trade, which makes comparisons noisier. Start with
ATR.

**Exit on opposite break** — structural invalidation. The thesis is dead, so
the trade is too.

---

## The experiment that matters

Sweep `Minimum score to signal` and record the results:

| `Minimum score` | Trades | Net profit | Profit factor | Max drawdown | Win % |
|---|---|---|---|---|---|
| 0 | | | | | |
| 40 | | | | | |
| 55 | | | | | |
| 70 | | | | | |
| 85 | | | | | |

Change **nothing else** between runs.

### How to read it

**If profit factor rises as the threshold rises** — the score is doing its job.
Your cutoff is wherever the curve flattens (past that point you're paying in
missed trades for no gain).

**If it's flat** — the score is not measuring anything useful. That is a real
finding and worth more than any feature on the roadmap. It would mean the
0–100 number is decoration, and the honest response is to fix the score's
components or stop presenting it as meaningful.

**If it gets worse** — the score is anti-correlated with outcome, which would
point at a specific broken component. Check the [leg-size and follow-through
notes](Confidence-Score.md), the two components with known history.

**Watch trade count.** At 85 you may have 6 trades. Six trades is not evidence
of anything, whatever the profit factor says — the same small-sample problem
the [Wilson bound](Confluence-and-Hit-Rates.md#wilson) exists to handle on the
zone side.

### Also worth sweeping

Both of these are currently defaults chosen by reasoning, not evidence:

- **[Swing engine](Swing-Engines.md)** — pivot vs. directional change. The
  adaptive engine should show up as better entries on fast reversals if the
  argument for it holds.
- **Volatility measure** — ATR vs. median true range. Median reads lower, so
  expect more trades; the question is whether the extra ones are any good.

---

## What this can and cannot tell you

**It can falsify.** "Tightening the score does nothing" is a credible result
from a single backtest, and an important one.

**It cannot confirm.** A good curve on one instrument over loaded history is
weak evidence. Specifically:

- **One instrument, one period.** Nothing here says it generalises.
- **No walk-forward.** Sweeping a parameter and picking the best value on the
  same data is curve-fitting. The result tells you what *would have* worked,
  which is not the same as what *will*.
- **Fills are optimistic.** Even with slippage and close-based fills, a
  backtest never models a fast market honestly.
- **Survivorship in your own attention.** If you sweep twenty settings and
  report the best, you've found noise.

Treat a good result as "not obviously broken," not as validation. The
[calibration workflow](Playbooks.md#calibrating-the-confidence-score) on live
forward data remains the stronger evidence, and this is a sanity check on it.
