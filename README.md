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

**29 reusable skills** (Workflow + Guardrails + Acceptance Criteria) that teach your AI agent to handle any documentation task correctly — from audit to publish.

| Before | After |
|--------|-------|
| Agent hallucinates doc structure | Agent works from your real docs — files, sitemap, or doc graph |
| One-off prompts per project | Reusable skill catalog, works everywhere |
| No acceptance criteria | Every skill ships with pass/fail checklist |
| Hours of prompting per audit | `/docs-analyze` → unified report in minutes |

Skills describe **what the agent needs and how to think** — not which tool to call. They run on a bare agent (`grep`/`find` over a docs folder) and get **faster and cheaper** when an optional graph/semantic search tool is connected. See [Optional acceleration](#optional-acceleration).

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

**30 skills** across 7 categories. Browse live: [docsbook.io/skills](https://docsbook.io/skills).

### Analysis — audit existing documentation

Run when your docs exist but you're not sure they're correct, readable, or complete.

#### `/docs-analyze`

**When to use:** You want a full health check of your docs in one command — instead of running 10 audits separately. Run before a major release or after a big restructure.  
**What you get:** A single prioritized Markdown report combining SEO, accessibility, style, structure, i18n, media and maintenance findings — ranked by severity (Critical / High / Medium / Low), with a Quick Wins list of fixes that take under 30 minutes.  
**Requires:** Any docs folder • Optional: `markdown-lsp` or Docsbook MCP to accelerate • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-analyze/SKILL.md)

---

#### `/docs-content-types`

**When to use:** Users say they can't find answers, or your docs feel confusing — a sign that tutorials, how-to guides, reference and explanation are mixed together on the same pages.  
**What you get:** Every page classified against the Diátaxis framework (tutorial / how-to / reference / explanation), with a JSON issue list flagging misclassified pages, hybrid pages that mix types, and specific split or rewrite suggestions.  
**Requires:** Any docs folder • Optional: `markdown-lsp` or Docsbook MCP to accelerate • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-content-types/SKILL.md)

---

#### `/docs-structure-templates`

**When to use:** Before merging a batch of new pages, or when running a structural audit to make sure every page has a title, description, correct heading hierarchy, and tagged code blocks.  
**What you get:** A JSON report per page listing missing frontmatter fields, heading-level skips (H2 → H4), code blocks without a language tag, and missing prerequisites sections — sorted by severity, with the exact fix for each.  
**Requires:** Any docs folder • Optional: `markdown-lsp` or Docsbook MCP to accelerate • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-structure-templates/SKILL.md)

---

#### `/docs-style-tone`

**When to use:** When you receive feedback that your docs feel corporate, condescending or hard to follow. Run after onboarding a new writer or before a public launch.  
**What you get:** A per-page JSON issue list flagging passive voice in instructions, filler words ("simply", "just"), marketing adjectives without specifics ("powerful", "seamless"), oversized sentences, and terminology inconsistencies — each with a before/after rewrite suggestion.  
**Requires:** Any docs folder • Optional: `markdown-lsp` or Docsbook MCP to accelerate • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-style-tone/SKILL.md)

---

#### `/docs-audience`

**When to use:** When junior developers bounce off a page, or when a single page is trying to serve beginners and experts at the same time.  
**What you get:** Every page assigned an audience level (beginner / expert / mixed), with JSON findings for undefined jargon on beginner pages, prerequisite mismatches, and mixed-audience pages — each with a concrete split or rewrite recommendation.  
**Requires:** Any docs folder • Optional: `markdown-lsp` or Docsbook MCP to accelerate • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-audience/SKILL.md)

---

#### `/docs-navigation-linking`

**When to use:** After a docs restructure, when users report dead ends, or as part of a quarterly audit to catch orphan pages and broken internal links.  
**What you get:** A full cross-file JSON report listing broken internal links (with the exact missing path), orphan pages with zero inbound links, "click here" anchor text violations, navigation depth over 3 levels, and tutorials missing a Next Steps section.  
**Requires:** Any docs folder • Optional: `markdown-lsp` or Docsbook MCP to accelerate • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-navigation-linking/SKILL.md)

---

#### `/docs-seo`

