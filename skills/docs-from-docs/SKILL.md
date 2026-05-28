---
name: docs-from-docs
description: Import existing documentation from Mintlify, GitBook, Docusaurus, Nextra, or VitePress into a clean docs-output/<name>/ folder ready for Docsbook. Preserves structure and content; normalises platform-specific syntax to plain Markdown. Use when migrating away from another docs platform.
metadata:
  version: 1.0.0
  category: creation
  requires_docsbook_mcp: false
  keywords: [import, migrate, mintlify, gitbook, docusaurus, nextra, vitepress, platform]
---

# docs-from-docs — Import from another docs platform

The actual work is done by the **`docs-platform-importer`** subagent (Haiku, pinned model) shipped in [docs-claude-plugins](https://github.com/Docsbook-io/docs-claude-plugins/blob/main/plugins/docs-create/agents/docs-platform-importer.md). This skill is the knowledge base — the subagent is the executor.

## Workflow

1. **Identify the platform.** Read the repo root for the marker file:

   | Marker | Platform |
   |---|---|
   | `mint.json` / `docs.json` | Mintlify |
   | `SUMMARY.md` at root | GitBook |
   | `docusaurus.config.js` / `.ts` | Docusaurus |
   | `theme.config.tsx` + Next.js | Nextra |
   | `.vitepress/config.*` | VitePress |
   | `astro.config.*` + `@astrojs/starlight` | Starlight |

2. **Read the navigation.** Each platform stores nav differently — `mint.json#navigation`, `SUMMARY.md`, `docusaurus.config.js#sidebars`, `.vitepress/config.ts#themeConfig.sidebar`. Build a flat list of `{label, sourcePath}` entries in display order.

3. **Copy and normalise pages.** For every entry, read the source `.md` / `.mdx` and write to `docs-output/<name>/<derived-path>.md`. Drop platform-specific frontmatter keys that don't translate; keep `title`, `description`, `slug`. Convert:
   - Mintlify `<Card>`, `<CardGroup>`, `<Accordion>`, `<Note>` → plain Markdown headings + lists, callouts as `> **Note:** ...`
   - Docusaurus `<Tabs>`, `<TabItem>` → headings (`### Tab name`) with content underneath
   - GitBook `{% hint %}` → `> **Hint:** ...`; `{% tabs %}` → headings
   - Nextra `<Callout>` → `> **Note:** ...`
   - Strip every `import` line at the top of `.mdx` files; Docsbook renders plain Markdown.

4. **Rewrite internal links.** Replace platform-specific paths (e.g. Docusaurus `/docs/intro`) with relative paths between output files. Leave external `https://` links untouched.

5. **Carry over assets.** Copy any `static/`, `public/`, or `images/` directories referenced by the imported pages into `docs-output/<name>/_assets/` and update image src accordingly.

6. **Write `_branding.json`.** Pull `colors.primary` / `theme.accent` from the platform config. If absent, leave `accentColor` out so the workspace configurator skips `update_branding`.

## Guardrails

- Never lose content. If a custom component cannot be normalised, paste its inner text verbatim and add `> **TODO:** original used <ComponentName>, may need styling tweak.`
- Preserve heading hierarchy — do not flatten H3s into H2s to "look cleaner".
- Hard-skip `.mdx` files that are pure React (no markdown text) — log to `warnings`, don't error.
- Keep slugs URL-stable: if the original was `/docs/getting-started/installation`, write to `getting-started/installation.md`, not `installation.md`.
- Active voice, second person — but only when rewriting your own additions. Imported content stays as-is.

## Acceptance Criteria

- [ ] Platform identified from marker file before any conversion runs
- [ ] Navigation reproduced in the output folder structure
- [ ] Platform-specific MDX components normalised to plain Markdown
- [ ] Internal links rewritten to relative paths between output files
- [ ] Referenced images copied into `_assets/`
- [ ] `_branding.json` carries the platform's accent color when present, otherwise omits it

