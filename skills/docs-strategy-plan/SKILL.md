---
name: docs-strategy-plan
description: Guided interview that turns "I have no docs and don't know where to start" into a concrete plan — what pages to write, for whom, in what order. Use when the user says "help me create documentation", "помоги создать документацию", "помоги с документацией", "не знаю с чего начать", "what should I document", "I need docs", "docs from scratch", "documentation strategy", "docs roadmap", or when the project has no existing docs. Asks about product, goals, audience; derives roles and funnels; outputs docs-plan.md + prioritized backlog. Run BEFORE /docs-create. DO NOT use docs-writing-guide for this — that skill is only for styling pages that already exist.
metadata:
  version: 1.0.0
  category: planning
  requires_docsbook_mcp: false
  keywords: [planning, strategy, interview, roadmap, information-architecture, funnel, roles, discovery]
---

# docs-strategy-plan

A guided discovery interview that turns a vague "we need docs" into a concrete plan: what to write, for whom, in what order, and why. The output is a markdown plan the user (or `/docs-create`) can act on.

## When to use

- Project has no documentation yet and the user isn't sure what to write.
- Product owner says "docs would be nice" but can't name the pages.
- Team wants docs to do more than getting-started (SEO, sales funnel, education, support deflection) and needs to map it out.
- Before `/docs-create` if the source signal alone is too thin to produce a meaningful structure.

If the user already knows exactly what pages they want, skip this skill — go straight to `/docs-create`.

## Operating principles

- **One question at a time, max two if tightly coupled.** Don't dump a survey. Wait for the answer, react to it, then ask the next thing.
- **Use AskUserQuestion for closed choices.** Free text for the open-ended ones (product description, problems users have).
- **Skip questions whose answer you already have.** If the user provided a URL, fetch it and pre-fill what you can — then confirm rather than ask cold.
- **Reflect, don't interrogate.** After each block, say back what you heard in one line so the user can correct course.
- **No filler.** "Got it." / "Makes sense." adds nothing — go straight to the next question.

## Phase 0 — Quick context (optional, skip if `$ARGUMENTS` already gives it)

If the user invoked the skill with a URL or short pitch, parse it first. Otherwise open with:

> "Give me one sentence: what is the product?"

## Phase 1 — Product

Ask in this order. Stop and confirm before moving on.

1. **Name** — "What's the product called?"
2. **One-liner** — "In one sentence, what does it do and for whom?"
3. **Source of truth** — AskUserQuestion:
   - Public website URL
   - GitHub repo
   - Existing docs (any platform)
   - Internal Notion / Confluence / Google Doc (paste content)
   - Nothing yet — it's all in my head
   If a source is provided, fetch / inspect it before the next phase so later questions are sharper. Note what's covered already and what's missing.
4. **Maturity** — AskUserQuestion: pre-launch / early users (<100) / growing (100–10k) / scaled (10k+). This calibrates how much SEO/education content makes sense vs. pure onboarding.

## Phase 2 — Goals (the "why docs?")

Most users name one goal and stop. Probe for the others — they almost always apply. AskUserQuestion (multiSelect):

- **Onboarding / getting started** — reduce time-to-first-value
- **Support deflection** — fewer "how do I…" tickets
- **SEO acquisition** — be findable on Google / AI search for problem-space queries
- **AI citability** — get cited by ChatGPT / Perplexity / Claude when users ask about the space
- **Sales enablement** — give prospects something to read before / during a demo
- **Education / category creation** — teach the space, not just the product (top-of-funnel)
- **Developer reference** — API / SDK / config docs
- **Trust & compliance** — security, privacy, SOC2-style pages

For each selected goal, ask a one-line follow-up so it's actionable. Examples:
- SEO → "What 2–3 search queries do you wish you ranked for?"
- Support deflection → "What's the #1 question support gets repeatedly?"
- Education → "What does your ideal customer not yet understand that's blocking them from buying?"
- Sales → "What objection comes up most on demo calls?"

