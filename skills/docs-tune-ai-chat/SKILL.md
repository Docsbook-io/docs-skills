---
name: docs-tune-ai-chat
description: Improve your docs AI chat from real failure signals. Pulls 30 days of negative feedback and unanswered questions, clusters them by topic, and proposes an updated system_prompt — applied via MCP only after you confirm the diff. PRO plan.
metadata:
  version: 1.0.0
  category: automation
  requires_plan: pro
  requires_docsbook_mcp: true
  uses_mcp_tools:
    - get_negative_feedback
    - get_ai_unanswered
    - set_chat_system_prompt
  keywords: [ai, chat, tuning, feedback, system-prompt]
---

# docs-tune-ai-chat — Tune AI Chat System Prompt from Real Feedback

## What this skill does

Analyzes 30 days of AI chat negative feedback and unanswered questions for a Docsbook workspace, clusters them by topic, generates an improved `system_prompt` suggestion, and — after the user confirms the diff — writes it back via MCP.

## Requirements

- Workspace must be on **PRO** plan or higher (AI chat must be enabled).
- Docsbook MCP must be authorized for the target workspace.
- The workspace must have at least some AI chat traffic over the last 30 days; otherwise there's nothing to tune.

## Before starting

1. Ask the user for the workspace (GitHub repo URL or `{user}/{repo}`).
2. Verify the workspace exists and is on PRO/PRO+. If on Free — stop and tell the user to upgrade.
3. Confirm the user wants to *change* the system prompt (this is a write operation).

---

## Steps

### 1. Pull negative feedback (30 days)

Call `mcp__docsbook__get_negative_feedback` with:

- `workspace_id`: the target workspace
- `days`: `30`

Each item should include: the user question, the AI answer, the page context, and (where available) the user's free-text reason for the thumbs-down.

If the result is empty → skip to step 2; if step 2 is also empty → stop and tell the user there's nothing to tune yet.

### 2. Pull unanswered AI questions (30 days)

Call `mcp__docsbook__get_ai_unanswered` with:

- `workspace_id`: the target workspace
- `days`: `30`

These are questions where the AI explicitly said "I don't know" / "not in the docs" / refused, or where retrieval returned nothing useful.

### 3. Cluster by topic

Group the combined items (negative + unanswered) into 3–8 topic clusters. Use one of:

- **LLM clustering** (preferred): give the model the full list of questions and ask for tight topic labels with counts.
- **Keyword clustering** (fallback): tokenize, lowercase, drop stopwords, group by shared 2–3-gram or stem overlap.

For each cluster record: `label`, `count`, `sample_questions` (3 max), `inferred_gap` (one sentence — what does the current chat fail to do here?).

### 4. Generate a new `system_prompt` suggestion

Fetch the current `system_prompt` from the workspace (via the workspace settings — `mcp__docsbook__get_workspace` or the AI settings tool used by the current MCP build).

Then produce a *minimally invasive* replacement that:

- **Keeps** any existing brand voice, persona, language constraints, and refusal rules that aren't part of the problem.
- **Adds** explicit guidance for the top 3–5 clusters (e.g. "When users ask about pricing tiers, always link to /pricing and cite the exact monthly/lifetime numbers from constants.").
- **Strengthens** instructions to *say "this isn't in the docs yet" with a concrete next step* whenever retrieval is empty (this addresses the unanswered cluster directly).
- Stays under ~1,500 tokens. Prompts longer than that degrade chat quality.

### 5. Show the diff to the user

Render a clear before/after comparison:

```
--- current system_prompt
+++ proposed system_prompt
@@ ...
```

Below the diff, summarize **why** each chunk changed, mapping additions back to the clusters from step 3 (e.g. `+ pricing guidance — cluster "pricing/upgrades" (14 negative + 9 unanswered)`).

Ask explicitly: **"Apply this new system_prompt? (yes / no / edit)"**

- `yes` → step 6.
- `no` → stop, output the proposal as plain text for manual use.
- `edit` → let the user revise inline, then loop back to step 5.

### 6. Apply on confirmation

Only after explicit `yes`, call:

`mcp__docsbook__set_chat_system_prompt` with:

- `workspace_id`: the target workspace
- `system_prompt`: the confirmed new prompt

Then output:

- ✅ confirmation that the prompt was updated
- Timestamp
- A short note that the user should re-run this skill in ~2–4 weeks to see whether the negative-feedback / unanswered counts dropped.

---

## Guardrails

- **Never** call `set_chat_system_prompt` without explicit `yes` from the user. This is a destructive write — it replaces the prompt for all chat sessions on this workspace.
- **Never** invent feedback that isn't in the MCP response. If both feedback sources are empty, stop — don't fabricate clusters.
- **Don't** strip the user's existing persona/brand instructions. Only add and refine; replace only when a specific instruction is *causing* the negative feedback.
- If the proposed prompt exceeds 1,500 tokens, compress before showing the diff.

## Output

Final message to the user includes:

1. Cluster summary (table: label, count, sample question).
2. The before/after diff.
3. Apply / skip decision and result.
4. Suggested re-tune date (today + 3 weeks).
