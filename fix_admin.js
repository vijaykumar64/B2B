import fs from 'fs';
let lines = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8').split('\n');

let newLines = [];
for (let i = 0; i < lines.length; i++) {
  const lineNum = i + 1;
  if (lineNum >= 67 && lineNum <= 71) continue;
  if (lineNum >= 663 && lineNum <= 997) continue;
  if (lineNum >= 1081 && lineNum <= 1128) continue;
  newLines.push(lines[i]);
}

fs.writeFileSync('src/components/AdminDashboard.tsx', newLines.join('\n'));
console.log('Done');
