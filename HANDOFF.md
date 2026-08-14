# Session Handoff

**Working document, not user docs.** Everything a fresh session needs to pick
this up without re-deriving it. User-facing documentation lives in
[`wiki/`](wiki/Home.md).

Last updated at commit `ed84bca`.

---

## 1. What this project is

Two companion TradingView Pine v5 indicators plus a generated backtest
strategy, run on **MNQ futures** (Micro E-mini Nasdaq-100).

| File | Purpose | Version |
|---|---|---|
| `Structure_Break_Signals.pine` | Grades structure **break events** — HH/LL/LH/HL with a 0–100 confidence score | **v7.12** |
| `Key_Zone_Map.pine` | Maps support/resistance **zones**, confluence, historical hit rates | **v1.7** |
| `Structure_Break_Strategy.pine` | **GENERATED** backtest strategy — never edit directly | v7.12, build `a3d0963c` |
| `tools/build_strategy.py` | Generates the strategy from the indicator | |
| `tools/strategy_tail.pine` | Trade logic appended by the generator | |
| `tools/SETTINGS_TEST.pine` | Throwaway diagnostic (see §5) | |

**The user maintains the code and does all pasting into TradingView.** They
have said so explicitly — do not tell them to run `build_strategy.py`, that's
our job.

### Auto-push

There is a standing instruction (memory: `feedback-pinescript-autopush`) to
**commit and push to `plpjr/PineScript` after changes without asking.** Every
change so far has been pushed. Keep doing that.

---

## 2. How the strategy generation works

`indicator()` and `strategy()` are mutually exclusive declarations, so the
strategy must be a separate file. Hand-maintaining ~2,000 duplicated lines
would guarantee drift, and a drifted strategy is worse than none — it would
measure something other than what the indicator does while looking
authoritative.

```
python3 tools/build_strategy.py           # write
python3 tools/build_strategy.py --check   # exit 1 if stale (use in verification)
```

The generator makes exactly three changes:

1. `indicator(...)` → `strategy(...)` with futures-appropriate settings
2. Drops `alertcondition(...)` lines — **Pine rejects these in strategy scripts**
3. Appends `tools/strategy_tail.pine`

It also injects `BUILD_ID`, a SHA of indicator+tail, displayed on the chart
label. **This is the check for "is TradingView running the code I just
pasted?"** — that question came up repeatedly and was unanswerable without it.

Deterministic: no timestamps, so re-running reproduces byte-identical output.

---

## 3. Backtest history — every run, in order

This is the most important section. Each run taught something specific.

### Run 1 — EUR/USD 5M, stop-and-reverse bug present

| | |
|---|---|
| Trades | 144 over 24 days |
| Win rate | 30.56% |
| Profit factor | **0.528** |
| Avg win / loss | +0.05% / −0.05% (**1:1**) |
| Net | −$2.53 on 1K capital |

**Findings:**
- Commission $2.88 **exceeded the entire net loss** — gross was roughly flat
- Avg win = avg loss despite a 2R target → target never reached

**Diagnosis:** `strategy.entry()` in the opposite direction *reverses* an open
position. With `Trade direction = Both`, every opposite break flipped the trade
before the target could be hit. An accidental stop-and-reverse system. Fixed by
adding explicit `On an opposite signal` (Close only / Reverse / Ignore).

### Run 2 — EUR/USD 5M, my "fixes" applied

Turned on breakeven at 1R, 2 ATR trail, 20-bar time exit, 3/day cap — **all at
once**.

| | Run 1 | Run 2 |
|---|---|---|
| Trades | 144 | 56 |
| Win rate | 30.56% | **16.07%** |
| Profit factor | 0.528 | **0.135** |
| Avg win | +0.05% | **+0.02%** |
| Payoff | 1:1 | **1:2** |
| Gross | +$0.35 | **−$38** |

**Much worse.** A 2 ATR trail exits on ordinary retracement at 5M; breakeven at
1R converts would-be 2R winners into scratches. Winners halved, losers
unchanged.

**Two process failures, both mine:**
1. Changed five things at once — my own docs say don't
2. Reasoned ahead of data and was wrong

All management features reverted to OFF and remain so.

### Run 3 — the real problem: cost arithmetic

Trade list revealed the instrument was **EUR/USD 5M**:

| | |
|---|---|
| ATR | ~2.8 pips |
| Stop (1.5 × ATR) | ~4.1 pips |
| Commission round trip | **2.3 pips** |
| **Cost ÷ risk** | **55%** = 0.83 ATR |

**The trade was arithmetically impossible before it started.** No entry logic,
exit rule or sweep could have fixed it. Also: **22 of 49 trades had zero
favorable excursion** — price never ticked in the trade's direction, the
signature of entering at the exact turn.

Led to: cost viability guard (blocks entries above 15% cost-to-risk), and
retargeting the declaration at micro futures.

### Run 4 — MNQ 15M baseline ← **the reference point**

Apr 30 – Aug 5 2026, defaults as shipped in v7.11, `Minimum score = 0`.

