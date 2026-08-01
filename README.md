<div align="center">

# docs-skills

**48 skills that teach your AI agent to run your documentation like a growth channel.**

Install once. Then just ask, in plain language.

[![npm version](https://badge.fury.io/js/docs-skills.svg)](https://www.npmjs.com/package/docs-skills)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)

[Install](#install-30-seconds) • [Find your pain](#find-your-pain) • [Full catalog](#full-catalog) • [How it works](#how-it-works) • [CLI](#cli-reference)

</div>

```bash
npx skills add Docsbook-io/docs-skills --skill '*'
```

---

## Find your pain

Scan the left column. Find yours. Run the command.

### 😫 "My docs are a mess and I don't know where to start"

| Your pain | Skill | What you get back |
|---|---|---|
| I don't know what's broken | **docs-analyze** | One prioritized report — 10 audits in a single pass |
| Users can't find answers | **docs-content-types** | Every page classified against Diátaxis, misclassifications flagged |
| Readers bounce off the page | **docs-audience** | Jargon, undeclared prerequisites, mixed-audience pages |
| Docs read like a brochure | **docs-style-tone** | Passive voice, filler, marketing adjectives — line by line |
| Broken links, orphan pages | **docs-navigation-linking** | Full doc-graph walk: dead ends, orphans, "click here" anchors |
| PRs land malformed pages | **docs-structure-templates** | Frontmatter, heading nesting, untagged code blocks |
| Nobody finds us on Google | **docs-seo** | Audit judged against the queries you actually rank for — not guessed from the page text |
| We get impressions, not clicks | **docs-rank-recovery** | Pages stuck at position 5–20, ranked into a rewrite queue — the cheapest traffic you can buy |
| Screen readers can't use it | **docs-accessibility** | WCAG 2.1 AA violations that actually matter in markdown |
| Translations rotted silently | **docs-i18n** | Content parity, ISO codes, hreflang, nav coverage |
| Screenshots show the old UI | **docs-media** | Stale screenshots, bloated images, missing alt text |
| Docs quietly lie to users | **docs-maintenance** | Stale content, deprecated pages with no migration path, TODOs |

```bash
npx skills add Docsbook-io/docs-skills --skill docs-analyze
```

> "Audit my docs and give me one prioritized report"

---

### 🚀 "I have no docs — or the wrong ones"

| Your pain | Skill | What you get back |
|---|---|---|
| I have a repo/URL and 0 docs | **docs-create** | Detect source → generate → publish → configure. One command |
| Same, but I want to approve each step | **docs-create-interactive** | Six checkpoints you control before anything ships |
| I don't know what my source even is | **docs-detect-source** | Website / repo / Mintlify / GitBook / Docusaurus — identified |
| Only a marketing site exists | **docs-from-site** | Rich conversion-grade Markdown crawled from the live site |
| Only code exists | **docs-from-code** | README, source tree, exported APIs, examples → Markdown |
| Trapped in GitBook/Mintlify | **docs-from-docs** | Clean portable Markdown, structure intact |
| Only a product name exists | **docs-imagine** | A full invented docs site — pages, messaging, structure |
| New site looks like a skeleton | **docs-first-run-enrichment** | Auto-branding + real getting-started and landing pages |
| Docs look nothing like my product | **docs-branding** | Colors, font, theme, logo derived from real signals |
| Docs inform but never sell | **docs-sales-conversion** | Monetization model detected → pricing page, CTA ladder, no dead ends |
| Pages are walls of links | **docs-content-widgets** | Card grids and accordions from invisible markers — source stays plain markdown |
| ChatGPT/Perplexity never cite us | **docs-ai-retrieval** | Passage-level rewrite patterns that survive controlled studies |

```bash
npx skills add Docsbook-io/docs-skills --skill docs-create
```

> "Turn this GitHub repo into a live docs site"

---

### 📊 "I'm guessing what to write next"

Real user signal instead of opinion.

| Your pain | Skill | What you get back |
|---|---|---|
| What do we fix this week? | **docs-health-triage** | Every health signal merged into one ranked queue, each item handed to the skill that fixes it |
| Which page do I write next? | **docs-gap-finder** | Failed searches + unanswered AI questions → ranked page list |
| Search found it, nobody clicked | **docs-title-rewriter** | Rewritten titles and first lines, verbatim and ready to paste — no page rewrites |
| Do our docs sell or just support? | **docs-buying-blockers** | Chat conversations split by buying stage: who's evaluating, what blocks them, which competitors they name |
| Readers leave with nothing | **docs-dead-end-hunter** | Ranked give-up pages, with the actual journeys behind them |
| What are people even asking? | **docs-question-clusterer** | Chat questions clustered, labeled content-gap vs retrieval-miss |
| Long dwell time — good or bad? | **docs-engagement-analyzer** | Deep interest vs stuck users, split by negative feedback |
| Where do users drop off? | **docs-funnel-mapper** | Common 3-step journeys, high-volume paths with low completion |
| Nobody clicks my Upgrade CTA | **docs-link-click-analyzer** | CTR per internal link, conversion-critical buttons that underperform |
| Campaign traffic bounces | **docs-utm-analyzer** | Where the ad promise doesn't match the doc reality |
| Who are my power users? | **docs-visitor-cohort** | Top visitors clustered — including "buyer-blockers" |

```bash
npx skills add Docsbook-io/docs-skills --skill docs-gap-finder
```

> "What are users searching for but not finding?"

---

### 🔁 "I keep doing the same maintenance by hand"

Install once, runs forever.

| Your pain | Skill | What you get back |
|---|---|---|
| Docs drift behind the code | **docs-sync** | Pre-push hook: detects drift, rewrites the affected sections |
| PRs merge with stale docs | **docs-pr-check** | GitHub Action gate on every PR |
| Stale pages nobody notices | **docs-stale-watcher** | Every outdated page becomes a GitHub Issue automatically |
| We're launching a new market | **docs-enable-translation** | Up to 15 languages, auto-mode, Slack ping per batch |
| I post release notes by hand | **docs-release-announce** | Slack/email fires on `release: published` |
| AI chat gets thumbs-down | **docs-tune-ai-chat** | Failures clustered → a prompt update you approve |
| I want my own TMS | **docs-translate-webhook** | Route translation to DeepL or your own pipeline |

```bash
npx skills add Docsbook-io/docs-skills --skill docs-sync
```

> "Stop my docs from drifting out of sync with the code"

---

### 📦 "Now ship it"

| Your pain | Skill | What you get back |
|---|---|---|
| Docs sit on my laptop | **docs-publish** | git init → commit → `gh repo create` → push. No account needed |
| Workspace config is 20 clicks | **docs-setup-workspace** | Branding, UI, AI chat, SEO, languages, domain — one command |
| Every agent re-learns my docs | **docs-generate-agents-md** | `AGENTS.md` at repo root, so Cursor/Claude Code start informed |

---

### 🧭 "I need a plan before I write anything"

| Your pain | Skill | What you get back |
|---|---|---|
| I don't know where to start | **docs-strategy-plan** | Guided interview → what to write, for whom, in what order |
| I don't know who actually buys | **docs-audience-enricher** | Buyer segments, entry paths, competitors — into your source-of-truth |
| Every new page needs the same fixes | **docs-authoring-rules** | The rulebook loaded *before* you write — page type, structure, style, next step — so the audits find nothing |

---

## Install (30 seconds)

Works in Claude Code, Cursor, Codex, Copilot.

```bash
npx skills add Docsbook-io/docs-skills --skill '*'
```

One skill only:

```bash
npx skills add Docsbook-io/docs-skills --skill docs-analyze
```

Then ask in plain language. No flags, no config — the skill fires from your request:

> "Audit my docs and give me one prioritized report"
> "Turn this GitHub repo into a live docs site"
> "Which pages are users searching for but not finding?"
> "Translate my docs into 15 languages"

---

## Before / after

| Without docs-skills | With docs-skills |
|---|---|
| Agent hallucinates doc structure | Agent works from your real docs — files, sitemap, or doc graph |
| One-off prompts, rewritten per project | Reusable catalog that works everywhere |
| "Looks good to me" | Every skill ships a pass/fail acceptance checklist |
| Hours of prompting per audit | `docs-analyze` → one prioritized report |
| Docs describe the product | Docs convert readers into users |

---

## Full catalog

**48 skills**, 7 categories. Browse live: [docsbook.io/skills](https://docsbook.io/skills).

<details>
<summary><b>Analysis</b> — 12 skills · audit what already exists</summary>

| Skill | Plan | Ask it |
|---|---|---|
| `docs-analyze` | free | "Run a full health check before our release" |
| `docs-content-types` | free | "Check my docs against Diátaxis" |
| `docs-structure-templates` | free | "Validate the structure of every page in docs/" |
| `docs-style-tone` | free | "Where am I using 'simply' and 'just' and 'powerful'?" |
| `docs-audience` | free | "Which pages talk over the reader's head?" |
| `docs-navigation-linking` | free | "Which pages are orphans with nothing linking to them?" |
| `docs-seo` | free | "Why isn't this docs section getting organic traffic?" |
| `docs-title-rewriter` | PRO | "Our search returns results and nobody clicks them — fix the titles" |
| `docs-accessibility` | free | "Run an a11y audit before we launch publicly" |
| `docs-i18n` | free | "Are my translations lagging behind the English source?" |
| `docs-media` | free | "Which screenshots are out of date after the UI redesign?" |
| `docs-maintenance` | free | "Find docs that reference features that no longer exist" |

</details>

<details>
<summary><b>Creation</b> — 13 skills · produce docs from anything</summary>

| Skill | Plan | Ask it |
|---|---|---|
| `docs-authoring-rules` | free | "Load the rules before I write this page" |
| `docs-create` | free | "Turn this GitHub repo into a live docs site" |
| `docs-create-interactive` | free | "Build a docs site — pause before publishing so I can review" |
| `docs-detect-source` | free | "Is this a website, a repo, or an existing docs platform?" |
| `docs-from-site` | free | "Crawl this site and turn it into Markdown docs" |
| `docs-from-code` | free | "Generate API docs from this codebase" |
| `docs-from-docs` | free | "Migrate my docs off Mintlify" |
| `docs-imagine` | free | "Imagine docs for my product — I only have a name" |
| `docs-first-run-enrichment` | free | "Turn this skeleton into a real multi-section site" |
| `docs-branding` | free · MCP | "Pull brand colors from my website and apply them" |
| `docs-sales-conversion` | free | "Make my docs sell, not just inform" |
| `docs-content-widgets` | free | "This page is a wall of links — make it a card grid" |
| `docs-ai-retrieval` | free | "Rewrite this so ChatGPT and Perplexity can cite it" |

</details>

<details>
<summary><b>Observability</b> — 9 skills · act on real user signal</summary>

| Skill | Plan | Ask it |
|---|---|---|
| `docs-gap-finder` | free | "Which docs page should I write next?" |
| `docs-dead-end-hunter` | PRO | "Which pages are losing people?" |
| `docs-question-clusterer` | PRO | "Cluster my AI chat questions and tell me what's missing" |
| `docs-engagement-analyzer` | PRO+ | "Which long-read pages are loved vs confusing?" |
| `docs-funnel-mapper` | PRO+ | "Where are users dropping before a conversion page?" |
| `docs-link-click-analyzer` | PRO+ | "Is my Upgrade button buried where nobody clicks it?" |
| `docs-utm-analyzer` | PRO+ | "Which campaigns send traffic that bounces?" |
| `docs-visitor-cohort` | PRO+ | "Who are my most active visitors and what are they doing?" |
| `docs-buying-blockers` | PRO+ | "Who is evaluating us and what stops them from buying?" |

</details>

<details>
<summary><b>Automation</b> — 7 skills · install once, run forever</summary>

| Skill | Plan | Ask it |
|---|---|---|
| `docs-sync` | free | "Detect and fix code↔docs drift before this push" |
| `docs-pr-check` | free | "Add a CI gate that flags code shipped without docs" |
| `docs-enable-translation` | PRO · MCP | "Translate my docs into 15 languages" |
| `docs-release-announce` | PRO · MCP | "Announce every release to Slack automatically" |
| `docs-tune-ai-chat` | PRO · MCP | "Users keep thumbs-downing the AI chat — fix the prompt" |
| `docs-stale-watcher` | PRO+ · MCP | "Turn stale-content alerts into GitHub Issues" |
| `docs-translate-webhook` | PRO+ · MCP | "Route translation to my own DeepL pipeline" |

</details>

<details>
<summary><b>Publishing</b> — 3 skills · ship it live</summary>

| Skill | Plan | Ask it |
|---|---|---|
| `docs-publish` | free | "Push my local docs folder to GitHub" |
| `docs-setup-workspace` | free · MCP | "Configure my Docsbook workspace from one command" |
| `docs-generate-agents-md` | free | "Generate an AGENTS.md so every AI agent knows about my docs" |

</details>

<details>
<summary><b>Planning</b> — 2 skills · decide before you write</summary>

| Skill | Plan | Ask it |
|---|---|---|
| `docs-strategy-plan` | free | "I have no docs and don't know where to start" |
| `docs-health-triage` | PRO | "What should we work on this week?" |

</details>

<details>
<summary><b>Growth</b> — 2 skills · aim the docs at traffic and buyers</summary>

| Skill | Plan | Ask it |
|---|---|---|
| `docs-rank-recovery` | free | "Which pages are one rewrite away from real traffic?" |
| `docs-audience-enricher` | PRO · MCP | "Figure out who actually buys my product and how they enter" |

</details>

> **Plan / MCP columns.** Most skills are free and run on any agent with no account. `MCP` marks the few that genuinely operate a hosted workspace (branding, languages, webhooks) — they fall back to printed instructions when it's absent. `PRO` / `PRO+` marks skills that read production analytics.

---

## How it works

A skill is a **reusable regulation** — Workflow + Guardrails + Acceptance Criteria — not a one-off prompt.

Each skill states a **need** ("get the list of pages in scope and read their content") and **how to reason about it**, rather than a hardcoded way to fetch it. The agent satisfies the need with whatever it has connected:

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

The agent sees what's available and picks the cheapest path.

**The catalog's contract on tool names.** A skill names the need and the acceptance criteria. A platform tool is named only where calling it *is* the goal of the step — set the branding, register a webhook, flip a workspace flag — and never where it's merely one way to fetch data. So "the questions readers asked that got no answer" stays a need: an agent with nothing connected greps the logs, and one with the MCP connected gets the same answer as a typed list. That's what makes a skill run on a bare agent and get sharper — not narrower — when a platform is attached.

### Modes — what a skill is allowed to touch

Every skill declares a `mode`, so you know before you hand it your docs whether it edits files:

| Mode | Reads your docs | Writes files | What it's for |
|---|---|---|---|
| `audit` | yes | never | Reports findings you decide what to do with |
| `refactor` | yes | edits pages that already exist | Fixes; never invents a new page |
| `authoring` | — | writes new pages | Rules loaded *before* you draft, so the page ships correct |
| `platform` | — | workspace settings, not content | Branding, languages, webhooks, domains |

CI enforces it: a skill without a valid mode does not ship.

| Concept | Analogy | Lives in |
|---|---|---|
| **Skill** | QA checklist — Workflow, Guardrails, Acceptance Criteria | this repo |
| **Subagent** | Jira ticket — specific model, tools, event trigger | [docs-subagents](https://github.com/Docsbook-io/docs-subagents) |

### Optional acceleration

| Path | What you get | Cost |
|---|---|---|
| **Nothing** (default) | `grep`/`find` over the docs folder | free, works everywhere |
| **`markdown-lsp`** (self-hosted) | semantic + graph search, runs locally — [repo](https://github.com/Docsbook-io/markdown-lsp) | free, you host it |
| **Docsbook MCP** (cloud) | the same search in the cloud, plus workspace settings | optional account |

```bash
# Optional cloud transport
mcp add --transport http https://docsbook.io/api/mcp/server
```

> The cloud transport runs `markdown-lsp` for you — self-hosted and cloud are the **same capability**, your choice of where it runs. The bare `grep`/`find` fallback always works.

---

## CLI reference

Powered by the [`skills`](https://github.com/vercel-labs/skills) CLI:

```bash
npx skills add Docsbook-io/docs-skills --skill '*'        # install the whole catalog
npx skills add Docsbook-io/docs-skills --skill docs-seo   # install one skill
npx skills add Docsbook-io/docs-skills -a claude-code -a cursor --skill '*'   # target specific agents
npx skills list                                           # list installed skills
npx skills find <keyword>                                 # search for a skill
npx skills update                                         # update installed skills
```

---

## Contributing

Skills are plain Markdown files under `skills/` — either `skills/<name>/SKILL.md` or `skills/<category>/<name>/SKILL.md`; the category comes from frontmatter, not the path. To add one:

1. Create `skills/your-skill/SKILL.md` following the schema in `schema/`
2. Run `pnpm build-index` to regenerate `index.json`
3. Open a PR

The catalog is intentionally minimal — one file per skill, no runtime dependencies.

---

## License

MIT © 2024 Dan Bondarev / [docsbook.io](https://docsbook.io)
