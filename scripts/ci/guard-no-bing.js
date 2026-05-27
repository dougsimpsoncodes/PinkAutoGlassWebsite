#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const searchRoots = ['src', 'scripts'];
const ignored = new Set([
  path.normalize('scripts/ci/guard-no-bing.js'),
  path.normalize('scripts/verify-microsoft-migration.js'),
]);

const forbidden = [
  {
    name: 'ad_platform assignment to legacy bing value',
    pattern: /ad_platform\s*[:=]\s*['"`]bing['"`]/,
  },
  {
    name: 'Supabase ad_platform query for legacy bing value',
    pattern: /\.eq\(\s*['"`]ad_platform['"`]\s*,\s*['"`]bing['"`]\s*\)/,
  },
  {
    name: 'new bing_ads response key',
    pattern: /(?:^|[,{]\s*)['"`]?bing_ads['"`]?\s*:/,
  },
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;

    const fullPath = `${dir}${path.sep}${entry.name}`;
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    if (/\.(js|jsx|ts|tsx|mjs|cjs)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

const violations = [];
for (const searchRoot of searchRoots) {
  for (const file of walk(path.join(root, searchRoot))) {
    const relative = path.relative(root, file);
    if (ignored.has(path.normalize(relative))) continue;

    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const rule of forbidden) {
        if (rule.pattern.test(line)) {
          violations.push(`${relative}:${index + 1}: ${rule.name}`);
        }
      }
    });
  }
}

if (violations.length > 0) {
  console.error('[ad-platform-guard] Found legacy Bing platform writes/keys:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log('[ad-platform-guard] Passed.');
