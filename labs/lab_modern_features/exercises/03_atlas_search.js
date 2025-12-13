/**
 * Exercise 03: MongoDB Atlas Search
 *
 * Atlas Search provides full-text search capabilities with support for:
 * - Text search with fuzzy matching
 * - Autocomplete
 * - Faceted search
 * - Highlighting
 * - Scoring and relevance
 *
 * Note: These exercises require MongoDB Atlas. Some features are demonstrated
 * with equivalent aggregation pipeline stages for local MongoDB instances.
 */

const { MongoClient } = require('mongodb');

class AtlasSearchExercises {
  constructor(connectionUrl) {
    // For Atlas: mongodb+srv://username:password@cluster.mongodb.net/
    // For local: mongodb://localhost:27017
    this.connectionUrl = connectionUrl || 'mongodb://localhost:27017';
    this.client = null;
    this.db = null;
    this.isAtlas = connectionUrl && connectionUrl.includes('mongodb+srv://');
  }

  async connect() {
    this.client = new MongoClient(this.connectionUrl);
    await this.client.connect();
    this.db = this.client.db('modern_features_lab');
    console.log(`Connected to MongoDB (Atlas: ${this.isAtlas})`);
  }

  /**
   * Exercise 1: Prepare Search Data
   * Create and populate collections for search exercises
   */
  async prepareSearchData() {
    console.log('Preparing search data...');

    // 1. Products catalog
    const products = this.db.collection('products_catalog');
    await products.drop().catch(() => {});

    const productData = [
      {
        name: 'iPhone 14 Pro Max',
        category: 'Electronics',
        subcategory: 'Smartphones',
        brand: 'Apple',
        description: 'Latest flagship smartphone with advanced camera system and A16 Bionic chip',
        price: 1099,
        features: ['5G', 'ProRAW photography', 'Dynamic Island', 'Always-On display'],
        tags: ['mobile', 'phone', 'ios', 'premium'],
        inStock: true,
        rating: 4.8,
        reviews: 1250
      },
      {
        name: 'Samsung Galaxy S23 Ultra',
        category: 'Electronics',
        subcategory: 'Smartphones',
        brand: 'Samsung',
        description: 'Premium Android smartphone with S Pen and excellent camera capabilities',
        price: 1199,
        features: ['5G', '200MP camera', 'S Pen included', 'Large display'],
        tags: ['mobile', 'phone', 'android', 'premium', 'stylus'],
        inStock: true,
        rating: 4.7,
        reviews: 980
      },
      {
        name: 'MacBook Pro 16-inch',
        category: 'Electronics',
        subcategory: 'Laptops',
        brand: 'Apple',
        description: 'Professional laptop with M2 Pro chip for demanding creative workflows',
        price: 2499,
        features: ['M2 Pro chip', '32GB RAM', '1TB SSD', 'Liquid Retina XDR display'],
        tags: ['laptop', 'computer', 'mac', 'professional'],
        inStock: true,
        rating: 4.9,
        reviews: 567
      },
      {
        name: 'Sony WH-1000XM5',
        category: 'Electronics',
        subcategory: 'Headphones',
        brand: 'Sony',
        description: 'Industry-leading noise canceling wireless headphones with exceptional sound quality',
        price: 399,
        features: ['Active Noise Canceling', '30-hour battery', 'LDAC codec', 'Multipoint connection'],
        tags: ['audio', 'headphones', 'wireless', 'noise-canceling'],
        inStock: true,
        rating: 4.6,
        reviews: 2341
      },
      {
        name: 'Dell XPS 15',
        category: 'Electronics',
        subcategory: 'Laptops',
        brand: 'Dell',
        description: 'Powerful Windows laptop with stunning display for creators and professionals',
        price: 1799,
        features: ['Intel Core i7', 'NVIDIA RTX 3050', '16GB RAM', '4K OLED display'],
        tags: ['laptop', 'computer', 'windows', 'creator'],
        inStock: false,
        rating: 4.5,
        reviews: 432
      }
    ];

    await products.insertMany(productData);

    // 2. Articles/Blog posts
    const articles = this.db.collection('articles');
    await articles.drop().catch(() => {});

    const articleData = [
      {
        title: 'Getting Started with MongoDB Atlas Search',
        author: 'John Smith',
        content: 'MongoDB Atlas Search makes it easy to build fast, relevance-based search capabilities on top of your MongoDB data. With built-in support for text indexes, faceted search, autocomplete, and more, you can create rich search experiences without managing separate search infrastructure.',
        category: 'Tutorial',
        tags: ['mongodb', 'search', 'atlas', 'database'],
        publishedDate: new Date('2024-01-15'),
        views: 5432,
        likes: 234
      },
      {
        title: 'Building Real-time Applications with Change Streams',
        author: 'Sarah Johnson',
        content: 'Change streams allow applications to access real-time data changes without the complexity and risk of tailing the oplog. Learn how to implement real-time notifications, data synchronization, and event-driven architectures using MongoDB change streams.',
        category: 'Tutorial',
        tags: ['mongodb', 'real-time', 'change-streams', 'websocket'],
        publishedDate: new Date('2024-01-20'),
        views: 3210,
        likes: 156
      },
      {
        title: 'Time-Series Data in MongoDB: Best Practices',
        author: 'Mike Chen',
        content: 'Time-series collections in MongoDB 5.0+ provide optimized storage and querying for time-stamped data. This article covers schema design, ingestion patterns, and query optimization techniques for IoT, financial, and monitoring use cases.',
        category: 'Best Practices',
        tags: ['mongodb', 'time-series', 'iot', 'performance'],
        publishedDate: new Date('2024-01-10'),
        views: 4567,
        likes: 189
      },
      {
        title: 'Vector Search and AI Applications with MongoDB',
        author: 'Emily Davis',
        content: 'Explore how MongoDB Atlas Vector Search enables similarity search for AI and machine learning applications. Learn to store embeddings, perform semantic search, and build recommendation systems using vector search capabilities.',
        category: 'AI/ML',
        tags: ['mongodb', 'ai', 'vector-search', 'machine-learning', 'embeddings'],
        publishedDate: new Date('2024-01-25'),
        views: 6789,
        likes: 345
      },
      {
        title: 'Optimizing MongoDB Performance: Indexing Strategies',
        author: 'Robert Wilson',
        content: 'Proper indexing is crucial for MongoDB performance. This guide covers compound indexes, multikey indexes, text indexes, and index intersection. Learn how to analyze query patterns and choose the right indexing strategy for your application.',
        category: 'Performance',
        tags: ['mongodb', 'indexing', 'performance', 'optimization'],
        publishedDate: new Date('2024-01-05'),
        views: 7890,
        likes: 412
      }
    ];

    await articles.insertMany(articleData);

    // Create text indexes for local MongoDB (Atlas Search indexes are created separately)
    await products.createIndex({ name: 'text', description: 'text', brand: 'text' });
    await articles.createIndex({ title: 'text', content: 'text', tags: 'text' });

    console.log('Data prepared successfully');
    console.log(`- Products: ${productData.length} documents`);
    console.log(`- Articles: ${articleData.length} documents`);
  }

