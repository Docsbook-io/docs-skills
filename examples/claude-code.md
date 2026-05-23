# Using docs-skills with Claude Code

## 1. Add Docsbook MCP (one-time)

```bash
mcp add --transport http https://docsbook.io/api/mcp/server
```

Authenticate in the browser when prompted.

## 2. Install skills

```bash
npm install -g docs-skills
cd your-project
docs-skills install
```

Or globally:

```bash
docs-skills install ~/
```

## 3. Run an audit

In any Claude Code conversation:

```
/docs-analyze
```

Claude will ask for the GitHub repo URL, then run all 10 sub-skills.

For a focused audit:

```
/docs-seo
/docs-accessibility
/docs-maintenance
```

## Example output

```
# Documentation Audit — acme/my-product

**Date:** 2024-12-01
**Pages analyzed:** 47

## Summary
| Severity | Count |
|---|---|
| 🔴 Critical | 3 |
| 🟠 High | 11 |
| 🟡 Medium | 24 |
| 🟢 Low | 8 |

## Critical Issues

**[docs-seo]** docs/quick-start.md — missing `description` in frontmatter.
Pages without description get no SERP snippet and score 0 in AI Overviews.
Fix: Add `description: 'Get started with acme/my-product in 5 minutes...'`

**[docs-accessibility]** docs/guides/setup.md:34 — informative image with no alt text.
Fix: `![Setup form with API key field highlighted](screenshots/setup.png)`

**[docs-maintenance]** docs/roadmap.md:23 — 'Coming in Q2 2024' is 8 months past.
Fix: Update or remove the dated promise.

## Quick Wins (< 30 min each)
- Add description to 23 pages missing it
- Fix 8 passive-voice instructions in quick-start.md
- Link 3 orphan pages from the sidebar
```
