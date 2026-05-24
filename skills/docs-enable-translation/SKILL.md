---
name: docs-enable-translation
description: Translate your docs into 15 languages without leaving Claude. Switches a Docsbook workspace to AI auto-translation, enables the languages you pick (en/es/fr/de/pt/it/ru/zh/ja/ko/ar/hi/tr/pl/nl), and optionally pings Slack when each batch finishes. PRO plan.
metadata:
  version: 1.0.0
  category: automation
  requires_docsbook_mcp: true
  requires_plan: pro
  uses_mcp_tools:
    - update_languages
    - set_translation_mode
    - register_webhook_translation_completed
  produces_files:
    - AGENTS.md
  keywords: [translate, i18n, multilang, локализация]
---

# docs-enable-translation

Enables AI auto-translation for a Docsbook workspace across the 15 supported languages, optionally wiring a Slack webhook that fires when each translation batch completes. Requires Docsbook MCP connected (`mcp add --transport http https://docsbook.io/api/mcp/server`) and a PRO (or PRO+) workspace plan.

## Arguments

- `$ARGUMENTS[0]` — `owner/repo` or Docsbook workspace ID (required)
- `languages: string[]` — list of ISO 639-1 codes from the supported 15: `en, es, fr, de, pt, it, ru, zh, ja, ko, ar, hi, tr, pl, nl`
- `notify_slack?: { webhook_url: string }` — optional Slack Incoming Webhook URL

## Check MCP Availability

Try calling `mcp__docsbook__list_workspaces`. If it fails or is unavailable, print:

```
Docsbook MCP not connected. To set it up:
  mcp add --transport http https://docsbook.io/api/mcp/server
Then re-run /docs-enable-translation.
```

Exit gracefully without error.

## Step 1 — Validate inputs

- Ensure `languages` is a non-empty array.
- Reject any code not in the supported 15: `en, es, fr, de, pt, it, ru, zh, ja, ko, ar, hi, tr, pl, nl`.
- If `notify_slack.webhook_url` is provided, ensure it starts with `https://hooks.slack.com/`.
- On invalid input, print the offending value and stop.

## Step 2 — Check workspace plan

- Call `mcp__docsbook__get_workspace({ workspaceIdOrSlug })` to read the workspace.
- Read the effective plan from `plan_capabilities` (or equivalent field).
- If the plan is not `pro` or `pro_plus`, stop and print:

```
⚠️  Translation requires PRO plan. Upgrade at https://docsbook.io/pricing
```

Do not proceed to the next steps.

## Step 3 — Enable languages

Call `mcp__docsbook__update_languages` with the validated set:

```json
{
  "workspaceId": "<id>",
  "enabledLanguages": ["en", "es", "fr", "..."]
}
```

## Step 4 — Switch translation mode to auto

Call `mcp__docsbook__set_translation_mode`:

```json
{
  "workspaceId": "<id>",
  "mode": "auto"
}
```

This tells Docsbook to translate new and changed pages automatically using the workspace's configured AI provider.

## Step 5 — Optional Slack webhook

If `notify_slack.webhook_url` is provided:

1. Generate a random `secret` (32+ chars, hex or base64url) — this is the HMAC secret Docsbook will use to sign deliveries.
2. Call `mcp__docsbook__register_webhook_translation_completed`:

   ```json
   {
     "workspaceId": "<id>",
     "url": "<notify_slack.webhook_url>",
     "secret": "<generated_secret>"
   }
   ```

3. Surface the `secret` to the user once so they can verify signatures on the receiving side.

If `notify_slack` is not provided, skip this step.

## Step 6 — Append section to AGENTS.md

Append (or replace) a managed section in the repository's `AGENTS.md` using the marker `## Docsbook Translation`. If `AGENTS.md` does not exist, create it.

Section template:

```markdown
## Docsbook Translation

Auto-translation is enabled for this workspace.

- Languages: <comma-separated list>
- Mode: auto (Docsbook translates on push)
- Source language files: only edit files under the source locale; translated files are managed by Docsbook and will be overwritten.
- Slack notifications: <enabled|disabled>
```

Use append-section semantics: if the marker already exists, replace its body; otherwise append a new section at the end.

## Step 7 — Report next steps

Print a summary:

```
✅ Translation enabled
📚 Workspace: https://docsbook.io/{owner}/{repo}
🌐 Languages: <list>
🔔 Slack notifications: <on|off>

Next steps:
- Push a change to a source-language doc — Docsbook will translate it within a few minutes.
- Do not edit translated files directly; they are regenerated on each translation run.
- Track usage and remaining quota with /docs-skills get_ai_usage.
```
