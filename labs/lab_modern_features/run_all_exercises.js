#!/usr/bin/env node

/**
 * Modern MongoDB Features Lab - Test Runner
 *
 * This script runs all exercises and validates MongoDB modern features.
 */

const { MongoClient } = require('mongodb');
const path = require('path');

class ModernFeaturesTestRunner {
  constructor() {
    this.connectionUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    this.results = [];
    this.startTime = null;
  }

  async checkMongoDBVersion() {
    const client = new MongoClient(this.connectionUrl);

    try {
      await client.connect();
      const adminDb = client.db().admin();
      const serverInfo = await adminDb.serverInfo();
      const version = serverInfo.version;

      console.log(`MongoDB Version: ${version}`);

      const majorVersion = parseInt(version.split('.')[0]);
      if (majorVersion < 5) {
        console.warn('⚠️ Warning: Some features require MongoDB 5.0 or later');
        console.warn('  - Time-Series Collections (5.0+)');
        console.warn('  - Window Functions (5.0+)');
        console.warn('  - $setWindowFields (5.0+)');
      }
      if (majorVersion < 6) {
        console.warn('⚠️ Warning: Some features require MongoDB 6.0 or later');
        console.warn('  - Atlas Search improvements');
        console.warn('  - Vector Search (Atlas only)');
      }

      return version;
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error.message);
      return null;
    } finally {
      await client.close();
    }
  }

  async runExercise(name, filePath, skipInLocal = false, requireReplicaSet = false) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running: ${name}`);
    console.log('='.repeat(60));

    const isAtlas = this.connectionUrl.includes('mongodb+srv://');

    if (requireReplicaSet) {
      const requiresReplicaSet = !isAtlas;
      if (requiresReplicaSet) {
        const client = new MongoClient(this.connectionUrl);
        try {
          await client.connect();
          const adm = client.db('admin');
          const status = await adm.command({ replSetGetStatus: 1 }).catch(() => null);
          if (!status) {
            console.warn('⚠️ Skipped: Change Streams require a replica set. Run lab05 replication setup first.');
            this.results.push({
              exercise: name,
              status: 'skipped',
              reason: 'Replica set not detected',
              duration: 0
            });
            return;
          }
        } finally {
          await client.close();
        }
      }
    }

    if (skipInLocal && !isAtlas) {
      console.log('⚠️ Skipped: This exercise requires MongoDB Atlas');
      this.results.push({
        exercise: name,
        status: 'skipped',
        reason: 'Requires MongoDB Atlas',
        duration: 0
      });
      return;
    }

    const startTime = Date.now();

    try {
      // Dynamically load and run the exercise
      const ExerciseClass = require(filePath);
      const exercise = new ExerciseClass(this.connectionUrl);

      // Run connect if available
      if (exercise.connect) {
        await exercise.connect();
      }

      const helperNames = new Set(['connect', 'cleanup', 'generateMockEmbedding', 'cosineSimilarity']);
      const helperPrefixes = ['generate', 'cosine', '_', 'format', 'build'];

      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(exercise))
        .filter(method => method !== 'constructor')
        .filter(method => !helperNames.has(method))
        .filter(method => !helperPrefixes.some(prefix => method.startsWith(prefix)));

      for (const method of methods.slice(0, 3)) { // Run first 3 exercises from each file
        if (typeof exercise[method] === 'function') {
          console.log(`\nExecuting: ${method}`);
          await exercise[method]();
        }
      }

      // Cleanup
      if (exercise.cleanup) {
        await exercise.cleanup();
      }

      const duration = Date.now() - startTime;
      console.log(`\n✅ ${name} completed in ${duration}ms`);

      this.results.push({
        exercise: name,
        status: 'passed',
        duration: duration
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`\n❌ ${name} failed:`, error.message);

      this.results.push({
        exercise: name,
        status: 'failed',
        error: error.message,
        duration: duration
      });
    }
  }

  async runAllExercises() {
    this.startTime = Date.now();

    console.log('MongoDB Modern Features Lab - Test Runner');
    console.log('=========================================\n');

    // Check MongoDB version
    const version = await this.checkMongoDBVersion();
    if (!version) {
      console.error('Cannot proceed without MongoDB connection');
      return;
    }

    // Define exercises
    const exercises = [
      {
        name: 'Change Streams (Real-time Data)',
        file: './exercises/01_change_streams.js',
        requireReplicaSet: true,
        skipInLocal: false
      },
      {
        name: 'Time-Series Collections',
        file: './exercises/02_timeseries_collections.js',
        skipInLocal: false
      },
      {
        name: 'Atlas Search',
        file: './exercises/03_atlas_search.js',
        skipInLocal: false // Has local fallbacks
      },
      {
        name: 'Vector Search (AI/ML)',
        file: './exercises/04_vector_search.js',
        skipInLocal: false // Has local simulation
      },
      {
        name: 'GridFS File Storage',
        file: './exercises/05_gridfs.js',
        skipInLocal: false
      },
      {
        name: 'MongoDB Charts Data Preparation',
        file: './exercises/06_mongodb_charts.js',
        skipInLocal: false
      }
    ];

    // Run each exercise
    for (const exercise of exercises) {
      await this.runExercise(
        exercise.name,
        path.join(__dirname, exercise.file),
        exercise.skipInLocal,
        exercise.requireReplicaSet
      );
    }

    // Print summary
    this.printSummary();
  }

  printSummary() {
    const totalDuration = Date.now() - this.startTime;

    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));

    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;

    console.log(`\nTotal Exercises: ${this.results.length}`);
    console.log(`  ✅ Passed: ${passed}`);
    console.log(`  ❌ Failed: ${failed}`);
    console.log(`  ⚠️ Skipped: ${skipped}`);

    console.log('\nDetailed Results:');
    this.results.forEach(result => {
      const icon = result.status === 'passed' ? '✅' :
                   result.status === 'failed' ? '❌' : '⚠️';
      console.log(`  ${icon} ${result.exercise}: ${result.status} (${result.duration}ms)`);
      if (result.error) {
        console.log(`     Error: ${result.error}`);
      }
      if (result.reason) {
        console.log(`     Reason: ${result.reason}`);
      }
    });

    console.log(`\nTotal Time: ${(totalDuration / 1000).toFixed(2)} seconds`);

    // Feature availability matrix
    console.log('\n' + '='.repeat(60));
    console.log('FEATURE AVAILABILITY');
    console.log('='.repeat(60));

    const features = [
      { name: 'Change Streams', local: '✅', atlas: '✅', minVersion: '3.6' },
      { name: 'Time-Series', local: '✅', atlas: '✅', minVersion: '5.0' },
      { name: 'Text Search', local: '✅', atlas: '✅', minVersion: '2.6' },
      { name: 'Atlas Search', local: '❌', atlas: '✅', minVersion: 'Atlas' },
      { name: 'Vector Search', local: '❌', atlas: '✅', minVersion: 'Atlas 6.0.11+' },
      { name: 'GridFS', local: '✅', atlas: '✅', minVersion: '1.0' },
      { name: 'Charts', local: '❌', atlas: '✅', minVersion: 'Atlas' }
    ];

    console.log('\n| Feature          | Local | Atlas | Min Version |');
    console.log('|-----------------|-------|-------|-------------|');
    features.forEach(feature => {
      console.log(`| ${feature.name.padEnd(15)} | ${feature.local.padEnd(5)} | ${feature.atlas.padEnd(5)} | ${feature.minVersion.padEnd(11)} |`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('NEXT STEPS');
    console.log('='.repeat(60));
    console.log('\n1. For Atlas-specific features:');
    console.log('   - Sign up for MongoDB Atlas (free tier available)');
    console.log('   - Create a cluster');
    console.log('   - Set MONGODB_URI environment variable');
    console.log('\n2. To run individual exercises:');
    console.log('   npm run change-streams');
    console.log('   npm run time-series');
    console.log('   npm run atlas-search');
    console.log('   npm run vector-search');
    console.log('   npm run gridfs');
    console.log('   npm run charts');
    console.log('\n3. For production use:');
    console.log('   - Review security best practices');
    console.log('   - Configure proper indexes');
    console.log('   - Set up monitoring and alerts');
    console.log('   - Implement error handling and retries');
  }
}

// Main execution
async function main() {
  const runner = new ModernFeaturesTestRunner();

  try {
    await runner.runAllExercises();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = ModernFeaturesTestRunner;
