# PineScript project — complete brief

Self-contained context for an agent picking this up cold. Everything here is
either read from the source or measured on live data; where something is
assumed rather than measured, it says so.

**Repo:** `~/Documents/PineScript` (git, pushed to `plpjr/PineScript`)
**Instrument under test:** MNQ (Micro E-mini Nasdaq-100) futures, 15-minute
**Last verified:** MNQ 15M, 5,235 bars, 2026-05-31 → 2026-08-18 (79 days)

---

## 1. What this is

Two TradingView Pine v5 indicators for reporting calculated market structure
and price-region information. The repository intentionally contains no trading
strategy or order-generation code.

| File | Purpose | Version | Lines | Inputs |
|---|---|---|---|---|
| `Structure_Break_Signals.pine` | Guided facts-only pivots, breaks, active structure, sessions, level/event evidence, and exports | **v8.4** | 1,603 | **46** |
| `Key_Zone_Map.pine` | Zones: swing zones, order blocks, FVGs, liquidity pools, confluence | **v1.7** | 1,158 | 45 |
| `tools/tv_paste.js` | Pastes a `.pine` into TradingView over CDP | | 86 | |
| `tools/tv_export_bars.js` | Exports chart bars to JSON over CDP | | 61 | |
| `tools/level_quality.js` | In-page level-quality harness | | 106 | |

User-facing docs are in `wiki/` (15 pages). `HANDOFF.md` and `PLAN.md` are
working documents with fuller history than this brief.

### Division of responsibility

- **Structure Break Signals — events in time.** *What is the trend doing, and
  what must break next?*
- **Key Zone Map — regions in price.** *Where are the areas of interest, and
  how much independent agreement does each have?*

Test when unsure: a break happens at an instant → Structure Break Signals. A
zone persists across bars → Key Zone Map.

Persistent price regions remain Key Zone Map's responsibility. Structure Break
Signals contains only event-time structure, active pivot levels, and bounded
records of previously broken levels for objective return detection.

---

## 2. Product boundary

The project ships indicators only. They may report confirmed events, exact
prices, distances, timestamps, counts, and other directly calculated chart
facts. They must not place orders, backtest a trading system, predict price, or
recommend a trading action.

---

## 3. What is actually verified

### Detection is excellent — and was never the problem

Levels come from one rule, `ta.pivothigh(high, 5, 5)` / `ta.pivotlow(low, 5, 5)`.
The only inputs are the `high` and `low` series; ATR is used to *measure*
distances, never to *find* levels.

| | Result |
|---|---|
| Swing highs becoming watch levels | **275 / 281 = 98%** |
| Swing lows | **278 / 286 = 97%** |
| Detection lag | **median and max = 5 bars = `swingLen`** |

5 bars is the theoretical minimum — a pivot cannot be known until 5 further
bars have printed. There is no avoidable lag. Anything claiming instant swing
marking is repainting or using a different definition.

### The levels do not predict reactions

This is the central negative result and it governs everything else.

Method: for each candidate level, find the first revisit, then measure whether
price moved away from it more than through it over the next 10 bars. **Paired
against a placebo** — the identical test at a price shifted ±1.5 ATR off the
level, so market, moment and volatility are controlled.

| Definition | n | Level | Placebo | Edge | ±2se |
|---|---|---|---|---|---|
| **swing pivot 5** (what the script uses) | 523 | 49% | 55% | **−5.9** | 5.6 |
| **swing pivot 10** | 277 | 49% | 57% | **−8.5** | 7.2 |
| swing pivot 20 | 141 | 55% | 58% | −3.5 | 9.8 |
| prior day high/low | 117 | 54% | 57% | −3.0 | 11.0 |
| prior RTH high/low | 93 | 53% | 52% | +0.5 | 12.4 |
| overnight high/low | 101 | 57% | 53% | +4.5 | 11.6 |
| RTH open | 60 | 48% | 55% | −6.7 | 15.2 |
| round 100 | 35 | 66% | 66% | 0.0 | 20.4 |
| round 50 | 69 | 70% | 63% | +6.5 | 13.6 |
| volume nodes | 40 | 55% | 55% | 0.0 | 27.8 |

**No definition beats its own placebo. The two in use are significantly
negative** — price reacts *less* at a swing pivot than at an arbitrary nearby
price. Mechanically plausible: a swing high is where stops sit, so price is
drawn through it rather than repelled by it.

⚠️ **A prior run without the paired control was invalid** and reported round
numbers at 66–70% as winners. Their placebo is 63–66%. The unpaired metric was
measuring mean-reversion, not level-respect — a random control read 60%, which
is what exposed the error. **Never evaluate a level definition without a
matched placebo.**

### Nothing separates a "good" level from a bad one

Four attributes tested against hold rate. All null.

| Attribute | Result |
|---|---|
| Times already tested | 51 / 51 / 53 / 50% across touches 1–4 (n=327–409) |
| Leg size that created it | 48 / 56 / 46 / 54% by quartile (n=102 each) |
| Age of the level | 53 / 46 / 49 / 56% by quartile |
| Swing length | 51–56% from `swingLen` 3 to 30 |

