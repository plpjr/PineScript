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

### 1.5 ~~At full history the script stops drawing~~ — RETRACTED, this was a measurement error

**This section previously claimed the script renders no labels, lines or table
once ~5,000 bars are loaded. That is false and the claim was committed to this
repo before it was checked properly.**

What went wrong: drawing counts were read by walking
`_graphics._primitivesCollection[...].get(false)` directly. That path returns
zero for a study whose drawings live elsewhere, and it returned zero **at 400
bars too** — a bar count where the table was demonstrably on screen. The
method was broken, not the script. A "control test" against v7.12 appeared to
confirm the bug because it used the same broken method.

Verified afterwards with `data_get_pine_tables`, which reads drawings the way
TradingView does:

| Bars loaded | Status table |
|---|---|
| 400 | ✅ renders |
| **5,024** | ✅ **renders** |

**The indicator draws correctly at full history.** No drawing budget is being
exhausted and nothing needs fixing here.

Two things that did survive from the wreckage of this section:

- **Use `data_get_pine_tables`, not raw primitive walking.** The MCP tool knows
  where drawings live; hand-rolled DOM traversal does not.
- **A study mid-recalculation returns nothing and the previous frame stays on
  the canvas.** That genuinely does look like frozen output, and it is what
  produced the "v7.12 row labels under a v7.13 study" reading. Wait for the
  recalculation before concluding anything.

**Lesson worth keeping:** two independent-looking observations agreed because
they shared one broken instrument. Agreement between measurements is not
evidence when both run through the same faulty path.

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

## 1.7 The levels are good. The way they are traded is not.

Everything above measures the *score* and the *strategy*. This measures the
thing underneath both: **are the levels themselves worth anything?**

Run with [`tools/level_quality.js`](tools/level_quality.js) over the same
5,023 bars. Pivots are computed in JS so a sweep is one pass, with no
look-ahead (a pivot at bar *k* is only known at *k+L*; scanning starts after).
**n = 477 tested levels** — fifteen times the break sample, and the first
well-powered result this project has had.

### Swing length does not matter

| swingLen | tested | hold % | median ratio |
|---|---|---|---|
| 3 | 814 | 52% | 1.08 |
| **5** (default) | **477** | **53%** | **1.16** |
| 8 | 286 | 53% | 1.16 |
| 12 | 200 | 51% | 1.01 |
| 20 | 109 | 51% | 1.02 |
| 30 | 68 | 56% | 1.20 |

Flat from 3 to 30. **"Find more significant pivots" is not a lever** — it was
the obvious hypothesis and it is dead. The default of 5 is as good as anything.

### Entering *at* the level is a real, positive edge

Entry at the level on first revisit, fixed risk, net of MNQ commission
($1.50 round trip, $2/point):

| Stop | Target | Win % | Expectancy |
|---|---|---|---|
| 0.25 ATR | 2R | 32% | **−0.142 R** |
| **0.50 ATR** | **2R** | **41%** | **+0.184 R** |
| 0.50 ATR | 3R | 30% | +0.136 R |
| 1.00 ATR | 2R | 37% | +0.095 R |
| 1.50 ATR | 2R | 35% | +0.064 R (gross) |

**Positive expectancy across every sane configuration, with a genuine interior
optimum** — too tight (0.25 ATR) is killed by noise and cost, too loose (1.5
ATR) bleeds edge. An interior optimum is a good sign: pure artifacts are
usually monotonic.

Commission is **5.5% of risk** at a 0.5 ATR stop, well inside the 15% guard.

### What this means

**The strategy currently uses the worst configuration on that table.** It
enters on the *break* — far from the level, which forces a wide stop — and
ships a **1.5 ATR stop**, the lowest-expectancy row tested. Entering at the
level with a 0.5 ATR stop is roughly **3× the expectancy** of what ships.

So the ranking of problems inverts from §1.1–1.3:

1. The levels are fine. Detection is not the problem.
2. **Entry placement and stop distance are the problem**, and both are
   already parameterised — `entryTrigger` has an unused `"Retest"` option
   (`tools/strategy_tail.pine:39`).
3. The score is a separate, smaller issue: it does not rank, but it is not
   what is destroying the edge.

⚠️ **Caveats.** One symbol, 75 days, no slippage, and it assumes a limit order
at the level fills. It also measures *raw pivots*, without the session, volume
or score filters — so it is an upper bound on what the filtered version would
do, and a reason to check whether those filters help or hurt.

---

## 1.8 Goal audit — does the indicator do its four jobs?

Scope corrected here: **the indicator only.** The strategy is out of scope, and
so is score-as-predictor work. The four jobs are (1) detect swing structure
correctly, (2) mark the levels those pivots create, (3) describe each break
well enough to judge it, (4) show the context needed to act.

