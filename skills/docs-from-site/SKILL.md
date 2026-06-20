---
name: docs-from-site
description: Spin up Markdown docs from any product website URL. Crawls the site, extracts content, and produces a clean docs-output/<name>/ folder — then publishes to GitHub and configures the Docsbook workspace automatically. Use when the user provides a website URL, site URL, or says "from website", "import site", "from URL".
metadata:
  version: 2.1.0
  category: creation
  requires_docsbook_mcp: false
  keywords: [crawl, website, site, extract, markdown, generate, website-url, from-website, site-url, url, import-site, product-site]
---

# docs-from-site — Build docs from a product website

The actual work is done by the **`docs-site-crawler`** subagent (Haiku, pinned model).

## Workflow

1. Fetch the sitemap first (`/sitemap.xml`). Fall back to crawling `<a href>` links from the homepage only if the sitemap is missing.
   - Take the **project name from the site's brand** — its `<title>` or `og:site_name`, normalized (drop taglines like " — Docs"). Use that for the `docs-output/<name>/` folder and the workspace display name. Never invent a name; if the brand is unreadable, ask the user.
2. Prioritize documentation-relevant paths (`/docs`, `/help`, `/guides`, `/features`) and cap the crawl at ~50 pages.
3. For each page: strip navigation chrome (`<header>`, `<footer>`, `<nav>`, `<aside>`) before converting HTML to Markdown.
4. Extract branding tokens from inline `<style>` or `:root` CSS variables (accent color, background, foreground). Detect the color scheme from background luminance. Look for a theme toggle element to decide between pinning the scheme or setting `system`.
5. Organize output into a structured folder: intro README, getting-started section, per-feature pages, guides, API reference, and FAQ — only if that content was found.
6. Write a `_branding.json` alongside the docs folder.
7. **Preview.** Print the folder tree and excerpts from up to 3 representative pages. Ask the user to confirm before publishing: "Does this look right? Type **yes** to publish, or describe what to change."
8. **Publish.** Apply `/docs-publish` logic — if `gh` is authenticated and the user confirmed, push to GitHub. If `gh` is NOT authenticated, stop cleanly with `status: crawl_only`, print the local path and the command `/docs-publish <path>` to run after `gh auth login`. Do not error.
9. **Configure the workspace.** Apply `/docs-setup-workspace` unconditionally after a successful publish — wire branding, UI, navigation, and plan-gated settings via Docsbook MCP. If the MCP transport is unreachable, print the connection command and exit cleanly; the local folder and GitHub URL are already delivered.
10. **Final report.** Print the local path, GitHub URL (if published), and Docsbook site URL (if workspace configured).

## Guardrails

- Use WebFetch first; escalate to a browser only if `<main>` content is empty.
- Hard-exclude auth and commerce paths (`/login`, `/signup`, `/auth`, `/checkout`, `/cart`).
- Cap at 50 pages — sites with hundreds of URLs contain mostly blog noise.
- Strip navigation chrome before the HTML-to-Markdown pass, not after.
- The project name comes from the site brand, not from a guess — ask the user if it can't be read from the page.
- When committing into an existing repo, write pages to the repo **root** (or into an existing `docs/` folder if one is already present) — never create a new top-level `docs/` wrapper for a fresh repo.
- Write in active voice, second person, sentence-case headings. No filler words ("simply", "just", "easily"). Tag every code block with a language. Use relative links between pages.
- Always run `/docs-setup-workspace` after publish — do not skip unless MCP transport is unreachable.

## Acceptance Criteria

- [ ] Sitemap or link discovery completed without manual intervention
- [ ] Auth and commerce paths excluded from the crawl
- [ ] Navigation chrome stripped before Markdown conversion
- [ ] Output folder contains at minimum a README and a getting-started page
- [ ] `_branding.json` written with accent color, background, favicon, and detected scheme
- [ ] Preview (tree + page excerpts) printed before any publish prompt
- [ ] Published to GitHub (or `crawl_only` status printed with local path and instructions)
- [ ] Docsbook workspace configured (or setup instructions printed if MCP unavailable)
