---
name: docs-create-interactive
description: Same as /docs-create, but with you in the loop. Pauses at five checkpoints — source detection, structure review, branding, languages, domain — so you can adjust before publishing. Use when you want full control over what ships.
metadata:
  version: 1.0.0
  category: creation
  requires_docsbook_mcp: false
  keywords: [create, interactive, pipeline, checkpoints, customize]
---

# docs-create-interactive — Guided docs pipeline with checkpoints

## Workflow

1. Run `/docs-detect-source` logic. Show the detected type and wait for user confirmation before continuing. Re-run if the user points to a different source.
2. Plan the full file structure. Display the proposed tree and wait for approval or modification requests. Apply changes before generating any files.
3. Extract branding (accent color, background, theme scheme, favicon). Show detected values and let the user override before writing the branding file.
4. Before publishing, confirm the GitHub owner and repo name. Update if the user provides a different name.
5. Before configuring Docsbook, ask which optional features to enable (AI chat, multi-language, custom domain, SEO). Apply only the selected ones.
6. Report the outcome with a summary of every choice made at each checkpoint.

## Guardrails

- Never skip a checkpoint — each pause is intentional and must wait for explicit user input.
- If the user types a different source at checkpoint 1, re-run detection instead of assuming.
- Apply only features the user explicitly selected at checkpoint 5; do not enable extras silently.
- If MCP is unavailable at the Docsbook step, print connection instructions and continue — do not block the final report.

## Acceptance Criteria

- [ ] Each of the 5 checkpoints reached and acknowledged by the user
- [ ] File structure reflects any modifications requested at checkpoint 2
- [ ] Branding file contains user-confirmed values
- [ ] GitHub repo name matches what was confirmed at checkpoint 4
- [ ] Only user-selected Docsbook features are enabled
- [ ] Final report includes a summary of all choices made
