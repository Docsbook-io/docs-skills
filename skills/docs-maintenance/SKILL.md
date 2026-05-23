---
name: docs-maintenance
description: Analyzes documentation freshness and maintenance health — stale content, deprecated pages without migration paths, TODO/FIXME in published docs, past-dated promises, old version references, and ownership gaps. For quarterly audits, not single-page reviews.
metadata:
  version: 1.0.0
---

# docs-maintenance — Documentation Maintenance Analysis

## Before Starting

1. **This skill is for tree-level audits.** Don't run it on a single fresh page.
2. **Get the repository.** Ask for the GitHub repo URL or `{user}/{repo}`.
3. **Check Docsbook.** Run `mcp__docsbook__list_workspaces` to find the workspace.
   - If found → use `mcp__docsbook__get_doc_graph` to get all pages with timestamps.
   - If not found → offer to add it first.
4. **Check the graph.** If `get_doc_graph` returns an empty graph or no data → run `mcp__docsbook__reindex_doc_graph` to generate it, then retry. If it returns a stale warning, offer to reindex before proceeding.
4. **Set staleness threshold.** Default: 90 days for Tier 1 pages, 365 days for others.
5. **Read pages for content signals.** Use `mcp__docsbook__read_doc_sections` to find TODO/FIXME, "coming soon", past dates, deprecated mentions.

---

## Core Principles

### 1. Documentation degrades at the speed of the code it describes
Without maintenance processes, half of docs become partially or fully outdated within 6 months of active development.

### 2. Docs as code — update in the same PR
The only sustainable way to keep docs current is to update them in the same PR that changes the feature. After-the-fact doc updates accumulate as debt.

### 3. Impact-driven prioritization
Impact = `traffic × (low satisfaction + support ticket correlation + business criticality)`. A stale quick-start seen by thousands matters more than a forgotten edge-case guide.

### 4. Deprecated content needs a migration path
Don't delete deprecated pages immediately. Add a banner, link to the replacement, give users time to migrate. Then remove.

---

## Checklist

### Freshness Signals (from content)

- [ ] **No "coming soon" older than 30 days** — if it shipped, remove the placeholder; if delayed, update the date
- [ ] **No past dates presented as future** — "by end of 2024", "in Q1 2025" when those dates have passed
- [ ] **No TODO / FIXME / XXX** in published documentation
- [ ] **No "this feature is in beta"** if it shipped to GA
- [ ] **Version numbers are current** — docs mentioning v1 when product is at v3
- [ ] **Pricing matches production** — check against `src/utils/constants.ts` if local access

### Deprecated Content

- [ ] **Deprecated pages have a banner** at the top — not buried in the content
- [ ] **Migration path is specific** — "use `newMethod()`, see [new guide](link)" not vague "use the new API"
- [ ] **Deprecated content is not removed immediately** — at minimum one major release lifetime
- [ ] **Internal links updated** — no current pages link to deprecated pages without noting the deprecation
- [ ] **Old URLs redirect** to new locations (301)

### Ownership

- [ ] **`last_reviewed` in frontmatter** on technical pages
- [ ] **Owner attribution** exists (CODEOWNERS, frontmatter, or centralized registry)
- [ ] **Tier 1 pages reviewed** within the last 90 days

### Code/Docs Consistency

- [ ] **API endpoints mentioned in docs exist** — check against `src/app/api/` routes
- [ ] **CLI commands work** on the current version
- [ ] **Prices in docs match `constants.ts`** — `proLifetime: 150`, `proPlusMonthly: 29`
- [ ] **Code examples compile** — at minimum, verify syntax is valid

---

## Severity Table

| Severity | Problem | Detection |
|---|---|---|
| `critical` | TODO/FIXME/XXX in published docs | grep pattern |
| `critical` | "Coming soon" on content > 90 days old | Content + page age |
| `critical` | Tier 1 page (quick-start, pricing) not updated in 180+ days | Timestamp check |
| `high` | Past date presented as future promise | "by end of 2024", "Q1 2025" |
| `high` | Old version mentioned prominently | `v1` when current is `v3` |
| `high` | Deprecated page with no migration path | "deprecated" with no "use instead" |
| `high` | Pricing in docs doesn't match constants.ts | Compare values |
| `medium` | No `last_reviewed` in frontmatter | Missing field |
| `medium` | Any page not updated in 365+ days | Timestamp check |
| `medium` | API endpoint in docs doesn't exist in codebase | Route check |
| `low` | "Beta" label on GA feature | Label audit |
| `low` | No owner attribution anywhere | CODEOWNERS / frontmatter check |

---

## Bash Scripts (for local repo access)

### Stale pages (90+ days)

