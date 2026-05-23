---
name: docs-setup-workspace
description: Configures a Docsbook workspace via MCP — branding, UI, AI chat, SEO, languages. Requires Docsbook MCP connected (mcp add --transport http https://docsbook.io/api/mcp/server). Run after /docs-publish. If MCP is unavailable, prints setup instructions.
metadata:
  version: 1.0.0
---

# docs-setup-workspace

Configures a Docsbook workspace using the Docsbook MCP server. Applies branding, UI settings, navigation, AI, SEO, and language options.

## Arguments

- `$ARGUMENTS[0]` — `owner/repo` or Docsbook workspace ID (required)

## Check MCP Availability

Try calling `mcp__docsbook__list_workspaces`. If it fails or is unavailable, print:

```
Docsbook MCP not connected. To set it up:
  mcp add --transport http https://docsbook.io/api/mcp/server
Then re-run /docs-setup-workspace.
```

Exit gracefully without error.

## Step 1 — Create or Find Workspace

- Call `mcp__docsbook__list_workspaces` to check if the workspace already exists.
- If not found: call `mcp__docsbook__create_workspace({ github_owner, github_repo })`.
- Store the workspace ID for subsequent calls.

## Step 2 — Read Branding from _branding.json

If `_branding.json` exists in the docs-output folder, parse:

- `accentColor`
- `background`
- `foreground`
- `favicon`
- `hasThemeToggle`
- `detectedScheme` (`"light"` or `"dark"`)

If the file does not exist, use sensible defaults.

## Step 3 — Apply Branding

Call `mcp__docsbook__update_branding` with:

- `accentColor` — from `_branding.json` or default `#6366f1`
- `accentColorDark` — slightly adjusted or same as `accentColor`
- `iconUrl` — favicon URL from branding
- `defaultTheme` — `"system"` if `hasThemeToggle` is true, otherwise `detectedScheme`

## Step 4 — UI Settings

Call `mcp__docsbook__update_ui_settings` with:

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

## Step 5 — Navigation

Call `mcp__docsbook__update_navigation`. If the source URL is known, add a "Website" header link:

```json
{
  "headerLinks": [{ "label": "Website", "url": "{source_url}" }]
}
```

## Step 6 — AI, SEO, and Languages

Attempt the following calls. These may fail on the Free plan — catch errors silently and mention the upgrade path.

- `mcp__docsbook__update_ai_settings` — `{ aiEnabled: true, showAskAiButton: true }`
- `mcp__docsbook__update_seo` — `{ seoEnabled: true }`
- `mcp__docsbook__update_languages` — `{ enabledLanguages: ["en", "zh", "ja", "ru"] }`

If any call fails with a plan restriction error, append to output:

```
⚠️  AI / SEO / Languages require PRO plan. Upgrade at https://docsbook.io
```

## Output

```
✅ Workspace configured!
📚 Docsbook: https://docsbook.io/{owner}/{repo}

Settings applied:
- Branding: accent #{color}, theme: {scheme}
- AI chat: ✅ enabled
- SEO: ✅ enabled
- Languages: en, zh, ja, ru
```
