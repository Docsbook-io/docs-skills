#!/usr/bin/env node
'use strict';

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { parse: parseHtml } = require('node-html-parser');

/**
 * Fetch a URL and return the response body as a string.
 * Follows redirects up to 5 times.
 * @param {string} targetUrl
 * @param {number} [redirects=0]
 * @returns {Promise<{body: string, finalUrl: string, statusCode: number}>}
 */
function fetchUrl(targetUrl, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) {
      return reject(new Error('Too many redirects'));
    }
    const parsed = new url.URL(targetUrl);
    const lib = parsed.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DocsCrawler/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000,
    };

    const req = lib.request(options, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        const redirectTo = new url.URL(res.headers.location, targetUrl).toString();
        res.resume();
        return resolve(fetchUrl(redirectTo, redirects + 1));
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          body: Buffer.concat(chunks).toString('utf8'),
          finalUrl: targetUrl,
          statusCode: res.statusCode,
        });
      });
      res.on('error', reject);
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${targetUrl}`));
    });
    req.end();
  });
}

/**
 * Parse sitemap XML and return list of URLs.
 * @param {string} xml
 * @returns {string[]}
 */
function parseSitemap(xml) {
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
  return matches.map((m) => m[1].trim());
}

/**
 * Convert a URL path to a safe output filename.
 * @param {string} urlPath
 * @returns {string} relative file path like "guides/getting-started.md"
 */
function urlPathToFilename(urlPath) {
  // Normalize
  let p = urlPath.replace(/\?.*$/, '').replace(/#.*$/, '');
  // Remove leading/trailing slashes
  p = p.replace(/^\/+|\/+$/g, '');
  if (!p || p === '') p = 'index';

  // Split segments and kebab-case each
  const segments = p.split('/').map((seg) =>
    seg
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'index'
  );

  // Add .md extension to last segment
  let last = segments[segments.length - 1];
  if (!last.endsWith('.md')) {
    last = last + '.md';
  }
  segments[segments.length - 1] = last;

  return segments.join('/');
}

/**
 * Convert an HTML element tree to Markdown string (basic).
 * @param {import('node-html-parser').HTMLElement} root
 * @param {string} baseUrl
 * @returns {string}
 */
function htmlToMarkdown(root, baseUrl) {
  function nodeToMd(node, listDepth = 0) {
    if (node.nodeType === 3) {
      // Text node
      return node.rawText.replace(/\r/g, '');
    }
    if (node.nodeType !== 1) return '';

    const tag = (node.tagName || '').toLowerCase();
    const children = node.childNodes;

    function childrenMd(depth) {
      return children.map((c) => nodeToMd(c, depth)).join('');
    }

    // Skip script, style, noscript
    if (['script', 'style', 'noscript', 'svg'].includes(tag)) return '';

    switch (tag) {
      case 'h1': return `\n\n# ${childrenMd().trim()}\n\n`;
      case 'h2': return `\n\n## ${childrenMd().trim()}\n\n`;
      case 'h3': return `\n\n### ${childrenMd().trim()}\n\n`;
      case 'h4': return `\n\n#### ${childrenMd().trim()}\n\n`;
      case 'h5': return `\n\n##### ${childrenMd().trim()}\n\n`;
      case 'h6': return `\n\n###### ${childrenMd().trim()}\n\n`;

      case 'p': return `\n\n${childrenMd().trim()}\n\n`;

      case 'br': return '\n';

      case 'strong':
      case 'b': return `**${childrenMd().trim()}**`;

      case 'em':
      case 'i': return `*${childrenMd().trim()}*`;

      case 'code': {
        const parentTag = (node.parentNode && node.parentNode.tagName || '').toLowerCase();
        if (parentTag === 'pre') return childrenMd();
        return `\`${childrenMd().trim()}\``;
      }

      case 'pre': {
        const codeNode = node.querySelector('code');
        let lang = '';
        if (codeNode) {
          const cls = codeNode.getAttribute('class') || '';
          const langMatch = cls.match(/language-(\w+)/);
          if (langMatch) lang = langMatch[1];
        }
        const codeContent = codeNode ? codeNode.text : node.text;
        return `\n\n\`\`\`${lang}\n${codeContent}\n\`\`\`\n\n`;
      }

      case 'blockquote': {
        const inner = childrenMd().trim();
        return '\n\n' + inner.split('\n').map((l) => `> ${l}`).join('\n') + '\n\n';
      }

      case 'ul': {
        const items = node.querySelectorAll(':scope > li');
        if (items.length === 0) {
          // Fallback: process children
          return '\n' + childrenMd(listDepth) + '\n';
        }
        return '\n' + items.map((li) => {
          const indent = '  '.repeat(listDepth);
          return `${indent}- ${nodeToMd(li, listDepth + 1).trim()}`;
        }).join('\n') + '\n';
      }

      case 'ol': {
        const items = node.querySelectorAll(':scope > li');
        if (items.length === 0) {
          return '\n' + childrenMd(listDepth) + '\n';
        }
        return '\n' + items.map((li, i) => {
          const indent = '  '.repeat(listDepth);
          return `${indent}${i + 1}. ${nodeToMd(li, listDepth + 1).trim()}`;
        }).join('\n') + '\n';
      }

      case 'li': return childrenMd(listDepth);

      case 'a': {
        const href = node.getAttribute('href') || '';
        const text = childrenMd().trim() || href;
        if (!href) return text;
        let finalHref = href;
        try {
          const resolved = new url.URL(href, baseUrl);
          const base = new url.URL(baseUrl);
          if (resolved.hostname === base.hostname) {
            finalHref = resolved.pathname + resolved.search + resolved.hash;
          } else {
            finalHref = resolved.toString();
          }
        } catch (_) {}
        return `[${text}](${finalHref})`;
      }

      case 'img': {
        const src = node.getAttribute('src') || '';
        const alt = node.getAttribute('alt') || '';
        if (!src) return '';
        let finalSrc = src;
        try {
          finalSrc = new url.URL(src, baseUrl).toString();
        } catch (_) {}
        return `![${alt}](${finalSrc})`;
      }

      case 'table': {
        const rows = node.querySelectorAll('tr');
        if (rows.length === 0) return '';

        const mdRows = rows.map((row) => {
          const cells = [...row.querySelectorAll('th'), ...row.querySelectorAll('td')];
          // Actually get all cells in order
          const allCells = row.querySelectorAll('th,td');
          return '| ' + allCells.map((c) => nodeToMd(c).trim().replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ') + ' |';
        });

        // Insert separator after first row
        if (mdRows.length > 1) {
          const firstRowCols = rows[0].querySelectorAll('th,td').length;
          const sep = '| ' + Array(firstRowCols).fill('---').join(' | ') + ' |';
          mdRows.splice(1, 0, sep);
        }
        return '\n\n' + mdRows.join('\n') + '\n\n';
      }

      case 'thead':
      case 'tbody':
      case 'tfoot':
      case 'tr':
      case 'th':
      case 'td':
        return childrenMd();

      case 'hr': return '\n\n---\n\n';

      case 'div':
      case 'section':
      case 'article':
      case 'main':
      case 'aside':
      case 'figure':
      case 'figcaption':
      case 'header':
      case 'footer':
      case 'nav':
      case 'span':
      default:
        return childrenMd();
    }
  }

  let md = nodeToMd(root);
  // Clean up excessive blank lines
  md = md.replace(/\n{3,}/g, '\n\n').trim();
  return md + '\n';
}

