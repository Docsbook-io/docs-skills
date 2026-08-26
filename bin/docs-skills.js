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
  'docs-create':   'Documentation that does not exist yet — from a site, a repo, another platform, or an idea',
  'docs-analyze':  'What is wrong and what it costs — real numbers first, then the detectors, then the fix',
  'docs-manage':   'The rulebook: what a page says, and what the site around it does',
  'docs-automate': 'Drift guards, CI checks, event handlers, alerts and monitors — after asking what you want watched',
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
  docs-skills info docs-create           # Show the creation skill in full
  docs-skills convert-mdx ./my-mintlify-docs ./clean-docs
  docs-skills crawl https://example.com ./docs-output/example
`);
  }
}