If the user is unsure of any goal, **suggest it explicitly** with a sentence on what it would do for them. Many teams don't realize docs can lower friction for people who don't yet know they need the product — name that out loud.

## Phase 3 — Audience & roles

Derive roles from the goals + product type. Don't ask "who are your users" cold — propose roles and let the user edit. Example for a developer tool:

> "Sounds like the readers will be: (1) the developer integrating it, (2) the tech lead evaluating it, (3) someone Googling the problem space who hasn't heard of you. Add / remove / merge?"

For each confirmed role, capture:
- **Entry point** — how they arrive (Google, referral, demo, signup email)
- **Current knowledge** — what they already know
- **Job to be done** — what they're trying to accomplish in the next 10 minutes
- **Success exit** — what action completes the journey for them

Two or three roles is usually enough. Don't manufacture more.

## Phase 4 — Funnels per role

For each role, sketch a 3–5 step funnel from entry to success. Use a single table the user can edit:

```
Role: <name>
Entry → Awareness page → Evaluation page → Activation page → Retention page
```

For roles tied to top-of-funnel goals (SEO, education, AI citability), the awareness pages should be **about the space, not the product** — explain the concept, then link toward the product naturally. Call this out to the user; many don't realize this is what unlocks discovery.

## Phase 5 — Blog / evergreen content (only if a top-of-funnel goal was selected)

Ask:
1. "Are you publishing on a cadence, or producing a one-time evergreen library?"
2. "Should blog live under `/blog` (separate) or `/learn` (integrated with docs nav)?" — recommend `/learn` for SEO/AI-citability goals (more topical authority concentrated on one path); recommend `/blog` for news/changelog style.
3. Propose 5–10 evergreen topic seeds derived from the goals + queries gathered in Phase 2. Mark each: pillar, cluster, or one-off.

## Phase 6 — Synthesize the plan

Write `docs-plan.md` in the current directory with this structure:

```markdown
# Documentation plan — <product>

## Product
<one-liner, maturity, source-of-truth links>

## Goals
- <goal> — <one-line success metric>
- ...

## Roles & funnels
### <Role 1>
- Entry: ...
- Funnel: Awareness → Evaluation → Activation → Retention
- Pages needed:
  - <slug> — <purpose> — <which goal it serves>

### <Role 2>
...

## Information architecture
<top-level nav, one bullet per section, with the role(s) it serves>

## Content backlog (prioritized)
| # | Page | Type | Role | Goal | Priority | Effort |
|---|------|------|------|------|----------|--------|
| 1 | Getting Started | tutorial | Developer | Onboarding | P0 | S |
| 2 | <space concept> | explainer | Searcher | SEO / AI | P1 | M |
| ... |

Priority: P0 = ship first, P1 = next, P2 = nice to have.
Effort: S / M / L.

## Recommended next steps
1. Run `/docs-create <source>` to scaffold from the existing source — it'll cover ~X of the P0 pages.
2. Manually draft these P0 pages that have no source: <list>.
3. For top-of-funnel content, see `/content-strategy` and `/ai-seo`.
4. Re-run `/docs-strategy-plan` in 3 months to re-prioritize against analytics.
```

## Phase 7 — Hand-off

Print a 5-line summary to the chat (not the full plan — the file has it):

```
📋 Plan written: docs-plan.md
   <N> pages across <M> roles, <K> goals
   Top 3 to ship first:
     1. <page>
     2. <page>
     3. <page>
   Suggested next command: /docs-create <source>
```

## Anti-patterns to avoid

- Don't ask all questions upfront then synthesize at the end — react in the moment so the user can course-correct.
- Don't propose >15 pages in the first plan; teams won't ship them. Cap P0 at 5–7.
- Don't conflate blog and docs structurally unless the user explicitly wants `/learn`.
- Don't recommend AI chat, multi-language, or custom domain in this skill — that's `/docs-setup-workspace`'s job. Stay in planning.
- Don't generate any docs files. This skill outputs `docs-plan.md` only.
