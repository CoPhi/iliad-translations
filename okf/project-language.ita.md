---
type: convention
title: Lingua del progetto e documentazione bilingue
description: Definisce l'inglese come lingua ufficiale del progetto e richiede documenti Markdown inglesi e italiani allineati.
tags:
  - lingua
  - documentazione
  - convenzione
timestamp: 2026-07-05
language: it
translation: project-language.eng.md
---

# Lingua del progetto e documentazione bilingue

## Lingua ufficiale

L'inglese è la lingua ufficiale del progetto.

L'inglese deve essere usato per:

- il codice sorgente;
- i nomi di funzioni, variabili, classi, moduli, file e directory;
- i commenti e le docstring;
- configurazioni, schemi, test, script, messaggi di commit e metadati tecnici;
- ogni altro contenuto del progetto, salvo i documenti Markdown in italiano o
  i materiali di partenza la cui lingua originale deve essere preservata.

## Markdown bilingui

La conoscenza e la documentazione del progetto scritte in Markdown devono avere
versioni inglesi e italiane semanticamente allineate.

- I file inglesi usano il suffisso `.eng.md`.
- I file italiani usano il suffisso `.ita.md`.
- Ogni documento collega la propria controparte tramite il campo frontmatter
  `translation`.
- Ogni modifica a una versione deve includere la modifica corrispondente
  nell'altra.
- Le due versioni devono comunicare gli stessi fatti, decisioni, requisiti e la
  stessa struttura documentale; non è necessaria una traduzione letterale.

In caso di conflitto o ambiguità tra le due versioni, quella inglese è
considerata autorevole finché i documenti non vengono nuovamente allineati.

## Responsabilità editoriale

L'agente del progetto è responsabile di decidere quando e come aggiornare la
base di conoscenza in Markdown. Deve:

- registrare il nuovo contesto durevole e le nuove decisioni, convenzioni e
  limitazioni quando diventano rilevanti;
- aggiornare entrambe le versioni linguistiche nella stessa modifica;
- mantenere i documenti sintetici, atomici, reperibili e collegati tra loro;
- riorganizzare o suddividere i documenti quando ciò migliora il recupero delle
  informazioni e la chiarezza;
- evitare di registrare discussioni temporanee, ipotesi o dettagli ridondanti
  come conoscenza consolidata del progetto;
- contrassegnare chiaramente le informazioni ignote, provvisorie o inferite.

La manutenzione ordinaria della conoscenza non richiede una richiesta separata.
Le modifiche sostanziali all'ambito o alle politiche del progetto richiedono
comunque una decisione del responsabile del progetto.

## Concetti correlati

- [Indice della raccolta di conoscenza](index.ita.md)
