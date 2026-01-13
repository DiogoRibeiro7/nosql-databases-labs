# JavaScript Files Usage Guide - Lab 05

This directory contains JavaScript files that must be run with different tools. Please use the correct tool for each file:

## Files for MongoDB Shell (mongosh)

These files should be run directly in the MongoDB Shell using the `mongosh` command:

- **read_preferences_mongosh.js** - Test read preferences in replica sets (run in mongosh)

  ```bash
  mongosh --file read_preferences_mongosh.js
  ```

- **replication_mongosh.js** - General replication operations (run in mongosh)

  ```bash
  mongosh --file replication_mongosh.js
  ```

- **setup_replica_set_mongosh.js** - Initialize and configure replica set (run in mongosh)

  ```bash
  mongosh --file setup_replica_set_mongosh.js
  ```

- **simulate_failover_mongosh.js** - Simulate failover scenarios (run in mongosh)

  ```bash
  mongosh --file simulate_failover_mongosh.js
  ```

- **test_replication_mongosh.js** - Test replication functionality (run in mongosh)

  ```bash
  mongosh --file test_replication_mongosh.js
  ```

- **write_concerns_mongosh.js** - Test write concern levels (run in mongosh)

  ```bash
  mongosh --file write_concerns_mongosh.js
  ```

## Files for Node.js

These files should be run with Node.js using the `node` command:

- **read_preferences.js** - Test read preferences using Node.js driver

  ```bash
  node read_preferences.js
  ```

- **setup_replica_set.js** - Initialize and configure replica set using Node.js

  ```bash
  node setup_replica_set.js
  ```

- **simulate_failover.js** - Simulate failover scenarios using Node.js

  ```bash
  node simulate_failover.js
  ```

- **test_replication.js** - Test replication functionality using Node.js

  ```bash
  node test_replication.js
  ```

- **write_concerns.js** - Test write concern levels using Node.js

  ```bash
  node write_concerns.js
  ```

- **monitor_replication.js** – Continuously captures replication lag and election events

  ```bash
  node monitor_replication.js --minutes=5 --interval=3
  ```

## How to Identify the Correct Tool

### Mongosh Files

- Files ending with `_mongosh.js` are specifically for MongoDB Shell
- Use MongoDB Shell syntax (db.collection.method())
- Can be run directly in mongosh interactive mode or with --file flag
- Often used for administrative tasks like replica set configuration

### Node.js Files

- Require MongoDB driver imports (`require('mongodb')`)
- Use async/await patterns
- Need Node.js runtime and npm packages installed
- Better for application-level testing of replication features

## Prerequisites

### For mongosh files:

```bash
# Install MongoDB Shell if not already installed
brew install mongosh  # macOS
# or download from https://www.mongodb.com/try/download/shell
```

### For Node.js files:

```bash
# Install dependencies first
npm install

# Then run the Node.js files
node <filename>.js
```

### For Replica Set Testing:

```bash
# You need multiple MongoDB instances running
# Check your replica set status:
mongosh --eval "rs.status()"
```

## Common Issues

1. **"ReferenceError: require is not defined"** - You're trying to run a Node.js file in mongosh. Use `node` command instead.

2. **"SyntaxError: Unexpected identifier"** - You're trying to run a mongosh file with Node.js. Use `mongosh --file` instead.

3. **Connection errors** - Make sure MongoDB replica set is properly configured:

   ```bash
   # Check replica set configuration
   mongosh --eval "rs.conf()"
   ```

4. **"NotYetInitialized"** - Replica set needs to be initialized first:

   ```bash
   mongosh --file setup_replica_set_mongosh.js
   ```

5. **Write concern errors** - Ensure you have enough replica set members to satisfy the write concern level.
