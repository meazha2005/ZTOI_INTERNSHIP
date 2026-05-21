const fs = require('fs');
const path = require('path');

const chunkPath = path.join(__dirname, '.next/server/chunks/7928.js');
if (!fs.existsSync(chunkPath)) {
  console.log('Chunk file not found at:', chunkPath);
  process.exit(1);
}

const content = fs.readFileSync(chunkPath, 'utf-8');
const lines = content.split('\n');

// The error is in line 4 (1-indexed, so lines[3]) around char 40267 (0-indexed or 1-indexed)
// Let's print chars 39500 to 41000 of line 4 (lines[3])
const line4 = lines[3];
if (line4) {
  console.log(`Line 4 length: ${line4.length}`);
  const start = Math.max(0, 40267 - 250);
  const end = Math.min(line4.length, 40267 + 250);
  console.log('--- Code surrounding position 40267 ---');
  console.log(line4.substring(start, end));
} else {
  console.log('Line 4 not found in chunk!');
}
