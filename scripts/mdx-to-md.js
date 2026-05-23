#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Convert an MDX string to clean Markdown.
 * @param {string} content
 * @returns {string}
 */
function convertString(content) {
  // Split into lines, track code-fence state
  const lines = content.split('\n');
  let inCodeBlock = false;
  const processedLines = [];

  // First pass: collect export const variables for substitution
  const exportVars = {};
  for (const line of lines) {
    const m = line.match(/^export\s+const\s+(\w+)\s*=\s*(['"`])(.*?)\2\s*;?\s*$/);
    if (m) exportVars[m[1]] = m[3];
    const mn = line.match(/^export\s+const\s+(\w+)\s*=\s*(-?\d+(?:\.\d+)?)\s*;?\s*$/);
    if (mn) exportVars[mn[1]] = mn[2];
  }

  // Second pass: line-by-line removal of import/export statements
  // We will join lines first to handle multi-line JSX, then do block replacements
  // But for import/export, we can do line-by-line since they're typically single-line
  const withoutImportExport = [];
  for (const line of lines) {
    // Track code fences
    if (/^```/.test(line.trimStart())) {
      inCodeBlock = !inCodeBlock;
      withoutImportExport.push(line);
      continue;
    }
    if (inCodeBlock) {
      withoutImportExport.push(line);
      continue;
    }

    // Remove import statements
    if (/^\s*import\s+/.test(line)) continue;

    // Remove export statements (but keep export const — handled separately)
    if (/^\s*export\s+(?!const\s)/.test(line)) continue;

    // Remove export const lines (we've already captured values)
    if (/^\s*export\s+const\s+/.test(line)) continue;

    // Substitute {varName} with captured export const values
    let processedLine = line;
    for (const [varName, val] of Object.entries(exportVars)) {
      const re = new RegExp(`\\{${varName}\\}`, 'g');
      processedLine = processedLine.replace(re, val);
    }

    withoutImportExport.push(processedLine);
  }

  // Join for multi-line component processing
  let text = withoutImportExport.join('\n');

  // Process JSX components — we need to handle nested tags carefully
  // We'll do multiple passes for different components

  // Helper: extract content between opening and closing tag (handles nesting)
  function extractTagContent(str, tagName, startIdx) {
    // startIdx points to start of the opening tag
    const openRe = new RegExp(`<${tagName}(?:\\s[^>]*)?>`, 'g');
    const closeStr = `</${tagName}>`;
    let depth = 0;
    let i = startIdx;
    let contentStart = -1;

    // Find the end of the opening tag
    const openTagRe = new RegExp(`^<${tagName}(\\s[^>]*?)?>`, '');
    const slice = str.slice(startIdx);
    const openMatch = slice.match(openTagRe);
    if (!openMatch) return null;

    const openTagEnd = startIdx + openMatch[0].length;
    contentStart = openTagEnd;
    depth = 1;
    i = openTagEnd;

    while (i < str.length && depth > 0) {
      const nextOpen = str.indexOf(`<${tagName}`, i);
      const nextClose = str.indexOf(closeStr, i);

      if (nextClose === -1) break; // malformed

      if (nextOpen !== -1 && nextOpen < nextClose) {
        // Check it's actually an opening tag (not self-closing before close)
        const betweenStr = str.slice(nextOpen);
        const tagCheck = betweenStr.match(new RegExp(`^<${tagName}(?:\\s[^>]*[^/])?>`));
        if (tagCheck) {
          depth++;
          i = nextOpen + tagCheck[0].length;
        } else {
          i = nextOpen + 1;
        }
      } else {
        depth--;
        if (depth === 0) {
          return {
            fullMatch: str.slice(startIdx, nextClose + closeStr.length),
            content: str.slice(contentStart, nextClose),
            closeEnd: nextClose + closeStr.length,
          };
        }
        i = nextClose + closeStr.length;
      }
    }
    return null;
  }

  // Helper: get attribute value from tag string
  function getAttr(tagStr, attrName) {
    const re = new RegExp(`${attrName}=(?:"([^"]*)"|'([^']*)'|\\{([^}]*)\\})`);
    const m = tagStr.match(re);
    if (!m) return null;
    return m[1] ?? m[2] ?? m[3] ?? null;
  }

  // Process code blocks — protect them from JSX replacement
  // We'll use a placeholder system
  const codeBlocks = [];
  text = text.replace(/```[\s\S]*?```/g, (match) => {
    const idx = codeBlocks.length;
    codeBlocks.push(match);
    return `\x00CODEBLOCK_${idx}\x00`;
  });
  // Also protect inline code
  const inlineCodes = [];
  text = text.replace(/`[^`\n]+`/g, (match) => {
    const idx = inlineCodes.length;
    inlineCodes.push(match);
    return `\x00INLINECODE_${idx}\x00`;
  });

  // Remove JSX comments
  text = text.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

  // Remove inline Icon components
  text = text.replace(/<Icon\s[^/]*/g, '').replace(/<Icon\s*\/>/g, '');
  text = text.replace(/<Icon\s+icon="[^"]*"\s*\/>/g, '');

  // Replace <br /> and <br>
  text = text.replace(/<br\s*\/?>/g, '\n');

  // Process Steps > Step
  text = text.replace(/<Steps>([\s\S]*?)<\/Steps>/g, (_, inner) => {
    let counter = 1;
    const result = inner.replace(/<Step(?:\s+title="([^"]*)")?>([\s\S]*?)<\/Step>/g, (__, title, body) => {
      const trimmedBody = body.trim().split('\n').map((l, i) => i === 0 ? l : '   ' + l).join('\n');
      const titlePart = title ? `**${title}**\n\n   ` : '';
      return `${counter++}. ${titlePart}${trimmedBody}`;
    });
    return result;
  });

  // Process Tabs > Tab
  text = text.replace(/<Tabs>([\s\S]*?)<\/Tabs>/g, (_, inner) => {
    const result = [];
    const tabRe = /<Tab\s+title="([^"]*)">([\s\S]*?)<\/Tab>/g;
    let m;
    while ((m = tabRe.exec(inner)) !== null) {
      result.push(`#### ${m[1]}\n\n${m[2].trim()}`);
    }
    return result.join('\n\n');
  });

  // Process CodeGroup (unwrap)
  text = text.replace(/<CodeGroup>([\s\S]*?)<\/CodeGroup>/g, (_, inner) => inner.trim());

  // Process CardGroup (unwrap)
  text = text.replace(/<CardGroup(?:\s+cols=\{?\d+\}?)?>([\s\S]*?)<\/CardGroup>/g, (_, inner) => inner.trim());

  // Process Card with href
  text = text.replace(/<Card\s([^>]*)>([\s\S]*?)<\/Card>/g, (_, attrs, body) => {
    const title = getAttr(attrs, 'title') ?? '';
    const href = getAttr(attrs, 'href');
    const trimBody = body.trim();
    if (href) {
      return `### [${title}](${href})\n\n${trimBody}`;
    } else {
      return `### ${title}\n\n${trimBody}`;
    }
  });

  // Process Frame with caption + img
  text = text.replace(/<Frame(?:\s+caption="([^"]*)")?>([\s\S]*?)<\/Frame>/g, (_, caption, inner) => {
    const imgMatch = inner.match(/<img\s+src="([^"]*)"(?:\s+alt="([^"]*)")?\s*\/?>/);
    if (imgMatch) {
      const src = imgMatch[1];
      const alt = caption ?? imgMatch[2] ?? '';
      return `![${alt}](${src})`;
    }
    return inner.trim();
  });

  // Process Note, Info, Tip, Warning, Check
  for (const [tag, label] of [['Note', 'Note'], ['Info', 'Info'], ['Tip', 'Tip'], ['Warning', 'Warning']]) {
    text = text.replace(new RegExp(`<${tag}>(([\\s\\S]*?))<\\/${tag}>`, 'g'), (_, body) => {
      return `> **${label}:** ${body.trim()}`;
    });
  }

  text = text.replace(/<Check>([\s\S]*?)<\/Check>/g, (_, body) => {
    return `- [x] ${body.trim()}`;
  });

  // Process Accordion
  text = text.replace(/<Accordion\s+title="([^"]*)">([\s\S]*?)<\/Accordion>/g, (_, title, body) => {
    return `<details><summary>${title}</summary>\n\n${body.trim()}\n\n</details>`;
  });

  // Process ResponseField and ParamField
  text = text.replace(/<ResponseField\s([^>]*)>([\s\S]*?)<\/ResponseField>/g, (_, attrs, body) => {
    const name = getAttr(attrs, 'name') ?? '';
    const type = getAttr(attrs, 'type') ?? '';
    return `**\`${name}\`** (\`${type}\`) — ${body.trim()}`;
  });

  text = text.replace(/<ParamField\s([^>]*)>([\s\S]*?)<\/ParamField>/g, (_, attrs, body) => {
    const name = getAttr(attrs, 'path') ?? getAttr(attrs, 'name') ?? '';
    const type = getAttr(attrs, 'type') ?? '';
    return `**\`${name}\`** (\`${type}\`) — ${body.trim()}`;
  });

  // Remove remaining unknown self-closing JSX tags (PascalCase or known)
  text = text.replace(/<[A-Z][A-Za-z]*(?:\s[^>]*)?\s*\/>/g, '');

  // Remove remaining unknown JSX opening/closing tags (PascalCase)
  text = text.replace(/<\/[A-Z][A-Za-z]*>/g, '');
  text = text.replace(/<[A-Z][A-Za-z]*(?:\s[^>]*)?>/g, '');

  // Restore code blocks and inline codes
  text = text.replace(/\x00CODEBLOCK_(\d+)\x00/g, (_, idx) => codeBlocks[parseInt(idx)]);
  text = text.replace(/\x00INLINECODE_(\d+)\x00/g, (_, idx) => inlineCodes[parseInt(idx)]);

  // Clean up: max 2 consecutive blank lines
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim() + '\n';
}

