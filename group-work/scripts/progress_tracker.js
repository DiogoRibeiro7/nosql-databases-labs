#!/usr/bin/env node

/**
 * Progress Tracker for Group Submissions
 */

const fs = require('fs');
const path = require('path');

console.log('Progress Tracker v1.0.0');
console.log('=======================\n');

const groupWorkDir = path.join(__dirname, '..');
const groups = fs.readdirSync(groupWorkDir)
  .filter(dir => dir.startsWith('group_'));

console.log(`Tracking progress for ${groups.length} groups:\n`);

groups.forEach(group => {
  const groupPath = path.join(groupWorkDir, group);
  const readmePath = path.join(groupPath, 'README.md');

  if (fs.existsSync(readmePath)) {
    console.log(`✓ ${group}: README exists`);
  } else {
    console.log(`✗ ${group}: Missing README`);
  }
});

console.log('\nProgress tracking complete.');
process.exit(0);