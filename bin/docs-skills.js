#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

const SKILLS_SRC = path.join(__dirname, '..', 'skills');
const SKILL_NAMES = [
  'docs-analyze', 'docs-content-types', 'docs-structure-templates',
  'docs-style-tone', 'docs-audience', 'docs-navigation-linking',
  'docs-seo', 'docs-accessibility', 'docs-i18n', 'docs-media', 'docs-maintenance'
];

const SKILL_DESCRIPTIONS = {
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
    console.log('\ndocs-skills — 11 documentation analysis skills\n');
    for (const name of SKILL_NAMES) {
      console.log(`  /${name.padEnd(28)} ${SKILL_DESCRIPTIONS[name]}`);
    }
    console.log('\nRun `docs-skills info <skill>` for full skill definition.');
    console.log('Run `docs-skills install` to add skills to your project.\n');
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
docs-skills — AI documentation analysis skills

Usage:
  docs-skills install [dir]    Install skills into dir (default: current directory)
  docs-skills list             List all 11 skills
  docs-skills info <skill>     Show full skill definition

Examples:
  docs-skills install          # Auto-detect AI tool and install
  docs-skills install ~/       # Install globally for Claude Code
  docs-skills info docs-seo    # Show the SEO analysis skill
`);
  }
}
