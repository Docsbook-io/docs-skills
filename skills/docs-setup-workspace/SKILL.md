---
name: docs-setup-workspace
description: Configure a fresh Docsbook workspace from one command. Wires branding, UI toggles, AI chat, SEO, languages and custom domain via Docsbook MCP — the natural follow-up to /docs-publish. Falls back to printed setup instructions if MCP isn't connected.
metadata:
  version: 2.0.0
  category: publishing
  requires_docsbook_mcp: true
  requires_plan: free
  uses_mcp_tools:
    - list_workspaces
    - get_workspace
    - create_workspace
    - update_branding
    - update_ui_settings
    - update_navigation
    - update_seo
    - update_languages
    - update_ai_settings
    - update_domain
  keywords: [setup, workspace, branding, configure, docsbook, mcp]
---

# docs-setup-workspace

Knowledge for configuring a Docsbook workspace via MCP. The actual work is done by the **`docs-workspace-configurator`** subagent (Sonnet, pinned model) shipped in the [docs-create Claude Code plugin](https://github.com/Docsbook-io/docs-claude-plugins) and the [docs-subagents npm package](https://github.com/Docsbook-io/docs-subagents). This skill is the reference notes you read *before* running it.

## What this is for

You pushed docs to GitHub via [docs-publish](../docs-publish/SKILL.md). The Docsbook workspace exists (or needs to be created) at `https://docsbook.io/<owner>/<repo>`. You want branding, UI, AI, SEO, and languages configured from one command — no clicking through the dashboard.

The configurator runs on **Sonnet** (not Haiku) because the MCP calls are stateful: each settings update reads/writes typed JSON against a real workspace, and errors are plan-gated (Free vs PRO vs PRO+). Haiku is too lossy for the retries and error classification.

## Tips & tricks

- **Probe MCP before touching anything.** First call `list_workspaces` — it's the cheapest method and confirms transport is up. If it fails for non-auth reasons, exit with `mcp add --transport http https://docsbook.io/api/mcp/server` instructions instead of trying every other tool.
- **`list_workspaces` first, then `create_workspace`.** Don't blindly create — if Docsbook already auto-indexed the repo (it does this within seconds of `docs-publish`), the workspace exists and double-creating wastes a round trip.
- **Plan-gated calls are normal.** `update_ai_settings`, `update_seo`, `update_languages` fail on Free with a plan error. Catch each one individually, record it in `planGated`, and keep going — never abort the whole run on a 402.
- **`_branding.json` may be missing.** When the repo wasn't built by [docs-from-site](../docs-from-site/SKILL.md) (e.g. hand-written docs), no branding file exists. Use sensible defaults: `accentColor: "#6366f1"`, `detectedScheme: "light"`, `hasThemeToggle: true`.
- **`defaultTheme` follows the toggle.** If the source site had a theme toggle, set `defaultTheme: "system"` (let the browser decide). Otherwise pin to the `detectedScheme` — locking the theme makes the docs match the marketing brand.
- **Navigation > AI/SEO.** Always set `update_navigation` (it's Free-tier and adds a "Website" link back to the source — high-value link). AI/SEO are nice-to-have on Free.
- **MCP transport is HTTP, not stdio.** This MCP is hosted: `https://docsbook.io/api/mcp/server`. Different from `markdown-lsp` (local stdio). Don't confuse the two.

## Fast UI settings preset

This block is what every workspace gets on first setup:

```json
{
  "showScrollToTop": true,
  "showPageFeedback": true,
  "showBreadcrumbs": true,
  "showPrevNextButtons": true,
  "showCopyPageButton": true,
  "showHeader": true,
  "showSearchButton": true,
  "showDeepSearch": true,
  "showReferences": true,
  "showAskAiHeader": true,
  "backgroundGlow": true,
  "themeToggle": "<hasThemeToggle from branding>",
  "languageSidebarToggle": true
}
```

## Output contract

The configurator returns:

```json
{
  "status": "ok",
  "workspaceId": "ws_...",
  "docsbookUrl": "https://docsbook.io/owner/repo",
  "applied": ["branding", "ui", "navigation"],
  "planGated": ["ai", "seo", "languages"],
  "warnings": []
}
```

`applied` = sections that succeeded. `planGated` = sections that failed because of plan limits (upgrade hint). `warnings` = anything else worth knowing (missing `_branding.json`, navigation skipped because no source URL, etc).

## Error modes worth knowing

| Failure | What the agent returns | Recovery |
|---|---|---|
| MCP not connected | `{"status":"mcp_unavailable","instructions":[...]}` | Run `mcp add --transport http https://docsbook.io/api/mcp/server` |
| Workspace not yet indexed | `{"status":"error","reason":"workspace_not_found","retryAfterSeconds":60}` | Wait a minute, then retry — Docsbook is still pulling the repo |
| Plan limit on AI/SEO/i18n | success result with the section in `planGated` | Upgrade plan or ignore — branding/UI/navigation still applied |

## How to run

**Plugin (recommended):**

```
/docs-setup-workspace alice/example-docs
```

**Standalone subagent:**

```
"Use the docs-workspace-configurator subagent to set up alice/example-docs with docs-output/example"
```

Plug-and-play with [docs-create](../docs-create/SKILL.md) if you want crawl → publish → configure in one command.
