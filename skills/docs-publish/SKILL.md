---
name: docs-publish
description: Push a local docs folder to GitHub in one step. Handles git init, commit, gh repo create and push — no Docsbook MCP required. Designed as the natural next step after /docs-from-site, /docs-from-code or /docs-from-docs.
metadata:
  version: 2.0.0
  category: publishing
  requires_docsbook_mcp: false
  keywords: [publish, github, git, commit, push, repo]
---

# docs-publish

Knowledge for publishing a local docs folder to GitHub. The actual work is done by the **`docs-publisher`** subagent (Haiku, pinned model) shipped in the [docs-create Claude Code plugin](https://github.com/Docsbook-io/docs-claude-plugins) and the [docs-subagents npm package](https://github.com/Docsbook-io/docs-subagents). This skill is the reference notes you read *before* running it.

## What this is for

You have `docs-output/<name>/` from [docs-from-site](../docs-from-site/SKILL.md) (or hand-written docs). You want it live on GitHub so Docsbook can auto-index it. The publisher creates a new public repo and pushes `main` in one shot.

## Tips & tricks

- **Use HTTPS with the gh token, not SSH.** `git push` over SSH fails silently when the user's key isn't loaded. `gh auth token` returns a short-lived PAT that works on any machine where `gh auth login` has been run.
- **Run `gh auth status` before anything else.** Cheapest sanity check. If it fails, the entire publish flow is dead — return early with manual instructions instead of trying to recover.
- **Derive the repo name from the folder.** `docs-output/example/` → `example-docs` (or just `example`). Don't ask the user unless the folder name collides with an existing repo on their account.
- **`gh repo create --source` is brittle.** It tries to clone, set remote, and push in one call — fails when workflow scope is missing. Safer: `gh repo create owner/repo --public --description "..."` (no `--source`), then add the remote manually and `git push -u origin main`.
- **Never overwrite existing repos.** If `gh repo create` returns "name already exists", bail with a clear error — silently force-pushing into someone else's repo is a footgun.
- **Pre-existing `.git` is fine.** If the user's `docs-output/` is already a git repo, skip `git init` and reuse the current branch; just warn so they know nothing is being reinitialized.
- **`_branding.json` survives the push.** Don't delete it — [docs-setup-workspace](../docs-setup-workspace/SKILL.md) reads it from the local copy, but having it in the repo helps reproducibility.

## Output contract

The publisher returns:

```json
{
  "status": "ok",
  "githubUrl": "https://github.com/owner/repo",
  "docsbookUrl": "https://docsbook.io/owner/repo",
  "markdownFiles": 12,
  "hasBranding": true,
  "warnings": []
}
```

`docsbookUrl` is computed deterministically (`https://docsbook.io/<owner>/<repo>`) — the site is live the moment Docsbook indexes the repo (typically a few seconds).

## Error modes worth knowing

| Failure | What the agent returns | Recovery |
|---|---|---|
| `gh` not installed | `{"status":"error","reason":"gh_missing","manualSteps":[...]}` | Install gh CLI; the result includes the manual `git`/`gh` commands |
| Repo name taken | `{"status":"error","reason":"repo_exists"}` | Pick a different repo name or delete the existing repo first |
| Push fails over HTTPS | `{"status":"error","reason":"push_failed","detail":"..."}` | Check `gh auth status`; do NOT silently retry over SSH |
| Auth missing | gh auth status fails before push | Run `gh auth login` once and re-invoke |

## How to run

**Plugin (recommended):**

```
/docs-publish docs-output/example
```

The slash command spawns the `docs-publisher` subagent on Haiku and returns the JSON result.

**Standalone subagent:**

```
"Use the docs-publisher subagent to publish docs-output/example as alice/example-docs"
```

**Next step:**

- [docs-setup-workspace](../docs-setup-workspace/SKILL.md) — configure Docsbook branding, UI, AI, SEO via MCP