| | |
|---|---|
| Trades | 52 |
| **Profit factor** | **0.855** |
| Win rate | 32.69% (17/52) |
| Avg win / loss | +0.77% / −0.46% = **1.67 : 1** |
| Avg bars in trade | 18 |
| Commission | $78 — **5.7% of the loss** (was 100%+) |
| Net | −$1,373.50 (−13.73%) |
| Max drawdown | $4,107.75 (**38.94%**) |
| Buy and hold | **+37.03%** |

**Cost problem solved. Payoff structure works.** At 1.67:1, breakeven needs a
**37.4% win rate**; at 32.69% the gap is **4.7 percentage points** — two or
three trades out of 52.

**Direction split** (partial, from visible trades):

| | Trades | Win rate | Net |
|---|---|---|---|
| Long | 6 | 67% | +$1,035 |
| Short | 16 | 31% | −$857 |

**The strategy is fighting the trend.** ⚠️ **This finding is confounded** —
MNQ rose 37% in this window, so "shorts lost" and "the market went up" are the
same fact. Long-only would look brilliant and be pure curve-fitting. The
principled response is trend alignment, which works both directions.

### Run 5 — EUR/USD again, units mismatch

User was still on the EUR/USD chart after the declaration switched to
futures sizing. 29 trades, **0 winners**, every net PnL exactly −$1.50.

`1 contract` on EUR/USD = **one euro** = $1.15 position paying $1.50
commission = 130% of notional. Meaningless output that looks identical to
catastrophic failure.

Led to: instrument sanity guard — blocks entries and shows a red
**WRONG INSTRUMENT** label when contract value < $1,000.

---

## 4. THE BLOCKING PROBLEM — settings do not apply

**This is where the session stalled and what to solve first.**

After the MNQ baseline, **every settings change produced byte-identical
results** — same 52 trades, same 0.855 profit factor, same trade 52
(Aug 5 16:15 short → 18:30, −196.5).

The user enabled `Only signal with EMA trend` multiple times, re-pasted code,
and re-added the script. No change.

### What has been ruled out

**Not a code bug.** Traced the full chain in the generated strategy:

```
line  544   mUseTrendFilter = input.bool(false, "Only signal with EMA trend")
line 1193   trendOkUp   = not mUseTrendFilter or close > emaVal
line 1202   candUp = rawUp and ... and trendOkUp and inSession
```

Enabling it **must** reduce candidates. `emaVal` is defined at line 857, not
shadowed, not reassigned.

**Not the two-scripts confusion.** User confirmed only one script on the chart.

### Diagnostics built to isolate it

| Tool | What it answers |
|---|---|
| **`BUILD_ID` on the chart label** | Is TradingView running the pasted code? Compare to `grep BUILD_ID Structure_Break_Strategy.pine` |
| **Settings echo on the label** | What does the running script think its settings are? Shows EMA trend, session, volume, min score, confirm bars, entry, direction, opposite action, HTF filter, daily stop |
| **Trend EMA plotted** when filter is on | Visual confirmation the filter is live |
| **`tools/SETTINGS_TEST.pine`** | 70-line standalone strategy, one toggle that *must* change trade count. Isolates TradingView vs. our code |

### Never answered — ask for these

1. **What does the "Script execution ①" badge say?** Visible in every
   screenshot the user sent. Asked three times, never answered. **A runtime
   error would explain frozen results completely.** This is the highest-value
   unknown.
2. **What BUILD_ID does the chart show?**
3. **Did `SETTINGS_TEST.pine` respond to its toggle?**

---

## 5. TradingView MCP — installed, needs a restart to activate

Installed this session to make the feedback loop debuggable.

