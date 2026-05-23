#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Converts MDX-specific syntax to plain Markdown.
 * @param {string} content
 * @returns {string}
 */
function mdxToMd(content) {
  let out = content;

  // Remove import statements
  out = out.replace(/^import\s+.*?from\s+['"][^'"]+['"]\s*;?\s*$/gm, '');

  // Remove export statements (export const, export default, etc.)
  out = out.replace(/^export\s+(default\s+)?.*?;\s*$/gm, '');

  // Convert <Callout type="info"> ... </Callout> → > **Note:** ...
  out = out.replace(/<Callout\s+type=["']info["'][^>]*>([\s\S]*?)<\/Callout>/gi, (_, body) => {
    return body.trim().split('\n').map((l) => `> ${l}`).join('\n');
  });
  out = out.replace(/<Callout\s+type=["']warning["'][^>]*>([\s\S]*?)<\/Callout>/gi, (_, body) => {
    return '> **Warning:**\n' + body.trim().split('\n').map((l) => `> ${l}`).join('\n');
  });
  out = out.replace(/<Callout[^>]*>([\s\S]*?)<\/Callout>/gi, (_, body) => {
    return body.trim().split('\n').map((l) => `> ${l}`).join('\n');
  });

  // Convert <Note>, <Warning>, <Info>, <Tip> shorthand components
  out = out.replace(/<Note>([\s\S]*?)<\/Note>/gi, (_, body) => `> **Note:** ${body.trim()}`);
  out = out.replace(/<Warning>([\s\S]*?)<\/Warning>/gi, (_, body) => `> **Warning:** ${body.trim()}`);
  out = out.replace(/<Info>([\s\S]*?)<\/Info>/gi, (_, body) => `> ${body.trim()}`);
  out = out.replace(/<Tip>([\s\S]*?)<\/Tip>/gi, (_, body) => `> **Tip:** ${body.trim()}`);

  // Convert <Card title="X"> ... </Card> → ### X \n body
  out = out.replace(/<Card\s+[^>]*title=["']([^"']+)["'][^>]*>([\s\S]*?)<\/Card>/gi, (_, title, body) => {
    return `### ${title}\n\n${body.trim()}`;
  });

  // Convert <CardGroup> ... </CardGroup> → just the inner content
  out = out.replace(/<CardGroup[^>]*>([\s\S]*?)<\/CardGroup>/gi, (_, body) => body.trim());

  // Convert <Tabs> / <Tab title="X"> → #### X headers
  out = out.replace(/<Tab\s+[^>]*title=["']([^"']+)["'][^>]*>/gi, (_, title) => `#### ${title}\n`);
  out = out.replace(/<\/Tab>/gi, '');
  out = out.replace(/<Tabs[^>]*>/gi, '');
  out = out.replace(/<\/Tabs>/gi, '');

  // Convert <Steps> ... </Steps> / <Step title="X"> → numbered headers
  let stepCount = 0;
  out = out.replace(/<Step\s+[^>]*title=["']([^"']+)["'][^>]*>/gi, (_, title) => {
    stepCount++;
    return `**Step ${stepCount}: ${title}**\n`;
  });
  out = out.replace(/<\/Step>/gi, '');
  out = out.replace(/<Steps[^>]*>/gi, '');
  out = out.replace(/<\/Steps>/gi, '');

  // Convert <AccordionGroup> / <Accordion title="X"> → #### headers
  out = out.replace(/<Accordion\s+[^>]*title=["']([^"']+)["'][^>]*>/gi, (_, title) => `#### ${title}\n`);
  out = out.replace(/<\/Accordion>/gi, '');
  out = out.replace(/<AccordionGroup[^>]*>/gi, '');
  out = out.replace(/<\/AccordionGroup>/gi, '');

  // Convert <Frame> ... </Frame> → just inner content
  out = out.replace(/<Frame[^>]*>([\s\S]*?)<\/Frame>/gi, (_, body) => body.trim());

  // Convert self-closing JSX components to nothing
  out = out.replace(/<[A-Z][A-Za-z]*[^>]*\/>/g, '');

  // Remove remaining unknown JSX/HTML tags (not standard markdown-compatible HTML)
  // Keep standard HTML tags (a, p, br, strong, em, code, pre, ul, ol, li, table, etc.)
  const standardHtmlTags = new Set([
    'a', 'p', 'br', 'strong', 'em', 'b', 'i', 'code', 'pre',
    'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr', 'img',
    'div', 'span', 'details', 'summary',
  ]);
  out = out.replace(/<\/?([A-Z][A-Za-z0-9]*)[^>]*>/g, (match, tag) => {
    if (standardHtmlTags.has(tag.toLowerCase())) return match;
    return '';
  });

  // Collapse multiple blank lines into two
  out = out.replace(/\n{3,}/g, '\n\n');

  return out.trim();
}

