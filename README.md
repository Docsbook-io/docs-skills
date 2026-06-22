<div align="center">

# docs-skills

**Your AI agent doesn't know how to maintain docs. Now it does.**

[![npm version](https://badge.fury.io/js/docs-skills.svg)](https://www.npmjs.com/package/docs-skills)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)

[Quickstart](#quickstart) • [Skills Catalog](#skills-catalog) • [How It Works](#how-it-works) • [CLI](#cli-reference) • [Contributing](#contributing)

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

# Quickstart

Install the whole catalog (or one skill) into your AI agent — Claude Code, Cursor, Codex, Copilot:

```bash
# everything
npx skills add Docsbook-io/docs-skills --skill '*'

# or just one
npx skills add Docsbook-io/docs-skills --skill docs-analyze
```

Then just ask your agent in plain language:

> "Audit my docs and give me one prioritized report"
> "Turn this GitHub repo into a live docs site"
> "Which pages are users searching for but not finding?"
> "Translate my docs into 15 languages"

No flags, no config — the skill fires from your request. Browse the full catalog below.

---

## Skills Catalog

**39 skills** across 7 categories. Browse live: [docsbook.io/skills](https://docsbook.io/skills).

### Analysis — audit existing documentation

Run when your docs exist but you're not sure they're correct, readable, or complete.

#### `docs-analyze`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-analyze
```
> "Audit my docs and give me one prioritized report"
> "Run a full health check before our release"
> "What's wrong with my documentation?"
> "Do a complete review of the docs/ folder"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-analyze/SKILL.md)

---

#### `docs-content-types`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-content-types
```
> "Users say they can't find answers — are my page types mixed up?"
> "Check my docs against Diátaxis"
> "Which pages mix tutorials with reference material?"
> "Are my how-to guides actually how-to guides?"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-content-types/SKILL.md)

---

#### `docs-structure-templates`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-structure-templates
```
> "Check these new pages for missing frontmatter before I merge"
> "Are my headings nested correctly?"
> "Which code blocks are missing a language tag?"
> "Validate the structure of every page in docs/"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-structure-templates/SKILL.md)

---

#### `docs-style-tone`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-style-tone
```
> "My docs feel corporate — flag the marketing fluff"
> "Find passive voice and filler words in my docs"
> "Tighten the prose without rewriting it for me"
> "Where am I using 'simply' and 'just' and 'powerful'?"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-style-tone/SKILL.md)

---

#### `docs-audience`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-audience
```
> "Junior devs keep bouncing off this page — why?"
> "Which pages talk over the reader's head?"
> "Find undefined jargon and missing prerequisites"
> "Is this page trying to serve beginners and experts at once?"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-audience/SKILL.md)

---

#### `docs-navigation-linking`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-navigation-linking
```
> "Find the broken internal links in my docs"
> "Which pages are orphans with nothing linking to them?"
> "Hunt down the dead ends and 'click here' anchors"
> "Check my doc graph after this restructure"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-navigation-linking/SKILL.md)

---

#### `docs-seo`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-seo
```
> "Make my docs rank in Google and AI Overviews"
> "Find missing or duplicate titles and descriptions"
> "Run an SEO audit on my documentation"
> "Why isn't this docs section getting organic traffic?"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-seo/SKILL.md)

---

#### `docs-accessibility`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-accessibility
```
> "Check my docs for WCAG 2.1 AA violations"
> "Find images missing alt text"
> "Are my docs usable with a screen reader?"
> "Run an a11y audit before we launch publicly"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-accessibility/SKILL.md)

---

#### `docs-i18n`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-i18n
```
> "Are my translations lagging behind the English source?"
> "Check content parity across all my languages"
> "Find stale translations and broken hreflang tags"
> "Which pages aren't translated yet?"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-i18n/SKILL.md)

---

#### `docs-media`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-media
```
> "Find the bloated images slowing my docs down"
> "Which screenshots are out of date after the UI redesign?"
> "Flag images with no alt text or generic filenames"
> "Audit every image and video in my docs"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-media/SKILL.md)

---

#### `docs-maintenance`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-maintenance
```
> "Find docs that reference features or prices that no longer exist"
> "Run a quarterly maintenance audit on the whole tree"
> "Which pages still have TODO/FIXME left in them?"
> "Find deprecated pages with no migration path"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-maintenance/SKILL.md)

---

### Creation — generate new documentation

Use when you need to produce docs from scratch or migrate from another platform.

#### `docs-create`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-create
```
> "Turn this GitHub repo into a live docs site"
> "Create documentation from my product website"
> "Build me a docs site from scratch and publish it"
> "I have a Mintlify site — make it a Docsbook site"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-create/SKILL.md)

---

