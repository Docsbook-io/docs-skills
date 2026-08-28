# docs-skills — four documentation skills

This project ships **four** AI agent skills. Documentation work splits into four jobs, and every
request lands in one of them.

## Available skills

| Skill | Trigger | What it does |
|---|---|---|
| `docs-create` | "create docs", "from this repo", "from this URL", "migrate off Mintlify", "imagine docs", "we have no docs" | Documentation that does not exist yet. Audits the product and the source, decides the structure, writes the pages, previews, publishes, configures. |
| `docs-analyze` | "audit our docs", "why did traffic drop", "why do readers leave", "what should we fix first", "SEO check", "nobody clicks", "who else could use this", "which use cases are we missing" | Starts from real numbers — search positions, answer-engine signals, reader behaviour, funnels — locates the problem, says what it costs in business terms, checks whether a fix like it ever worked, and applies it through the route you choose. Also runs the demand-side pass: which jobs and audiences the product serves that the docs address nowhere. |
| `docs-manage` | "rewrite this page", "check our style", "make the docs sell", "configure the site", "set up branding", "enable search" | The rulebook. What a page says (type, structure, style, audience, retrieval, conversion, presentation) and what the site around it does (identity, navigation, affordances, discovery, assistant, languages, domain). |
| `docs-automate` | "automate", "monitor", "alert us when", "add a CI check", "keep docs in sync", "wire a webhook" | Anything that should keep happening on its own. Always starts by asking what you actually want watched and offering options. |

Detail lives in `skills/<name>/references/*.md` and is loaded on demand rather than up front.

## How they hand off

- `docs-analyze` finds a gap → `docs-create` writes the page.
- `docs-create` writes → to `docs-manage`'s rules.
- `docs-analyze` diagnoses → `docs-manage` executes the change.
- Any of them recurring → `docs-automate` makes it happen on its own.

Never run two of them on the same job. The boundaries exist so each can be trusted at what it does:
an audit that quietly edits, or a writer that quietly audits, is trustworthy at neither.

## How to use

When the user asks about documentation:

1. Work out which of the four jobs the request is. If it spans two, run them in order and say so.
2. Read that skill's `SKILL.md`, then only the reference files its routing table points at.
3. Use whatever is connected to satisfy the data needs — plain file reads, `markdown-lsp`, or a
   connected workspace. Every skill works with nothing connected and gets sharper with more.

## Optional acceleration

```
mcp add --transport http https://docsbook.io/api/mcp/server
```

Full skill definitions are in `skills/*/SKILL.md`.
