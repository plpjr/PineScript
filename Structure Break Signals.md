# Structure Break Signals v7.2 — Settings & Strategy Guide

Built for: multi-timeframe futures analysis (Daily → 4H → 1H → 15M → 5M),
key-level reactions confirmed by trend breaks, manual execution, journal-driven
confidence calibration.

---

## Ranked strategy options (this indicator alone)

| Rank | Strategy | Fit score | Why |
|---|---|---|---|
| 1 | **Score-gated BOS continuation** (5M/15M, ignore CHoCH) | 84% | Simple, high signal-to-noise, good for a pure continuation bias — but discards reversal setups entirely |
| 2 | **CHoCH-first reversal hunting** (EMA filter OFF) | 79% | Catches reversals early but noisier and needs more discretion at entry |
| 3 | **Raw/Loose preset, no score gate** | 41% | Only useful for a calibration week to observe raw structure, not a standing strategy |

Note: if you want the highest-fit option (96%), that requires pairing this
with the Key Zone Map indicator for zone confluence — see the separate
Key Zone Map artifact and the combined-workflow section there.

---

## 1. Recommended settings by timeframe

### Higher timeframe (Daily / 4H) — bias context only
- **Preset:** Strict
- **Fine tune:** 5 (default)
- **Auto-adapt to timeframe:** ON
- **Confirmation bars after break:** 1 (small buffer against fakeouts at this scale)
- **Only signal with EMA trend:** OFF — you want to see the first CHoCH even against the higher-timeframe trend, since that's your reversal early-warning
- **EMA length:** 100
- **Minimum score to signal:** 0 for now (see calibration step below)

### Execution timeframe (1H / 15M) — where you build the plan
- **Preset:** Balanced
- **Fine tune:** 4 (slightly stricter than default — fewer marginal breaks to manually verify)
- **Confirmation bars after break:** 1–2
- **Only signal with EMA trend:** OFF (Recommended Technique #5 in the docs — this would hide the exact CHoCH you're trying to catch)
- **Internal structure (⑥):** ON, internal swing length 2, for entry timing once HTF bias is set
- **Restrict to a session:** ON, set to your actual trading window once confirmed

### Entry timeframe (5M) — trigger only
- **Preset:** Loose → Balanced (test both; Loose if you want earlier entries and can tolerate more manual filtering)
- **Confirmation bars after break:** 0–1 (you're verifying manually on the chart anyway, so lag here has low value)
- **Min bars between breaks (cooldown):** 3
- **Restrict to a session:** ON, matched to your window

### Shared across all timeframes
- **Require break strength:** ON
- **Min clearance beyond level:** 0.15× ATR
- **Require displacement candle:** ON
- **Min candle range:** 0.7× ATR
- **Require volume expansion:** ON (futures volume is real — keep this)
- **Min volume:** 1.3× average
- **Reject long-wick breaks:** OFF — you specifically want to see liquidity-sweep-style rejections, not filter them out, since sweeps feed your reversal read
- **Merge near-equal levels:** ON, tolerance 0.15× ATR

---

## 2. Confidence-score calibration (do this before trading live off scores)

1. Run with **Minimum score to signal = 0** and **Show score on label = ON** for 1–2 weeks on your actual instrument(s).
2. Log every BOS/CHoCH score and outcome into your journal spreadsheet.
3. Once you have ~20–30 logged events, set **Minimum score to signal** to whatever number the data shows as your real cutoff — don't guess it.
4. Re-check quarterly; thresholds drift as volatility regimes change.

---

## 3. Standalone workflow (Structure Break Signals only)

1. **Daily/4H:** confirm current bias — is the last confirmed break BOS (continuation) or CHoCH (reversal)?
2. **1H/15M:** watch for a same-direction high-score break (55+, ideally 75+). Use internal structure (i-BOS/i-CHoCH) for finer entry timing within that bias.
3. **5M:** use the Retest Support/Resistance alert as your precise entry trigger — never chase the raw break candle.
4. **Manual step (your firm rule):** verify exact price levels on the TradingView chart, size and place the trade yourself.
5. **Journal:** log break score and outcome every time — this is your feedback loop for tightening the score threshold over time.

---

## 4. Open item

Session window and specific instrument(s) aren't finalized yet — once confirmed,
set **Restrict to a session** to that exact window so overnight/low-liquidity
chop doesn't pollute the signal count.
