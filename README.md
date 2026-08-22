# PineScript

Three TradingView indicators for reading market structure and opening-range
facts.

| | Purpose | Version |
|---|---|---|
| **`Structure_Break_Signals.pine`** | Facts-only map of ranked key-level clusters, confirmed breaks, and measured historical evidence | v9.0 |
| **`Key_Zone_Map.pine`** | Maps calculated price regions and their measurable attributes | v1.7 |
| **`Opening_Range_Breakout_Toolkit.pine`** | Daily facts-only opening-range map, completed-close state machine, returns, and session history | v1.0 |

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
| [Concepts](wiki/Concepts.md) | ATR scaling, chart facts, zone lifecycle, glossary |
| [Swing Engines](wiki/Swing-Engines.md) | Pivot vs. directional change — the deepest setting in either script |
| [Structure Break Signals](wiki/Structure-Break-Signals.md) | Full settings reference |
| [Opening Range Breakout Toolkit](wiki/Opening-Range-Breakout-Toolkit.md) | Daily ORB workflow and exact calculations |
| [Key Zone Map](wiki/Key-Zone-Map.md) | Full settings reference |
| [Confluence & Hit Rates](wiki/Confluence-and-Hit-Rates.md) | The statistics layer, and its limits |
| [Playbooks](wiki/Playbooks.md) | Timeframe setups and workflows |
| [Running on MNQ](wiki/Running-on-MNQ.md) | Step-by-step futures setup |
| [Alerts](wiki/Alerts.md) | Alert reference |
| [Troubleshooting](wiki/Troubleshooting.md) | Symptom → cause → fix |
| [Changelog](wiki/Changelog.md) | Version history and upgrade notes |

---

## Quick start

1. TradingView → **Pine Editor** → **Open → New indicator**
2. Delete the boilerplate, paste the contents of a `.pine` file
3. **Save**, then **Add to chart**

The structure profiles use only bars and ATR-normalized rules, so they are
market-neutral. Session context is optional and must be configured in exchange
time when used. See [Getting Started](wiki/Getting-Started.md).

---

## What these are and aren't

They mark structure and levels. They do not size positions, place orders, or
tell you what to do — every workflow in the wiki assumes you make the final
call manually.

Nothing here predicts or recommends a trade. Every displayed measurement is
calculated from the chart's bars and the active indicator settings. See [the
limits of the hit-rate numbers](wiki/Confluence-and-Hit-Rates.md#the-hard-limits-of-these-numbers)
in particular.

---

## Repository layout

```
Structure_Break_Signals.pine    Break-event indicator (Pine v5)
Key_Zone_Map.pine               Zone-mapping indicator (Pine v5)
Opening_Range_Breakout_Toolkit.pine  Daily opening-range indicator (Pine v5)
wiki/                           Documentation
README.md                       This file
```

Each `.pine` file carries its own full changelog in the header comment.
