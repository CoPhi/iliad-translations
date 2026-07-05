---
type: convention
title: Project language and bilingual documentation
description: Defines English as the project's official language and requires aligned English and Italian Markdown documents.
tags:
  - language
  - documentation
  - convention
timestamp: 2026-07-05
language: en
translation: project-language.ita.md
---

# Project language and bilingual documentation

## Official language

English is the official language of the project.

English must be used for:

- source code;
- function, variable, class, module, file, and directory names;
- comments and docstrings;
- configuration, schemas, tests, scripts, commit messages, and technical
  metadata;
- all other project content unless it is an Italian Markdown document or
  source material whose original language must be preserved.

## Bilingual Markdown

Project knowledge and documentation written in Markdown must have semantically
aligned English and Italian versions.

- English files use the `.eng.md` suffix.
- Italian files use the `.ita.md` suffix.
- Each document links to its counterpart through the `translation` frontmatter
  field.
- A change to one version must include the corresponding change to the other.
- The two versions must convey the same facts, decisions, requirements, and
  document structure; they need not be literal translations.

When a conflict or ambiguity exists between the two versions, the English
version is authoritative until both documents are brought back into alignment.

## Editorial responsibility

The project agent is responsible for deciding when and how to update the
Markdown knowledge base. It must:

- capture new durable context, decisions, conventions, and constraints when
  they become relevant;
- update both language versions in the same change;
- keep documents concise, atomic, discoverable, and internally linked;
- reorganize or split documents when that improves retrieval and clarity;
- avoid recording temporary discussion, speculation, or redundant detail as
  established project knowledge;
- clearly mark unknown, provisional, or inferred information.

Routine knowledge maintenance does not require a separate request. Material
changes to project scope or policy still require the project owner's decision.

## Related concepts

- [Knowledge bundle index](index.eng.md)
