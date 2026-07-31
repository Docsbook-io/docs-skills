# docs-skills — Documentation Analysis Skills

This project includes 11 AI agent skills for documentation analysis.

## Available skills

| Skill | Trigger | Description |
|---|---|---|
| `docs-analyze` | "analyze docs", "docs audit", "review documentation" | Runs all 10 sub-skills, produces unified report |
| `docs-content-types` | "check content types", "Diátaxis audit" | Tutorial/how-to/reference/explanation classification |
| `docs-structure-templates` | "check structure", "frontmatter audit" | Frontmatter, heading hierarchy, code blocks |
| `docs-style-tone` | "check style", "tone review" | Active voice, filler words, terminology |
| `docs-audience` | "audience check", "vocabulary audit" | Vocabulary mismatch, assumed knowledge |
| `docs-navigation-linking` | "check links", "broken links" | Orphan pages, broken links, anchor text |
| `docs-seo` | "docs SEO", "SEO audit" | Title/description, topic clusters, AI Overviews |
| `docs-ai-retrieval` | "get cited by AI", "AEO/GEO", "optimize for ChatGPT" | Passage-level writing for LLM retrieval + citation |
| `docs-accessibility` | "a11y check", "accessibility audit" | WCAG 2.1 AA from markdown source |
| `docs-i18n` | "i18n audit", "translation check" | Multilingual parity, hreflang, staleness |
| `docs-media` | "check images", "media audit" | Images, alt text, file sizes, diagrams |
| `docs-maintenance` | "stale docs", "maintenance audit" | TODO/FIXME, deprecated pages, stale content |

## How to use

When the user asks to analyze documentation for a GitHub repo:
1. Ask for the repo URL if not provided
2. Use the Docsbook MCP tools to fetch the doc graph
3. Run the appropriate skill(s) based on the request

## MCP setup

```
mcp add --transport http https://docsbook.io/api/mcp/server
```

Full skill definitions are in `skills/*/SKILL.md`.
