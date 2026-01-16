// Utility script to seed MongoDB with a realistic e-commerce workload using Faker.
import { faker } from '@faker-js/faker';
import { MongoClient } from 'mongodb';

// Configure Faker
faker.locale = 'pt_PT';

// MongoDB connection
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'database_demo';

/**
 * Build an array of mock user profiles with nested account/profile data.
 *
 * @param {number} [n=100] - Number of user documents to create.
 * @returns {Array<object>} Generated user documents ready for MongoDB.
 */
function generateUsers(n = 100) {
    const users = [];
    
    for (let i = 0; i < n; i++) {
        const user = {
            _id: faker.datatype.uuid(),
            username: faker.internet.userName(),
            email: faker.internet.email(),
            profile: {
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                fullName: faker.person.fullName(),
                avatar: faker.image.avatar(),
                bio: faker.lorem.paragraph({ min: 2, max: 4 }),
                birthDate: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
                gender: faker.helpers.arrayElement(['M', 'F', 'Other', null]),
                phone: faker.phone.number(),
                address: {
                    street: faker.location.streetAddress(),
                    city: faker.location.city(),
                    state: faker.location.state(),
                    country: 'Portugal',
                    postalCode: faker.location.zipCode(),
                    coordinates: {
                        type: 'Point',
                        coordinates: [
                            parseFloat(faker.location.longitude()),
                            parseFloat(faker.location.latitude())
                        ]
                    }
                }
            },
            account: {
                type: faker.helpers.arrayElement(['free', 'premium', 'enterprise']),
                status: faker.helpers.arrayElement(['active', 'inactive', 'suspended']),
                createdAt: faker.date.between({ from: new Date('2021-01-01'), to: new Date() }),
                lastLogin: faker.date.recent({ days: 30 }),
                loginCount: faker.number.int({ min: 0, max: 1000 }),
                preferences: {
                    newsletter: faker.datatype.boolean({ probability: 0.7 }),
                    notifications: faker.datatype.boolean({ probability: 0.8 }),
                    language: faker.helpers.arrayElement(['pt', 'en', 'es']),
                    theme: faker.helpers.arrayElement(['light', 'dark', 'auto'])
                }
            },
            tags: faker.helpers.multiple(() => faker.word.noun(), { count: { min: 2, max: 6 } }),
            metadata: {
                source: faker.helpers.arrayElement(['web', 'mobile', 'api']),
                ipAddress: faker.internet.ipv4(),
                userAgent: faker.internet.userAgent()
            }
        };
        users.push(user);
    }
    
    return users;
}

/**
 * Build an array of product documents spanning multiple categories.
 *
 * @param {number} [n=500] - Number of products to generate.
 * @returns {Array<object>} Product payloads with pricing, inventory, etc.
 */
function generateProducts(n = 500) {
    const products = [];
    const categories = ['Electronics', 'Books', 'Clothing', 'Home & Garden', 'Sports', 'Toys'];
    
    for (let i = 0; i < n; i++) {
        const category = faker.helpers.arrayElement(categories);
        const product = {
            sku: faker.commerce.isbn(),
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            category: category,
            subcategory: faker.commerce.department(),
            brand: faker.company.name(),
            price: {
                amount: parseFloat(faker.commerce.price({ min: 10, max: 1000, dec: 2 })),
                currency: 'EUR',
                discount: faker.datatype.boolean({ probability: 0.3 }) 
                    ? parseFloat(faker.commerce.price({ min: 0, max: 30, dec: 2 })) 
                    : 0
            },
            inventory: {
                inStock: faker.datatype.boolean({ probability: 0.85 }),
                quantity: faker.number.int({ min: 0, max: 1000 }),
                warehouse: faker.helpers.arrayElement(['Porto', 'Lisboa', 'Faro'])
            },
            attributes: {
                color: ['Clothing', 'Home & Garden'].includes(category) 
                    ? faker.color.human() 
                    : null,
                size: category === 'Clothing' 
                    ? faker.helpers.arrayElement(['S', 'M', 'L', 'XL']) 
                    : null,
                weight: `${faker.number.float({ min: 0.1, max: 50, precision: 0.01 })} kg`,
                dimensions: {
                    length: faker.number.int({ min: 10, max: 200 }),
                    width: faker.number.int({ min: 10, max: 150 }),
                    height: faker.number.int({ min: 5, max: 100 }),
                    unit: 'cm'
                }
            },
            ratings: {
                average: parseFloat(faker.number.float({ min: 1, max: 5, precision: 0.1 })),
                count: faker.number.int({ min: 0, max: 5000 })
            },
            images: faker.helpers.multiple(() => faker.image.url(), { 
                count: faker.number.int({ min: 1, max: 5 }) 
            }),
            tags: faker.helpers.multiple(() => faker.word.noun(), { count: { min: 3, max: 8 } }),
            createdAt: faker.date.between({ from: new Date('2022-01-01'), to: new Date() }),
            updatedAt: faker.date.recent({ days: 30 })
        };
        products.push(product);
    }
    
    return products;
}