Consequence: **there is no measured basis for ranking levels by "importance".**
Any such filter would be an aesthetic choice presented as significance. Levels
are currently selected by **proximity to price**, which claims nothing.

### The confidence score does not work

A 0–100 score from six weighted components (clearance 30, displacement 25, body
15, volume 15, leg size 15, follow-through 10).

- **Degenerate distribution:** over 32 breaks the score ran **64–100**, median
  88.5, 84% above 80, nothing below 60. v7.14 raised two thresholds; it now
  runs 57–100 with 78% above 80. Improved, not fixed.
- **No relationship to outcome:** Spearman **−0.18**, permutation **p = 0.34**
  over 20,000 shuffles. Win rates flat across terciles (6/10, 6/10, 7/12).
- Five of six components describe the same breaking candle, so a high score
  largely means "price has already moved", i.e. a late entry.

**Do not treat a 94 as better than a 78.** The ATR clearance on the label is
the number that actually varies and is measured directly.

### Sample size is the binding constraint

Breaks arrive about **once every 157 bars** — 32 in 5,000 bars. Validating a
0–100 score needs hundreds. One symbol cannot supply that from available
history. **Pooling across the watchlist (ES, MES, MNQ, MCL, HG, SI, MGC) is the
only route to statistical power.** This is the highest-value unstarted task.

### Historical strategy research, for context only

The former strategy and its tooling have been removed. These historical results
remain only as evidence of why no trading claims are made by the indicators.

| | 1h, Jan 2025 – Aug 2026 | 15M, ~8 days |
|---|---|---|
| Trades | 111 | 32 |
| Profit factor | 1.041 | 1.127 |
| **Max drawdown** | **59.0%** | 22.5% |
| Sharpe | 0.076 | 0.046 |
| Buy and hold | +$16,668 vs strategy +$983 | −$1,183 |

Profit factor crossed 1.0, but a 59% drawdown on a 9.8% return is not
tradeable and buy-and-hold beat it 17×. **Drawdown, not profit factor, is the
number to optimise** if strategy work resumes.

---

## 4. Current display (v8.4 defaults)

On by default: confirmed pivot labels; dotted active high/low lines with exact
price, ATR distance, and approach count; the guided Standard dashboard; factual
broken-level return markers; active-level stronger/weaker evidence; post-break evidence collection; and transition
alerts. Confirmed break labels are off by default, while a bounded history of
break lines remains available.

`Structure profile = Custom` preserves the numeric event definition. Fast,
Standard, and Broad expose their effective values in the dashboard. Compact
reduces the dashboard to immediate context; Research restores every v8.2 fact
and the separate cohort table. Session rows are hidden by default for
market-neutral use, while session calculations and exports continue.

---

## 5. Known limits, in priority order

1. **Evidence is descriptive and in-sample.** The break cohort and non-break
   baseline come from the loaded chart history. A difference is not proof that
   it will persist on a new symbol or future period.
2. **Baseline matching is necessarily narrower than full event matching.** A
   non-break bar has no pivot relationship, clearance, volume-at-cross, or
   confirmation delay. It can be matched only by mirrored direction, session,
   and ATR regime.
3. **Rare event count remains the binding constraint.** The table withholds
   statistics until the configured minimum, but even 20 observations is useful
   context rather than strong statistical validation. Pooling exports across
   symbols and out-of-sample periods remains the best research next step.
4. **Overnight facts require overnight bars.** They correctly remain blank on
   a regular-session-only chart; the indicator never fabricates missing data.
5. **Intrabar ordering is unknowable from OHLC bars.** When favorable and
   adverse thresholds both occur in one candle, first-hit evidence is recorded
   as same-bar ambiguous rather than guessing which came first.
6. **The script uses all 64 permitted plot-count consumers.** New alert
   conditions or export plots require consolidating or removing an existing
   one.
7. **Key Zone Map's hit rates are computed from the same chart history shown**,
   i.e. in-sample by construction. Given §3's paired result, they should be
   validated out-of-sample before being relied on. Its internal maths has
   **not** been verified the way Structure Break Signals has.
8. **Possible directional skew, unconfirmed.** The earlier indicator fired 11 up / 21
   down over a window whose raw structure was balanced 231/229 with net move
   −0.91%. Binomial **p = 0.110 at n=32 — not significant.** If the same 34%
   up-share holds to n=60, p = 0.027 and it is real. Cheap to check; do it
   before touching any filter.

---

## 6. Working with the live chart

TradingView **Desktop** + `tradingview-mcp` over CDP on port 9222. The Chrome
extension and Playwright web routes are abandoned — do not revive them.
Third-party clone lives at `~/Documents/tradingview-mcp` (treat as a
dependency, not project source).

### Paste code without spending context

```bash
NODE_PATH=~/Documents/tradingview-mcp/node_modules \
  node tools/tv_paste.js Structure_Break_Signals.pine
```

Replays the source as a `paste` event because Monaco handles paste itself and
this build exposes no `window.monaco`. **`dispatched: false` means success** —
Monaco called `preventDefault` and took the content. Then click the editor's
**Update on chart** / **Add to chart** button; that also saves to the cloud.

