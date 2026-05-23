# docs-skills

11 AI agent skills for documentation analysis. Works with any public GitHub repo via the [Docsbook](https://docsbook.io) MCP server.

Point the skills at any GitHub repo and get a comprehensive audit: content structure, SEO, accessibility, i18n parity, style consistency, stale pages, broken links, and more.

---

## Skills

| Skill | Description |
|---|---|
| `/docs-analyze` | Orchestrator — runs all 10 sub-skills and produces a unified prioritized report |
| `/docs-content-types` | Diátaxis framework analysis (tutorial / how-to / reference / explanation balance) |
| `/docs-structure-templates` | Frontmatter, heading hierarchy, code block conventions |
| `/docs-style-tone` | Active voice, filler words, marketing adjectives, terminology consistency |
| `/docs-audience` | Vocabulary mismatch, assumed knowledge gaps, missing prerequisites |
| `/docs-navigation-linking` | Orphan pages, broken links, anchor text quality |
| `/docs-seo` | Title/description tags, topic clusters, AI Overviews compatibility |
| `/docs-accessibility` | WCAG 2.1 AA from markdown source — alt text, heading order, link text |
| `/docs-i18n` | Multilingual parity, hreflang, translation freshness |
| `/docs-media` | Images, screenshots, diagrams, missing captions, large files |
| `/docs-maintenance` | Stale content, deprecated pages, TODO/FIXME markers |

---

## How it works

Each skill uses the **Docsbook MCP server** to read the documentation graph of any public GitHub repository — all pages, headings, sections, and link relationships — without cloning the repo locally.

```
AI Tool (Claude Code / Cursor / Codex)
        │
        ▼
  docs-skill runs
        │
        ▼
  Docsbook MCP  ──▶  GitHub repo docs/
        │
        ▼
  Structured audit report
```

**Docsbook MCP setup** (one-time, per AI tool):

```bash
# Claude Code
mcp add --transport http https://docsbook.io/api/mcp/server
```

No account required for reading public repos. Sign up at [docsbook.io](https://docsbook.io) for PRO features (doc graph, section reading, reindex).

---

## Install

### npm (recommended)

```bash
npm install -g docs-skills
docs-skills install
```

`docs-skills install` auto-detects your AI tool and copies the skills to the right place.

### Manual

Copy the `skills/` folder into your project:

```bash
# Clone or download
git clone https://github.com/docsbook/docs-skills.git
cp -r docs-skills/skills .claude/skills/
```

---

## Setup per AI tool

### Claude Code

Copy skills into `.claude/skills/` in your project (or globally in `~/.claude/skills/`):

```bash
docs-skills install          # auto-installs into current project
docs-skills install ~/       # install globally
```

Then use in any conversation:

```
/docs-analyze
```

Claude will ask for the GitHub repo URL and run the full audit.

### Cursor

Copy skills into `.cursor/rules/`:

```bash
docs-skills install
```

Or manually create `.cursor/rules/docs-skills.mdc` pointing at the skills. Then mention `@docs-analyze` in chat.

### GitHub Copilot

The installer appends a `docs-skills` section to `.github/copilot-instructions.md`:

```bash
docs-skills install
```

Or manually append the contents of `skills/*/SKILL.md` to your Copilot instructions file.

### OpenAI Codex

The installer appends a `docs-skills` section to `AGENTS.md`:

```bash
docs-skills install
```

Or manually append skill descriptions to your `AGENTS.md`.

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
docs-skills list             # List all 11 skills with descriptions
docs-skills info <skill>     # Show full skill definition
```

---

## License

MIT © 2024 Dan Bondarev / [docsbook.io](https://docsbook.io)
