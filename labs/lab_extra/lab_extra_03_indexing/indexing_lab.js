// Lab Extra 03 - Indexing and Performance Implementation
const { MongoClient } = require('mongodb');

class IndexingLab {
    constructor(uri = 'mongodb://localhost:27017', dbName = 'lab_extra_indexing') {
        this.uri = uri;
        this.dbName = dbName;
        this.client = null;
        this.db = null;
    }

    async connect() {
        this.client = new MongoClient(this.uri);
        await this.client.connect();
        this.db = this.client.db(this.dbName);
        console.log(`Connected to ${this.dbName}`);
        return this;
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
        }
    }

    // Create various index types
    async createSampleIndexes() {
        const results = {};

        // Single field index
        results.single = await this.db.collection('users').createIndex({ email: 1 });

        // Compound index
        results.compound = await this.db.collection('orders').createIndex({
            customerId: 1,
            orderDate: -1
        });

        // Text index
        results.text = await this.db.collection('articles').createIndex({
            title: 'text',
            content: 'text'
        });

        // 2dsphere index
        results.geo = await this.db.collection('locations').createIndex({
            coordinates: '2dsphere'
        });

        // Partial index
        results.partial = await this.db.collection('orders').createIndex(
            { status: 1, createdAt: -1 },
            { partialFilterExpression: { status: { $in: ['pending', 'processing'] } } }
        );

        // TTL index
        results.ttl = await this.db.collection('sessions').createIndex(
            { createdAt: 1 },
            { expireAfterSeconds: 3600 }
        );

        // Unique index
        results.unique = await this.db.collection('users').createIndex(
            { username: 1 },
            { unique: true, sparse: true }
        );

        // Wildcard index
        results.wildcard = await this.db.collection('products').createIndex({
            'attributes.$**': 1
        });

        console.log('Created sample indexes:', results);
        return results;
    }

    // Analyze query performance
    async analyzeQuery(collection, query, projection = {}) {
        const coll = this.db.collection(collection);

        // Get execution stats
        const explanation = await coll.find(query, projection).explain('executionStats');

        const stats = explanation.executionStats;
        const stage = stats.executionStages;

        const analysis = {
            query: query,
            executionTimeMillis: stats.executionTimeMillis,
            totalDocsExamined: stats.totalDocsExamined,
            totalKeysExamined: stats.totalKeysExamined,
            nReturned: stats.nReturned,
            stage: stage.stage,
            indexUsed: stage.indexName || 'NONE',
            isIndexOnly: stage.stage === 'PROJECTION_COVERED',
            efficiency: this.calculateEfficiency(stats),
            recommendation: this.getRecommendation(stats, stage)
        };

        return analysis;
    }

    // Calculate query efficiency
    calculateEfficiency(stats) {
        if (stats.totalDocsExamined === 0) return 100;

        const efficiency = (stats.nReturned / stats.totalDocsExamined) * 100;
        return Math.round(efficiency * 100) / 100;
    }

    // Get optimization recommendation
    getRecommendation(stats, stage) {
        const recommendations = [];

        if (stage.stage === 'COLLSCAN') {
            recommendations.push('⚠️ Collection scan detected - create an index');
        }

        if (stats.totalDocsExamined > stats.nReturned * 10) {
            recommendations.push('⚠️ Examining too many documents - optimize index');
        }

        if (stats.executionTimeMillis > 100) {
            recommendations.push('⚠️ Slow query detected - review index strategy');
        }

        if (stats.totalKeysExamined > stats.totalDocsExamined * 2) {
            recommendations.push('⚠️ Too many keys examined - consider compound index');
        }

        if (recommendations.length === 0) {
            recommendations.push('✓ Query is optimized');
        }

        return recommendations;
    }

    // Compare query performance with and without index
    async comparePerformance(collection, query, indexSpec) {
        const coll = this.db.collection(collection);
        const results = {};

        // Test without index
        await coll.dropIndexes();
        const withoutIndex = await this.analyzeQuery(collection, query);
        results.withoutIndex = {
            time: withoutIndex.executionTimeMillis,
            docsExamined: withoutIndex.totalDocsExamined,
            stage: withoutIndex.stage
        };

        // Create index and test
        await coll.createIndex(indexSpec);
        const withIndex = await this.analyzeQuery(collection, query);
        results.withIndex = {
            time: withIndex.executionTimeMillis,
            docsExamined: withIndex.totalDocsExamined,
            stage: withIndex.stage,
            indexUsed: withIndex.indexUsed
        };

        // Calculate improvement
        results.improvement = {
            timeReduction: Math.round(
                ((results.withoutIndex.time - results.withIndex.time) /
                results.withoutIndex.time) * 100
            ),
            docsReduction: Math.round(
                ((results.withoutIndex.docsExamined - results.withIndex.docsExamined) /
                results.withoutIndex.docsExamined) * 100
            )
        };

        return results;
    }

    // Get index usage statistics
    async getIndexUsageStats(collection) {
        const coll = this.db.collection(collection);

        const stats = await coll.aggregate([
            { $indexStats: {} }
        ]).toArray();

        return stats.map(idx => ({
            name: idx.name,
            key: idx.key,
            accesses: idx.accesses.ops,
            since: idx.accesses.since,
            usage: idx.accesses.ops > 0 ? 'USED' : 'UNUSED'
        }));
    }

    // Find missing indexes based on query patterns
    async findMissingIndexes() {
        // Analyze system.profile for slow queries
        const profile = this.db.collection('system.profile');

        const slowQueries = await profile.aggregate([
            { $match: {
                millis: { $gt: 100 },
                'command.find': { $exists: true }
            }},
            { $group: {
                _id: {
                    ns: '$ns',
                    filter: '$command.filter'
                },
                count: { $sum: 1 },
                avgMillis: { $avg: '$millis' },
                maxMillis: { $max: '$millis' }
            }},
            { $sort: { maxMillis: -1 } },
            { $limit: 10 }
        ]).toArray();

        // Suggest indexes
        const suggestions = slowQueries.map(query => {
            const filter = query._id.filter || {};
            const keys = Object.keys(filter);

            return {
                collection: query._id.ns,
                queryPattern: filter,
                frequency: query.count,
                avgTime: Math.round(query.avgMillis),
                suggestedIndex: this.suggestIndex(filter)
            };
        });

        return suggestions;
    }

    // Suggest index based on query pattern
    suggestIndex(filter) {
        const index = {};
        const keys = Object.keys(filter);

        // Sort keys by selectivity (equality > sort > range)
        keys.forEach(key => {
            const value = filter[key];

            if (typeof value === 'object' && value !== null) {
                // Range query - add last
                index[key] = 1;
            } else {
                // Equality - add first
                index[key] = 1;
            }
        });

        return index;
    }

    // Enable and configure profiling
    async enableProfiling(level = 1, slowMs = 100) {
        await this.db.command({
            profile: level,
            slowms: slowMs
        });

        console.log(`Profiling enabled: level ${level}, slowMs: ${slowMs}`);
    }

    // Analyze profiling data
    async analyzeProfile(limit = 10) {
        const profile = this.db.collection('system.profile');

        const analysis = await profile.aggregate([
            { $match: { millis: { $exists: true } } },
            { $group: {
                _id: {
                    op: '$op',
                    ns: '$ns'
                },
                count: { $sum: 1 },
                avgMillis: { $avg: '$millis' },
                maxMillis: { $max: '$millis' },
                minMillis: { $min: '$millis' }
            }},
            { $sort: { maxMillis: -1 } },
            { $limit: limit }
        ]).toArray();

        return analysis.map(item => ({
            operation: item._id.op,
            namespace: item._id.ns,
            count: item.count,
            avgTime: Math.round(item.avgMillis),
            maxTime: item.maxMillis,
            minTime: item.minMillis
        }));
    }

    // Test text search performance
    async testTextSearch(searchTerms) {
        const articles = this.db.collection('articles');
        const results = {};

        for (const term of searchTerms) {
            const start = Date.now();
            const docs = await articles.find({
                $text: { $search: term }
            }, {
                score: { $meta: 'textScore' }
            }).sort({
                score: { $meta: 'textScore' }
            }).limit(10).toArray();

            results[term] = {
                time: Date.now() - start,
                found: docs.length,
                topScore: docs[0]?.score || 0
            };
        }

        return results;
    }

    // Test geospatial query performance
    async testGeoQueries(centerPoint, distances) {
        const locations = this.db.collection('locations');
        const results = {};

        for (const distance of distances) {
            const start = Date.now();
            const docs = await locations.find({
                coordinates: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: centerPoint
                        },
                        $maxDistance: distance
                    }
                }
            }).limit(100).toArray();

            results[`${distance}m`] = {
                time: Date.now() - start,
                found: docs.length
            };
        }

        return results;
    }

    // Optimize collection indexes
    async optimizeIndexes(collection) {
        const coll = this.db.collection(collection);
        const optimization = {
            before: {},
            after: {},
            actions: []
        };

        // Get current indexes
        const currentIndexes = await coll.indexes();
        optimization.before.count = currentIndexes.length;
        optimization.before.indexes = currentIndexes.map(idx => idx.name);

        // Get usage stats
        const usage = await this.getIndexUsageStats(collection);

        // Remove unused indexes
        for (const idx of usage) {
            if (idx.usage === 'UNUSED' && idx.name !== '_id_') {
                await coll.dropIndex(idx.name);
                optimization.actions.push(`Dropped unused index: ${idx.name}`);
            }
        }

        // Find and create missing indexes
        const missing = await this.findMissingIndexes();
        for (const suggestion of missing) {
            if (suggestion.collection.includes(collection)) {
                await coll.createIndex(suggestion.suggestedIndex);
                optimization.actions.push(`Created index: ${JSON.stringify(suggestion.suggestedIndex)}`);
            }
        }

        // Get final indexes
        const finalIndexes = await coll.indexes();
        optimization.after.count = finalIndexes.length;
        optimization.after.indexes = finalIndexes.map(idx => idx.name);

        return optimization;
    }
}

