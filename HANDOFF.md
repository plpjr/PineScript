# Session Handoff

**Working document, not user docs.** Everything a fresh session needs to pick
this up without re-deriving it. User-facing documentation lives in
[`wiki/`](wiki/Home.md).

Last updated at commit `6c35b70`.

---

## 0. Read this first — state at the last handoff

**The MCP is live and was used successfully.** The restart happened; the
TradingView tools work. Three things came out of that session:

1. **The confidence score looks real, but the sample is too small to bank.**
   At a high/low split of 80: hi bucket ratio **1.30 (n=27)**, lo bucket
   **0.76 (n=5)**. Right direction, but the lo bucket is far below the
   20-sample bar the script itself sets. See §6.
2. **"Can't parse pine" is reproducible on demand** — and it is caused by the
   MCP's `indicator_set_inputs`, *not* by the script. The same change made
   through the normal settings dialog recalculates cleanly. See §4.
3. **The chart was found completely blank** — no studies, no saved strategy,
   layout "Unnamed". Whatever setup the frozen-settings symptom was observed
   on no longer exists.

⚠️ **Do not use `indicator_set_inputs`.** It corrupts the study. Change
settings through the settings dialog instead (§5 has the working recipe).

### Decision: TradingView **Desktop**, via MCP. The browser route is dead.

The user settled this explicitly. Two approaches had been circling each other:

| Approach | Status |
|---|---|
| **TradingView Desktop + `tradingview-mcp` over CDP** | ✅ **This is the approach.** All effort goes here |
| Chrome extension "AI Trading Copilot" | ❌ Abandoned. Spec deleted, no code was ever written |
| Playwright driving TradingView **web** | ❌ Abandoned. Superseded by the MCP; artifacts deleted |

Deleted from `~/Documents` as part of this decision — do not go looking for
them, and do not recreate them:

- `AI_Trading_Copilot_Product_Specification.md` — the Chrome-extension spec
- `tv-snapshot.md` — 29KB Playwright accessibility dump of an AAPL web chart
- `.playwright-mcp/` — console log and page dump from the same Aug 5 session

### Where the files live

The project is **fully self-contained in `~/Documents/PineScript`** — verified,
not assumed: no `.pine` files exist anywhere else under `Documents`, and no file
outside this folder references `Structure_Break_*` or `Key_Zone_Map`. All 25
files are tracked in git.

