---
name: docs-publish
description: Publishes a local documentation folder to a new GitHub repository. Handles git init, commit, gh repo create, and push. Works without Docsbook MCP. Use after /docs-from-site, /docs-from-code, or /docs-from-docs to make the docs live.
metadata:
  version: 1.0.0
---

# docs-publish

Publishes a local documentation folder to a new public GitHub repository.

## Arguments

- `$ARGUMENTS[0]` — path to docs folder (required, e.g. `docs-output/myproduct`)
- `$ARGUMENTS[1]` — `owner/repo-name` (optional — if not given, ask or derive from folder name + `gh auth status`)

## Before Starting

- If path is not provided, look for `docs-output/` in cwd and ask which folder to publish.
- Run `gh auth status` to get the authenticated GitHub user — use as default owner.
- Derive repo name from the folder name if `$ARGUMENTS[1]` is not given.

## Step 1 — Validate Docs Folder

- Check that the path exists and contains `README.md`.
- Count markdown files and report the number.
- Check if `_branding.json` exists (produced by `/docs-from-site` — used later by `/docs-setup-workspace`).

## Step 2 — Git Init and Commit

```bash
cd <path>
git init
git add .
git commit -m "docs: initial documentation"
git branch -M main
```

## Step 3 — Create GitHub Repo and Push

```bash
# Use HTTPS to avoid SSH key issues
GH_TOKEN=$(gh auth token)
gh repo create {owner}/{repo} --public --description "{description}" 2>&1
git remote add origin https://{owner}:$GH_TOKEN@github.com/{owner}/{repo}.git
git push -u origin main
```

> Note: if `gh repo create --source` fails due to workflow scope, create the repo first then push separately.

## Step 4 — Verify

- Print the GitHub URL: `https://github.com/{owner}/{repo}`
- Print the Docsbook URL: `https://docsbook.io/{owner}/{repo}`
- Note: Docsbook auto-indexes the repo — the site will be live at the Docsbook URL after creating a workspace.

## Output

```
✅ Published!
🐙 GitHub:   https://github.com/{owner}/{repo}
📚 Docsbook: https://docsbook.io/{owner}/{repo}

Next: run /docs-setup-workspace to configure branding and AI.
```

## Error Handling

- If repo already exists: print error and suggest a different name.
- If push fails due to SSH: automatically switch to HTTPS with gh token.
- If gh not installed: provide manual git instructions as fallback.