/**
 * Generate purchase transactions that reference the supplied users/products.
 *
 * @param {Array<object>} users - Previously generated user docs (for userId refs).
 * @param {Array<object>} products - Product docs for SKU references.
 * @param {number} [n=1000] - Number of transactions to create.
 * @returns {Array<object>} Transaction documents with embedded items.
 */
function generateTransactions(users, products, n = 1000) {
    const transactions = [];
    
    for (let i = 0; i < n; i++) {
        const numItems = faker.number.int({ min: 1, max: 5 });
        const items = [];
        let subtotal = 0;
        
        for (let j = 0; j < numItems; j++) {
            const product = faker.helpers.arrayElement(products);
            const quantity = faker.number.int({ min: 1, max: 3 });
            const itemTotal = product.price.amount * quantity;
            
            items.push({
                productSku: product.sku,
                productName: product.name,
                quantity: quantity,
                unitPrice: product.price.amount,
                total: parseFloat(itemTotal.toFixed(2))
            });
            subtotal += itemTotal;
        }
        
        // Apply Portuguese VAT and a random shipping fee to mirror real totals.
        const tax = subtotal * 0.23;
        const shipping = parseFloat(faker.commerce.price({ min: 0, max: 20, dec: 2 }));
        
        const transaction = {
            orderId: faker.datatype.uuid(),
            userId: faker.helpers.arrayElement(users)._id,
            status: faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
            items: items,
            payment: {
                method: faker.helpers.arrayElement(['credit_card', 'debit_card', 'paypal', 'mbway', 'bank_transfer']),
                status: faker.helpers.arrayElement(['pending', 'completed', 'failed']),
                transactionId: faker.git.commitSha().substring(0, 16)
            },
            shipping: {
                address: {
                    street: faker.location.streetAddress(),
                    city: faker.location.city(),
                    postalCode: faker.location.zipCode(),
                    country: 'Portugal'
                },
                method: faker.helpers.arrayElement(['standard', 'express', 'overnight']),
                trackingNumber: faker.datatype.boolean({ probability: 0.7 }) 
                    ? faker.string.alphanumeric(13).toUpperCase() 
                    : null,
                estimatedDelivery: faker.date.future({ years: 0.1 })
            },
            totals: {
                subtotal: parseFloat(subtotal.toFixed(2)),
                tax: parseFloat(tax.toFixed(2)),
                shipping: parseFloat(shipping),
                total: parseFloat((subtotal + tax + parseFloat(shipping)).toFixed(2))
            },
            timestamps: {
                created: faker.date.between({ from: new Date('2023-01-01'), to: new Date() }),
                updated: faker.date.recent({ days: 30 })
            }
        };
        transactions.push(transaction);
    }
    
    return transactions;
}

/**
 * Generate synthetic application logs optionally tied to user ids.
 *
 * @param {Array<object>} users - User docs to pick IDs from.
 * @param {number} [n=5000] - Number of log entries to emit.
 * @returns {Array<object>} Log documents spanning multiple levels/types.
 */
function generateLogs(users, n = 5000) {
    const logs = [];
    const logLevels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'];
    const logTypes = ['login', 'logout', 'page_view', 'api_call', 'error', 'performance'];
    
    for (let i = 0; i < n; i++) {
        const hasError = faker.datatype.boolean({ probability: 0.2 });
        
        const log = {
            timestamp: faker.date.recent({ days: 7 }),
            level: faker.helpers.arrayElement(logLevels),
            type: faker.helpers.arrayElement(logTypes),
            userId: faker.datatype.boolean({ probability: 0.8 }) 
                ? faker.helpers.arrayElement(users)._id 
                : null,
            sessionId: faker.datatype.uuid(),
            message: faker.hacker.phrase(),
            metadata: {
                ip: faker.internet.ipv4(),
                userAgent: faker.internet.userAgent(),
                endpoint: `/api/${faker.word.noun()}/${faker.word.verb()}`,
                method: faker.helpers.arrayElement(['GET', 'POST', 'PUT', 'DELETE']),
                statusCode: faker.helpers.arrayElement([200, 201, 400, 401, 403, 404, 500]),
                responseTime: faker.number.int({ min: 10, max: 3000 })
            },
            error: hasError ? {
                type: faker.hacker.abbreviation(),
                stack: faker.lorem.paragraphs({ min: 2, max: 5 })
            } : null
        };
        logs.push(log);
    }
    
    return logs;
}

// Main function to insert data
/**
 * Connect to MongoDB, regenerate datasets, insert them, and run sample queries.
 *
 * @returns {Promise<void>}
 */
