/**
 * Lab 05 - Replica Set Setup Script
 *
 * This script sets up a MongoDB replica set with 3 members on the local machine.
 * It creates the necessary directories, configuration files, and initializes the replica set.
 */

const { MongoClient } = require('mongodb');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Configuration
const REPLICA_SET_NAME = 'lab05-rs';
const BASE_PORT = 27017;
const MEMBERS = [
    { port: 27017, priority: 2, name: 'primary' },
    { port: 27018, priority: 1, name: 'secondary1' },
    { port: 27019, priority: 1, name: 'secondary2' }
];

// Platform-specific settings
const isWindows = os.platform() === 'win32';
const mongodPath = isWindows ? 'mongod.exe' : 'mongod';

// Store process references
const processes = [];

// Helper function to create directories
async function createDirectories() {
    console.log('Creating data directories...');

    for (const member of MEMBERS) {
        const dataDir = path.join(__dirname, 'data', `node${member.port}`);
        const logDir = path.join(__dirname, 'logs');

        await fs.mkdir(dataDir, { recursive: true });
        await fs.mkdir(logDir, { recursive: true });

        console.log(`✓ Created directory: ${dataDir}`);
    }
}

// Helper function to create configuration files
async function createConfigFiles() {
    console.log('\nCreating configuration files...');

    const configDir = path.join(__dirname, 'starter', 'configs');
    await fs.mkdir(configDir, { recursive: true });

    for (const member of MEMBERS) {
        const config = {
            net: {
                port: member.port,
                bindIp: '127.0.0.1'
            },
            storage: {
                dbPath: path.join(__dirname, 'data', `node${member.port}`),
                journal: {
                    enabled: true
                }
            },
            systemLog: {
                destination: 'file',
                path: path.join(__dirname, 'logs', `mongod-${member.port}.log`),
                logAppend: true
            },
            replication: {
                replSetName: REPLICA_SET_NAME,
                oplogSizeMB: 100
            }
        };

        const configPath = path.join(configDir, `mongod-${member.port}.conf`);

        // Convert to YAML format
        const yamlContent = `# MongoDB Configuration for ${member.name}
net:
  port: ${config.net.port}
  bindIp: ${config.net.bindIp}

storage:
  dbPath: ${config.storage.dbPath.replace(/\\/g, '/')}
  journal:
    enabled: true

systemLog:
  destination: file
  path: ${config.systemLog.path.replace(/\\/g, '/')}
  logAppend: true

replication:
  replSetName: ${config.replication.replSetName}
  oplogSizeMB: ${config.replication.oplogSizeMB}
`;

        await fs.writeFile(configPath, yamlContent);
        console.log(`✓ Created config: ${configPath}`);
    }
}

// Start MongoDB instances
async function startMongoInstances() {
    console.log('\nStarting MongoDB instances...');

    for (const member of MEMBERS) {
        const dataDir = path.join(__dirname, 'data', `node${member.port}`);
        const logPath = path.join(__dirname, 'logs', `mongod-${member.port}.log`);

        const args = [
            '--replSet', REPLICA_SET_NAME,
            '--port', member.port.toString(),
            '--dbpath', dataDir,
            '--logpath', logPath,
            '--fork'  // Note: --fork doesn't work on Windows
        ];

        // On Windows, we can't use --fork, so we spawn detached
        const options = isWindows ? { detached: true, stdio: 'ignore' } : {};

        if (isWindows) {
            // Remove --fork for Windows
            args.pop();
        }

        console.log(`Starting mongod on port ${member.port}...`);

        try {
            const mongod = spawn(mongodPath, args, options);

            if (isWindows) {
                mongod.unref();
            }

            processes.push({ port: member.port, process: mongod });

            // Wait a moment for the process to start
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log(`✓ Started mongod on port ${member.port}`);
        } catch (error) {
            console.error(`✗ Failed to start mongod on port ${member.port}:`, error.message);
            throw error;
        }
    }

    // Wait for all instances to be ready
    console.log('\nWaiting for instances to be ready...');
    await new Promise(resolve => setTimeout(resolve, 5000));
}

