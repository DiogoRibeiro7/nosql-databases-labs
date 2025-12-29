#!/usr/bin/env node

/**
 * Version Bump Script
 * Usage: node scripts/bump-version.js [major|minor|patch]
 *
 * This script helps manually bump the version when needed.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const bumpType = args[0] || 'patch';

// Validate bump type
const validBumpTypes = ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease'];
if (!validBumpTypes.includes(bumpType)) {
    console.error(`❌ Invalid bump type: ${bumpType}`);
    console.error(`Valid types: ${validBumpTypes.join(', ')}`);
    process.exit(1);
}

// Read current package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

// Calculate new version
function bumpVersion(version, type) {
    const parts = version.split('.');
    let [major, minor, patch] = parts.map(Number);

    switch (type) {
        case 'major':
            major++;
            minor = 0;
            patch = 0;
            break;
        case 'minor':
            minor++;
            patch = 0;
            break;
        case 'patch':
            patch++;
            break;
        case 'premajor':
            return `${major + 1}.0.0-rc.0`;
        case 'preminor':
            return `${major}.${minor + 1}.0-rc.0`;
        case 'prepatch':
            return `${major}.${minor}.${patch + 1}-rc.0`;
        case 'prerelease':
            if (version.includes('-rc.')) {
                const rcVersion = parseInt(version.split('-rc.')[1]) + 1;
                return version.replace(/-rc.\d+/, `-rc.${rcVersion}`);
            } else {
                return `${major}.${minor}.${patch}-rc.0`;
            }
    }

    return `${major}.${minor}.${patch}`;
}

const newVersion = bumpVersion(currentVersion, bumpType);

console.log(`\n📦 Version Bump Utility\n`);
console.log(`Current version: v${currentVersion}`);
console.log(`New version:     v${newVersion}`);
console.log(`Bump type:       ${bumpType}\n`);

// Ask for confirmation
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Do you want to proceed with this version bump? (y/n): ', (answer) => {
    if (answer.toLowerCase() !== 'y') {
        console.log('❌ Version bump cancelled.');
        rl.close();
        process.exit(0);
    }

    try {
        // Update package.json
        packageJson.version = newVersion;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
        console.log('✅ Updated package.json');

        // Update package-lock.json if it exists
        const packageLockPath = path.join(process.cwd(), 'package-lock.json');
        if (fs.existsSync(packageLockPath)) {
            const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
            packageLock.version = newVersion;
            if (packageLock.packages && packageLock.packages['']) {
                packageLock.packages[''].version = newVersion;
            }
            fs.writeFileSync(packageLockPath, JSON.stringify(packageLock, null, 2) + '\n');
            console.log('✅ Updated package-lock.json');
        }

        // Check if we're in a git repository
        try {
            execSync('git rev-parse --git-dir', { stdio: 'ignore' });

            // Ask if user wants to create a git commit
            rl.question('\nCreate a git commit for this version bump? (y/n): ', (commitAnswer) => {
                if (commitAnswer.toLowerCase() === 'y') {
                    try {
                        // Stage the changes
                        execSync('git add package.json package-lock.json');

                        // Create commit
                        const commitMessage = `chore: bump version to v${newVersion}`;
                        execSync(`git commit -m "${commitMessage}"`);
                        console.log(`✅ Created commit: ${commitMessage}`);

                        // Ask if user wants to create a tag
                        rl.question('\nCreate a git tag for this version? (y/n): ', (tagAnswer) => {
                            if (tagAnswer.toLowerCase() === 'y') {
                                const tagName = `v${newVersion}`;
                                execSync(`git tag -a ${tagName} -m "Release version ${newVersion}"`);
                                console.log(`✅ Created tag: ${tagName}`);
                                console.log(`\n📝 Remember to push your changes and tags:`);
                                console.log(`   git push origin HEAD`);
                                console.log(`   git push origin ${tagName}`);
                            }

                            console.log(`\n✨ Version successfully bumped to v${newVersion}`);
                            rl.close();
                        });
                    } catch (error) {
                        console.error('❌ Error creating git commit:', error.message);
                        rl.close();
                    }
                } else {
                    console.log(`\n✨ Version successfully bumped to v${newVersion}`);
                    console.log(`📝 Remember to commit your changes manually.`);
                    rl.close();
                }
            });
        } catch {
            console.log(`\n✨ Version successfully bumped to v${newVersion}`);
            console.log('ℹ️  Not in a git repository. Please commit changes manually if needed.');
            rl.close();
        }
    } catch (error) {
        console.error('❌ Error bumping version:', error.message);
        rl.close();
        process.exit(1);
    }
});

// Handle Ctrl+C
rl.on('SIGINT', () => {
    console.log('\n❌ Version bump cancelled.');
    process.exit(0);
});