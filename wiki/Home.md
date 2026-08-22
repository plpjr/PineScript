# PineScript Indicator Wiki

Two companion TradingView indicators for reading market structure on futures
and other liquid instruments. They were one script once; they were split
because they answer different halves of the same question, and because two
focused scripts fit two indicator slots better than one that does everything
badly.

| | **[Structure Break Signals](Structure-Break-Signals.md)** | **[Key Zone Map](Key-Zone-Map.md)** |
|---|---|---|
| **Answers** | *What confirmed structure event occurred, and what were its measured details?* | *Which calculated regions are nearby, and what measurable attributes do they have?* |
| **Draws** | Labelled break lines (HH / LL / LH / HL), live levels, and measured distances | Shaded zone boxes with confluence counts and in-chart frequency data |
| **File** | `Structure_Break_Signals.pine` | `Key_Zone_Map.pine` |
| **Version** | v8.4 | v1.7 |
| **Focus** | Confirmed structure events | Calculated price regions |

They are most useful together — see **[Playbooks → Using both scripts
together](Playbooks.md#using-both-scripts-together)**.

---

## Start here

| If you want to… | Go to |
|---|---|
| Get the scripts onto a chart for the first time | **[Getting Started](Getting-Started.md)** |
| Understand the vocabulary before touching settings | **[Concepts](Concepts.md)** |
| Look up what a specific setting does | [Structure Break Signals](Structure-Break-Signals.md) · [Key Zone Map](Key-Zone-Map.md) |
| Understand the hit-rate numbers on zone labels | **[Confluence & Hit Rates](Confluence-and-Hit-Rates.md)** |
| Choose between the two swing detection methods | **[Swing Engines](Swing-Engines.md)** |
| Set up an actual trading routine | **[Playbooks](Playbooks.md)** |
| Set it up on MNQ futures | **[Running on MNQ](Running-on-MNQ.md)** |
| Get notified without watching the chart | **[Alerts](Alerts.md)** |
| Fix something that looks wrong | **[Troubleshooting](Troubleshooting.md)** |
| See what changed between versions | **[Changelog](Changelog.md)** |

---

## The one-paragraph explanation

**Structure Break Signals** watches the nearest unbroken swing high and swing
low. When price closes through one under its stated rules, it records the
resulting relationship, the candidate and confirmation measurements, the
active structural span and session location. It then measures the completed
5/10/20-bar path after the event and compares it with completed non-break
starting bars from the same chart. Those observations describe history; they
are not a probability or trade rating. Its guided dashboard leads with the
current structure and keeps the complete research view available on demand.

**Key Zone Map** runs four independent detectors — swing zones, order blocks,
fair value gaps and liquidity pools — and shows you where they *agree*. Then
it tracks, from your own chart's history, how often zones with that much
agreement occurred. Its frequency figures are counts over loaded chart history,
not claims about what price will do next.

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

**Nothing here predicts.** The indicators report confirmed events, calculated
distances, and counts from the chart history. They do not rate opportunities or
recommend an action.

---

## A note on what these are for

These are analysis tools, not a system. They mark structure and levels; they
do not size positions, place orders, or tell you what to do. Every number they
show is derived from the chart you're looking at, and every number can be
wrong in the ways ordinary technical analysis is wrong. The
[Playbooks](Playbooks.md) page describes workflows that assume you are making
the final call manually.
