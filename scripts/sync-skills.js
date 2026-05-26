#!/usr/bin/env node
/**
 * sync-skills.js — после изменения скиллов:
 *   1. пересобрать index.json (build-index.js)
 *   2. обновить README.md в docs-skills (счётчики + категории)
 *   3. обновить секцию ## Skills catalog в Docsbook/README.md
 *   4. определить bump (patch/minor/major) по git diff
 *   5. commit + push в оба репо
 *   6. npm version <bump> + git push --tags + npm publish (только docs-skills)
 *
 * Запуск:
 *   node scripts/sync-skills.js                # dry-run, печатает план
 *   node scripts/sync-skills.js --apply        # реально делает всё
 *   node scripts/sync-skills.js --apply --no-publish   # commit+push без npm publish
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
const PKG_JSON = path.join(REPO_ROOT, 'package.json');

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
  const order = ['analysis', 'creation', 'publishing', 'automation', 'observability', 'planning'];
  const descriptions = {
    analysis: 'Audit and quality checks',
    creation: 'Generate or import docs',
    publishing: 'Publish and onboard a workspace',
    automation: 'Wire up automations via Docsbook MCP',
    observability: 'Analytics-driven gap-finding',
    planning: 'Plan docs strategy before creation',
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

function updateDocsSkillsReadme(index) {
  log('▸ update docs-skills/README.md');
  const stats = buildCategoriesTable(index);
  let content = fs.readFileSync(DOCS_SKILLS_README, 'utf8');

  // Обновляем строку "**N skills across M categories.**"
  content = content.replace(
    /\*\*\d+\s+skills?\s+across\s+\d+\s+categor(?:y|ies)\.\*\*/i,
    `**${stats.total} skills across ${stats.categories} categories.**`
  );

  // Обновляем таблицу категорий — она между "## Categories" и следующим "---".
  const catBlockRe = /(## Categories\s*\n\s*\n\| Category \| Skills \| What it does \|\s*\n\|[^\n]+\|\s*\n)([\s\S]*?)(\n\s*\n---)/;
  content = content.replace(catBlockRe, `$1${stats.table}$3`);

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

  return [
    SKILLS_MARK_START,
    '## Skills catalog',
    '',
    '`docs-skills` — открытый каталог [SKILL.md](https://github.com/Docsbook-io/docs-skills) для AI-агентов, расширяющий Docsbook MCP. Это **часть Docsbook как продукта**, а не отдельный проект: каталог, маркетинг-страница `/skills`, MCP-tool `find_skill` и сам Docsbook MCP-сервер развиваются как единое целое.',
    '',
    '> **📖 Полный референс каталога:** [raw.githubusercontent.com/Docsbook-io/docs-skills/main/README.md](https://raw.githubusercontent.com/Docsbook-io/docs-skills/refs/heads/main/README.md) — описание всех skills, frontmatter-схема, CLI, режимы потребления. Это canonical-источник; при разработке любых фич, касающихся skills, начинай отсюда.',
    '',
    `${stats.total} skills в ${stats.categories} категориях: ${Object.keys(stats.counts).map((c) => `\`${c}\``).join(', ')}.`,
    '',
    '### Поверхности discovery',
    '',
    '| Поверхность | URL / API | Источник |',
    '|---|---|---|',
    '| Маркетинг-каталог | `docsbook.io/skills` (SSG, 1h ISR) | `raw.githubusercontent.com/Docsbook-io/docs-skills/main/index.json` |',
    '| Детальная страница | `docsbook.io/skills/[name]` (SSG) | `raw_url` каждого SKILL.md, рендер через основной markdown-pipeline |',
    '| MCP-tool | `find_skill(query, filters)` | тот же `index.json`, Redis 5 мин + etag |',
    '| llms.txt | Ссылка в `docsbook.io/llms.txt` | — |',
    '',
    '### Два режима потребления юзером',
    '',
    '1. **Local install** — `npx docs-skills install` копирует SKILL.md в `.claude/skills/` / `.cursor/rules/` / `AGENTS.md`. Работает офлайн.',
    '2. **Runtime discovery** — агент уже подключён к Docsbook MCP → вызывает `find_skill("audit my docs")` → читает SKILL.md по `raw_url`. Без локальной установки.',
    '',
    '### Категории skills',
    '',
    catLines,
    '',
    '### Файлы реализации',
    '',
    '- `src/lib/skills-index.ts` — загрузка `index.json` для маркетинг-страниц (ISR 1h)',
    '- `src/lib/skills/find.ts` — `find_skill` MCP-tool (Redis 300s + etag revalidation, keyword match с весами name×3 / description×2 / keywords×2)',
    '- `src/app/skills/page.tsx` — каталог с фильтрами (category / plan / keyword search)',
    '- `src/app/skills/[name]/page.tsx` — детальная страница со SKILL.md, install + MCP snippets',
    '- `src/proxy.ts` — `skills` зарезервирован как subdomain, `/skills/*` исключены из user-rewrite',
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

function bumpAndPublish(bump) {
  log(`▸ npm version ${bump}`);
  if (APPLY) {
    // npm version требует чистого working tree. Проверим заранее, чтобы дать понятную ошибку.
    const dirty = gitStatusPorcelain(REPO_ROOT);
    if (dirty.length) {
      die(
        `npm version требует чистого working tree, но есть незакоммиченные изменения:\n  ${dirty.join('\n  ')}\n` +
        `Закоммить или stash их и повтори. (sync-skills уже сделал commit/push скиллов — версия не бампилась.)`
      );
    }
    execSync(`npm version ${bump} -m "chore: release v%s"`, { cwd: REPO_ROOT, stdio: 'inherit' });
    execSync('git push --follow-tags', { cwd: REPO_ROOT, stdio: 'inherit' });
  } else {
    log(`  [dry] npm version ${bump} && git push --follow-tags`);
  }

  if (NO_PUBLISH) {
    log('▸ --no-publish — пропускаю npm publish');
    return;
  }
  log('▸ npm publish');
  if (APPLY) execSync('npm publish', { cwd: REPO_ROOT, stdio: 'inherit' });
  else log('  [dry] npm publish');
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

  // 2. npm version + publish
  bumpAndPublish(bump);

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
