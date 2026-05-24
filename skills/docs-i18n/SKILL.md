---
name: docs-i18n
description: Stop letting translations rot silently. Audits multilingual docs for content parity across languages, ISO 639-1 correctness, hreflang tags, navigation translation, date/number localization and out-of-date pages — across the 15 languages Docsbook supports. Skipped automatically if only one language is enabled.
metadata:
  version: 1.0.0
  category: analysis
  requires_docsbook_mcp: true
  uses_mcp_tools:
    - list_workspaces
    - get_workspace
    - get_doc_graph
    - read_doc_sections
  keywords: [i18n, translation, localization, multilingual, hreflang, languages]
---

# docs-i18n — Internationalization Analysis

## Before Starting

1. **Check if multilingual docs exist.** Run `mcp__docsbook__get_workspace` and check `enabled_languages`. If only one language is enabled, skip this skill.
2. **Get the repository.** Ask for the GitHub repo URL or `{user}/{repo}` if not already known.
3. **Check Docsbook.** Run `mcp__docsbook__list_workspaces` to find the workspace.
   - If found → use `mcp__docsbook__get_doc_graph` to get all pages across all languages.
   - If not found → offer to add it first.
4. **Check the graph.** If `get_doc_graph` returns an empty graph or no data → run `mcp__docsbook__reindex_doc_graph` to generate it, then retry. If it returns a stale warning, offer to reindex before proceeding.
4. **Identify source language.** Usually English — confirm with the team. All other languages are translations from it.
5. **Define Tier 1 pages.** Quick-start, pricing, authentication — parity is critical for these.

---

## Core Principles

### 1. Each language version is a complete site
Not "a translation of English" — a complete experience in the reader's language with translated navigation, UI labels, and appropriately localized content.

### 2. Content parity is prioritized, not absolute
Tier 1 pages (quick-start, pricing, auth) must be translated to all enabled languages. Tier 3 (deep API reference) can stay English-only. Know the priority tier before flagging missing translations.

### 3. A stale translation is worse than no translation
A translated pricing page showing outdated prices in another language can cost sales or cause support issues. Better to show the English original with a "this page is not yet translated" banner than to show wrong information.

### 4. Localization ≠ translation
Dates, numbers, currencies, and example data should match the locale conventions, not just be translated word-for-word.

---

## Checklist

### Language Configuration

- [ ] **ISO 639-1 codes used** — `en`, `es`, `ru`, `zh`, `ja` — not `english`, `russian`, `spanish`
- [ ] **Regional variants use IETF tags** — `zh-CN`, `zh-TW`, `pt-BR`, `pt-PT`
- [ ] **Default language is explicitly set**
- [ ] **All enabled languages** have at least a translated home page and quick-start

### Content Parity (Priority-Based)

**Tier 1 — always translated:**
- Home / landing page
- Quick start / Getting started
- Pricing / Plans
- Authentication
- Privacy / Terms

**Tier 2 — translate when possible:**
- Top 10 pages by traffic
- Onboarding sections
- Common errors / troubleshooting

**Tier 3 — English-only is acceptable:**
- Deep API reference
- Edge-case how-to guides
- Internal changelog

Checks:
- [ ] **All Tier 1 pages translated** to every enabled language
- [ ] **Tier 1 translations are current** — not more than 30 days behind source
- [ ] **Missing translations fall back gracefully** — show source language with a banner, not a 404

### Navigation and UI

- [ ] **All sidebar/navigation labels translated** — no mixing of English labels in a non-English sidebar
- [ ] **Buttons and UI elements translated** — Search, Next, Previous, Feedback
- [ ] **Language switcher is visible** and accessible from any page
- [ ] **Auto-detection of browser language** with manual override option

### Translation Content Rules

- [ ] **Code is NOT translated** — only surrounding prose and code comments
- [ ] **Brand and product names are NOT translated** — "Docsbook", "GitHub", "Vercel"
- [ ] **Technical terms follow a consistent strategy** — either always translate or always keep in English
- [ ] **Screenshots with UI text** — either use localized screenshots or note "UI is in English"

### Format Localization

- [ ] **Dates match locale** — `DD.MM.YYYY` for RU/DE, `MM/DD/YYYY` for EN-US, `YYYY-MM-DD` for JA/ZH
- [ ] **Numbers match locale** — `1,000.50` (EN) vs `1 000,50` (RU/FR) vs `1.000,50` (DE/ES)
- [ ] **Currency placement correct** — `€100` vs `100€` depending on locale
- [ ] **Time zones specified** for time-sensitive content

