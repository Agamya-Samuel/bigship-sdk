#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'apps/docs/src/content/docs/api/globals.md');
const frontmatter = '---\ntitle: API Reference\ndescription: Complete API reference for @agamya/bigship-sdk\n---\n\n';

if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  if (!content.startsWith('---')) {
    fs.writeFileSync(file, frontmatter + content);
    console.log('Frontmatter added to globals.md');
  } else {
    console.log('globals.md already has frontmatter');
  }
} else {
  console.log('globals.md not found');
}
