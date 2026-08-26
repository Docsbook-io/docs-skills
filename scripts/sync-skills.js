#!/usr/bin/env node
/**
 * sync-skills.js — после изменения скиллов:
 *   1. пересобрать index.json (build-index.js)
 *   2. обновить README.md в docs-skills (счётчики + категории)
 *   3. обновить секцию ## Skills catalog в Docsbook/README.md
 *   4. определить bump (patch/minor/major) по git diff
 *   5. commit + push в оба репо
 *   6. релиз (npm version + publish) НЕ делается здесь — его делает CI на push в main
 *
 * Запуск:
 *   node scripts/sync-skills.js                # dry-run, печатает план
 *   node scripts/sync-skills.js --apply        # реально делает всё
 *   node scripts/sync-skills.js --apply --no-publish   # принимается, но больше ни на что не влияет
 *
 * Bump-правила:
 *   - удалён скилл (папка в skills/ исчезла из git)   → major
 *   - добавлен новый скилл ИЛИ новая category          → minor
 *   - изменения в существующих SKILL.md/scripts/README → patch
 *   - ничего релевантного не изменилось                → exit 0, ничего не делает
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const DOCSBOOK_ROOT = '/Users/dan/Documents/startupin24h/Docsbook';
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');
const INDEX_JSON = path.join(REPO_ROOT, 'index.json');
const DOCS_SKILLS_README = path.join(REPO_ROOT, 'README.md');
const DOCSBOOK_README = path.join(DOCSBOOK_ROOT, 'README.md');

const SKILLS_MARK_START = '<!-- skills:start -->';
const SKILLS_MARK_END = '<!-- skills:end -->';

const APPLY = process.argv.includes('--apply');
const NO_PUBLISH = process.argv.includes('--no-publish');

function log(...args) { console.log(...args); }
function warn(...args) { console.warn('⚠ ', ...args); }
function die(msg) { console.error('✗', msg); process.exit(1); }

function sh(cmd, opts = {}) {
  if (!APPLY && opts.mutates) {
    log(`  [dry] ${cmd}`);
    return '';
  }
  return execSync(cmd, { encoding: 'utf8', stdio: opts.inherit ? 'inherit' : 'pipe', ...opts }).toString().trim();
}

function gitStatusPorcelain(cwd) {
  return execSync('git status --porcelain', { cwd, encoding: 'utf8' }).split('\n').filter(Boolean);
}

// ─── Шаг 1: пересобрать index.json ──────────────────────────────────────────

function rebuildIndex() {
  log('▸ rebuild index.json');
  execSync('node scripts/build-index.js', { cwd: REPO_ROOT, stdio: 'inherit' });
}

function readIndex() {
  return JSON.parse(fs.readFileSync(INDEX_JSON, 'utf8'));
}

// ─── Шаг 2: определить bump на основе git diff в docs-skills ────────────────

function detectBump() {
  // Сравниваем рабочее дерево с HEAD.
  const diff = execSync('git status --porcelain skills/', { cwd: REPO_ROOT, encoding: 'utf8' })
    .split('\n').filter(Boolean);

  if (diff.length === 0) {
    // ничего в skills/ не менялось — может быть только scripts/README → patch
    const other = execSync('git status --porcelain scripts/ README.md package.json', {
      cwd: REPO_ROOT, encoding: 'utf8',
    }).split('\n').filter(Boolean);
    if (other.length === 0) return null;
    return 'patch';
  }

  // Категоризируем по статусам файла:
  //   "?? skills/foo/SKILL.md"  — новый файл (новый скилл если SKILL.md в новой папке)
  //   " D skills/foo/SKILL.md"  — удалён скилл
  //   " M ..."                  — изменён
  let added = false, removed = false, modified = false, newCategory = false;

  // Соберём множество категорий до и после, чтобы поймать новый category.
  const headCategories = new Set();
  try {
    const headFiles = execSync('git ls-tree -r --name-only HEAD skills/', { cwd: REPO_ROOT, encoding: 'utf8' })
      .split('\n').filter((l) => l.endsWith('/SKILL.md'));
    for (const f of headFiles) {
      try {
        const content = execSync(`git show HEAD:${f}`, { cwd: REPO_ROOT, encoding: 'utf8' });
        const m = content.match(/category:\s*([\w-]+)/);
        if (m) headCategories.add(m[1]);
      } catch (_) { /* skip */ }
    }
  } catch (_) { /* первый коммит — игнор */ }

  const currentCategories = new Set(readIndex().skills.map((s) => s.category).filter(Boolean));
  for (const c of currentCategories) {
    if (!headCategories.has(c)) newCategory = true;
  }

  for (const line of diff) {
    const status = line.slice(0, 2);
    const file = line.slice(3);
    // git collapses a wholly-untracked skill to its directory ("?? skills/foo/"),
    // so a new skill never appears as ".../SKILL.md" and would be scored a patch.
    // Treat an untracked directory that contains a SKILL.md as an added skill.
    if (status.includes('?') && file.endsWith('/')) {
      if (fs.existsSync(path.join(REPO_ROOT, file, 'SKILL.md'))) added = true;
      continue;
    }
    if (!file.includes('/SKILL.md')) continue;
    if (status.includes('?') || status.includes('A')) added = true;
    else if (status.includes('D')) removed = true;
    else if (status.includes('M') || status.includes('R')) modified = true;
  }

  if (removed) return 'major';
  if (added || newCategory) return 'minor';
  if (modified) return 'patch';
  // Не SKILL.md, но что-то в skills/ — patch.
  return 'patch';
}

