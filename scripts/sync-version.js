const fs = require('fs');
const path = require('path');

const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));
const versionFile = path.resolve(__dirname, '../src/version.ts');

const content = fs.readFileSync(versionFile, 'utf8');
const updated = content.replace(
  /SDK_VERSION:\s*string\s*=\s*'[^']*'/,
  `SDK_VERSION: string = '${pkg.version}'`
);

if (content === updated) {
  console.log(`version.ts already at ${pkg.version}`);
} else {
  fs.writeFileSync(versionFile, updated);
  console.log(`Synced version.ts to ${pkg.version}`);
}
