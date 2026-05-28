---
name: docs-create
description: Turn a URL or repo into a live docs site in one command. Full end-to-end pipeline — detects the source (website, code, or Mintlify/GitBook/Docusaurus), generates structured Markdown, publishes to GitHub, and configures the Docsbook workspace. Minimal questions, maximum output.
metadata:
  version: 1.0.0
  category: creation
  requires_docsbook_mcp: false
  keywords: [create, pipeline, generate, docs, new]
---

# docs-create — End-to-end docs pipeline

## Workflow

1. Ask at most 1 question before starting: the source URL/repo (if missing). The GitHub account comes from `gh auth status` when present; if absent, the pipeline still runs the crawl and stops cleanly with the path printed.
2. Detect the source type using the `/docs-detect-source` logic — route to `website` (`/docs-from-site`), `github-code-repo` (`/docs-from-code`), or a docs platform (`/docs-from-docs`). All three routes run end-to-end with pinned Haiku subagents.
3. Build docs using the appropriate sub-skill. Extract branding if available; never invent an accent color when none is detected.
4. **Preview + confirm.** Before publishing, print the folder tree and excerpts from up to 3 representative pages. Ask the user before pushing — never silently create a GitHub repo.
5. Publish the generated folder to GitHub using the `/docs-publish` logic — only if `gh` is authenticated. Otherwise stop with `status: crawl_only` and instructions to run `/docs-publish <path>` after `gh auth login`.
6. **Confirm workspace settings, then configure** the Docsbook workspace using `/docs-setup-workspace`. Show what will be applied (branding, UI, AI, SEO, languages) and let the user accept all, decline, or pick sections. Skip gracefully if MCP is unavailable — print connection instructions but do not fail the pipeline.
7. Report the local path, GitHub URL (if published), Docsbook URL (if configured), page count, and detected source type.

## Guardrails

- Never ask more than 1 question before starting; derive everything else from context.
- `gh` is optional for the crawl step. Only the publish step requires it — if missing, surface that as a clean stopping point, not an error.
- Always show a real preview (tree + page excerpts) before publish — a one-line summary is not enough for users to decide.
- Always confirm workspace settings before applying — `update_languages` in particular enables 4 languages by default and surprises users.
- If MCP is unavailable at step 6, print setup instructions and exit cleanly — do not abort the whole pipeline.
- Output folder name is derived from the source; only prompt the user if there is a genuine collision.
- Never push a default accent color (`#6366f1` or any other) when branding extraction failed — leave branding untouched and warn instead.

## Acceptance Criteria

- [ ] Source type detected without manual input
- [ ] Docs folder generated with at least a README and a getting-started page
- [ ] Preview (tree + page excerpts) printed before any publish prompt
- [ ] Pipeline completes without `gh` when GitHub is not authenticated (status `crawl_only`)
- [ ] GitHub repo created and pushed successfully when `gh` is available and user confirms
- [ ] Workspace configuration is confirmed by the user before applying
- [ ] Docsbook workspace configured for the selected sections (or setup instructions printed if MCP unavailable)
- [ ] Final report shows local path, GitHub URL (if published), and Docsbook URL (if configured)