#### `docs-create-interactive`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-create-interactive
```
> "Create my docs but let me approve each step"
> "Build a docs site — pause before publishing so I can review"
> "I want to pick the structure and branding myself"
> "Walk me through creating docs with checkpoints"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-create-interactive/SKILL.md)

---

#### `docs-detect-source`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-detect-source
```
> "Is this a website, a repo, or an existing docs platform?"
> "Figure out what kind of docs source I have"
> "What should I run to build docs from this URL?"
> "Detect whether this is Mintlify or GitBook"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-detect-source/SKILL.md)

---

#### `docs-from-site`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-from-site
```
> "Make docs from my product website"
> "Crawl this site and turn it into Markdown docs"
> "Import my marketing site as documentation"
> "Generate docs from this URL"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-from-site/SKILL.md)

---

#### `docs-from-code`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-from-code
```
> "Build docs from my GitHub repo"
> "Generate API docs from this codebase"
> "Import the repo's README and exported API as docs"
> "Make documentation from this code — the marketing site doesn't exist yet"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-from-code/SKILL.md)

---

#### `docs-from-docs`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-from-docs
```
> "Migrate my docs off Mintlify"
> "Import my GitBook into a clean Markdown folder"
> "Move my Docusaurus site to Docsbook"
> "Convert my Nextra docs to plain Markdown, structure intact"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-from-docs/SKILL.md)

---

#### `docs-branding`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-branding
```
> "Set up the branding for my docs workspace"
> "Pull brand colors from my website and apply them"
> "Pick an accent color and font that match my product"
> "Brand my docs from my logo and README"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-branding/SKILL.md)

---

#### `docs-first-run-enrichment`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-first-run-enrichment
```
> "Make my freshly generated docs rich instead of a bare skeleton"
> "Auto-brand and flesh out this new docs site before I publish"
> "Turn this skeleton into a real multi-section site"
> "Enrich the docs with a proper getting-started and landing page"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-first-run-enrichment/SKILL.md)

---

#### `docs-imagine`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-imagine
```
> "Imagine docs for my product — I only have a name"
> "Invent documentation for X, no URL or repo"
> "Make up a marketing-grade docs site from scratch"
> "придумай документацию for better selling"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-imagine/SKILL.md)

---

### Publishing — ship docs to Docsbook

Use after generating docs locally to push them live and configure the workspace.

#### `docs-publish`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-publish
```
> "Push my local docs folder to GitHub"
> "Publish these docs to a new repo"
> "Commit and push my docs and give me the Docsbook URL"
> "Ship the docs I just generated"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-publish/SKILL.md)

---

#### `docs-setup-workspace`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-setup-workspace
```
> "Configure my Docsbook workspace from one command"
> "Wire up branding, SEO, languages and AI chat"
> "Set up my workspace without clicking through the UI"
> "Apply my branding and turn on the right features"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-setup-workspace/SKILL.md)

---

#### `docs-generate-agents-md`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-generate-agents-md
```
> "Generate an AGENTS.md so every AI agent knows about my docs"
> "Give Cursor and Claude Code context about my documentation"
> "Write the AGENTS.md file at repo root"
> "Make sure my agents start each session knowing the docs URL"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-generate-agents-md/SKILL.md)

---

### Observability — turn analytics into actions

Use when you want to act on real user signal rather than guesswork.

#### `docs-gap-finder`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-gap-finder
```
> "Which docs page should I write next?"
> "What are users searching for but not finding?"
> "Find the top missing pages from real user signal"
> "Open GitHub issues for the biggest content gaps"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-gap-finder/SKILL.md)

---

#### `docs-question-clusterer`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-question-clusterer
```
> "Group every question users ask the AI chat into topics"
> "Which questions are content gaps vs the chat just missing the page?"
> "Cluster my AI chat questions and tell me what's missing"
> "Did my new docs actually reduce AI chat failures?"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/observability/docs-question-clusterer/SKILL.md)

---

#### `docs-engagement-analyzer`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-engagement-analyzer
```
> "Which long-read pages are loved vs which are confusing?"
> "Split my high-dwell pages into deep interest vs stuck users"
> "Find pages where people spend ages but leave unhappy"
> "Did my rewrite actually improve engagement?"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/observability/docs-engagement-analyzer/SKILL.md)

---

#### `docs-funnel-mapper`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-funnel-mapper
```
> "Map the most common journeys through my docs"
> "Where are users dropping before they reach a conversion page?"
> "Find the high-volume paths with low completion rates"
> "Which links does the doc graph imply that users never actually take?"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/observability/docs-funnel-mapper/SKILL.md)

---

#### `docs-link-click-analyzer`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-link-click-analyzer
```
> "Which CTA buttons are underperforming on my docs?"
> "Measure click-through on every internal link"
> "Is my Upgrade button buried where nobody clicks it?"
> "Find pages with pageviews but zero outgoing clicks"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/observability/docs-link-click-analyzer/SKILL.md)

---

