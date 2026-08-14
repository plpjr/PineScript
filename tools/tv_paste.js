#!/usr/bin/env node
// Paste a local .pine file into the TradingView Pine editor over CDP.
// The file content never passes through the agent's context.
//
//   node tv_paste.js <path-to-.pine>

const CDP = require('chrome-remote-interface');
const fs = require('fs');

const file = process.argv[2];
if (!file) {
    console.error('usage: tv_paste.js <path-to-.pine>');
    process.exit(2);
}
const src = fs.readFileSync(file, 'utf8');

(async () => {
    let client;
    try {
        const targets = await CDP.List({ host: '127.0.0.1', port: 9222 });
        const page = targets.find(t => t.type === 'page' && t.url.includes('tradingview.com/chart'));
        if (!page) {
            console.log(JSON.stringify({ ok: false, error: 'no tradingview chart target' }));
            process.exit(1);
        }

        client = await CDP({ host: '127.0.0.1', port: 9222, target: page.id });
        const { Runtime, Input } = client;
        await Runtime.enable();

        // Focus the editor, then let Monaco's own keybinding select everything.
        // Synthetic keydown reaches Monaco's handler; synthetic Cmd+V does not
        // reach the clipboard, which is why the paste is replayed as an event.
        await Runtime.evaluate({
            expression: `(() => { const t = document.querySelector('textarea.inputarea'); if (t) t.focus(); return !!t; })()`,
            returnByValue: true
        });
        for (const type of ['keyDown', 'keyUp']) {
            await Input.dispatchKeyEvent({
                type, key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65,
                modifiers: 4, commands: type === 'keyDown' ? ['selectAll'] : []
            });
        }

        // Hand the source to the page in one shot, then replay it as a paste
        // event. Monaco handles paste itself, so this works without needing a
        // `window.monaco` global (this build does not expose one).
        const expression = `
        (() => {
            const SRC = ${JSON.stringify(src)};
            const ta = document.querySelector('textarea.inputarea');
            if (!ta) return JSON.stringify({ ok: false, error: 'pine editor not open' });
            ta.focus();

            // Select existing content so the paste replaces it.
            const ed = document.querySelector('.monaco-editor');
            ta.selectionStart = 0;
            ta.selectionEnd = ta.value.length;
            document.execCommand && document.execCommand('selectAll');

            const dt = new DataTransfer();
            dt.setData('text/plain', SRC);
            const ok = ta.dispatchEvent(new ClipboardEvent('paste', {
                clipboardData: dt, bubbles: true, cancelable: true
            }));
            return JSON.stringify({ ok: true, dispatched: ok, bytes: SRC.length });
        })()`;

        const res = await Runtime.evaluate({
            expression,
            returnByValue: true,
            awaitPromise: false
        });

        if (res.exceptionDetails) {
            console.log(JSON.stringify({ ok: false, error: res.exceptionDetails.text }));
            process.exit(1);
        }
        console.log(res.result.value);
    } catch (e) {
        console.log(JSON.stringify({ ok: false, error: String(e) }));
        process.exit(1);
    } finally {
        if (client) await client.close();
    }
})();
