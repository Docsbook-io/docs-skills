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

# docs-setup-workspace — Configure a Docsbook workspace via MCP

The actual work is done by the **`docs-workspace-configurator`** subagent (Sonnet, pinned model).

## Workflow

1. Call `list_workspaces` first to confirm MCP transport is up. If it fails for non-auth reasons, print the MCP connection command and exit gracefully.
2. Check whether the workspace already exists before calling `create_workspace` — Docsbook auto-indexes repos within seconds of a push.
3. Read branding values from `_branding.json` if present. Fall back to sensible defaults when the file is missing.
4. Apply settings in priority order: navigation (Free-tier, always) → branding → UI → AI/SEO/languages (plan-gated).
5. When applying SEO (plan-gated): enable the SEO/GEO/AEO flags themselves, not just titles/descriptions — the audit-and-write tool for this workspace's platform typically takes an "enabled" toggle alongside content fields. If the underlying tool only writes content and has no enable toggle, tell the user those need enabling manually in workspace settings. Never assume the flag is already on.
6. When applying AI chat (plan-gated): derive 3 custom/suggested questions from the actual pages just created (e.g. from H1s or the quick-start/pricing/setup pages) — never invent generic ones like "What is this product?" — and pass them alongside the rest of the AI chat config. Skip silently if the underlying tool has no field for this.
7. Catch each plan-gated failure individually; record it in the result but do not abort the rest of the run.
8. Report which sections were applied, which were plan-gated, and any warnings.

## Guardrails

- Never abort the whole run on a plan-limit (402) error — branding, UI, and navigation still apply on Free.
- Set `defaultTheme` to `"system"` if the source had a theme toggle; otherwise pin to the detected scheme.
- Always set navigation (back-link to source URL) even on Free — it is high-value and always available.
- MCP transport is HTTP (hosted), not stdio — do not confuse it with local MCP servers.
- If workspace is not yet indexed after `create_workspace`, retry once after a short wait before reporting failure.

## MCP Tools

| Tool | Purpose |
|------|---------|
| `list_workspaces` | Verify MCP transport and check for existing workspace |
| `get_workspace` | Read current workspace settings |
| `create_workspace` | Create workspace if it does not exist |
| `update_branding` | Apply accent color, background, favicon, theme |
| `update_ui_settings` | Apply standard UI toggles (breadcrumbs, feedback, search, etc.) |
| `update_navigation` | Add back-link to source website |
| `update_seo` | Configure SEO settings AND enable the SEO/GEO/AEO flags (PRO+) |
| `update_languages` | Enable multilingual support (PRO+) |
| `update_ai_settings` | Configure AI chat, including 3 derived custom/suggested questions (PRO+) |
| `update_domain` | Set custom domain (PRO+) |

## Acceptance Criteria

- [ ] MCP transport verified before any workspace mutation
- [ ] Existing workspace detected rather than double-created
- [ ] Branding applied (from file or sensible defaults)
- [ ] UI settings applied with standard preset
- [ ] Navigation section applied on every run regardless of plan
- [ ] SEO/GEO/AEO flags enabled (not just content fields), if the tool supports it
- [ ] AI chat custom questions derived from actual created pages, not invented
- [ ] Plan-gated failures recorded but do not block the result
- [ ] Result lists applied sections, plan-gated sections, and warnings