### Analyse off-browser — do this, not in-page JS

```bash
NODE_PATH=~/Documents/tradingview-mcp/node_modules \
  node tools/tv_export_bars.js /tmp/bars.json
```

Then analyse in Python. **An unbounded loop inside `ui_evaluate` froze
TradingView's renderer so hard that `Runtime.terminateExecution` could not
recover it** — the tab had to be closed from the browser process via
`/json/close/<targetId>` and reopened. Extracting once and analysing on disk
removes that entire failure mode.

### Loading history

Use `timeScale().scrollToFirstBar()` in a **bounded** loop (~14 passes, 900ms
apart). 8 days → ~75 days at 15M. **Re-add the study afterwards** — a study
only computes over bars loaded when it was added.

⚠️ The Date Range buttons (1D/3M/1Y) **force their own timeframe** — 3M
switches to 1h, 1Y to 1D. Always re-check `chart_get_state` after using them.

### MCP tools that are broken or dangerous

| Tool | Problem |
|---|---|
| `indicator_set_inputs` | **Corrupts the study** → `Can't parse pine`. Never use. Change settings via the settings dialog |
| `ui_open_panel('pine-editor')` | Reports success, does nothing. The editor is a dialog: `data-name="pine-dialog-button"` |
| `pine_new`, `pine_get_console` | Fail unless the editor dialog is already open |
| `data_get_study_values` | 51KB of encrypted blobs on these scripts. Context hazard |
| `data_get_equity` | No per-bar curve; buy-and-hold baseline only |
| `pine_analyze` | Reported 0 issues on an unguarded `array.get` on an empty array |
| `alert_*` | `tv_discover` shows `alertService` unavailable |

**Read drawings with `data_get_pine_tables` / `_labels` / `_lines` / `_boxes`.**
Hand-rolled traversal of `_graphics._primitivesCollection` returns **false
zeros** — it once produced a fabricated "the script stops drawing at 5,000
bars" finding that was committed before being checked. A study mid-recalculation
also returns nothing while the previous frame stays on the canvas, which looks
identical to frozen output. Wait for the recalculation.

---

## 7. Pine gotchas that have caused real bugs here

- **`and` / `or` do not short-circuit.** `array.size(x) > 0 and array.get(x,0)`
  still calls `array.get` on an empty array. Use nested `if`.
- **Ternaries evaluate both branches.** `array.median` on an empty array is an
  error even when guarded by `size > 0 ?`. Use `if`.
- **`ta.*` must run every bar.** Behind a ternary or `if`, internal state
  desynchronises. Compute unconditionally, select after.
- **No comma-separated declarations.** `float a = na, b = na` is invalid.
- **`plotshape(size=)` needs a `const string`.** An input-derived value fails
  silently.
- Indentation is **4 spaces**, no tabs.
- Bar indices can be **negative** when history is loaded — a `touch < 0`
  sentinel silently rejected every real result once.
- Drawing caps: `max_lines_count` 500, `max_labels_count` 500,
  `max_boxes_count` 500.

---

## 8. Verification before any commit

```bash
cd ~/Documents/PineScript
python3 -c "
for p in ['Structure_Break_Signals.pine','Key_Zone_Map.pine']:
    s=open(p).read()
    print(p,'parens','OK' if s.count('(')==s.count(')') else 'MISMATCH',
          '| tabs','none' if chr(9) not in s else 'FOUND')"
```

Documented defaults in `wiki/` must match the actual `input.*` declarations.

---

## 9. What to do next

**If continuing research:**
1. **Pool levels across symbols** (§3) — the only route to statistical power,
   and it gates every other empirical question.
2. **Confirm or kill the directional skew** (§5.9) — cheap, falsifiable at n=60.
3. **Test level definitions not yet tried** — equal-high/low clusters, FVG
   edges, order blocks, HTF levels, VWAP. Always paired against a placebo.
4. **Investigate the negative edge.** If pivots are reacted-at *less* than
   nearby prices, the inversion may be the finding: mark them as sweep targets
   rather than walls. Needs out-of-sample confirmation on a second symbol.

**If continuing product work:**
1. Export multiple symbols and future periods, then validate whether any
   v8.4 event cohort differs consistently from its matched baseline.
2. Profile the two last-bar evidence scans on charts using the maximum sample
   caps before increasing either bound.
3. Decide which existing Data Window field can be consolidated before adding
   another; v8.4 uses all 64 plot-count consumers.
4. Keep persistent price regions in Key Zone Map rather than recreating them
   inside the event indicator.

**Process lessons paid for the hard way:**
- Change one thing at a time. Five simultaneous "fixes" once made results 4×
  worse with no way to attribute it.
- Check the arithmetic before tuning. Two rounds were spent tuning exits on
  EUR/USD 5M where commission was 55% of risk — the trade was impossible before
  it started.
- Suspect your own instrument before the thing being measured. A "the script
  stops drawing" finding, a placebo that beat every real level, and a
  round-number result that evaporated under pairing were all measurement bugs.
- Agreement between two observations is not evidence when both run through the
  same broken code path.