#### `docs-utm-analyzer`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-utm-analyzer
```
> "Which campaigns send traffic that bounces on the docs?"
> "Match my UTM traffic against the pages people land on"
> "Where does the ad promise not match the doc reality?"
> "We got a referrer surge but no signups — find the mismatch"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/observability/docs-utm-analyzer/SKILL.md)

---

#### `docs-visitor-cohort`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-visitor-cohort
```
> "Who are my most active visitors and what are they doing?"
> "Cluster my top visitors by behavior pattern"
> "Find the buyer-blockers — people who hit pricing then leave unhappy"
> "What's the current profile of my power users before a pricing change?"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/observability/docs-visitor-cohort/SKILL.md)

---

### Growth — understand who buys, how they enter, and who you compete with

Use when you want your docs to *grow the product*, not just document it — and to keep your private product knowledge base honest about your buyers and your market.

#### `docs-audience-enricher`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-audience-enricher
```
> "Figure out who actually buys my product and how they enter"
> "Enrich my about/ folder with buyer segments and competitors"
> "What's changed in my competitive landscape since I last wrote?"
> "Fill the blind spots in my product source-of-truth before a growth pass"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/growth/docs-audience-enricher/SKILL.md)

---

### Planning — design the structure before writing

Use when starting from scratch or when the existing docs need a strategic rethink.

#### `docs-strategy-plan`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-strategy-plan
```
> "I have no docs and don't know where to start"
> "What should I document, for whom, and in what order?"
> "Help me build a documentation roadmap"
> "Give me a prioritized content backlog before I start writing"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-strategy-plan/SKILL.md)

---

### Automation — wire docs maintenance into your CI/CD pipeline

Install once, run forever.

#### `docs-sync`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-sync
```
> "Stop my docs from drifting out of sync with the code"
> "Install a pre-push hook that fixes drifted docs automatically"
> "Detect and fix code↔docs drift before this push"
> "Which docs sections did my last code change make stale?"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/automation/docs-sync/SKILL.md)

---

#### `docs-pr-check`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-pr-check
```
> "Add a CI gate that flags code changes shipped without docs"
> "Generate a GitHub Action to check docs on every PR"
> "Catch missing frontmatter and broken links in pull requests"
> "Make sure no PR merges with stale documentation"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/automation/docs-pr-check/SKILL.md)

---

#### `docs-enable-translation`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-enable-translation
```
> "Translate my docs into 15 languages"
> "Turn on AI auto-translation for my workspace"
> "Enable Spanish, French and German and notify Slack when each batch finishes"
> "We're launching in a new market — switch on translations"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/automation/docs-enable-translation/SKILL.md)

---

#### `docs-tune-ai-chat`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-tune-ai-chat
```
> "Users keep thumbs-downing the AI chat — fix the prompt"
> "Improve my AI chat using last month's negative feedback"
> "The chatbot says 'I don't know' too often — tune it"
> "Cluster chat failures and propose a prompt update I can approve"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/automation/docs-tune-ai-chat/SKILL.md)

---

#### `docs-release-announce`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-release-announce
```
> "Announce every release to Slack automatically"
> "Send an email when a new release is published"
> "Wire up release notifications so I stop posting them by hand"
> "Set up a GitHub Action that fires on release: published"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/automation/docs-release-announce/SKILL.md)

---

#### `docs-stale-watcher`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-stale-watcher
```
> "Turn stale-content alerts into GitHub Issues automatically"
> "Surface outdated docs in our normal issue triage"
> "Watch for stale pages and file an issue for each one"
> "Stop relying on manual quarterly audits for outdated docs"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/automation/docs-stale-watcher/SKILL.md)

---

#### `docs-translate-webhook`

```bash
npx skills add Docsbook-io/docs-skills --skill docs-translate-webhook
```
> "Route translation to my own DeepL pipeline instead of the built-in one"
> "Bypass the built-in translator and use my TMS over webhooks"
> "Scaffold a webhook handler for custom translation"
> "Switch my workspace to external translation mode"

[SKILL.md →](https://github.com/Docsbook-io/docs-skills/blob/main/skills/automation/docs-translate-webhook/SKILL.md)

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

---

## Features

✅ **39 reusable skills** — analysis, creation, publishing, observability, growth, planning, automation  
✅ **One command, plain-language trigger** — `npx skills add` then just ask your agent  
✅ **Acceptance Criteria** — every skill ships with a pass/fail checklist  
✅ **Agent-agnostic** — Claude Code, Cursor, Copilot, Codex  
✅ **Tool-agnostic** — describes the *need*, not the tool; runs on bare `grep`/`find`, accelerates with `markdown-lsp` or Docsbook MCP  
✅ **Open source** — fork, extend, contribute back  

---

## CLI Reference

Powered by the [`skills`](https://github.com/vercel-labs/skills) CLI:

```bash
npx skills add Docsbook-io/docs-skills --skill '*'        # install the whole catalog
npx skills add Docsbook-io/docs-skills --skill docs-seo   # install one skill
npx skills add Docsbook-io/docs-skills -a claude-code -a cursor --skill '*'   # target specific agents
npx skills list                                           # list installed skills
npx skills find <keyword>                                 # search for a skill
npx skills update                                          # update installed skills
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
