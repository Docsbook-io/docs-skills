---
name: docs-accessibility
description: Analyzes accessibility (a11y) of markdown documentation — alt text, heading hierarchy, link anchor text, captions, code block language, and text readability. Target standard is WCAG 2.1 Level AA, applied to what is controllable from the markdown source.
metadata:
  version: 1.0.0
  category: analysis
  requires_docsbook_mcp: true
  uses_mcp_tools:
    - list_workspaces
    - get_doc_graph
    - read_doc_sections
  keywords: [accessibility, a11y, wcag, alt-text, headings, screen-reader]
---

# docs-accessibility — Accessibility Analysis (WCAG 2.1 AA)

## Before Starting

1. **Get the repository.** Ask for the GitHub repo URL or `{user}/{repo}`.
2. **Check Docsbook.** Run `mcp__docsbook__list_workspaces` to find the workspace.
   - If found → use `mcp__docsbook__get_doc_graph` to get all pages.
   - If not found → offer to add it first.
3. **Check the graph.** If `get_doc_graph` returns an empty graph or no data → run `mcp__docsbook__reindex_doc_graph` to generate it, then retry. If it returns a stale warning, offer to reindex before proceeding.
3. **Read pages.** Use `mcp__docsbook__read_doc_sections` to access content for analysis.
4. **Scope of this skill.** Contrast ratios and runtime keyboard behavior depend on the rendered theme — those require a live browser check. This skill covers what is detectable from markdown source.

---

## Core Principles

### 1. Accessibility is baseline, not a bonus
Docs that work only for sighted, mouse-using readers exclude a real portion of the audience — screen reader users, keyboard-only users, low-vision users, and users with cognitive differences.

### 2. Alt text, headings, and anchor text are the big three
These three patterns cover the majority of a11y issues detectable from markdown. Fix these first.

### 3. Semantic markdown beats HTML workarounds
`## Heading` is more accessible than `<div class="heading">`. Markdown is accessible by default when used correctly — don't fight it.

### 4. Color is never the only indicator
"Red items are errors" without a label, icon, or text backup is invisible to color-blind users. This applies to prose too.

---

## Checklist

### Images and Alt Text

- [ ] **All informative images have alt text** — `![alt](image.png)` not `![](image.png)`
- [ ] **Decorative images use empty alt** — `![](decoration.png)` — screen reader skips them
- [ ] **Alt does not start with "image of", "picture of", "screenshot of"** — screen readers already announce it's an image
- [ ] **Alt describes the content, not the file** — "Workspace settings with API key highlighted" not "settings.png"
- [ ] **Alt is 1-2 sentences, ≤ 125 characters** — longer descriptions go in the body text
- [ ] **Complex diagrams have a text alternative** in the body below the image
- [ ] **No critical information exists only inside an image** — text in images is not readable by screen readers

### Heading Hierarchy

- [ ] **One H1 per page** — generated from frontmatter title; do not add `# Title` in body
- [ ] **Levels are sequential** — H2 → H3 → H4, never H2 → H4
- [ ] **Sibling headings are unique** within a section
- [ ] **Headings are descriptive out of context** — a screen reader user jumping to a heading understands where they are
- [ ] **Headings are not used for visual styling** — don't use H4 just to make text smaller

### Links

- [ ] **Anchor text is meaningful out of context** — screen readers can list all links on a page
- [ ] **No "click here", "read more", "here", "this", "this link"**
- [ ] **Duplicate anchor text goes to the same destination** — two "Download" links should not go to different places
- [ ] **External links that open in a new tab are labeled** — "(opens in new tab)" or an icon with aria-label

### Lists

- [ ] **Numbered lists for sequential steps** — screen readers announce "list of 5 items, item 1..."
- [ ] **Bullet lists for unordered items** — not a paragraph with "and" connectors
- [ ] **Parallel grammatical structure** within a list

### Tables

- [ ] **Header row present** — in markdown: first row followed by `|---|` separator
- [ ] **Tables are not used for layout** — only for tabular data
- [ ] **No merged cells** — markdown tables don't support them; avoid the need for them
- [ ] **A caption or preceding paragraph** explains what the table shows

### Code Blocks

