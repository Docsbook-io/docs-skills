---
name: docs-analyze
description: Run a full audit of your documentation in one command. Orchestrates 10 specialized analyses — content type, structure, style, audience, links, SEO, a11y, i18n, media, maintenance — and returns a single prioritized report you can hand to the writer. Works on one page, a folder, or the entire docs/ tree.
metadata:
  version: 1.0.0
  category: analysis
  requires_docsbook_mcp: true
  uses_mcp_tools:
    - list_workspaces
    - get_workspace
    - get_doc_graph
    - read_doc_sections
  keywords: [audit, review, analysis, quality, orchestrator, documentation]
---

# docs-analyze — Documentation Analysis Orchestrator

## Before Starting

1. **Ask for the repository.** Request the GitHub repo URL or `{user}/{repo}` slug from the user.
2. **Check Docsbook workspace.** Run `mcp__docsbook__list_workspaces` to see if the project is already indexed.
   - If found → proceed with `mcp__docsbook__get_doc_graph` to fetch the full documentation graph.
   - If not found → offer to create it: "This repo isn't in Docsbook yet. Want me to add it with `create_workspace`?"
3. **Get the doc graph.** Use `mcp__docsbook__get_doc_graph` to retrieve all pages, their titles, sections, and link relationships.
   - If the graph is **missing or empty** → run `mcp__docsbook__reindex_doc_graph` to generate it, then retry.
   - If the graph returns a **stale warning** → offer to reindex: "The doc graph is over 7 days old. Reindex now for accurate results?"
4. **Clarify scope.** Ask which analysis areas matter most, or run all by default.

---

## Core Principles

### 1. Analyze, don't rewrite
Report findings with severity and a concrete suggestion. Don't edit docs — surface what needs fixing and let the team decide.

### 2. Impact-first prioritization
Fix high-traffic Tier 1 pages (quick-start, pricing, auth) before obscure reference pages. A broken quick-start costs more than a broken edge-case guide.

### 3. Cross-skill findings compound
A page with a bad title (SEO), missing image alt (accessibility), and stale content (maintenance) has triple the impact. Surface cross-cutting issues together.

### 4. Use Docsbook MCP as the primary data source
Fetch content via `mcp__docsbook__read_doc_sections` — this works for any public GitHub repo indexed in Docsbook, not just local checkouts.

---

## Available Analysis Skills

| Skill | Scope | When to Use |
|---|---|---|
| `docs-content-types` | Per-page Diátaxis classification | Content is mixed or confusing |
| `docs-structure-templates` | Frontmatter, headings, code blocks | New docs or structural audit |
| `docs-style-tone` | Voice, filler words, terminology | Writing quality review |
| `docs-audience` | Vocabulary mismatch, assumed knowledge | Onboarding issues, user complaints |
| `docs-navigation-linking` | Broken links, orphan pages, anchor text | Navigation complaints, post-restructure |
| `docs-seo` | Title, description, topic clusters | SEO audit, traffic drop |
| `docs-accessibility` | Alt text, heading hierarchy, WCAG 2.1 AA | A11y audit, compliance |
| `docs-i18n` | Language parity, stale translations, hreflang | Adding languages, i18n audit |
| `docs-media` | Images, screenshots, diagrams, file names | Media quality review |
| `docs-maintenance` | Stale content, deprecated pages, TODO/FIXME | Quarterly audit |

---

## Workflow

### Step 1 — Connect to Docsbook

```
mcp__docsbook__list_workspaces                          → find the workspace
mcp__docsbook__get_workspace                            → get workspace details (plan, languages, settings)
mcp__docsbook__get_doc_graph({ format: "toon" })        → get full page tree (compact TOON format)
```

The graph is returned in TOON format — a compact tree notation:
```
docs/
  quick-start.md [Quick Start] @quick-start
    #installation @quick-start/installation
    #configuration @quick-start/configuration
  guides/
    custom-domain.md [Custom Domain] @guides/custom-domain
      #dns-setup @guides/custom-domain/dns-setup
```
Use `@ref` values as `canonical_ref` arguments when calling `mcp__docsbook__read_doc_sections`.

If the workspace doesn't exist yet:
```
mcp__docsbook__create_workspace({
  github_owner: "{user}",
  github_repo: "{repo}"
})
```

### Step 2 — Identify Tier 1 pages

