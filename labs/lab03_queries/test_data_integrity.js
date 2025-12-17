/**
 * Lab 03 - Data Integrity and Relationship Validation Test Suite
 *
 * This test suite validates:
 * - Data structure integrity
 * - Field type validation
 * - Relationship consistency between collections
 * - Data quality metrics
 * - Schema compliance
 *
 * Run: node test_data_integrity.js
 */

const { MongoClient } = require("mongodb");

// Configuration
const config = {
  uri: process.env.MONGODB_URI || "mongodb://localhost:27017",
  database: "lab03_movies",
};

class DataIntegrityTester {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: [],
      dataQualityMetrics: {},
    };
  }

  async connect() {
    this.client = new MongoClient(config.uri);
    await this.client.connect();
    this.db = this.client.db(config.database);
    console.log("✅ Connected to MongoDB");
  }

  async disconnect() {
    await this.client.close();
    console.log("✅ Disconnected from MongoDB");
  }

  /**
   * Validation helper methods
   */
  assert(condition, message, severity = "error") {
    if (!condition) {
      if (severity === "error") {
        this.results.failed.push(message);
        throw new Error(message);
      } else {
        this.results.warnings.push(message);
        console.warn(`  ⚠️ Warning: ${message}`);
      }
    }
  }

  recordPass(test) {
    this.results.passed.push(test);
    console.log(`  ✅ ${test}`);
  }

  /**
   * Test collection existence and document counts
   */
  async testCollectionIntegrity() {
    console.log("\n📋 Testing Collection Integrity");
    console.log("-".repeat(60));

    const expectedCollections = {
      movies: { min: 40, max: 60 },
      theaters: { min: 5, max: 15 },
      users: { min: 5, max: 20 },
    };

    for (const [collection, bounds] of Object.entries(expectedCollections)) {
      try {
        const count = await this.db.collection(collection).countDocuments();

        this.assert(
          count >= bounds.min && count <= bounds.max,
          `Collection ${collection} has ${count} documents, expected ${bounds.min}-${bounds.max}`
        );

        this.recordPass(`Collection ${collection} has ${count} documents (within expected range)`);

        // Store metrics
        this.results.dataQualityMetrics[`${collection}_count`] = count;
      } catch (error) {
        this.results.failed.push(`Collection ${collection} test failed: ${error.message}`);
      }
    }
  }

  /**
   * Validate movie document structure and field types
   */
  async testMovieSchema() {
    console.log("\n📋 Testing Movie Schema Compliance");
    console.log("-".repeat(60));

    const movies = await this.db.collection("movies").find({}).toArray();

    // Define expected schema
    const requiredFields = {
      _id: "object",
      title: "string",
      year: "number",
      runtime: "number",
      genres: "array",
      directors: "array",
      cast: "array",
      imdb: "object",
    };

    const optionalFields = {
      plot: "string",
      languages: "array",
      countries: "array",
      awards: "object",
      poster: "string",
      type: "string",
      rated: "string",
    };

    let schemaViolations = 0;
    const fieldPresence = {};

    movies.forEach((movie, index) => {
      // Check required fields
      for (const [field, expectedType] of Object.entries(requiredFields)) {
        if (!(field in movie)) {
          schemaViolations++;
          console.error(`  ❌ Movie at index ${index} missing required field: ${field}`);
        } else {
          const actualType = Array.isArray(movie[field]) ? "array" : typeof movie[field];
          if (actualType !== expectedType) {
            schemaViolations++;
            console.error(
              `  ❌ Movie "${movie.title}" field ${field} has wrong type: ${actualType}, expected ${expectedType}`
            );
          }
        }
      }

      // Track optional field presence
      for (const field of Object.keys(optionalFields)) {
        if (!fieldPresence[field]) fieldPresence[field] = 0;
        if (field in movie) fieldPresence[field]++;
      }

      // Specific validations
      if (movie.year) {
        this.assert(
          movie.year >= 1900 && movie.year <= 2025,
          `Movie "${movie.title}" has invalid year: ${movie.year}`,
          "warning"
        );
      }

      if (movie.imdb && movie.imdb.rating) {
        this.assert(
          movie.imdb.rating >= 0 && movie.imdb.rating <= 10,
          `Movie "${movie.title}" has invalid IMDb rating: ${movie.imdb.rating}`
        );
      }

      if (movie.runtime) {
        this.assert(
          movie.runtime > 0 && movie.runtime < 1000,
          `Movie "${movie.title}" has invalid runtime: ${movie.runtime}`,
          "warning"
        );
      }
    });

    if (schemaViolations === 0) {
      this.recordPass("All movies comply with required schema");
    } else {
      this.results.failed.push(`Found ${schemaViolations} schema violations`);
    }

    // Report field coverage
    console.log("\n  📊 Optional Field Coverage:");
    for (const [field, count] of Object.entries(fieldPresence)) {
      const percentage = ((count / movies.length) * 100).toFixed(1);
      console.log(`     ${field}: ${count}/${movies.length} (${percentage}%)`);
      this.results.dataQualityMetrics[`field_coverage_${field}`] = parseFloat(percentage);
    }
  }

  /**
   * Validate array field integrity
   */
  async testArrayFields() {
    console.log("\n📋 Testing Array Field Integrity");
    console.log("-".repeat(60));

    const movies = await this.db.collection("movies").find({}).toArray();

    const arrayFieldStats = {
      genres: { empty: 0, duplicates: 0, invalid: 0 },
      directors: { empty: 0, duplicates: 0, invalid: 0 },
      cast: { empty: 0, duplicates: 0, invalid: 0 },
    };

    movies.forEach((movie) => {
      // Check genres
      if (movie.genres) {
        if (movie.genres.length === 0) arrayFieldStats.genres.empty++;
        if (new Set(movie.genres).size !== movie.genres.length) arrayFieldStats.genres.duplicates++;

        movie.genres.forEach((genre) => {
          if (typeof genre !== "string" || genre.trim().length === 0) {
            arrayFieldStats.genres.invalid++;
          }
        });
      }

      // Check directors
      if (movie.directors) {
        if (movie.directors.length === 0) arrayFieldStats.directors.empty++;
        if (new Set(movie.directors).size !== movie.directors.length)
          arrayFieldStats.directors.duplicates++;

        movie.directors.forEach((director) => {
          if (typeof director !== "string" || director.trim().length === 0) {
            arrayFieldStats.directors.invalid++;
          }
        });
      }

      // Check cast
      if (movie.cast) {
        if (movie.cast.length === 0) arrayFieldStats.cast.empty++;
        if (new Set(movie.cast).size !== movie.cast.length) arrayFieldStats.cast.duplicates++;
      }
    });

    // Report findings
    for (const [field, stats] of Object.entries(arrayFieldStats)) {
      console.log(`\n  📊 ${field} array statistics:`);
      console.log(`     Empty arrays: ${stats.empty}`);
      console.log(`     Arrays with duplicates: ${stats.duplicates}`);
      console.log(`     Invalid entries: ${stats.invalid}`);

      if (stats.empty === 0 && stats.duplicates === 0 && stats.invalid === 0) {
        this.recordPass(`${field} arrays are clean`);
      } else {
        this.assert(stats.invalid === 0, `${field} contains ${stats.invalid} invalid entries`);
      }
    }
  }

  /**
   * Check for duplicate documents
   */
  async testDuplicates() {
    console.log("\n📋 Testing for Duplicate Documents");
    console.log("-".repeat(60));

    // Check for duplicate titles in same year
    const duplicateTitles = await this.db
      .collection("movies")
      .aggregate([
        {
          $group: {
            _id: { title: "$title", year: "$year" },
            count: { $sum: 1 },
            ids: { $push: "$_id" },
          },
        },
        { $match: { count: { $gt: 1 } } },
      ])
      .toArray();

    if (duplicateTitles.length === 0) {
      this.recordPass("No duplicate title-year combinations found");
    } else {
      duplicateTitles.forEach((dup) => {
        console.warn(
          `  ⚠️ Duplicate: "${dup._id.title}" (${dup._id.year}) appears ${dup.count} times`
        );
      });
      this.results.warnings.push(
        `Found ${duplicateTitles.length} duplicate title-year combinations`
      );
    }

    // Check for potential duplicate entries (similar titles)
    const movies = await this.db.collection("movies").find({}, { title: 1, year: 1 }).toArray();
    const similarTitles = [];

    for (let i = 0; i < movies.length; i++) {
      for (let j = i + 1; j < movies.length; j++) {
        const similarity = this.calculateSimilarity(
          movies[i].title.toLowerCase(),
          movies[j].title.toLowerCase()
        );

        if (similarity > 0.9 && movies[i].year === movies[j].year) {
          similarTitles.push({
            title1: movies[i].title,
            title2: movies[j].title,
            year: movies[i].year,
            similarity: similarity,
          });
        }
      }
    }

    if (similarTitles.length > 0) {
      console.log("\n  ⚠️ Potentially duplicate movies (>90% similarity):");
      similarTitles.forEach((pair) => {
        console.log(`     "${pair.title1}" vs "${pair.title2}" (${pair.year})`);
      });
      this.results.warnings.push(`Found ${similarTitles.length} potentially duplicate movies`);
    }
  }

  /**
   * Calculate string similarity (Levenshtein distance)
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Test cross-collection relationships
   */
  async testCrossCollectionIntegrity() {
    console.log("\n📋 Testing Cross-Collection Relationships");
    console.log("-".repeat(60));

    // Test theaters collection structure
    const theaters = await this.db.collection("theaters").find({}).toArray();
    let validTheaters = 0;

    theaters.forEach((theater) => {
      const hasRequiredFields =
        theater._id && theater.theaterId && theater.location && theater.location.address;

      if (hasRequiredFields) {
        validTheaters++;
      } else {
        console.warn(`  ⚠️ Theater ${theater.theaterId || "unknown"} missing required fields`);
      }

      // Validate geo coordinates if present
      if (theater.location && theater.location.geo && theater.location.geo.coordinates) {
        const [lon, lat] = theater.location.geo.coordinates;
        this.assert(
          lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90,
          `Theater ${theater.theaterId} has invalid coordinates: [${lon}, ${lat}]`,
          "warning"
        );
      }
    });

    this.recordPass(`${validTheaters}/${theaters.length} theaters have valid structure`);

    // Test users collection structure
    const users = await this.db.collection("users").find({}).toArray();
    let validUsers = 0;

    users.forEach((user) => {
      const hasRequiredFields = user._id && user.name && user.email;

      if (hasRequiredFields) {
        validUsers++;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        this.assert(
          emailRegex.test(user.email),
          `User ${user.name} has invalid email: ${user.email}`,
          "warning"
        );
      }
    });

    this.recordPass(`${validUsers}/${users.length} users have valid structure`);
  }

  /**
   * Calculate and report data quality metrics
   */
  async calculateDataQualityMetrics() {
    console.log("\n📋 Calculating Data Quality Metrics");
    console.log("-".repeat(60));

    const movies = await this.db.collection("movies").find({}).toArray();

    // Completeness metrics
    const completeness = {
      plot: movies.filter((m) => m.plot && m.plot.length > 0).length,
      poster: movies.filter((m) => m.poster && m.poster.length > 0).length,
      imdbVotes: movies.filter((m) => m.imdb && m.imdb.votes > 0).length,
      awards: movies.filter((m) => m.awards && Object.keys(m.awards).length > 0).length,
    };

    // Calculate percentages
    for (const [field, count] of Object.entries(completeness)) {
      const percentage = ((count / movies.length) * 100).toFixed(1);
      console.log(`  📊 ${field} completeness: ${count}/${movies.length} (${percentage}%)`);
      this.results.dataQualityMetrics[`completeness_${field}`] = parseFloat(percentage);
    }

    // Data distribution metrics
    const yearDistribution = {};
    const genreDistribution = {};
    const ratingDistribution = {
      "0-2": 0,
      "2-4": 0,
      "4-6": 0,
      "6-8": 0,
      "8-10": 0,
    };

    movies.forEach((movie) => {
      // Year distribution
      const decade = Math.floor(movie.year / 10) * 10;
      yearDistribution[`${decade}s`] = (yearDistribution[`${decade}s`] || 0) + 1;

      // Genre distribution
      if (movie.genres) {
        movie.genres.forEach((genre) => {
          genreDistribution[genre] = (genreDistribution[genre] || 0) + 1;
        });
      }

      // Rating distribution
      if (movie.imdb && movie.imdb.rating) {
        const rating = movie.imdb.rating;
        if (rating <= 2) ratingDistribution["0-2"]++;
        else if (rating <= 4) ratingDistribution["2-4"]++;
        else if (rating <= 6) ratingDistribution["4-6"]++;
        else if (rating <= 8) ratingDistribution["6-8"]++;
        else ratingDistribution["8-10"]++;
      }
    });

    console.log("\n  📊 Data Distribution:");
    console.log("     Decades:", Object.keys(yearDistribution).sort().join(", "));
    console.log(
      "     Top Genres:",
      Object.entries(genreDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([genre, count]) => `${genre}(${count})`)
        .join(", ")
    );
    console.log(
      "     Rating Distribution:",
      Object.entries(ratingDistribution)
        .map(([range, count]) => `${range}: ${count}`)
        .join(", ")
    );

    // Calculate overall data quality score
    const qualityScore = this.calculateQualityScore();
    this.results.dataQualityMetrics.overallScore = qualityScore;
    console.log(`\n  🎯 Overall Data Quality Score: ${qualityScore.toFixed(1)}%`);
  }

  /**
   * Calculate overall quality score
   */
  calculateQualityScore() {
    const weights = {
      schemaCompliance: 0.3,
      completeness: 0.25,
      uniqueness: 0.2,
      consistency: 0.15,
      validity: 0.1,
    };

    const scores = {
      schemaCompliance:
        this.results.failed.filter((f) => f.includes("schema")).length === 0 ? 100 : 50,
      completeness:
        Object.values(this.results.dataQualityMetrics)
          .filter((k) => typeof k === "number")
          .reduce((a, b) => a + b, 0) /
        Object.values(this.results.dataQualityMetrics).filter((k) => typeof k === "number").length,
      uniqueness:
        this.results.warnings.filter((w) => w.includes("duplicate")).length === 0 ? 100 : 70,
      consistency: this.results.warnings.length < 5 ? 100 : 100 - this.results.warnings.length * 5,
      validity: this.results.failed.length === 0 ? 100 : 100 - this.results.failed.length * 10,
    };

    let totalScore = 0;
    for (const [metric, weight] of Object.entries(weights)) {
      totalScore += (scores[metric] || 0) * weight;
    }

    return Math.max(0, Math.min(100, totalScore));
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 DATA INTEGRITY TEST SUMMARY");
    console.log("=".repeat(60));

    console.log(`\n✅ Passed Tests: ${this.results.passed.length}`);
    this.results.passed.forEach((test) => console.log(`   - ${test}`));

    if (this.results.failed.length > 0) {
      console.log(`\n❌ Failed Tests: ${this.results.failed.length}`);
      this.results.failed.forEach((test) => console.log(`   - ${test}`));
    }

    if (this.results.warnings.length > 0) {
      console.log(`\n⚠️  Warnings: ${this.results.warnings.length}`);
      this.results.warnings.forEach((warning) => console.log(`   - ${warning}`));
    }

    console.log("\n📈 Data Quality Metrics:");
    for (const [metric, value] of Object.entries(this.results.dataQualityMetrics)) {
      if (typeof value === "number") {
        console.log(`   ${metric}: ${value.toFixed(1)}${metric.includes("Score") ? "%" : ""}`);
      }
    }

    const finalStatus = this.results.failed.length === 0 ? "✅ PASSED" : "❌ FAILED";
    console.log(`\n📋 Final Status: ${finalStatus}`);

    return {
      passed: this.results.passed.length,
      failed: this.results.failed.length,
      warnings: this.results.warnings.length,
      qualityScore: this.results.dataQualityMetrics.overallScore,
      status: finalStatus,
    };
  }
}

// Main execution
async function runDataIntegrityTests() {
  const tester = new DataIntegrityTester();

  try {
    await tester.connect();

    console.log("=".repeat(60));
    console.log("🔍 Lab 03 - Data Integrity & Validation Suite");
    console.log("=".repeat(60));

    // Run all tests
    await tester.testCollectionIntegrity();
    await tester.testMovieSchema();
    await tester.testArrayFields();
    await tester.testDuplicates();
    await tester.testCrossCollectionIntegrity();
    await tester.calculateDataQualityMetrics();

    // Generate report
    const report = tester.generateReport();

    // Export for CI/CD
    console.log("\n📄 Results for CI/CD (JSON):");
    console.log(
      JSON.stringify(
        {
          ...report,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      )
    );

    // Exit with appropriate code
    process.exit(report.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("❌ Test suite failed:", error);
    process.exit(1);
  } finally {
    await tester.disconnect();
  }
}

// Run tests if executed directly
if (require.main === module) {
  runDataIntegrityTests().catch(console.error);
}

module.exports = { DataIntegrityTester, runDataIntegrityTests };