**When to use:** When organic traffic is flat, after a site migration, or before launching a new docs section you want to rank in Google and appear in AI Overviews.  
**What you get:** A JSON report covering missing or duplicate titles/descriptions, heading hierarchy violations, orphan pages with no link equity, images without alt text, and an optional AI Overviews / GEO checklist — all sorted by SEO impact.  
**Requires:** Any docs folder • Optional: `markdown-lsp` or Docsbook MCP to accelerate • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-seo/SKILL.md)

---

#### `/docs-accessibility`

**When to use:** Before a public launch, for WCAG 2.1 AA compliance, or when a user reports that your docs are difficult to use with a screen reader.  
**What you get:** A JSON issue list per page covering missing alt text on informative images, heading hierarchy skips, vague link anchor text ("click here"), code blocks without language tags, and color-only meaning in prose — each with the exact WCAG criterion and a specific fix.  
**Requires:** Any docs folder • Optional: `markdown-lsp` or Docsbook MCP to accelerate • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-accessibility/SKILL.md)

---

#### `/docs-i18n`

**When to use:** When enabling a new language, after a large content update, or when you suspect translations are lagging behind the English source. Automatically skipped if only one language is enabled.  
**What you get:** A JSON report of missing Tier 1 page translations, stale translations more than 30 days behind the source, translated code blocks (a syntax error risk), broken hreflang tags, and un-localized date/number formats — covering all 15 languages Docsbook supports.  
**Requires:** Any docs folder • Optional: `markdown-lsp` or Docsbook MCP to accelerate • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-i18n/SKILL.md)

---

#### `/docs-media`

**When to use:** When images are loading slowly, screenshots look outdated after a UI redesign, or before a public launch to catch missing alt text and generic filenames.  
**What you get:** A JSON issue list covering informative images without alt text, generic filenames (`screenshot1.png`), JPG used for UI screenshots (degrades text), video files committed to the repo, and pages with screenshots not updated in 180+ days — with a specific fix for each.  
**Requires:** Any docs folder • Optional: `markdown-lsp` or Docsbook MCP to accelerate • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-media/SKILL.md)

---

#### `/docs-maintenance`

**When to use:** As a quarterly audit, or when users report that your docs reference features, prices or API endpoints that no longer exist.  
**What you get:** A whole-tree JSON report flagging TODO/FIXME in published docs, "coming soon" banners older than 30 days, past dates presented as future promises, deprecated pages without migration paths, and pricing values out of sync with your app's pricing source-of-truth — each marked critical/high/medium/low.  
**Requires:** Any docs folder • Optional: `markdown-lsp` or Docsbook MCP to accelerate • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-maintenance/SKILL.md)

---

### Creation — generate new documentation

Use when you need to produce docs from scratch or migrate from another platform.

#### `/docs-create`

**When to use:** You have a product URL, a GitHub repo, or an existing docs platform (Mintlify, GitBook, Docusaurus) and want a live Docsbook site with minimal questions asked.  
**What you get:** A fully scaffolded Markdown docs folder published to a new GitHub repo, a configured Docsbook workspace with branding applied, and a final report with local path, GitHub URL, and Docsbook URL — end-to-end in one command.  
**Requires:** No MCP needed (MCP enhances workspace setup step) • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-create/SKILL.md)

---

#### `/docs-create-interactive`

**When to use:** Same scenario as `/docs-create`, but you want to review and approve each decision — file structure, branding, GitHub repo name, and which Docsbook features to enable — before anything is published.  
**What you get:** Identical output to `/docs-create`, but with five explicit checkpoints where you confirm or adjust before the next step runs. A final summary lists every choice made at each checkpoint.  
**Requires:** No MCP needed • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-create-interactive/SKILL.md)

---

#### `/docs-detect-source`

**When to use:** Before running `/docs-create` when you're unsure whether your input is a plain website, a code repo, or an existing docs platform — or use it standalone to route correctly before building.  
**What you get:** A single classified source type (`website`, `github-code-repo`, Mintlify, GitBook, Docusaurus, etc.) derived from meta tags, config file inspection, and domain signals, plus the name of the downstream skill to run next.  
**Requires:** No MCP needed • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-detect-source/SKILL.md)

---

#### `/docs-from-site`