| | |
|---|---|
| Repo | [`tradesdontlie/tradingview-mcp`](https://github.com/tradesdontlie/tradingview-mcp) — 5.6k stars |
| Location | `~/Documents/tradingview-mcp` |
| Registered at | `~/.claude/.mcp.json` |
| Dependencies | Installed. **7 vulnerabilities found, all patched** via `npm audit fix` — clean |

### Remaining steps

1. **User must run** (Claude Code's classifier blocks it — it kills processes
   and launches an app):
   ```
   ! ~/Documents/tradingview-mcp/scripts/launch_tv_debug_mac.sh
   ```
   Kills TradingView, relaunches with `--remote-debugging-port=9222`.
   ⚠️ **Unsaved Pine editor work is lost** — warn first.

2. **Restart Claude Code** — MCP servers only load at startup.

3. Verify with `tv_health_check`.

### Tools that matter for our problem

Read `~/Documents/tradingview-mcp/CLAUDE.md` — it has a full decision tree.
The relevant ones:

| Tool | Use |
|---|---|
| `data_get_pine_tables` | **Read the status table as data** — including the ⑬ signal-quality rows. No more screenshot squinting |
| `pine_set_source` / `pine_smart_compile` / `pine_get_errors` | Paste and compile directly, read errors |
| `chart_manage_indicator` | Add/remove indicators — cleanest way to force a fresh compile |
| `ui_open_panel` → `strategy-tester` | The tester **is** reachable, contrary to what the README implied |
| `capture_screenshot` region `strategy_tester` | Read backtest results |
| `tv_launch`, `tv_health_check` | Connection management |

**Context rules from its CLAUDE.md:** always `summary: true` on
`data_get_ohlcv`; use `study_filter` on pine tools; **avoid `pine_get_source`**
on our scripts (200KB+).

⚠️ The debug port gives any local process full control of the TradingView
session. Fine while working; relaunch normally afterward.

---

## 6. The other open question — is the score real?

Independent of the settings bug. **The confidence score has never been
validated.** Everything in the wiki assumes it ranks breaks correctly.

### The clean measurement — `⑬ Signal quality`, now ON by default (v7.12)

Added in v7.10, enabled by default in v7.12. Measures, for each break, how far
price travelled **for** the signal (MFE) vs **against** it (MAE) over N bars,
in ATR — **no trade rules, stops, targets, commission, or instrument
arithmetic**, every one of which has derailed measuring this via backtest.

Shown as two status-table rows:

```
Sig MFE/MAE hi   1.42/0.71 =2.00 (n=48)
Sig MFE/MAE lo   0.98/0.93 =1.05 (n=96)
```

| Reading | Meaning |
|---|---|
| hi bucket beats lo | Score ranks breaks. A threshold is worth using |
| Buckets identical | **Score is decoration** — most valuable thing we could learn |
| Both ratios ≈ 1.0 | Detection itself has no edge; that's where work goes |

Grey below 20 samples. No lookahead — a break is recorded only after its full
window elapses.

**`data_get_pine_tables` can read these rows directly once the MCP is live.**

### The backtest experiment, if the tester ever works

Sweep `Minimum score to signal` across 0 / 40 / 55 / 70 / 85, changing nothing
else. Rising profit factor → the score works, cutoff is where the curve
flattens. Flat → decoration.

Table template in [`wiki/Backtesting.md`](wiki/Backtesting.md).

---

## 7. Next steps, prioritized

1. **Get the MCP live** (user runs launch script, restart Claude Code)
2. **`tv_health_check`**, then read the chart state
3. **Solve the frozen-settings problem.** Read the ① badge first. Then
   `data_get_pine_tables` to see what the script thinks its settings are
4. **Read the ⑬ signal-quality rows** — this may answer the score question
   without the backtest working at all
5. **Only then** the score sweep
6. If the score is real: test trend alignment (HTF filter, or
   `Trade direction = Continuation only`) against the 0.855 baseline

---

## 8. Process lessons — I got these wrong

Worth carrying forward.

**Change one thing at a time.** I turned on five management features
simultaneously and made results 4× worse with no way to attribute it. My own
docs said not to.

**Don't reason ahead of data.** I set "optimized" defaults twice on reasoning
alone. Both times wrong. Now: features ship OFF, user tests one at a time.

**Check the arithmetic before tuning.** Two rounds were spent tuning exits on
EUR/USD 5M where costs were 55% of risk. The trade was impossible before it
started and no backtest would have said so.

**Verify claims about history.** I wrote a changelog entry stating v7.5 alerts
contradicted labels. They didn't — both read `bias` and agreed. Also got three
version attributions wrong (bucket widening was v1.5, not v1.6). Both found by
audit, both corrected. **Check `git log` / script headers before asserting
version history.**

**Ask for the obvious diagnostic sooner.** The "Script execution ①" badge was
in every screenshot from the start. I asked on round four.

---

## 9. Verification commands

Run before any commit:

```bash
cd /Users/plpjr/Documents/PineScript

# structure
python3 -c "
for p in ['Structure_Break_Signals.pine','Key_Zone_Map.pine','Structure_Break_Strategy.pine']:
    s=open(p).read(); L=s.split(chr(10))
    print(p, 'parens', 'OK' if s.count('(')==s.count(')') else 'MISMATCH',
          'tabs', 'none' if not any(chr(9) in l for l in L) else 'FOUND')"

# strategy in sync
python3 tools/build_strategy.py --check

# wiki links + anchors (full checker is in the git history; regenerate if needed)
```

Also verified routinely: documented defaults in the wiki match the actual
`input.*` declarations (100 checked, all matched at last audit).

### Pine gotchas that have bitten us

- **`and`/`or` do not short-circuit.** `array.size(x) > 0 and array.get(x,0)`
  still calls `array.get` on an empty array. Use nested `if`.
- **`ta.*` must run every bar.** Behind a ternary or `if`, internal state
  desynchronises. Compute unconditionally, select after.
- **No comma-separated declarations.** `float a = na, b = na` is invalid.
- **`plotshape(size=)` needs a `const string`.** An input-derived value fails —
  this broke the retest markers silently from v7.3 until v7.9. Workaround: one
  `plotshape` per size constant, gated on the input.
- **`alertcondition()` is rejected in strategy scripts.** The generator strips
  them.
- **Headings with circled numerals or backticks** get unreliable markdown
  anchors — use explicit `<a id="..."></a>`.
- Indentation is **4 spaces**, no tabs.