**One deliberate exception:** `~/Documents/tradingview-mcp` stays where it is.
It is a third-party clone (`tradesdontlie/tradingview-mcp`), not our source —
the equivalent of an installed dependency. Moving it inside `PineScript/` would
nest a second `.git` inside a public repo and break the MCP registration, which
points at that absolute path. Treat it as a tool, not a project file.

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
| `tools/tv_paste.js` | Pastes a `.pine` file into the TradingView editor over CDP, without spending context ([§5](#s5-gotchas)) | |

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

**Substantially advanced. Read the update at the end of this section first.**

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

<a id="s4-update"></a>
### UPDATE — the error is readable now, and it has a known cause

The study's status string is reachable without screenshots:

```js
// via mcp__tradingview__ui_evaluate
const cw = window._exposed_chartWidgetCollection.activeChartWidget.value();
const st = cw.model().model().dataSources()
             .find(s => s.title && /Structure Break/.test(String(s.title())));
String(st.statusView().text());   // "...(inputs): Can't parse pine"
```

**This is the "Script execution ①" badge, as data.** It answers unknown #1
above for any future session — no screenshot squinting, no asking.

What it showed: **`Can't parse pine`**. A study in that state keeps rendering
its previous output, which is precisely the frozen-settings symptom.

**Cause — confirmed by controlled test:**

| Path used to change an input | Result |
|---|---|
| MCP `indicator_set_inputs` | ❌ `Can't parse pine`, study freezes |
| The normal settings dialog | ✅ recalculates, new numbers |

Both were tested on the same input (`High/low score split`, 60 → 80) on the
same script in the same session. The second run produced fresh bucket values,
so the script and the pipeline are fine — **the MCP tool is what breaks it.**

Ruled out along the way: **saved vs. unsaved is not the trigger.** The first
failure happened on an unsaved buffer, which made "TradingView can't fetch the
source" an attractive theory. It survived saving the script to the cloud and
failed again identically. Stated plainly because it looked convincing.

**What this does and does not explain.** It fully explains the freeze whenever
inputs are set over the MCP. It does **not** yet explain the user's original
report, since they were using the settings dialog, which works here. Either
their symptom had a different cause, or something about that specific chart
did. That chart no longer exists to inspect (§0), so the honest position is:
**the original freeze is unreproduced, not solved.** Re-check it on a fresh
setup before spending more on it.

---

## 5. TradingView MCP — registered, activates on next restart

Installed to make the feedback loop debuggable.

| | |
|---|---|
| Repo | [`tradesdontlie/tradingview-mcp`](https://github.com/tradesdontlie/tradingview-mcp) — 5.6k stars |
| Location | `~/Documents/tradingview-mcp` |
| Registered at | `~/.claude.json`, user scope |
| Dependencies | Installed. **7 vulnerabilities found, all patched** via `npm audit fix` — clean |

### The registration was in the wrong file for two sessions

It was originally written to **`~/.claude/.mcp.json`, which Claude Code does not
read.** The server was never loading, and the handoff blamed a missing restart —
so restarting could never have fixed it. Fixed with:

```bash
claude mcp add tradingview --scope user -- node /Users/plpjr/Documents/tradingview-mcp/src/server.js
```

Valid locations are `~/.claude.json` (user scope) or a `.mcp.json` at a project
root. **Verify with `claude mcp list`, never by reading a config file** — that
is exactly what hid this.

### State as of this session

| Precondition | Status |
|---|---|
| Registered and connecting | ✅ `claude mcp list` shows `tradingview … ✔ Connected` |
| TradingView on the debug port | ✅ already running with `--remote-debugging-port=9222`; port 9222 answers |
| Tools visible in-session | ❌ **needs a Claude Code restart** — MCP servers load only at startup |

So the one remaining step is a restart. The launch script is **not** needed
unless the port stops answering; check it without disturbing the app:

```bash
curl -s --max-time 3 http://127.0.0.1:9222/json/version
```

If that fails, the user runs (Claude Code's classifier blocks it — it kills
processes and launches an app):

```
! ~/Documents/tradingview-mcp/scripts/launch_tv_debug_mac.sh
```

⚠️ **Unsaved Pine editor work is lost** — warn first.

Then verify with `tv_health_check`.

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

<a id="s5-gotchas"></a>
### Working notes — things that cost time, verified in practice

**`indicator_set_inputs` corrupts the study.** See [§4](#s4-update). Never use
it. Change settings through the dialog:

```js
// open it — no MCP tool does this
const cw = window._exposed_chartWidgetCollection.activeChartWidget.value();
const st = cw.model().model().dataSources()
             .find(s => s.title && /Structure Break/.test(String(s.title())));
cw.showSourceProperties(st);
```

The dialog is a flat grid of ~79 `<input>`s in declaration order, so index from
the end for late inputs (last = `High/low score split`, second-to-last =
`Bars to measure forward`). Set values with the native setter, then fire
`input` + `change`, then click **Ok**:

```js
const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
setter.call(target, '80');
target.dispatchEvent(new Event('input',  {bubbles: true}));
target.dispatchEvent(new Event('change', {bubbles: true}));
```

**Pasting code without burning context — use `tools/tv_paste.js`.**
`pine_set_source` takes the source as a parameter, so a 123KB indicator costs
~30k tokens of context every paste. The script drives CDP from the shell
instead, so the file never enters the conversation:

```bash
NODE_PATH=/Users/plpjr/Documents/tradingview-mcp/node_modules \
  node tools/tv_paste.js Structure_Break_Signals.pine
```

It replays the source as a `paste` event, because Monaco handles paste itself
and this build exposes no `window.monaco`. `dispatched: false` in the output is
**success** — it means Monaco called `preventDefault` and took the content.

Two dead ends already paid for, do not repeat them:
- **Synthetic Cmd+V does nothing.** Key events reach Monaco's keybindings, but
  the clipboard is privileged; only Cmd+A works that way.
- **`fetch('http://127.0.0.1:…')` from the page is blocked** as mixed content.
  Serving the repo over localhost and pulling it in-page will not work.

**Other traps:**
- **`ui_evaluate` does not await promises** — an `async` IIFE returns `{}`.
  Stash the result on `window` and poll with a second call.
- **`pine_smart_compile` clicked "Pine Save", not "Add to chart"**, which opens
  a save dialog instead of compiling. Click the button directly:
  `[...document.querySelectorAll('button')].find(e => /add to chart/i.test(e.textContent))`
- **The Pine editor is a dialog in this build**, opened via
  `data-name="pine-dialog-button"`. `ui_open_panel('pine-editor')` reports
  success and does nothing.
- **Match UI elements narrowly.** A loose `/close/i` over `aria-label` hit the
  magnet-mode button, whose tooltip contains "closest". It got toggled and
  reverted.
- Adding a study is not instant — `chart_get_state` can return `studies: []`
  for a second or two afterwards.

⚠️ The debug port gives any local process full control of the TradingView
session. Fine while working; relaunch normally afterward.

---

## 6. The other open question — is the score real?

**First real measurement taken. Result at the end of this section (§6 update).
Short version: encouraging, underpowered, do not act on it yet.**

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

<a id="s6-update"></a>
### UPDATE — the first measurement

Read off a live chart, `CME_MINI_DL:MNQ1!` 15M, indicator v7.12 freshly pasted,
all defaults except the split. `Minimum score to signal` was confirmed to be
**0**, so no break was filtered out before being sampled — the buckets see
every break that fired.

**At the shipped split of 60, the low bucket is empty:**

```
Sig MFE/MAE hi   2.46/2.01 =1.22 (n=32)
Sig MFE/MAE lo   —              (n=0)
```

All 32 breaks scored ≥ 60. This is a **third outcome the section above did not
anticipate** — not "hi beats lo", not "buckets identical", but *the score has
so little spread that the default split cannot divide it.* Worth remembering:
the default split of 60 cannot answer the question it was added to answer.

**Moving the split to 80 separates them:**

| Bucket | MFE | MAE | Ratio | n |
|---|---|---|---|---|
| **hi** (score ≥ 80) | 2.65 | 2.04 | **1.30** | 27 |
| **lo** (score < 80) | 1.41 | 1.85 | **0.76** | 5 |

The direction is exactly what a working score predicts: high-scoring breaks
travel further for than against, low-scoring ones do the opposite.

**Why this is not yet an answer:**

- **n=5 in the lo bucket.** The script's own threshold for showing a bucket in
  colour rather than grey is 20. By the project's own standard this does not
  count yet. Five breaks is a handful of coin flips.
- **412 bars of history.** That is all the chart had loaded (~8 trading days,
  Aug 6–14 2026). Scrolling and `chart_set_visible_range` did not extend it —
  the range request clamped. The Run 4 backtest window (Apr 30 – Aug 5) was
  never in scope for this measurement.
- **One instrument, one timeframe, one window.** And a window in which the
  score sat above 80 five times out of six.
- Ratios of 1.30 and 0.76 straddle 1.0, but 2.65 vs 2.04 ATR is not a large
  edge in absolute terms even in the hi bucket.

**The single highest-value next step is more history, not more analysis.** The
numbers above will either firm up or dissolve with n in the hundreds, and no
amount of reasoning over n=5 substitutes. Get the chart to load months of 15M
data before re-reading these rows.

---

## 7. Next steps

**Superseded — the current plan is [§7a](#s7a). The list below is kept because
steps 5 and 6 are still the right experiments once there is enough data.**

**1. Confirm the MCP is actually live.** `tv_health_check`. If the tools are
still missing, re-check both preconditions in §5 — registration *and* debug
port — before assuming anything is broken.

**2. Read the "Script execution ①" badge.** *Highest-value unknown in this
file.* It has been visible in every screenshot since the beginning and was
asked for three times without an answer. **A runtime error would explain the
frozen settings completely** — a script that errors mid-run keeps displaying
its last good results, which is exactly the symptom. Now readable directly
instead of asking.

**3. `data_get_pine_tables`** — read the status table as data. Two things to
check:
   - **`BUILD_ID` on the label vs. `a3d0963c`.** If they differ, TradingView is
     running stale code and the whole frozen-settings mystery dissolves.
   - **The settings echo** — what the running script *thinks* its settings are,
     versus what the user set. A mismatch localises the fault immediately.

**4. Read the ⑬ signal-quality rows** (`Sig MFE/MAE hi` / `lo`). The one I most
want. **This may settle whether the confidence score is real without the
strategy tester working at all** — it measures MFE vs MAE per break in ATR,
with no trade rules, stops, commission, or instrument arithmetic. Every prior
attempt to measure this through a backtest was derailed by exactly those
things (§3, runs 1–5). Needs n ≥ 20 per bucket to be non-grey.

**5. Only then, the score sweep.** `Minimum score to signal` across
0 / 40 / 55 / 70 / 85, nothing else changed, against the 0.855 baseline.

**6. If the score is real:** test trend alignment — HTF filter, or
`Trade direction = Continuation only`. Remember the counter-trend finding is
**confounded** by a 37% up-move in the window (§3, run 4); long-only would look
brilliant and be pure curve-fitting.

⚠️ **One change at a time**, per §8. Runs 2 and 3 were lost to ignoring that.

<a id="s7a"></a>
### 7a. The current plan

**1. Get more history onto the chart.** Everything else is gated on this. The
score measurement rests on 32 breaks over 412 bars, and the lo bucket has 5
samples ([§6](#s6-update)). `chart_set_visible_range` clamps to what is loaded,
so it needs a real fetch — scroll back repeatedly, or check whether the
account's plan limits intraday history. **If MNQ 15M cannot load months of
bars, say so plainly and pick a timeframe that can** rather than reporting
numbers off eight days.

**2. Re-read the ⑬ rows at split 80** once n is in the hundreds. Same reading,
real power. This either confirms 1.30 vs 0.76 or kills it.

**3. Sweep the split** — 60 / 70 / 80 / 90 — to map where the score actually
separates, using the dialog recipe in [§5](#s5-gotchas), never
`indicator_set_inputs`. Note that at 60 the lo bucket was empty, so the useful
range starts higher than the shipped default.

**4. Only then the strategy.** `Structure_Break_Strategy.pine` was never
loaded this session and the saved-scripts list has no strategy in it — the
backtest side is starting from nothing. `tools/tv_paste.js` handles the paste;
check `BUILD_ID` against `a3d0963c` once it is on the chart.

**5. Leave the original frozen-settings report alone until it reappears.**
It is unreproduced on a fresh setup ([§4](#s4-update)). Chasing a symptom whose
chart no longer exists is how the last two sessions went.

### State the chart was left in

- Layout **"Unnamed"**, `CME_MINI_DL:MNQ1!`, 15M.
- One study: **Structure Break Signals v7.12**, with **High/low score split =
  80** (not the shipped 60 — set deliberately, it is the only value that
  populates both buckets).
- A new saved script, **"Structure Break Signals v7.12"**
  (`USER;46b1f109…`), created to test the saved/unsaved theory. The older
  **"Structure Break Signals"** (v7.9) was **not** touched. Delete the new one
  freely; it proved nothing.
- Magnet mode was toggled on by a mis-aimed click and toggled back off.

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

**A tool that reports success can still have done nothing.** `ui_open_panel`
returned `{success: true, performed: "opened"}` for a Pine editor that never
rendered, and `pine_smart_compile` returned success while clicking the wrong
button. Both were caught by checking the DOM and a screenshot, not the return
value. Same lesson as the MCP registration below, one level down.

**Suspect your own tooling before the code under test.** Two sessions treated
frozen results as a Pine or TradingView problem. The instance reproduced this
session was caused by the MCP tool being used to make the change. The
controlled test — same input, same script, two different paths — took two
minutes and settled it.

**Verify a tool is wired up, don't trust that you wired it.** I wrote the MCP
registration to a file Claude Code never reads, recorded "registered" in the
handoff and in memory, and attributed the resulting silence to a pending
restart. That misdiagnosis would have survived any number of restarts.
`claude mcp list` answers in one second and is the only thing that counts.

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