**When to use:** Your only source of truth is a marketing or product website and you need structured Markdown docs from it — useful as a starting point before a full `/docs-create` run.  
**What you get:** A `docs-output/<name>/` folder with a README, getting-started section, per-feature pages, guides, and FAQ (only sections found on the site), plus a `_branding.json` with accent color, background, favicon, and color scheme extracted from the site's CSS.  
**Requires:** No MCP needed • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-from-site/SKILL.md)

---

#### `/docs-from-code`

**When to use:** Your source of truth is a code repository (Node, Python, Go, Rust, .NET, JVM) and you want docs built from its README, exported API surface, examples, and configuration — useful when the marketing site is a thin SPA or doesn't exist yet.  
**What you get:** A `docs-output/<name>/` folder with the README split into structured pages, one `api/<module>.md` per public export (signatures + docstrings, with `TODO` markers for undocumented items), a `guides/configuration.md` from `.env.example` and `docker-compose.yml`, and a `_branding.json` (no fabricated accent color — omitted when undetected). Secrets in env files are redacted.  
**Requires:** `gh` CLI or `git` • No MCP needed • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-from-code/SKILL.md)

---

#### `/docs-from-docs`

**When to use:** You're migrating off Mintlify, GitBook, Docusaurus, Nextra, VitePress, or Starlight and want a clean Docsbook-ready Markdown folder with the original structure preserved.  
**What you get:** A `docs-output/<name>/` folder mirroring the source navigation, with platform-specific MDX components normalised to plain Markdown (`<Card>`, `<Tabs>`, `{% hint %}`, `:::note`, `<Callout>`, `<Aside>` → headings + blockquotes), internal links rewritten to relative paths, images copied into `_assets/`, and `_branding.json` carrying the platform's accent color when present.  
**Requires:** `gh` CLI or `git` • No MCP needed • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-from-docs/SKILL.md)

---

### Publishing — ship docs to Docsbook

Use after generating docs locally to push them live and configure the workspace.

#### `/docs-publish`

**When to use:** You have a local docs folder ready and want to push it to GitHub in one step — the natural follow-up to `/docs-from-site` or any other generation skill.  
**What you get:** A new public GitHub repo with your docs pushed to `main` over HTTPS, plus a computed Docsbook URL printed in the result. The skill handles `git init`, initial commit, and `gh repo create` automatically.  
**Requires:** `gh` CLI authenticated • No MCP needed • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-publish/SKILL.md)

---

#### `/docs-setup-workspace`

**When to use:** Right after `/docs-publish`, to wire branding, AI chat, SEO, languages, and a custom domain for your new Docsbook workspace — without clicking through the UI.  
**What you get:** A fully configured Docsbook workspace: branding applied from `_branding.json` (or sensible defaults), UI toggles set, navigation back-link added. Plan-gated features (SEO, languages, AI chat, custom domain) are applied if your plan allows; each failure is recorded without blocking the rest of the run.  
**Requires:** Docsbook MCP • Free plan (PRO/PRO+ for advanced settings)  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-setup-workspace/SKILL.md)

---

#### `/docs-generate-agents-md`

**When to use:** After setting up a Docsbook workspace, to give every AI agent in the repo — Claude Code, Cursor, Codex, Copilot, Gemini CLI — consistent context about your docs site from the very first session.  
**What you get:** An `AGENTS.md` written to repo root (or a managed section updated if it already exists) containing the docs URL, enabled languages, AI chat status, top-level folder structure, and the list of available `/docs-skills` commands.  
**Requires:** Any docs folder • Optional: `markdown-lsp` or Docsbook MCP to accelerate • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-generate-agents-md/SKILL.md)

---

### Observability — turn analytics into actions

Use when you want to act on real user signal rather than guesswork.

#### `/docs-gap-finder`

**When to use:** Monthly, or after a major product launch, to find out which docs pages users are looking for but not finding — based on real failed searches and unanswered AI chat questions.  
**What you get:** A prioritized report of the top 7 missing pages, each with a priority score (`failed_search × 3 + ai_unanswered × 3 + popular_search × 1`), the user queries that drove it, a suggested file path, and a draft outline. Optionally opens one GitHub Issue per gap.  
**Requires:** Docsbook MCP • PRO+ plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-gap-finder/SKILL.md)