// Performance testing utilities
class PerformanceTester {
    constructor(db) {
        this.db = db;
    }

    // Generate test data
    async generateTestData() {
        // Generate users
        const users = [];
        for (let i = 0; i < 100000; i++) {
            users.push({
                userId: `USER${i}`,
                username: `user_${i}`,
                email: `user${i}@example.com`,
                age: 18 + Math.floor(Math.random() * 50),
                city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
                status: ['active', 'inactive', 'suspended'][Math.floor(Math.random() * 3)],
                createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
                lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
            });
        }
        await this.db.collection('users').insertMany(users, { ordered: false });
        console.log('Generated users');

        // Generate articles for text search
        const articles = [];
        const topics = ['mongodb', 'indexing', 'performance', 'database', 'nosql', 'optimization'];
        for (let i = 0; i < 50000; i++) {
            articles.push({
                title: `Article about ${topics[Math.floor(Math.random() * topics.length)]} - ${i}`,
                content: `This is a detailed article about ${topics.join(', ')} and various database concepts. ` +
                        `It covers important topics like query optimization, index strategies, and performance tuning.`,
                tags: topics.slice(0, Math.floor(Math.random() * 3) + 1),
                author: `author_${Math.floor(Math.random() * 100)}`,
                publishDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
                views: Math.floor(Math.random() * 10000)
            });
        }
        await this.db.collection('articles').insertMany(articles, { ordered: false });
        console.log('Generated articles');

        // Generate locations for geospatial
        const locations = [];
        for (let i = 0; i < 10000; i++) {
            locations.push({
                name: `Location ${i}`,
                type: ['restaurant', 'store', 'park', 'museum'][Math.floor(Math.random() * 4)],
                coordinates: {
                    type: 'Point',
                    coordinates: [
                        -74 + Math.random() * 2,  // Longitude around NYC
                        40 + Math.random() * 2     // Latitude around NYC
                    ]
                },
                rating: 1 + Math.random() * 4
            });
        }
        await this.db.collection('locations').insertMany(locations, { ordered: false });
        console.log('Generated locations');
    }

