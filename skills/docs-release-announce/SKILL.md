---
name: docs-release-announce
description: Announce new GitHub releases of a Docsbook-tracked repository to Slack and/or email by registering a Docsbook release.published webhook and generating a GitHub Actions handler.
metadata:
  version: 1.0.0
  category: automation
  requires_docsbook_mcp: true
  requires_plan: pro
  uses_mcp_tools:
    - register_webhook_release_published
  produces_files:
    - .github/workflows/docsbook-release-announce.yml
  keywords: [release, announce, slack, email, webhook]
---

# docs-release-announce

Wires up release announcements for a Docsbook workspace. When a new GitHub release is published on the workspace's repository, a notification is dispatched to one or more channels (Slack incoming webhook and/or email via Resend). Requires the Docsbook MCP connected and a PRO (or PRO+) workspace plan.

## Arguments

- `$ARGUMENTS[0]` — `owner/repo` or Docsbook workspace ID (required)
- `channels: ("slack" | "email")[]` — at least one channel (required)
- `slack_webhook_url?: string` — required if `channels` contains `slack`; must start with `https://hooks.slack.com/`
- `email?: string` — required if `channels` contains `email`; valid email address that will receive the announcement

## Check MCP Availability

Try calling `mcp__docsbook__list_workspaces`. If it fails or is unavailable, print:

```
Docsbook MCP not connected. To set it up:
  mcp add --transport http https://docsbook.io/api/mcp/server
Then re-run /docs-release-announce.
```

Exit gracefully without error.

## Step 1 — Register the release.published webhook

The skill performs two actions, matching plan item B5:

1. Call `mcp__docsbook__register_webhook_release_published` with:

   ```json
   {
     "workspaceId": "<id>",
     "url": "https://api.github.com/repos/<owner>/<repo>/dispatches",
     "secret": "<generated_secret>"
   }
   ```

   - Generate a fresh random `secret` (32+ chars, hex or base64url). Surface it once to the user so they can verify HMAC signatures on the receiving side.
   - If the `register_webhook_release_published` tool is not exposed by the connected MCP server (Docsbook has not yet shipped release events — see PLAN.md Часть E), fall back to wiring the GitHub Actions workflow directly against GitHub's native `release: published` event and skip the MCP call. Print a one-line note explaining the fallback.

## Step 2 — Generate the handler workflow

1. Read the Handlebars template from `assets/handler.yml.hbs` (sibling of this `SKILL.md`).
2. Render it with the following context:

   - `channels` — array of selected channels (e.g. `["slack", "email"]`).
   - `slack` — boolean, `true` if `slack` is in `channels`.
   - `email` — boolean, `true` if `email` is in `channels`.
   - `email_to` — the `email` argument when provided.

3. Write the rendered result to `.github/workflows/docsbook-release-announce.yml` in the current repository. Create the `.github/workflows/` directory if it does not exist. Overwrite the file if it already exists.

The generated workflow is triggered on `release: published` and dispatches messages to the configured channels using repository secrets:

- `SLACK_WEBHOOK_URL` — Slack Incoming Webhook (set this in the repo settings if `slack` is selected).
- `RESEND_API_KEY` — Resend API key for transactional email (set this in the repo settings if `email` is selected).

Print a summary including the path of the generated file, the selected channels, and the secret names that must be configured under repository settings → Secrets and variables → Actions.
