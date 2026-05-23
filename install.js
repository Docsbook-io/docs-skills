#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SKILLS_SRC = path.join(__dirname, 'skills');
const SKILL_NAMES = [
  'docs-analyze', 'docs-content-types', 'docs-structure-templates',
  'docs-style-tone', 'docs-audience', 'docs-navigation-linking',
  'docs-seo', 'docs-accessibility', 'docs-i18n', 'docs-media', 'docs-maintenance'
];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const file of fs.readdirSync(src)) {
    const s = path.join(src, file);
    const d = path.join(dest, file);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function installClaudeCode(targetDir) {
  const dest = path.join(targetDir, '.claude', 'skills');
  for (const skill of SKILL_NAMES) {
    copyDir(path.join(SKILLS_SRC, skill), path.join(dest, skill));
  }
  console.log(`[docs-skills] Installed ${SKILL_NAMES.length} skills into ${dest}`);
  console.log('[docs-skills] Use /docs-analyze in Claude Code to start');
}

function installCursor(targetDir) {
  const rulesDir = path.join(targetDir, '.cursor', 'rules');
  fs.mkdirSync(rulesDir, { recursive: true });
  const lines = ['---', 'description: Documentation analysis skills', '---', ''];
  for (const skill of SKILL_NAMES) {
    const skillFile = path.join(SKILLS_SRC, skill, 'SKILL.md');
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

function buildSkillsSection(header) {
  const lines = [header, ''];
  for (const skill of SKILL_NAMES) {
    const skillFile = path.join(SKILLS_SRC, skill, 'SKILL.md');
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

const targetDir = path.resolve(process.argv[2] || process.cwd());
const tool = detect(targetDir);

console.log(`[docs-skills] Detected AI tool: ${tool}`);
console.log(`[docs-skills] Target: ${targetDir}`);

switch (tool) {
  case 'claude':
    installClaudeCode(targetDir);
    break;
  case 'cursor':
    installCursor(targetDir);
    break;
  case 'copilot':
    appendSection(
      path.join(targetDir, '.github', 'copilot-instructions.md'),
      buildSkillsSection('## docs-skills')
    );
    break;
  case 'codex':
    appendSection(
      path.join(targetDir, 'AGENTS.md'),
      buildSkillsSection('## docs-skills')
    );
    break;
}