### RTL Languages (Arabic)

- [ ] **`dir="rtl"`** applied on Arabic pages
- [ ] **Directional images** (arrows →) are either mirrored or direction-neutral
- [ ] **Layout is not broken** in RTL mode

### Translation Freshness

- [ ] **Translations updated within 30 days** of source page changes for Tier 1
- [ ] **Stale translations (>90 days behind)** have a "this page may be outdated" banner
- [ ] **Translation workflow is defined** — manual, AI with review, or automated

### SEO for Multilingual

- [ ] **`hreflang` tags present** for each language version
- [ ] **Self-referential `hreflang`** — Russian page includes `hreflang="ru"` pointing to itself
- [ ] **`x-default`** points to the fallback language
- [ ] **Canonical URL on the page itself** — not pointing to the English version
- [ ] **Sitemap includes all language versions**

---

## What to Look For

| Severity | Problem | Detection |
|---|---|---|
| `critical` | Tier 1 page missing in an enabled language | Compare page list per language |
| `critical` | Non-English sidebar shows English labels | Check navigation translation |
| `high` | Custom language code used instead of ISO 639-1 | Check `enabled_languages` config |
| `high` | Tier 1 translation more than 90 days behind source | Compare page timestamps |
| `high` | Code comments translated, breaking syntax | Scan code blocks in translations |
| `high` | Missing translation returns 404 instead of fallback | Check fallback behavior |
| `medium` | `hreflang` tags missing | Check page metadata |
| `medium` | Date format not localized | Check date patterns in content |
| `medium` | UI screenshot in non-English docs with no note | Scan image references |
| `low` | Brand name "Docsbook" translated | Grep for translations of brand |
| `low` | Too formal or too informal register for language | Manual review |

---

## Output Format

```json
{
  "file": "docs/ru/",
  "line": null,
  "severity": "critical",
  "rule": "missing-tier1-translation",
  "found": "Russian language is enabled, but docs/ru/quick-start.md does not exist. Tier 1 page missing for an enabled language.",
  "suggestion": "Translate docs/en/quick-start.md → docs/ru/quick-start.md. Use AI translation via Docsbook's translate API with human review. Alternative: temporarily disable Russian until the translation is ready."
}
```

```json
{
  "file": "docs/ru/pricing.md",
  "line": null,
  "severity": "high",
  "rule": "stale-translation",
  "found": "docs/en/pricing.md was updated 2026-04-10, docs/ru/pricing.md was last updated 2026-01-15 — 115 days behind. Pricing information may be wrong in the Russian version.",
  "suggestion": "Re-translate docs/ru/pricing.md from the current English source. Prices and plans are business-critical — add to automation pipeline or release checklist."
}
```

```json
{
  "file": "docs/es/api/workspaces.md",
  "line": 42,
  "severity": "high",
  "rule": "code-comment-translated",
  "found": "Line 42: JSON code block contains Spanish text in a comment position: `\"name\": \"// nombre del workspace\"` — invalid JSON.",
  "suggestion": "In JSON blocks, comments are not valid. Move the explanation to prose before or after the block. In TypeScript/Python, only translate `//` and `#` comments, never string values."
}
```

---

## Task-Specific Questions

When invoked directly, ask:

1. **Which languages are in scope?** (from `enabled_languages` in workspace settings)
2. **Source-of-truth language?** Usually EN — confirm.
3. **Tier 1 pages for this project?** (quick-start, pricing, auth — confirm with team)
4. **Translation workflow?** Manual / AI with review / fully automated

---

## Tool Integrations

| Tool | Purpose |
|---|---|
| `mcp__docsbook__list_workspaces` | Find workspace |
| `mcp__docsbook__get_workspace` | Get enabled languages and settings |
| `mcp__docsbook__get_doc_graph` | Full page list across all languages |
| `mcp__docsbook__read_doc_sections` | Read translation content |
| `mcp__docsbook__update_languages` | Enable/disable languages (PRO) |

---

## Related Skills

- `docs-seo` — hreflang is both i18n and SEO
- `docs-maintenance` — stale translations are a maintenance issue
- `docs-navigation-linking` — translated navigation labels
- `docs-analyze` — orchestrator
