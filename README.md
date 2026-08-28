<div align="center">

# docs-skills

**4 skills that teach your AI agent to run your documentation like a growth channel.**

Install once. Then just ask, in plain language.

[![npm version](https://badge.fury.io/js/docs-skills.svg)](https://www.npmjs.com/package/docs-skills)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)

[Install](#install-30-seconds) • [Find your pain](#find-your-pain) • [The four skills](#the-four-skills) • [How it works](#how-it-works) • [CLI](#cli-reference)

</div>

```bash
npx skills add Docsbook-io/docs-skills --skill '*'
```

---

## The four skills

Documentation work is four jobs, and every request lands in one of them.

| | Skill | The question it answers |
|---|---|---|
| ✍️ | **`docs-create`** | The docs do not exist yet. Make them — from a site, a repo, another platform, or an idea. |
| 🔍 | **`docs-analyze`** | Something is wrong. Find it from real numbers, say what it costs in plain language, and fix it — including the gap no number shows: the audiences and use cases the docs never address. |
| 📐 | **`docs-manage`** | What should this page say, and what should the site around it do? |
| ⚙️ | **`docs-automate`** | Make it keep happening without anyone remembering. |

They hand off to each other rather than overlapping: `docs-analyze` finds a gap and hands it to `docs-create`; `docs-create` writes to `docs-manage`'s rules; `docs-manage` executes what `docs-analyze` diagnosed; `docs-automate` makes any of it recur.

---

## Find your pain

Scan the left column. Find yours. Ask in your own words — the skill picks itself up.

### 😫 "My docs are a mess and I don't know where to start"

| Your pain | Ask | What you get back |
|---|---|---|
| I don't know what's broken | *"Audit my docs and give me one prioritized report"* | One ranked queue: content type, structure, style, audience, links, SEO, a11y, i18n, media, freshness — deduplicated, worst first |
| Nobody finds us on Google | *"Why isn't this section getting organic traffic?"* | An audit judged against the queries you actually rank for — not guessed from the page text |
| We get impressions, not clicks | *"Which pages are one rewrite away from real traffic?"* | Pages stuck at position 5–20, ranked by impressions × distance to close — the cheapest traffic a docs site can buy |
| ChatGPT and Perplexity never cite us | *"Rewrite this so assistants can cite it"* | Passage-level patterns that survived controlled studies — and the popular tactic that measurably backfires |
| Readers bounce, and I don't know where | *"Which pages are losing people?"* | Ranked give-up pages with the actual reader journeys behind them |
| Broken links, orphan pages | *"Which pages have nothing linking to them?"* | A full doc-graph walk: dead ends, orphans, "click here" anchors |
| Our docs quietly lie about prices | *"Do our docs still match our pricing page?"* | Every price, plan and quota compared against the live page, both sides quoted |
| We describe other people's products | *"Is anything we say about our integrations still true?"* | Third-party claims checked against their sources, with "unverifiable" kept separate from "wrong" |

### 🚀 "I have no docs — or the wrong ones"

| Your pain | Ask | What you get back |
|---|---|---|
| I have a repo/URL and no docs | *"Turn this repo into a live docs site"* | Product audit → structure → pages → preview → publish → configure |
| Only a marketing site exists | *"Make docs from this URL"* | Rendered, read, and rebuilt as a foldered conversion-grade site — never a scraped dump |
| Trapped in GitBook/Mintlify | *"Migrate our docs off Mintlify"* | Clean portable Markdown, structure and slugs intact, nothing lost |
| Only a product name exists | *"Imagine docs for my product"* | A full invented site — pages and structure invented, facts never |
| I want to approve each step | *"Build it, but pause before publishing"* | Six checkpoints you control before anything ships |
| I don't know who actually buys | *"Who are our buyers and how do they enter?"* | Segments, entry paths, competitors, monetization model — before a single page is written |

### 📊 "I'm guessing what to write next"

| Your pain | Ask | What you get back |
|---|---|---|
| What do we fix this week? | *"What should we work on this week?"* | Five items, each with why-now, effort, the number expected to move, and who does it |
| Which page do I write next? | *"What are readers searching for and not finding?"* | Failed searches and unanswered questions, clustered against the doc graph |
| Search found it, nobody clicked | *"Our search returns results and nobody opens them"* | Rewritten titles and first lines, verbatim and paste-ready — no page rewrites |
| Do our docs sell or just support? | *"Who is evaluating us and what stops them?"* | Conversations split by buying stage: who is deciding, what blocks them, which competitors they name |
| Did that rewrite actually work? | *"Did our restructure help?"* | Edited pages compared against untouched ones, site trend subtracted, four honest verdicts |
| What are competitors covering? | *"What are we missing that X documents?"* | The small subset of their coverage that would actually earn you something — not a sitemap diff |

### 🔁 "I keep doing the same maintenance by hand"

| Your pain | Ask | What you get back |
|---|---|---|
| Docs drift behind the code | *"Stop my docs drifting out of sync"* | A pre-push or CI drift guard that finds the pages your diff invalidated |
| PRs merge with stale docs | *"Add a CI gate for documentation"* | A pull-request check: code-vs-docs, frontmatter, internal links |
| Stale pages nobody notices | *"File an issue when a page goes stale"* | Age-based events routed into normal triage |
| Rankings slip and we find out late | *"Alert us when a section starts losing position"* | A monitor with a real threshold, a volume floor, and a stated blind spot |
| The assistant keeps failing on a topic | *"Our chat gets thumbs-down — fix it"* | Failures clustered, retrieval problems separated from content gaps, a prompt change you approve |
| We're launching a new market | *"Translate our docs and keep them current"* | Languages enabled, parity watched, staleness surfaced |

### 📐 "I know what to write — tell me how"

| Your pain | Ask | What you get back |
|---|---|---|
| Every new page needs the same fixes | *"Load the rules before I write this"* | The rulebook: page type, structure, retrieval, style, audience, next step, links |
| Docs inform but never sell | *"Make our docs sell, not just inform"* | Monetization model detected → pricing page, action ladder, no dead ends |
| Pages are walls of links | *"This page is a wall of links"* | Rich blocks from invisible markers — the live catalog decides which; source stays plain markdown |
| Docs look nothing like my product | *"Pull brand colors from our site"* | Contrast-checked light and dark palettes derived from real signals, never invented |
| Workspace config is 20 clicks | *"Configure the site"* | Identity, navigation, affordances, discovery, assistant, languages, domain — by purpose, verified on the rendered page |

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
> "Which pages are readers searching for but not finding?"
> "Stop our docs drifting out of sync with the code"

---

## Before / after

| Without docs-skills | With docs-skills |
|---|---|
| Agent hallucinates doc structure | Agent works from your real docs — files, sitemap, or doc graph |
| Audits start by reading pages and end in opinions | Audits start from real numbers and end in a ranked queue |
| "Improve the title" | The proposed title, description and first line, verbatim |
| Fixes ship and nobody checks | Every fix records a baseline; the next run judges it |
| One-off prompts, rewritten per project | Four reusable regulations that work everywhere |
| "Looks good to me" | Every skill ships a pass/fail acceptance checklist |

---

## Full catalog

**4 skills**, 4 categories. Browse live: [docsbook.io/skills](https://docsbook.io/skills).

| Skill | Category | Covers |
|---|---|---|
| `docs-create` | creation | Source detection · site / code / migration / idea routes · product audit (buyers, entry paths, competitors, monetization) · structure and page-set design · preview, publish, configure |
| `docs-analyze` | analysis | Search and answer-engine signals · reader behaviour, dead ends, funnels, cohorts, buying stage · content detectors (type, structure, style, audience, links, a11y, media, freshness, translations) · external checks (pricing, third-party claims, competitor coverage) · demand-side opportunity audit (capability → job → audience → workflow → outcome, 15-dimension coverage matrix, named content gaps) · business translation · prior-fix impact · apply via PR / chat approval / direct |
| `docs-manage` | management | Writing rules · retrieval and citation · conversion and the action ladder · rendered blocks, images, diagrams · site configuration by capability · finding → fix playbooks |
| `docs-automate` | automation | Setup interview · code/site/third-party/freshness drift · events and handlers · CI checks and hooks · monitors, thresholds and alerts · tuning loops |

Each skill's detail lives in `skills/<name>/references/`, loaded on demand rather than up front.

> **Plans and connections.** Every skill runs on a bare agent with nothing connected. Connect a workspace and the same skills get *sharper*, not different: real search positions, real reader behaviour, applied configuration. Where a capability is gated behind a plan, the skill says once what it would add and continues at the tier you have — it never fabricates the number it could not read.

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

**The catalog's contract on tool names.** A skill names the need and the acceptance criteria. A platform tool is named only where calling it *is* the goal of the step — set the branding, register a webhook, flip a workspace flag — and never where it's merely one way to fetch data. So "the questions readers asked that got no answer" stays a need: an agent with nothing connected greps the logs, and one with a workspace connected gets the same answer as a typed list. That's what makes a skill run on a bare agent and get sharper — not narrower — when a platform is attached.

### Modes — what a skill is allowed to touch

Every skill declares a `mode`, so you know before you hand it your docs whether it edits files:

| Mode | Reads your docs | Writes files | What it's for |
|---|---|---|---|
| `audit` | yes | never | Reports findings you decide what to do with |
| `refactor` | yes | edits pages that already exist | Fixes; never invents a new page |
| `authoring` | — | writes new pages | Rules loaded *before* you draft, so the page ships correct |
| `platform` | — | workspace settings, not content | Branding, languages, webhooks, domains |
| `orchestrator` | depends on the phase | only past an explicit gate | A top-level skill whose phases each declare one of the four above |

The first four are mutually exclusive on purpose: a skill that both audits and rewrites can be trusted at neither. An orchestrator is the one composite — it runs phases that each carry a single mode, and it may cross from audit into refactor only through a gate the user answers. Every one of the four skills declares its phase table at the top of its `SKILL.md`.

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
| **Docsbook MCP** (cloud) | the same search in the cloud, plus workspace settings and live reader signals | optional account |

```bash
# Optional cloud transport
mcp add --transport http https://docsbook.io/api/mcp/server
```

> The cloud transport runs `markdown-lsp` for you — self-hosted and cloud are the **same capability**, your choice of where it runs. The bare `grep`/`find` fallback always works.

---

## CLI reference

Powered by the [`skills`](https://github.com/vercel-labs/skills) CLI:

```bash
npx skills add Docsbook-io/docs-skills --skill '*'           # install the whole catalog
npx skills add Docsbook-io/docs-skills --skill docs-analyze  # install one skill
npx skills add Docsbook-io/docs-skills -a claude-code -a cursor --skill '*'   # target specific agents
npx skills list                                              # list installed skills
npx skills find <keyword>                                    # search for a skill
npx skills update                                            # update installed skills
```

---

## Contributing

Skills are plain Markdown under `skills/<name>/SKILL.md`, with their detail in `skills/<name>/references/*.md`. The category comes from frontmatter, not the path.

The catalog is deliberately four skills wide. **A new capability belongs inside one of them**, as a reference file and a row in that skill's routing table — not as a fifth top-level skill. The four map to the four jobs documentation work actually splits into, and a fifth entry point makes an agent choose before it has understood the request.

To contribute:

1. Add or extend a reference under `skills/<skill>/references/`, and link it from that skill's `SKILL.md`.
2. Run `pnpm build-index` to regenerate `index.json`.
3. Run `node scripts/check-catalog.js` — it enforces the tool-name contract, the mode declaration, the metric dictionary, the frontmatter schema, and the counters in this file.
4. Open a PR.

---

## License

MIT © 2024 Dan Bondarev / [docsbook.io](https://docsbook.io)