---

### Growth — understand who buys, how they enter, and who you compete with

Use when you want your docs to *grow the product*, not just document it — and to keep your private product knowledge base honest about your buyers and your market.

#### `/docs-audience-enricher`

**When to use:** Monthly, or before any growth-strategy pass, when your product source-of-truth (an `about/` folder, a product-marketing context file) has blank spots about who actually buys, how they enter the product, or how the competitive landscape has shifted.  
**What you get:** Three lenses — *segment* (JTBD, watering holes, buying triggers per ICP segment), *funnel* (every entry path, its friction, a 0–100% coverage score, what would measure it), and *competitor* (live price/feature changes and new entrants since you last wrote) — reasoning grounded in real analytics via the docs-insights pipeline where data exists and clearly labelled as simulated where it can't. It **appends** what it learns back into your knowledge base (additive, reversible, marker-wrapped — never touching your hand-written prose) and emits a schema-validated insight JSON for downstream opportunity-mapping. Proposes and enriches; never touches product code or client docs.  
**Requires:** Docsbook MCP • PRO plan (falls back to simulation on Free)  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/growth/docs-audience-enricher/SKILL.md)

---

### Planning — design the structure before writing

Use when starting from scratch or when the existing docs need a strategic rethink.

#### `/docs-strategy-plan`

**When to use:** When you have no docs yet and aren't sure what to write, or when your team wants docs to serve more than just getting-started (SEO, sales funnel, support deflection, AI citability).  
**What you get:** A `docs-plan.md` file with product summary, confirmed goals, 2–3 audience roles with funnels (Awareness → Activation → Retention), an information architecture, and a prioritized content backlog with P0/P1/P2 labels and effort estimates — plus a 5-line chat summary and the suggested next command to run.  
**Requires:** No MCP needed (optional: Docsbook MCP to read existing graph) • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-strategy-plan/SKILL.md)

---

### Automation — wire docs maintenance into your CI/CD pipeline

Install once, run forever.

#### `/docs-sync`

**When to use:** To prevent code↔docs drift on every push — install once as a pre-push git hook and it runs automatically before each push, detecting and fixing drifted documentation sections.  
**What you get:** A four-subagent pipeline (planner → parallel searchers → editors → curator) that detects which docs sections drifted relative to code changes, rewrites only the affected sections, and amends the commit atomically. In `warn` mode (default) it never blocks a push.  
**Requires:** `markdown-lsp` MCP server • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/automation/docs-sync/SKILL.md)

---

#### `/docs-pr-check`

**When to use:** To add a CI gate to every pull request that enforces docs hygiene — catches missing frontmatter, broken internal links, and code changes shipped without any doc updates.  
**What you get:** A ready-to-use `.github/workflows/docsbook-docs-check.yml` file with three jobs: code-vs-docs change ratio check, frontmatter validation (`title` and `description` required), and internal link integrity. Broken-links job uses `continue-on-error` by default so it never blocks merges unless you explicitly opt in.  
**Requires:** No MCP needed • Free plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/automation/docs-pr-check/SKILL.md)

---

#### `/docs-enable-translation`

**When to use:** When launching docs in a new market and you want AI auto-translation switched on across up to 15 languages in one command, with an optional Slack notification when each translation batch completes.  
**What you get:** Languages enabled on the workspace, translation mode switched to `auto` (translates new and changed pages on every push), an optional Slack webhook registered with a fresh HMAC secret, and a managed `## Docsbook Translation` section added to `AGENTS.md`.  
**Requires:** Docsbook MCP • PRO plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/automation/docs-enable-translation/SKILL.md)

---

#### `/docs-tune-ai-chat`

**When to use:** When users give thumbs-down to AI chat answers, or when the chatbot frequently says "I don't know" — use monthly or after a major docs overhaul.  
**What you get:** Failure patterns from the last 30 days clustered into 3–8 topics, a minimally invasive system prompt update (capped at 1,500 tokens) that addresses the top clusters without touching brand voice or persona rules, and a before/after diff. The update is applied only after you type `yes`.  
**Requires:** Docsbook MCP • PRO plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/automation/docs-tune-ai-chat/SKILL.md)

