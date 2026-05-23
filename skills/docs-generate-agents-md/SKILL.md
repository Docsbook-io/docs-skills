---
name: docs-generate-agents-md
description: Generates an AGENTS.md system prompt at the repo root from the user's Docsbook workspace settings. Reads workspace config and doc graph via Docsbook MCP, renders a Handlebars template, and writes AGENTS.md so future agent sessions have stable context about the docs site, languages, AI chat, and available @docs-skills commands.
metadata:
  version: 1.0.0
  category: publishing
  requires_docsbook_mcp: true
  requires_plan: free
  uses_mcp_tools:
    - get_workspace
    - get_doc_graph
  produces_files:
    - AGENTS.md
  keywords: [agents.md, system prompt, onboarding, agent context, docsbook, mcp, setup]
---

# docs-generate-agents-md

Creates `/AGENTS.md` at the root of the user's repository based on their Docsbook workspace. The file becomes a static system prompt that any coding agent (Claude Code, Cursor, Codex, Copilot, Gemini CLI) reads at session start — so the agent always knows the docs URL, where docs live, language settings, AI chat conventions, and which `@docs-skills` automations are available.

## Arguments

- `$ARGUMENTS[0]` — `owner/repo` or Docsbook workspace ID (required)

## Check MCP Availability

Try calling `mcp__docsbook__list_workspaces`. If it fails or is unavailable, print:

```
Docsbook MCP not connected. To set it up:
  mcp add --transport http https://docsbook.io/api/mcp/server
Then re-run /docs-generate-agents-md.
```

Exit gracefully without error.

## Step 1 — Read Workspace Settings

Call `mcp__docsbook__get_workspace({ id })` (or `{ github_owner, github_repo }`). Extract:

- `name`, `github_owner`, `github_repo`
- `domain` (custom domain, if set) — otherwise compose `https://docsbook.io/{owner}/{repo}`
- `docsPath` — usually `/docs` or `README.md`
- `enabledLanguages` (e.g. `["en", "ru", "es"]`)
- `aiEnabled`, `aiSystemPrompt` (may be empty)
- `plan` (free / pro / pro_plus)

If the workspace does not exist, stop and tell the user to run `/docs-setup-workspace` first.

## Step 2 — Read Doc Graph

Call `mcp__docsbook__get_doc_graph({ workspace_id, format: "toon" })`. Extract:

- Top-level folders (becomes the docs structure summary)
- Total page count
- Whether translated mirrors exist (folders like `/ru`, `/es`)

If the call fails (plan restriction, stale graph), continue with empty structure — the template handles missing data.

## Step 3 — Render Template

Read `assets/AGENTS.md.hbs` from this skill's folder. Render it with the following variables:

```ts
{
  site_url: workspace.domain || `https://docsbook.io/${owner}/${repo}`,
  owner,
  repo,
  docs_path: workspace.docsPath || "/docs",
  has_readme: doc_graph.has("README.md"),
  languages: workspace.enabledLanguages || ["en"],
  is_multilingual: (workspace.enabledLanguages?.length ?? 1) > 1,
  ai_enabled: workspace.aiEnabled === true,
  ai_citation_style: "H2",
  top_folders: doc_graph.top_folders || [],
  total_pages: doc_graph.total_pages || 0,
  plan: workspace.plan || "free",
}
```

Use a minimal Handlebars implementation (the agent can substitute `{{var}}` and `{{#if}}` blocks manually if no Handlebars runtime is available).

## Step 4 — Write AGENTS.md

Use the `Write` tool to create `/AGENTS.md` at the repo root.

If `AGENTS.md` already exists:
- Look for a managed section between markers `<!-- docsbook:agents-md:start -->` and `<!-- docsbook:agents-md:end -->`.
- If present, replace only that section.
- If absent, append the rendered content under those markers at the end of the existing file.

Never silently overwrite content outside the markers.

## Output

```
✅ AGENTS.md generated
📄 Path: ./AGENTS.md
📚 Docsbook: {site_url}
🌐 Languages: {languages.join(", ")}
🤖 AI chat: {ai_enabled ? "enabled" : "disabled"}

Next: commit AGENTS.md so every agent session picks it up.
```