  /**
   * Exercise 2: Basic Text Search
   * Perform text search queries
   */
  async basicTextSearch() {
    const products = this.db.collection('products_catalog');
    const articles = this.db.collection('articles');

    console.log('\n1. Search products for "laptop":');
    const laptopSearch = await products.find(
      { $text: { $search: 'laptop' } },
      { projection: { score: { $meta: 'textScore' }, name: 1, price: 1 } }
    ).sort({ score: { $meta: 'textScore' } }).toArray();

    laptopSearch.forEach(product => {
      console.log(`  - ${product.name} ($${product.price}) - Score: ${product.score.toFixed(2)}`);
    });

    console.log('\n2. Search articles for "mongodb search":');
    const articleSearch = await articles.find(
      { $text: { $search: 'mongodb search' } },
      { projection: { score: { $meta: 'textScore' }, title: 1, author: 1 } }
    ).sort({ score: { $meta: 'textScore' } }).toArray();

    articleSearch.forEach(article => {
      console.log(`  - "${article.title}" by ${article.author} - Score: ${article.score.toFixed(2)}`);
    });
  }

  /**
   * Exercise 3: Atlas Search Query (or equivalent)
   * Demonstrate Atlas Search syntax with local fallback
   */
  async atlasSearchQuery() {
    const products = this.db.collection('products_catalog');

    if (this.isAtlas) {
      // Atlas Search query
      console.log('\nAtlas Search: Fuzzy search for "iphon" (typo):');
      const searchResults = await products.aggregate([
        {
          $search: {
            text: {
              query: 'iphon',
              path: 'name',
              fuzzy: {
                maxEdits: 2
              }
            }
          }
        },
        {
          $project: {
            name: 1,
            score: { $meta: 'searchScore' }
          }
        }
      ]).toArray();

      searchResults.forEach(result => {
        console.log(`  - ${result.name} (Score: ${result.score})`);
      });
    } else {
      // Local MongoDB regex fallback
      console.log('\nLocal search: Regex search for products matching "phone":');
      const searchResults = await products.find({
        $or: [
          { name: { $regex: 'phone', $options: 'i' } },
          { description: { $regex: 'phone', $options: 'i' } }
        ]
      }).toArray();

      searchResults.forEach(result => {
        console.log(`  - ${result.name}`);
      });
    }
  }

