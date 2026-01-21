// Test file to verify RatingService export
const fs = require('fs');
const path = require('path');

const domainPath = path.join(__dirname, 'lib', 'domain.ts');
const content = fs.readFileSync(domainPath, 'utf8');

// Search for the RatingService export
const ratingServiceMatch = content.match(/export\s+class\s+RatingService/);

if (ratingServiceMatch) {
  console.log('✓ RatingService export found in domain.ts');
  console.log('Match:', ratingServiceMatch[0]);
} else {
  console.log('✗ RatingService export NOT found in domain.ts');
}

// Check if the file ends properly
const lines = content.split('\n');
console.log(`Total lines: ${lines.length}`);
console.log(`Last 5 lines:`);
lines.slice(-5).forEach((line, i) => {
  console.log(`  ${lines.length - 5 + i}: ${line}`);
});

