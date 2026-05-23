# Using docs-skills with Cursor

## 1. Install

```bash
npm install -g docs-skills
cd your-project
docs-skills install
```

This creates `.cursor/rules/docs-skills.mdc` with all skill definitions.

## 2. Add Docsbook MCP

In Cursor settings → MCP, add:

```
Transport: HTTP
URL: https://docsbook.io/api/mcp/server
```

## 3. Use in chat

In Cursor chat, mention the skill by name:

```
@docs-analyze analyze the docs for github.com/vercel/next.js
```

```
@docs-seo check SEO for my docs at github.com/myorg/myrepo
```

```
@docs-accessibility run an accessibility audit on docs/
```

## Tips

- Use `@docs-analyze` for a full audit (runs all 10 sub-skills in parallel)
- Use individual skills (`@docs-seo`, `@docs-maintenance`) for focused reviews
- Skills work on any public GitHub repo — no local clone needed
- For private repos: clone locally and point to the `docs/` folder path
