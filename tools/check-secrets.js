#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const IGNORED = ['.git', 'node_modules', 'dist', '.venv', '.env.local', '.gitignore'];
const PATTERNS = [
  /sk-ant-[A-Za-z0-9-_]+/g, // Anthropic
  /x-api-key/gi,
  /AIza[0-9A-Za-z\-_]{35}/g, // Google API key pattern prefix
  /VITE_[A-Z0-9_]+/g,
  /ANTHROPIC/gi,
];

let matches = [];

function shouldIgnore(rel) {
  return IGNORED.some(i => rel.split(/[\\/]/).includes(i));
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(ROOT, full);
    if (shouldIgnore(rel)) continue;
    if (e.isDirectory()) {
      walk(full);
      continue;
    }
    // Only scan small-ish text files
    try {
      const stat = fs.statSync(full);
      if (stat.size > 1024 * 1024) continue; // skip >1MB
      const content = fs.readFileSync(full, 'utf8');
      for (const rx of PATTERNS) {
        const m = content.match(rx);
        if (m && m.length > 0) {
          matches.push({ file: rel, pattern: rx.toString(), sample: m.slice(0,3) });
        }
      }
    } catch (err) {
      // binary or unreadable, skip
      continue;
    }
  }
}

walk(ROOT);

if (matches.length > 0) {
  console.error('Potential secrets found:');
  for (const r of matches) {
    console.error(` - ${r.file}: ${r.pattern} -> ${JSON.stringify(r.sample)}`);
  }
  console.error('\nCommit blocked. Remove secrets from files or update .gitignore.');
  process.exit(1);
} else {
  console.log('No potential secrets detected.');
  process.exit(0);
}
