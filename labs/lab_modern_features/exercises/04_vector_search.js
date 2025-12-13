/**
 * Exercise 04: Vector Search for AI/ML
 *
 * MongoDB Atlas Vector Search enables semantic search using vector embeddings.
 * This is crucial for AI applications like:
 * - Semantic search
 * - Recommendation systems
 * - Similarity matching
 * - RAG (Retrieval Augmented Generation) applications
 */

const { MongoClient } = require('mongodb');

class VectorSearchExercises {
  constructor(connectionUrl) {
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
   * Generate mock embeddings (in real scenarios, use OpenAI, Cohere, etc.)
   */
  generateMockEmbedding(text, dimensions = 384) {
    const safeText = (text && text.length > 0) ? text : 'placeholder text';
    // Simple mock embedding based on text characteristics
    // In production, use actual embedding models
    const embedding = [];
    const seed = safeText.length + safeText.charCodeAt(0);

    for (let i = 0; i < dimensions; i++) {
      // Generate deterministic pseudo-random values
      const value = Math.sin(seed * (i + 1)) * Math.cos(seed / (i + 1));
      embedding.push(value);
    }

    // Normalize the vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vec1, vec2) {
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      magnitude1 += vec1[i] * vec1[i];
      magnitude2 += vec2[i] * vec2[i];
    }

    return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
  }

  /**
   * Exercise 1: Create Product Embeddings
   * Generate embeddings for product search
   */
  async createProductEmbeddings() {
    console.log('Creating product embeddings collection...');

    const products = this.db.collection('products_with_embeddings');
    await products.drop().catch(() => {});

    const productData = [
      {
        id: 'prod-1',
        name: 'Wireless Bluetooth Headphones',
        category: 'Electronics',
        description: 'High-quality wireless headphones with active noise cancellation, 30-hour battery life, and premium sound quality',
        price: 199.99,
        embedding: null
      },
      {
        id: 'prod-2',
        name: 'Noise Cancelling Earbuds',
        category: 'Electronics',
        description: 'Compact wireless earbuds with ANC technology, perfect for travel and commuting with crystal clear audio',
        price: 149.99,
        embedding: null
      },
      {
        id: 'prod-3',
        name: 'Professional Studio Monitor Headphones',
        category: 'Electronics',
        description: 'Wired studio headphones for music production, mixing, and professional audio work with flat frequency response',
        price: 299.99,
        embedding: null
      },
      {
        id: 'prod-4',
        name: 'Running Shoes',
        category: 'Sports',
        description: 'Lightweight running shoes with responsive cushioning and breathable mesh upper for marathon training',
        price: 129.99,
        embedding: null
      },
      {
        id: 'prod-5',
        name: 'Gaming Headset',
        category: 'Electronics',
        description: 'RGB gaming headset with surround sound, detachable microphone, and comfortable memory foam ear cushions',
        price: 89.99,
        embedding: null
      },
      {
        id: 'prod-6',
        name: 'Yoga Mat',
        category: 'Sports',
        description: 'Non-slip exercise mat for yoga, pilates, and floor exercises with extra thickness for comfort',
        price: 39.99,
        embedding: null
      }
    ];

    // Generate embeddings for each product
    for (const product of productData) {
      const textToEmbed = `${product.name} ${product.description}`;
      product.embedding = this.generateMockEmbedding(textToEmbed);
    }

    await products.insertMany(productData);
    console.log(`Created ${productData.length} products with embeddings`);

    // Create vector search index (Atlas only)
    if (this.isAtlas) {
      console.log('\nAtlas Vector Search Index:');
      console.log(`
{
  "fields": [{
    "type": "vector",
    "path": "embedding",
    "numDimensions": 384,
    "similarity": "cosine"
  }]
}
      `);
    }
  }

