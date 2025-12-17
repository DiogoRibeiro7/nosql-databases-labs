# JavaScript Files Usage Guide - Lab 04

This directory contains JavaScript files that must be run with different tools. Please use the correct tool for each file:

## Files for MongoDB Shell (mongosh)

These files should be run directly in the MongoDB Shell using the `mongosh` command:

- **sales_analytics_mongosh.js** - Sales analytics aggregation pipelines (run in mongosh)

  ```bash
  mongosh --file sales_analytics_mongosh.js
  ```

## Files for Node.js

These files should be run with Node.js using the `node` command:

- **aggregation_advanced.js** - Advanced aggregation techniques using Node.js

  ```bash
  node aggregation_advanced.js
  ```

- **aggregation_analytics.js** - Analytics-focused aggregations using Node.js

  ```bash
  node aggregation_analytics.js
  ```

- **aggregation_basics.js** - Basic aggregation operations using Node.js

  ```bash
  node aggregation_basics.js
  ```

- **aggregation_performance.js** - Performance optimization for aggregations using Node.js

  ```bash
  node aggregation_performance.js
  ```

- **sales_analytics.js** - Sales analytics aggregation pipelines using Node.js

  ```bash
  node sales_analytics.js
  ```

- **import_data.js** - Imports the starter dataset and builds indexes

- **test_lab04.js** - Runs the assertion-based aggregation test suite

  ```bash
  node import_data.js
  node test_lab04.js
  ```

## Setup Scripts

- **setup_database.bat** - Windows batch script to set up the database

  ```cmd
  setup_database.bat
  ```

- **setup_database.sh** - Unix/Linux/macOS shell script to set up the database

  ```bash
  ./setup_database.sh
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

4. **Permission denied for shell scripts** - Make the script executable:

   ```bash
   chmod +x setup_database.sh
   ```
