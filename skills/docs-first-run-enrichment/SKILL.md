---
name: docs-first-run-enrichment
description: Make a freshly-generated docs site rich and on-brand instead of a bare skeleton. Bundles two passes in sequence — (1) auto-brand from the source project's real signals (README, website theme-color, og:image, logo/favicon, repo name), and (2) enriched-structure generation that produces a multi-section site (getting-started, concepts, guides, reference, hero/landing) from audience, style-tone, content-type, and navigation heuristics. Run during first-generation, before commit_docs. Pair with docs-create.
metadata:
  version: 1.0.0
  category: creation
  requires_docsbook_mcp: true
  uses_mcp_tools:
    - get_workspace
    - update_branding
    - read_website
    - scan_github_repo
  keywords: [first-run, branding, enrichment, multi-section, hero, auto-brand, generation, sellable]
---

# docs-first-run-enrichment — Rich + Auto-Branded First Generation

The problem this skill solves: a freshly-generated docs site produced by bare defaults looks like a skeleton — one or two thin pages, no visible brand, generic typography. This skill runs **before** `commit_docs` and wires two passes together so the first thing the user sees is a sellable site, not a stub.

**Pass 1 — auto-brand from the source.** Extract real brand signals from whatever the user gave as source (URL, GitHub repo, description). Map those to the `update_branding` fields and apply silently. No invented colors.

**Pass 2 — enriched structure generation.** Decide on a multi-section outline derived from what the crawl found, then generate each section with the right content type (Diátaxis-aware), audience fit, style/tone, and navigation links wired between pages.

---

## When to use this skill

Load it automatically during first-time docs generation:
- The user gave a GitHub repo URL, a website URL, or a product description.
- No `commit_docs` has succeeded yet for this workspace.
- auto-mode is ON or the user chose this skill from the skill-selection question.

Skip it (or skip Pass 1 only) when:
- The workspace already has human-set branding — do not overwrite it.
- A second or later generation run (enrichment is additive, not restorative).
- The user explicitly said "skip branding" or "minimal / bare output".

---

## Pass 1 — Auto-brand from the source

### 1.1 Collect brand signals

Gather these in order; stop once you have enough (anchor color + name):

| Source | What to pull | How |
|---|---|---|
| Source **website URL** | `theme-color` meta, `og:image`, `<title>` / `og:site_name`, favicon `href` | `read_website(url)` |
| **GitHub repo** | README brand mentions (hex codes, "our teal/blue/…"), `package.json` `name` + `description`, social preview image | `scan_github_repo(owner, repo)` |
| Workspace **current branding** | `accent_color`, `logo_url`, `icon_url`, `custom_name` — anything already set by a human | `get_workspace()` |
| **Logo/icon URL** | Dominant non-neutral color | Describe by hex from the visible hue if the URL is an SVG/PNG you can read |

Record every signal with its source string. A missing signal is noted as missing — never filled with a guess.

### 1.2 Derive the palette (one pass, no ask)

On first-run, apply the best available palette silently (no `ask_user`). The user will see the result immediately; they can refine it after. Follow the methodology from `docs-branding`:

1. **Anchor color** = site `theme-color` → logo dominant color → README hex → none (skip color update if no signal).
2. **Light-mode accent** = anchor color, sanity-checked for WCAG 2.1 AA (≥ 4.5:1 against white). If it fails, lighten the lightness until it passes; keep the hue.
3. **Muted companion** = same hue, saturation dropped to ~20 %, lightness pushed toward the background. Not a second accent.
4. **Dark-mode accent** = anchor with lightness raised to stay legible on near-black (target 4.5:1 against `#0b0d10`).
5. **Foreground / background** = `#111827` / `#ffffff` light; `#e5e7eb` / `#0b0d10` dark — unless the brand uses a tinted surface.
6. **Font** = leave unchanged unless the repo README or website CSS explicitly names a Google Font.
7. **custom_name** = site brand name → GitHub repo name (the part after `/`). Only set if not already set.

Call `update_branding` with exactly the derived fields. Echo what was set and from which signal.

### 1.3 Logo / favicon

If `og:image` or a favicon URL was found during the crawl:
- Set `icon_url` to the favicon URL (prefer a 32×32 or 64×64 `.png` over `.ico`).
- Set `logo_url` to `og:image` only if it looks like a product logo (not a screenshot or card image — heuristic: ≤ 512 px tall, no text overlay detected).

If neither is available, skip — do not fabricate URLs.

---

## Pass 2 — Enriched multi-section structure

### 2.1 Decide the section outline

Before generating any pages, derive the structure from what the crawl returned:

| Signal | Sections to include |
|---|---|
| GitHub repo with README + source code | Getting Started, Core Concepts, Guides (at least 2 topics), API Reference stub |
| Website with marketing copy | Hero / Overview page, Getting Started, Core Concepts, one or two How-To guides |
| Plain description / idea only | Hero / Overview, Getting Started, Core Concepts |
| Existing docs site (Mintlify, GitBook, etc.) | Mirror the source structure; add any missing Diátaxis types |