/**
 * Convert a single MDX file to Markdown.
 * @param {string} inputPath
 * @param {string} [outputPath]
 */
function convertMdxToMd(inputPath, outputPath) {
  const content = fs.readFileSync(inputPath, 'utf8');
  const result = convertString(content);

  if (!outputPath) {
    // Overwrite with backup
    const backupPath = inputPath + '.bak';
    fs.copyFileSync(inputPath, backupPath);
    outputPath = inputPath.replace(/\.mdx$/, '.md');
    if (outputPath === inputPath) outputPath = inputPath; // same if already .md
  }

  fs.writeFileSync(outputPath, result, 'utf8');
  return outputPath;
}

module.exports = { convertMdxToMd, convertString };

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/mdx-to-md.js <input-file-or-dir> [output-dir]');
    process.exit(1);
  }

  const inputPath = path.resolve(args[0]);
  const outputDir = args[1] ? path.resolve(args[1]) : null;

  const stat = fs.statSync(inputPath);

  if (stat.isDirectory()) {
    // Find all .mdx files recursively
    function findMdx(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files = [];
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...findMdx(fullPath));
        } else if (entry.name.endsWith('.mdx')) {
          files.push(fullPath);
        }
      }
      return files;
    }

    const mdxFiles = findMdx(inputPath);
    let converted = 0;
    for (const file of mdxFiles) {
      let outPath = null;
      if (outputDir) {
        const rel = path.relative(inputPath, file);
        outPath = path.join(outputDir, rel.replace(/\.mdx$/, '.md'));
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
      } else {
        outPath = file.replace(/\.mdx$/, '.md');
      }
      convertMdxToMd(file, outPath);
      console.log(`Converted: ${file} → ${outPath}`);
      converted++;
    }
    console.log(`\nDone: ${converted} files converted.`);
  } else {
    let outPath = null;
    if (outputDir) {
      fs.mkdirSync(outputDir, { recursive: true });
      const baseName = path.basename(inputPath).replace(/\.mdx$/, '.md');
      outPath = path.join(outputDir, baseName);
    } else {
      outPath = inputPath.replace(/\.mdx$/, '.md');
      if (outPath === inputPath) {
        // Already .md — backup and overwrite
        fs.copyFileSync(inputPath, inputPath + '.bak');
      }
    }
    convertMdxToMd(inputPath, outPath);
    console.log(`Converted: ${inputPath} → ${outPath}`);
  }
}
