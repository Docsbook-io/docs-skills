---
name: docs-seo
description: Analyzes SEO of technical documentation — title/description optimization, heading hierarchy, keyword placement, internal topic clusters, image alt text, and GEO/AI Overviews compatibility. Documentation-specific SEO, not a general site audit.
metadata:
  version: 1.0.0
  category: analysis
  requires_docsbook_mcp: true
  uses_mcp_tools:
    - list_workspaces
    - get_doc_graph
    - read_doc_sections
  keywords: [seo, meta, titles, descriptions, keywords, geo, ai-overviews]
---

# docs-seo — SEO Analysis for Documentation

## Before Starting

1. **Public documentation only.** If the docs are private or internal, skip this skill.
2. **Get the repository.** Ask for the GitHub repo URL or `{user}/{repo}`.
3. **Check Docsbook.** Run `mcp__docsbook__list_workspaces` to find the workspace.
   - If found → use `mcp__docsbook__get_doc_graph` to get all pages with titles and metadata.
   - If not found → offer to add it first.
4. **Check the graph.** If `get_doc_graph` returns an empty graph or no data → run `mcp__docsbook__reindex_doc_graph` to generate it, then retry. If it returns a stale warning, offer to reindex before proceeding.
4. **Read pages.** Use `mcp__docsbook__read_doc_sections` to access frontmatter, headings, and content.
5. **Cross-page checks require the full graph.** Duplicate titles and orphan pages can only be found by scanning all pages together.

---

## Core Principles

### 1. Documentation is your highest-intent organic traffic
Users searching "{product} how to X" or "{product} error Y" have purchase or retention intent. A well-optimized docs page outranks blog posts and converts better.

### 2. Title = search intent, not a label
"Authentication" is a label. "How to authenticate API requests with Docsbook" is a search intent. Users search for what they want to do, not for nouns.

### 3. Topic clusters build authority
Pages linked to each other on the same topic signal to search engines that you're authoritative on that topic. An isolated page has no link equity.

### 4. AI Overviews reward structure
Google AI Overviews, ChatGPT web search, and Perplexity prefer pages with a direct answer in the first paragraph, numbered lists, and self-contained sections. This is also what human readers prefer.

---

## Checklist

### Title (from frontmatter)

- [ ] **Present** — every page has a `title` field
- [ ] **50-60 characters** — longer gets truncated in SERP
- [ ] **Unique** — no two pages have the same title
- [ ] **Primary keyword near the start** — "Configure custom domain | Docsbook" not "Docsbook | Configure custom domain"
- [ ] **Search intent** — starts with a verb or question: "How to...", "Set up...", "Configure..."
- [ ] **Brand suffix** — "| Docsbook" for brand queries
- [ ] **Not keyword-stuffed** — one clear topic, not "Docsbook Custom Domain Setup Custom Domains"

**Bad:** `title: Authentication`
**Good:** `title: How to authenticate API requests | Docsbook`

### Description (from frontmatter)

- [ ] **Present** — every page has a `description` field
- [ ] **130-160 characters** — shorter is truncated, longer is cut in SERP
- [ ] **Active voice** — "Configure X to do Y" not "X can be configured"
- [ ] **Includes primary keyword** naturally
- [ ] **Outcome-focused** — "...in 5 minutes", "without CI/CD"
- [ ] **A complete sentence** — not a keyword list

**Bad:** `description: API keys, auth, tokens, configure`
**Good:** `description: Authenticate API requests to Docsbook using Bearer tokens. Get your API key from workspace settings in under a minute.`

### Heading Structure

- [ ] **One H1 per page** — generated from frontmatter title (no `# Heading` in body)
- [ ] **H2 → H3 → H4 in sequence** — no level skipping
- [ ] **Question-style H2** for FAQ-triggering sections: "How does X work?", "When should I use Y?"
- [ ] **Keyword variations** in H2/H3 — not exact repetition of title keyword
- [ ] **Descriptive, not click-bait** — "Configuration options" not "Let's get fancy"

### Body Content

- [ ] **Minimum 300 words** for competitive queries
- [ ] **Primary keyword in first paragraph** — naturally, not forced
- [ ] **TL;DR / direct answer** in first 2-3 sentences for AI Overviews
- [ ] **Structured content** — lists, tables — scannable for AI and humans
- [ ] **Semantic variations** — use synonyms and related terms naturally
- [ ] **Date signals** — `last_reviewed` or similar for freshness (technical pages)

### Images

- [ ] **Alt text on all informative images**
- [ ] **Alt describes content + context** — "Workspace settings panel with API key field highlighted"
- [ ] **File names are descriptive** — `custom-domain-dns-records.png` not `screenshot1.png`
- [ ] **No alt stuffing** — one natural description, not a keyword list

