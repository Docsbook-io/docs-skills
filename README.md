# docs-skills

> **Audit, generate, and publish documentation — 20 skills for AI coding agents**

Install the catalog into your repo and let your AI agent audit docs for quality, generate missing pages, publish to GitHub, and configure a Docsbook workspace — all from chat.

> **Looking for automation?** Workflow automation (pre-push sync, PR checks, translation webhooks, release announcements, stale watchers) has moved to **[docs-subagents](https://github.com/Docsbook-io/docs-subagents)** — purpose-built subagents that execute on events, not just provide instructions.

---

## Install (60 seconds)

```bash
npx docs-skills install
```

Copies SKILL.md files into `.claude/skills/` (Claude Code), `.cursor/rules/` (Cursor), or appends to `AGENTS.md` / `copilot-instructions.md` (Codex / Copilot). Works offline once installed.

### Verify it's working

```bash
# List all installed skills:
npx docs-skills list
```

---

## All skills

The catalog includes **20 skills** for auditing, generating, and publishing docs.

Browse the live catalog: **[docsbook.io/skills](https://docsbook.io/skills)**.

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
| `analysis` | 11 | Audit and quality checks |
| `creation` | 4 | Generate or import docs |
| `publishing` | 3 | Publish and onboard a workspace |
| `observability` | 1 | Analytics-driven gap-finding |
| `planning` | 1 | Plan docs strategy before creation |

> **Automation skills** (pre-push sync, PR checks, translation webhooks, release announces, stale watchers) have moved to **[docs-subagents](https://github.com/Docsbook-io/docs-subagents)**.

---

## Two consumption modes

### 1. Local install (default)

Already covered above — `npx docs-skills install` copies skills into the right place for your AI tool.

### 2. Runtime discovery via Docsbook MCP

If your agent is connected to the Docsbook MCP server, no install needed:

```
@docsbook find_skill "audit my docs for accessibility"
```

The tool searches by name + description + keywords and returns matching SKILL.md URLs. Your agent reads them via WebFetch and runs the steps.

---

## How the catalog works

Most skills use the **Docsbook MCP server** to read the documentation graph of any public GitHub repository — pages, headings, sections, link relationships — without cloning the repo locally.

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
  Audit report / generated files / configured workspace
```

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
| **Claude Code** | `/docs-analyze` in chat | `.claude/skills/` |
| **Cursor** | `@docs-analyze` mention | `.cursor/rules/` |
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
