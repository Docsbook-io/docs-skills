---
name: docs-style-tone
description: Tighten the prose of your docs without rewriting by hand. Flags passive voice, filler words, marketing adjectives, runaway sentences, missing second person and inconsistent terminology — and returns issues per page without touching the files. Pair with /docs-create or /docs-analyze.
metadata:
  version: 1.0.0
  category: analysis
  requires_docsbook_mcp: true
  uses_mcp_tools:
    - list_workspaces
    - get_doc_graph
    - read_doc_sections
  keywords: [style, tone, voice, passive, filler, writing, terminology]
---

# docs-style-tone — Style and Tone Analysis

## Before Starting

1. **Get the repository.** Ask for the GitHub repo URL or `{user}/{repo}`.
2. **Check Docsbook.** Run `mcp__docsbook__list_workspaces` to find the workspace.
   - If found → use `mcp__docsbook__get_doc_graph` to get all pages.
   - If not found → offer to add it first.
3. **Check the graph.** If `get_doc_graph` returns an empty graph or no data → run `mcp__docsbook__reindex_doc_graph` to generate it, then retry. If it returns a stale warning, offer to reindex before proceeding.
3. **Read page content.** Use `mcp__docsbook__read_doc_sections` to access the text of each page.
4. **Sample first, then deep-dive.** Read a few pages across different types (tutorial, reference, how-to) to calibrate the general style before flagging specifics.

---

## Core Principles

### 1. Clarity over cleverness
Technical documentation exists to transfer knowledge efficiently. Every unnecessary word, passive construction, or vague adjective adds friction.

### 2. Voice consistency across pages
A user reading multiple pages should feel they're in the same product. Inconsistent terminology ("workspace" vs. "project" vs. "repo") creates confusion and support tickets.

### 3. Second person, present tense
Address the reader as "you". Use present tense. "Click Save" not "You will need to click Save" or "The Save button should be clicked."

### 4. Marketing language belongs in marketing copy
"Powerful", "robust", "seamless", "easy", "simply", "just" — these words are empty in documentation and can feel condescending when a reader is stuck.

---

## Checklist

### Voice and Person

- [ ] **Active voice is the default** — "The system returns an error" → "Docsbook returns an error"
- [ ] **Second person ("you")** — not third person ("the user") or first person plural ("we recommend")
- [ ] **Imperative for instructions** — "Click Save" not "You should click Save"
- [ ] **Present tense** — "This returns a JSON object" not "This will return a JSON object"
- [ ] **First person plural is acceptable** for opinions only — "We recommend using X" in explanation pages

### Filler and Marketing Words

Words to flag (not ban — context matters, but flag for review):

| Word/Pattern | Why It's a Problem |
|---|---|
| "simply", "just", "easily" | Condescending when reader is stuck |
| "powerful", "robust", "flexible" | Empty marketing words with no specifics |
| "seamlessly", "effortlessly" | Promises that may not match user experience |
| "of course", "obviously", "naturally" | Excludes readers who don't find it obvious |
| "please note that" | Filler before a note — use a callout instead |
| "in order to" | Replace with "to" |
| "utilize" | Replace with "use" |
| "leverage" | Replace with "use" |
| "make sure to" | Replace with "ensure" or remove |

### Sentence Length and Structure

- [ ] **Sentences under 25 words** on average
- [ ] **Paragraphs 2-4 sentences** — no wall-of-text paragraphs
- [ ] **One idea per sentence** — split compound sentences when they contain two distinct ideas
- [ ] **Lists for 3+ parallel items** — not a run-on sentence with "and" connectors
- [ ] **Lead with the main clause** — avoid burying the key information at the end

### Headings

- [ ] **Sentence case** — "Set up a custom domain" not "Set Up A Custom Domain"
- [ ] **No click-bait headings** — "You won't believe how easy this is" has no place in docs
- [ ] **Descriptive, not clever** — "Configuration options" not "Getting fancy"
- [ ] **Parallel structure** in sibling headings — all nouns, or all verb phrases, not mixed

### Terminology Consistency

- [ ] **Single term for each concept** — pick one and stick to it
- [ ] **Define terms at first use** — especially abbreviations and jargon
- [ ] **Product names are exact** — "Docsbook" not "docsbook", "DocBook", or "docs book"
- [ ] **No synonyms for the same UI element** — if it's called "workspace" in the UI, call it "workspace" everywhere

