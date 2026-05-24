---
name: docs-stale-watcher
description: Turn outdated-docs notifications into real GitHub Issues your team will act on. Registers a Docsbook `content.outdated` webhook and generates a GitHub Actions workflow that opens an issue in your docs repo whenever a page goes stale. PRO+.
category: automation
requires_plan: pro_plus
requires_docsbook_mcp: true
uses_mcp_tools:
  - register_webhook_content_outdated
produces_files:
  - .github/workflows/docsbook-stale-handler.yml
keywords:
  - stale
  - outdated
  - watcher
  - webhook
  - issue
metadata:
  version: 1.0.0
---

# docs-stale-watcher

Watches the user's Docsbook workspace for `content.outdated` events and opens a GitHub Issue per stale page in the user's repository, so docs maintainers see them in their normal triage flow.

> **Backend dependency:** webhooks fire only once the Docsbook backend implements `dispatchEvent('content.outdated', ...)` for the workspace (Plan Part E). Until that ships, the workflow file is in place but no events will be delivered. The skill still completes successfully — it provisions the listener and registration so everything is ready the moment the backend goes live.

## Arguments

- `$ARGUMENTS[0]` — `owner/repo` or Docsbook workspace ID (required)
- `$ARGUMENTS.last_modified_days` — number, optional (default: `180`). Pages untouched for this many days are considered outdated.
- `$ARGUMENTS.secret` — optional string used to sign webhook payloads. If absent, the skill generates a random 32-byte hex secret.

## Check MCP Availability

Try calling `mcp__docsbook__list_workspaces`. If it fails or is unavailable, print:

```
Docsbook MCP not connected. To set it up:
  mcp add --transport http https://docsbook.io/api/mcp/server
Then re-run /docs-stale-watcher.
```

Exit gracefully.

## Step 1 — Generate the GitHub Actions workflow

Read `assets/docsbook-stale-handler.yml.hbs` (sibling of this `SKILL.md`) and render it with:

- `workspace_ref` — `owner/repo` or workspace ID from arguments.
- `last_modified_days` — from arguments (default `180`).

Write the rendered file to `.github/workflows/docsbook-stale-handler.yml` in the current repository. Create the `.github/workflows/` directory if it does not exist. Overwrite if present.

The workflow is triggered by `repository_dispatch` with `event_type: docsbook.content.outdated`. Each delivery contains a payload of `page_paths[]` and `last_modified_days`; the job opens one GitHub Issue per affected page with a body explaining why the page is considered stale and linking back to the source file.

## Step 2 — Register the webhook with Docsbook

Call `mcp__docsbook__register_webhook_content_outdated` with:

```ts
{
  workspace_id,
  url: `https://api.github.com/repos/${owner}/${repo}/dispatches`,
  secret,
  event_type: "docsbook.content.outdated",
  threshold_days: last_modified_days,
}
```

The Docsbook dispatcher is expected to translate `content.outdated` events into GitHub `repository_dispatch` payloads (`event_type: "docsbook.content.outdated"`, `client_payload: { page_paths, last_modified_days, workspace_id }`). If the target URL is `api.github.com`, the dispatcher must inject the user's GitHub token from the workspace's connected OAuth credentials.

> If `register_webhook_content_outdated` returns a `not_implemented` or `plan_restricted` error, surface the message verbatim and stop — do not delete the workflow file the user already has on disk.

## Step 3 — Tell the user what was wired up

Print a short summary:

```
Wired up docs-stale-watcher
- Workflow:   .github/workflows/docsbook-stale-handler.yml
- Webhook:    content.outdated → repository_dispatch (docsbook.content.outdated)
- Threshold:  {last_modified_days} days
- Secret:     stored in Docsbook; add it as repo secret DOCSBOOK_WEBHOOK_SECRET to verify signatures.

Note: webhook delivery depends on Docsbook backend dispatchEvent('content.outdated', ...).
Until that ships, the listener is in place but no events will arrive.
Commit and push the workflow to activate it.
```
