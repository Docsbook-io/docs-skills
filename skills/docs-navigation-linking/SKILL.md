---
name: docs-navigation-linking
description: Analyzes navigation structure and link quality across documentation — orphan pages, broken internal links, poor anchor text, over-deep hierarchy, and missing next-step links. Cross-file skill that requires the full doc graph.
metadata:
  version: 1.0.0
  category: analysis
  requires_docsbook_mcp: true
  uses_mcp_tools:
    - list_workspaces
    - get_doc_graph
    - read_doc_sections
  keywords: [navigation, links, orphan, broken-links, anchor, hierarchy]
---

# docs-navigation-linking — Navigation and Linking Analysis

## Before Starting

1. **Get the repository.** Ask for the GitHub repo URL or `{user}/{repo}`.
2. **Check Docsbook.** Run `mcp__docsbook__list_workspaces` to find the workspace.
   - If found → use `mcp__docsbook__get_doc_graph` to get all pages and their link graph.
   - If not found → offer to add it first.
3. **This is a cross-file skill.** You need the full doc graph to find orphan pages and broken links. Do not run on a single page in isolation.
4. **Check the graph.** If `get_doc_graph` returns an empty graph or no data → run `mcp__docsbook__reindex_doc_graph` to generate it, then retry. If it returns a stale warning, offer to reindex before proceeding.

---

## Core Principles

### 1. Navigation is the product's information architecture
Bad navigation means users can't find correct answers even when the content exists. Every orphan page, dead link, and vague "click here" erodes trust.

### 2. Orphan pages are invisible pages
A page with no inbound links won't be discovered through navigation — only through search. If it's not linked, it effectively doesn't exist for most users.

### 3. Anchor text is the link's promise
"Click here" gives the reader no context. "See the custom domain setup guide" tells the reader exactly what they'll find. Screen readers read anchor text aloud — make it meaningful.

### 4. Hierarchy depth is a UX signal
A navigation tree 5 levels deep hides content. If users can't reach a page in 3 clicks from the homepage, it's buried.

---

## Checklist

### Internal Links

- [ ] **All referenced pages exist** in the doc graph — no broken internal links
- [ ] **Relative paths are consistent** — avoid mixing `/docs/` absolute paths with `../` relative paths
- [ ] **Anchor links (`#section`) resolve** — the heading they target exists on the page
- [ ] **Linked pages are relevant** — links add value, not just bulk

### Orphan Pages

- [ ] **Every page has at least one inbound link** from another doc page
- [ ] **Exception:** root index/home page (expected to have no inbound from docs)
- [ ] **Orphan detection:** pull all `href` values from every page, compare to full page list

### Anchor Text Quality

- [ ] **No "click here"**, "read more", "here", "this link", "this page"
- [ ] **Anchor text describes the destination** — "see the authentication guide" not "see here"
- [ ] **No full URLs as anchor text** — `https://example.com/long-path` → use descriptive text
- [ ] **Consistent naming** — if the target page is called "Custom domain setup", call it that in all links to it

### Navigation Hierarchy

- [ ] **Maximum 3 levels deep** for most content (sidebar: section → subsection → page)
- [ ] **Tier 1 pages are accessible in 1 click** from homepage or top navigation
- [ ] **Related pages are grouped** — all guides together, all reference together
- [ ] **No dead-end pages** — every page has a "next step" or at minimum returns to a parent

### Next Steps and Cross-References

- [ ] **Tutorials end with "Next steps"** linking to related how-to guides
- [ ] **How-to guides link to related reference pages** for the commands they use
- [ ] **Reference pages link back** to the how-to or tutorial that demonstrates them
- [ ] **Concept pages link to the tutorial** that puts the concept into practice

### External Links

- [ ] **External links are stable** — prefer official documentation, not blog posts that may disappear
- [ ] **No broken external links** — check periodically; flag pages with external links in the report
- [ ] **External links open in a new tab** (if controlled at markdown level) or are explicitly labeled

---

## What to Look For

