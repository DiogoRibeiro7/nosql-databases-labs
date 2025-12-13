#!/usr/bin/env node

/**
 * Submission Versioning and History System
 *
 * This module tracks all submission versions, provides diff capabilities,
 * and maintains a complete history of changes for each group.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

class SubmissionVersioning {
  constructor() {
    this.historyPath = path.join('group-work', '.submission_history');
    this.metadataPath = path.join('group-work', 'submission_metadata.json');

    this.ensureHistoryDirectory();
    this.metadata = this.loadMetadata();
  }

  /**
   * Ensure history directory exists
   */
  ensureHistoryDirectory() {
    if (!fs.existsSync(this.historyPath)) {
      fs.mkdirSync(this.historyPath, { recursive: true });

      // Initialize git repo for version control
      try {
        execSync('git init', { cwd: this.historyPath });
        execSync('git config user.email "system@nosql-labs.edu"', { cwd: this.historyPath });
        execSync('git config user.name "Submission System"', { cwd: this.historyPath });
      } catch (error) {
        console.warn('Git initialization failed. Using file-based versioning.');
      }
    }
  }

  /**
   * Load metadata
   */
  loadMetadata() {
    if (fs.existsSync(this.metadataPath)) {
      return JSON.parse(fs.readFileSync(this.metadataPath, 'utf8'));
    }
    return {
      groups: {},
      submissions: [],
      statistics: {}
    };
  }

  /**
   * Save metadata
   */
  saveMetadata() {
    fs.writeFileSync(this.metadataPath, JSON.stringify(this.metadata, null, 2));
  }

  /**
   * Create a new submission version
   */
  createVersion(groupId, assignmentId, sourcePath, metadata = {}) {
    const versionId = this.generateVersionId();
    const timestamp = new Date().toISOString();

    // Create group directory in history if it doesn't exist
    const groupHistoryPath = path.join(this.historyPath, groupId);
    if (!fs.existsSync(groupHistoryPath)) {
      fs.mkdirSync(groupHistoryPath, { recursive: true });
    }

    // Create version directory
    const versionPath = path.join(groupHistoryPath, assignmentId, versionId);
    fs.mkdirSync(versionPath, { recursive: true });

    // Copy submission files
    this.copyDirectory(sourcePath, versionPath);

    // Calculate checksums
    const checksums = this.calculateChecksums(versionPath);

    // Create version metadata
    const versionData = {
      version_id: versionId,
      group_id: groupId,
      assignment_id: assignmentId,
      timestamp,
      checksums,
      file_count: Object.keys(checksums).length,
      total_size: this.getDirectorySize(versionPath),
      changes: {},
      metadata
    };

    // Check for previous version
    const previousVersion = this.getLatestVersion(groupId, assignmentId);
    if (previousVersion) {
      versionData.previous_version = previousVersion.version_id;
      versionData.changes = this.calculateChanges(previousVersion, versionData);
    }

    // Update group metadata
    if (!this.metadata.groups[groupId]) {
      this.metadata.groups[groupId] = {
        submissions: {},
        total_versions: 0
      };
    }

    if (!this.metadata.groups[groupId].submissions[assignmentId]) {
      this.metadata.groups[groupId].submissions[assignmentId] = {
        versions: [],
        latest_version: null
      };
    }

    this.metadata.groups[groupId].submissions[assignmentId].versions.push(versionData);
    this.metadata.groups[groupId].submissions[assignmentId].latest_version = versionId;
    this.metadata.groups[groupId].total_versions++;

    // Add to submissions list
    this.metadata.submissions.push({
      ...versionData,
      is_latest: true
    });

    // Mark previous version as not latest
    if (previousVersion) {
      const prevIndex = this.metadata.submissions.findIndex(
        s => s.version_id === previousVersion.version_id
      );
      if (prevIndex >= 0) {
        this.metadata.submissions[prevIndex].is_latest = false;
      }
    }

    // Try to commit to git
    this.gitCommit(versionPath, `Submission: ${groupId} - ${assignmentId} v${versionId}`);

    this.saveMetadata();
    return versionData;
  }

  /**
   * Generate version ID
   */
  generateVersionId() {
    return `v${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Copy directory recursively
   */
  copyDirectory(source, destination) {
    if (!fs.existsSync(source)) {
      throw new Error(`Source directory does not exist: ${source}`);
    }

    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }

    const items = fs.readdirSync(source);

    items.forEach(item => {
      const sourcePath = path.join(source, item);
      const destPath = path.join(destination, item);

      if (fs.statSync(sourcePath).isDirectory()) {
        if (item !== 'node_modules' && !item.startsWith('.')) {
          this.copyDirectory(sourcePath, destPath);
        }
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    });
  }

  /**
   * Calculate checksums for all files
   */
  calculateChecksums(dirPath) {
    const checksums = {};

    const calculateForDirectory = (currentPath, relativePath = '') => {
      const items = fs.readdirSync(currentPath);

      items.forEach(item => {
        const itemPath = path.join(currentPath, item);
        const relativeItemPath = path.join(relativePath, item);

        if (fs.statSync(itemPath).isDirectory()) {
          if (item !== 'node_modules' && !item.startsWith('.')) {
            calculateForDirectory(itemPath, relativeItemPath);
          }
        } else {
          const hash = crypto.createHash('sha256');
          const data = fs.readFileSync(itemPath);
          hash.update(data);
          checksums[relativeItemPath] = hash.digest('hex');
        }
      });
    };

    calculateForDirectory(dirPath);
    return checksums;
  }

  /**
   * Get directory size
   */
  getDirectorySize(dirPath) {
    let size = 0;

    const calculateSize = (currentPath) => {
      const items = fs.readdirSync(currentPath);

      items.forEach(item => {
        const itemPath = path.join(currentPath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          if (item !== 'node_modules' && !item.startsWith('.')) {
            calculateSize(itemPath);
          }
        } else {
          size += stats.size;
        }
      });
    };

    calculateSize(dirPath);
    return size;
  }

  /**
   * Calculate changes between versions
   */
  calculateChanges(previousVersion, currentVersion) {
    const changes = {
      added: [],
      modified: [],
      deleted: [],
      unchanged: []
    };

    const prevChecksums = previousVersion.checksums || {};
    const currChecksums = currentVersion.checksums || {};

    // Check for added and modified files
    Object.entries(currChecksums).forEach(([file, checksum]) => {
      if (!prevChecksums[file]) {
        changes.added.push(file);
      } else if (prevChecksums[file] !== checksum) {
        changes.modified.push(file);
      } else {
        changes.unchanged.push(file);
      }
    });

    // Check for deleted files
    Object.keys(prevChecksums).forEach(file => {
      if (!currChecksums[file]) {
        changes.deleted.push(file);
      }
    });

    changes.summary = {
      added: changes.added.length,
      modified: changes.modified.length,
      deleted: changes.deleted.length,
      unchanged: changes.unchanged.length
    };

    return changes;
  }

  /**
   * Get latest version for a submission
   */
  getLatestVersion(groupId, assignmentId) {
    const group = this.metadata.groups[groupId];
    if (!group || !group.submissions[assignmentId]) {
      return null;
    }

    const versions = group.submissions[assignmentId].versions;
    return versions.length > 0 ? versions[versions.length - 1] : null;
  }

  /**
   * Get version history
   */
  getVersionHistory(groupId, assignmentId = null) {
    const group = this.metadata.groups[groupId];
    if (!group) {
      return [];
    }

    if (assignmentId) {
      return group.submissions[assignmentId]?.versions || [];
    }

    // Return all versions for the group
    const allVersions = [];
    Object.entries(group.submissions).forEach(([assignment, data]) => {
      allVersions.push(...data.versions);
    });

    return allVersions.sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }

  /**
   * Compare two versions
   */
  compareVersions(versionId1, versionId2) {
    const version1 = this.metadata.submissions.find(s => s.version_id === versionId1);
    const version2 = this.metadata.submissions.find(s => s.version_id === versionId2);

    if (!version1 || !version2) {
      throw new Error('One or both versions not found');
    }

    const comparison = {
      version1: {
        id: version1.version_id,
        timestamp: version1.timestamp,
        file_count: version1.file_count,
        size: version1.total_size
      },
      version2: {
        id: version2.version_id,
        timestamp: version2.timestamp,
        file_count: version2.file_count,
        size: version2.total_size
      },
      changes: this.calculateChanges(version1, version2),
      time_difference: new Date(version2.timestamp) - new Date(version1.timestamp)
    };

    return comparison;
  }

  /**
   * Restore a specific version
   */
  restoreVersion(versionId, destinationPath) {
    const version = this.metadata.submissions.find(s => s.version_id === versionId);

    if (!version) {
      throw new Error(`Version ${versionId} not found`);
    }

    const versionPath = path.join(
      this.historyPath,
      version.group_id,
      version.assignment_id,
      version.version_id
    );

    if (!fs.existsSync(versionPath)) {
      throw new Error(`Version files not found at ${versionPath}`);
    }

    // Copy version files to destination
    this.copyDirectory(versionPath, destinationPath);

    return {
      restored: true,
      version_id: versionId,
      destination: destinationPath,
      files_restored: version.file_count
    };
  }

  /**
   * Git commit (if available)
   */
  gitCommit(path, message) {
    try {
      execSync(`git add .`, { cwd: this.historyPath });
      execSync(`git commit -m "${message}"`, { cwd: this.historyPath });
      return true;
    } catch (error) {
      // Git not available or commit failed
      return false;
    }
  }

  /**
   * Generate version report
   */
  generateReport() {
    const stats = {
      total_groups: Object.keys(this.metadata.groups).length,
      total_versions: this.metadata.submissions.length,
      total_size: 0,
      average_versions_per_group: 0,
      most_active_group: null,
      largest_submission: null
    };

    // Calculate statistics
    let maxVersions = 0;
    let maxSize = 0;

    Object.entries(this.metadata.groups).forEach(([groupId, data]) => {
      if (data.total_versions > maxVersions) {
        maxVersions = data.total_versions;
        stats.most_active_group = groupId;
      }
    });

    this.metadata.submissions.forEach(submission => {
      stats.total_size += submission.total_size || 0;
      if (submission.total_size > maxSize) {
        maxSize = submission.total_size;
        stats.largest_submission = submission;
      }
    });

    if (stats.total_groups > 0) {
      stats.average_versions_per_group = (stats.total_versions / stats.total_groups).toFixed(1);
    }

    let report = `# Submission Version History Report

Generated: ${new Date().toISOString()}

## Statistics

- **Total Groups:** ${stats.total_groups}
- **Total Versions:** ${stats.total_versions}
- **Total Size:** ${(stats.total_size / 1024 / 1024).toFixed(2)} MB
- **Average Versions per Group:** ${stats.average_versions_per_group}
- **Most Active Group:** ${stats.most_active_group || 'N/A'}

## Version History by Group

`;

    Object.entries(this.metadata.groups).forEach(([groupId, groupData]) => {
      report += `\n### ${groupId}\n\n`;

      Object.entries(groupData.submissions).forEach(([assignmentId, submissionData]) => {
        report += `#### ${assignmentId}\n\n`;
        report += `| Version | Timestamp | Files | Size | Changes |\n`;
        report += `|---------|-----------|-------|------|---------|`;

        submissionData.versions.forEach(version => {
          const timestamp = new Date(version.timestamp).toLocaleString();
          const size = (version.total_size / 1024).toFixed(1) + ' KB';
          const changes = version.changes?.summary ?
            `+${version.changes.summary.added} ~${version.changes.summary.modified} -${version.changes.summary.deleted}` :
            'Initial';

          report += `\n| ${version.version_id.substring(0, 8)}... | ${timestamp} | ${version.file_count} | ${size} | ${changes} |`;
        });

        report += '\n\n';
      });
    });

    // Recent submissions
    report += `\n## Recent Submissions\n\n`;
    report += `| Group | Assignment | Version | Timestamp |\n`;
    report += `|-------|------------|---------|-----------|`;

    this.metadata.submissions
      .filter(s => s.is_latest)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10)
      .forEach(submission => {
        const timestamp = new Date(submission.timestamp).toLocaleString();
        report += `\n| ${submission.group_id} | ${submission.assignment_id} | ${submission.version_id.substring(0, 8)}... | ${timestamp} |`;
      });

    return report;
  }
}