Measured on MNQ 15M, 5,027 bars (~75 days), v7.14 on defaults.

### Goal 1 — Detect swing structure · **PASS**

| | |
|---|---|
| Swing highs picked up as watch levels | **275 / 281 = 98%** |
| Swing lows picked up | **278 / 286 = 97%** |
| Detection lag | **median 5 bars, max 5** |

5 bars is `swingLen` — the theoretical minimum for a pivot(5,5), which cannot
be known until 5 bars after it forms. **There is no avoidable lag.**

The indicator also tracks levels my strict-pivot reference did not count (434
distinct watch highs vs 281 reference pivots), consistent with a more
permissive pivot definition. More inclusive, not less — not a miss.

### Goal 2 — Mark the levels · **PASS, with a relevance gap**

Levels are correct and independently validated (§1.7: 53% hold, positive
expectancy at n=477). But **how often is a marked level anywhere near price?**

| | Watch high | Watch low |
|---|---|---|
| Median distance | 1.71 ATR | 2.25 ATR |
| Within 1 ATR | **26%** | **18%** |
| Beyond 3 ATR | **29%** | **38%** |

**Roughly a third of the time neither live level is near price.** The levels
are right; they are just not always the relevant ones. Only two are shown, and
`Show internal structure` — the feature that would fill the gap — **ships
off**.

### Goal 3 — Describe each break · **MIXED**

- **Clearance is correct.** It is captured at the break bar, not the
  confirmation bar, so it differs from a naive recomputation at the label bar
  by ~0.36 ATR median. That is by design — clearance describes the break
  event — not an error.
- **The score is still the weak part** (§1.1–1.3). v7.14 spread it from
  64–100 to 57–100, but 78% still sit above 80.
- Break split over the window: **HH 3 · LL 9 · LH 8 · HL 12**.

### Goal 4 — Show context to act · **PASS since v7.14**

Price, test count, live distance, zones and approach alerts all present and
verified. Remaining gap is breadth, not depth: only one level each side.

---

## 1.9 Concerns, ranked

**1. Possible directional skew — the top watch item.** The indicator fired
**11 up / 21 down** (34% up-share) over a window whose *raw* structure is
balanced: 231 up-breaks vs 229 down-breaks, ratio 1.01, net move −0.91%.

⚠️ **Not significant: binomial p = 0.110 at n=32.** This is a suspicion, not a
finding, and it must not be treated as one. It is worth stating because it is
cheaply falsifiable — **if the same 34% up-share persists to n=60, p = 0.027
and it is real.** Check it before touching any filter.

**2. The relevance gap** (Goal 2 above): a third of the time nothing marked is
near price.

**3. Overnight breaks are never labelled.** The session filter ships on at
`0930-1600`, and **only 28% of MNQ bars fall inside it.** Levels still update
outside the session — detection is not gated — but a break that happens
overnight produces no label. The level silently changes. For futures, the
overnight high and low are exactly the levels people watch.

**4. The score still is not informative** and now carries a warning in the
wiki rather than a fix.

**5. Everything above is one symbol, one 75-day window.** Every count here is
small — 32 breaks. The level statistics (n=477) are the only well-powered
numbers in this document.

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

**Verified on the chart at full history** (§1.5 retraction): the rows read
`med 1.27 · win 59% · agg 1.22 (n=32)`, matching an independent Python
analysis of the same 32 breaks to the decimal. The instrument now agrees with
an outside calculation, which is the only reason to trust it.

**Still to do here:** the same median/win-rate treatment should be applied to
whatever reports pooled results in §2.2 — that is where it will actually be
read.

### 2.15 — Trade the levels the way the data says they work ← **now the top priority**

Promoted above everything else by §1.7, because it is the only change measured
to improve expectancy, and both halves are already built.

| | Ships today | Measured better |
|---|---|---|
| Entry | `Break` (market, on the break bar) | **`Retest`** — at the level |
| Stop | 1.5 ATR | **0.5 ATR** |
| Expectancy | +0.064 R | **+0.184 R** |

Two runs, one variable each, against the current baseline:

1. `entryTrigger = "Retest"`, stop unchanged. Isolates entry placement.
2. Then stop 1.5 → 0.5 ATR. Isolates risk distance.

**Predicted:** run 1 cuts adverse excursion (the median break has MAE 1.53 ATR
against a 1.5 ATR stop — a coin flip by construction); run 2 raises expectancy
most. **If retest entry does not reduce MAE, §1.7 does not transfer to the
filtered signal set and that is worth knowing immediately.**

Change these by editing the `input.*` defaults and re-pasting — never
`indicator_set_inputs`.

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