/**
 * Extract the main content element from a parsed HTML document.
 * @param {import('node-html-parser').HTMLElement} doc
 * @returns {import('node-html-parser').HTMLElement}
 */
function extractMainContent(doc) {
  const selectors = ['main', 'article', '[role="main"]', '.content', '.docs-content'];
  for (const sel of selectors) {
    const el = doc.querySelector(sel);
    if (el) return el;
  }

  // Fall back to body minus nav, header, footer, aside
  const body = doc.querySelector('body');
  if (!body) return doc;

  // Remove unwanted elements
  for (const unwanted of ['header', 'footer', 'nav', 'aside']) {
    const els = body.querySelectorAll(unwanted);
    for (const el of els) el.remove();
  }
  return body;
}

/**
 * Extract internal links from a parsed HTML document.
 * @param {import('node-html-parser').HTMLElement} doc
 * @param {string} baseUrl
 * @returns {string[]}
 */
function extractInternalLinks(doc, baseUrl) {
  const base = new url.URL(baseUrl);
  const links = [];
  const anchors = doc.querySelectorAll('a[href]');
  for (const a of anchors) {
    const href = a.getAttribute('href') || '';
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) continue;
    try {
      const resolved = new url.URL(href, baseUrl);
      if (resolved.hostname === base.hostname) {
        links.push(resolved.pathname + resolved.search);
      }
    } catch (_) {}
  }
  return [...new Set(links)];
}

/**
 * Crawl a website and save pages as Markdown files.
 * @param {string} startUrl
 * @param {string} outputDir
 * @param {object} options
 * @param {number} [options.maxPages]
 * @param {string[]} [options.priorityPaths]
 * @param {string[]} [options.skipPaths]
 * @returns {Promise<{crawled: number, errors: number, files: string[]}>}
 */