  /**
   * Exercise 2: Semantic Product Search
   * Find similar products using vector search
   */
  async semanticProductSearch() {
    const products = this.db.collection('products_with_embeddings');

    console.log('\nSemantic search for: "wireless audio headphones for music"');

    const queryText = 'wireless audio headphones for music';
    const queryEmbedding = this.generateMockEmbedding(queryText);

    if (this.isAtlas) {
      // Atlas Vector Search query
      console.log('\nAtlas Vector Search query:');
      console.log(`
{
  $vectorSearch: {
    index: "vector_index",
    path: "embedding",
    queryVector: [${queryEmbedding.slice(0, 3).join(', ')}, ...],
    numCandidates: 100,
    limit: 5
  }
}
      `);
    }

    // Local similarity search simulation
    const allProducts = await products.find({}).toArray();

    const similarities = allProducts.map(product => ({
      ...product,
      similarity: this.cosineSimilarity(queryEmbedding, product.embedding)
    }));

    similarities.sort((a, b) => b.similarity - a.similarity);

    console.log('\nTop 3 similar products:');
    similarities.slice(0, 3).forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name}`);
      console.log(`     Similarity: ${(product.similarity * 100).toFixed(2)}%`);
      console.log(`     Price: $${product.price}`);
    });
  }

  /**
   * Exercise 3: Document Embeddings for Q&A
   * Create embeddings for document search
   */
  async documentEmbeddings() {
    console.log('\nCreating document embeddings for Q&A system...');

    const documents = this.db.collection('knowledge_base');
    await documents.drop().catch(() => {});

    const knowledgeBase = [
      {
        id: 'doc-1',
        title: 'MongoDB Aggregation Pipeline',
        content: 'The aggregation pipeline is a framework for data aggregation modeled on the concept of data processing pipelines. Documents enter a multi-stage pipeline that transforms the documents into aggregated results.',
        category: 'Database',
        embedding: null
      },
      {
        id: 'doc-2',
        title: 'Change Streams in MongoDB',
        content: 'Change streams allow applications to access real-time data changes without the complexity and risk of tailing the oplog. Applications can use change streams to subscribe to all data changes on a collection.',
        category: 'Database',
        embedding: null
      },
      {
        id: 'doc-3',
        title: 'Vector Search Overview',
        content: 'Vector search enables semantic search by converting text and other data into numerical vectors. These vectors capture meaning and context, allowing for similarity-based searches that understand intent.',
        category: 'AI/ML',
        embedding: null
      },
      {
        id: 'doc-4',
        title: 'Machine Learning Basics',
        content: 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing computer programs that can access data and learn.',
        category: 'AI/ML',
        embedding: null
      },
      {
        id: 'doc-5',
        title: 'Time-Series Data Management',
        content: 'Time-series data consists of sequences of data points indexed in time order. MongoDB time-series collections provide optimized storage and querying for IoT sensors, financial data, and monitoring metrics.',
        category: 'Database',
        embedding: null
      }
    ];

    // Generate embeddings
    for (const doc of knowledgeBase) {
      doc.embedding = this.generateMockEmbedding(doc.content);
    }

    await documents.insertMany(knowledgeBase);

    // Question answering
    const question = 'How can I monitor real-time data changes?';
    console.log(`\nQuestion: "${question}"`);

    const questionEmbedding = this.generateMockEmbedding(question);

    // Find most relevant documents
    const allDocs = await documents.find({}).toArray();
    const relevantDocs = allDocs
      .map(doc => ({
        ...doc,
        relevance: this.cosineSimilarity(questionEmbedding, doc.embedding)
      }))
      .sort((a, b) => b.relevance - a.relevance);

    console.log('\nMost relevant documents:');
    relevantDocs.slice(0, 2).forEach((doc, index) => {
      console.log(`  ${index + 1}. ${doc.title} (${(doc.relevance * 100).toFixed(1)}% relevance)`);
      console.log(`     ${doc.content.substring(0, 100)}...`);
    });
  }

  /**
   * Exercise 4: Image Similarity Search
   * Simulate image search using embeddings
   */
  async imageSimilaritySearch() {
    console.log('\nCreating image embeddings collection...');

    const images = this.db.collection('image_gallery');
    await images.drop().catch(() => {});

    const imageData = [
      {
        id: 'img-1',
        filename: 'sunset_beach.jpg',
        tags: ['sunset', 'beach', 'ocean', 'orange', 'peaceful'],
        description: 'Beautiful sunset over the ocean with orange and pink sky',
        embedding: null
      },
      {
        id: 'img-2',
        filename: 'mountain_sunrise.jpg',
        tags: ['sunrise', 'mountain', 'nature', 'orange', 'landscape'],
        description: 'Stunning sunrise behind mountain peaks with golden light',
        embedding: null
      },
      {
        id: 'img-3',
        filename: 'city_night.jpg',
        tags: ['city', 'night', 'lights', 'urban', 'skyline'],
        description: 'City skyline at night with bright lights and skyscrapers',
        embedding: null
      },
      {
        id: 'img-4',
        filename: 'forest_path.jpg',
        tags: ['forest', 'trees', 'path', 'green', 'nature'],
        description: 'Peaceful forest path surrounded by tall green trees',
        embedding: null
      },
      {
        id: 'img-5',
        filename: 'ocean_waves.jpg',
        tags: ['ocean', 'waves', 'beach', 'blue', 'water'],
        description: 'Powerful ocean waves crashing on sandy beach',
        embedding: null
      }
    ];

    // Generate embeddings based on tags and description
    for (const image of imageData) {
      const textRepresentation = `${image.tags.join(' ')} ${image.description}`;
      image.embedding = this.generateMockEmbedding(textRepresentation, 512); // Higher dimensions for images
    }

    await images.insertMany(imageData);

    // Find similar images
    const referenceImage = imageData[0]; // sunset_beach.jpg
    console.log(`\nFinding images similar to: ${referenceImage.filename}`);

    const allImages = await images.find({}).toArray();
    const similarities = allImages
      .filter(img => img.id !== referenceImage.id)
      .map(img => ({
        ...img,
        similarity: this.cosineSimilarity(referenceImage.embedding, img.embedding)
      }))
      .sort((a, b) => b.similarity - a.similarity);

    console.log('Similar images:');
    similarities.slice(0, 3).forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.filename} (${(img.similarity * 100).toFixed(1)}% similar)`);
      console.log(`     Tags: ${img.tags.join(', ')}`);
    });
  }

  /**
   * Exercise 5: Recommendation System
   * Build a recommendation system using embeddings
   */
  async recommendationSystem() {
    console.log('\nBuilding recommendation system...');

    const movies = this.db.collection('movies');
    await movies.drop().catch(() => {});

    const movieData = [
      {
        id: 'movie-1',
        title: 'The Matrix',
        genres: ['sci-fi', 'action', 'cyberpunk'],
        description: 'A hacker discovers reality is a simulation and joins a rebellion against the machines',
        year: 1999,
        embedding: null
      },
      {
        id: 'movie-2',
        title: 'Inception',
        genres: ['sci-fi', 'thriller', 'mind-bending'],
        description: 'A thief who enters dreams to steal secrets is given a chance to have his criminal history erased',
        year: 2010,
        embedding: null
      },
      {
        id: 'movie-3',
        title: 'The Dark Knight',
        genres: ['action', 'crime', 'superhero'],
        description: 'Batman faces the Joker, a criminal mastermind who wants to plunge Gotham into chaos',
        year: 2008,
        embedding: null
      },
      {
        id: 'movie-4',
        title: 'Blade Runner',
        genres: ['sci-fi', 'neo-noir', 'cyberpunk'],
        description: 'A blade runner must pursue and terminate replicants who have escaped to Earth',
        year: 1982,
        embedding: null
      },
      {
        id: 'movie-5',
        title: 'Interstellar',
        genres: ['sci-fi', 'drama', 'space'],
        description: 'Astronauts travel through a wormhole in search of a new home for humanity',
        year: 2014,
        embedding: null
      }
    ];

    // Generate embeddings
    for (const movie of movieData) {
      const features = `${movie.genres.join(' ')} ${movie.description}`;
      movie.embedding = this.generateMockEmbedding(features, 256);
    }

    await movies.insertMany(movieData);

    // User profile based on watched movies
    const userProfile = {
      userId: 'user-123',
      watchedMovies: ['movie-1', 'movie-4'], // The Matrix and Blade Runner
      preferenceEmbedding: null
    };

    // Calculate user preference embedding (average of watched movies)
    const watchedMovies = await movies.find({
      id: { $in: userProfile.watchedMovies }
    }).toArray();

    const avgEmbedding = new Array(256).fill(0);
    for (const movie of watchedMovies) {
      for (let i = 0; i < 256; i++) {
        avgEmbedding[i] += movie.embedding[i];
      }
    }
    for (let i = 0; i < 256; i++) {
      avgEmbedding[i] /= watchedMovies.length;
    }
    userProfile.preferenceEmbedding = avgEmbedding;

    console.log(`User has watched: ${watchedMovies.map(m => m.title).join(', ')}`);

    // Get recommendations
    const allMovies = await movies.find({
      id: { $nin: userProfile.watchedMovies }
    }).toArray();

    const recommendations = allMovies
      .map(movie => ({
        ...movie,
        score: this.cosineSimilarity(userProfile.preferenceEmbedding, movie.embedding)
      }))
      .sort((a, b) => b.score - a.score);

    console.log('\nRecommended movies:');
    recommendations.slice(0, 3).forEach((movie, index) => {
      console.log(`  ${index + 1}. ${movie.title} (${movie.year})`);
      console.log(`     Score: ${(movie.score * 100).toFixed(1)}%`);
      console.log(`     Genres: ${movie.genres.join(', ')}`);
    });
  }

  /**
   * Exercise 6: Hybrid Search
   * Combine vector search with traditional filters
   */
  async hybridSearch() {
    console.log('\nHybrid search: Semantic + Filters...');

    const products = this.db.collection('products_with_embeddings');

    // Query embedding
    const queryText = 'headphones for music';
    const queryEmbedding = this.generateMockEmbedding(queryText);

    // Get all products
    const allProducts = await products.find({}).toArray();

    // Calculate similarities
    const results = allProducts.map(product => ({
      ...product,
      vectorScore: this.cosineSimilarity(queryEmbedding, product.embedding)
    }));

    // Apply filters and combine scores
    const filtered = results
      .filter(product => product.price <= 200) // Price filter
      .filter(product => product.category === 'Electronics') // Category filter
      .map(product => ({
        ...product,
        combinedScore: product.vectorScore * 0.7 + (200 - product.price) / 200 * 0.3 // Combine vector and price scores
      }))
      .sort((a, b) => b.combinedScore - a.combinedScore);

    console.log('Results (vector search + price <= $200 + Electronics):');
    filtered.slice(0, 3).forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name}`);
      console.log(`     Vector Score: ${(product.vectorScore * 100).toFixed(1)}%`);
      console.log(`     Price: $${product.price}`);
      console.log(`     Combined Score: ${(product.combinedScore * 100).toFixed(1)}%`);
    });
  }

  /**
   * Exercise 7: RAG (Retrieval Augmented Generation) Pattern
   * Demonstrate RAG pattern for AI applications
   */
  async ragPattern() {
    console.log('\nRAG Pattern Implementation...');

    const docs = this.db.collection('rag_documents');
    await docs.drop().catch(() => {});

    // Knowledge base for RAG
    const documents = [
      {
        id: 'rag-1',
        source: 'MongoDB Documentation',
        content: 'MongoDB stores data in flexible, JSON-like documents. This means fields can vary from document to document and data structure can be changed over time.',
        metadata: { topic: 'database', subtopic: 'document-model' },
        embedding: null
      },
      {
        id: 'rag-2',
        source: 'MongoDB Documentation',
        content: 'Indexes support the efficient execution of queries in MongoDB. Without indexes, MongoDB must perform a collection scan to find documents.',
        metadata: { topic: 'database', subtopic: 'indexing' },
        embedding: null
      },
      {
        id: 'rag-3',
        source: 'MongoDB Documentation',
        content: 'Replication provides redundancy and increases data availability. With multiple copies of data on different database servers, replication provides fault tolerance.',
        metadata: { topic: 'database', subtopic: 'replication' },
        embedding: null
      },
      {
        id: 'rag-4',
        source: 'MongoDB Documentation',
        content: 'Sharding is a method for distributing data across multiple machines. MongoDB uses sharding to support deployments with very large data sets and high throughput operations.',
        metadata: { topic: 'database', subtopic: 'sharding' },
        embedding: null
      }
    ];

    // Generate embeddings
    for (const doc of documents) {
      doc.embedding = this.generateMockEmbedding(doc.content);
    }

    await docs.insertMany(documents);

    // User query
    const userQuery = 'How does MongoDB handle large amounts of data?';
    console.log(`\nUser Query: "${userQuery}"`);

    const queryEmbedding = this.generateMockEmbedding(userQuery);

    // Step 1: Retrieve relevant documents
    const allDocs = await docs.find({}).toArray();
    const relevantDocs = allDocs
      .map(doc => ({
        ...doc,
        relevance: this.cosineSimilarity(queryEmbedding, doc.embedding)
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 2);

    console.log('\nStep 1 - Retrieved Context:');
    relevantDocs.forEach(doc => {
      console.log(`  - ${doc.source} (${(doc.relevance * 100).toFixed(1)}% relevant)`);
      console.log(`    "${doc.content}"`);
    });

    // Step 2: Generate augmented prompt
    const context = relevantDocs.map(doc => doc.content).join('\n');
    const augmentedPrompt = `
