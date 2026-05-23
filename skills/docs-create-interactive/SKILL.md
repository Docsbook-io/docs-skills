---
name: docs-create-interactive
description: Full pipeline with interactive checkpoints — detects source, builds docs, lets you review structure before publishing, customize branding, and choose languages and domain. L2 entry point for users who want control. Same power as /docs-create but with stops at key decisions.
metadata:
  version: 1.0.0
  category: creation
  requires_docsbook_mcp: false
  keywords: [create, interactive, pipeline, checkpoints, customize]
---

# docs-create-interactive

Same pipeline as `/docs-create` but pauses at five checkpoints so the user can review and adjust before each major action.

## Arguments

- `$ARGUMENTS[0]` — URL or GitHub repo (required)
- `$ARGUMENTS[1]` — output name / repo name (optional)

## Checkpoint 1 — Source Detection

Run the `/docs-detect-source` logic inline. After detecting the source type, show the result and ask:

```
Detected: {type}
Proceed with /docs-from-{type}? (yes / use different source)
```

Wait for confirmation before continuing. If the user provides a different source, re-run detection on it.

## Checkpoint 2 — Structure Review

After planning the docs structure (but before creating any files), display the full proposed file tree and ask:

```
Here's the planned structure:

{file tree}

Proceed as-is or modify? (list files you want added / removed / renamed)
```

Wait for response. Apply any requested changes to the plan before generating files.

## Checkpoint 3 — Branding

After extracting branding from the source, show the detected values and ask:

```
Detected colors:
  accent:  {color}
  theme:   {scheme}
  favicon: {url or "none"}

Use these or provide custom values?
```

Accept custom hex colors, theme name (`light` / `dark` / `system`), or favicon URL. Apply before writing `_branding.json`.

## Checkpoint 4 — Publish Target

Before running `git push`, confirm:

```
Will publish to: github.com/{owner}/{repo-name}
Proceed? (yes / change name)
```

If the user provides a different name, update the repo name before creating.

## Checkpoint 5 — Docsbook Features

Before applying Docsbook settings, ask which optional features to enable:

```
Which Docsbook features do you want to enable?
  [1] AI chat          (requires PRO plan — $150 lifetime)
  [2] Multi-language   en + zh, ja, ru by default — or specify your own
  [3] Custom domain    docs.yourcompany.com (requires PRO plan)
  [4] SEO optimization (requires PRO plan)

Enter numbers separated by commas, or "all" / "none":
```

Apply only the selected features. For custom language choice, accept a comma-separated list of language codes.

## Final Report

Same format as `/docs-create`, plus a summary of all choices made at checkpoints:

```
✅ Done!

📁 Local:    docs-output/{name}/
🐙 GitHub:   https://github.com/{owner}/{name}
📚 Docsbook: https://docsbook.io/{owner}/{name}

Pages created: N
Source type: {type}

Choices made:
- Structure: {as-is | N files modified}
- Branding: accent #{color}, theme: {scheme}
- Features: AI chat, SEO, languages (en, zh, ja, ru)
```
