# Improvement Plan

**Working document.** Written after the first session in which the measurement
tooling actually worked end to end. [`HANDOFF.md`](HANDOFF.md) carries session
state; this carries direction.

Every number below was measured, not assumed. Where a test overturned an
earlier claim, the earlier claim is marked retracted rather than quietly
edited — the retractions are the most useful part of this file.

---

## 0. The one-paragraph version

The tooling problem is solved: history loads, the strategy tester is readable,
and code goes from this repo to a compiled chart study without anyone pasting
anything. What that revealed is that **the measurement the whole project rests
on was not trustworthy**, and once it was made trustworthy, **there is not
enough data to answer the question it was built to answer.** Both are fixable.
Neither is fixed by tuning parameters, which is what the previous five sessions
kept reaching for.

---

## 1. What was actually measured

MNQ 15M, 5,020 bars (~75 days, 2026-05-31 → 2026-08-14), strategy v7.12,
build `a3d0963c` confirmed on the chart label, all defaults, `Minimum score` 0.

The per-break dataset — 32 rows of (score, forward MFE, forward MAE) — was
pulled directly out of the study's data cache rather than read off a table.

### 1.1 The score distribution is degenerate — confirmed

| | |
|---|---|
| Range | **64 – 100** |
| Median | **88.5** |
| Share ≥ 80 | **84%** |
| Share < 60 | **0%** |

Nothing scores below 64. This is exactly the failure mode
[`wiki/Confidence-Score.md`](wiki/Confidence-Score.md) warns about:

> *"Watch for a degenerate distribution. If almost everything scores 85+, the
> score isn't discriminating and the cutoff will be meaningless."*

It is not a new discovery. It is a documented prediction that has come true,
and it explains why the shipped split of 60 produced an **empty** low bucket.

### 1.2 The score's relationship to outcome is unmeasurable at this n

| Test | Result |
|---|---|
| Spearman, score vs MFE/MAE ratio | **−0.176** |
| Permutation test (20,000 shuffles) | **p = 0.335** |
| Same, dropping the largest outlier | −0.130 |
| Win rate by tercile (ratio > 1) | 6/10 · 6/10 · 7/12 |

**No relationship, in either direction.** The win rates are flat across
terciles, and p = 0.335 means a correlation this size arises from noise a third
of the time.

⚠️ **Retraction.** An earlier reading of this session reported the top bucket at
**1.30** and treated it as encouraging; a later one reported **1.01**. A
draft of this file briefly described the score as *inverted*, on the strength
of terciles reading 2.25 / 1.02 / 0.89. **All of that was noise.** The tercile
ordering reverses when the median is used instead of the aggregate (below), and
the correlation is not significant. None of those three claims should be
repeated.

### 1.3 The diagnostic's own statistic was the problem

The ⑬ rows reported `sum(MFE) / sum(MAE)`. That is dominated by its largest
sample — and one break in this window ran **11.3 ATR** in its favour.

| Score tercile | Aggregate ratio | **Median ratio** |
|---|---|---|
| low (64–84) | 2.25 | 1.48 |
| mid (85–90) | 1.02 | 1.10 |
| high (90–100) | **0.89** | **2.06** |

**The same 32 breaks support opposite conclusions depending on which statistic
you read.** Every conclusion drawn from these rows in every prior session
rested on the fragile one.

**Fixed in v7.13** — the rows now lead with median and win rate, and the cell
colour keys off the median. See §2.1.

### 1.4 There are not enough breaks

**32 breaks in 5,020 bars — one per 157 bars.** At 15M that is roughly one
break every six trading days.

This is the constraint that governs everything else. Ranking a 0–100 score
needs hundreds of events, and:

- 75 days is already near what TradingView will load at 15M on this account.
- Reaching n ≈ 300 on one symbol would need ~2 years of 15M history.
- Therefore **no amount of patience on MNQ alone will validate the score.**

