# PineScript Indicator Wiki

Two companion TradingView indicators for reading market structure on futures
and other liquid instruments. They were one script once; they were split
because they answer different halves of the same question, and because two
focused scripts fit two indicator slots better than one that does everything
badly.

| | **[Structure Break Signals](Structure-Break-Signals.md)** | **[Key Zone Map](Key-Zone-Map.md)** |
|---|---|---|
| **Answers** | *Did structure actually break, and how convincingly?* | *Which level is worth watching, and why?* |
| **Draws** | Labelled break lines (HH / LL / LH / HL) with a 0–100 score | Shaded zone boxes with confluence counts and hit rates |
| **File** | `Structure_Break_Signals.pine` | `Key_Zone_Map.pine` |
| **Version** | v7.9 | v1.6 |
| **Signature feature** | The [confidence score](Confidence-Score.md) | [Confluence + historical hit rates](Confluence-and-Hit-Rates.md) |

They are most useful together — see **[Playbooks → Using both scripts
together](Playbooks.md#using-both-scripts-together)**.

---

## Start here

| If you want to… | Go to |
|---|---|
| Get the scripts onto a chart for the first time | **[Getting Started](Getting-Started.md)** |
| Understand the vocabulary before touching settings | **[Concepts](Concepts.md)** |
| Look up what a specific setting does | [Structure Break Signals](Structure-Break-Signals.md) · [Key Zone Map](Key-Zone-Map.md) |
| Understand how breaks get graded | **[Confidence Score](Confidence-Score.md)** |
| Understand the hit-rate numbers on zone labels | **[Confluence & Hit Rates](Confluence-and-Hit-Rates.md)** |
| Choose between the two swing detection methods | **[Swing Engines](Swing-Engines.md)** |
| Set up an actual trading routine | **[Playbooks](Playbooks.md)** |
| Test whether the score actually works | **[Backtesting](Backtesting.md)** |
| Get notified without watching the chart | **[Alerts](Alerts.md)** |
| Fix something that looks wrong | **[Troubleshooting](Troubleshooting.md)** |
| See what changed between versions | **[Changelog](Changelog.md)** |

---

## The one-paragraph explanation

**Structure Break Signals** watches the nearest unbroken swing high and swing
low. When price closes decisively through one, it draws a line at that level
and labels it with what just happened in classic Dow Theory terms — **HH**
(higher high), **LL** (lower low), **LH** (a lower high giving way), **HL** (a
higher low giving way) — plus a 0–100 score describing how emphatic the break
was. A pile of filters decides what counts as "decisively."

**Key Zone Map** runs four independent detectors — swing zones, order blocks,
fair value gaps and liquidity pools — and shows you where they *agree*. Then
it tracks, from your own chart's history, how often zones with that much
agreement actually got touched and actually held. So the number on a zone
label isn't a claim about the future; it's a count of what happened before.

---

## Design principles

These show up repeatedly in how the settings behave, so they're worth knowing
up front:

**Everything size-related is measured in ATR, not points or ticks.** A
"0.5 × ATR minimum swing" means the same thing on ES, on gold, and on a
1-minute chart versus a 4-hour one. See [Concepts →
ATR scaling](Concepts.md#why-everything-is-measured-in-atr).

**Every bar-count window can auto-adapt to the timeframe.** A 50-bar setting
means 50 minutes on a 1M chart and over a week on a 4H chart. With
`Auto-adapt to timeframe` on, those windows rescale so they span the same real
time everywhere. See [Concepts →
Timeframe adaptation](Concepts.md#timeframe-adaptation).

**Statistics are honest about sample size.** Hit rates default to showing a
[Wilson score lower bound](Confluence-and-Hit-Rates.md#wilson)
rather than a raw percentage, because 3-for-3 and 300-for-300 are not the same
evidence even though both are "100%".

**Nothing here predicts.** The score grades a break that already happened. The
hit rate counts zones that already resolved. Both are descriptions of the
past, presented so you can decide what to do about the present.

---

## A note on what these are for

These are analysis tools, not a system. They mark structure and levels; they
do not size positions, place orders, or tell you what to do. Every number they
show is derived from the chart you're looking at, and every number can be
wrong in the ways ordinary technical analysis is wrong. The
[Playbooks](Playbooks.md) page describes workflows that assume you are making
the final call manually.
