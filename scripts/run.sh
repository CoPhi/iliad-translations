#!/usr/bin/env python
"""Build the English Iliad web edition from the repository source text."""

import sys
from pathlib import Path

sys.dont_write_bytecode = True

from build_iliad_html import build


REPOSITORY_ROOT = Path(__file__).resolve().parent.parent
SOURCE_PATH = REPOSITORY_ROOT / "texts" / "iliad-eng.txt"
OUTPUT_PATH = REPOSITORY_ROOT / "web" / "iliad-eng2.html"


if __name__ == "__main__":
    build(SOURCE_PATH, OUTPUT_PATH)
