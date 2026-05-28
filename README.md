<div align="center">

# docs-skills

**Your AI agent doesn't know how to maintain docs. Now it does.**

[![npm version](https://badge.fury.io/js/docs-skills.svg)](https://www.npmjs.com/package/docs-skills)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)

[Install](#install) • [Skills Catalog](#skills-catalog) • [How It Works](#how-it-works) • [Two Modes](#two-consumption-modes) • [CLI](#cli-reference) • [Contributing](#contributing)

</div>

---

## The Problem

> "I asked Claude Code to audit my docs. It hallucinated 3 non-existent sections, missed broken links, and produced a report I couldn't act on."

AI agents are powerful — but they have no shared standard for **what good documentation looks like**, how to audit it, or how to publish it. Every project reinvents the wheel.

---

## The Solution

**20 reusable skills** (Workflow + Guardrails + Acceptance Criteria) that teach your AI agent to handle any documentation task correctly — from audit to publish.

| Before | After |
|--------|-------|
| Agent hallucinates doc structure | Agent reads live graph via Docsbook MCP |
| One-off prompts per project | Reusable skill catalog, works everywhere |
| No acceptance criteria | Every skill ships with pass/fail checklist |
| Hours of prompting per audit | `/docs-analyze` → unified report in minutes |

---

## What Is a Skill?

A skill is a **reusable regulation** (like a QA checklist) — not a one-time task.

| Concept | Analogy | Lives in |
|---------|---------|----------|
| **Skill** | QA Checklist — describes Workflow, Guardrails, Acceptance Criteria | this repo |
| **Subagent** | Jira ticket — specific model, tools, event trigger | [docs-subagents](https://github.com/Docsbook-io/docs-subagents) |

Skills are **agent-agnostic**: the same SKILL.md works in Claude Code, Cursor, Copilot, and Codex.

---

## Install

```bash
npx docs-skills install
```

Copies SKILL.md files into the right place for your tool — automatically detected:

| Tool | Install location | Trigger |
|------|-----------------|---------|
| **Claude Code** | `.claude/skills/` | `/docs-analyze` in chat |
| **Cursor** | `.cursor/rules/` | `@docs-analyze` mention |
| **GitHub Copilot** | `.github/copilot-instructions.md` | reference in prompt |
| **OpenAI Codex** | `AGENTS.md` | reference in prompt |

Works offline once installed. To install globally for Claude Code:

```bash
npx docs-skills install ~/
```

### Verify

```bash
npx docs-skills list
```

---

## Skills Catalog

**20 skills** across 6 categories. Browse the live catalog: [docsbook.io/skills](https://docsbook.io/skills).

### Analysis — audit existing documentation (11 skills)

| Skill | What it checks |
|-------|---------------|
| `/docs-analyze` | Orchestrator — runs all 10 sub-skills, produces a unified prioritized report |
| `/docs-content-types` | Diátaxis balance: tutorial / how-to / reference / explanation |
| `/docs-structure-templates` | Frontmatter, heading hierarchy, code block conventions |
| `/docs-style-tone` | Active voice, filler words, marketing adjectives, terminology consistency |
| `/docs-audience` | Vocabulary mismatch, assumed knowledge gaps, missing prerequisites |
| `/docs-navigation-linking` | Orphan pages, broken internal links, anchor text quality |
| `/docs-seo` | Title/description, topic clusters, AI Overviews compatibility |
| `/docs-accessibility` | WCAG 2.1 AA from markdown source — alt text, heading order, link text |
| `/docs-i18n` | Multilingual parity, hreflang, translation freshness |
| `/docs-media` | Images, screenshots, diagrams, captions, oversized files |
| `/docs-maintenance` | Stale content, deprecated pages, TODO/FIXME markers |

### Creation — generate new documentation (4 skills)

| Skill | What it does |
|-------|-------------|
| `/docs-create` | Full pipeline: detect source → build docs → publish to GitHub → configure Docsbook |
| `/docs-create-interactive` | Same pipeline with review checkpoints between each step |
| `/docs-detect-source` | Detect source type (website URL / code repo / Mintlify / GitBook / Docusaurus) |
| `/docs-from-site` | Crawl a website URL and produce structured Markdown |

### Publishing — ship docs to Docsbook (3 skills)

| Skill | What it does | Plan |
|-------|-------------|------|
| `/docs-publish` | Publish a local folder to a new GitHub repo (git init, gh repo create, push) | Free |
| `/docs-setup-workspace` | Configure a Docsbook workspace via MCP (branding, AI chat, SEO, languages) | Free |
| `/docs-generate-agents-md` | Generate `AGENTS.md` at repo root — gives every future agent context | Free |

### Observability — turn analytics into actions (1 skill)

| Skill | What it does | Plan |
|-------|-------------|------|
| `/docs-gap-finder` | Cross-reference failed searches + unanswered AI questions vs doc graph → prioritized list of pages to create | PRO+ |

### Planning (1 skill)

| Skill | What it does |
|-------|-------------|
| `/docs-strategy-plan` | Plan docs strategy before creation — audience, structure, content types |

### Automation (7 skills)

| Skill | What it does |
|-------|-------------|
| `/docs-sync` | Keep docs in sync with code on push |
| `/docs-pr-check` | Validate docs changes in pull requests |
| `/docs-enable-translation` | Set up AI translation for a workspace |
| `/docs-tune-ai-chat` | Tune the AI chatbot system prompt and hooks |
| `/docs-release-announce` | Announce new releases in docs |
| `/docs-stale-watcher` | Watch for stale content and create issues |
| `/docs-translate-webhook` | Trigger translation on content updates |

> **Looking for event-driven automation?** Subagents that execute on webhook events (pre-push, PR merge, release tags) live in **[docs-subagents](https://github.com/Docsbook-io/docs-subagents)**.

---

## How It Works

Skills use the **Docsbook MCP server** to read the live documentation graph — pages, headings, sections, link relationships — without cloning the repo locally.

```
AI Tool (Claude Code / Cursor / Codex / Copilot)
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

**One-time MCP setup** (optional — only needed for skills that read the doc graph):

```bash
mcp add --transport http https://docsbook.io/api/mcp/server
```

No account required for reading public repos. Sign up at [docsbook.io](https://docsbook.io) for PRO features (doc graph, section reading, AI tuning, webhooks).

---

## Two Consumption Modes

### 1. Local install

`npx docs-skills install` copies SKILL.md files into your project. Works offline.

### 2. Runtime discovery via Docsbook MCP

If your agent is already connected to the Docsbook MCP server, no install needed:

```
@docsbook find_skill "audit my docs for accessibility"
```

The tool searches by name + description + keywords and returns matching SKILL.md URLs. Your agent reads them via WebFetch and runs the steps inline.

---

## Features

✅ **20 reusable skills** — analysis, creation, publishing, observability, planning, automation  
✅ **Acceptance Criteria** — every skill ships with a pass/fail checklist  
✅ **Agent-agnostic** — Claude Code, Cursor, Copilot, Codex  
✅ **Live doc graph** — reads structure via Docsbook MCP, no repo clone needed  
✅ **Offline-first** — works after `npx docs-skills install`, no network required  
✅ **Open source** — fork, extend, contribute back  

---

## CLI Reference

```bash
docs-skills install [dir]    # Install catalog into dir (default: current directory)
docs-skills list             # List all skills with descriptions
docs-skills info <skill>     # Show full skill definition
```

---

## Contributing

Skills are plain Markdown files in `skills/<name>/SKILL.md`. To add a skill:

1. Create `skills/your-skill/SKILL.md` following the schema in `schema/`
2. Run `pnpm build-index` to regenerate `index.json`
3. Open a PR

The catalog is intentionally minimal — one file per skill, no runtime dependencies.

---

## License

MIT © 2024 Dan Bondarev / [docsbook.io](https://docsbook.io)