    // Run performance benchmark
    async runBenchmark() {
        const results = {
            withoutIndex: {},
            withIndex: {}
        };

        const queries = [
            {
                name: 'Simple equality',
                collection: 'users',
                query: { username: 'user_5000' },
                index: { username: 1 }
            },
            {
                name: 'Range query',
                collection: 'users',
                query: { age: { $gte: 25, $lte: 35 } },
                index: { age: 1 }
            },
            {
                name: 'Compound query',
                collection: 'users',
                query: { city: 'New York', status: 'active' },
                index: { city: 1, status: 1 }
            },
            {
                name: 'Sort query',
                collection: 'users',
                query: {},
                sort: { createdAt: -1 },
                index: { createdAt: -1 }
            }
        ];

        for (const test of queries) {
            const coll = this.db.collection(test.collection);

            // Test without index
            await coll.dropIndexes();
            const startWithout = Date.now();
            let cursor = coll.find(test.query);
            if (test.sort) cursor = cursor.sort(test.sort);
            await cursor.limit(100).toArray();
            results.withoutIndex[test.name] = Date.now() - startWithout;

            // Test with index
            await coll.createIndex(test.index);
            const startWith = Date.now();
            cursor = coll.find(test.query);
            if (test.sort) cursor = cursor.sort(test.sort);
            await cursor.limit(100).toArray();
            results.withIndex[test.name] = Date.now() - startWith;
        }

        return results;
    }
}

module.exports = {
    IndexingLab,
    PerformanceTester
};