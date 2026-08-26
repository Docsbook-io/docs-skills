# Preview, publish, configure

## Preview

Print the folder tree, including folders, and excerpts from up to three representative pages plus the FAQ. A one-line summary is not a preview — the user cannot decide from it.

Then ask: "Does this look right? Type **yes** to publish, or describe what to change."

Auto-mode may skip the ask. It may never skip the preview, and it may never create a repository silently.

## Publish

1. Verify the publishing transport is authenticated **first**. If it is not, stop with `status: crawl_only`, the local path, and the exact follow-up command to run afterwards. This is a clean ending, not an error, and the crawl output is already delivered.
2. Derive the repository name from the folder name, which earlier phases set from the site brand or source repo. A placeholder-looking name (`docs-output`, `untitled`, a timestamp) means ask for a real one rather than publishing under it. Ask on a genuine collision too.
3. Initialise the repository only if it is not one already; otherwise reuse the current branch.
4. Create the repository, add the remote, push. Never overwrite an existing repository — a taken name is a stop, not a force-push.
5. **One atomic commit for all pages.** Not one commit per file.
6. Keep any branding manifest in the repository — the configuration step reads it.

If the tooling is not installed at all, return the equivalent manual commands rather than failing silently.

## Configure the live site

Hand off to `docs-manage` with everything phase 1 collected. The point is not to flip switches; it is to make the site feel like the product's own documentation:

- **Branding** — apply the collected accent, scheme, logo and icon so the docs read as a continuation of the product. Never push a default accent when extraction failed: run the branding path so it asks for a reference instead.
- **Reading affordances** — copy-page, feedback, breadcrumbs, on-page contents. These are what separate a real docs site from a rendered README.
- **Navigation** — sub-header from your top-level folders, social links in the header, a link back to the source site.
- **Discovery** — real titles and descriptions plus indexing enabled; the answer-engine layer, which is why the FAQ and use-case content exists.
- **Assistant** — a live "ask" over the docs removes the go-find-it-yourself barrier for an unsold reader. Derive its suggested questions from the pages you just created, never generic ones.

Confirm before applying. Language settings in particular can enable several languages at once and surprise people. If the platform transport is unreachable, print the connection instructions and exit cleanly — the local folder and repository URL are already delivered, so the pipeline does not fail.

## Interactive checkpoints

Six pauses, one question per turn, each waiting for an explicit answer and applied before the next phase:

1. **Source** — show the detected type and wait. A different source means re-run detection, never assume.
2. **Structure** — display the proposed tree; apply requested changes before generating any file.
3. **Enrichment** — which optional sections, which competitors, how many pages per section (default 4, allowed 3–5). No evidence for a section means say so and let the user type names or skip.
4. **Branding** — show the detected palette and let the user override before anything is written.
5. **Repository** — confirm owner and name. Propose the derived name; ask outright when none can be derived.
6. **Features** — which optional site features to enable. Apply only what was selected; never enable an extra silently.

The final report summarises every choice made at every checkpoint, including per-section enrichment counts.

## Final report

```
Local path:   docs-output/<name>/
Repository:   <url>            (or: not published — crawl_only)
Live site:    <url>            (or: not configured — <reason>)
Pages:        N across M folders
  index.md — hero
  getting-started.md — tutorial (N steps)
  concepts.md — explanation
  features/<feature>.md ×K — benefit-first
  guides/<topic>.md ×K — how-to
  use-cases.md — job stories
  faq.md — N Q&A
  reference.md — reference [if API/CLI]
Branding:     accent <hex> (from <source>) · icon <url> · logo <url or skipped>
Skipped:      <section> — <reason>
```
