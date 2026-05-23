#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Parses a GitBook SUMMARY.md list into a flat array of {title, file, position}.
 * Supports nested lists.
 * @param {string} content
 * @returns {Array<{title: string, file: string, position: number}>}
 */
function parseSummary(content) {
  const lines = content.split('\n');
  const entries = [];
  let position = 1;

  for (const line of lines) {
    // Match markdown list items with links: * [Title](path.md) or - [Title](path.md)
    const match = line.match(/^\s*[-*]\s+\[([^\]]+)\]\(([^)]+)\)/);
    if (match) {
      const title = match[1].trim();
      let file = match[2].trim();

      // Skip anchors and external links
      if (file.startsWith('#') || /^https?:\/\//.test(file)) continue;

      // Strip URL fragments
      file = file.split('#')[0];

      if (!file) continue;

      entries.push({ title, file, position: position++ });
    }
  }

  return entries;
}

/**
 * Injects or updates frontmatter with sidebar_position and title.
 * @param {string} content
 * @param {number} position
 * @param {string} title
 * @returns {string}
 */
function injectFrontmatter(content, position, title) {
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

  return `---\nsidebar_position: ${position}\ntitle: "${title.replace(/"/g, '\\"')}"\n---\n\n${content}`;
}

/**
 * Converts GitBook-specific syntax in a markdown string to plain markdown.
 * @param {string} content
 * @returns {{ content: string, replacements: number }}
 */
function convertGitbookSyntax(content) {
  let out = content;
  let replacements = 0;

  const replace = (regex, fn) => {
    out = out.replace(regex, (...args) => {
      replacements++;
      return fn(...args);
    });
  };

  // {% hint style="info" %} → > **Note:**
  replace(/{%\s*hint\s+style=["']info["']\s*%}/g, () => '> **Note:**');

  // {% hint style="warning" %} → > **Warning:**
  replace(/{%\s*hint\s+style=["']warning["']\s*%}/g, () => '> **Warning:**');

  // {% hint style="danger" %} → > **Danger:**
  replace(/{%\s*hint\s+style=["']danger["']\s*%}/g, () => '> **Danger:**');

  // {% hint style="success" %} → > **Tip:**
  replace(/{%\s*hint\s+style=["']success["']\s*%}/g, () => '> **Tip:**');

  // {% endhint %} → empty line
  replace(/{%\s*endhint\s*%}/g, () => '');

  // {% embed url="X" %} → [Link](X)
  replace(/{%\s*embed\s+url=["']([^"']+)["']\s*%}/g, (_, url) => `[Link](${url})`);

  // {% file src="X" %} → [Download](X)
  replace(/{%\s*file\s+src=["']([^"']+)["']\s*%}/g, (_, src) => `[Download](${src})`);

  // {% content-ref url="X" %} ... {% endcontent-ref %} → [See also](X)
  replace(/{%\s*content-ref\s+url=["']([^"']+)["']\s*%}[\s\S]*?{%\s*endcontent-ref\s*%}/g, (_, url) => `[See also](${url})`);

  // Tabs: extract tab content, use #### TabName as headers
  // {% tabs %} ... {% endtabs %} wrapper
  replace(/{%\s*tabs\s*%}([\s\S]*?){%\s*endtabs\s*%}/g, (_, body) => {
    // Convert each tab inside
    let tabBody = body.replace(/{%\s*tab\s+title=["']([^"']+)["']\s*%}([\s\S]*?){%\s*endtab\s*%}/g, (__, title, tabContent) => {
      return `#### ${title}\n\n${tabContent.trim()}`;
    });
    // Remove any leftover tab tags
    tabBody = tabBody.replace(/{%\s*tab[^%]*%}/g, '');
    tabBody = tabBody.replace(/{%\s*endtab\s*%}/g, '');
    return tabBody.trim();
  });

  // Standalone {% tab title="X" %} (outside tabs block, just in case)
  replace(/{%\s*tab\s+title=["']([^"']+)["']\s*%}/g, (_, title) => `#### ${title}`);

  // {% endtab %} → remove
  replace(/{%\s*endtab\s*%}/g, () => '');

  // {% tabs %} / {% endtabs %} leftover wrappers
  replace(/{%\s*tabs\s*%}/g, () => '');
  replace(/{%\s*endtabs\s*%}/g, () => '');

  // Catch-all: remove remaining GitBook block tags
  replace(/{%[^%]*%}/g, () => '');

  // Collapse multiple blank lines
  out = out.replace(/\n{3,}/g, '\n\n');

  return { content: out.trim(), replacements };
}

/**
 * Recursively collects all .md files in a directory.
 * @param {string} dir
 * @returns {string[]}
 */
function collectMdFiles(dir) {
  const results = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip hidden dirs
      if (!entry.name.startsWith('.')) {
        results.push(...collectMdFiles(full));
      }
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.markdown'))) {
      results.push(full);
    }
  }
  return results;
}

function main() {
  const dir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();

  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    process.exit(1);
  }

  const summaryPath = path.join(dir, 'SUMMARY.md');
  if (!fs.existsSync(summaryPath)) {
    console.error('No SUMMARY.md found in', dir);
    process.exit(1);
  }

  const summaryContent = fs.readFileSync(summaryPath, 'utf8');
  const entries = parseSummary(summaryContent);

  // Step 1: Write sidebar_position frontmatter to each referenced file
  let frontmatterCount = 0;
  const missingFiles = [];

  for (const { title, file, position } of entries) {
    const filePath = path.resolve(dir, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
      continue;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const updated = injectFrontmatter(content, position, title);
    fs.writeFileSync(filePath, updated, 'utf8');
    frontmatterCount++;
  }

  // Step 2: Convert GitBook-specific syntax in ALL .md files in the directory
  const allMdFiles = collectMdFiles(dir);
  let processedFiles = 0;
  let totalReplacements = 0;

  for (const filePath of allMdFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: converted, replacements } = convertGitbookSyntax(content);

    if (replacements > 0) {
      fs.writeFileSync(filePath, converted, 'utf8');
      processedFiles++;
      totalReplacements += replacements;
    }
  }

  // Summary
  console.log(`Parsed SUMMARY.md: ${entries.length} entries`);
  console.log(`Wrote sidebar_position to ${frontmatterCount} files`);
  console.log(`Converted GitBook syntax in ${processedFiles} files (${totalReplacements} replacements)`);

  if (missingFiles.length > 0) {
    console.log(`Missing files (${missingFiles.length}): ${missingFiles.join(', ')}`);
  }
}

main();
