---
name: docs-create
description: Full pipeline — detects source type, builds documentation, publishes to GitHub, and optionally configures Docsbook. L1 "under the key" entry point with minimal questions. Delegates to /docs-detect-source → /docs-from-* → /docs-publish → /docs-setup-workspace.
metadata:
  version: 1.0.0
  category: creation
  requires_docsbook_mcp: false
  keywords: [create, pipeline, generate, docs, new]
---

# docs-create

End-to-end pipeline with minimal interruptions. Detects the source, builds docs, publishes to GitHub, and configures Docsbook — all in one command.

## Arguments

- `$ARGUMENTS[0]` — URL or GitHub repo (required)
- `$ARGUMENTS[1]` — output name / repo name (optional — derived from source if not given)

## Ask at Most 2 Questions Before Starting

1. "What is the URL or GitHub repo you want to document?" — only if `$ARGUMENTS[0]` is missing.
2. "What GitHub account should the repo be published under?" — derive from `gh auth status` and only ask if ambiguous.

After these two questions, proceed through all steps without stopping.

## Step 1 — Detect Source Type

Inline the detection logic from `/docs-detect-source`:

- If URL starts with `http`: fetch the page and check for Mintlify, GitBook, Docusaurus, Nextra platform signals.
- If URL is `github.com/{owner}/{repo}`: check repo contents via GitHub API for platform config files.
- If local path: inspect directory structure.

Map result to one of: `website`, `github-code-repo`, `mintlify-docs`, `gitbook-docs`, `docusaurus-docs`, `nextra-docs`, `vitepress-docs`, `starlight-docs`, `plain-markdown`.

## Step 2 — Build Docs

Based on the detected type, run the corresponding sub-skill logic inline (do not spawn as a separate slash command):

| Detected type | Sub-skill logic |
|---|---|
| `website` | `/docs-from-site` |
| `github-code-repo` | `/docs-from-code` |
| `*-docs` (any docs platform) | `/docs-from-docs` |

Output goes to `docs-output/{name}/`. Include `_branding.json` if branding can be extracted.

## Step 3 — Publish

Inline the `/docs-publish` logic:

1. `git init` in `docs-output/{name}/`
2. `git add . && git commit -m "docs: initial documentation"`
3. `gh repo create {owner}/{name} --public`
4. Push via HTTPS using `gh auth token`

## Step 4 — Configure Docsbook

Inline the `/docs-setup-workspace` logic. Skip gracefully if the Docsbook MCP is unavailable — print the connection instructions but do not fail the pipeline.

## Final Report

```
✅ Done!

📁 Local:    docs-output/{name}/
🐙 GitHub:   https://github.com/{owner}/{name}
📚 Docsbook: https://docsbook.io/{owner}/{name}

Pages created: N
Source type: {type}
```
