#!/usr/bin/env node
/**
 * build-index.js — Parse all skills/<name>/SKILL.md frontmatter and emit index.json at repo root.
 *
 * Spec: PLAN.md §A4
 * Output schema:
 *   {
 *     "schema_version": 1,
 *     "generated_at": "<ISO>",
 *     "skills": [
 *       {
 *         "name": "...",
 *         "description": "...",
 *         "category": "automation",
 *         "requires_plan": "pro",
 *         "keywords": [...],
 *         "uses_mcp_tools": [...],
 *         "version": "1.0.0",
 *         "raw_url": "https://raw.githubusercontent.com/Docsbook-io/docs-skills/main/skills/<name>/SKILL.md",
 *         "github_url": "https://github.com/Docsbook-io/docs-skills/blob/main/skills/<name>/SKILL.md"
 *       }
 *     ]
 *   }
 *
 * Frontmatter fields beyond { name, description } are optional. category / requires_plan /
 * keywords / uses_mcp_tools come from the taxonomy work — when missing, fields are omitted
 * (not nulled) so the index stays clean.
 *
 * No external deps — minimal YAML parser, sufficient for our frontmatter shape.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');
const OUTPUT = path.join(REPO_ROOT, 'index.json');

const REPO_OWNER = 'Docsbook-io';
const REPO_NAME = 'docs-skills';
const BRANCH = 'main';

const RAW_BASE = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}`;
const GH_BASE = `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/${BRANCH}`;

/**
 * Extract YAML frontmatter block (between leading --- and next ---).
 * Returns raw YAML string or null.
 */
function extractFrontmatter(text) {
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return null;
  return text.slice(3, end).replace(/^\r?\n/, '');
}

/**
 * Minimal YAML parser — handles the subset we use in SKILL.md frontmatter:
 *  - scalar key: value
 *  - inline list:  key: [a, b, c]
 *  - block list:   key:\n  - a\n  - b
 *  - nested map:   metadata:\n  version: 1.0.0
 * Values are strings unless they look like JSON arrays.
 */
