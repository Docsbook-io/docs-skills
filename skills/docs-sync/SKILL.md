---
name: docs-sync
description: Detect and fix code↔docs drift in parallel git worktrees before push. Runs as a pre-push hook — fans out Haiku searcher sub-agents per code cluster, applies Sonnet edits, then merges everything with a curator agent in a fresh context.
category: automation
requires_plan: free
requires_docsbook_mcp: false
uses_mcp_tools:
  - doc_search_text
  - doc_search_symbols
  - doc_search_links_to
produces_files:
  - .git/hooks/pre-push
keywords:
  - drift
  - sync
  - pre-push
  - worktree
  - parallel
  - hook
  - mcp
metadata:
  version: 1.0.0
---

# docs-sync

Detects code↔docs drift introduced by the current branch and fixes it before a push lands. Uses parallel git worktrees so every code cluster is searched and edited independently, then a curator agent merges the results into a single coherent patch.

> **MCP dependency:** searcher sub-agents use `markdown-lsp-mcp` to query the local docs graph without reading every file. Start it with `npx markdown-lsp-mcp --docs ./docs` before the hook runs, or let Step 2 do it automatically.

## Arguments

- `$ARGUMENTS[0]` — optional path to a config file (TOML/JSON/YAML). If absent, defaults apply (see [Config](#config)).
- `$ARGUMENTS.threshold` — override `threshold` from config inline, e.g. `threshold=0.5`.
- `$ARGUMENTS.mode` — override `mode` (`warn` | `commit` | `block`). Default: `warn`.

## Install as a pre-push hook

```bash
# one-time setup in your repo
cat > .git/hooks/pre-push << 'EOF'
#!/usr/bin/env bash
claude -p /docs-sync
EOF
chmod +x .git/hooks/pre-push
```

---

## Step 1 — Detect changed code files

```bash
git diff --name-only $(git merge-base HEAD origin/main)..HEAD
```

Filter to code paths only (exclude `docs/`, `*.md`, lock files). If the result is empty, print `docs-sync: no code changes — skipping` and exit 0.

## Step 2 — Ensure MCP server is running

Check:

```bash
pgrep -f "markdown-lsp-mcp"
```

If no process found, spawn it in the background:

```bash
npx markdown-lsp-mcp --docs ./docs &
```

Wait up to 5 seconds for it to be ready (retry `pgrep` twice). If it fails to start, print a warning and continue — searchers will fall back to raw file reads.

## Step 3 — Plan clusters

Spawn a **Haiku sub-agent** with `prompts/planner.md`. Pass:

- `{{diff}}` — output of Step 1 (file paths + `git diff` for those files, truncated to ~4 k tokens)
- `{{src_tree}}` — top two directory levels of the code paths (e.g. `find src -maxdepth 2 -type d`)

The agent returns JSON `{ "clusters": [{ "name", "files[]", "hypothesis" }] }`.

**Fallback** when AI is unavailable or returns invalid JSON: derive clusters from the top-level directories present in the diff (e.g. `src/lib/auth` → cluster `auth`). Each fallback cluster gets an empty `hypothesis`.

## Step 4 — Fan-out (parallel per cluster)

For each cluster, run the following three tasks in parallel (independent of other clusters):

**4a. Create worktree**

```bash
git worktree add .claude/worktrees/docs-sync-<cluster> HEAD
```

**4b. Search for drifted pages — Haiku sub-agent**

Spawn with `prompts/searcher.md`. Pass `{{cluster_name}}`, `{{cluster_files}}`, `{{cluster_diff}}`. Provide the running `markdown-lsp-mcp` as MCP context. Budget: 6–10 MCP calls.

Returns `{ "drifted_pages": [{path, why, confidence}], "confidence": 0..1 }`.

**4c. Edit drifted pages — Sonnet sub-agent** (conditional)

Only when `cluster.confidence >= threshold` (default `0.6`). Spawn with `prompts/editor.md` inside the cluster's worktree. Pass `{{cluster_diff}}`, `{{drifted_pages}}`, `{{worktree_path}}`, `{{diff_cap}}`.

File-level mutex: if two clusters target the same `.md` file, the second editor skips that file and logs it for the curator.

## Step 5 — Wait for all sub-agents

Block until all Step 4 sub-agents have exited. Collect results:

- Each worktree's edited files (compare to HEAD with `git diff HEAD -- docs/`)
- Each agent's JSON report

## Step 6 — Curate

Spawn a **Sonnet sub-agent in a FRESH context window** with `prompts/curator.md`. Pass:

- `{{original_diff}}` — the full code diff from Step 1
- `{{all_edits}}` — structured list of `{ cluster, path, before, after }` hunks from all worktrees

The curator resolves overlaps, normalises style, drops speculative edits, and returns a final patch set as JSON `{ final_edits, conflicts, dropped }`.

## Step 7 — Apply atomically

1. Copy `final_edits` into the main working tree (`docs/`).
2. Stage: `git add docs/`
3. Depending on `mode`:
   - `warn` — print a summary of changes and continue (exit 0). Do NOT commit.
   - `commit` — `git commit --amend --no-edit` to fold doc fixes into the last commit.
   - `block` — if `final_edits` is non-empty, print the summary and exit 1 (blocks the push).
4. On success: `git worktree remove --force .claude/worktrees/docs-sync-<cluster>` for every cluster.
5. On error: keep worktrees for manual triage. Write a run log to `.claude/worktrees/docs-sync-<run-id>/log.json`.

---

## Config

Place an optional config file in your repo root (TOML, JSON, or YAML — any format your agent can read). Recognised fields:

| Field | Type | Default | Description |
|---|---|---|---|
| `docsPath` | string | `"./docs"` | Path to the docs directory |
| `codePaths` | string[] | `["src","lib","app"]` | Directories treated as code |
| `clustering` | `"ai"` \| `"dirs"` | `"ai"` | Cluster strategy; `"dirs"` skips the planner agent |
| `models.planner` | string | `"haiku"` | Model for the planner sub-agent |
| `models.searcher` | string | `"haiku"` | Model for each searcher sub-agent |
| `models.editor` | string | `"sonnet"` | Model for each editor sub-agent |
| `models.curator` | string | `"sonnet"` | Model for the curator sub-agent |
| `mode` | `"warn"` \| `"commit"` \| `"block"` | `"warn"` | What to do after fixes are produced |
| `threshold` | float 0–1 | `0.6` | Minimum cluster confidence to trigger editing |
| `diffCap` | float 0–1 | `0.4` | Max fraction of a page's lines the editor may change |
| `worktreeDir` | string | `".claude/worktrees"` | Where parallel worktrees are created |

## Failure modes

- **`warn` mode (default):** the hook never blocks the push. Drift fixes are printed or committed depending on sub-mode, but `git push` always proceeds.
- **`block` mode:** if any `final_edits` are produced, the hook exits non-zero. The push is refused until the developer reviews and accepts (or skips with `git push --no-verify`).
- **MCP unavailable:** searchers fall back to `grep`-style keyword matching against raw `.md` files. Results are less precise but the hook still completes.
- **Sub-agent timeout / crash:** the affected cluster is skipped; remaining clusters continue. A warning is printed in the run summary.
