---
name: docs-generate-agents-md
description: Give every AI agent in your repo the same context about your docs. Reads your Docsbook workspace and writes an AGENTS.md at repo root so Claude Code, Cursor, Codex, Copilot and Gemini CLI all start each session knowing the docs URL, languages, AI-chat conventions and available @docs-skills commands.
metadata:
  version: 1.0.0
  category: publishing
  requires_docsbook_mcp: true
  requires_plan: free
  uses_mcp_tools:
    - get_workspace
    - get_doc_graph
  produces_files:
    - AGENTS.md
  keywords: [agents.md, system prompt, onboarding, agent context, docsbook, mcp, setup]
---

# docs-generate-agents-md — Generate AGENTS.md from a Docsbook workspace

## Workflow

1. Verify MCP is available. If not, print the connection command and exit gracefully.
2. Read workspace settings: docs URL (custom domain or computed), docs path, enabled languages, AI chat status, and plan tier. If the workspace does not exist, stop and instruct the user to run `/docs-setup-workspace` first.
3. Read the doc graph to extract top-level folder structure and total page count. If the call fails, continue with an empty structure — the template handles missing data.
4. Render the AGENTS.md template using the collected data: site URL, owner/repo, docs path, languages, AI-chat status, folder structure summary.
5. Write the file to the repo root. If AGENTS.md already exists, locate the managed section by its markers and replace only that section. If no markers exist, append under them. Never touch content outside the markers.
6. Report the file path, Docsbook URL, languages, and AI chat status. Remind the user to commit the file.

## Guardrails

- Never overwrite content outside the managed section markers.
- If the workspace is missing, do not attempt to create it — redirect to `/docs-setup-workspace`.
- If the doc graph call fails on a plan restriction, continue with an empty structure rather than aborting.
- The file is written to the repo root, not to the docs folder.

## MCP Tools

| Tool | Purpose |
|------|---------|
| `list_workspaces` | Verify MCP transport is available |
| `get_workspace` | Read workspace settings (URL, language, AI, plan) |
| `get_doc_graph` | Read top-level folder structure and page count |

## Acceptance Criteria

- [ ] MCP transport verified before reading workspace
- [ ] Workspace settings read without prompting the user
- [ ] Doc graph retrieved or gracefully skipped on failure
- [ ] AGENTS.md written to repo root (or managed section updated)
- [ ] Content outside managed markers left untouched
- [ ] User reminded to commit the file