**Minimum output for a "sellable" first generation:**
- **index.md / README.md** — hero / overview page with a value proposition sentence, quick-start CTA, and 3-column feature highlights
- **getting-started.md** — tutorial: prerequisites, install/setup steps, first "hello world" moment
- **concepts.md** (or `concepts/` folder) — explanation: what the product is, key mental models, how the pieces fit
- At least **one guide** (`guides/<topic>.md`) — how-to: concrete task, outcome-oriented
- (Optional, if API/CLI is detected) **reference.md** — reference: command / endpoint list, parameters

Do NOT generate these sections if the crawl found no relevant content for them. A well-scoped 3-page site is better than 5 thin stubs.

### 2.2 Generate each section with Diátaxis discipline

For every page, follow the content-type rule for that section:

**Hero / index page (not a pure Diátaxis type — landing)**
- Opening sentence: product name + one-line value prop derived from the crawl (not invented).
- 3-column feature highlights: each feature is a real detected capability, not a generic placeholder.
- "Get started in 5 minutes" CTA linking to getting-started.md.
- No marketing adjectives ("powerful", "robust", "seamlessly") — describe specifics.

**Getting Started (tutorial)**
- Prerequisites section at the top with specific versions.
- Numbered steps; every step has a command or a UI action + its expected output.
- "What you'll learn" header before step 1.
- Ends with a "Next steps" section linking to concepts.md and the first guide.

**Concepts / Core Concepts (explanation)**
- No steps, no commands — pure explanation of the mental model.
- Headers are noun phrases, not imperatives.
- Ends with links to the relevant how-to guides.

**Guide (how-to)**
- Goal stated in the title: "How to [do X]".
- Numbered steps, goal-first.
- No background theory — link to concepts for that.
- Ends with "Related: [concept page], [next guide]".

**Reference (reference)**
- Tabular: command / endpoint / parameter → description → example.
- Present tense, no narrative prose.

### 2.3 Style and tone pass (inline, not a separate step)

Apply while writing each page:
- Active voice, second person ("you"), imperative for instructions.
- No filler: no "simply", "just", "easily", "powerful", "robust".
- Consistent terminology: if the product calls it a "workspace" in the README, call it a "workspace" in every page — never "project", "space", or "repo" interchangeably.
- Each page has YAML frontmatter: `title` (50–60 chars, search-intent), `description` (130–160 chars, active voice, includes outcome).

### 2.4 Navigation links (wired at generation time)

Every page must:
- Link to at least one other page in the site (no orphans).
- Have a "Next steps" or "Related" section at the bottom.
- Use descriptive anchor text ("Read the concepts guide" not "click here").

The index / hero page links to every section. Every leaf page links back to the hero and to at least one sibling.

---

## Guardrails

- **Never invent brand colors, logos, or product names.** If no signal exists, skip that field.
- **Never overwrite human-set branding** already on the workspace. Check `get_workspace()` first; if `accent_color` is already set (non-null, non-default `#000000`), skip the color update and say so.
- **Never generate placeholder content** ("Lorem ipsum", "Company Name", "Add description here"). Every sentence must come from or be derivable from the crawled content. If the crawl was too thin to write a page, skip that page and note it.
- **First-run only.** This skill applies to brand-new workspaces or first-time generation. Do not re-apply Pass 1 (branding) on a subsequent run unless the user explicitly asks for a re-brand.
- **No `ask_user` in Pass 1 or Pass 2** on the auto-mode path. The whole point is silent enrichment that shows results without asking. If auto-mode is OFF, surface a single summary ask_user at the end: "I've applied these branding values and generated a 5-page site — approve to commit or adjust first?"
- **Do not fail the pipeline** if a signal is missing. A missing logo URL means no `icon_url` update, not an error. Missing anchor color means color update is skipped, not an error.

---

## MCP Tools

| Tool | Purpose |
|------|---------|
| `mcp__docsbook__get_workspace` | Read existing branding to avoid overwriting human-set values |
| `mcp__docsbook__update_branding` | Write only the derived color / name / logo fields |
| `mcp__docsbook__read_website` | Extract theme-color, og:image, title, favicon from source URL |
| `mcp__docsbook__scan_github_repo` | Read README and package.json for brand signals and product content |

---

## Output contract

After running both passes, report in a single message:

```
Auto-brand applied:
  • custom_name: <value> (from <source>)
  • accent_color: <hex> (from <source>, WCAG ratio <n>:1 ✓)
  • muted_color: <hex>
  • icon_url: <url> (from <source>) [or: skipped — no favicon found]
  • logo_url: <url> [or: skipped]

Generated structure:
  • index.md — hero/overview
  • getting-started.md — tutorial (N steps)
  • concepts.md — explanation
  • guides/<topic>.md — how-to
  [list each page with type + line count]

Ready to commit. [If auto-mode OFF: approve or adjust before committing.]
```

---

## Related Skills

- `docs-branding` — interactive branding with user confirmation; use when refining brand AFTER first generation
- `docs-create` — full end-to-end pipeline; this skill is the enrichment + branding layer inside it
- `docs-structure-templates` — audit structure AFTER generation
- `docs-style-tone` — audit prose AFTER generation
- `docs-content-types` — audit Diátaxis classification AFTER generation
- `docs-navigation-linking` — audit link graph AFTER generation