### 1.5 At full history the script stops drawing — read the plots, not the table

Discovered while verifying v7.13, and **confirmed not to be caused by it**:

| Bars loaded | Plot output | Labels / lines / **status table** |
|---|---|---|
| ~412 | ✅ | ✅ |
| **5,020** | ✅ all 5,020 rows | ❌ **zero** |

A control test re-pasting **v7.12 unchanged** produced the same zero drawings
at 5,020 bars, so this is an environmental limit — almost certainly the script
exhausting its drawing budget over 75 days of structure — not a regression.
The study reports no error; it simply renders nothing and the last good frame
stays on the canvas, which looks exactly like frozen output.

**Two consequences, both important:**

1. **The ⑬ status rows cannot be read at the bar counts that give statistical
   power.** The table works only on short history — precisely where n is too
   small to mean anything. The rows are a chart convenience, not the
   measurement channel.
2. **The measurement channel is the plot data cache** (§4), which stays
   correct at 5,020 bars. Every number in §1.1–1.3 came from there. All
   pooled collection in §2.2 must use it.

This also retro-explains a stale-looking reading earlier in the session: a
table showing v7.12 row labels under a study named v7.13 was leftover canvas,
not a stale computation.

### 1.6 What the backtest says, for context

| | 1h, Jan 2025 – Aug 2026 | 15M, ~8 days |
|---|---|---|
| Trades | 111 | 32 |
| Profit factor | 1.041 | 1.127 |
| **Max drawdown** | **59.0%** | 22.5% |
| Sharpe | 0.076 | 0.046 |
| Buy and hold | **+$16,668** vs strategy +$983 | −$1,183 |

Profit factor crossed 1.0 for the first time. It does not mean much: a 59%
drawdown for a 9.8% return is not tradeable, Sharpe is ≈ 0, and doing nothing
beat it 17×. **Drawdown, not profit factor, is the number to optimise.**

The cost and instrument guards do now pass — `cost 2.3% of risk — workable`,
`1 contract = $60,175`. The arithmetic failures of runs 1–5 are behind us.

---

## 2. The plan

Ordered so that each step is only attempted once the thing it depends on is
known to work. **Steps 1 and 2 are about trusting the instrument. Nothing
below step 3 is worth doing before they are done.**

### 2.1 — Make the instrument trustworthy ✅ done (v7.13)

Median + win rate on the ⑬ rows, colour keyed to the median, and a
divide-by-zero guard for breaks that never traded against you.

**Why first:** §1.3. Tuning against a statistic that flips sign on one outlier
generates confident nonsense.

⚠️ **Caveat from §1.5:** these rows only render on short history, where n is
too small to act on. The fix makes the *chart* honest; it does not make the
chart the place to measure. Analysis runs off the plot cache.

**Still to do here:** the same median/win-rate treatment should be applied to
whatever reports pooled results in §2.2 — that is where it will actually be
read.

### 2.2 — Fix the sample-size problem by pooling symbols

The single highest-value step, because it gates every empirical question.

The watchlist already holds **ES, MES, MNQ, MCL, HG, SI, MGC, VIX, EURUSD**.
At ~32 breaks each, eight instruments give **~250 breaks** — enough to say
something real.

Mechanics, all proven this session:

1. `chart_set_symbol`, pull history with the `scrollToFirstBar()` loop (§4).
2. Re-add the study so it computes over the full loaded range.
3. Extract the per-break rows from the study data cache (§4).
4. Pool, then analyse offline in Python where medians, permutation tests and
   held-out splits are cheap.

**Kill criterion:** if the pooled Spearman is still indistinguishable from
zero at n ≈ 250, the score does not rank breaks and should be demoted from
"confidence score" to a descriptive label. That is a legitimate outcome and it
should be reported plainly, not tuned around.

### 2.3 — De-degenerate the score

Only meaningful once §2.2 gives the power to detect a change.

