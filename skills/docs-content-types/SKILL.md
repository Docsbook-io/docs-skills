---
name: docs-content-types
description: Analyzes whether each documentation page follows the Diátaxis framework — tutorial, how-to guide, reference, or explanation. Detects mixed content types, misclassified pages, and structural violations per type. Uses Docsbook MCP to access content.
metadata:
  version: 1.0.0
  category: analysis
  requires_docsbook_mcp: true
  uses_mcp_tools:
    - list_workspaces
    - get_doc_graph
    - read_doc_sections
  keywords: [diataxis, tutorial, how-to, reference, explanation, content-type]
---

# docs-content-types — Content Type Analysis (Diátaxis)

## Before Starting

1. **Get the repository.** Ask for the GitHub repo URL or `{user}/{repo}`.
2. **Check Docsbook.** Run `mcp__docsbook__list_workspaces` to find the workspace.
   - If found → use `mcp__docsbook__get_doc_graph` to get all pages.
   - If not found → offer: "This repo isn't in Docsbook yet. Want me to add it?"
3. **Check the graph.** If `get_doc_graph` returns an empty graph or no data → run `mcp__docsbook__reindex_doc_graph` to generate it, then retry. If it returns a stale warning, offer to reindex before proceeding.
3. **Read page content.** Use `mcp__docsbook__read_doc_sections` for each page to analyze its structure and writing.
4. **Classify, then check.** First determine what type the page *is*, then check if it follows that type's rules correctly.

---

## Core Principles

### 1. The four types serve four different user needs
- **Tutorial** → learning (I want to acquire a skill)
- **How-to guide** → task completion (I want to accomplish a specific goal)
- **Reference** → information lookup (I want accurate facts)
- **Explanation** → understanding (I want to know why this works)

### 2. Mixed types confuse readers
A tutorial that explains theory mid-step loses the learner. A reference page with tutorial narrative loses the expert scanning for a parameter. Keep types pure.

### 3. Type determines structure, not topic
"Authentication" can be a tutorial (set up auth step-by-step), a how-to (rotate a token), a reference (all auth parameters), or an explanation (how JWT tokens work). The same topic appears across all four.

### 4. Misclassification shows in navigation
If users can't find how-to guides because they're buried in tutorials, the navigation has a type classification problem.

---

## The Four Content Types

### Tutorial — Learning-Oriented

**Goal:** Guide a beginner through a task, building confidence and skill.

Checklist:
- [ ] Step-by-step, hands-on — reader follows along in real time
- [ ] Narrator is in control — exact commands, exact files, no choices
- [ ] Safe path — outcome is guaranteed if steps are followed
- [ ] Has a clear start state (prerequisites) and end state (what was achieved)
- [ ] Teaches by doing, not by explaining theory
- [ ] Uses imperative: "Click Save" not "You should click Save"
- [ ] No alternative paths ("you can also do X") — pick one path

**Red flags in tutorials:**
- Explaining why something works (→ move to explanation)
- "Alternatively, you can..." (→ move to how-to)
- Full parameter tables (→ move to reference)
- Assumes knowledge not declared as prerequisite
- Open-ended outcome with no concrete result

**Good tutorial title pattern:** "Build your first workspace" / "Get started in 5 minutes"

---

### How-To Guide — Task-Oriented

**Goal:** Help a competent user accomplish a specific real-world task.

Checklist:
- [ ] Assumes the reader has basic knowledge
- [ ] Focuses on one specific goal
- [ ] Can handle variation: "if X, do Y; if Z, do W"
- [ ] Skips the "why" — reader already knows
- [ ] Starts with the goal outcome, not a learning journey
- [ ] Title starts with a verb: "Configure", "Set up", "Enable", "Migrate"

**Red flags in how-to guides:**
- Teaching foundational concepts mid-task (→ link to tutorial or explanation)
- Listing every option without guiding toward a choice (→ reference)
- A single rigid path with no variation handling
- Prerequisites explained in detail (→ link to tutorial instead)

**Good how-to title pattern:** "Set up a custom domain" / "Enable multi-language support"

---

### Reference — Information-Oriented

**Goal:** Give accurate, complete, structured information. Consulted, not read linearly.

Checklist:
- [ ] Machine-like consistency — same structure for every entry
- [ ] No prose narrative — pure information
- [ ] Complete — covers all options, parameters, return values
- [ ] Neutral — no opinions, no guidance on what to choose
- [ ] Easy to scan — tables, definition lists, consistent formatting
- [ ] Accurate above all else — wrong reference = broken integrations

**Red flags in reference pages:**
- Tutorial-style narrative ("now let's look at...")
- Missing parameter entries (incomplete table)
- Inconsistent format between similar entries
- Opinions about which option to prefer (→ how-to or explanation)
- Long prose paragraphs between data entries

