---
type: workflow
title: Flusso dell'edizione web
description: Definisce la fonte, il generatore, l'output e la marcatura dei versi usati per l'edizione web predisposta per l'annotazione.
tags:
  - html
  - python
  - poesia
  - annotazione
timestamp: 2026-07-05
language: it
translation: web-edition.eng.md
---

# Flusso dell'edizione web

## Ambito

La fonte iniziale è la traduzione inglese di Alexander Pope di *Iliade*
14.331–406 in [`texts/iliad-eng.txt`](../texts/iliad-eng.txt).

## Generazione

Eseguire:

```bash
./scripts/run.sh
```

Il wrapper risolve i percorsi del progetto indipendentemente dalla directory di
lavoro corrente e genera l'edizione web. Il generatore di testo sottostante
rimane disponibile per percorsi personalizzati:

```bash
python3 scripts/build_iliad_html.py <input.txt> <output.html>
```

Il generatore accetta un file di testo UTF-8 la cui prima riga è il titolo
dell'edizione. Ogni riga successiva non vuota deve contenere il numero del
verso, uno spazio e il testo del verso. I numeri dei versi devono essere
consecutivi.

## Convenzioni dell'output

- Il documento generato è `web/iliad-eng.html`.
- La marcatura generata è HTML5 ben formato come XML e compatibile con XHTML,
  con namespace XHTML esplicito, elementi vuoti chiusi e attributi booleani
  espressi per esteso.
- Le regole di presentazione si trovano in `web/css/iliad.css`.
- La pagina carica `js/hypothesis-cat-color.js` prima dell'embed remoto
  ufficiale di Hypothes.is.
- Il passo è una lista ordinata con un elemento `li` per ogni verso.
- Ogni verso ha un identificatore stabile `verse-N`, un valore di lista
  esplicito e un attributo `data-line`.
- Il marcatore nativo della lista mostra in marrone il numero del verso senza
  aggiungerlo al testo selezionabile.
- Il confronto tra token non distingue maiuscole e minuscole ed è limitato al
  singolo verso. La prima occorrenza resta invariata; ogni occorrenza successiva
  riceve un pedice Unicode numerato a partire da `₁`. Il contatore è indipendente
  per ogni token e riparte in ciascun verso.
- Il generatore applica l'escape HTML al testo di partenza.

## Concetti correlati

- [Lingua del progetto e documentazione bilingue](project-language.ita.md)
- [Indice della raccolta di conoscenza](index.ita.md)
