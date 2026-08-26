#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SKILLS_SRC = path.join(__dirname, 'skills');

/**
 * Recursively find all skill directories under SKILLS_SRC.
 * A "skill directory" is any directory that directly contains a SKILL.md file.
 * Returns an array of { name, srcPath } objects.
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
    // Check if this directory directly contains SKILL.md
    if (entries.some(e => e.isFile() && e.name === 'SKILL.md')) {
      const name = path.basename(dir);
      if (seen.has(name)) {
        console.warn(`[docs-skills] WARNING: skill name collision for "${name}" at ${dir} — skipping (first wins)`);
        return;
      }
      seen.add(name);
      found.push({ name, srcPath: dir });
      return; // don't recurse deeper inside a skill dir
    }
    // Not a skill dir — recurse into subdirectories
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name));
      }
    }
  }

  walk(baseDir);
  return found;
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const file of fs.readdirSync(src)) {
    const s = path.join(src, file);
    const d = path.join(dest, file);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function installClaudeCode(targetDir, skills) {
  const dest = path.join(targetDir, '.claude', 'skills');
  for (const { name, srcPath } of skills) {
    copyDir(srcPath, path.join(dest, name));
  }
  console.log(`[docs-skills] Installed ${skills.length} skills into ${dest}`);
  console.log('[docs-skills] Ask in plain language, or use /docs-create · /docs-analyze · /docs-manage · /docs-automate');
}

function installCursor(targetDir, skills) {
  // Copy the full skill trees first. Each SKILL.md routes to reference files under
  // its own references/ folder — inlining only SKILL.md would strip out most of the
  // substance and leave the routing table pointing at files that do not exist.
  const skillsDir = copySkillTrees(targetDir, path.join('.cursor', 'skills'), skills);

  const rulesDir = path.join(targetDir, '.cursor', 'rules');
  fs.mkdirSync(rulesDir, { recursive: true });
  const lines = [
    '---',
    'description: Documentation skills — create, analyze, manage, automate',
    '---',
    '',
    buildSkillsSection('# docs-skills', skills, path.join('.cursor', 'skills')),
  ];
  fs.writeFileSync(path.join(rulesDir, 'docs-skills.mdc'), lines.join('\n'));
  console.log(`[docs-skills] Installed into ${rulesDir}/docs-skills.mdc`);
  console.log(`[docs-skills] Reference files copied to ${skillsDir}`);
  console.log('[docs-skills] Ask in plain language, or mention @docs-create · @docs-analyze · @docs-manage · @docs-automate');
}

function appendSection(filePath, section) {
  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  if (existing.includes('## docs-skills')) {
    console.log(`[docs-skills] Section already exists in ${filePath}, skipping`);
    return;
  }
  const content = existing + '\n\n' + section;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log(`[docs-skills] Appended docs-skills section to ${filePath}`);
}

/**
 * Copy each skill's whole directory (SKILL.md plus its references/ and assets/)
 * into targetDir/<subdir>/<name>/. Returns the absolute base directory.
 */
function copySkillTrees(targetDir, subdir, skills) {
  const base = path.join(targetDir, subdir);
  for (const { name, srcPath } of skills) {
    copyDir(srcPath, path.join(base, name));
  }
  return base;
}

/**
 * Inline every SKILL.md under one header. `skillsRelDir` is where the copied skill
 * trees live relative to the project root — a SKILL.md routes to `references/*.md`,
 * and without that prefix the agent has no way to resolve those paths.
 */
function buildSkillsSection(header, skills, skillsRelDir) {
  const lines = [header, ''];
  if (skillsRelDir) {
    lines.push(
      `Each skill below routes to reference files loaded on demand. They live in ` +
        `\`${skillsRelDir}/<skill>/references/\` — resolve a skill's ` +
        `\`references/x.md\` against its own folder there.`,
      ''
    );
  }
  for (const { name, srcPath } of skills) {
    const skillFile = path.join(srcPath, 'SKILL.md');
    if (!fs.existsSync(skillFile)) continue;
    if (skillsRelDir) lines.push(`<!-- ${skillsRelDir}/${name}/SKILL.md -->`);
    lines.push(fs.readFileSync(skillFile, 'utf8'));
    lines.push('');
  }
  return lines.join('\n');
}

function detect(targetDir) {
  if (fs.existsSync(path.join(targetDir, '.claude'))) return 'claude';
  if (fs.existsSync(path.join(targetDir, '.cursor'))) return 'cursor';
  if (fs.existsSync(path.join(targetDir, '.github', 'copilot-instructions.md'))) return 'copilot';
  if (fs.existsSync(path.join(targetDir, 'AGENTS.md'))) return 'codex';
  return 'claude'; // default
}

const skills = discoverSkills(SKILLS_SRC);
const targetDir = path.resolve(process.argv[2] || process.cwd());
const tool = detect(targetDir);

console.log(`[docs-skills] Detected AI tool: ${tool}`);
console.log(`[docs-skills] Target: ${targetDir}`);
console.log(`[docs-skills] Found ${skills.length} skills: ${skills.map(s => s.name).join(', ')}`);

switch (tool) {
  case 'claude':
    installClaudeCode(targetDir, skills);
    break;
  case 'cursor':
    installCursor(targetDir, skills);
    break;
  case 'copilot': {
    const dir = copySkillTrees(targetDir, '.docs-skills', skills);
    appendSection(
      path.join(targetDir, '.github', 'copilot-instructions.md'),
      buildSkillsSection('## docs-skills', skills, '.docs-skills')
    );
    console.log(`[docs-skills] Reference files copied to ${dir}`);
    break;
  }
  case 'codex': {
    const dir = copySkillTrees(targetDir, '.docs-skills', skills);
    appendSection(
      path.join(targetDir, 'AGENTS.md'),
      buildSkillsSection('## docs-skills', skills, '.docs-skills')
    );
    console.log(`[docs-skills] Reference files copied to ${dir}`);
    break;
  }
}