// ─── Шаг 3: обновить README.md в docs-skills ────────────────────────────────

function buildCategoriesTable(index) {
  const counts = {};
  for (const s of index.skills) {
    const c = s.category || 'uncategorized';
    counts[c] = (counts[c] || 0) + 1;
  }
  const order = ['creation', 'analysis', 'management', 'automation'];
  const descriptions = {
    creation: 'Documentation that does not exist yet',
    analysis: 'What is wrong, from real numbers through to the applied fix',
    management: 'What a page says, and what the site around it does',
    automation: 'Anything that should keep happening on its own',
  };
  const sortedCats = Object.keys(counts).sort((a, b) => {
    const ai = order.indexOf(a), bi = order.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const rows = sortedCats.map((c) => `| \`${c}\` | ${counts[c]} | ${descriptions[c] || '—'} |`);
  return { total: index.skills.length, categories: sortedCats.length, table: rows.join('\n'), counts };
}

/**
 * package.json больше не несёт счётчик скиллов, и этот скрипт его не трогает.
 *
 * Счётчик там был единственным полем, которое правил этот прогон, — в том самом
 * файле, где CI правит версию. Каждое добавление скилла давало гарантированный
 * конфликт при rebase (их версия против нашего счётчика), который приходилось
 * разруливать руками. Число живёт в README, где его сверяет check-catalog.js;
 * в описании npm-пакета оно устаревало и не проверялось ничем.
 */

function updateDocsSkillsReadme(index) {
  log('▸ update docs-skills/README.md');
  const stats = buildCategoriesTable(index);
  let content = fs.readFileSync(DOCS_SKILLS_README, 'utf8');

  // Счётчики в README — их ДВА и они в разных формулировках: заголовочный
  // "**N skills that teach…**" и "**N skills**, M categories." над каталогом.
  // Ловим оба через общий "**N skills", иначе один тихо расходится с другим —
  // ровно то, что check-catalog.js потом валит в CI.
  content = content.replace(/\*\*\d+ skills\b/g, `**${stats.total} skills`);
  content = content.replace(
    /(\*\*\d+ skills\*\*,\s*)\d+(\s*categories)/,
    `$1${stats.categories}$2`
  );

  // Заголовок каждого <details>: "<b>Analysis</b> — 12 skills · …". Эти
  // счётчики страж сверяет по категориям, поэтому регенерируем их из индекса,
  // а не из того, что было написано руками.
  content = content.replace(
    /<b>(\w+)<\/b>\s*—\s*\d+ skills/g,
    (whole, label) => {
      const n = stats.counts[label.toLowerCase()];
      return n === undefined ? whole : `<b>${label}</b> — ${n} skills`;
    }
  );

  if (APPLY) fs.writeFileSync(DOCS_SKILLS_README, content);
  else log('  [dry] would update categories table and skill count');
}

// ─── Шаг 4: обновить секцию ## Skills catalog в Docsbook/README.md ─────────

function buildDocsbookSection(index) {
  const stats = buildCategoriesTable(index);
  const catLines = Object.keys(stats.counts)
    .sort((a, b) => stats.counts[b] - stats.counts[a])
    .map((c) => {
      const examples = index.skills.filter((s) => s.category === c).slice(0, 4).map((s) => `\`${s.name}\``).join(', ');
      return `- **${c}** (${stats.counts[c]}): ${examples}${stats.counts[c] > 4 ? ' …' : ''}`;
    }).join('\n');

  // The parent README is written in English throughout — generate in English so
  // regenerating this section never switches the language of one chapter.
  const modeCounts = {};
  for (const s of index.skills) if (s.mode) modeCounts[s.mode] = (modeCounts[s.mode] || 0) + 1;
  const modeLine = Object.keys(modeCounts).length
    ? `Every skill declares a \`mode\` — what it may do to the docs: ${Object.entries(modeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([m, n]) => `\`${m}\` (${n})`)
        .join(', ')}. Enforced by \`scripts/check-catalog.js\` in CI.`
    : null;

  return [
    SKILLS_MARK_START,
    '## 7. Skills catalog',
    '',
    '**`docs-skills`** — open catalog of reusable [SKILL.md](https://github.com/Docsbook-io/docs-skills) files for AI agents, extending Docsbook MCP. This is **part of Docsbook as a product** (catalog, `/skills` landing, `find_skill` MCP tool, and the MCP server evolve as one).',
    '',
    '> **📖 Canonical reference:** [raw.githubusercontent.com/Docsbook-io/docs-skills/main/README.md](https://raw.githubusercontent.com/Docsbook-io/docs-skills/refs/heads/main/README.md) — all skills, frontmatter schema, CLI, consumption modes. Start here for any skills-related work.',
    '',
    `${stats.total} skills in ${stats.categories} categories: ${Object.keys(stats.counts).map((c) => `\`${c}\``).join(', ')}.`,
    ...(modeLine ? ['', modeLine] : []),
    '',
    '### Discovery surfaces',
    '| Surface | URL / API | Source |',
    '|---|---|---|',
    '| Marketing catalog | `docsbook.io/skills` (SSG, 1h ISR) | `raw.githubusercontent.com/Docsbook-io/docs-skills/main/index.json` |',
    '| Skill detail | `docsbook.io/skills/[name]` (SSG) | each SKILL.md rendered |',
    '| MCP tool | `find_skill(query, filters)` | same index.json, Redis 5min + etag |',
    '| llms.txt | link in `docsbook.io/llms.txt` | — |',
    '',
    '### Consumption modes',
    '1. **Local install** — `npx docs-skills install` copies SKILL.md to `.claude/skills/` / `.cursor/rules/` / `AGENTS.md`. Works offline.',
    '2. **Runtime discovery** — agent calls `find_skill("audit my docs")` → reads SKILL.md by `raw_url`. No local install.',
    '',
    '### Categories',
    '',
    catLines,
    '',
    '### Implementation',
    '- `src/lib/skills-index.ts` — load index.json (ISR 1h)',
    '- `src/lib/skills/find.ts` — `find_skill` tool (Redis 300s + etag, weighted keyword match)',
    '- `src/app/skills/page.tsx` — catalog with filters · `src/app/skills/[name]/page.tsx` — detail page',
    '- `src/proxy.ts` — `/skills/*` reserved, excluded from user-rewrite',
    '',
    SKILLS_MARK_END,
  ].join('\n');
}

function updateDocsbookReadme(index) {
  log('▸ update Docsbook/README.md');
  if (!fs.existsSync(DOCSBOOK_README)) {
    warn(`Docsbook README не найден: ${DOCSBOOK_README} — пропускаю`);
    return false;
  }
  let content = fs.readFileSync(DOCSBOOK_README, 'utf8');
  const newSection = buildDocsbookSection(index);

  if (content.includes(SKILLS_MARK_START) && content.includes(SKILLS_MARK_END)) {
    // Заменить блок между маркерами.
    const re = new RegExp(`${SKILLS_MARK_START}[\\s\\S]*?${SKILLS_MARK_END}`);
    content = content.replace(re, newSection);
  } else {
    // Маркеров нет — найти существующую секцию "## Skills catalog" и обернуть, или вставить перед "## База данных".
    const headerRe = /\n## Skills catalog\n[\s\S]*?(?=\n## )/;
    if (headerRe.test(content)) {
      content = content.replace(headerRe, `\n${newSection}\n`);
      log('  (вставил маркеры вокруг существующей секции)');
    } else {
      warn('секция "## Skills catalog" в Docsbook/README.md не найдена и маркеров нет — пропускаю');
      return false;
    }
  }

  if (APPLY) fs.writeFileSync(DOCSBOOK_README, content);
  else log('  [dry] would rewrite skills catalog section');
  return true;
}

// ─── Шаг 5: commit + push в оба репо, npm version + publish ─────────────────

function commitAndPush(cwd, files, message) {
  const status = gitStatusPorcelain(cwd);
  const relevantChanged = status.some((line) => files.some((f) => line.includes(f)));
  if (!relevantChanged) {
    log(`  ничего не изменилось в ${path.basename(cwd)} — пропускаю commit`);
    return false;
  }
  for (const f of files) sh(`git -C "${cwd}" add ${f}`, { mutates: true });
  sh(`git -C "${cwd}" commit -m ${JSON.stringify(message)}`, { mutates: true });
  sh(`git -C "${cwd}" push`, { mutates: true });
  return true;
}

/**
 * Версию бампает и публикует CI (.github/workflows/publish.yml) на каждый push
 * в main. Этот скрипт делал то же самое, когда CI ещё не было, и с тех пор
 * только мешал: `npm version` требует чистого working tree, а `package.json`
 * правится этим же прогоном — то есть шаг падал ПОСЛЕ того, как скиллы уже
 * запушены, оставляя каталог опубликованным, а версию нет. Свой bump поверх
 * CI-шного к тому же даёт `version_exists` при следующей публикации.
 */
