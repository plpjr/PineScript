# Running on MNQ

[← Home](Home.md) · [Backtesting](Backtesting.md)

Step-by-step setup for **MNQ** (Micro E-mini Nasdaq-100). The strategy's
defaults are already set for micro futures, so this is mostly verification plus
two settings TradingView controls rather than the script.

---

## Why MNQ works where EUR/USD didn't

The first backtest ran on EUR/USD 5-minute and lost on arithmetic, not on
signal quality: commission was 2.3 pips against a ~4 pip stop, so **55% of the
risk went to fees before the trade started.**

MNQ is a different proposition entirely:

| | EUR/USD 5M | MNQ 5M |
|---|---|---|
| ATR | ~2.8 pips | ~12 points |
| Stop at 1.5 × ATR | ~4.1 pips | ~18 points = **$36** |
| Round-turn cost | 2.3 pips | 5 ticks = **$2.50** |
| **Cost ÷ risk** | **55%** | **6.9%** |
| Verdict | Not viable | **Workable** |

Cost as a share of risk, by timeframe *(ATR figures are typical, not
promises — read your actual ATR off the indicator's status table)*:

| Timeframe | ATR (pts) | Stop ($) | Cost ÷ risk |
|---|---|---|---|
| 5M | ~12 | $36 | 6.9% |
| 15M | ~22 | $66 | 3.8% |
| 1H | ~45 | $135 | 1.9% |
| 4H | ~95 | $285 | 0.9% |

All workable. **Start on 15M** — enough cost headroom to be forgiving, enough
trades to reach a meaningful sample inside a few months of history.

---

## Contract spec

| | |
|---|---|
| Tick size | 0.25 index points |
| Tick value | **$0.50** |
| 1 point | $2.00 |
| Typical retail commission | ~$0.75/side, **$1.50 round turn** |
| Intraday margin | ~$2,000–3,000 per contract |

---

## 1. Chart setup

- **Symbol:** `MNQ1!` (continuous front-month) or a specific contract like
  `MNQZ2026`
- **Timeframe:** 15M to start
- **Session:** leave the chart on regular hours or extended — the script has its
  own session filter, covered below

> **`MNQ1!` splices contracts at each roll**, which leaves an artificial gap in
> the price series. A handful of signals per quarter will fire off a roll gap
> rather than real structure. Not enough to invalidate a backtest, but if a
> single enormous winner or loser sits right on a roll date, discount it.

---

## 2. Strategy Tester → Properties

The script's declaration already sets these, but **Properties overrides the
script**, so check them:

| Field | Set to | Why |
|---|---|---|
| Initial capital | `10000` | ~4× intraday margin for 1 contract |
| Order size | **`1` Contract** | Futures trade whole contracts. Fixed size keeps results readable as dollars per contract |
| Commission | **`0.75` Cash per contract** | Your actual per-side rate |
| Slippage | **`2` ticks** | Conservative for MNQ. Stop fills are market orders |
| Recalculate | leave both **off** | See [the warnings note](Backtesting.md#two-warnings-you-will-see-and-must-not-fix) |

> **Use your real commission.** If your broker charges $0.35/side, use that.
> This number decides whether the result means anything.

---

## 3. Indicator settings

### `⑫ Backtest`

| Setting | Value | Why |
|---|---|---|
| Round-trip cost (ticks) | **`5`** | $1.50 commission ÷ $0.50/tick = 3, plus 2 slippage |
| Skip trades when costs exceed a share of risk | `ON` | Should never trigger on MNQ — it's there to catch you if you switch instruments |
| Entry trigger | `Break` | Baseline. Change this second, not first |
| Trade direction | `Both` | |
| Stop placement | `ATR multiple`, `1.5` | Keeps R comparable across runs |
| Target | `R multiple`, `2.0` | |
| On an opposite signal | `Close only` | |
| Everything else | **OFF** | Breakeven, trailing, time exit, daily cap. [Why](Backtesting.md#management-off) |

### `④ Context filters` and `③ Break quality filters`

**Nothing to change** as of v7.11 — these already default to futures values:

| Setting | Default | Why it's set that way |
|---|---|---|
| Restrict to a session | `ON`, `0930-1600` | MNQ trades nearly 24h, but overnight is thin and produces structure you'd never trade. The highest-value context setting on futures |
| Require volume expansion | `ON` | Futures volume is exchange-reported and real, unlike the synthetic tick counts on CFD/spot-FX feeds |
| Volume baseline | `Time of day` | Removes the intraday U-shape |
| Only signal with EMA trend | `OFF` | It suppresses reversal signals by design |
| Minimum score to signal | `0` | Start unfiltered — this is the variable you're about to sweep |

> Check your **chart timezone** is exchange time, or `0930-1600` won't land on
> the US cash session.

---

## 4. Run the baseline

Load it and record: **trades, profit factor, win rate, average win, average
loss, max drawdown.**

Before reading anything into the result, check three things:

1. **The cost label on the chart** should say *workable* at roughly 5–8%. If it
   says otherwise, your cost input or timeframe is wrong.
2. **Average win vs. average loss.** With a 2R target these should differ. If
   they're equal, targets aren't being reached — lower `Target (R)` to 1.5 and
   note it.
3. **The Favorable excursion column** in List of Trades. Lots of `0.00%` means
   entries are landing at the turn — go straight to `Entry trigger = Retest`.

---

## Recorded baseline — MNQ 15M, Apr 30 – Aug 5 2026

For comparison when you change something. Defaults as shipped in v7.11,
`Minimum score to signal = 0`:

| | |
|---|---|
| Trades | 52 |
| Profit factor | **0.855** |
| Win rate | 32.69% |
| Avg win / avg loss | +0.77% / −0.46% = **1.67 : 1** |
| Avg bars in trade | 18 |
| Commission | $78 total — **5.7% of the loss** |
| Net PnL | −$1,373.50 (−13.73%) |
| Max drawdown | $4,107.75 (**38.94%**) |
| Buy and hold, same window | **+37.03%** |

**Read this as close, not as failing.** At a 1.67:1 payoff, breakeven needs a
37.4% win rate. At 32.69% the gap is **4.7 percentage points** — two or three
trades out of 52.

The costs are no longer the story: $78 against a $1,373 loss. Compare the same
strategy on EUR/USD 5M, where profit factor was 0.135 and commission alone
exceeded the entire loss.

### The direction split

| | Trades | Win rate | Net |
|---|---|---|---|
| Long | 6 | 67% | +$1,035 |
| Short | 16 | 31% | −$857 |

*(partial sample from the visible trade list)*

The strategy was overwhelmingly short into a market that rose 37%.

> **This finding is confounded, and it matters.** "Shorts lost" and "the market
> went up" are the same fact over a single quarter. Going long-only would look
> excellent here and be pure curve-fitting to one regime. The principled
> response is **trend alignment**, which works in both directions — either the
> EMA filter or trading continuations only.

### Also worth noting

**Max drawdown of 38.94% is too much** for a $10K account holding 1 MNQ
contract, even if the strategy turns profitable. Budget $15–20K per contract,
or expect an account-threatening drawdown.

**52 trades is thin.** A 4.7pp win-rate gap is two or three trades. Don't
over-read a small improvement from any single change.

---

## 5. Then sweep the score

The experiment everything else exists to enable. Change **only**
`Minimum score to signal`:

| `Minimum score` | Trades | Profit factor | Win % | Avg win | Avg loss | Max DD |
|---|---|---|---|---|---|---|
| 0 | | | | | | |
| 40 | | | | | | |
| 55 | | | | | | |
| 70 | | | | | | |
| 85 | | | | | | |

**Rising profit factor** means the score ranks breaks and your cutoff is where
the curve flattens. **Flat** means the score is decoration. Full reading guide
in [Backtesting](Backtesting.md#the-experiment-that-matters).

### Before the sweep, fix direction first

From the baseline above, the largest single problem is counter-trend trading,
not signal quality. Test these one at a time — **one change per run**:

| Run | Change | Tests |
|---|---|---|
| **A** | `Only signal with EMA trend` → `ON` (④) | Trend alignment via moving average |
| **B** | `Trade direction` → `Continuation only` (⑫) | Trend alignment via structure: HH/LL only, no LH/HL reversals |
| **C** | Score sweep, using whichever of A/B won | Whether the score ranks breaks |

> Run A contradicts advice repeated elsewhere in this wiki — that the EMA
> filter should stay off because it hides reversal setups. That advice assumed
> reversals were worth catching. On this data they are where the losses are.
> Believe the measurement over the guidance.

Watch the trade count — six trades at 85 is not evidence of anything.

---

## 6. Sample size

Over roughly a month of 15M data you might get 60–120 trades. That's enough to
see a trend across the sweep, not enough to trust a specific number.

If you can load more history, do — profit factor computed on 300 trades is
worth several times one computed on 60. And a good result on one instrument
over one quarter still isn't validation; see [what a backtest can and cannot
tell you](Backtesting.md#what-this-can-and-cannot-tell-you).

---

## Troubleshooting

> ### Every trade loses, 0 winners, each loss ≈ the commission
>
> **You are on the wrong instrument.** The strategy declaration sizes at
> **1 contract** and charges commission **per contract** — correct for futures,
> catastrophic anywhere else.
>
> On EUR/USD, "1 contract" means **one euro**: a $1.15 position paying $1.50 in
> commission. Every trade loses 130% of its own notional. A real run of this
> produced 29 trades, 0 winners, every net PnL exactly −$1.50, and a −79% return
> per trade — which reads like a catastrophically broken strategy and is
> actually a units mismatch.
>
> The strategy now detects this and refuses to trade, showing a red
> **WRONG INSTRUMENT** label instead. If you see it: switch to a futures symbol,
> or set Order size and Commission in Properties for that market.

> ### I changed a setting and the results are identical
>
> Compare **trade count** first. If it hasn't moved, the change didn't apply —
> a run that silently ignored your change looks exactly like a change that had
> no effect, and that costs you a whole test.
>
> **The on-chart label echoes the settings that actually decide which trades
> are taken:**
>
> ```
> cost 4.1% of risk — workable
> stop 66 ticks · 1 contract = $59,140
> ————————————————
> EMA trend ON (50)  ·  session ON 0930-1600
> volume ON  ·  min score 0  ·  confirm 1
> entry Break  ·  Both  ·  opposite: Close only
> ```
>
> The last line is a **build fingerprint** of the code that produced the file.
> Check it first:
>
> ```bash
> grep BUILD_ID Structure_Break_Strategy.pine
> ```
>
> **If the chart's build differs from the file's, TradingView is running an
> older compiled copy** and no setting you change will matter. That is a
> different problem from a setting having no effect, and the two are otherwise
> indistinguishable.
>
> Fixes, in order:
>
> 1. **Force a fresh compile.** In the Pine Editor, paste → **Save** → then
>    **Add to chart** to create a new instance. Remove the old one. Editing a
>    script that is already on the chart does not always recompile the running
>    instance.
> 2. **Check for duplicate saved scripts.** If you have both
>    `Structure Break Strategy v7.10` and `v7.11` saved, the chart may hold the
>    one you are not editing. The names look nearly identical in the list.
> 3. **Hard-refresh the browser** (`Cmd/Ctrl + Shift + R`). TradingView caches
>    compiled scripts more aggressively than you would expect.
> 4. **Check which script you edited.** If both the indicator and the strategy
>    are loaded they keep entirely separate settings, and only the strategy
>    drives the tester.
>
> When the EMA filter is on, the **trend EMA is drawn on the chart** — if you
> can't see a grey line, the filter isn't running.

| Symptom | Cause |
|---|---|
| Red **WRONG INSTRUMENT** label, no trades | Non-futures symbol with per-contract sizing. See above |
| Identical results after a settings change | The change didn't apply. See above |
| Cost label says *NOT VIABLE* | `Round-trip cost (ticks)` is wrong, or you're on a very low timeframe. MNQ should read ~5–8% at 5M |
| No trades at all | `Minimum score to signal` above 0, or the session window is wrong for your chart's timezone |
| Far fewer trades than expected | Session filter is working as intended — overnight structure is excluded |
| Huge outlier trade | Check the date against a contract roll on `MNQ1!` |
| Results change when you reload | You have `Recalculate on every tick` enabled in Properties. Turn it off |
