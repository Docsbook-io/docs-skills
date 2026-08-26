# Using docs-skills with Claude Code

## 1. Install the skills

```bash
npx skills add Docsbook-io/docs-skills --skill '*'
```

Four skills land in your project. Nothing else is required — they work on a plain docs folder.

## 2. Optional: connect a workspace

```bash
mcp add --transport http https://docsbook.io/api/mcp/server
```

Authenticate in the browser when prompted. This adds real search positions, reader behaviour and
applied site configuration. The skills work without it; they get sharper with it.

## 3. Ask in plain language

You do not need the slash command — describe the job and the right skill picks itself up.

```
Audit our docs and give me one prioritized report
```

```
Turn github.com/acme/widget into a live docs site
```

```
Our search returns results and nobody clicks them — fix the titles
```

```
Stop our docs drifting out of sync with the code
```

Or name the skill directly:

```
/docs-analyze
/docs-create
/docs-manage
/docs-automate
```

## Example: an analysis run

`docs-analyze` starts from the numbers, not from the pages — so the report opens with what the data
covers, and every finding carries the counts behind it.

```
Period: last 7 days · 1,240 visits · search data 4–31 Jul, as of 30 Jul
Tier: search positions + reader behaviour. No ranked fix digest on this plan —
it would add the "what to write" items this queue cannot see.

#1  docs/api/authentication.md — position 8.4 for "how to authenticate api requests"
    Why now:   1,840 people saw this result in the window; 11 clicked. The title they
               saw is "Authentication", which shares no words with what they typed.
    Effort:    S (title, description, opening line)
    Effect:    organic clicks on this page, measured against the untouched pages
    Fix:       title: "How to authenticate API requests | Acme" (52 chars)
               description: "Authenticate API requests to Acme using Bearer tokens.
               Get your key from workspace settings in under a minute." (118 chars)
               opening line: "Authenticate every request with a Bearer token in the
               Authorization header."

#2  docs/billing/invoices.md — 58 of 412 readers gave up here
    Why now:   the largest single loss in the set; readers searched twice and left
    Effort:    M (rewrite of one section)
    Effect:    dead-end rate on this page 14% → under 8% within two weeks
    Owner:     docs-manage, after reading the journeys

#3  "sso saml setup" — unanswered 23×, zero results 11× (two signals agree)
    Why now:   no page covers it
    Owner:     docs-create

Not this week: 14 pages below the cut, all under 40 visits.
Excluded as noise: 6 pages scoring badly on fewer than 5 events.

Apply these where? (1) a pull request  (2) show me each diff to approve  (3) write directly
```

That last line is the gate. Nothing is written until you answer it.
