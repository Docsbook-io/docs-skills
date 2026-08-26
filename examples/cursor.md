# Using docs-skills with Cursor

## 1. Install

```bash
npx skills add Docsbook-io/docs-skills -a cursor --skill '*'
```

This writes the skill definitions into `.cursor/rules/`.

## 2. Optional: connect a workspace

In Cursor settings → MCP, add:

```
Transport: HTTP
URL: https://docsbook.io/api/mcp/server
```

This adds real search positions, reader behaviour and applied site configuration. The skills work
without it.

## 3. Use in chat

Describe the job — the right skill picks itself up:

```
Audit the docs in this repo and tell me what to fix first
```

```
Migrate our GitBook docs into clean markdown
```

```
Rewrite this page so assistants can cite it
```

```
Add a CI check that flags code shipped without docs
```

Or name a skill directly:

```
@docs-create turn this repo into a docs site
@docs-analyze why is our /guides section losing traffic?
@docs-manage make our docs sell, not just inform
@docs-automate alert us when a page goes stale
```

## Tips

- **Four skills, four jobs.** Create what does not exist, analyze what does, manage what it says and
  what the site does, automate what should recur. If a request spans two, they hand off in that order.
- **The detail loads on demand.** Each skill's `SKILL.md` is short; its reference files are pulled in
  only when the run actually needs them.
- **Nothing connected still works.** Plain file reads and `grep`/`find` are a supported path, not a
  degraded one — the skills only ever say what the data supports, and label a guess as a guess.
- **`docs-analyze` asks before it writes.** It will ask whether to open a pull request, show you each
  diff, or write directly. Nothing lands until you answer.