**Good reference title pattern:** "API endpoints" / "Configuration options" / "CLI commands"

---

### Explanation — Understanding-Oriented

**Goal:** Help the reader understand a concept, architecture, or decision.

Checklist:
- [ ] Discusses, doesn't instruct
- [ ] Answers "why" and "how does it work" — not "how to do it"
- [ ] Provides context and background
- [ ] May cover history, trade-offs, alternatives
- [ ] Can be opinionated — explain reasoning behind decisions
- [ ] Connects concepts across the documentation

**Red flags in explanation pages:**
- Step-by-step instructions (→ move to how-to)
- Complete parameter lists (→ move to reference)
- Code the reader is supposed to run (→ move to tutorial)
- No conceptual depth — just restating what things do

**Good explanation title pattern:** "How authentication works" / "Architecture overview" / "Understanding workspaces"

---

## What to Look For

| Severity | Problem | Detection Signal |
|---|---|---|
| `critical` | Page has no identifiable type — chaotic mix | No consistent goal, no coherent audience |
| `high` | Tutorial contains alternative paths | "alternatively", "another option", "you can also" |
| `high` | Reference page has tutorial-style prose | Long paragraphs between data entries |
| `high` | How-to guide teaches foundational concepts | "First, let's understand what X is..." |
| `high` | Tutorial assumes undeclared knowledge | Technical terms appear without introduction |
| `medium` | Tutorial title is a noun, not action-oriented | Title doesn't start with verb or learning phrase |
| `medium` | Explanation page contains step-by-step instructions | Numbered list with imperative verbs |
| `medium` | How-to has rigid single path, no variation | No conditional logic, no "if X, do Y" |
| `low` | Large page that serves two distinct audiences | Should be split into two pages |
| `low` | Tutorial missing prerequisites / "what you'll learn" section | No setup checklist at top |

---

## Output Format

```json
{
  "type": "mixed_content_type",
  "severity": "high",
  "skill": "docs-content-types",
  "location": "docs/guides/authentication.md",
  "found": "Page starts as a tutorial (step-by-step setup) but includes a full parameter reference table at the end. These serve different audiences at different moments.",
  "suggestion": "Split into: (1) 'Set up authentication' — how-to for the steps, and (2) 'Authentication reference' — reference page for all parameters. Link between them at the bottom of each.",
  "action": "split_page",
  "constraints": {
    "into": ["how-to", "reference"]
  }
}
```

```json
{
  "type": "tutorial_branching",
  "severity": "high",
  "skill": "docs-content-types",
  "location": "docs/quick-start.md#line-45",
  "found": "'Alternatively, you can use the CLI instead of the UI.' — tutorials should not offer alternatives; pick the best beginner path.",
  "suggestion": "Remove the alternative. Move CLI instructions to a separate how-to: 'Create a workspace via CLI'. Link to it at the end of the tutorial.",
  "action": "remove_alternative_path",
  "constraints": {}
}
```

```json
{
  "type": "explanation_contains_instructions",
  "severity": "medium",
  "skill": "docs-content-types",
  "location": "docs/concepts/workspaces.md#line-67",
  "found": "Lines 67-89 contain numbered step-by-step instructions inside a concept explanation page. Readers looking for concepts are disrupted by procedural steps.",
  "suggestion": "Extract the steps into a how-to: 'Create your first workspace'. Replace them here with a link: 'To create a workspace, see [Create your first workspace](...)'",
  "action": "extract_to_new_page",
  "constraints": {
    "target_type": "how-to"
  }
}
```

---

## Task-Specific Questions

When invoked directly, ask:

1. **Which pages to analyze?** All, or specific sections (guides / reference / concepts)?
2. **Does the project have a naming convention for types?** (e.g., `/guides/` = how-to, `/concepts/` = explanation)
3. **Are there pages suspected of misclassification?** Start there.
4. **Primary audience?** (developers / end users) — affects strictness on assumed knowledge.

---

## Tool Integrations

| Tool | Purpose |
|---|---|
| `mcp__docsbook__list_workspaces` | Find if repo is indexed |
| `mcp__docsbook__create_workspace` | Add repo to Docsbook if missing |
| `mcp__docsbook__get_doc_graph` | Get full page list and structure |
| `mcp__docsbook__read_doc_sections` | Read page content for classification |

---

## Related Skills

- `docs-structure-templates` — heading hierarchy within each type
- `docs-style-tone` — tone differs per type (tutorial = encouraging, reference = neutral)
- `docs-audience` — audience targeting per type
- `docs-navigation-linking` — navigation should group by type
- `docs-analyze` — orchestrator that runs all skills