| Severity | Problem | Detection |
|---|---|---|
| `critical` | Broken internal link — referenced page does not exist | Compare link hrefs to doc graph pages |
| `critical` | Broken anchor link — heading does not exist on target page | Parse anchors vs. actual headings |
| `high` | Orphan page — no inbound links | Find pages with zero references in graph |
| `high` | "Click here" / "read more" anchor text | grep `\[click here\|\[read more\|\[here\]` |
| `high` | Navigation depth > 4 levels | Count levels in doc graph tree |
| `medium` | Tier 1 page (quick-start, pricing) not in top navigation | Not reachable in 1 click from homepage |
| `medium` | Tutorial has no "Next steps" section | Missing at end of tutorial pages |
| `medium` | Full URL used as anchor text | grep for `\[https://` |
| `low` | External link to unstable source (blog post, forum) | Non-official domain in external links |
| `low` | Related pages not cross-linked | Thematically adjacent pages with no links between them |

---

## Orphan Detection Pattern

Using the doc graph from `mcp__docsbook__get_doc_graph`:

1. Build a set of all page paths: `all_pages = {page.path for page in graph}`
2. Build a set of linked pages: `linked = {href for page in graph for href in page.links}`
3. Orphans: `all_pages - linked - {homepage}`

---

## Output Format

```json
{
  "file": "docs/guides/advanced-auth.md",
  "line": null,
  "severity": "high",
  "rule": "orphan-page",
  "found": "docs/guides/advanced-auth.md has no inbound links from any other documentation page. It is unreachable through navigation — only discoverable via direct URL or search.",
  "suggestion": "Add a link from docs/guides/authentication.md: 'For token rotation and HMAC signatures, see [Advanced authentication](../advanced-auth.md)'. Also add to the sidebar navigation."
}
```

```json
{
  "file": "docs/quick-start.md",
  "line": 67,
  "severity": "critical",
  "rule": "broken-internal-link",
  "found": "Line 67: [Connect your GitHub repo](../setup/github-integration.md) — the target file docs/setup/github-integration.md does not exist in the doc graph.",
  "suggestion": "Either: (1) Restore the missing page, or (2) Update the link to the correct path. Check git history for a rename or deletion."
}
```

```json
{
  "file": "docs/api/workspaces.md",
  "line": 23,
  "severity": "high",
  "rule": "poor-anchor-text",
  "found": "Line 23: 'For more information, [click here](../guides/workspaces.md).' — 'click here' provides no context about the destination.",
  "suggestion": "Replace with descriptive anchor: 'See the [workspace configuration guide](../guides/workspaces.md) for full details.'"
}
```

```json
{
  "file": "docs/tutorials/first-deploy.md",
  "line": null,
  "severity": "medium",
  "rule": "missing-next-steps",
  "found": "Tutorial 'Deploy your first site' ends abruptly with no 'Next steps' section. Users who complete it have no guided path forward.",
  "suggestion": "Add a 'Next steps' section at the end: '## Next steps\\n- [Set up a custom domain](../guides/custom-domain.md)\\n- [Enable AI chat](../guides/ai-chat.md)\\n- [View your analytics](../analytics/overview.md)'"
}
```

---

## Task-Specific Questions

When invoked directly, ask:

1. **Full doc graph or specific section?** Orphan detection requires the full graph.
2. **External links in scope?** Checking external link validity requires HTTP requests.
3. **What are the Tier 1 pages?** (quick-start, pricing, auth — confirm with user)

---

## Tool Integrations

| Tool | Purpose |
|---|---|
| `mcp__docsbook__list_workspaces` | Find workspace |
| `mcp__docsbook__get_doc_graph` | Full page list, link relationships, structure |
| `mcp__docsbook__read_doc_sections` | Read page content for anchor text analysis |
| `mcp__docsbook__reindex_doc_graph` | Refresh stale graph before analysis |

---

## Related Skills

- `docs-seo` — orphan pages have no inbound links = SEO problem too
- `docs-accessibility` — anchor text quality is an a11y requirement
- `docs-maintenance` — broken links are a maintenance issue
- `docs-analyze` — orchestrator
