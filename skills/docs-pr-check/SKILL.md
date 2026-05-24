---
name: docs-pr-check
description: Block PRs that change code without updating docs. Generates a GitHub Actions workflow (.github/workflows/docsbook-docs-check.yml) that runs on every PR, validates frontmatter in changed markdown, and detects broken internal links. Optional `block_on_broken_links` input fails the build on breakage.
category: automation
requires_plan: free
produces_files:
  - .github/workflows/docsbook-docs-check.yml
keywords:
  - pr
  - ci
  - github-actions
  - lint
metadata:
  version: 1.0.0
---

# docs-pr-check

Sets up a CI gate in the user's GitHub repository so that every pull request is checked for documentation hygiene: missing doc updates for code changes, invalid frontmatter, and broken internal links.

## Arguments

- `$ARGUMENTS.block_on_broken_links` — boolean, optional (default: `false`). If `true`, broken internal links cause the workflow job to fail; otherwise they are reported as warnings.

## Step 1 — Read the workflow template

Read the Handlebars template from `assets/workflow.yml.hbs` (sibling of this `SKILL.md`).

## Step 2 — Substitute settings

Render the template with the following context:

- `block_on_broken_links` — value from arguments (default `false`).

The template uses `{{block_on_broken_links}}` to toggle a workflow input default and to decide whether the broken-links job uses `continue-on-error: true`.

## Step 3 — Write the workflow file

Write the rendered result to `.github/workflows/docsbook-docs-check.yml` in the current repository.

- Create the `.github/workflows/` directory if it does not exist.
- If the file already exists, overwrite it (the user can review the diff in their PR).

## Step 4 — Reference the CLI subcommand

The generated workflow invokes `npx docs-skills run check-pr-docs --pr=${{ github.event.pull_request.number }}` to perform the actual checks. That subcommand is provided by the `docs-skills` CLI (see plan item C2) and is responsible for:

1. Detecting code-vs-docs change ratio in the PR diff.
2. Validating frontmatter of any changed `.md` / `.mdx` files.
3. Walking internal links in changed markdown and reporting broken ones.

Print a short summary to stdout after writing the file, e.g.:

```
Wrote .github/workflows/docsbook-docs-check.yml
- block_on_broken_links: <value>
Commit and open a PR to activate the check.
```