### Tone by Page Type

| Type | Expected Tone |
|---|---|
| Tutorial | Encouraging, supportive — "You've just created your first workspace!" |
| How-to guide | Efficient, task-focused — no preamble, get to the steps |
| Reference | Neutral, precise — no personality, just facts |
| Explanation | Conversational but authoritative — "Here's why this matters..." |

---

## What to Look For

| Severity | Problem | Detection |
|---|---|---|
| `high` | Terminology inconsistency — same concept, different words | grep for "workspace\|project\|repo" in same context |
| `high` | Passive voice in instructions | "is clicked", "should be set", "will be returned" |
| `high` | "simply" / "just" / "easily" in a how-to or tutorial | grep pattern |
| `medium` | Sentence over 40 words | Word count per sentence |
| `medium` | Marketing adjectives without specifics | "powerful", "robust", "seamless" |
| `medium` | Second-person inconsistency — mixed "you" and "the user" | grep pattern |
| `medium` | "In order to" (verbose) | Replace with "to" |
| `medium` | Heading not in sentence case | Capital letters in non-proper nouns |
| `low` | "Please note that" filler | Replace with a callout |
| `low` | "Utilize" instead of "use" | Direct replacement |
| `low` | Undefined abbreviation at first use | Scan for abbreviation patterns |

---

## Output Format

```json
{
  "type": "condescending_filler",
  "severity": "high",
  "skill": "docs-style-tone",
  "location": "docs/quick-start.md#line-23",
  "found": "'Simply click the Connect button and you're done.' — 'simply' implies the task is trivial, which feels dismissive when a user is stuck.",
  "suggestion": "Remove 'Simply': 'Click the Connect button to finish setup.'",
  "action": "remove_filler_word",
  "constraints": {
    "word": "simply"
  }
}
```

```json
{
  "type": "passive_voice_in_instruction",
  "severity": "high",
  "skill": "docs-style-tone",
  "location": "docs/guides/authentication.md#line-45",
  "found": "'The API key should be added to the .env file' — passive voice buries who does the action.",
  "suggestion": "Use active imperative: 'Add the API key to your .env file:'",
  "action": "rewrite_to_active_voice",
  "constraints": {}
}
```

```json
{
  "type": "terminology_inconsistency",
  "severity": "high",
  "skill": "docs-style-tone",
  "location": "docs/api/workspaces.md",
  "found": "Page uses 'workspace' (lines 1-30) and 'project' (lines 31-60) to refer to the same concept.",
  "suggestion": "Use 'workspace' consistently throughout, matching the UI label.",
  "action": "normalize_terminology",
  "constraints": {
    "canonical_term": "workspace",
    "replace": ["project"]
  }
}
```

```json
{
  "type": "marketing_adjective",
  "severity": "medium",
  "skill": "docs-style-tone",
  "location": "docs/concepts/architecture.md#line-8",
  "found": "'Docsbook's powerful indexing engine...' — 'powerful' adds no information.",
  "suggestion": "Replace with a specific claim: 'Docsbook's indexing engine processes a 500-page repo in under 30 seconds', or remove the adjective entirely.",
  "action": "replace_with_specific_claim",
  "constraints": {}
}
```

---

## Task-Specific Questions

When invoked directly, ask:

1. **Does this project have a style guide?** If yes, analyze against that. If no, use these defaults.
2. **Language?** Style rules differ for English vs. localized documentation.
3. **Which pages are highest priority?** Tier 1 pages (quick-start, pricing) first.
4. **How strict on passive voice?** Some technical writing intentionally uses passive for reference pages.

---

## Tool Integrations

| Tool | Purpose |
|---|---|
| `mcp__docsbook__list_workspaces` | Find workspace |
| `mcp__docsbook__get_doc_graph` | Page list |
| `mcp__docsbook__read_doc_sections` | Read content for style analysis |

---

## Related Skills

- `docs-content-types` — tone expectations differ per content type
- `docs-audience` — vocabulary level is a style decision
- `docs-accessibility` — plain language is also an accessibility concern
- `docs-analyze` — orchestrator
