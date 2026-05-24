---
name: docs-detect-source
description: Identify what kind of docs source you have in one call. Detects website URLs, code repositories, and existing platforms (Mintlify, GitBook, Docusaurus, Nextra) so the right builder is picked. Used internally by /docs-create or directly when you're not sure where to start.
metadata:
  version: 1.0.0
  category: creation
  requires_docsbook_mcp: false
  keywords: [detect, source, mintlify, gitbook, docusaurus, platform]
---

# docs-detect-source

Identifies the type of a documentation source so the pipeline can route to the correct skill.

## Arguments

- `$ARGUMENTS[0]` — URL or local path (required)

## Detection Logic

### If the argument looks like a URL (starts with `http`)

Fetch the page and check for platform signals in the HTML:

| Signal | Platform |
|---|---|
| `<meta name="generator" content="Mintlify">` or Mintlify CDN link | Mintlify |
| Domain contains `gitbook.io` or `<meta name="generator" content="GitBook">` | GitBook |
| `<meta name="generator" content="Docusaurus">` | Docusaurus |
| Nextra HTML structure / generator meta | Nextra |
| URL matches `github.com/{owner}/{repo}` | See GitHub repo detection below |

If none match → plain website → route to `/docs-from-site`.

### If the argument is a GitHub repo URL (`github.com/{owner}/{repo}`)

Fetch the repo's root contents via the GitHub API and look for:

| File / Directory | Platform |
|---|---|
| `mint.json` | Mintlify |
| `docs.json` | Custom docs |
| `SUMMARY.md` | GitBook |
| `docusaurus.config.js` | Docusaurus |
| `.vitepress/` directory | VitePress |
| `astro.config.*` with Starlight | Starlight |

- If a platform config file is found → route to `/docs-from-docs` with the detected platform.
- If only `README.md` and a `src/` directory are present → route to `/docs-from-code`.

### If the argument is a local path

Run:

```bash
node scripts/detect-platform.js <path>
```

Map the result to the appropriate skill name.

## Detected Types and Their Skill Mappings

| Detected type | Skill |
|---|---|
| `website` | `/docs-from-site` |
| `github-code-repo` | `/docs-from-code` |
| `mintlify-docs` | `/docs-from-docs` |
| `gitbook-docs` | `/docs-from-docs` |
| `docusaurus-docs` | `/docs-from-docs` |
| `nextra-docs` | `/docs-from-docs` |
| `vitepress-docs` | `/docs-from-docs` |
| `starlight-docs` | `/docs-from-docs` |
| `plain-markdown` | `/docs-from-docs` |

## Output

```
Detected: {type}
Recommended skill: /{skill-name}
```
