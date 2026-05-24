---
name: docs-translate-webhook
description: Plug your own translation pipeline into Docsbook. Switches translation mode to `external`, registers a `translation.requested` webhook and scaffolds a Vercel or Express handler — so in-house TMS, human reviewers, glossary enforcement or regulated content can replace the built-in AI translator. PRO+.
metadata:
  version: 1.0.0
  category: automation
  requires_docsbook_mcp: true
  requires_plan: pro_plus
  uses_mcp_tools:
    - set_translation_mode
    - register_webhook_translation_requested
  produces_files:
    - api/docsbook-translate.ts
  keywords: [translate, webhook, external, custom, pipeline]
---

# docs-translate-webhook

Bypasses Docsbook's built-in AI translator and delegates translation work to a custom external service over webhooks. Useful for teams with their own translation pipeline (in-house TMS, human reviewers, glossary enforcement, regulated content). Requires PRO+ plan.

## Arguments

- `$ARGUMENTS[0]` — `owner/repo` or Docsbook workspace ID (required)
- `webhook_url: string` — public HTTPS URL where Docsbook will POST `translation.requested` events (required)
- `runtime?: "vercel" | "express"` — handler template flavor (default: `vercel`)
- `out_path?: string` — file path for the generated handler (default: `api/docsbook-translate.ts` for vercel, `src/routes/docsbook-translate.ts` for express)

## Check MCP availability

Try calling `mcp__docsbook__list_workspaces`. If it fails:

```
Docsbook MCP not connected. To set it up:
  mcp add --transport http https://docsbook.io/api/mcp/server
Then re-run /docs-translate-webhook.
```

Exit gracefully.

## Step 1 — Validate plan and inputs

1. Resolve workspace via `mcp__docsbook__get_workspace({ workspaceIdOrSlug })`.
2. Read effective plan from `plan_capabilities`. If it is not `pro_plus`, stop and print:

   ```
   ⚠️  External translation webhooks require PRO+ plan. Upgrade at https://docsbook.io/pricing
   ```

3. Ensure `webhook_url` is `https://` (reject `http://` and non-URL strings).
4. Ensure `runtime` is `vercel` or `express`; default to `vercel`.

## Step 2 — Switch translation mode to `external`

Call `mcp__docsbook__set_translation_mode`:

```json
{
  "workspaceId": "<id>",
  "mode": "external"
}
```

This stops Docsbook from running its built-in translator and tells it to emit `translation.requested` events instead.

## Step 3 — Register the webhook

1. Generate a random `secret` (32+ chars, hex or base64url). This is the HMAC signing secret Docsbook will use on outbound deliveries.
2. Call `mcp__docsbook__register_webhook_translation_requested`:

   ```json
   {
     "workspaceId": "<id>",
     "url": "<webhook_url>",
     "secret": "<generated_secret>"
   }
   ```

3. Capture the returned `callback_url` (the endpoint the handler will POST translations back to) if present in the response. If the response does not include one, default the handler to `https://docsbook.io/api/translations/callback`.
4. Surface the `secret` to the user once — they must store it as `DOCSBOOK_WEBHOOK_SECRET` on the handler's host.

## Step 4 — Scaffold the handler template

1. Read the Handlebars template from `assets/handler.ts.hbs` (sibling of this `SKILL.md`).
2. Render it with:

   - `runtime` — `"vercel"` or `"express"`.
   - `callback_url` — from step 3 (or the default).
   - `workspace_id` — resolved workspace ID.

3. Write the rendered file to `out_path` (default `api/docsbook-translate.ts` for vercel, `src/routes/docsbook-translate.ts` for express). Create parent directories if needed. Overwrite if the file exists (user reviews the diff).

## Step 5 — Report next steps

Print:

```
✅ External translation webhook wired
📚 Workspace: https://docsbook.io/{owner}/{repo}
🔔 Webhook: <webhook_url>
🗝  Secret (store as DOCSBOOK_WEBHOOK_SECRET): <secret>
📝 Handler scaffold: <out_path>

Next steps:
1. Replace the TODO in the handler with your translation logic (call your TMS, run human review, etc.).
2. Set DOCSBOOK_WEBHOOK_SECRET and DOCSBOOK_API_TOKEN in your deployment environment.
3. Deploy the handler so it is reachable at <webhook_url>.
4. Push a change to a source-language doc — Docsbook will POST `translation.requested` to your handler.
```
