const fs = require('fs');
const { execSync } = require('child_process');

const raw = fs.readFileSync('/Users/dougsimpson/Downloads/Google Search keyword report.csv', 'utf8');
const lines = raw.split('\n').filter(l => l.trim());
const dataLines = lines.slice(3);
const keywords = [];

for (const line of dataLines) {
  const cols = line.split(',');
  if (cols[0].trim() !== 'Enabled') continue;
  let kw = cols[1].trim().replace(/^"+|"+$/g, '').replace(/^\[|\]$/g, '').trim();
  if (!kw) continue;
  const mt = cols[2].trim().toLowerCase();
  if (mt.includes('broad')) keywords.push(kw);
  else if (mt.includes('phrase')) keywords.push('"' + kw + '"');
  else if (mt.includes('exact')) keywords.push('[' + kw + ']');
}

const result = keywords.join(', ');
execSync('pbcopy', { input: result });
console.log('Copied to clipboard:\n');
console.log(result);
