#!/usr/bin/env node
/**
 * check-catalog.js — the catalog's own guardrails, run in CI before publish.
 *
 * Four checks, each protecting a promise the README makes:
 *
 *   1. TOOL NAMES  — a skill states the NEED, not the tool. A platform tool name may
 *      appear in the body only where calling it IS the goal of the step (set the
 *      branding, register a webhook). Never where it is one way to fetch data.
 *      Without this check the rule decays: it was 22 of 43 skills before the sweep.
 *
 *   2. MODE        — every skill declares what it may do to the docs
 *      (audit / refactor / authoring / platform). A caller must know whether a skill
 *      writes before handing it a docs tree.
 *
 *   3. MEASURES    — every metric id resolves in metrics/metric-dictionary.json, and
 *      every metric_dictionary path resolves on disk. An invented id means the skill
 *      reasons about a number nobody defined.
 *
 *   4. FRONTMATTER — required fields present, enums valid, no unknown keys
 *      (schema is additionalProperties: false).
 *
 * Usage:
 *   node scripts/check-catalog.js          # exit 1 on any violation
 *   node scripts/check-catalog.js --list   # print the allowlist and exit 0
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');
const SCHEMA = require(path.join(REPO_ROOT, 'schema', 'skill.schema.json'));
const DICTIONARY = require(path.join(REPO_ROOT, 'metrics', 'metric-dictionary.json'));

const METRIC_IDS = new Set((DICTIONARY.metrics || []).map((m) => m.id));

/**
 * Tool names allowed in a skill body, per exception 1 of the "states the need"
 * rule: the tool is the GOAL of the step, not a way to fetch data. Every entry
 * is a mutation — the skill exists to perform it.
 *
 * A read tool (get_*, list_*, search_*) must never be added here. If a skill
 * needs data, it describes the data.
 */
const GOAL_TOOLS = new Set([
  'create_workspace',
  'update_branding',
  'update_ui_settings',
  'update_navigation',
  'update_seo',
  'update_geo',
  'update_aeo',
  'update_ai_settings',
  'update_languages',
  'update_domain',
  'update_access',
  'set_chat_system_prompt',
  'set_chat_hooks',
  'set_translation_mode',
  'set_option',
  'write_docs',
  'write_doc_page',
  'register_webhook_translation_completed',
  'register_webhook_translation_requested',
  'register_webhook_translation_needed',
  'register_webhook_content_outdated',
  'register_webhook_content_indexed',
  'list_content_widgets',
]);

/**
 * Identifiers the tool-name regexp catches that are not tools at all — output
 * enum values, event names, action types. Kept explicit so a real tool can
 * never hide behind a vague exclusion.
 */
const NOT_TOOLS = new Set([
  'create_new',
  'expand_existing',
  'open_github_issue',
  'update_existing',
]);

const TOOL_RE =
  /\b(?:get|list|update|set|register_webhook|create|write|search|approve|delete|upload|unregister|replay|test|query|find)_[a-z0-9_]+/g;

function findSkillFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findSkillFiles(full, out);
    else if (entry.name === 'SKILL.md') out.push(full);
  }
  return out;
}

function splitFrontmatter(text) {
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return null;
  return { frontmatter: text.slice(3, end), body: text.slice(end + 4) };
}

/** Minimal reader for the frontmatter shape this repo uses. */
function readFrontmatter(raw) {
  const top = {};
  const metadata = {};
  let inMetadata = false;
  let currentList = null;

  for (const line of raw.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && currentList) {
      currentList.push(listItem[1].split('#')[0].trim());
      continue;
    }

    const topLevel = line.match(/^([a-z_]+):\s*(.*)$/);
    if (topLevel) {
      const [, key, value] = topLevel;
      inMetadata = key === 'metadata';
      currentList = null;
      if (inMetadata) continue;
      top[key] = value.trim();
      continue;
    }

    const nested = line.match(/^\s+([a-z_]+):\s*(.*)$/);
    if (nested && inMetadata) {
      const [, key, value] = nested;
      const inline = value.trim();
      if (!inline) {
        metadata[key] = [];
        currentList = metadata[key];
      } else if (inline.startsWith('[')) {
        metadata[key] = inline.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean);
        currentList = null;
      } else {
        metadata[key] = inline;
        currentList = null;
      }
    }
  }
  return { top, metadata };
}

const violations = [];
const files = findSkillFiles(SKILLS_DIR).sort();

if (process.argv.includes('--list')) {
  console.log('Tool names allowed in skill bodies (the tool IS the goal of the step):\n');
  [...GOAL_TOOLS].sort().forEach((t) => console.log('  ' + t));
  process.exit(0);
}

const metadataSchema = SCHEMA.properties.metadata;
const allowedMetadataKeys = new Set(Object.keys(metadataSchema.properties));
const allowedTopKeys = new Set(Object.keys(SCHEMA.properties));

