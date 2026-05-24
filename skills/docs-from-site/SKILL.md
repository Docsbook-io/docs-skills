---
name: docs-from-site
description: Spin up Markdown docs from any product website. Crawls the site, extracts content, and produces a clean docs-output/<name>/ folder ready for Docsbook or GitHub — useful when your only source of truth today is the marketing site. Use /docs-create for the full crawl→publish→setup pipeline.
metadata:
  version: 1.0.0
  category: creation
  requires_docsbook_mcp: false
  keywords: [crawl, website, site, extract, markdown, generate]
---

# docs-from-site

Build documentation from a website URL. Crawl the site, extract content, and produce structured Markdown files ready for Docsbook or GitHub.

## Arguments

- `$ARGUMENTS[0]` — website URL (required)
- `$ARGUMENTS[1]` — output name (optional; derived from the domain if not provided)

If no URL is provided, ask for it before proceeding.

## Step 1 — Branding extraction

Fetch the homepage HTML using WebFetch. Only fall back to Chrome if WebFetch fails.

From `<head>`, extract:
- `<title>` — site name
- `<meta name="description">` — tagline
- `<link rel="icon">` — favicon URL
- `<meta property="og:image">` — OpenGraph image

From inline CSS and `<style>` blocks, extract color tokens using regex:
- `--primary`, `--color-primary`, `--accent`, `--background`, `--foreground`
- Button color from `.btn`, `button` inline styles

Determine the detected color scheme:
- Parse the `--background` or `background-color` value
- If luminance > 50%, scheme is `"light"`; otherwise `"dark"`

Check for a theme toggle by scanning for `data-theme-toggle`, `[class*="theme-toggle"]`, or similar attributes.

## Step 2 — Content discovery

Find all pages to crawl:

1. Fetch `/sitemap.xml` — parse all `<loc>` URLs
2. Collect `<a href>` links from the homepage (same domain only)
3. Check standard paths:
   - Documentation first: `/docs`, `/docs/getting-started`, `/help`, `/guides`, `/tutorials`
   - Product: `/features`, `/pricing`, `/about`
   - Technical: `/api`, `/integrations`
   - Reference: `/faq`, `/changelog`

Crawl in that priority order. Skip: `/login`, `/signup`, `/auth`, `/checkout`, `/cart`.

## Step 3 — Content extraction

If `scripts/crawl-site.js` is available locally, run:

```bash
node scripts/crawl-site.js "$URL" "docs-output/$NAME" \
  --max-pages=50 \
  --priority-paths=docs,help,guides,tutorials \
  --skip-paths=login,signup,auth,checkout,cart
```

If the script is not available, fetch each discovered URL manually and convert HTML to Markdown:
- Extract content from `<main>`, `<article>`, or `.content`
- Skip `<header>`, `<footer>`, `<nav>`, `<aside>`

## Step 4 — Structure organization

Organize the extracted files into this layout (skip empty sections):

```
docs-output/<name>/
├── README.md                    # Intro: what the product does, key value props
├── getting-started/
│   ├── README.md                # Quick start — the most important page
│   └── installation.md          # If applicable
├── features/
│   └── <feature-name>.md        # One file per major feature
├── guides/
│   └── <guide-name>.md          # How-to guides
├── api/
│   └── reference.md             # If API docs were found
└── faq.md                       # If a FAQ was found
```

Write each page following the shared writing rules:
- Active voice, second person ("you"), imperative mood for instructions
- Sentence case headings ("How to configure X")
- No filler words: remove "simply", "just", "easily", "powerful"
- All code blocks must have a language specifier
- Link related pages using relative internal links

## Step 5 — Branding JSON

Write a `_branding.json` file in `docs-output/<name>/`:

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

This file is consumed by `/docs-setup-workspace` when configuring Docsbook.

## Output

Print the created directory tree. Then suggest next steps:

```
Docs written to docs-output/<name>/

Next steps:
  /docs-publish    — push to GitHub
  /docs-setup-workspace — configure Docsbook workspace
```
