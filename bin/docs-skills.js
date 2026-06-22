#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

const SKILLS_SRC = path.join(__dirname, '..', 'skills');

/**
 * Recursively find all skill directories under baseDir.
 * A skill directory is any directory that directly contains a SKILL.md file.
 * Returns array of { name, srcPath } sorted by name.
 */
function discoverSkills(baseDir) {
  const found = [];
  const seen = new Set();

  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    if (entries.some(e => e.isFile() && e.name === 'SKILL.md')) {
      const name = path.basename(dir);
      if (seen.has(name)) {
        console.warn(`[docs-skills] WARNING: skill name collision for "${name}" at ${dir} — skipping`);
        return;
      }
      seen.add(name);
      found.push({ name, srcPath: dir });
      return;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name));
      }
    }
  }

  walk(baseDir);
  return found.sort((a, b) => a.name.localeCompare(b.name));
}

const SKILL_DESCRIPTIONS = {
  // Create
  'docs-create':              'L1 pipeline — detect → build → publish → Docsbook (minimal questions)',
  'docs-create-interactive':  'L2 pipeline — same as docs-create with interactive checkpoints',
  'docs-from-site':           'Build docs from a website URL (crawl + extract + structure)',
  'docs-from-code':           'Build docs from a GitHub code repo (README, JSDoc, examples)',
  'docs-from-docs':           'Migrate from Mintlify / GitBook / Docusaurus / Nextra / VitePress',
  'docs-publish':             'Publish docs folder to GitHub (git init + gh repo create + push)',
  'docs-setup-workspace':     'Configure Docsbook workspace via MCP (branding, AI, SEO, languages)',
  'docs-detect-source':       'Detect source type: website / code-repo / docs-platform',
  'docs-branding':            'Apply branding guidelines to documentation',
  'docs-imagine':             'Generate images and diagrams for documentation',
  'docs-gap-finder':          'Find documentation gaps from failed searches and AI questions',
  'docs-strategy-plan':       'Build a documentation strategy plan',
  'docs-first-run-enrichment':'Enrich first-run documentation experience',
  'docs-generate-agents-md':  'Generate AGENTS.md from Docsbook workspace settings',
  // Analyse
  'docs-analyze':             'Orchestrator — runs all sub-skills, produces a unified report',
  'docs-content-types':       'Diátaxis classification (tutorial / how-to / reference / explanation)',
  'docs-structure-templates': 'Frontmatter, heading hierarchy, code block conventions',
  'docs-style-tone':          'Active voice, filler words, terminology consistency',
  'docs-audience':            'Vocabulary mismatch, assumed knowledge gaps',
  'docs-navigation-linking':  'Orphan pages, broken links, anchor text quality',
  'docs-seo':                 'Title/description, topic clusters, AI Overviews compatibility',
  'docs-accessibility':       'WCAG 2.1 AA from markdown — alt text, heading order, link text',
  'docs-i18n':                'Multilingual parity, hreflang, translation freshness',
  'docs-media':               'Images, screenshots, diagrams, missing captions, large files',
  'docs-maintenance':         'Stale content, deprecated pages, TODO/FIXME markers',
  // Automation
  'docs-enable-translation':  'Enable AI auto-translation for Docsbook workspace',
  'docs-pr-check':            'GitHub Actions workflow to check docs on PRs',
  'docs-release-announce':    'Announce GitHub releases to Slack/email via webhook',
  'docs-stale-watcher':       'Watch for stale documentation and open issues',
  'docs-sync':                'Sync documentation across repositories',
  'docs-translate-webhook':   'Handle translation webhooks from Docsbook',
  'docs-tune-ai-chat':        'Tune AI chat behavior for Docsbook workspace',
  // Growth
  'docs-audience-enricher':   'Enrich audience targeting for documentation',
  // Observability
  'docs-engagement-analyzer': 'Analyze documentation engagement metrics',
  'docs-funnel-mapper':       'Map user funnel through documentation',
  'docs-link-click-analyzer': 'Analyze link click patterns in documentation',
  'docs-question-clusterer':  'Cluster user questions from AI chat logs',
  'docs-utm-analyzer':        'Analyze UTM parameters for documentation traffic',
  'docs-visitor-cohort':      'Analyze visitor cohorts for documentation',
};

