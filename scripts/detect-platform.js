#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Detects the documentation platform used in the given directory.
 * @param {string} dir - Path to the directory to inspect
 * @returns {string} One of: mintlify | gitbook | docusaurus | nextra | vitepress | starlight | plain | unknown
 */
function detectPlatform(dir) {
  const exists = (p) => fs.existsSync(path.join(dir, p));
  const read = (p) => {
    try { return fs.readFileSync(path.join(dir, p), 'utf8'); } catch { return null; }
  };

  // mintlify: mint.json OR docs.json with "navigation" key
  if (exists('mint.json')) {
    return 'mintlify';
  }
  if (exists('docs.json')) {
    try {
      const docsJson = JSON.parse(read('docs.json') || '{}');
      if ('navigation' in docsJson) return 'mintlify';
    } catch { /* not valid JSON, skip */ }
  }

  // gitbook: SUMMARY.md AND (.gitbook/ directory OR GitBook reference in README)
  if (exists('SUMMARY.md')) {
    if (exists('.gitbook')) {
      return 'gitbook';
    }
    const readme = read('README.md') || read('readme.md') || '';
    if (/gitbook/i.test(readme)) {
      return 'gitbook';
    }
    // SUMMARY.md alone is a strong gitbook signal
    return 'gitbook';
  }

  // docusaurus: docusaurus.config.js OR docusaurus.config.ts
  if (exists('docusaurus.config.js') || exists('docusaurus.config.ts')) {
    return 'docusaurus';
  }

  // nextra: next.config.js/ts importing from 'nextra' OR theme.config.tsx
  if (exists('theme.config.tsx') || exists('theme.config.jsx')) {
    return 'nextra';
  }
  for (const configFile of ['next.config.js', 'next.config.ts', 'next.config.mjs']) {
    const content = read(configFile);
    if (content && /from\s+['"]nextra['"]|require\s*\(\s*['"]nextra['"]\s*\)/.test(content)) {
      return 'nextra';
    }
  }

  // vitepress: .vitepress/config.ts OR .vitepress/config.js
  if (exists('.vitepress/config.ts') || exists('.vitepress/config.js') || exists('.vitepress/config.mts') || exists('.vitepress/config.mjs')) {
    return 'vitepress';
  }

  // starlight: astro.config.mjs/ts containing 'starlight'
  for (const configFile of ['astro.config.mjs', 'astro.config.ts', 'astro.config.js', 'astro.config.mts']) {
    const content = read(configFile);
    if (content && /starlight/i.test(content)) {
      return 'starlight';
    }
  }

  // plain: has docs/ or doc/ directory with .md files, no special config
  for (const docsDir of ['docs', 'doc']) {
    if (exists(docsDir) && fs.statSync(path.join(dir, docsDir)).isDirectory()) {
      const files = fs.readdirSync(path.join(dir, docsDir));
      if (files.some((f) => f.endsWith('.md') || f.endsWith('.mdx'))) {
        return 'plain';
      }
    }
  }

  return 'unknown';
}

// Run as CLI
if (require.main === module) {
  const dir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    process.exit(1);
  }
  console.log(detectPlatform(dir));
}

module.exports = { detectPlatform };
