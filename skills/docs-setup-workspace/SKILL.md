---
name: docs-setup-workspace
description: Configure a fresh Docsbook workspace from one command. Wires branding, UI toggles, AI chat, SEO, languages and custom domain via Docsbook MCP — the natural follow-up to /docs-publish. Falls back to printed setup instructions if MCP isn't connected.
metadata:
  version: 2.0.0
  category: publishing
  requires_docsbook_mcp: true
  requires_plan: free
  uses_mcp_tools:
    - list_workspaces
    - get_workspace
    - create_workspace
    - update_branding
    - update_ui_settings
    - update_navigation
    - update_seo
    - update_geo
    - update_aeo
    - update_languages
    - update_ai_settings
    - update_domain
  keywords: [setup, workspace, branding, configure, docsbook, mcp]
---

# docs-setup-workspace — Configure a Docsbook workspace via MCP

Configuration is not a checklist of flags to flip — it is what turns a published folder into a site that **feels like the product's own documentation**. Approach each setting by its purpose (what it does for an unsold visitor), and apply the *maximum* the connected plan allows. Everything here is available to the connected agent through the Docsbook MCP; reach for the whole arsenal, not just branding.

## Workflow

1. Confirm the MCP transport is up (e.g. by listing workspaces). If it fails for non-auth reasons, print the MCP connection command and exit gracefully.
2. Check whether the workspace already exists before creating one — Docsbook auto-indexes repos within seconds of a push.
3. Read branding values from `_branding.json` (or the signals collected during generation) if present. Never fall back to an invented accent color — if no signal exists, skip the color rather than shipping a generic default.
4. Apply settings in priority order, each toward its purpose: **navigation** (Free, always) → **branding** (Free) → **UI affordances** (Free) → **SEO/GEO/AEO/AI/languages** (plan-gated). The Free three alone already lift the site well above a raw README — never stop after just branding.
5. **SEO/GEO/AEO (plan-gated) — content *and* the switch together.** Enable the flags themselves, not just titles/descriptions: the flag is what makes the platform emit rich JSON-LD (and `FAQPage`/`HowTo` for AEO). Enabling AEO on prose with no Q&A/step sections adds nothing — so this pairs with the FAQ/use-case content the generator wrote. If the underlying tool only writes content with no enable toggle, tell the user those need enabling manually. Never assume a flag is already on.
6. **AI chat (plan-gated) — the highest-leverage affordance.** A live "Ask AI" over the docs lets an unsold visitor get an answer instead of hunting through pages — it is the single strongest wow-factor of a great docs site. Configure it, and derive 3 suggested questions from the *actual pages just created* (from H1s / the quick-start / setup pages) — never generic ones like "What is this product?". Skip a field silently only if the tool has no slot for it.
7. Catch each plan-gated failure individually; record it in the result but do not abort the rest of the run.
8. Report which sections were applied, which were plan-gated (and what enabling them would add), and any warnings.

## Guardrails

- Never abort the whole run on a plan-limit (402) error — branding, UI, and navigation still apply on Free.
- **Never stop after branding.** The Free trio (branding + UI affordances + navigation) is the minimum that makes a site feel real — apply all three every run, then reach for the plan-gated ones.
- Set `defaultTheme` to `"system"` if the source had a theme toggle; otherwise pin to the detected scheme.
- Always set navigation (sub-header + social links + back-link to source) even on Free — high-value and always available.
- Enable AEO/GEO/SEO flags only where the content supports them — pair the AEO flag with real FAQ/step content, don't blind-enable on bare prose (invalid schema can be penalized).
- Never overwrite human-set branding already on the workspace — read it first; if an accent is already set (non-null, non-default), skip the color update and say so.
- MCP transport is HTTP (hosted), not stdio — do not confuse it with local MCP servers.
- If the workspace is not yet indexed after creation, retry once after a short wait before reporting failure.

## MCP Tools — reach for the whole arsenal, each toward its purpose

Plan column: **Free** applies on any connected workspace; **PRO+** is plan-gated (apply if allowed, otherwise tell the user what it would add). "Purpose" is the *why for an unsold visitor*, not the mechanics.

| Tool | Plan | Purpose (what it does for the reader) |
|------|------|---------|
| `list_workspaces` / `get_workspace` | Free | Verify transport; read current settings so you never overwrite human-set values |
| `create_workspace` | Free | Create the workspace for `owner/repo` if it does not exist |
| `update_branding` | Free | **Docs read as a continuation of the product**, not a sandbox — accent, logo (≠ favicon), icon, theme from the source |
| `update_ui_settings` | Free | **Production affordances** — copy-page, feedback widget, breadcrumbs, on-page TOC, search. This is what makes a site feel GitBook/Mintlify-class, not a raw README |
| `update_navigation` | Free | **No dead ends** — sub-header from the top-level folders, social links in the header, back-link to the source site |
| `update_seo` | PRO+ | **Indexability** — real titles/descriptions AND the SEO flag on, so pages actually rank |
| `update_geo` | PRO+ | **AI Overviews** — direct-answer-first content signals so Google's AI surface can lift the page |
| `update_aeo` | PRO+ | **Citability in LLM answers** — emits `FAQPage`/`HowTo` from the FAQ/use-case content; the strongest lever for ChatGPT/Perplexity citations |
| `update_ai_settings` | PRO+ | **Live "Ask AI"** over the docs — removes the "go find it yourself" barrier; suggested questions derived from the real pages, never generic |
| `update_languages` | PRO+ | Multilingual reach (enables 4 languages by default — confirm outside auto-mode) |
| `update_domain` | PRO+ | Custom domain — the docs live under the product's own brand |

## Acceptance Criteria

- [ ] MCP transport verified before any workspace mutation
- [ ] Existing workspace detected rather than double-created
- [ ] Branding applied (from file or sensible defaults)
- [ ] UI settings applied with standard preset
- [ ] Navigation section applied on every run regardless of plan
- [ ] SEO/GEO/AEO flags enabled (not just content fields), if the tool supports it
- [ ] AI chat custom questions derived from actual created pages, not invented
- [ ] Plan-gated failures recorded but do not block the result
- [ ] Result lists applied sections, plan-gated sections, and warnings
