# Iliad Translations

This project builds clean, annotation-ready web editions of Iliad translations.

## Build

Run the complete build from the repository root:

```bash
./scripts/run.sh
```

The command generates `web/iliad-eng.html` from the source passage. The page
loads `js/hypothesis-cat-color.js` before the official remote Hypothes.is
embed.

The underlying generator can also be called directly with custom input and
output paths:

```bash
python3 scripts/build_iliad_html.py texts/iliad-eng.txt web/iliad-eng.html
```

To inspect the generated site locally:

```bash
python3 -m http.server 8000 --directory web
```

Then open `http://127.0.0.1:8000/iliad-eng.html`.

## Knowledge

- [English knowledge bundle](okf/index.eng.md)
- [Italian knowledge bundle](okf/index.ita.md)
