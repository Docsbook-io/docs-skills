# docs-skills

> **Solve docs drift (live sync code & docs)**

Your docs always reflect the current code. A local pre-push git hook spots code↔docs drift, fans out parallel AI sub-agents per code cluster, edits the affected `.md` files, and commits the fix into your push — automatically, before anything lands on `main`.

No CI/CD, no GitHub App, no cloud. Works on private repos. Falls back gracefully if the AI is offline.

**Powered by [`markdown-lsp-mcp`](https://github.com/Docsbook-io/markdown-lsp-mcp)** — a local MCP server that indexes your `docs/` and exposes 9 LSP-style search tools to the agents.

---

## Install (60 seconds, fully autonomous)

Run these three commands in your repo. After that, every `git push` keeps your docs in sync.

```bash
# 1. Install the skills catalog (incl. /docs-sync)
npx docs-skills install

# 2. Register the local MCP server in your repo
cat > .mcp.json <<'EOF'
{
  "mcpServers": {
    "markdown-lsp": {
      "command": "npx",
      "args": ["-y", "markdown-lsp-mcp", "--docs", "./docs"]
    }
  }
}
EOF

# 3. Install the pre-push git hook
node node_modules/docs-skills/skills/docs-sync/install.mjs
```

Done. The hook is now active.

### Verify it's working

```bash
# Should print "Installed docs-sync pre-push hook" then exit 0:
ls -la .git/hooks/pre-push

# Dry-run the skill without pushing:
claude --print --dangerously-skip-permissions /docs-sync
```

If `claude` is not on PATH, the hook stays out of your way — `git push` always succeeds. To enforce, set `DOCS_SYNC_MODE=block` in the env.

---

## Use it — example session

You change a function in `src/lib/auth.ts` and forget the matching change in `docs/auth.md`. Then:

```bash
$ git add src/lib/auth.ts
$ git commit -m "refactor: rename callback() → onAuth()"
$ git push

[docs-sync] running /docs-sync (mode=warn)...
[planner] 1 cluster detected: auth
[searcher:auth] 2 drifted pages found (confidence 0.85)
  - docs/auth.md          — mentions removed callback() at L42
  - docs/ai/chat-hooks.md — examples reference auth.callback API
[editor:auth] editing 2 files in worktree...
[curator] merging 2 edits — no conflicts
[apply] amending HEAD with docs/auth.md + docs/ai/chat-hooks.md

Total: 2 docs files fixed in 14s. Push continues.
```

The amended commit lands on the remote together with your code change. No second PR, no follow-up cleanup.

### How it decides what changed

1. **`git diff` against `origin/main`** — pulls the list of changed code files
2. **Planner (Haiku)** — clusters the diff into 1–4 thematic groups
3. **Searcher (Haiku, parallel per cluster)** — uses `markdown-lsp-mcp` tools (`doc_search_symbols`, `doc_search_text`, `doc_search_links_to`) to find drifted pages
4. **Editor (Sonnet, parallel per cluster)** — edits drifted `.md` files inside an isolated `git worktree`, capped at 40% of each page
5. **Curator (Sonnet, fresh context)** — merges all worktree edits, resolves overlaps, drops speculative changes
6. **Apply atomically** — copies the final patch set into the main repo and `git commit --amend`s your push

Per-run cost: ~$0.05–0.15 in API calls. Wall time: 10–20s.

### Configuration

Drop an optional config file at the repo root (named `.docs-sync.json`) to override the defaults:

```json
{
  "docsPath": "./docs",
  "codePaths": ["./src", "./packages"],
  "mode": "warn",
  "threshold": 0.6,
  "diffCap": 0.4,
  "models": {
    "planner":  "claude-haiku-4-5",
    "searcher": "claude-haiku-4-5",
    "editor":   "claude-sonnet-4-6",
    "curator":  "claude-sonnet-4-6"
  }
}
```

| Field | Default | Meaning |
|---|---|---|
| `mode` | `warn` | `warn` never blocks push; `block` fails push on detected drift |
| `threshold` | `0.6` | Confidence floor for editor to act on a drifted page |
| `diffCap` | `0.4` | Max share of a page editor may rewrite in one pass |
| `worktreeDir` | `.claude/worktrees` | Where parallel worktrees live; kept on error for triage |

### Environment switches

| Variable | Effect |
|---|---|
| `DOCS_SYNC_SKIP=1` | Skip the hook for one push (`DOCS_SYNC_SKIP=1 git push`) |
| `DOCS_SYNC_MODE=block` | Fail push on AI failure or detected drift |

---

## All skills

`docs-sync` is the headline skill. The catalog also includes **26 more** for auditing, generating, and publishing docs.

Browse the live catalog: **[docsbook.io/skills](https://docsbook.io/skills)**.

### Automation — wire workflow events to actions

| Skill | What it does | Plan |
|---|---|---|
| **`/docs-sync`** | **Pre-push code↔docs drift detection + auto-fix in parallel worktrees** | **Free** |
| `/docs-enable-translation` | Enable AI auto-translation; optional Slack notification on completion | PRO |
| `/docs-pr-check` | GitHub Actions workflow that validates docs on every PR | Free |
| `/docs-tune-ai-chat` | Analyze negative feedback + unanswered questions, suggest a new system prompt | PRO |
| `/docs-stale-watcher` | On `content.outdated` webhook → open a GitHub Issue per stale page | PRO+ |
| `/docs-release-announce` | On new GitHub release → post to Slack and/or email | PRO |
| `/docs-translate-webhook` | Replace built-in AI translation with a custom external pipeline | PRO+ |

### Analysis — audit existing documentation

| Skill | What it checks |
|---|---|
| `/docs-analyze` | Orchestrator — runs all 10 sub-skills and produces a unified prioritized report |
| `/docs-content-types` | Diátaxis framework balance (tutorial / how-to / reference / explanation) |
| `/docs-structure-templates` | Frontmatter completeness, heading hierarchy, code block conventions |
| `/docs-style-tone` | Active voice, filler words, marketing adjectives, terminology consistency |
| `/docs-audience` | Vocabulary mismatch, assumed knowledge gaps, missing prerequisites |
| `/docs-navigation-linking` | Orphan pages, broken internal links, anchor text quality |
| `/docs-seo` | Title/description, topic clusters, AI Overviews compatibility |
| `/docs-accessibility` | WCAG 2.1 AA from markdown source — alt text, heading order, link text |
| `/docs-i18n` | Multilingual parity, hreflang, translation freshness |
| `/docs-media` | Images, screenshots, diagrams, captions, oversized files |
| `/docs-maintenance` | Stale content, deprecated pages, TODO/FIXME markers |

### Creation — generate new documentation

| Skill | What it does |
|---|---|
| `/docs-create` | Full pipeline: detect source → build docs → publish to GitHub → optionally configure Docsbook |
| `/docs-create-interactive` | Same pipeline with review checkpoints between steps |
| `/docs-detect-source` | Detect source type (website URL / code repo / Mintlify / GitBook / Docusaurus) |
| `/docs-from-site` | Crawl a website URL and produce structured Markdown |

### Publishing — ship docs to Docsbook

| Skill | What it does | Plan |
|---|---|---|
| `/docs-publish` | Publish a local folder to a new GitHub repo (git init, gh repo create, push) | Free |
| `/docs-setup-workspace` | Configure a Docsbook workspace via MCP (branding, UI, AI chat, SEO, languages) | Free |
| `/docs-generate-agents-md` | Generate `AGENTS.md` at repo root — gives every future agent context | Free |

### Observability — turn analytics into actions

| Skill | What it does | Plan |
|---|---|---|
| `/docs-gap-finder` | Cross-reference failed searches + unanswered AI questions vs doc graph → prioritized list of pages to create | PRO+ |

### Categories at a glance

| Category | Skills | What it does |
|---|---:|---|
| `automation` | 7 | Wire events and pre-push hooks to actions |
| `analysis` | 11 | Audit and quality checks |
| `creation` | 4 | Generate or import docs |
| `publishing` | 3 | Publish and onboard a workspace |
| `observability` | 1 | Analytics-driven gap-finding |
| `planning` | 1 | Plan docs strategy before creation |

---

## Two consumption modes

### 1. Local install (default)

```bash
npx docs-skills install
```

Copies SKILL.md files into `.claude/skills/` (Claude Code), `.cursor/rules/` (Cursor), or appends to `AGENTS.md` / `copilot-instructions.md` (Codex / Copilot). Works offline once installed.

### 2. Runtime discovery via Docsbook MCP

If your agent is connected to the Docsbook MCP server, no install needed:

```
@docsbook find_skill "audit my docs for accessibility"
```

The tool searches by name + description + keywords and returns matching SKILL.md URLs. Your agent reads them via WebFetch and runs the steps.

---

## How the broader catalog works

Most skills (besides `docs-sync`) use the **Docsbook MCP server** to read the documentation graph of any public GitHub repository — pages, headings, sections, link relationships — without cloning the repo locally.

```
AI Tool (Claude Code / Cursor / Codex)
        │
        ▼
  docs-skill runs
        │
        ▼
  Docsbook MCP  ──▶  GitHub repo docs/  +  webhooks  +  workspace settings
        │
        ▼
  Audit report / generated files / configured automation
```

`docs-sync` is the exception — it runs **fully local** via `markdown-lsp-mcp`, so it works on private repos and never touches the network for docs content.

**Docsbook MCP setup** (one-time, optional, only for the catalog skills that need it):

```bash
mcp add --transport http https://docsbook.io/api/mcp/server
```

No account required for reading public repos. Sign up at [docsbook.io](https://docsbook.io) for PRO features (doc graph, section reading, reindex, AI tuning, webhooks).

---

## Setup per AI tool

`npx docs-skills install` auto-detects your tool. Manual specifics:

| Tool | Trigger | Install location |
|---|---|---|
| **Claude Code** | `/docs-sync` in chat | `.claude/skills/` |
| **Cursor** | `@docs-sync` mention | `.cursor/rules/` |
| **GitHub Copilot** | reference in prompt | `.github/copilot-instructions.md` (appended) |
| **OpenAI Codex** | reference in prompt | `AGENTS.md` (appended) |

To install globally for Claude Code:

```bash
npx docs-skills install ~/
```

---

## CLI reference

```bash
docs-skills install [dir]    # Install catalog into dir (default: current directory)
docs-skills list             # List all skills with descriptions
docs-skills info <skill>     # Show full skill definition
```

---

## License

MIT © 2024 Dan Bondarev / [docsbook.io](https://docsbook.io)
