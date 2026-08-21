#!/usr/bin/env node
// Export the chart's loaded bars to JSON on disk, over CDP.
//
//   NODE_PATH=~/Documents/tradingview-mcp/node_modules \
//     node tools/tv_export_bars.js /tmp/bars.json
//
// Why this exists: analysis used to run as JavaScript inside the page via
// ui_evaluate. A single unbounded loop there froze TradingView's renderer hard
// enough that Runtime.terminateExecution could not recover it and the tab had
// to be closed from the browser process. Pulling the data out once and
// analysing it in Python removes that whole class of failure, and makes the
// analysis re-runnable without the chart being open.
const CDP = require('chrome-remote-interface');
const fs = require('fs');

const out = process.argv[2];
if (!out) { console.error('usage: tv_export_bars.js <out.json>'); process.exit(2); }

const guard = setTimeout(() => {
    console.log(JSON.stringify({ ok: false, error: 'timed out after 60s' }));
    process.exit(1);
}, 60000);

(async () => {
    let client;
    try {
        const targets = await CDP.List({ host: '127.0.0.1', port: 9222 });
        const page = targets.find(t => t.type === 'page' && t.url.includes('tradingview.com/chart'));
        if (!page) throw new Error('no TradingView chart target');
        client = await CDP({ host: '127.0.0.1', port: 9222, target: page.id });
        const { Runtime } = client;
        await Runtime.enable();

        // Straight-line extraction, no loops that can run away.
        const res = await Runtime.evaluate({
            expression: `(() => {
                const cw = window._exposed_chartWidgetCollection.activeChartWidget.value();
                const m  = cw.model().model();
                const rows = m.mainSeries().data().bars()._items.map(r => r.value.slice(0, 6));
                return JSON.stringify({
                    symbol: m.mainSeries().symbolInfo() ? m.mainSeries().symbolInfo().full_name : 'unknown',
                    resolution: String(m.mainSeries().interval()),
                    bars: rows
                });
            })()`,
            returnByValue: true
        });
        if (res.exceptionDetails) throw new Error(res.exceptionDetails.text);

        const data = JSON.parse(res.result.value);
        fs.writeFileSync(out, JSON.stringify(data));
        clearTimeout(guard);
        console.log(JSON.stringify({ ok: true, symbol: data.symbol, resolution: data.resolution,
                                     bars: data.bars.length, file: out }));
        process.exit(0);
    } catch (e) {
        clearTimeout(guard);
        console.log(JSON.stringify({ ok: false, error: String(e) }));
        process.exit(1);
    }
})();
