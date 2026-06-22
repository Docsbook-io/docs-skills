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
  console.log('[docs-skills] Use /docs-analyze in Claude Code to start');
}

function installCursor(targetDir, skills) {
  const rulesDir = path.join(targetDir, '.cursor', 'rules');
  fs.mkdirSync(rulesDir, { recursive: true });
  const lines = ['---', 'description: Documentation analysis skills', '---', ''];
  for (const { srcPath } of skills) {
    const skillFile = path.join(srcPath, 'SKILL.md');
    if (fs.existsSync(skillFile)) {
      lines.push(fs.readFileSync(skillFile, 'utf8'));
      lines.push('');
    }
  }
  fs.writeFileSync(path.join(rulesDir, 'docs-skills.mdc'), lines.join('\n'));
  console.log(`[docs-skills] Installed into ${rulesDir}/docs-skills.mdc`);
  console.log('[docs-skills] Mention @docs-analyze in Cursor chat to use');
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

function buildSkillsSection(header, skills) {
  const lines = [header, ''];
  for (const { srcPath } of skills) {
    const skillFile = path.join(srcPath, 'SKILL.md');
    if (fs.existsSync(skillFile)) {
      lines.push(fs.readFileSync(skillFile, 'utf8'));
      lines.push('');
    }
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
  case 'copilot':
    appendSection(
      path.join(targetDir, '.github', 'copilot-instructions.md'),
      buildSkillsSection('## docs-skills', skills)
    );
    break;
  case 'codex':
    appendSection(
      path.join(targetDir, 'AGENTS.md'),
      buildSkillsSection('## docs-skills', skills)
    );
    break;
}