/**
 * Injects or updates frontmatter with sidebar_position.
 * @param {string} content
 * @param {number} position
 * @returns {string}
 */
function injectSidebarPosition(content, position) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
  if (frontmatterRegex.test(content)) {
    return content.replace(frontmatterRegex, (match, fm) => {
      if (/sidebar_position\s*:/.test(fm)) {
        fm = fm.replace(/sidebar_position\s*:.*/, `sidebar_position: ${position}`);
      } else {
        fm = `sidebar_position: ${position}\n${fm}`;
      }
      return `---\n${fm}\n---`;
    });
  }
  return `---\nsidebar_position: ${position}\n---\n\n${content}`;
}

/**
 * Flattens Mintlify navigation into a list of {file, position} entries.
 * @param {Array} nav
 * @param {object} counter - mutable counter { value }
 * @returns {Array<{file: string, position: number}>}
 */
function flattenNav(nav, counter) {
  const result = [];
  for (const item of nav) {
    if (typeof item === 'string') {
      result.push({ file: item, position: counter.value++ });
    } else if (item && typeof item === 'object') {
      if (Array.isArray(item.pages)) {
        result.push(...flattenNav(item.pages, counter));
      }
    }
  }
  return result;
}

function findConfigFile(dir) {
  if (fs.existsSync(path.join(dir, 'mint.json'))) return path.join(dir, 'mint.json');
  if (fs.existsSync(path.join(dir, 'docs.json'))) return path.join(dir, 'docs.json');
  return null;
}

function resolveDocFile(dir, ref) {
  // ref is like "quickstart" or "guides/advanced/config" (no extension)
  const candidates = [
    path.join(dir, ref + '.mdx'),
    path.join(dir, ref + '.md'),
    path.join(dir, ref, 'index.mdx'),
    path.join(dir, ref, 'index.md'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function main() {
  const dir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();

  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    process.exit(1);
  }

  const configPath = findConfigFile(dir);
  if (!configPath) {
    console.error('No mint.json or docs.json found in', dir);
    process.exit(1);
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    console.error('Failed to parse config:', e.message);
    process.exit(1);
  }

  const nav = config.navigation;
  if (!Array.isArray(nav)) {
    console.error('"navigation" key not found or not an array in', configPath);
    process.exit(1);
  }

  const counter = { value: 1 };
  const entries = flattenNav(nav, counter);

  let processedCount = 0;
  let strippedCount = 0;
  const missing = [];

  for (const { file, position } of entries) {
    const resolved = resolveDocFile(dir, file);
    if (!resolved) {
      missing.push(file);
      continue;
    }

    let content = fs.readFileSync(resolved, 'utf8');
    const originalLength = content.length;

    // Apply MDX → MD conversion
    const converted = mdxToMd(content);
    if (converted.length !== originalLength) {
      strippedCount++;
    }

    // Inject sidebar_position
    const withPosition = injectSidebarPosition(converted, position);

    fs.writeFileSync(resolved, withPosition, 'utf8');
    processedCount++;
  }

  console.log(`Processed ${processedCount} files, stripped ${strippedCount} components`);
  if (missing.length > 0) {
    console.log(`Missing files (${missing.length}): ${missing.join(', ')}`);
  }
}

main();