### Internal Links (Topic Clusters)

- [ ] **Every page links to related pages** — creates topic cluster
- [ ] **Pillar pages** (main topics) get inbound links from sub-pages
- [ ] **Anchor text includes target keyword** — "see the [custom domain guide](...)" not "see [this guide](...)"
- [ ] **No orphan pages** — every page has at least one inbound link

### URL / File Path

- [ ] **kebab-case** — `custom-domain.md` not `customDomain.md`
- [ ] **Short and descriptive** — `/guides/custom-domain` not `/articles/2024/how-to-set-up-a-custom-domain`
- [ ] **Hierarchy reflects topic** — `/guides/integrations/github` makes sense
- [ ] **Stable** — renames require redirects

---

## AI Overviews / GEO Checklist

Documentation increasingly appears in AI-generated answers (ChatGPT, Perplexity, Google AI Overviews):

- [ ] **Direct answer in first paragraph** — 2-3 sentences that stand alone
- [ ] **Numbered lists for procedures** — LLMs extract these cleanly
- [ ] **Self-contained H2 sections** — each section makes sense without reading the rest
- [ ] **Definition format** — "A workspace is a Docsbook container for one GitHub repository's documentation."
- [ ] **Specific numbers** — "under 30 seconds", "supports 15 languages", not "fast" and "many"
- [ ] **Cited sources** for non-obvious claims

---

## What to Look For

| Severity | Problem | Detection |
|---|---|---|
| `critical` | Missing `title` in frontmatter | Check all pages |
| `critical` | Duplicate title across pages | Compare all titles |
| `critical` | Multiple H1 in page body | Count `# ` lines |
| `high` | Title > 60 or < 30 characters | String length |
| `high` | Missing `description` | Check frontmatter |
| `high` | Title is a label, not search intent | No verb in title |
| `high` | Heading level skip (H2 → H4) | Parse heading sequence |
| `high` | Informative image without alt | `![]()` pattern |
| `high` | Orphan page — no inbound links | Graph analysis |
| `medium` | Description > 160 characters | String length |
| `medium` | No question-style H2 | No `?` in any H2 |
| `medium` | No TL;DR / direct answer at top | First paragraph analysis |
| `medium` | No internal links to related pages | Link count per page |
| `low` | Title without brand suffix | No `| ProductName` |
| `low` | File name not kebab-case | Pattern match |
| `low` | No `last_reviewed` on technical page | Missing frontmatter field |

---

## Output Format

```json
{
  "file": "docs/api/authentication.md",
  "line": 2,
  "severity": "high",
  "rule": "title-not-search-intent",
  "found": "title: 'Authentication' — this is a label, not a search intent. Users search 'how to authenticate API requests', not 'Authentication'.",
  "suggestion": "Change to: title: 'How to authenticate API requests | Docsbook' (52 chars, primary keyword near start)"
}
```

```json
{
  "file": "docs/quick-start.md",
  "line": 3,
  "severity": "high",
  "rule": "description-too-long",
  "found": "description is 212 characters — will be truncated in SERP at 160 characters, losing the CTA.",
  "suggestion": "Shorten to 130-160 characters while keeping the primary keyword and outcome. Example: 'Create a documentation site from your GitHub repo in 30 seconds. No CI/CD, no configuration, no setup.' (112 chars)"
}
```

```json
{
  "file": "docs/guides/custom-domain.md",
  "line": null,
  "severity": "high",
  "rule": "orphan-page",
  "found": "No other page links to docs/guides/custom-domain.md. It has no link equity and is invisible to most navigation flows.",
  "suggestion": "Add a link from docs/quick-start.md in 'Next steps': '[Set up a custom domain](../guides/custom-domain.md)'. Also add to the PRO features overview page."
}
```

---

## Task-Specific Questions

When invoked directly, ask:

1. **Primary keyword per page** — what does the team want each page to rank for?
2. **Include GEO/AI Overviews criteria?** (stricter structure requirements)
3. **Which pages are Tier 1?** (quick-start, pricing, auth — confirm priority order)
4. **Auto-suggest titles/descriptions** or just flag issues?

---

## Tool Integrations

| Tool | Purpose |
|---|---|
| `mcp__docsbook__list_workspaces` | Find workspace |
| `mcp__docsbook__get_doc_graph` | Full page list, metadata, link relationships |
| `mcp__docsbook__read_doc_sections` | Read frontmatter, headings, and content |
| `mcp__docsbook__update_seo` | Enable SEO features in Docsbook (PRO) |

---

## Related Skills

- `docs-structure-templates` — frontmatter structure overlaps
- `docs-navigation-linking` — topic clusters are an SEO + navigation concern
- `docs-accessibility` — alt text is shared between SEO and a11y
- `docs-analyze` — orchestrator
