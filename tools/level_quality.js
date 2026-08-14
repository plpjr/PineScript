// Level quality harness — does a swing level actually pay?
//
// Paste the whole file into mcp__tradingview__ui_evaluate. It reads the
// chart's bars directly, finds pivots itself, and returns only summary rows,
// so it costs almost no context no matter how many bars are loaded.
//
// Why it computes pivots in JS instead of reading them from the indicator:
//   * swingLen is derived from the preset dials, so sweeping it in Pine means
//     a re-paste and a full recalculation per value. Here a sweep is one pass.
//   * The study stops drawing entirely past ~5,000 bars (HANDOFF §5a), so the
//     lines/labels are not readable at the sample sizes that give power.
//     Bars always are.
//
// No look-ahead: a pivot at bar k is only known at k + L, and every scan
// starts at k + L + 1. When a bar hits both stop and target, it is scored a
// loss.
//
// Load history first (75 days at 15M) with the scrollToFirstBar loop in
// PLAN.md §4, otherwise this measures a week and tells you nothing.

(() => {
  try {
    const cw = window._exposed_chartWidgetCollection.activeChartWidget.value();
    const raw = cw.model().model().mainSeries().data().bars()._items;
    const bars = raw.map(r => ({ h: r.value[2], l: r.value[3], c: r.value[4] }));
    const n = bars.length;

    // ATR(14), simple mean of true range. Everything is normalised by this so
    // results are comparable across symbols and volatility regimes.
    const atr = new Array(n).fill(null);
    {
      const tr = [];
      for (let k = 0; k < n; k++) {
        const b = bars[k], p = bars[k - 1];
        tr.push(p ? Math.max(b.h - b.l, Math.abs(b.h - p.c), Math.abs(b.l - p.c)) : b.h - b.l);
        if (tr.length > 14) tr.shift();
        if (k >= 14) atr[k] = tr.reduce((a, b) => a + b, 0) / tr.length;
      }
    }

    const SCAN = 200;   // bars to wait for the level to be revisited
    const HOLD = 50;    // bars to let the trade resolve

    function pivots(L) {
      const out = [];
      for (let k = L; k < n - L; k++) {
        let isHigh = true, isLow = true;
        for (let d = 1; d <= L; d++) {
          if (bars[k].h <= bars[k - d].h || bars[k].h <= bars[k + d].h) isHigh = false;
          if (bars[k].l >= bars[k - d].l || bars[k].l >= bars[k + d].l) isLow = false;
        }
        if (isHigh) out.push({ k: k + L, P: bars[k].h });
        if (isLow) out.push({ k: k + L, P: bars[k].l });
      }
      return out;
    }

    // First revisit of the level after it is confirmed. Direction is taken
    // from the close before the touch: approached from above means we are
    // treating it as support.
    function firstTouch(v) {
      for (let j = v.k + 1; j < Math.min(v.k + SCAN, n); j++) {
        if (bars[j].l <= v.P && v.P <= bars[j].h) return { t: j, dir: bars[j - 1].c > v.P ? 1 : -1 };
      }
      return null;
    }

    // Enter at the level, fixed risk, fixed reward. Fixed risk is the point:
    // widening a "zone" and then measuring violations from its far edge just
    // moves the goalposts and inflates the hold rate. This does not.
    function expectancy(L, stopATR, RR) {
      let win = 0, loss = 0, open = 0;
      for (const v of pivots(L)) {
        const a = atr[v.k]; if (!a) continue;
        const ft = firstTouch(v); if (!ft) continue;
        const S = stopATR * a, T = RR * stopATR * a;
        const stop = ft.dir === 1 ? v.P - S : v.P + S;
        const targ = ft.dir === 1 ? v.P + T : v.P - T;
        let res = 0;
        for (let j = ft.t; j < Math.min(ft.t + HOLD, n); j++) {
          const b = bars[j];
          const hitS = ft.dir === 1 ? b.l <= stop : b.h >= stop;
          const hitT = ft.dir === 1 ? b.h >= targ : b.l <= targ;
          if (hitS) { res = -1; break; }       // stop checked first, deliberately
          if (hitT) { res = 1; break; }
        }
        if (res === 1) win++; else if (res === -1) loss++; else open++;
      }
      const decided = win + loss;
      return {
        swingLen: L, stopATR, RR, win, loss, unresolved: open,
        winPct: decided ? Math.round(100 * win / decided) : null,
        breakeven: Math.round(100 / (1 + RR)) + '%',
        expectancyR: decided ? +((win * RR - loss) / decided).toFixed(3) : null
      };
    }

    return JSON.stringify({
      bars: n,
      // Vary risk at a fixed 2:1, then check 1:1 for contrast.
      byStop: [0.5, 1.0, 1.5, 2.0].map(s => expectancy(5, s, 2)),
      byRR:   [1, 2, 3].map(rr => expectancy(5, 0.5, rr)),
      bySwing: [3, 5, 8, 12, 20].map(L => expectancy(L, 0.5, 2))
    });
  } catch (e) { return 'err ' + e.message; }
})()
