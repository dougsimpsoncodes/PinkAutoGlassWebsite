const fs = require('fs');
const { parse } = require('csv-parse/sync');

const content = fs.readFileSync('../assets/Google ads reports/search-terms.csv', 'utf-8');
const lines = content.trim().split('\n');

console.log('First 5 lines:');
lines.slice(0, 5).forEach((line, i) => {
  console.log(`${i}: ${line}`);
});

// Find header (must include "Search term" AND "Clicks")
let headerIndex = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Search term') && lines[i].includes('Clicks')) {
    headerIndex = i;
    console.log(`\nFound header at line ${i}: ${lines[i]}`);
    break;
  }
}

const headerContent = lines.slice(headerIndex).join('\n');
const records = parse(headerContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  relax_column_count: true,
});

console.log(`\nParsed ${records.length} records`);
console.log('\nFirst record:');
console.log(JSON.stringify(records[0], null, 2));

console.log('\nRecord with clicks (line 14 - windshield replacement colorado springs):');
const withClicks = records.find(r => r['Search term'] && r['Search term'].includes('windshield replacement colorado springs'));
if (withClicks) {
  console.log(JSON.stringify(withClicks, null, 2));
} else {
  console.log('Not found!');
}

console.log('\nAll column names:');
console.log(Object.keys(records[0]));