async function crawlSite(startUrl, outputDir, options = {}) {
  const {
    maxPages = 50,
    priorityPaths = [],
    skipPaths = [],
  } = options;

  const baseUrl = new url.URL(startUrl);
  const origin = baseUrl.origin;

  fs.mkdirSync(outputDir, { recursive: true });

  const visited = new Set();
  const failed = new Set();
  const files = [];

  // Priority queue: higher priority items first
  function isPriority(urlPath) {
    return priorityPaths.some((p) => urlPath.startsWith('/' + p) || urlPath.startsWith(p));
  }

  function shouldSkip(urlPath) {
    return skipPaths.some((p) => urlPath.includes(p));
  }

  // Normalize URL path for deduplication
  function normalizePath(urlPath) {
    return urlPath.replace(/\/$/, '') || '/';
  }

  const queue = []; // [{urlPath, priority}]

  function enqueue(urlPath) {
    const norm = normalizePath(urlPath);
    if (visited.has(norm) || failed.has(norm)) return;
    if (shouldSkip(norm)) return;
    if (queue.some((q) => normalizePath(q.urlPath) === norm)) return;
    visited.add(norm); // mark as seen to avoid duplicates in queue
    const priority = isPriority(norm) ? 1 : 0;
    if (priority) {
      queue.unshift({ urlPath: norm, priority });
    } else {
      queue.push({ urlPath: norm, priority });
    }
  }

  // Try sitemap first
  const sitemapUrl = origin + '/sitemap.xml';
  console.log(`Fetching sitemap: ${sitemapUrl}`);
  try {
    const { body, statusCode } = await fetchUrl(sitemapUrl);
    if (statusCode === 200 && body.includes('<loc>')) {
      const sitemapUrls = parseSitemap(body);
      console.log(`Found ${sitemapUrls.length} URLs in sitemap`);
      for (const u of sitemapUrls) {
        try {
          const parsed = new url.URL(u);
          if (parsed.origin === origin) {
            enqueue(parsed.pathname + parsed.search);
          }
        } catch (_) {}
      }
    }
  } catch (e) {
    console.log(`Sitemap not available: ${e.message}`);
  }

  // Add start URL
  const startPath = baseUrl.pathname + baseUrl.search;
  enqueue(startPath);

  let crawled = 0;
  let errors = 0;

  while (queue.length > 0 && crawled < maxPages) {
    const { urlPath } = queue.shift();
    const fullUrl = origin + urlPath;

    process.stdout.write(`[${crawled + 1}/${maxPages}] Fetching: ${fullUrl} ... `);

    try {
      const { body, statusCode, finalUrl } = await fetchUrl(fullUrl);

      if (statusCode !== 200) {
        console.log(`SKIP (${statusCode})`);
        errors++;
        continue;
      }

      const contentType = ''; // We don't have easy access to content-type here, assume HTML
      const doc = parseHtml(body, { lowerCaseTagName: true, comment: false });

      // Extract title
      const titleEl = doc.querySelector('title');
      const title = titleEl ? titleEl.text.trim() : '';

      // Extract main content
      const mainEl = extractMainContent(doc);
      const markdown = htmlToMarkdown(mainEl, finalUrl || fullUrl);

      // Determine output filename
      const parsedFinalUrl = (() => {
        try { return new url.URL(finalUrl || fullUrl); } catch (_) { return baseUrl; }
      })();
      const outRelPath = urlPathToFilename(parsedFinalUrl.pathname);
      const outAbsPath = path.join(outputDir, outRelPath);

      fs.mkdirSync(path.dirname(outAbsPath), { recursive: true });

      const fileContent = title ? `# ${title}\n\n${markdown}` : markdown;
      fs.writeFileSync(outAbsPath, fileContent, 'utf8');
      files.push(outAbsPath);
      crawled++;
      console.log(`OK → ${outRelPath}`);

      // Extract and enqueue new links
      const newLinks = extractInternalLinks(doc, fullUrl);
      for (const link of newLinks) {
        enqueue(link);
      }
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
      errors++;
    }
  }

  return { crawled, errors, files };
}

module.exports = { crawlSite };

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/crawl-site.js <url> [output-dir] [options]');
    console.error('Options:');
    console.error('  --max-pages=50               Maximum pages to crawl (default: 50)');
    console.error('  --priority-paths=docs,help   Comma-separated priority path prefixes');
    console.error('  --skip-paths=blog,login      Comma-separated paths to skip');
    process.exit(1);
  }

  const positional = [];
  const opts = {};
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, val] = arg.slice(2).split('=');
      opts[key] = val ?? true;
    } else {
      positional.push(arg);
    }
  }

  const startUrl = positional[0];
  const outputDir = positional[1] ? path.resolve(positional[1]) : path.resolve('./crawled');
  const maxPages = opts['max-pages'] ? parseInt(opts['max-pages'], 10) : 50;
  const priorityPaths = opts['priority-paths'] ? opts['priority-paths'].split(',').map((s) => s.trim()) : [];
  const skipPaths = opts['skip-paths'] ? opts['skip-paths'].split(',').map((s) => s.trim()) : [];

  console.log(`\nCrawling: ${startUrl}`);
  console.log(`Output:   ${outputDir}`);
  console.log(`Max pages: ${maxPages}`);
  if (priorityPaths.length) console.log(`Priority paths: ${priorityPaths.join(', ')}`);
  if (skipPaths.length) console.log(`Skip paths: ${skipPaths.join(', ')}`);
  console.log('');

  crawlSite(startUrl, outputDir, { maxPages, priorityPaths, skipPaths })
    .then(({ crawled, errors, files }) => {
      console.log('\n--- Crawl Summary ---');
      console.log(`Pages crawled: ${crawled}`);
      console.log(`Errors:        ${errors}`);
      console.log(`Output files:  ${files.length}`);
      console.log(`Output dir:    ${outputDir}`);
    })
    .catch((e) => {
      console.error('Fatal error:', e.message);
      process.exit(1);
    });
}
