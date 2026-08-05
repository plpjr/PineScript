# Swing Engines

[← Home](Home.md) · Applies to **both** scripts (`① / ② Swing detection`)

Everything downstream — breaks, scores, zones, confluence, hit rates — is
built on the swings this produces. It is the deepest single setting in either
script.

---

## The choice

| | **Pivot (fixed bars)** *(default)* | **Directional change (adaptive)** |
|---|---|---|
| Confirms a swing when | N bars on each side are lower/higher | Price retraces `dcMult × ATR` from the extreme |
| Confirmation lag | Exactly N bars, always | However long the market takes to actually turn |
| Governed by | `Swing pivot length` | `Reversal threshold (× ATR)` |
| Adapts to volatility | No | Yes |
| Adapts to timeframe | No | Yes (via ATR) |
| Familiarity | Standard, easy to eyeball | Less common |

---

## Why the fixed-bar lag is a real problem

With `Swing pivot length = 5`, a swing high is confirmed exactly 5 bars after
it forms. Always. Whether the market moved 3 ticks in those 5 bars or 30
points.

That means the lag is measured in a unit — bars — that has no fixed
relationship to the thing you care about, which is *whether the market has
actually turned*. At 12:30 in a dead tape, 5 bars might be a meaningless
drift. During a release, 5 bars might be the entire move.

The lag is also unavoidable *in principle* for a pivot detector: you cannot
know a bar was a peak until you've seen enough bars after it. That's not an
implementation flaw, it's what "pivot" means.

## What directional change does instead

Rather than counting bars, it watches the running extreme and confirms it the
moment price pulls back a set distance:

```
                    peak (dcExtreme, tracked bar by bar)
                     /\
                    /  \
                   /    \   <- once close drops theta below the peak,
                  /      \     that peak is confirmed as a swing high
                 /        \    RIGHT NOW, at whatever bar that happens
   ------------ /          \  ------------------------------
                            \
     theta = dcMult x ATR    \
```

The trigger is a **market event** — price actually turned by a meaningful
amount — rather than a clock. Consequences:

- **A sharp reversal confirms almost immediately.** A violent turn produces
  the retracement in one or two bars, so you get the swing at once instead of
  waiting out a fixed count.
- **A slow drift takes as long as it takes.** Grinding sideways won't
  manufacture a swing just because enough bars elapsed.
- **The threshold is volatility-scaled**, so the same `1.5` means "a genuine
  turn" whether the instrument is quiet or wild, on 1M or 4H.

This is the *directional change* / intrinsic-time framing: sample the market
on events rather than on a fixed clock.

---

## Which should you use?

**Stay on Pivot if:**
- You're new to these scripts. Everything documented, every preset, and every
  default was tuned against pivot behaviour.
- You want to eyeball the chart and verify the indicator agrees with what you
  see. Fixed pivots are much easier to check by hand.
- You're comparing against other indicators or published analysis that assume
  pivots.

**Try Directional change if:**
- You trade reversals and the confirmation lag is costing you entries. This is
  the case where it helps most and most obviously.
- You move between timeframes a lot and are tired of retuning swing length.
- Your instrument has very uneven intraday volatility (most futures do).

**Run both on two chart layouts** for a week before committing. They will
disagree, and the disagreements are informative.

---

## Tuning the reversal threshold

`Reversal threshold (× ATR)` replaces `Swing pivot length` entirely in
directional-change mode. Rough equivalences — treat as starting points, not
conversions:

| Behaviour | Pivot length | Reversal threshold |
|---|---|---|
| Very sensitive, lots of small swings | 2–3 | 0.5–0.8 |
| Balanced | 5 | 1.5 |
| Major structure only | 8–12 | 2.5–4.0 |

Lower values confirm faster and detect smaller swings — more structure points,
more signals, more noise. Higher values mean only real reversals register.

---

## Behaviour details worth knowing

**Swings strictly alternate.** Directional change produces high, low, high,
low — never two highs in a row. The pivot engine can occasionally produce both
in quick succession. Downstream code handles both.

**Pivot markers plot differently.** With `Raw pivot markers` on, the pivot
engine draws its triangle back at the swing bar itself. Directional change
draws it at the bar where confirmation happened — which is also the first bar
you could have acted on. (TradingView requires a constant plot offset, so
these are two separate plots under the hood.)

**Internal structure always uses pivots.** The optional `⑥ Internal structure`
feature in Structure Break Signals exists to read a faster, smaller scale —
which a short fixed pivot length already does well. It is not affected by this
setting.

**Key Zone Map records the body edge as it tracks.** Swing zone boxes span
wick-to-body of the swing bar. In directional-change mode the engine records
that body edge while tracking the extreme, rather than looking it back up
afterwards — a swing that runs a long time without retracing could otherwise
reference a bar further back than the historical buffer holds.

---

## Keep the two scripts matched

If you run both, **set the same engine and threshold in both.**

The two already differ slightly on the watched level by design — Key Zone Map
uses a [raw break](Concepts.md#raw-break-vs-graded-break) while Structure Break
Signals waits for a graded one. Running different swing engines on top of that
widens the gap from "slightly different" to "describing different charts."
