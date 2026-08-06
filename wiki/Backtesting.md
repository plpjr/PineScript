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

> **Set realistic costs in the Strategy Tester's Properties tab.** Those
> declaration defaults are placeholders — Pine requires them to be constants, so
> they cannot be inputs. A percent commission is wrong for futures, where the
> fee is per contract. Getting this wrong doesn't shade the result slightly; on
> a high-frequency configuration commission can be larger than the entire PnL.

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
| Move stop to breakeven | `ON` | |
| Arm after (R) | `1.0` | |
| Lock in (R) | `0.1` | |
| Trail the stop | `ON` | |
| Trail distance (× ATR) | `2.0` | |
| Max bars in trade | `20` | 0–500 (0 = off) |
| Max entries per day | `3` | 0–50 (0 = off) |
| On an opposite signal | `Close only` | Close only / Reverse / Ignore |

> ### Where these defaults came from
>
> They are **reasoned responses to a specific observed failure, not optimised
> values.** The first backtest produced 144 trades in 24 days where commission
> ($2.88) exceeded the entire net loss ($2.53), every loser ran the full stop
> distance, and average win equalled average loss despite a 2R target.
>
> | Default | Symptom it targets |
> |---|---|
> | `Max entries per day = 3` | Commission exceeded the loss — cap frequency directly |
> | `Breakeven ON, arm at 1R` | Losers were running the full stop distance |
> | `Trail ON at 2 ATR` | The 2R target wasn't being reached — take what the move gives |
> | `Max bars in trade = 20` | Average hold was 14 — cut the stalled tail |
>
> **No parameter here has been optimised, because no sweep has been run.** They
> are a starting point that addresses known problems. The values that are
> actually best for your instrument come out of the sweep below, not out of
> these defaults.
>
> `Entry trigger` deliberately stays on `Break`. Switching it to `Retest` is the
> single most promising untested change — but it *is* untested, and defaulting
> to it would be a guess dressed as a recommendation.

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

**On an opposite signal** — what happens when a break fires against an open
position. This matters far more than it looks.

- **`Close only`** (default) — flatten and wait. The thesis is dead, but that
  doesn't automatically make the other side a trade.
- **`Reverse`** — flip straight into the opposite position. A legitimate style,
  but know what it does to your statistics: the book is always in the market
  and flips on every opposite signal, so **the target is almost never reached
  and the realised payoff collapses toward 1:1** regardless of what you set
  `Target (R)` to. If you're comparing R multiples, this setting hides the
  thing you're measuring.
- **`Ignore`** — hold to stop or target regardless. The cleanest setting for
  judging whether your configured R multiple is actually achievable.

> **This was a bug until v7.9.** `strategy.entry()` in the opposite direction
> *reverses* an open position, so with `Trade direction = Both` the strategy was
> an accidental stop-and-reverse system — and the old `Exit on opposite break`
> toggle fired a redundant close on top of it. A first backtest showed 144
> trades over 24 days with average profit and average loss both at 0.05%: a 1:1
> payoff where 2:1 was configured. If you ran the strategy before this fix,
> re-run it.

---

## Fixing a losing configuration

In rough order of impact, when the tester comes back negative:

**1. Is commission a large share of the loss?** Compute
`trades × position size × commission % × 2` and compare to net PnL. If they're
the same order of magnitude, you have a *frequency* problem, not a signal
problem. Attack it directly:

- `Max entries per day` → 2–4
- `Minimum score to signal` (⑨) → raise it
- `Min bars between breaks` (③) → 5–8
- `Restrict to a session` (④) → your actual hours

**2. Is average win ≈ average loss?** Check Trades analysis. If they're equal
while you configured 2R, the target isn't being reached. Either:

- Lower `Target (R)` to something the instrument actually delivers, or
- Turn on `Trail the stop` and take what the move gives instead of demanding a
  fixed multiple.

**3. Are losers running the full stop distance?** That's what
`Move stop to breakeven` is for, and it's the highest-leverage change available
to a strategy that is right often enough. It needs no better signal — it only
stops trades that *were* working from giving it all back. The cost is getting
shaken out flat on trades that would have recovered, which is what
`Arm after (R)` trades off.

**4. Are trades stalling?** Average bars in trade tells you. Set
`Max bars in trade` near that number to cut the tail of positions that go
nowhere and free the capital for the next signal.

**5. Only then, question the entry.** Switch `Entry trigger` to `Retest`. A
break entry buys at a local extreme by construction; a retest waits for price
to come back. The docs assert this is better — this is where you find out.

> Change **one thing at a time** and write down the result. Changing three
> settings and seeing improvement tells you nothing about which one mattered.

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

**Check the realised payoff before trusting any row.** Compare *Average profit*
against *Average loss* in Trades analysis. If you configured `Target (R) = 2.0`
and they come back roughly equal, the target isn't being reached and the whole
table is measuring exit mechanics rather than signal quality. Fix that first.

**Sanity-check costs against net PnL.** Commission is
`trades × position size × commission % × 2`. On a churny configuration it can
exceed the entire result — a first run here produced −$2.53 net on ≈$2.88 of
commission, meaning gross was roughly flat and the loss was *entirely* fees.
That is a trade-frequency problem, not necessarily a signal problem, and it is
precisely what a score threshold is supposed to fix.

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
