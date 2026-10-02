# CodeTrainer Course Format v1

CodeTrainer courses are data packages. The application engine must not require source-code changes when a new course is added.

## Core model

A course contains:
- metadata: identity, title, version, technology/dialect and language;
- tree: learning nodes of arbitrary depth;
- concepts: reusable explanations of syntax and ideas;
- exercises: typing tasks linked to concepts.

There are no required fixed levels such as module/chapter/lesson. Every tree item is a node and may contain both `children` and `exercises`.

## Required course metadata

```json
{
  "formatVersion": 1,
  "id": "mysql",
  "title": "MySQL",
  "version": "0.1.0",
  "technology": "mysql",
  "language": "en",
  "explanationLanguage": "ru"
}
```

## Node

```json
{
  "id": "queries",
  "title": "Queries",
  "type": "topic",
  "exercises": ["mysql-select-001"],
  "children": []
}
```

`children` may be nested to any depth. `type` is descriptive metadata only and never controls nesting.

## Concept

```json
{
  "id": "mysql.select",
  "token": "SELECT",
  "kind": "keyword",
  "title": "SELECT",
  "explanation": "Выбирает данные."
}
```

Concepts are reusable across exercises.

## Exercise

```json
{
  "id": "mysql-select-001",
  "title": "Select all columns",
  "code": "SELECT * FROM movies;",
  "parts": [
    {"text":"SELECT","concept":"mysql.select"},
    {"text":" ","kind":"whitespace"},
    {"text":"*","concept":"mysql.all-columns"},
    {"text":" ","kind":"whitespace"},
    {"text":"FROM","concept":"mysql.from"},
    {"text":" ","kind":"whitespace"},
    {"text":"movies","concept":"mysql.table-name"},
    {"text":";","concept":"mysql.statement-end"}
  ]
}
```

Concatenating every `parts[].text` must reproduce `code` exactly. This lets the UI highlight the explanation that corresponds to the current typing position.

## Package layout

```text
courses/<course-id>/
  course.json
  concepts.json
  lessons/
    *.json
```

Large courses may use more lesson files without changing the engine.

## Design rules

1. Course content is data; React components must not contain course-specific knowledge.
2. The hierarchy has arbitrary depth.
3. Exercises may exist on any node, including nodes that also have children.
4. Explanations are referenced through concepts so repeated syntax is defined once.
5. `formatVersion` is mandatory for future migrations.
6. Course-specific dialect features belong to that course (for example MySQL-specific syntax in the MySQL course).
7. A future validator should reject duplicate IDs, missing concept references, invalid exercise references, and exercises whose parts do not reconstruct code.