- [ ] **Language is specified** — ` ```bash `, ` ```json `, ` ```ts ` — enables screen reader context
- [ ] **Output is separated** from input in a distinct code block
- [ ] **Inline code in backticks** — not distinguished by color alone

### Video and Media

- [ ] **All videos have captions or subtitles**
- [ ] **Audio descriptions** for important visual information in videos
- [ ] **No auto-play** video or audio
- [ ] **A text alternative** exists for video content (transcript or written summary)

### Text Readability

- [ ] **Sentences under 25 words** on average
- [ ] **Paragraphs 2-4 sentences**
- [ ] **Abbreviations expanded** at first use — "MCP (Model Context Protocol)"
- [ ] **Jargon defined** inline or linked to glossary
- [ ] **No meaning conveyed by color alone** in prose — "the red fields" needs "the required fields (shown in red)"

### Markdown Hygiene

- [ ] **Use markdown syntax** instead of raw HTML where possible
- [ ] **If HTML elements are used** (e.g., `<details>`, `<summary>`), verify ARIA attributes are correct
- [ ] **Emoji are not used as functional indicators** — screen readers read emoji names aloud ("thumbs up emoji"), which disrupts flow when used as checkmarks or status icons

---

## What to Look For

| Severity | Problem | Detection |
|---|---|---|
| `critical` | Informative image without alt text | `![]()` pattern |
| `critical` | Multiple H1 in page body | Count `^# ` lines |
| `high` | Alt starts with "image of" / "picture of" | Regex on alt text |
| `high` | "click here" / "read more" anchor text | Grep pattern |
| `high` | Heading level skip (H2 → H4) | Parse heading sequence |
| `high` | Code block without language specifier | ` ``` ` with no language |
| `high` | Video without captions/transcript mentioned | iframe/video without caption note |
| `medium` | Generic alt: "Screenshot", "Diagram", "Image" | Regex on alt text |
| `medium` | Long paragraphs (> 6 sentences) | Sentence count |
| `medium` | Color-only meaning in prose | "red", "green" as sole indicators |
| `medium` | Table without header row | Parse table structure |
| `low` | Raw HTML used where markdown equivalent exists | `<div>`, `<span>` in content |
| `low` | Emoji used as functional indicator | Emoji at start of list items or as status |

---

## Output Format

```json
{
  "file": "docs/guides/setup.md",
  "line": 23,
  "severity": "critical",
  "rule": "image-missing-alt",
  "found": "Line 23: ![](screenshots/settings.png) — informative image with no alt text. Screen readers cannot describe it.",
  "suggestion": "Add descriptive alt: '![Workspace settings page with API key field highlighted at the top](screenshots/settings.png)'. If purely decorative, confirm with empty alt and no surrounding context that depends on it."
}
```

```json
{
  "file": "docs/api/errors.md",
  "line": 45,
  "severity": "medium",
  "rule": "color-only-meaning",
  "found": "Line 45: 'Red items in the log output indicate errors.' — meaning is conveyed by color only. Users with color blindness cannot distinguish them.",
  "suggestion": "Add a non-color indicator: 'Items prefixed with [ERROR] are shown in red in the log output.' or 'Error items (marked with ✕ and shown in red)...'"
}
```

```json
{
  "file": "docs/tutorials/first-deploy.md",
  "line": 67,
  "severity": "high",
  "rule": "heading-skip",
  "found": "H2 'Configuration' (line 45) is followed by H4 'Advanced options' (line 67), skipping H3. Screen reader navigation by heading becomes disorienting.",
  "suggestion": "Change H4 to H3, or add an intermediate H3 'Configuration sections' to group the content logically."
}
```

---

## Task-Specific Questions

When invoked directly, ask:

1. **Target standard?** WCAG 2.1 AA (default) or stricter AAA?
2. **Check rendered contrast?** Requires a live Docsbook preview URL — ask if available.
3. **Automated scanner?** axe-core or pa11y can be run on the rendered site for runtime checks.

---

## Tool Integrations

| Tool | Purpose |
|---|---|
| `mcp__docsbook__list_workspaces` | Find workspace |
| `mcp__docsbook__get_doc_graph` | Page list |
| `mcp__docsbook__read_doc_sections` | Read content for a11y pattern analysis |

---

## Related Skills

- `docs-seo` — alt text and heading hierarchy overlap with SEO
- `docs-style-tone` — plain language is also an accessibility concern
- `docs-media` — detailed media file analysis
- `docs-analyze` — orchestrator
