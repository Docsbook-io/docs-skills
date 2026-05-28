---
name: docs-from-site
description: Spin up Markdown docs from any product website. Crawls the site, extracts content, and produces a clean docs-output/<name>/ folder ready for Docsbook or GitHub — useful when your only source of truth today is the marketing site. Use /docs-create for the full crawl→publish→setup pipeline.
metadata:
  version: 2.0.0
  category: creation
  requires_docsbook_mcp: false
  keywords: [crawl, website, site, extract, markdown, generate]
---

# docs-from-site

Knowledge for building documentation from a product URL. The actual work is done by the **`docs-site-crawler`** subagent (Haiku, pinned model) shipped in the [docs-create Claude Code plugin](https://github.com/Docsbook-io/docs-claude-plugins) and the [docs-subagents npm package](https://github.com/Docsbook-io/docs-subagents). This skill is the reference notes a human or agent reads *before* running it.

## What this is for

You have a product but no docs — only the marketing site. You want a Markdown folder you can edit, publish to GitHub, and connect to Docsbook. The crawler walks the site, converts pages, and produces `docs-output/<name>/` plus a `_branding.json` describing the visual identity.

## Tips & tricks

- **WebFetch beats headless Chrome for marketing sites.** Almost every modern landing page returns full HTML on the first request — JS-only sites are rare. Don't pay for Chrome startup unless WebFetch returns empty `<main>`.
- **Sitemap first, links second.** `/sitemap.xml` is the cheapest signal — one request, often returns the full URL set. Fall back to `<a href>` from the homepage only when sitemap is missing.
- **Cap at ~50 pages.** Marketing sites with 200+ URLs are mostly blog noise. The first 50 (prioritised `/docs`, `/help`, `/guides`, `/features`) cover 95% of the user value.
- **Skip auth and commerce paths.** `/login`, `/signup`, `/auth`, `/checkout`, `/cart` are dead weight — every crawler should hard-exclude them.
- **Drop chrome before converting.** Strip `<header>`, `<footer>`, `<nav>`, `<aside>` *before* the HTML→Markdown pass; otherwise the same nav text ends up at the top of every page.
- **Branding regex shortcuts.** Color tokens live in inline `<style>` or `:root` declarations — `--primary`, `--color-primary`, `--accent`, `--background`. Compute `detectedScheme` from the background luminance: `>50% → "light"`, else `"dark"`.
- **Theme toggle = soft signal.** Look for `data-theme-toggle`, `[class*="theme-toggle"]`, or a sun/moon SVG. When present, set `defaultTheme: "system"` downstream; otherwise pin to the detected scheme.

## Output contract

The crawler writes:

```
docs-output/<name>/
├── README.md                    # Intro: what the product does, key value props
├── getting-started/README.md    # Quick start — most important page
├── features/<feature>.md        # One file per major feature (optional)
├── guides/<guide>.md            # How-to guides (optional)
├── api/reference.md             # If API docs were found (optional)
└── faq.md                       # If a FAQ was found (optional)
```

Plus `_branding.json` at the root:

```json
{
  "accentColor": "#xxx",
  "background": "#xxx",
  "foreground": "#xxx",
  "favicon": "https://...",
  "hasThemeToggle": true,
  "detectedScheme": "light"
}
```

`_branding.json` is consumed by [docs-setup-workspace](../docs-setup-workspace/SKILL.md) when configuring Docsbook.

## Writing rules (apply to every generated page)

- Active voice, second person ("you"), imperative mood for instructions.
- Sentence case headings ("How to configure X", not "How To Configure X").
- No filler: drop "simply", "just", "easily", "powerful".
- Every code block tagged with a language.
- Link related pages with relative paths, not absolute URLs.

## How to run

**Plugin (recommended):**

```
/plugin install docs-create@docs-claude-plugins
/docs-from-site https://example.com
```

The slash command spawns the `docs-site-crawler` subagent on Haiku and returns a JSON result with the output path and page count.

**Standalone subagent:**

```
npx docs-subagents install
# then in Claude Code:
"Use the docs-site-crawler subagent to crawl https://example.com"
```

**Next steps after the crawl:**

- [docs-publish](../docs-publish/SKILL.md) — push to GitHub
- [docs-setup-workspace](../docs-setup-workspace/SKILL.md) — configure Docsbook
- [docs-create](../docs-create/SKILL.md) — run all three in one command
