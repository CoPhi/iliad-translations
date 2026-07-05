#!/usr/bin/env python3
"""Build a clean, annotation-ready HTML edition from a numbered text file."""

from __future__ import annotations

import argparse
import html
import re
from dataclasses import dataclass
from pathlib import Path


LINE_PATTERN = re.compile(r"^(?P<number>\d+)\s+(?P<text>\S.*)$")
EMPHASIS_PATTERN = re.compile(r"\*([^*]+)\*")
TOKEN_PATTERN = re.compile(r"[A-Za-z]+(?:[’'][A-Za-z]+)*")
SUBSCRIPT_TRANSLATION = str.maketrans("0123456789", "₀₁₂₃₄₅₆₇₈₉")


@dataclass(frozen=True)
class Verse:
    """A single numbered verse."""

    number: int
    text: str


def parse_source(source_path: Path) -> tuple[str, list[Verse]]:
    """Read the source title and its consecutively numbered verses."""
    lines = source_path.read_text(encoding="utf-8").splitlines()
    if not lines:
        raise ValueError(f"Source file is empty: {source_path}")

    title = lines[0].strip()
    if not title:
        raise ValueError("The first line must contain the edition title.")

    verses: list[Verse] = []
    for source_line_number, raw_line in enumerate(lines[1:], start=2):
        if not raw_line.strip():
            continue

        match = LINE_PATTERN.fullmatch(raw_line.strip())
        if match is None:
            raise ValueError(
                f"Invalid verse at source line {source_line_number}: {raw_line!r}"
            )

        verses.append(
            Verse(number=int(match.group("number")), text=match.group("text"))
        )

    if not verses:
        raise ValueError("The source must contain at least one numbered verse.")

    for previous, current in zip(verses, verses[1:]):
        if current.number != previous.number + 1:
            raise ValueError(
                f"Verse numbering is not consecutive: "
                f"{previous.number} is followed by {current.number}."
            )

    return title, verses


def render_title(title: str) -> str:
    """Escape a title and turn simple Markdown emphasis into citation markup."""
    escaped_title = html.escape(title, quote=True)
    return EMPHASIS_PATTERN.sub(r"<cite>\1</cite>", escaped_title)


def annotate_repeated_tokens(text: str) -> str:
    """Add Unicode subscripts to token occurrences after the first."""
    seen: dict[str, int] = {}
    rendered_parts: list[str] = []
    cursor = 0

    for match in TOKEN_PATTERN.finditer(text):
        rendered_parts.append(html.escape(text[cursor : match.start()]))

        token = match.group()
        normalized_token = token.casefold()
        previous_occurrences = seen.get(normalized_token, 0)
        seen[normalized_token] = previous_occurrences + 1

        rendered_parts.append(html.escape(token))
        if previous_occurrences:
            rendered_parts.append(
                str(previous_occurrences).translate(SUBSCRIPT_TRANSLATION)
            )

        cursor = match.end()

    rendered_parts.append(html.escape(text[cursor:]))
    return "".join(rendered_parts)


def build_document(title: str, verses: list[Verse]) -> str:
    """Render a complete HTML document."""
    plain_title = title.replace("*", "")
    verse_items = "\n".join(
        (
            f'        <li id="verse-{verse.number}" '
            f'value="{verse.number}" data-line="{verse.number}">'
            f"{annotate_repeated_tokens(verse.text)}</li>"
        )
        for verse in verses
    )

    return f"""<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="{html.escape(plain_title, quote=True)}" />
    <title>{html.escape(plain_title)}</title>
    <link rel="icon" href="data:," />
    <link rel="stylesheet" href="css/iliad.css" />
    <script src="js/hypothesis_color.js"></script>
    <script src="https://hypothes.is/embed.js" async="async"></script>
  </head>
  <body>
    <main class="edition">
      <header class="edition-header">
        <h1>{render_title(title)}</h1>
      </header>
      <ol class="poem" start="{verses[0].number}" aria-label="Iliad passage">
{verse_items}
      </ol>
    </main>
  </body>
</html>
"""


def build(source_path: Path, output_path: Path) -> None:
    """Build the HTML file and create its parent directory when necessary."""
    title, verses = parse_source(source_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        build_document(title, verses),
        encoding="utf-8",
    )


def parse_arguments() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Convert a numbered Iliad passage into annotation-ready HTML."
    )
    parser.add_argument("input", type=Path, help="Path to the numbered UTF-8 text")
    parser.add_argument("output", type=Path, help="Path to the generated HTML file")
    return parser.parse_args()


def main() -> None:
    """Run the command-line builder."""
    arguments = parse_arguments()
    try:
        build(arguments.input, arguments.output)
    except (OSError, ValueError) as error:
        raise SystemExit(f"error: {error}") from error


if __name__ == "__main__":
    main()