async function insertDataToMongoDB() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db(dbName);
        
        console.log('🔄 Generating fake data...');
        
        // Generate data
        const users = generateUsers(100);
        const products = generateProducts(500);
        const transactions = generateTransactions(users, products, 1000);
        const logs = generateLogs(users, 5000);
        
        console.log('📊 Data generated:');
        console.log(`  - Users: ${users.length}`);
        console.log(`  - Products: ${products.length}`);
        console.log(`  - Transactions: ${transactions.length}`);
        console.log(`  - Logs: ${logs.length}`);
        
        console.log('\n💾 Inserting into MongoDB...');
        
        // Drop existing collections
        await db.collection('users').drop().catch(() => {});
        await db.collection('products').drop().catch(() => {});
        await db.collection('transactions').drop().catch(() => {});
        await db.collection('logs').drop().catch(() => {});
        
        // Insert users
        const usersCollection = db.collection('users');
        await usersCollection.insertMany(users);
        await usersCollection.createIndex({ email: 1 }, { unique: true });
        await usersCollection.createIndex({ username: 1 }, { unique: true });
        await usersCollection.createIndex({ 'profile.address.coordinates': '2dsphere' });
        console.log('✅ Users inserted');
        
        // Insert products
        const productsCollection = db.collection('products');
        await productsCollection.insertMany(products);
        await productsCollection.createIndex({ sku: 1 }, { unique: true });
        await productsCollection.createIndex({ category: 1 });
        await productsCollection.createIndex({ 'price.amount': 1 });
        await productsCollection.createIndex({ name: 'text', description: 'text' });
        console.log('✅ Products inserted');
        
        // Insert transactions
        const transactionsCollection = db.collection('transactions');
        await transactionsCollection.insertMany(transactions);
        await transactionsCollection.createIndex({ orderId: 1 }, { unique: true });
        await transactionsCollection.createIndex({ userId: 1 });
        await transactionsCollection.createIndex({ 'timestamps.created': -1 });
        console.log('✅ Transactions inserted');
        
        // Insert logs with TTL
        const logsCollection = db.collection('logs');
        await logsCollection.insertMany(logs);
        await logsCollection.createIndex({ timestamp: -1 });
        await logsCollection.createIndex({ userId: 1 });
        await logsCollection.createIndex({ level: 1 });
        await logsCollection.createIndex(
            { timestamp: 1 }, 
            { expireAfterSeconds: 30 * 24 * 60 * 60 } // 30 days TTL
        );
        console.log('✅ Logs inserted');
        
        // Show database stats
        const stats = await db.stats();
        console.log('\n📈 Database statistics:');
        console.log(`  - Database: ${stats.db}`);
        console.log(`  - Collections: ${stats.collections}`);
        console.log(`  - Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        
        // Example queries
        await runExampleQueries(db);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('\n👋 MongoDB connection closed');
    }
}

/**
 * Print a handful of business-driven queries/aggregations to validate the dataset.
 *
 * @param {import("mongodb").Db} db - Active database connection.
 * @returns {Promise<void>}
 */
async function runExampleQueries(db) {
    console.log('\n🔍 Example Queries:');
    
    // 1. Premium users from Porto
    const premiumUsers = await db.collection('users')
        .find({
            'account.type': 'premium',
            'profile.address.city': 'Porto'
        })
        .limit(5)
        .toArray();
    console.log(`\n1. Premium users from Porto: ${premiumUsers.length}`);
    
    // 2. High-rated products
    const highRatedProducts = await db.collection('products')
        .find({
            'ratings.average': { $gte: 4.5 }
        })
        .limit(5)
        .toArray();
    console.log(`2. Products with rating >= 4.5: ${highRatedProducts.length}`);
    
    // 3. Recent large transactions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
    
    const largeTransactions = await db.collection('transactions')
        .find({
            'totals.total': { $gte: 500 },
            'timestamps.created': { $gte: today }
        })
        .toArray();
    console.log(`3. Today's transactions over €500: ${largeTransactions.length}`);
    
    // 4. Error logs count
    const errorCount = await db.collection('logs')
        .countDocuments({ level: 'ERROR' });
    console.log(`4. Error logs: ${errorCount}`);
    
    // 5. Sales by category (aggregation)
    const salesByCategory = await db.collection('transactions')
        .aggregate([
            {
                $unwind: '$items'
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productSku',
                    foreignField: 'sku',
                    as: 'product'
                }
            },
            {
                $unwind: '$product'
            },
            {
                $group: {
                    _id: '$product.category',
                    totalSales: { $sum: '$items.total' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { totalSales: -1 }
            },
            {
                $limit: 3
            }
        ])
        .toArray();
    
    console.log('\n5. Sales by category:');
    salesByCategory.forEach(cat => {
        console.log(`   - ${cat._id}: €${cat.totalSales.toFixed(2)} (${cat.count} items)`);
    });
}

// Run the script
insertDataToMongoDB();