// Initialize replica set
async function initializeReplicaSet() {
    console.log('\nInitializing replica set...');

    let client;

    try {
        // Connect to the first member
        const uri = `mongodb://localhost:${BASE_PORT}/?directConnection=true`;
        client = new MongoClient(uri);
        await client.connect();

        const admin = client.db('admin');

        // Check if replica set is already initialized
        try {
            await admin.command({ replSetGetStatus: 1 });
            console.log('Replica set already initialized. Skipping initialization.');
            return;
        } catch {
            // Not initialized yet, continue
        }

        // Configure replica set
        const config = {
            _id: REPLICA_SET_NAME,
            members: MEMBERS.map((member, index) => ({
                _id: index,
                host: `localhost:${member.port}`,
                priority: member.priority || 1
            }))
        };

        console.log('Replica set configuration:', JSON.stringify(config, null, 2));

        // Initialize replica set
        const result = await admin.command({ replSetInitiate: config });

        if (result.ok === 1) {
            console.log('✓ Replica set initialized successfully');

            // Wait for primary election
            console.log('\nWaiting for primary election...');
            await waitForPrimary(client);
        } else {
            throw new Error(`Failed to initialize replica set: ${JSON.stringify(result)}`);
        }

    } catch (error) {
        console.error('Error initializing replica set:', error.message);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Wait for primary to be elected
async function waitForPrimary(client) {
    const maxAttempts = 30;
    let attempts = 0;

    while (attempts < maxAttempts) {
        try {
            const admin = client.db('admin');
            const status = await admin.command({ replSetGetStatus: 1 });

            const primary = status.members.find(m => m.stateStr === 'PRIMARY');

            if (primary) {
                console.log(`✓ Primary elected: ${primary.name}`);
                return;
            }

            process.stdout.write('.');
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        } catch {
            process.stdout.write('.');
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }
    }

    throw new Error('Primary election timeout');
}

// Load sample data
async function loadSampleData() {
    console.log('\nLoading sample data...');

    let client;

    try {
        // Connect with replica set connection string
        const uri = `mongodb://localhost:${BASE_PORT},localhost:${MEMBERS[1].port},localhost:${MEMBERS[2].port}/?replicaSet=${REPLICA_SET_NAME}`;
        client = new MongoClient(uri);
        await client.connect();

        const db = client.db('lab05_replication');

        // Create sample collections
        const collections = ['products', 'orders', 'customers'];

        for (const collName of collections) {
            const collection = db.collection(collName);

            // Insert sample documents
            const sampleDocs = generateSampleData(collName);

            if (sampleDocs.length > 0) {
                await collection.insertMany(sampleDocs);
                console.log(`✓ Inserted ${sampleDocs.length} documents into ${collName}`);
            }
        }

        console.log('✓ Sample data loaded successfully');

    } catch (error) {
        console.error('Error loading sample data:', error.message);
        // Not critical, continue
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Generate sample data for testing
function generateSampleData(collection) {
    switch (collection) {
        case 'products':
            return [
                { product_id: 'PROD001', name: 'Laptop', price: 999.99, stock: 50 },
                { product_id: 'PROD002', name: 'Mouse', price: 29.99, stock: 200 },
                { product_id: 'PROD003', name: 'Keyboard', price: 79.99, stock: 150 }
            ];

        case 'orders':
            return [
                {
                    order_id: 'ORD001',
                    customer_id: 'CUST001',
                    products: ['PROD001'],
                    total: 999.99,
                    status: 'completed',
                    created_at: new Date()
                },
                {
                    order_id: 'ORD002',
                    customer_id: 'CUST002',
                    products: ['PROD002', 'PROD003'],
                    total: 109.98,
                    status: 'pending',
                    created_at: new Date()
                }
            ];

        case 'customers':
            return [
                {
                    customer_id: 'CUST001',
                    name: 'John Doe',
                    email: 'john@example.com',
                    created_at: new Date()
                },
                {
                    customer_id: 'CUST002',
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    created_at: new Date()
                }
            ];

        default:
            return [];
    }
}

// Verify replica set status
async function verifyReplicaSet() {
    console.log('\nVerifying replica set status...');

    let client;

    try {
        const uri = `mongodb://localhost:${BASE_PORT},localhost:${MEMBERS[1].port},localhost:${MEMBERS[2].port}/?replicaSet=${REPLICA_SET_NAME}`;
        client = new MongoClient(uri);
        await client.connect();

        const admin = client.db('admin');
        const status = await admin.command({ replSetGetStatus: 1 });

        console.log('\nReplica Set Status:');
        console.log('===================');
        console.log(`Name: ${status.set}`);
        console.log(`Members: ${status.members.length}`);

        status.members.forEach(member => {
            console.log(`\n${member.name}:`);
            console.log(`  State: ${member.stateStr}`);
            console.log(`  Health: ${member.health === 1 ? 'Healthy' : 'Unhealthy'}`);
            if (member.stateStr === 'PRIMARY') {
                console.log(`  ⭐ This is the PRIMARY`);
            }
        });

        console.log('\n✓ Replica set is operational!');

    } catch (error) {
        console.error('Error verifying replica set:', error.message);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Create helper scripts
async function createHelperScripts() {
    console.log('\nCreating helper scripts...');

    // Create connection script
    const connectScript = `#!/bin/bash
# Connect to replica set

echo "Connecting to replica set..."
mongosh "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=${REPLICA_SET_NAME}"
`;

    await fs.writeFile(path.join(__dirname, 'connect.sh'), connectScript);

    // Create shutdown script
    const shutdownScript = `#!/bin/bash
# Shutdown replica set

echo "Shutting down replica set..."
mongosh --port 27017 --eval "db.adminCommand({shutdown: 1})" || true
mongosh --port 27018 --eval "db.adminCommand({shutdown: 1})" || true
mongosh --port 27019 --eval "db.adminCommand({shutdown: 1})" || true
echo "Replica set shut down"
`;

    await fs.writeFile(path.join(__dirname, 'shutdown.sh'), shutdownScript);

    console.log('✓ Created helper scripts');
}

// Main setup function
async function setup() {
    console.log('=' .repeat(60));
    console.log('Lab 05 - Replica Set Setup');
    console.log('=' .repeat(60));

    try {
        // Create necessary directories
        await createDirectories();

        // Create configuration files
        await createConfigFiles();

        // Start MongoDB instances
        await startMongoInstances();

        // Initialize replica set
        await initializeReplicaSet();

        // Load sample data
        await loadSampleData();

        // Verify setup
        await verifyReplicaSet();

        // Create helper scripts
        await createHelperScripts();

        console.log('\n' + '=' .repeat(60));
        console.log('Setup Complete!');
        console.log('=' .repeat(60));
        console.log('\nYou can now:');
        console.log('1. Connect to primary: mongosh --port 27017');
        console.log('2. Connect to replica set: mongosh "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=' + REPLICA_SET_NAME + '"');
        console.log('3. Run tests: node test_replication.js');
        console.log('4. Shutdown: node shutdown_replica_set.js');

    } catch (error) {
        console.error('\n✗ Setup failed:', error.message);

        // Cleanup on failure
        console.log('\nCleaning up...');
        for (const proc of processes) {
            if (proc.process) {
                proc.process.kill();
            }
        }

        process.exit(1);
    }
}

// Run setup if called directly
if (require.main === module) {
    setup().catch(console.error);
}

module.exports = { setup, REPLICA_SET_NAME, MEMBERS };
