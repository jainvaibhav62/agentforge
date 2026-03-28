#!/usr/bin/env python3
"""
Entry point for the `claudeforge` pip package.

Locates the Node.js CLI and delegates all commands to it.

Resolution order for the JS entry point:
  1. DEV MODE   — repo checkout: uses <repo_root>/bin/cli.js directly.
  2. WHEEL MODE — pip install:   uses <package_dir>/_nodejs/bin/cli.js
                  (files are bundled into the wheel by hatchling force-include).
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path


# ── Path resolution ───────────────────────────────────────────────────────────

def _resolve_cli_js() -> Path:
    """Return the absolute path to bin/cli.js — works in dev and installed modes."""
    pkg_dir = Path(__file__).parent

    # Wheel / pip-install mode: bundled _nodejs/ directory exists
    bundled = pkg_dir / "_nodejs" / "bin" / "cli.js"
    if bundled.exists():
        return bundled

    # Dev / editable-install mode: walk up from claudeforge/ to repo root
    repo_root = pkg_dir.parent
    dev_cli = repo_root / "bin" / "cli.js"
    if dev_cli.exists():
        return dev_cli

    _die(
        "Could not locate the claudeforge Node.js entry point.\n"
        "  If you installed via pip, try reinstalling: pip install --force-reinstall claudeforge\n"
        "  If you're developing locally, ensure bin/cli.js exists in the repo root."
    )


def _resolve_node_modules(cli_js: Path) -> Path | None:
    """
    Return the node_modules directory that should satisfy requires() for cli_js.
    Walks up from cli_js to find the nearest node_modules/.
    Returns None if not found (npm install may be needed).
    """
    candidate = cli_js.parent
    for _ in range(5):
        nm = candidate / "node_modules"
        if nm.is_dir():
            return nm
        candidate = candidate.parent
    return None


# ── Node.js helpers ───────────────────────────────────────────────────────────

def _find_node() -> str:
    node = shutil.which("node")
    if not node:
        _die(
            "Node.js is required but was not found on PATH.\n"
            "  Install it from: https://nodejs.org/\n"
            "  Then re-run your command."
        )
    return node


def _ensure_node_modules(js_dir: Path) -> None:
    """Run npm install inside js_dir if node_modules is absent."""
    if (js_dir / "node_modules").is_dir():
        return

    npm = shutil.which("npm")
    if not npm:
        _die(
            "npm is required to install dependencies but was not found.\n"
            "  Install Node.js (includes npm) from: https://nodejs.org/"
        )

    _print_info("Installing Node.js dependencies (first run only)…")
    result = subprocess.run(
        [npm, "install", "--production", "--no-fund", "--no-audit"],
        cwd=js_dir,
        check=False,
    )
    if result.returncode != 0:
        _die(
            "npm install failed.\n"
            "  Check your internet connection and try again.\n"
            f"  Working directory: {js_dir}"
        )
    _print_info("Dependencies installed.\n")


# ── Main entry point ──────────────────────────────────────────────────────────

def main() -> None:
    node = _find_node()
    cli_js = _resolve_cli_js()
    js_dir = cli_js.parent.parent  # bin/ -> package root

    # Only run npm install when using the bundled _nodejs/ copy (wheel mode).
    # In dev mode the repo's own node_modules are already in place.
    if "_nodejs" in cli_js.parts:
        _ensure_node_modules(js_dir)

    cmd = [node, str(cli_js)] + sys.argv[1:]

    try:
        result = subprocess.run(cmd, check=False)
        sys.exit(result.returncode)
    except KeyboardInterrupt:
        sys.exit(130)


# ── Utilities ─────────────────────────────────────────────────────────────────

def _die(msg: str) -> None:
    print(f"\n  \033[31m✗  Error:\033[0m {msg}\n", file=sys.stderr)
    sys.exit(1)


def _print_info(msg: str) -> None:
    print(f"  \033[2m→\033[0m {msg}", file=sys.stderr)


if __name__ == "__main__":
    main()
