# Traduzioni dell'Iliade

Questo progetto genera edizioni web pulite e predisposte per l'annotazione di
traduzioni dell'Iliade.

## Generazione

Eseguire la generazione completa dalla directory principale del repository:

```bash
./scripts/run.sh
```

Il comando genera `web/iliad-eng.html` dal passo sorgente. La pagina carica
`js/hypothesis-cat-color.js` prima dell'embed remoto ufficiale di Hypothes.is.

Il generatore sottostante può anche essere richiamato direttamente indicando
percorsi di input e output personalizzati:

```bash
python3 scripts/build_iliad_html.py texts/iliad-eng.txt web/iliad-eng.html
```

Per esaminare localmente il sito generato:

```bash
python3 -m http.server 8000 --directory web
```

Aprire quindi `http://127.0.0.1:8000/iliad-eng.html`.

## Conoscenza

- [Raccolta di conoscenza in inglese](okf/index.eng.md)
- [Raccolta di conoscenza in italiano](okf/index.ita.md)