```bash
find docs -name '*.md' -mtime +90 -exec sh -c '
  age=$(( ($(date +%s) - $(stat -f %m "$1" 2>/dev/null || stat -c %Y "$1")) / 86400 ))
  echo "$age days: $1"
' _ {} \; | sort -rn | head -20
```

### TODO/FIXME in published docs

```bash
grep -rnE '\b(TODO|FIXME|XXX|HACK)\b' docs/
```

### "Coming soon" in old files

```bash
grep -rln -iE "coming soon|not yet available" docs/ | while read file; do
  age=$(( ($(date +%s) - $(stat -f %m "$file" 2>/dev/null || stat -c %Y "$file")) / 86400 ))
  [ $age -gt 30 ] && echo "$file ($age days old)"
done
```

### Past dates presented as future

```bash
current_year=$(date +%Y)
prev_year=$((current_year - 1))
grep -rnE "by (end of )?$prev_year|in (Q[1-4] )?$prev_year" docs/
```

### Deprecated without migration path

```bash
grep -rln -i "deprecated\|no longer supported" docs/ | while read file; do
  if ! grep -qiE "use instead|replaced by|migration|migrate|see \[" "$file"; then
    echo "$file — deprecated with no migration path"
  fi
done
```

### Pricing consistency (Docsbook-specific)

```bash
# Check docs pricing vs constants.ts
grep -rE '\$[0-9]+' docs/ | grep -iE "pro|lifetime|monthly|plan"
grep -E 'proLifetime|proPlusMonthly' src/utils/constants.ts
```

---

## Docsbook MCP-Based Detection

When local repo access is unavailable, use `mcp__docsbook__read_doc_sections` to detect content-level signals:

- **TODO/FIXME**: scan section text for these strings
- **Past dates**: regex for years like `2024`, `2023` in promise context
- **"Coming soon"**: string search across all sections
- **Deprecated without migration**: find "deprecated" then check if "use instead" or a link follows within 3 lines
- **Page freshness**: use `last_updated` field from `get_doc_graph` if available

---

## Output Format

```json
{
  "file": "docs/guides/legacy-auth.md",
  "line": 1,
  "severity": "high",
  "rule": "deprecated-without-migration",
  "found": "Page mentions 'this method is deprecated' but provides no replacement or migration guide link.",
  "suggestion": "Add a banner at the top: '> **Deprecated since v3.0 (2024-11).** Use [Bearer token authentication](/guides/auth) instead. This method will be removed in v5.0.' Add a link to the migration guide."
}
```

```json
{
  "file": "docs/pricing.md",
  "line": 45,
  "severity": "critical",
  "rule": "outdated-pricing",
  "found": "Page shows 'PRO $99 lifetime' but constants.ts contains proLifetime: 150. Documentation pricing is out of sync with production.",
  "suggestion": "Update docs/pricing.md to $150. Add to release checklist: 'Update docs/pricing.md if pricing changed'. Long-term: inject prices from constants.ts at build time."
}
```

```json
{
  "file": "docs/quick-start.md",
  "line": null,
  "severity": "critical",
  "rule": "tier1-stale",
  "found": "Tier 1 page (quick-start) has not been updated in 142 days. Critical onboarding page for all new users.",
  "suggestion": "Walk through the quick-start yourself: follow all steps, verify screenshots are current, confirm commands work. Update last_reviewed in frontmatter even if content hasn't changed."
}
```

```json
{
  "file": "docs/roadmap.md",
  "line": 23,
  "severity": "high",
  "rule": "past-date-as-future",
  "found": "Line 23: 'Multi-repo support coming in Q2 2024' — Q2 2024 has passed. Either it shipped (update to reflect that) or it was delayed (remove or update the date).",
  "suggestion": "If shipped: replace with 'Multi-repo support is available — see [multi-repo guide](link)'. If delayed: remove the date or update to current roadmap."
}
```

---

## Task-Specific Questions

When invoked directly, ask:

1. **Staleness threshold?** 90 / 180 / 365 days
2. **Local repo access available?** For file age and pricing consistency checks
3. **Tier 1 pages for this project?** (quick-start, pricing, auth — confirm)
4. **Deprecated content action?** Add banner + migration path, or full removal with redirect?

---

## Tool Integrations

| Tool | Purpose |
|---|---|
| `mcp__docsbook__list_workspaces` | Find workspace |
| `mcp__docsbook__get_doc_graph` | Page list with `last_updated` timestamps |
| `mcp__docsbook__read_doc_sections` | Scan content for maintenance signals |
| `mcp__docsbook__reindex_doc_graph` | Refresh stale graph before analysis |
| `find` + `grep` (Bash, local) | File age, TODO/FIXME, pattern detection |

---

## Related Skills

- `docs-navigation-linking` — broken links are a maintenance issue
- `docs-media` — stale screenshots are a maintenance issue
- `docs-i18n` — stale translations are a maintenance issue
- `docs-analyze` — orchestrator
