const fs = require('fs');

const CAMPAIGN = 'PinkAutoGlass';
const AD_GROUP = 'Pink Auto Glass 1';

const raw = fs.readFileSync('/Users/dougsimpson/Downloads/Google Search keyword report.csv', 'utf8');
const lines = raw.split('\n').filter(l => l.trim());

// Skip header rows (row 1 = title, row 2 = date, row 3 = column headers)
const dataLines = lines.slice(3);

const rows = [['Type', 'Status', 'Id', 'Campaign', 'Ad Group', 'Keyword', 'Match Type']];

for (const line of dataLines) {
  const cols = line.split(',');
  const status = cols[0].trim();
  if (status !== 'Enabled') continue;

  let keyword = cols[1].trim();
  const matchTypeRaw = cols[2].trim().toLowerCase();

  // Clean keyword text
  keyword = keyword.replace(/^"+|"+$/g, '').replace(/^\[|\]$/g, '').trim();
  if (!keyword) continue;

  let matchType;
  if (matchTypeRaw.includes('broad')) matchType = 'Broad';
  else if (matchTypeRaw.includes('phrase')) matchType = 'Phrase';
  else if (matchTypeRaw.includes('exact')) matchType = 'Exact';
  else continue;

  rows.push(['Keyword', 'Active', '', CAMPAIGN, AD_GROUP, keyword, matchType]);
}

const csv = rows.map(r => r.join(',')).join('\n');
const outPath = '/Users/dougsimpson/.openclaw/workspace/PinkAutoGlassWebsite/microsoft-ads-fresh-upload.csv';
fs.writeFileSync(outPath, csv);
console.log(`Written ${rows.length - 1} keywords to ${outPath}`);
rows.slice(1).forEach(r => console.log(`  ${r[6]}: ${r[5]}`));