function reportRelease(bump) {
  log(`▸ release: ${bump} — версию бампит и публикует CI на push в main`);
  if (NO_PUBLISH) log('  (--no-publish больше ни на что не влияет и оставлен только для совместимости вызовов)');
}

// ─── main ──────────────────────────────────────────────────────────────────

function main() {
  log(APPLY ? '═══ sync-skills (APPLY) ═══' : '═══ sync-skills (dry-run, use --apply) ═══\n');

  rebuildIndex();
  const bump = detectBump();
  if (!bump) {
    log('▸ ничего не изменилось в skills/scripts/README — выход');
    return;
  }
  log(`▸ bump determined: ${bump}`);

  const index = readIndex();
  updateDocsSkillsReadme(index);
  const docsbookUpdated = updateDocsbookReadme(index);

  // 1. docs-skills repo: commit index.json + README + скиллы + scripts
  log('\n▸ commit & push docs-skills');
  commitAndPush(
    REPO_ROOT,
    ['skills/', 'scripts/', 'README.md', 'index.json'],
    `chore: sync skills catalog (${bump})`
  );

  // 2. Релиз — дело CI, не этого скрипта.
  reportRelease(bump);

  // 3. Docsbook repo: commit README
  if (docsbookUpdated) {
    log('\n▸ commit & push Docsbook');
    commitAndPush(DOCSBOOK_ROOT, ['README.md'], 'docs: sync skills catalog from docs-skills');
  }

  log(APPLY ? '\n✅ done' : '\n(dry-run — повтори с --apply чтобы применить)');
}

try {
  main();
} catch (err) {
  die(err.message);
}
