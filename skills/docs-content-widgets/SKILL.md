---
name: docs-content-widgets
description: Turn flat markdown sections into rich rendered blocks — card grids, accordions, steppers, playgrounds, call-to-action blocks — using invisible HTML-comment markers that keep the source readable as ordinary markdown on GitHub and everywhere else. Use when a page reads as a wall of links, a long stack of headed sections, an unnumbered procedure, or ends without a next step.
metadata:
  version: 2.0.0
  category: creation
  mode: platform
  accelerated_by:
    - docsbook-mcp      # list_content_widgets returns the live widget catalog + exact markdown contract
  uses_mcp_tools:
    - list_content_widgets
  keywords: [widgets, cards, accordion, stepper, layout, hub-page, faq, troubleshooting, presentation]
---

# docs-content-widgets — Rich Blocks Inside Markdown

## The idea

A content widget marks a region of **ordinary markdown** to be rendered as a UI block. The markers are HTML comments, so they are invisible in every markdown reader:

```markdown
<!-- widget:NAME -->

…ordinary markdown…

<!-- /widget -->
```

Two properties make this safe to use anywhere:

- **The source stays plain markdown.** The comments are invisible on GitHub, in an editor preview, in `cat`. A reader who never sees the rendered site still sees a correct, complete page with the same headings and the same links.
- **It degrades, never hides.** An unknown widget name, a missing closing marker, or a renderer that doesn't exist yet leaves the content as normal markdown. Nothing between the markers can ever disappear from the page.

Never put JSON, YAML, or configuration **between** the markers. The region must read as meaningful prose on its own — the widget is a presentation upgrade applied on top, not a data format. (A widget may accept layout switches **on** the opening marker, e.g. `<!-- widget:NAME cols=2 -->`; that is not a contradiction — the marker is already invisible, the region between the markers stays pure markdown. The catalog says which switches each widget reads.)

## Read the catalog first — this skill deliberately does not list the widgets

🔴 **Get the live set before you write a single marker: call `list_content_widgets`.** It returns, for every widget the workspace actually has: its name, what it renders, when to reach for it, its exact markdown contract, and a copy-pasteable example.

This skill states the *rules* for choosing and applying a widget. It does not carry an inventory of widget names or contracts, and you should not add one:

- **The set grows.** Renderers ship on the product's release cycle, not this skill's. Any list written here is wrong the week after it is written, and a stale list is worse than none: it teaches you to reach for four widgets when the workspace has eight, so the best fit is never even considered.
- **Contracts have REQUIRED parts.** A widget used with a required piece missing renders *worse* than plain markdown — a card grid with no icons is a row of empty grey tiles. The catalog is the only place those requirements are stated correctly.
- **The set is per workspace.** An owner can switch a widget off in the admin panel. A marker for a switched-off widget is not an error and loses nothing, but it also does nothing — you would be reporting work you did not do.

**No `list_content_widgets` available?** Do not guess a widget name from memory or from another site's syntax. Write the region as clean plain markdown and say in your report that widgets were skipped because the catalog was unreachable. Plain markdown is always a correct answer; an invented marker name is silently ignored, which looks exactly like success.

## Choosing a widget — match the shape, not the vibe

Read the catalog's `useWhen` for each widget and match it against what is actually on the page. The rules below decide *whether* to reach for one at all; they are stable because they are about readers, not about renderers.

**Reach for a widget when the page's existing structure already IS the shape a widget renders.** The test: could you describe the region in one structural sentence — "several headed sections, each holding a list of links with one line of context", "many sibling headings, each independent", "an ordered procedure", "an endpoint and its parameter table", "a closing action and its link"? If yes, look for a widget whose contract consumes that shape. If you cannot describe it structurally, there is nothing to wrap.

**Never reshape content to fit a widget.** Wrapping is additive: you add two marker lines. Changing the words, the headings, or the order is a separate edit with its own justification. A widget that requires rewriting the section is the wrong widget.

**Do not use a widget when:**

- The page is read start-to-finish. A tutorial, a concept explainer, or a narrative guide loses its thread when chopped into tiles or collapsed rows.
- Sections depend on each other. Collapsing step 3 of a sequence hides what the reader needs at step 4.
- There are fewer than three items. Two cards is a worse-looking list.
- The content is the page's primary substance. Never collapse what the reader came for — a collapsing widget is for material they scan past.
- The underlying markdown is weak. Link lists with no descriptions, headings that say nothing. A widget makes bad structure *more* visible, not less. Fix the content first.
- You are trying to make a thin page look substantial. Three links in a grid is still three links.

## Applying one

1. **Get the catalog** (`list_content_widgets`). Read the chosen widget's `markdownContract` in full — every line of it, including the parts marked REQUIRED — and its `example`.
2. **Check the region already reads well** as plain markdown, before any marker.
3. **Wrap, don't rewrite.** Add the two marker lines. Follow the contract completely; a partially-followed contract renders worse than no widget.
4. **Use a layout switch only if the catalog documents one for that widget**, and only when the default is visibly wrong for this content. An unrecognised switch is ignored, so a switch invented from another platform's syntax silently does nothing.
5. **Verify both renderings.** Confirm the page still reads correctly as raw markdown — that is what GitHub and every AI crawler see — and that the rendered block groups the content the way you intended.

## Guardrails

- **Markers go on their own line**, with a blank line separating them from the content.
- **Never nest widgets.** An outer range containing another marker is left as plain markdown.
- **One widget per region**, and no more than two per page. Wrapping an entire long page in a single widget is almost always wrong — pick the section that has the right shape.
- **Check the raw markdown after editing.** If the region no longer reads correctly without the renderer, the edit went too far.

## Output

Report per page:

- Path, widget applied, and the line range wrapped.
- Which structural shape matched, and which catalog entry you matched it against.
- Any page you considered and rejected, with the reason — a rejected candidate is a useful finding.
- Whether the catalog was read live, or was unreachable and widgets were skipped.
