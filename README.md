# docs-skills

Open-source catalog of AI agent skills for documentation — analyze, create, publish, and automate via the [Docsbook](https://docsbook.io) MCP server.

Browse the live catalog: **[docsbook.io/skills](https://docsbook.io/skills)**.

**26 skills across 6 categories.** Works with Claude Code, Cursor, GitHub Copilot, and OpenAI Codex.

---

## Categories

| Category | Skills | What it does |
|---|---:|---|
| `analysis` | 11 | Audit and quality checks |
| `creation` | 4 | Generate or import docs |
| `publishing` | 3 | Publish and onboard a workspace |
| `automation` | 6 | Wire up automations via Docsbook MCP |
| `observability` | 1 | Analytics-driven gap-finding |
| `planning` | 1 | Plan docs strategy before creation |

---

## Two consumption modes

### 1. Local install (default)

```bash
npx skills add Docsbook-io/docs-skills
# or
npx docs-skills install
```

Copies SKILL.md files into `.claude/skills/` (Claude Code), `.cursor/rules/` (Cursor), or appends to `AGENTS.md` / `copilot-instructions.md` (Codex / Copilot). Works offline once installed.

### 2. Runtime discovery via Docsbook MCP (v2)

If your agent is already connected to the Docsbook MCP server, no install needed — call the `find_skill` tool:

```
@docsbook find_skill "audit my docs for accessibility"
```

The tool searches the catalog by name + description + keywords and returns matching SKILL.md URLs. Your agent reads them via WebFetch and runs the steps.

Both modes share the same source — no duplication.

---

## Skills

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
| `/docs-generate-agents-md` | Generate `AGENTS.md` at repo root from workspace settings — gives every future agent context | Free |

### Automation — wire workspace events to actions

| Skill | What it does | Plan |
|---|---|---|
| `/docs-enable-translation` | Enable AI auto-translation; optional Slack notification on completion | PRO |
| `/docs-pr-check` | Generate a GitHub Actions workflow that validates docs on every PR | Free |
| `/docs-tune-ai-chat` | Analyze negative feedback + unanswered questions, suggest a new system prompt | PRO |
| `/docs-stale-watcher` | On `content.outdated` webhook → open a GitHub Issue per stale page | PRO+ |
| `/docs-release-announce` | On new GitHub release → post to Slack and/or email | PRO |
| `/docs-translate-webhook` | Replace built-in AI translation with a custom external pipeline | PRO+ |

### Observability — turn analytics into actions

| Skill | What it does | Plan |
|---|---|---|
| `/docs-gap-finder` | Cross-reference failed searches + unanswered AI questions vs doc graph → prioritized list of pages to create (with optional draft GitHub Issues) | PRO+ |

---

## How it works

Each skill uses the **Docsbook MCP server** to read the documentation graph of any public GitHub repository — pages, headings, sections, link relationships — without cloning the repo locally. Automation skills additionally register webhooks and update workspace settings.

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

**Docsbook MCP setup** (one-time, per AI tool):

```bash
# Claude Code
mcp add --transport http https://docsbook.io/api/mcp/server
```

No account required for reading public repos. Sign up at [docsbook.io](https://docsbook.io) for PRO features (doc graph, section reading, reindex, AI tuning, webhooks).

---

## Install

### npx (one command, no install required)

```bash
npx skills add Docsbook-io/docs-skills
# or
npx docs-skills install
```

Auto-detects your AI tool (Claude Code / Cursor / Copilot / Codex) and copies skills to the right place.

To install globally for Claude Code:

```bash
npx docs-skills install ~/
```

### Manual

```bash
git clone https://github.com/Docsbook-io/docs-skills.git
cp -r docs-skills/skills .claude/skills/
```

---

## Setup per AI tool

### Claude Code

```bash
npx skills add Docsbook-io/docs-skills
# or
npx docs-skills install
```

Then in chat:

```
/docs-analyze
```

### Cursor

```bash
npx skills add Docsbook-io/docs-skills
# or
npx docs-skills install
```

Then mention `@docs-analyze` in chat.

### GitHub Copilot

```bash
npx skills add Docsbook-io/docs-skills
# or
npx docs-skills install
```

Appends a `docs-skills` section to `.github/copilot-instructions.md`.

### OpenAI Codex

```bash
npx skills add Docsbook-io/docs-skills
# or
npx docs-skills install
```

Appends skill descriptions to `AGENTS.md`.

---

## Usage example

```
> /docs-analyze

Which repo do you want to audit?

> github.com/vercel/next.js

Fetching doc graph for vercel/next.js...
Running 10 analysis skills...

## Documentation Audit — vercel/next.js

### Critical
- [docs-navigation-linking] 14 orphan pages not linked from any navigation
- [docs-seo] 23 pages missing <description> meta tag

### High
- [docs-content-types] 78% reference pages, 0% tutorials — Diátaxis imbalance
- [docs-accessibility] 31 images missing alt text

### Medium
- [docs-style-tone] 47 instances of passive voice across 12 pages
...
```

---

## CLI reference

```bash
docs-skills install [dir]    # Install into dir (default: current directory)
docs-skills list             # List all skills with descriptions
docs-skills info <skill>     # Show full skill definition
```

---

## License

MIT © 2024 Dan Bondarev / [docsbook.io](https://docsbook.io)