for (const file of files) {
  const rel = path.relative(REPO_ROOT, file);
  const text = fs.readFileSync(file, 'utf8');
  const parts = splitFrontmatter(text);

  if (!parts) {
    violations.push(`${rel}: no YAML frontmatter`);
    continue;
  }

  const { top, metadata } = readFrontmatter(parts.frontmatter);

  // 1. Tool names in the body.
  const named = [...new Set(parts.body.match(TOOL_RE) || [])];
  const offending = named.filter((n) => !GOAL_TOOLS.has(n) && !NOT_TOOLS.has(n));
  if (offending.length) {
    violations.push(
      `${rel}: names tools in the body where the tool is a way to fetch data, not the goal: ` +
        `${offending.join(', ')}. Describe the data the skill needs instead. ` +
        `(If one of these really is the goal of a step, add it to GOAL_TOOLS in this script.)`
    );
  }

  // 2. Required fields + mode.
  for (const key of SCHEMA.required) {
    if (key === 'metadata') continue;
    if (!top[key]) violations.push(`${rel}: missing required field \`${key}\``);
  }
  for (const key of metadataSchema.required) {
    if (!metadata[key]) violations.push(`${rel}: missing required \`metadata.${key}\``);
  }
  if (!metadata.mode) {
    violations.push(
      `${rel}: missing \`metadata.mode\` — declare what the skill may do to the docs ` +
        `(${metadataSchema.properties.mode.enum.join(' / ')})`
    );
  } else if (!metadataSchema.properties.mode.enum.includes(metadata.mode)) {
    violations.push(`${rel}: \`metadata.mode: ${metadata.mode}\` is not one of ${metadataSchema.properties.mode.enum.join(' / ')}`);
  }
  if (metadata.category && !metadataSchema.properties.category.enum.includes(metadata.category)) {
    violations.push(`${rel}: \`metadata.category: ${metadata.category}\` is not in the schema enum`);
  }
  if (metadata.requires_plan && !metadataSchema.properties.requires_plan.enum.includes(metadata.requires_plan)) {
    violations.push(`${rel}: \`metadata.requires_plan: ${metadata.requires_plan}\` is not in the schema enum`);
  }

  // 3. Metrics resolve.
  for (const id of metadata.measures || []) {
    if (!METRIC_IDS.has(id)) {
      violations.push(`${rel}: \`measures\` names \`${id}\`, which does not exist in metrics/metric-dictionary.json`);
    }
  }
  if (metadata.metric_dictionary) {
    const resolved = path.resolve(path.dirname(file), metadata.metric_dictionary);
    if (!fs.existsSync(resolved)) {
      violations.push(`${rel}: \`metric_dictionary: ${metadata.metric_dictionary}\` does not resolve on disk`);
    }
  }

  // 4. No unknown keys (schema is additionalProperties: false).
  for (const key of Object.keys(top)) {
    if (!allowedTopKeys.has(key)) violations.push(`${rel}: unknown top-level field \`${key}\``);
  }
  for (const key of Object.keys(metadata)) {
    if (!allowedMetadataKeys.has(key)) violations.push(`${rel}: unknown \`metadata.${key}\``);
  }
}

// 5. README counters match the catalog. These drifted silently once already —
// a header claiming "3 skills" over two rows is the kind of thing a reader
// notices before a maintainer does.
const readmePath = path.join(REPO_ROOT, 'README.md');
if (fs.existsSync(readmePath)) {
  const readme = fs.readFileSync(readmePath, 'utf8');
  const perCategory = {};
  for (const file of files) {
    const parts = splitFrontmatter(fs.readFileSync(file, 'utf8'));
    if (!parts) continue;
    const { metadata } = readFrontmatter(parts.frontmatter);
    if (metadata.category) perCategory[metadata.category] = (perCategory[metadata.category] || 0) + 1;
  }

  const totalClaims = [...readme.matchAll(/\*\*(\d+) skills\*\*/g)].map((m) => Number(m[1]));
  for (const claimed of totalClaims) {
    if (claimed !== files.length) {
      violations.push(`README.md: claims **${claimed} skills**, catalog has ${files.length}`);
    }
  }

  for (const m of readme.matchAll(/<b>(\w+)<\/b>\s*—\s*(\d+) skills/g)) {
    const [, label, claimed] = m;
    const actual = perCategory[label.toLowerCase()];
    if (actual === undefined) {
      violations.push(`README.md: lists category "${label}", which no skill declares`);
    } else if (Number(claimed) !== actual) {
      violations.push(`README.md: "${label}" header claims ${claimed} skills, catalog has ${actual}`);
    }
  }
}

if (violations.length) {
  console.error(`✗ catalog check failed — ${violations.length} violation(s) across ${files.length} skills:\n`);
  violations.forEach((v) => console.error('  • ' + v));
  console.error('\nThe "states the need, not the tool" rule is what makes a skill work on a bare');
  console.error('agent and get sharper — not narrower — when a platform is connected. Keep it.');
  process.exit(1);
}

console.log(`✓ catalog check passed — ${files.length} skills`);
console.log('  · no data-fetching tool names in skill bodies');
console.log('  · every skill declares a mode');
console.log('  · every metric id and dictionary path resolves');
console.log('  · frontmatter matches the schema');
console.log('  · README counters match the catalog');
