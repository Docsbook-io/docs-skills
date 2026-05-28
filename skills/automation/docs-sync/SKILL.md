---
name: docs-sync
description: Detect and fix code↔docs drift before every push. Orchestrates a four-subagent pipeline — Haiku planner clusters changed code files, Haiku searchers find drifted pages per cluster in parallel worktrees, Sonnet editors rewrite the affected sections, and a Sonnet curator merges everything atomically into the commit. Works as a manual command or as an auto-installed pre-push git hook.
metadata:
  version: 1.0.0
  category: automation
  requires_docsbook_mcp: false
  produces_files:
    - docs/**/*.md
  keywords: [sync, drift, pre-push, subagents, worktree, markdown, code-docs]
---

# docs-sync — code↔docs drift orchestrator

Orchestrates four subagents (planner, searcher, editor, curator) to detect and fix documentation drift in parallel git worktrees, then atomically amend the commit before push.

## Workflow

1. **Hook check** — on first run, offer to install a pre-push git hook so the command runs automatically. On subsequent runs, skip this prompt silently.
2. **Detect changed code** — compute the diff between HEAD and the remote merge-base. If no non-documentation files changed, exit cleanly with no work done.
3. **MCP probe** — verify the `markdown-lsp` MCP server is reachable. Abort with a clear error if it is not; never block push silently.
4. **Plan clusters (Haiku)** — the `docs-planner` subagent groups changed code files into semantic clusters and produces a hypothesis per cluster about which docs sections might have drifted.
5. **Fan out per cluster (parallel)** — for each cluster, create an isolated git worktree, then invoke `docs-searcher` (Haiku) to locate drifted pages with a confidence score.
6. **Edit drifted pages (Sonnet)** — for each cluster whose confidence meets the threshold, invoke `docs-editor` (Sonnet) in the worktree to rewrite the affected sections.
7. **Curate (Sonnet)** — the `docs-curator` subagent receives all editor hunks, resolves cross-cluster conflicts, normalizes style, and drops speculative edits, producing a final edit list.
8. **Apply atomically** — apply the curated edits to the main worktree, stage them, and amend the current HEAD commit. Remove worktrees on success; keep them for triage on failure.

## Guardrails

- Never block a push in `warn` mode (the default). Only exit non-zero when the repo explicitly sets `mode: block` in `.docs-sync.json`.
- Never amend if the curated edit list is empty — log "no doc edits needed" and exit cleanly.
- Cap the diff passed to the planner at 50 KB; truncate larger diffs with a note.
- No single editor pass may rewrite more than the configured `diffCap` fraction (default 0.4) of a page — edits beyond that threshold are dropped by the curator.
- On subagent timeout, skip that cluster and log it; do not abort the remaining clusters.
- If the MCP server is unreachable, abort the workflow and print a one-line warning; do not silently pass.
- Keep worktrees in place on failure so the user can inspect the partial work. Clean them up only on success.

## MCP Tools

| Tool | Purpose |
|------|---------|
| `doc_workspace_outline` | Probe liveness of the markdown-lsp MCP server |
| `doc_search_text` | Locate documentation sections relevant to a code cluster |
| `doc_search_paths` | Enumerate candidate pages by path pattern |
| `doc_resolve_link` | Validate internal links before and after edits |
| `doc_outline` | Read page structure to plan targeted edits |

## Acceptance Criteria

- [ ] Pre-push hook offer shown only on first run; subsequent runs skip it
- [ ] Clean exit with no edits when no non-doc code files changed
- [ ] MCP probe runs before any subagent invocation; failure aborts with a message
- [ ] Planner returns clusters; fallback to top-level dir grouping on failure
- [ ] All cluster worktrees created and searched in parallel
- [ ] Editor only invoked for clusters with confidence >= threshold (default 0.6)
- [ ] Curator resolves conflicts across clusters before any file is touched
- [ ] Amend commits only when the curated edit list is non-empty
- [ ] Warn-mode never exits non-zero; block-mode exits non-zero on detected drift
- [ ] Worktrees removed on success; preserved on failure with a log file