function parseFrontmatter(yaml) {
  const out = {};
  const lines = yaml.split(/\r?\n/);
  let i = 0;

  function unquote(v) {
    v = v.trim();
    if (!v) return v;
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      return v.slice(1, -1);
    }
    return v;
  }

  function parseInlineList(v) {
    // [a, "b", 'c']
    const inner = v.trim().slice(1, -1).trim();
    if (!inner) return [];
    // Naive split on commas — frontmatter lists don't have nested commas in our use.
    return inner.split(',').map((s) => unquote(s.trim())).filter(Boolean);
  }

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) { i++; continue; }

    // Top-level key only (no leading whitespace).
    const m = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!m) { i++; continue; }

    const key = m[1];
    const rest = m[2];

    if (rest === '') {
      // Nested block — collect indented children at the FIRST indent level only.
      // Determine the child indent from the first non-blank child line.
      let firstChildIndent = -1;
      let j = i + 1;
      while (j < lines.length) {
        const l = lines[j];
        if (!l.trim()) { j++; continue; }
        const lead = l.match(/^(\s+)\S/);
        if (!lead) break;
        firstChildIndent = lead[1].length;
        break;
      }
      if (firstChildIndent === -1) {
        out[key] = '';
        i++;
        continue;
      }

      const child = {};
      const childList = [];
      i++;
      while (i < lines.length) {
        const sub = lines[i];
        if (!sub.trim()) { i++; continue; }
        const lead = sub.match(/^(\s+)\S/);
        if (!lead) break; // unindented → end of block
        const indent = lead[1].length;
        if (indent < firstChildIndent) break;
        if (indent > firstChildIndent) {
          // deeper line — belongs to the previous child entry (e.g. nested list under uses_mcp_tools).
          // We capture child-list items here.
          const listM = sub.match(/^\s+-\s+(.*)$/);
          if (listM && child.__lastKey) {
            if (!Array.isArray(child[child.__lastKey])) child[child.__lastKey] = [];
            child[child.__lastKey].push(unquote(listM[1]));
          }
          i++;
          continue;
        }
        // indent === firstChildIndent
        const listM = sub.match(/^\s+-\s+(.*)$/);
        if (listM) {
          childList.push(unquote(listM[1]));
        } else {
          const subM = sub.match(/^\s+([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
          if (subM) {
            const k2 = subM[1];
            const v = subM[2];
            if (v === '') {
              // nested list/map under this key — will be filled by deeper-indent lines.
              child[k2] = [];
              child.__lastKey = k2;
            } else if (v.startsWith('[') && v.endsWith(']')) {
              child[k2] = parseInlineList(v);
              child.__lastKey = k2;
            } else {
              child[k2] = unquote(v);
              child.__lastKey = k2;
            }
          }
        }
        i++;
      }
      delete child.__lastKey;
      if (childList.length) out[key] = childList;
      else if (Object.keys(child).length) out[key] = child;
      else out[key] = '';
      continue;
    }

    if (rest.startsWith('[') && rest.endsWith(']')) {
      out[key] = parseInlineList(rest);
    } else {
      out[key] = unquote(rest);
    }
    i++;
  }

  return out;
}

function buildIndex() {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error(`skills/ not found at ${SKILLS_DIR}`);
    process.exit(1);
  }

  const dirs = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const skills = [];

  for (const name of dirs) {
    const file = path.join(SKILLS_DIR, name, 'SKILL.md');
    if (!fs.existsSync(file)) {
      console.warn(`skip ${name}: no SKILL.md`);
      continue;
    }

    const text = fs.readFileSync(file, 'utf8');
    const fm = extractFrontmatter(text);
    if (!fm) {
      console.warn(`skip ${name}: no frontmatter`);
      continue;
    }

    const parsed = parseFrontmatter(fm);
    const entry = {
      name: parsed.name || name,
      description: parsed.description || '',
    };

    // Metadata fields may live at top level or under `metadata:` (new taxonomy).
    const md = (parsed.metadata && typeof parsed.metadata === 'object') ? parsed.metadata : {};

    const category = parsed.category || md.category;
    const requires_plan = parsed.requires_plan || md.requires_plan;
    const keywords = (Array.isArray(parsed.keywords) && parsed.keywords) ||
      (Array.isArray(md.keywords) && md.keywords) || null;
    const uses_mcp_tools = (Array.isArray(parsed.uses_mcp_tools) && parsed.uses_mcp_tools) ||
      (Array.isArray(md.uses_mcp_tools) && md.uses_mcp_tools) || null;
    const requires_docsbook_mcp = md.requires_docsbook_mcp;

    if (category) entry.category = category;
    if (requires_plan) entry.requires_plan = requires_plan;
    if (keywords && keywords.length) entry.keywords = keywords;
    if (uses_mcp_tools && uses_mcp_tools.length) entry.uses_mcp_tools = uses_mcp_tools;
    if (requires_docsbook_mcp !== undefined) entry.requires_docsbook_mcp = requires_docsbook_mcp === true || requires_docsbook_mcp === 'true';

    if (md.version) entry.version = md.version;

    entry.raw_url = `${RAW_BASE}/skills/${name}/SKILL.md`;
    entry.github_url = `${GH_BASE}/skills/${name}/SKILL.md`;

    skills.push(entry);
  }

  return {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    skills,
  };
}

function main() {
  const index = buildIndex();
  fs.writeFileSync(OUTPUT, JSON.stringify(index, null, 2) + '\n', 'utf8');
  console.log(`wrote ${path.relative(REPO_ROOT, OUTPUT)} — ${index.skills.length} skills`);
}

if (require.main === module) {
  main();
}

module.exports = { buildIndex, parseFrontmatter, extractFrontmatter };
