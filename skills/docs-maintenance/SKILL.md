---
name: docs-maintenance
description: Surface the docs that are quietly lying to your users. A quarterly-style audit that flags stale content, deprecated pages without migration paths, TODO/FIXME left in published docs, expired promises, old version references and ownership gaps. Not a single-page review — designed for the whole tree.
metadata:
  version: 1.0.0
  category: analysis
  requires_docsbook_mcp: true
  uses_mcp_tools:
    - list_workspaces
    - get_doc_graph
    - read_doc_sections
  keywords: [maintenance, stale, freshness, deprecated, todo, ownership]
---

# docs-maintenance — Documentation Maintenance Analysis

## Workflow

1. **Connect to Docsbook** — run `list_workspaces` to find the workspace, then `get_doc_graph` to get all pages with timestamps. Reindex if graph is empty or stale.
2. **Set staleness threshold** — confirm with the user: default is 90 days for Tier 1 pages, 365 days for others.
3. **Apply checklist** — scan pages via `read_doc_sections` for TODO/FIXME, "coming soon", past dates, deprecated mentions, missing ownership, and pricing consistency. Run bash scripts on local repo when available for file-age and code consistency checks.
4. **Produce report** — return one JSON issue object per finding, sorted by severity.

## Guardrails

- Do not run this skill on a single freshly-created page — it is designed for whole-tree audits.
- Do not edit any documentation files — surface findings only.
- When local repo access is unavailable, use `read_doc_sections` for content-level signals; note which file-age checks were skipped.
- Deprecated content should NOT be removed immediately — flag for a banner + migration path, not deletion.
- Confirm with the user which pages are Tier 1 before applying the stricter 90-day threshold.

## MCP Tools

| Tool | Purpose |
|------|---------|
| `mcp__docsbook__list_workspaces` | Find workspace |
| `mcp__docsbook__get_doc_graph` | Page list with `last_updated` timestamps |
| `mcp__docsbook__read_doc_sections` | Scan content for maintenance signals |
| `mcp__docsbook__reindex_doc_graph` | Refresh stale graph before analysis |

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

## Docsbook MCP-Based Detection

When local repo access is unavailable, use `mcp__docsbook__read_doc_sections` to detect content-level signals:

- **TODO/FIXME**: scan section text for these strings
- **Past dates**: regex for years like `2024`, `2023` in promise context
- **"Coming soon"**: string search across all sections
- **Deprecated without migration**: find "deprecated" then check if "use instead" or a link follows within 3 lines
- **Page freshness**: use `last_updated` field from `get_doc_graph` if available

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

## Acceptance Criteria

- [ ] All Tier 1 pages have been checked for staleness against the confirmed threshold.
- [ ] Every TODO/FIXME found in published docs is reported as critical.
- [ ] Every deprecated page without a migration path is flagged as high.
- [ ] Output is valid JSON per the format above, one object per finding.

## Related Skills

- `docs-navigation-linking` — broken links are a maintenance issue
- `docs-media` — stale screenshots are a maintenance issue
- `docs-i18n` — stale translations are a maintenance issue
- `docs-analyze` — orchestrator
