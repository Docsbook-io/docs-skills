#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

const SKILLS_SRC = path.join(__dirname, '..', 'skills');
const SKILL_NAMES = [
  // Create skills
  'docs-create', 'docs-create-interactive',
  'docs-from-site', 'docs-from-code', 'docs-from-docs',
  'docs-publish', 'docs-setup-workspace', 'docs-detect-source',
  // Analyse skills
  'docs-analyze', 'docs-content-types', 'docs-structure-templates',
  'docs-style-tone', 'docs-audience', 'docs-navigation-linking',
  'docs-seo', 'docs-accessibility', 'docs-i18n', 'docs-media', 'docs-maintenance',
];

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
  // Analyse
  'docs-analyze':             'Orchestrator — runs all 10 sub-skills, produces a unified report',
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
    console.log('\ndocs-skills — 19 documentation skills (create + analyse)\n');
    console.log('  CREATE SKILLS');
    for (const name of SKILL_NAMES.slice(0, 8)) {
      console.log(`  /${name.padEnd(28)} ${SKILL_DESCRIPTIONS[name]}`);
    }
    console.log('\n  ANALYSE SKILLS');
    for (const name of SKILL_NAMES.slice(8)) {
      console.log(`  /${name.padEnd(28)} ${SKILL_DESCRIPTIONS[name]}`);
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
    const skillFile = path.join(SKILLS_SRC, skillName, 'SKILL.md');
    if (!fs.existsSync(skillFile)) {
      console.error(`Unknown skill: ${skillName}`);
      console.error(`Available: ${SKILL_NAMES.join(', ')}`);
      process.exit(1);
    }
    console.log(fs.readFileSync(skillFile, 'utf8'));
    break;
  }

  default: {
    console.log(`
docs-skills — AI documentation skills (create + analyse)

Usage:
  docs-skills install [dir]              Install 19 skills into your AI tool
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