From the doc graph, flag pages likely to be Tier 1:
- Quick start / Getting started
- Pricing / Plans
- Authentication / Login
- Installation / Setup

These get audited first regardless of scope.

### Step 3 — Run analysis skills in parallel

Spawn Agent calls in a single message for independent skills:

```
Agent(docs-content-types)       → classify each page type
Agent(docs-structure-templates) → check frontmatter, headings
Agent(docs-style-tone)          → check voice and clarity
Agent(docs-audience)            → check vocabulary level
Agent(docs-seo)                 → check title, description, links
Agent(docs-accessibility)       → check alt text, headings, captions
Agent(docs-maintenance)         → check stale content, TODOs
```

Run sequentially when one depends on another:
- `docs-navigation-linking` needs the full doc graph (from Step 1)
- `docs-i18n` needs `get_workspace` language settings first

### Step 4 — Aggregate results

Collect JSON issues from all skills. Deduplicate cross-skill findings (e.g., missing alt = both a11y + SEO issue — report once under the higher severity, note both skills).

### Step 5 — Produce the final report

```markdown
# Documentation Analysis Report
**Repository:** {user}/{repo}
**Date:** {date}
**Pages analyzed:** {count}

## Summary
| Severity | Count |
|---|---|
| 🔴 Critical | N |
| 🟠 High | N |
| 🟡 Medium | N |
| 🟢 Low | N |

## Critical Issues
{list critical issues with file, rule, suggestion}

## High Priority Issues
{list high issues}

## Recommendations by Area
### Content Quality
### SEO
### Accessibility
### Maintenance

## Quick Wins (fixable in < 30 min)
{low-effort, high-impact items}
```

---

## Output Format

Each sub-skill returns JSON issues. The orchestrator aggregates them:

```json
[
  {
    "type": "missing_frontmatter_title",
    "severity": "critical",
    "skill": "docs-structure-templates",
    "location": "docs/quick-start.md",
    "found": "No title in frontmatter. Page has no <title> tag and will not rank in search.",
    "suggestion": "Add to frontmatter: title: 'Get Started with Docsbook in 30 Seconds'",
    "action": "add_frontmatter_field",
    "constraints": {
      "field": "title",
      "max_length": 60
    }
  },
  {
    "type": "image_missing_alt",
    "severity": "high",
    "skill": "docs-accessibility",
    "location": "docs/guides/custom-domain.md#line-34",
    "found": "![](screenshots/dns-settings.png) — informative image with no alt text.",
    "suggestion": "Add descriptive alt: '![DNS settings panel showing CNAME record for custom domain](screenshots/dns-settings.png)'",
    "action": "add_alt_text",
    "constraints": {
      "max_length": 125
    }
  }
]
```

---

## Task-Specific Questions

When invoked directly, ask:

1. **Which skills to run?** All, or specific areas (SEO / a11y / maintenance / style)?
2. **Tier 1 pages** — which pages are most business-critical for this project?
3. **Threshold for stale content** — 90 days, 180 days, or custom?
4. **Languages in scope** for i18n check (if multiple languages enabled)?
5. **Output format** — terminal report, GitHub issue list, or JSON file?

---

## Tool Integrations

| Tool | Purpose |
|---|---|
| `mcp__docsbook__list_workspaces` | Find if repo is indexed in Docsbook |
| `mcp__docsbook__create_workspace` | Add repo to Docsbook if not yet indexed |
| `mcp__docsbook__get_workspace` | Get workspace settings (plan, languages) |
| `mcp__docsbook__get_doc_graph({ format: "toon" })` | Full page tree in compact TOON format |
| `mcp__docsbook__read_doc_sections` | Read content of specific pages/sections |
| `mcp__docsbook__reindex_doc_graph` | Refresh graph if stale warning returned |
| Agent tool | Spawn sub-skill agents in parallel |

---

## Related Skills

- `docs-content-types` — Diátaxis page type analysis
- `docs-structure-templates` — frontmatter and heading structure
- `docs-style-tone` — voice, clarity, filler words
- `docs-audience` — vocabulary mismatch, knowledge level
- `docs-navigation-linking` — broken links, orphan pages
- `docs-seo` — title, description, topic clusters
- `docs-accessibility` — WCAG 2.1 AA from markdown source
- `docs-i18n` — multilingual parity and freshness
- `docs-media` — images, screenshots, diagrams
- `docs-maintenance` — stale content, deprecated pages