Context:
${context}

Question: ${userQuery}

Based on the context provided, please answer the question.
    `;

    console.log('\nStep 2 - Augmented Prompt for LLM:');
    console.log(augmentedPrompt);

    console.log('\nStep 3 - LLM Response (simulated):');
    console.log('MongoDB handles large amounts of data through sharding, which distributes data across multiple machines. This allows MongoDB to support deployments with very large data sets and high throughput operations by horizontally scaling the database across multiple servers.');
  }

  async cleanup() {
    // Clean up collections
    const collections = [
      'products_with_embeddings', 'knowledge_base',
      'image_gallery', 'movies', 'rag_documents'
    ];

    for (const coll of collections) {
      await this.db.collection(coll).drop().catch(() => {});
    }

    await this.client.close();
    console.log('\nCleanup completed');
  }
}

// Main execution
async function main() {
  const connectionUrl = process.env.MONGODB_ATLAS_URI || 'mongodb://localhost:27017';
  const exercises = new VectorSearchExercises(connectionUrl);

  try {
    await exercises.connect();

    console.log('=== Exercise 1: Create Product Embeddings ===\n');
    await exercises.createProductEmbeddings();

    console.log('\n=== Exercise 2: Semantic Product Search ===');
    await exercises.semanticProductSearch();

    console.log('\n=== Exercise 3: Document Embeddings for Q&A ===');
    await exercises.documentEmbeddings();

    console.log('\n=== Exercise 4: Image Similarity Search ===');
    await exercises.imageSimilaritySearch();

    console.log('\n=== Exercise 5: Recommendation System ===');
    await exercises.recommendationSystem();

    console.log('\n=== Exercise 6: Hybrid Search ===');
    await exercises.hybridSearch();

    console.log('\n=== Exercise 7: RAG Pattern ===');
    await exercises.ragPattern();

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

module.exports = VectorSearchExercises;
