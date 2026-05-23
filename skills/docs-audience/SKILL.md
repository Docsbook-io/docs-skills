---
name: docs-audience
description: Analyzes how well documentation pages match their intended audience. Finds vocabulary mismatch, assumed knowledge gaps, mixed-audience confusion, and jargon density relative to stated prerequisites.
metadata:
  version: 1.0.0
  category: analysis
  requires_docsbook_mcp: true
  uses_mcp_tools:
    - list_workspaces
    - get_doc_graph
    - read_doc_sections
  keywords: [audience, persona, jargon, prerequisites, vocabulary]
---

# docs-audience — Audience Targeting Analysis

## Before Starting

1. **Get the repository.** Ask for the GitHub repo URL or `{user}/{repo}`.
2. **Check Docsbook.** Run `mcp__docsbook__list_workspaces` to find the workspace.
   - If found → use `mcp__docsbook__get_doc_graph` to get all pages.
   - If not found → offer to add it first.
3. **Check the graph.** If `get_doc_graph` returns an empty graph or no data → run `mcp__docsbook__reindex_doc_graph` to generate it, then retry. If it returns a stale warning, offer to reindex before proceeding.
3. **Read pages.** Use `mcp__docsbook__read_doc_sections` to access content.
4. **Identify stated audience.** Look for "who this is for", prerequisites, and page type signals before flagging vocabulary issues.

---

## Core Principles

### 1. Audience mismatch causes abandonment
A beginner hitting unexplained jargon on page 2 of a tutorial doesn't ask for help — they leave. A senior engineer reading basic hand-holding explanations in a reference page wastes time.

### 2. Stated vs. implied audience must align
If prerequisites say "No experience required" but the content uses "idempotent", "O(n²)", or "eventual consistency" without explanation — the page is lying to beginners.

### 3. Mixed audiences need separate pages
A page that tries to serve both beginners and experts serves neither well. Split into a getting-started page (for beginners) and an advanced guide (for experts).

### 4. Jargon isn't the enemy — undefined jargon is
Technical documentation can and should use precise technical terms. The rule is: define at first use, link to glossary, or ensure the stated prerequisites cover the term.

---

## Checklist

### Audience Declaration

- [ ] **Page states who it's for** — explicitly or via content type (tutorial = beginner, reference = anyone who knows the product)
- [ ] **Prerequisites are specific** — "Node.js 18+" not "some programming experience"
- [ ] **Assumed knowledge matches stated prerequisites** — if you say "no prerequisites", introduce every term
- [ ] **Page type signals audience** — tutorial = guided beginner, reference = expert lookup

### Vocabulary and Jargon

- [ ] **Technical terms are defined at first use** — inline or via a link
- [ ] **Abbreviations are spelled out** on first mention: "CLI (Command Line Interface)"
- [ ] **No undefined acronyms** beyond the declared knowledge level
- [ ] **Code concepts match audience level** — a beginner tutorial shouldn't use async/await without explaining it
- [ ] **Product-specific terms are defined** — "workspace", "doc graph", "reindex" explained when first introduced

### Beginner Pages (tutorials, getting started)

- [ ] **Step-by-step, no assumed shortcuts** — if a beginner must open a terminal, say "open your terminal"
- [ ] **Every command explained** — not just "run the command", but what it does
- [ ] **Expected output shown** — beginner needs to know if they're on track
- [ ] **Error handling included** — "if you see X, it means Y, do Z"
- [ ] **No "just" or "simply"** — implies ease the reader may not feel
- [ ] **Glossary links** for terms beyond beginner level

### Expert Pages (reference, advanced how-to)

- [ ] **No hand-holding in reference pages** — get to the information fast
- [ ] **Assume knowledge of the product** — don't explain what a workspace is in the API reference
- [ ] **Dense information is acceptable** — experts scan, they don't read linearly
- [ ] **Edge cases documented** — experts need the full picture including exceptions

### Mixed-Audience Signals (red flags)

- [ ] No single page mixes "open your terminal for the first time" with "configure the idempotency key"
- [ ] Navigation groups similar-level content together
- [ ] If a page must serve multiple audiences, it has clear section headers per audience

---

## What to Look For

| Severity | Problem | Detection |
|---|---|---|
| `critical` | Beginner tutorial uses expert terms with no definition | Jargon appears before any explanation |
| `high` | Prerequisites say "no experience needed" but content assumes coding knowledge | Mismatch between stated prereqs and actual content level |
| `high` | Single page serves beginner and expert simultaneously | "For beginners... For advanced users..." in same page |
| `high` | Abbreviation used without expansion at first mention | `CLI`, `API`, `SSO` with no prior definition |
| `medium` | Product term introduced without definition | "workspace", "doc graph" appear with no explanation on a beginner page |
| `medium` | Reference page over-explains basics | "First, what is an API?" in a reference section |
| `medium` | Tutorial assumes prior tutorial was read without linking it | "As we set up in the previous tutorial..." |
| `low` | No explicit "who this is for" on ambiguously-typed pages | Page type is unclear from title and content |
| `low` | Examples use too-complex data for the stated audience | Beginner tutorial uses a complex multi-step nested example |

---

## Output Format

```json
{
  "file": "docs/quick-start.md",
  "line": 34,
  "severity": "critical",
  "rule": "beginner-page-undefined-jargon",
  "found": "Line 34: 'Configure the webhook endpoint to handle idempotent requests.' — This is a getting-started page for new users, but 'idempotent' is undefined and not in the stated prerequisites.",
  "suggestion": "Either: (1) Remove idempotency handling from the quick-start (link to advanced guide), or (2) Add a plain-English explanation: 'Configure the webhook endpoint — this ensures the same event isn't processed twice if your server receives it more than once.'"
}
```

```json
{
  "file": "docs/guides/authentication.md",
  "line": 1,
  "severity": "high",
  "rule": "mixed-audience-page",
  "found": "Page starts with a step-by-step beginner guide (lines 1-60) then switches to an advanced section on token rotation and HMAC signature verification (lines 61-120) without a clear audience break.",
  "suggestion": "Split into two pages: (1) 'Set up authentication' — beginner how-to ending at OAuth token, and (2) 'Advanced authentication' — expert guide for token rotation and HMAC. Link between them."
}
```

```json
{
  "file": "docs/api/endpoints.md",
  "line": 5,
  "severity": "medium",
  "rule": "reference-over-explains",
  "found": "Lines 5-20 explain what an API endpoint is and how HTTP requests work. This is a reference page — readers consulting it already know this.",
  "suggestion": "Remove the HTTP basics explanation. Start directly with the endpoint table. Link to an external resource for readers who need HTTP basics."
}
```

---

## Task-Specific Questions

When invoked directly, ask:

1. **Who is the primary audience?** (developers / end users / both)
2. **What knowledge is assumed?** (programming basics / familiarity with the product / expert in the domain)
3. **Are there known user complaints** about content being too hard or too basic?

---

## Tool Integrations

| Tool | Purpose |
|---|---|
| `mcp__docsbook__list_workspaces` | Find workspace |
| `mcp__docsbook__get_doc_graph` | Page list and structure |
| `mcp__docsbook__read_doc_sections` | Read content for vocabulary analysis |

---

## Related Skills

- `docs-content-types` — content type determines expected audience
- `docs-style-tone` — tone adjustments per audience level
- `docs-structure-templates` — prerequisites section structure
- `docs-analyze` — orchestrator
