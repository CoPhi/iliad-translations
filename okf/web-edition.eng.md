---
type: workflow
title: Web edition pipeline
description: Defines the source, generator, output, and verse markup used for the annotation-ready web edition.
tags:
  - html
  - python
  - poetry
  - annotation
timestamp: 2026-07-05
language: en
translation: web-edition.ita.md
---

# Web edition pipeline

## Scope

The initial source is Alexander Pope's English translation of *Iliad*
14.331–406 in [`texts/iliad-eng.txt`](../texts/iliad-eng.txt).

## Build

Run:

```bash
./scripts/run.sh
```

The wrapper resolves project paths independently of the current working
directory and builds the web edition. The underlying text generator remains
available for custom paths:

```bash
python3 scripts/build_iliad_html.py <input.txt> <output.html>
```

The generator accepts a UTF-8 text file whose first line is the edition title.
Every following non-empty line must contain a verse number, whitespace, and the
verse text. Verse numbers must be consecutive.

## Output conventions

- The generated document is `web/iliad-eng.html`.
- Generated markup is XML-well-formed, XHTML-compatible HTML5 with an explicit
  XHTML namespace, closed empty elements, and expanded boolean attributes.
- Presentation rules live in `web/css/iliad.css`.
- The page loads `js/hypothesis-cat-color.js` before the official remote
  Hypothes.is embed.
- The passage is an ordered list with one `li` element per verse.
- Each verse has a stable `verse-N` identifier, an explicit list value, and a
  `data-line` attribute.
- The native list marker displays the verse number in brown without adding it
  to the selectable verse text.
- Token matching is case-insensitive within each verse. The first occurrence is
  unchanged; each later occurrence receives a Unicode subscript numbered from
  `₁`. The counter is independent for each token and restarts in every verse.
- Source text is HTML-escaped by the generator.

## Related concepts

- [Project language and bilingual documentation](project-language.eng.md)
- [Knowledge bundle index](index.eng.md)
