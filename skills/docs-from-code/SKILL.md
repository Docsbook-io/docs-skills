---
name: docs-from-code
description: Build Markdown docs from a code repository — README, source tree, exported APIs, examples, comments. Use when the source of truth is GitHub source code rather than a marketing site. Produces docs-output/<name>/ ready for /docs-publish or the full /docs-create pipeline.
metadata:
  version: 1.0.0
  category: creation
  requires_docsbook_mcp: false
  keywords: [code, repo, github, source, generate, api, readme]
---

# docs-from-code — Build docs from a code repository

The actual work is done by the **`docs-code-crawler`** subagent (Haiku, pinned model) shipped in [docs-claude-plugins](https://github.com/Docsbook-io/docs-claude-plugins/blob/main/plugins/docs-create/agents/docs-code-crawler.md). This skill is the knowledge base — the subagent is the executor.

## Workflow

1. **Resolve the repo.** Accept `github.com/<owner>/<repo>` or a local path. For GitHub URLs, use `gh repo clone --depth 1` into a temp directory; for local paths, work in place.
2. **Detect the project type.** Inspect root files: `package.json` (Node/TS), `pyproject.toml` / `setup.py` (Python), `go.mod` (Go), `Cargo.toml` (Rust), `*.csproj` (.NET). Pick the strongest signal; on conflict, prefer the one with a `lib` / `src` / `pkg` directory.
3. **Extract the README spine.** Convert the root `README.md` into `docs-output/<name>/README.md`. Split long top-level sections (`## Installation`, `## Usage`, `## API`) into dedicated pages under `getting-started/`, `guides/`, `api/`.
4. **Enumerate the public API surface.** For Node/TS: read `package.json#exports` and the entry files; for Python: read `__all__` from the top package; for Go: list exported identifiers from each top-level package. Generate one Markdown file per module / package under `api/`.
5. **Pull in examples.** If `examples/`, `samples/`, or `demo/` exists, copy each subfolder's README (or generate one from the file tree) into `guides/<example>.md`.
6. **Read configuration docs.** Look for `.env.example`, `config/*.example.*`, `docker-compose.yml` — generate a `guides/configuration.md` listing variables with descriptions pulled from adjacent comments.
7. **Write `_branding.json`.** Source: `package.json#author`, GitHub repo description, repo avatar from `https://github.com/<owner>.png`. No accent color is detected here — leave `accentColor` absent so the workspace configurator skips `update_branding` rather than picking a default.

## Guardrails

- Never commit secrets — skip `.env`, `*.key`, `*.pem`, anything matching common token patterns (`sk-`, `ghp_`, `AKIA`).
- Cap output at ~50 pages. If the repo has 200 source files, group by package, not by file.
- Active voice, second person, sentence-case headings, no filler words. Tag every code block with the language inferred from the file extension.
- Do not invent API documentation. If a function has no docstring / comment, list its signature only and add `TODO: describe what this does`.
- Use relative links between pages (`./guides/configuration.md`, not `https://...`).

## Acceptance Criteria

- [ ] Project type identified from root config files
- [ ] README split into structured pages without losing content
- [ ] Public API surface enumerated with one page per module / package
- [ ] Examples and configuration captured as separate pages when sources exist
- [ ] `_branding.json` written without a fabricated accent color
- [ ] No secrets present in the output folder

