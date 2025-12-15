#!/usr/bin/env node

/**
 * Standardize Group Folder Naming Script
 *
 * This script renames all group folders to follow a consistent naming convention:
 * - Format: group_XX (where XX is a zero-padded two-digit number)
 * - Example: group_01, group_02, ..., group_12
 *
 * Usage: node scripts/standardize_group_folders.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const GROUP_WORK_DIR = path.join(process.cwd(), 'group-work');
const DRY_RUN = process.argv.includes('--dry-run');

// Helper functions (without colors for compatibility)
const log = {
  success: (msg) => console.log('✓', msg),
  warning: (msg) => console.log('⚠', msg),
  error: (msg) => console.log('✗', msg),
  info: (msg) => console.log('ℹ', msg),
  change: (from, to) => console.log('→', `${from} → ${to}`)
};

// Extract group number from folder name
function extractGroupNumber(folderName) {
  // Match various patterns: group_01, Group_03, group-09, group01, etc.
  const patterns = [
    /group[_\-\s]*(\d+)/i,
    /Group[_\-\s]*(\d+)/,
    /g(\d+)/i
  ];

  for (const pattern of patterns) {
    const match = folderName.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }

  return null;
}

// Generate standardized folder name
function generateStandardName(groupNumber) {
  return `group_${String(groupNumber).padStart(2, '0')}`;
}

// Main function
async function standardizeGroupFolders() {
  console.log('\n📁 Standardizing Group Folder Names\n');

  if (DRY_RUN) {
    log.info('Running in DRY-RUN mode (no changes will be made)\n');
  }

  // Check if group-work directory exists
  if (!fs.existsSync(GROUP_WORK_DIR)) {
    log.error(`Group work directory not found: ${GROUP_WORK_DIR}`);
    return;
  }

  // Get all folders in group-work directory
  const items = fs.readdirSync(GROUP_WORK_DIR);
  const folders = items.filter(item => {
    const itemPath = path.join(GROUP_WORK_DIR, item);
    return fs.statSync(itemPath).isDirectory();
  });

  log.info(`Found ${folders.length} folders in group-work directory\n`);

  // Analyze and plan renaming
  const renamePlan = [];
  const skipped = [];
  const conflicts = new Map();

  for (const folder of folders) {
    // Skip special folders
    if (folder === 'scripts' || folder === 'templates' || folder.startsWith('.')) {
      skipped.push(folder);
      continue;
    }

    const groupNumber = extractGroupNumber(folder);

    if (groupNumber === null) {
      log.warning(`Cannot determine group number for: ${folder}`);
      skipped.push(folder);
      continue;
    }

    const standardName = generateStandardName(groupNumber);

    if (folder === standardName) {
      log.success(`Already standardized: ${folder}`);
    } else {
      // Check for conflicts
      if (conflicts.has(standardName)) {
        log.error(`Conflict detected: Both "${folder}" and "${conflicts.get(standardName)}" map to "${standardName}"`);
        skipped.push(folder);
      } else {
        conflicts.set(standardName, folder);
        renamePlan.push({
          from: folder,
          to: standardName,
          groupNumber
        });
      }
    }
  }

  // Display rename plan
  if (renamePlan.length > 0) {
    console.log('\n📋 Rename Plan:\n');
    renamePlan.sort((a, b) => a.groupNumber - b.groupNumber);
    renamePlan.forEach(plan => {
      log.change(plan.from, plan.to);
    });

    if (!DRY_RUN) {
      console.log('\n🔄 Executing Renames:\n');

      // Execute renames in two passes to avoid conflicts
      // Pass 1: Rename to temporary names
      const tempRenames = [];
      for (const plan of renamePlan) {
        const fromPath = path.join(GROUP_WORK_DIR, plan.from);
        const tempName = `_temp_${plan.to}_${Date.now()}`;
        const tempPath = path.join(GROUP_WORK_DIR, tempName);

        try {
          fs.renameSync(fromPath, tempPath);
          tempRenames.push({ temp: tempName, final: plan.to });
          log.info(`Temporarily renamed ${plan.from} to ${tempName}`);
        } catch (error) {
          log.error(`Failed to rename ${plan.from}: ${error.message}`);
        }
      }

      // Pass 2: Rename from temporary to final names
      console.log();
      for (const rename of tempRenames) {
        const tempPath = path.join(GROUP_WORK_DIR, rename.temp);
        const finalPath = path.join(GROUP_WORK_DIR, rename.final);

        try {
          fs.renameSync(tempPath, finalPath);
          log.success(`Renamed to final: ${rename.final}`);
        } catch (error) {
          log.error(`Failed to finalize ${rename.final}: ${error.message}`);
        }
      }
    }
  } else {
    log.success('\nAll group folders are already standardized!');
  }

  // Display skipped folders
  if (skipped.length > 0) {
    console.log('\n⏭️  Skipped Folders:\n');
    skipped.forEach(folder => {
      log.info(`Skipped: ${folder}`);
    });
  }

  // Create missing group folders if needed
  console.log('\n🔍 Checking for Missing Group Folders:\n');
  const existingNumbers = new Set();

  // Collect existing group numbers
  const finalFolders = fs.readdirSync(GROUP_WORK_DIR);
  finalFolders.forEach(folder => {
    const num = extractGroupNumber(folder);
    if (num !== null) {
      existingNumbers.add(num);
    }
  });

  // Check for gaps in numbering
  const maxGroup = Math.max(...Array.from(existingNumbers), 0);
  const missingGroups = [];

  for (let i = 1; i <= maxGroup; i++) {
    if (!existingNumbers.has(i)) {
      missingGroups.push(i);
    }
  }

  if (missingGroups.length > 0) {
    log.warning(`Missing group folders: ${missingGroups.map(n => generateStandardName(n)).join(', ')}`);

    if (!DRY_RUN) {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      readline.question('\nCreate missing folders? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
          missingGroups.forEach(num => {
            const folderName = generateStandardName(num);
            const folderPath = path.join(GROUP_WORK_DIR, folderName);
            fs.mkdirSync(folderPath, { recursive: true });
            log.success(`Created: ${folderName}`);

            // Create README for the group
            const readmePath = path.join(folderPath, 'README.md');
            const readmeContent = `# Group ${String(num).padStart(2, '0')}

## Members
- TBD

## Lab Submissions
- Lab 01: Not submitted
- Lab 02: Not submitted
- Lab 03: Not submitted
- Lab 04: Not submitted
- Lab 05: Not submitted

## Notes
- Group folder created on ${new Date().toISOString()}
`;
            fs.writeFileSync(readmePath, readmeContent);
          });
        }
        readline.close();
        generateReport();
      });
    } else {
      generateReport();
    }
  } else {
    log.success('No missing group folders detected');
    generateReport();
  }
}

// Generate summary report
function generateReport() {
  console.log('\n📊 Summary Report:\n');

  const finalFolders = fs.readdirSync(GROUP_WORK_DIR)
    .filter(item => {
      const itemPath = path.join(GROUP_WORK_DIR, item);
      return fs.statSync(itemPath).isDirectory() && item.match(/^group_\d{2}$/);
    })
    .sort();

  log.success(`Standardized group folders: ${finalFolders.length}`);
  console.log('Final structure:');
  finalFolders.forEach(folder => {
    console.log(`  - ${folder}`);
  });

  if (DRY_RUN) {
    console.log('\n📝 This was a dry run. No changes were made.');
    console.log('Run without --dry-run to apply changes.');
  } else {
    console.log('\n✅ Group folder standardization complete!');
  }
}

// Run the script
standardizeGroupFolders().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});