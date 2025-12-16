# JavaScript Files Usage Guide - Lab 01

This directory contains JavaScript files that must be run with different tools. Please use the correct tool for each file:

## Files for MongoDB Shell (mongosh)

These files should be run directly in the MongoDB Shell using the `mongosh` command:

- **import_data_mongosh.js** - Import sample data into MongoDB (run in mongosh)

  ```bash
  mongosh --file import_data_mongosh.js
  ```

- **queries_mongosh.js** - Sample queries and CRUD operations (run in mongosh)

  ```bash
  mongosh --file queries_mongosh.js
  ```

## Files for Node.js

These files should be run with Node.js using the `node` command:

- **import_data.js** - Import sample data using MongoDB Node.js driver

  ```bash
  node import_data.js
  ```

- **reset_database.js** - Reset database to clean state using Node.js

  ```bash
  node reset_database.js
  ```

- **test_queries.js** - Test queries using Node.js MongoDB driver

  ```bash
  node test_queries.js
  ```

- **test_setup.js** - Test database setup and connection

  ```bash
  node test_setup.js
  ```

## How to Identify the Correct Tool

### Mongosh Files

- Files ending with `_mongosh.js` are specifically for MongoDB Shell
- Use MongoDB Shell syntax (db.collection.method())
- Can be run directly in mongosh interactive mode or with --file flag

### Node.js Files

- Require MongoDB driver imports (`require('mongodb')`)
- Use async/await patterns
- Need Node.js runtime and npm packages installed

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

## Common Issues

1. **"ReferenceError: require is not defined"** - You're trying to run a Node.js file in mongosh. Use `node` command instead.

2. **"SyntaxError: Unexpected identifier"** - You're trying to run a mongosh file with Node.js. Use `mongosh --file` instead.

3. **Connection errors** - Make sure MongoDB server is running:

  ```bash
  brew services start mongodb-community@7.0  # macOS
  ```