  /**
   * Exercise 4: Faceted Search
   * Implement faceted search for filtering
   */
  async facetedSearch() {
    const products = this.db.collection('products_catalog');

    console.log('\nFaceted search aggregation:');

    const facets = await products.aggregate([
      {
        $facet: {
          // Category facet
          categories: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          // Brand facet
          brands: [
            { $group: { _id: '$brand', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          // Price range facet
          priceRanges: [
            {
              $bucket: {
                groupBy: '$price',
                boundaries: [0, 500, 1000, 2000, 3000],
                default: 'Other',
                output: {
                  count: { $sum: 1 },
                  products: { $push: '$name' }
                }
              }
            }
          ],
          // In stock facet
          availability: [
            { $group: { _id: '$inStock', count: { $sum: 1 } } }
          ],
          // Rating facet
          ratings: [
            {
              $bucket: {
                groupBy: '$rating',
                boundaries: [0, 3, 4, 4.5, 5],
                default: 'No rating',
                output: {
                  count: { $sum: 1 },
                  avgRating: { $avg: '$rating' }
                }
              }
            }
          ]
        }
      }
    ]).toArray();

    const result = facets[0];

    console.log('\nCategories:');
    result.categories.forEach(cat => {
      console.log(`  - ${cat._id}: ${cat.count} products`);
    });

    console.log('\nBrands:');
    result.brands.forEach(brand => {
      console.log(`  - ${brand._id}: ${brand.count} products`);
    });

    console.log('\nPrice Ranges:');
    result.priceRanges.forEach(range => {
      console.log(`  - $${range._id}-${typeof range._id === 'number' ? range._id + 500 : '+'}: ${range.count} products`);
    });

    console.log('\nAvailability:');
    result.availability.forEach(avail => {
      console.log(`  - ${avail._id ? 'In Stock' : 'Out of Stock'}: ${avail.count} products`);
    });
  }

  /**
   * Exercise 5: Autocomplete Simulation
   * Simulate autocomplete functionality
   */
  async autocompleteSearch() {
    const products = this.db.collection('products_catalog');

    console.log('\nAutocomplete simulation for "sam":');

    // Simulate autocomplete with regex
    const suggestions = await products.find(
      {
        $or: [
          { name: { $regex: '^sam', $options: 'i' } },
          { brand: { $regex: '^sam', $options: 'i' } }
        ]
      },
      {
        projection: { name: 1, brand: 1 }
      }
    ).limit(5).toArray();

    console.log('Suggestions:');
    suggestions.forEach(suggestion => {
      console.log(`  - ${suggestion.name} (${suggestion.brand})`);
    });

    // For Atlas Search, you would use:
    if (this.isAtlas) {
      console.log('\nAtlas Search autocomplete index example:');
      console.log(`
      {
        $search: {
          autocomplete: {
            query: "sam",
            path: "name",
            fuzzy: {
              maxEdits: 1
            }
          }
        }
      }
      `);
    }
  }

  /**
   * Exercise 6: Compound Search
   * Complex search with multiple criteria
   */
  async compoundSearch() {
    const products = this.db.collection('products_catalog');

    console.log('\nCompound search: Electronics under $500 with 4+ rating:');

    const results = await products.aggregate([
      {
        $match: {
          category: 'Electronics',
          price: { $lt: 500 },
          rating: { $gte: 4.0 }
        }
      },
      {
        $sort: { rating: -1, reviews: -1 }
      },
      {
        $project: {
          name: 1,
          price: 1,
          rating: 1,
          reviews: 1,
          relevanceScore: {
            $add: [
              { $multiply: ['$rating', 100] },
              { $divide: ['$reviews', 100] }
            ]
          }
        }
      }
    ]).toArray();

    results.forEach(product => {
      console.log(`  - ${product.name}`);
      console.log(`    Price: $${product.price}, Rating: ${product.rating}, Reviews: ${product.reviews}`);
      console.log(`    Relevance Score: ${product.relevanceScore.toFixed(2)}`);
    });
  }

  /**
   * Exercise 7: Search Analytics
   * Track and analyze search patterns
   */
  async searchAnalytics() {
    // Create search logs collection
    const searchLogs = this.db.collection('search_logs');
    await searchLogs.drop().catch(() => {});

    // Simulate search logs
    const searches = [
      { query: 'iphone', results: 1, clicked: true, timestamp: new Date() },
      { query: 'laptop', results: 2, clicked: true, timestamp: new Date() },
      { query: 'headphones', results: 1, clicked: false, timestamp: new Date() },
      { query: 'samsung phone', results: 1, clicked: true, timestamp: new Date() },
      { query: 'macbook', results: 1, clicked: true, timestamp: new Date() },
      { query: 'wireless headphones', results: 1, clicked: true, timestamp: new Date() },
      { query: 'iphone', results: 1, clicked: false, timestamp: new Date() },
      { query: 'laptop dell', results: 1, clicked: true, timestamp: new Date() },
      { query: 'notfound', results: 0, clicked: false, timestamp: new Date() }
    ];

    await searchLogs.insertMany(searches);

    console.log('\nSearch Analytics:');

    // Most popular searches
    const popularSearches = await searchLogs.aggregate([
      {
        $group: {
          _id: '$query',
          count: { $sum: 1 },
          clicks: { $sum: { $cond: ['$clicked', 1, 0] } },
          avgResults: { $avg: '$results' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).toArray();

    console.log('\nTop 5 Search Queries:');
    popularSearches.forEach(search => {
      const ctr = search.clicks / search.count * 100;
      console.log(`  - "${search._id}": ${search.count} searches, ${ctr.toFixed(0)}% CTR, ${search.avgResults.toFixed(1)} avg results`);
    });

    // Zero result searches
    const zeroResults = await searchLogs.find({ results: 0 }).toArray();
    console.log(`\nZero-result searches: ${zeroResults.length}`);
    zeroResults.forEach(search => {
      console.log(`  - "${search.query}"`);
    });
  }

  /**
   * Exercise 8: Search Index Management
   * Demonstrate index creation and management
   */
  async searchIndexManagement() {
    console.log('\nSearch Index Management:');

    if (this.isAtlas) {
      console.log('\nAtlas Search Index Definition Example:');
      console.log(`
{
  "analyzer": "lucene.standard",
  "mappings": {
    "dynamic": false,
    "fields": {
      "name": {
        "type": "string",
        "analyzer": "lucene.standard"
      },
      "description": {
        "type": "string",
        "analyzer": "lucene.english"
      },
      "category": {
        "type": "stringFacet"
      },
      "price": {
        "type": "numberFacet"
      },
      "features": {
        "type": "string",
        "analyzer": "lucene.keyword"
      },
      "embedding": {
        "type": "knnVector",
        "dimensions": 384,
        "similarity": "cosine"
      }
    }
  }
}
      `);
    } else {
      // Show local text index information
      const products = this.db.collection('products_catalog');
      const indexes = await products.listIndexes().toArray();

      console.log('\nLocal Text Indexes:');
      indexes.forEach(index => {
        if (index.key && Object.values(index.key).includes('text')) {
          console.log(`  - Index: ${index.name}`);
          console.log(`    Fields: ${JSON.stringify(index.key)}`);
          console.log(`    Weights: ${JSON.stringify(index.weights || {})}`);
        }
      });
    }
  }

  async cleanup() {
    // Clean up collections
    await this.db.collection('products_catalog').drop().catch(() => {});
    await this.db.collection('articles').drop().catch(() => {});
    await this.db.collection('search_logs').drop().catch(() => {});

    await this.client.close();
    console.log('\nCleanup completed');
  }
}

// Main execution
async function main() {
  // Use Atlas connection string if available
  const connectionUrl = process.env.MONGODB_ATLAS_URI || 'mongodb://localhost:27017';
  const exercises = new AtlasSearchExercises(connectionUrl);

  try {
    await exercises.connect();

    console.log('=== Exercise 1: Prepare Search Data ===\n');
    await exercises.prepareSearchData();

    console.log('\n=== Exercise 2: Basic Text Search ===');
    await exercises.basicTextSearch();

    console.log('\n=== Exercise 3: Atlas Search Query ===');
    await exercises.atlasSearchQuery();

    console.log('\n=== Exercise 4: Faceted Search ===');
    await exercises.facetedSearch();

    console.log('\n=== Exercise 5: Autocomplete Search ===');
    await exercises.autocompleteSearch();

    console.log('\n=== Exercise 6: Compound Search ===');
    await exercises.compoundSearch();

    console.log('\n=== Exercise 7: Search Analytics ===');
    await exercises.searchAnalytics();

    console.log('\n=== Exercise 8: Search Index Management ===');
    await exercises.searchIndexManagement();

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await exercises.cleanup();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = AtlasSearchExercises;