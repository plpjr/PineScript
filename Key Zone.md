# Key Zone Map v1.1 — Settings & Strategy Guide

Built for: multi-timeframe futures analysis (Daily → 4H → 1H → 15M → 5M),
key-level reactions confirmed by trend breaks, manual execution, journal-driven
confidence calibration.

---

## Ranked strategy options (this indicator alone)

| Rank | Strategy | Fit score | Why |
|---|---|---|---|
| 1 | **Confluence + held-rate zone trading** (below) | 82% | Uses the full detector stack (OB/FVG/Liquidity) and the historical hit/held rate — the indicator's actual designed purpose |
| 2 | **Swing-zone-only, no confluence** | 58% | Simpler, faster to read, but throws away the strongest part of the script (the confluence/hit-rate layer) |
| 3 | **Liquidity-sweep hunting only** | 55% | Narrow use case — good if you specifically trade stop-runs, but ignores order blocks and FVGs entirely |

Note: if you want the highest-fit option (96%), that requires pairing this
with the Structure Break Signals indicator so a held zone gets confirmed by
an actual break/CHoCH — see the separate Structure Break Signals artifact.

---

## 1. Recommended settings

### Swing detection (① — set per chart/timeframe)
- **Swing pivot length:** match whatever you're using for Structure Break Signals on the *same* chart, if you're running both — keeps the two scripts agreeing on what a swing is. Standalone: 5–7 on 1H/15M, 3–5 on 5M.
- **ATR length:** 14 (standard)
- **Filter minor swings by size:** ON
- **Min swing size:** 0.4–0.6× ATR (balanced)
- **Auto-adapt to timeframe:** ON

### Zones — shared style (②)
- **Show confluence + historical hit-rate:** ON — this is the core value of the script
- **Hold confirmation margin:** 0.15× ATR
- **Min overlap to count as confluence:** 0.3 (default) to start
- **Min sample size before showing a rate:** 15 — high enough that the percentage means something before you trust it in a live plan
- **Max active zones per type:** default is fine; lower if the chart feels cluttered

### Detector types
- **Swing zones (③):** ON — the headline "watch this level" box
- **Order blocks (④):** ON, search back default bars
- **Fair value gaps (⑤):** ON, min gap size 0.1× ATR
- **Liquidity zones (⑥):** ON, equal-level tolerance 0.15× ATR

---

## 2. Reading the zone at a glance

| Label | Meaning | Action |
|---|---|---|
| Solid box | Live, untested | Worth watching closely |
| "(tested)" / "(swept)" | Touched once | Lower priority, not dead |
| "(held)" | Confirmed rejection | Strongest "this zone worked" signal |
| Gone | Invalidated / fully filled | No longer relevant |

**Trade the held rate, not the hit rate, for fade/reversal setups.** Hit rate
answers "does price get here?" Held rate answers "does price actually reject
once it arrives?" A zone with 90% hit / 30% held is a magnet, not a wall.

---

## 3. Confluence calibration

1. Leave **Min overlap** and detector settings untouched once you set them — every input change restarts every confluence bucket at n=0.
2. Watch which detector type (OB, FVG, or Liquidity) the table names as the largest-sample-size type at your typical confluence level — that tells you empirically which detector actually works on your instrument.
3. Don't trust a rate until sample size clears your **Min sample size** threshold — treat lower-sample zones on confluence count alone.

---

## 4. Standalone workflow (Key Zone Map only)

1. **Daily/4H or 1H:** identify the nearest untested Resistance/Support zone. Note confluence count.
2. Wait for either **"(held)"** (rejection confirmed — trade the bounce) or the zone going **invalidated/gone** while price closes through (trade the breakout).
3. Use the opposite-side zone (Resistance if you entered off Support, or vice versa) as your target — read it straight off the status table.
4. **Manual step (your firm rule):** verify exact price levels on the TradingView chart, size and place the trade yourself.
5. **Journal:** log confluence count, hit/held rate, and outcome every time — this is your feedback loop for tightening the confluence/overlap thresholds over time.

---

## 5. Open item

Session window and specific instrument(s) aren't finalized yet — restricting
by session isn't a native setting on this script (that lives in Structure
Break Signals), so if you want session filtering here too, that would need
to be layered on manually or via chart session settings.
