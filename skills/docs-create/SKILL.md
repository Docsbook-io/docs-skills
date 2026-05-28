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

1. Ask at most 2 questions before starting: the source URL/repo (if missing) and the target GitHub account (only if ambiguous from `gh auth status`). Then proceed without stopping.
2. Detect the source type using the `/docs-detect-source` logic — route to `website`, `github-code-repo`, or a specific docs platform.
3. Build docs using the appropriate sub-skill (`/docs-from-site`, `/docs-from-code`, or `/docs-from-docs`). Extract branding if available.
4. Publish the generated folder to GitHub using the `/docs-publish` logic.
5. Configure the Docsbook workspace using `/docs-setup-workspace`. Skip gracefully if MCP is unavailable — print connection instructions but do not fail the pipeline.
6. Report the local path, GitHub URL, Docsbook URL, page count, and detected source type.

## Guardrails

- Never ask more than 2 questions before starting; derive everything else from context.
- If MCP is unavailable at step 5, print setup instructions and exit cleanly — do not abort the whole pipeline.
- Output folder name is derived from the source; only prompt the user if there is a genuine collision.

## Acceptance Criteria

- [ ] Source type detected without manual input
- [ ] Docs folder generated with at least a README and a getting-started page
- [ ] GitHub repo created and pushed successfully
- [ ] Docsbook workspace configured (or setup instructions printed if MCP unavailable)
- [ ] Final report shows local path, GitHub URL, and Docsbook URL