// CLI interface
function main() {
  const versioning = new SubmissionVersioning();
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Submission Versioning System

Usage:
  node submission_versioning.js [command] [options]

Commands:
  create <group> <assignment> <path>  Create new version
  history <group> [assignment]        Show version history
  compare <version1> <version2>       Compare two versions
  restore <version> <destination>     Restore a specific version
  report                              Generate version report

Examples:
  node submission_versioning.js create group_01 lab01 ./group-work/group_01
  node submission_versioning.js history group_01
  node submission_versioning.js compare v1 v2
  node submission_versioning.js restore v1 ./restored
    `);
    return;
  }

  const command = args[0];

  switch (command) {
    case 'create': {
      if (args.length < 4) {
        console.error('Usage: create <group> <assignment> <path>');
        return;
      }

      const version = versioning.createVersion(args[1], args[2], args[3]);
      console.log('Version created:', version);
      break;
    }

    case 'history': {
      if (args.length < 2) {
        console.error('Usage: history <group> [assignment]');
        return;
      }

      const history = versioning.getVersionHistory(args[1], args[2]);
      console.log('\nVersion History:');
      console.log('='.repeat(60));

      history.forEach(version => {
        console.log(`\nVersion: ${version.version_id}`);
        console.log(`  Timestamp: ${version.timestamp}`);
        console.log(`  Files: ${version.file_count}`);
        console.log(`  Size: ${(version.total_size / 1024).toFixed(1)} KB`);
        if (version.changes?.summary) {
          console.log(`  Changes: +${version.changes.summary.added} ~${version.changes.summary.modified} -${version.changes.summary.deleted}`);
        }
      });
      break;
    }

    case 'compare': {
      if (args.length < 3) {
        console.error('Usage: compare <version1> <version2>');
        return;
      }

      const comparison = versioning.compareVersions(args[1], args[2]);
      console.log(JSON.stringify(comparison, null, 2));
      break;
    }

    case 'restore': {
      if (args.length < 3) {
        console.error('Usage: restore <version> <destination>');
        return;
      }

      const result = versioning.restoreVersion(args[1], args[2]);
      console.log('Restore complete:', result);
      break;
    }

    case 'report': {
      const report = versioning.generateReport();
      const reportPath = path.join('group-work', 'VERSION_HISTORY_REPORT.md');
      fs.writeFileSync(reportPath, report);
      console.log(report);
      console.log(`\nReport saved to: ${reportPath}`);
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
  }
}

if (require.main === module) {
  main();
}

module.exports = SubmissionVersioning;