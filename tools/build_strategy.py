#!/usr/bin/env python3
"""Generate Structure_Break_Strategy.pine from Structure_Break_Signals.pine.

Why generate rather than maintain a second copy: the strategy exists to test
the indicator's signals. If the two drifted apart, the backtest would be
measuring something other than what the indicator actually does, which is
worse than having no backtest at all. Here the detection body is carried over
byte-for-byte and only three things change:

  1. indicator(...)      -> strategy(...)
  2. alertcondition(...) -> dropped (Pine rejects it in strategy scripts)
  3. trade logic appended from tools/strategy_tail.pine

The drawing code is deliberately kept: it is valid in a strategy and makes it
possible to eyeball fills against the signals that produced them.

Deterministic by design -- no timestamps, no environment data -- so re-running
without source changes reproduces the file byte-identically. That is what makes
"is the checked-in strategy stale?" a `git diff` rather than a guess.

Usage:  python3 tools/build_strategy.py [--check]

  --check  exit 1 if the generated output differs from what is on disk,
           instead of writing. For pre-commit or CI.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "Structure_Break_Signals.pine"
TAIL = Path(__file__).resolve().parent / "strategy_tail.pine"
OUTPUT = ROOT / "Structure_Break_Strategy.pine"

BANNER = """// =============================================================================
// GENERATED FILE -- DO NOT EDIT
//
// Built from Structure_Break_Signals.pine by tools/build_strategy.py.
// Edit the indicator (for detection) or tools/strategy_tail.pine (for trade
// logic), then re-run:
//
//     python3 tools/build_strategy.py
//
// Everything below is the indicator source verbatim except the declaration
// line and the removal of alertcondition() calls, which Pine rejects in
// strategy scripts. The trade logic is appended at the end.
//
// EXPECTED WARNINGS: two barstate.islast warnings, from the live-level lines
// and the status table. Both are chart furniture that take no part in any
// trade decision, and a backtest runs on confirmed bars where barstate.islast
// behaves normally. Do NOT "fix" them with calc_on_every_tick = true -- that
// makes the strategy evaluate intrabar, which produces backtests that cannot
// be reproduced, and contradicts process_orders_on_close = true below.
// =============================================================================
"""


def build_declaration(indicator_line: str) -> str:
    """Turn the indicator() declaration into an equivalent strategy() one.

    Carries over the title and the object/buffer limits, since those were sized
    against this script's actual drawing load and are not strategy-specific.
    """
    title_match = re.search(r'indicator\(\s*"([^"]+)"', indicator_line)
    if not title_match:
        raise SystemExit(f"Could not parse the indicator title from:\n  {indicator_line}")
    title = title_match.group(1).replace("Structure Break Signals", "Structure Break Strategy")

    carried = []
    for param in ("max_bars_back", "max_lines_count", "max_labels_count"):
        found = re.search(rf"{param}\s*=\s*(\d+)", indicator_line)
        if found:
            carried.append(f"{param} = {found.group(1)}")

    return (
        "// Defaults are set for MICRO FUTURES (MNQ and friends), because that is what\n"
        "// this is actually being run on. Two of them matter more than they look:\n"
        "//\n"
        "//   cash_per_contract, not percent -- a percent commission is meaningless on\n"
        "//     futures and was catastrophically wrong on the first instrument tried:\n"
        "//     0.01% on EUR/USD worked out to 2.3 pips against a 4 pip stop, so 55% of\n"
        "//     the risk went to fees and no signal could have survived it.\n"
        "//   strategy.fixed at 1 contract -- futures trade in whole contracts, and a\n"
        "//     fixed size keeps results readable as dollars per contract instead of\n"
        "//     compounding position size into the equity curve.\n"
        "//\n"
        "// For any other instrument, override order size, commission and slippage in\n"
        "// the Strategy Tester PROPERTIES tab. Pine requires these to be constants, so\n"
        "// they cannot be inputs.\n"
        "//\n"
        "// process_orders_on_close: the break conditions evaluate against close, so\n"
        "// filling at the next bar's open would report entries the signal never offered.\n"
        f'strategy("{title}", overlay = true, ' + ", ".join(carried) + ",\n"
        "     initial_capital = 10000,\n"
        "     default_qty_type = strategy.fixed, default_qty_value = 1,\n"
        "     commission_type = strategy.commission.cash_per_contract, commission_value = 0.75,\n"
        "     slippage = 2,\n"
        "     calc_on_every_tick = false, process_orders_on_close = true)"
    )


def generate() -> str:
    src = SOURCE.read_text()
    tail = TAIL.read_text()

    lines = src.split("\n")
    out: list[str] = []
    swapped = False
    dropped = 0

    for line in lines:
        if line.startswith("indicator("):
            out.append(build_declaration(line))
            swapped = True
            continue
        if line.lstrip().startswith("alertcondition("):
            dropped += 1
            continue
        out.append(line)

    if not swapped:
        raise SystemExit("No indicator() declaration found -- did the source change shape?")
    if dropped == 0:
        print("warning: no alertcondition() calls found to strip", file=sys.stderr)

    body = "\n".join(out).rstrip("\n")
    return f"{BANNER}{body}\n{tail}"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="exit 1 if the checked-in file is stale, instead of regenerating it",
    )
    args = parser.parse_args()

    generated = generate()

    if args.check:
        if not OUTPUT.exists():
            print(f"{OUTPUT.name} does not exist -- run without --check", file=sys.stderr)
            return 1
        if OUTPUT.read_text() != generated:
            print(f"{OUTPUT.name} is stale -- run: python3 tools/build_strategy.py", file=sys.stderr)
            return 1
        print(f"{OUTPUT.name} is up to date")
        return 0

    OUTPUT.write_text(generated)
    print(f"wrote {OUTPUT.name} ({len(generated.splitlines())} lines)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
