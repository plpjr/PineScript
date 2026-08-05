# PineScript

Two companion TradingView indicators for reading market structure.

| | Purpose | Version |
|---|---|---|
| **`Structure_Break_Signals.pine`** | Grades structure **break events** — labels HH / LL / LH / HL with a 0–100 confidence score | v7.9 |
| **`Key_Zone_Map.pine`** | Maps support/resistance **zones**, how many independent detectors agree on each, and how often that agreement has mattered historically | v1.6 |

They were one script once, split because they answer different halves of the
same question — and because two focused scripts fit two TradingView indicator
slots better than one that does everything.

---

## 📖 Documentation

**Full documentation lives in the [`wiki/`](wiki/Home.md) folder.**

| Page | |
|---|---|
| **[Home](wiki/Home.md)** | Start here |
| [Getting Started](wiki/Getting-Started.md) | Load the scripts, first-run settings |
| [Concepts](wiki/Concepts.md) | HH/LL/LH/HL, ATR scaling, zone lifecycle, glossary |
| [Swing Engines](wiki/Swing-Engines.md) | Pivot vs. directional change — the deepest setting in either script |
| [Structure Break Signals](wiki/Structure-Break-Signals.md) | Full settings reference |
| [Confidence Score](wiki/Confidence-Score.md) | The six components, weights, calibration |
| [Key Zone Map](wiki/Key-Zone-Map.md) | Full settings reference |
| [Confluence & Hit Rates](wiki/Confluence-and-Hit-Rates.md) | The statistics layer, and its limits |
| [Playbooks](wiki/Playbooks.md) | Timeframe setups and workflows |
| [Alerts](wiki/Alerts.md) | Alert reference |
| [Troubleshooting](wiki/Troubleshooting.md) | Symptom → cause → fix |
| [Changelog](wiki/Changelog.md) | Version history and upgrade notes |

---

## Quick start

1. TradingView → **Pine Editor** → **Open → New indicator**
2. Delete the boilerplate, paste the contents of a `.pine` file
3. **Save**, then **Add to chart**

Defaults are tuned for **intraday futures on 5M–15M**. See
[Getting Started](wiki/Getting-Started.md) for what to adjust first.

---

## What these are and aren't

They mark structure and levels. They do not size positions, place orders, or
tell you what to do — every workflow in the wiki assumes you make the final
call manually.

Nothing here predicts. The confidence score grades a break that already
happened; the hit rates count zones that already resolved. Both are
descriptions of the past, presented so you can decide what to do about the
present. See [the limits of the hit-rate
numbers](wiki/Confluence-and-Hit-Rates.md#the-hard-limits-of-these-numbers) in
particular.

---

## Repository layout

```
Structure_Break_Signals.pine    Break-event indicator (Pine v5)
Key_Zone_Map.pine               Zone-mapping indicator (Pine v5)
wiki/                           Documentation
README.md                       This file
```

Each `.pine` file carries its own full changelog in the header comment.