const [,, cmd, ...args] = process.argv;

switch (cmd) {
  case 'install': {
    const installScript = path.join(__dirname, '..', 'install.js');
    process.argv = [process.argv[0], installScript, args[0]].filter(Boolean);
    require(installScript);
    break;
  }

  case 'list': {
    const skills = discoverSkills(SKILLS_SRC);
    console.log(`\ndocs-skills — ${skills.length} documentation skills\n`);
    for (const { name } of skills) {
      const desc = SKILL_DESCRIPTIONS[name] || '(no description)';
      console.log(`  /${name.padEnd(32)} ${desc}`);
    }
    console.log('\nRun `docs-skills info <skill>` for full skill definition.');
    console.log('Run `docs-skills install` to add skills to your project.');
    console.log('Run `docs-skills convert-mdx <dir>` to convert MDX to Markdown.');
    console.log('Run `docs-skills crawl <url> [output-dir]` to crawl a website.\n');
    break;
  }

  case 'convert-mdx': {
    const inputPath = args[0];
    if (!inputPath) { console.error('Usage: docs-skills convert-mdx <file-or-dir> [output-dir]'); process.exit(1); }
    const script = path.join(__dirname, '..', 'scripts', 'mdx-to-md.js');
    process.argv = [process.argv[0], script, inputPath, args[1]].filter(Boolean);
    require(script);
    break;
  }

  case 'crawl': {
    const url = args[0];
    if (!url) { console.error('Usage: docs-skills crawl <url> [output-dir] [--max-pages=N]'); process.exit(1); }
    const script = path.join(__dirname, '..', 'scripts', 'crawl-site.js');
    process.argv = [process.argv[0], script, ...args];
    require(script);
    break;
  }

  case 'detect-platform': {
    const dir = args[0] || process.cwd();
    const script = path.join(__dirname, '..', 'scripts', 'detect-platform.js');
    process.argv = [process.argv[0], script, dir];
    require(script);
    break;
  }

  case 'info': {
    const skillName = args[0];
    if (!skillName) {
      console.error('Usage: docs-skills info <skill-name>');
      process.exit(1);
    }
    const skills = discoverSkills(SKILLS_SRC);
    const skill = skills.find(s => s.name === skillName);
    if (!skill) {
      const allNames = skills.map(s => s.name).join(', ');
      console.error(`Unknown skill: ${skillName}`);
      console.error(`Available: ${allNames}`);
      process.exit(1);
    }
    console.log(fs.readFileSync(path.join(skill.srcPath, 'SKILL.md'), 'utf8'));
    break;
  }

  default: {
    const skills = discoverSkills(SKILLS_SRC);
    console.log(`
docs-skills — AI documentation skills (${skills.length} skills)

Usage:
  docs-skills install [dir]              Install all skills into your AI tool
  docs-skills list                       List all skills with descriptions
  docs-skills info <skill>               Show full skill definition
  docs-skills convert-mdx <dir> [out]   Convert MDX files to Markdown
  docs-skills crawl <url> [out]          Crawl a website to Markdown
  docs-skills detect-platform [dir]      Detect docs platform (Mintlify, GitBook...)

Examples:
  docs-skills install                    # Auto-detect Claude/Cursor/Codex and install
  docs-skills install ~/                 # Install globally for Claude Code
  docs-skills info docs-create           # Show the full creation pipeline skill
  docs-skills convert-mdx ./my-mintlify-docs ./clean-docs
  docs-skills crawl https://example.com ./docs-output/example
`);
  }
}