The wiki's own prescription, applied one variable at a time:

| Change | From | To |
|---|---|---|
| `Full marks · clearance` | 0.40 | 0.60 |
| `Full marks · candle range` | 1.20 | 1.50 |

Make these by **editing the `input.*` default in the source and re-pasting**,
never through `indicator_set_inputs` (it corrupts the study) and preferably not
through the settings dialog (its DOM indices shift when inputs are added).

**Success looks like:** scores spread across 40–100 instead of 64–100, and a
non-empty low bucket at the shipped split.

### 2.4 — Test the detector, not just the grader

A grader can only sort what the detector hands it. The next question after
§2.2 is whether a break is a better-than-nothing starting point at all.

Add a **control** to the ⑬ machinery: the same forward MFE/MAE measured from
bars that are *not* breaks. If break excursions match the unconditional
baseline, the detector adds nothing and the work belongs in
`⑤ Swing engine` / `③ Break quality filters`, not the score.

This is the test that says whether the project's premise holds.

### 2.5 — Fit the weights instead of choosing them

The weights `30/25/15/15/15/10` were reasoned, never fitted, and the wiki notes
components 1–3 are mutually correlated — 70 of 100 points describing the same
candle from three angles.

With a pooled dataset, export each component separately and fit. Even a simple
regression will say which components carry signal. Expect 1–3 to collapse into
roughly one factor.

**Guardrail:** fit on one subset, report on another. With ~96 inputs, anything
fitted and reported on the same data is meaningless.

### 2.6 — Change the objective to drawdown

Once the score question is settled, retarget the strategy work: minimise
drawdown at PF ≥ 1 rather than maximise PF. Run 6 is the argument.

---

## 3. Risks I am most worried about

**Overfitting is now the dominant risk.** The loop is fast enough to try
dozens of variants per session against ~115 events and ~96 inputs. That
combination reliably produces results that look excellent and generalise not
at all. Mitigations, in order of importance:

1. **Held-out data on every claim.** Tune on one subset, report on another.
2. **Pool symbols before tuning** (§2.2) — more events is the only real fix.
3. **One change at a time**, per §8 of the handoff.
4. **Prefer to reduce the parameter surface**, not extend it. ~96 inputs is
   itself a liability.

**The honest failure mode to keep open:** that structure breaks on MNQ 15M
carry no exploitable edge, and the correct output of this project is a
well-built descriptive indicator plus a clear statement that it should not be
traded mechanically. §2.2 and §2.4 are designed so that answer can actually
surface rather than being tuned away.

---

## 4. Reproducible mechanics

Everything here was verified this session. Full tool audit in
[`HANDOFF.md` §5a](HANDOFF.md).

**Load history** (Date Range buttons are unusable — they force their own
timeframe; 3M → 1h, 1Y → 1D):

```js
const ts = window._exposed_chartWidgetCollection
  .activeChartWidget.value().model().model().timeScale();
let i = 0; (function tick(){ ts.scrollToFirstBar();
  if (++i < 12) setTimeout(tick, 900); })();
```

8 days → **75 days** at 15M. Re-add the study afterwards: a study only
computes over the bars loaded when it was added.

**Paste code without spending context:**

```bash
NODE_PATH=/Users/plpjr/Documents/tradingview-mcp/node_modules \
  node tools/tv_paste.js Structure_Break_Signals.pine
```

**Extract the per-break dataset** (plot indices differ between the indicator
and the strategy — read them from `metaInfo().styles` rather than assuming):

```js
const st = cw.model().model().dataSources()
  .find(x => /Structure/.test(String(x.title())));
// value[0] is time; value[i+1] is plot_i
st._data._items.filter(r => r.value && isFinite(r.value[31]))
  .map(r => [r.value[31], r.value[29], r.value[30]]);  // score, MFE, MAE
```

⚠️ **Never use `indicator_set_inputs`** — it puts the study into
`Can't parse pine`.