---

#### `/docs-release-announce`

**When to use:** When you want Slack and/or email notifications sent automatically every time a new release is published, without manually posting announcements.  
**What you get:** A `.github/workflows/docsbook-release-announce.yml` workflow triggered on `release: published`, a Docsbook release webhook registered with a fresh HMAC secret, and a list of repository secrets you need to configure for each notification channel.  
**Requires:** Docsbook MCP • PRO plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/automation/docs-release-announce/SKILL.md)

---

#### `/docs-stale-watcher`

**When to use:** When you want stale pages to surface automatically as GitHub Issues in your team's issue tracker, rather than requiring manual quarterly audits.  
**What you get:** A `.github/workflows/docsbook-stale-handler.yml` workflow that converts each `content.outdated` webhook event into a GitHub Issue linking to the source file, plus a registered webhook with a configurable staleness threshold (default 180 days).  
**Requires:** Docsbook MCP • PRO+ plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/automation/docs-stale-watcher/SKILL.md)

---

#### `/docs-translate-webhook`

**When to use:** When you want to bypass Docsbook's built-in AI translator and route translation work to your own TMS, DeepL integration, or custom translation pipeline.  
**What you get:** Translation mode switched to `external`, a `translation.requested` webhook registered with a fresh HMAC secret, and a scaffolded handler file (`api/docsbook-translate.ts` for Vercel, or `src/routes/docsbook-translate.ts` for Express) with HMAC signature verification and a TODO placeholder for your translation logic.  
**Requires:** Docsbook MCP • PRO+ plan  
[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/automation/docs-translate-webhook/SKILL.md)

---

> **Looking for event-driven automation?** Subagents that execute on webhook events (pre-push, PR merge, release tags) live in **[docs-subagents](https://github.com/Docsbook-io/docs-subagents)**.

---

## How It Works

Each skill states a **need** ("get the list of pages in scope and read their content") and **how to reason about it** — never a hardcoded tool call. The agent satisfies the need with whatever it has connected:

```
AI Tool (Claude Code / Cursor / Codex / Copilot)
        │
        ▼
  docs-skill runs  ──▶  states the need + how to think
        │
        ├─ nothing connected ──▶  grep / find over the docs folder
        ├─ markdown-lsp       ──▶  semantic / graph search, self-hosted
        └─ Docsbook MCP       ──▶  same capability in the cloud + workspace settings
        │
        ▼
  Audit report / generated files / configured workspace
```

The skill never names the tool. The agent sees what's available and picks the cheapest path that satisfies the need.

### Optional acceleration

Most analysis skills need to **list the pages in scope** and **read their content**. That works on a bare agent with `grep`/`find`. It gets faster and cheaper when graph/semantic search over the docs is available — two interchangeable transports for the same capability:

| Path | What you get | Cost |
|------|--------------|------|
| **Nothing** (default) | `grep`/`find` over the docs folder | free, works everywhere |
| **`markdown-lsp`** (self-hosted) | semantic + graph search, runs locally — [repo](https://github.com/Docsbook-io/markdown-lsp) | free, you host it |
| **Docsbook MCP** (cloud) | the same search in the cloud, plus workspace settings (branding, languages, analytics) | optional account |

```bash
# Optional cloud transport
mcp add --transport http https://docsbook.io/api/mcp/server
```

> The cloud transport runs `markdown-lsp` for you — so self-hosted and cloud are the **same capability**, your choice of where it runs. The cloud path is still maturing; the self-hosted path and the bare `grep`/`find` fallback always work. A handful of skills are intentionally about a hosted platform (`/docs-setup-workspace`, `/docs-branding`, the webhook-based automation skills) and genuinely need it — they say so and fall back to printed instructions when it's absent.

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

✅ **29 reusable skills** — analysis, creation, publishing, observability, planning, automation  
✅ **Acceptance Criteria** — every skill ships with a pass/fail checklist  
✅ **Agent-agnostic** — Claude Code, Cursor, Copilot, Codex  
✅ **Tool-agnostic** — describes the *need*, not the tool; runs on bare `grep`/`find`, accelerates with `markdown-lsp` or Docsbook MCP  
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
