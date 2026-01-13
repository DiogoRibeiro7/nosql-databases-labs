# JavaScript Files Usage Guide - Lab Extra

This directory contains extra lab exercises with JavaScript files. All JavaScript files in these extra labs are designed to run with Node.js.

## Lab Extra 01 - Transactions

All files in `lab_extra_01_transactions/` should be run with Node.js:

- **setup_database.js** - Set up database for transaction testing

  ```bash
  node lab_extra_01_transactions/setup_database.js
  ```

- **test_transactions.js** - Test transaction functionality

  ```bash
  node lab_extra_01_transactions/test_transactions.js
  ```

- **transactions.js** - Transaction examples and operations

  ```bash
  node lab_extra_01_transactions/transactions.js
  ```

## Lab Extra 02 - Sharding

All files in `lab_extra_02_sharding/` should be run with Node.js:

- **sharding_demo.js** - Sharding demonstration and examples

  ```bash
  node lab_extra_02_sharding/sharding_demo.js
  ```

## Lab Extra 03 - Indexing

All files in `lab_extra_03_indexing/` should be run with Node.js:

- **indexing_lab.js** - Advanced indexing exercises

  ```bash
  node lab_extra_03_indexing/indexing_lab.js
  ```

## How to Run These Files

All JavaScript files in the extra labs are Node.js files. They should be run using the `node` command:

```bash
# First, make sure you have dependencies installed
cd labs/lab_extra
npm install

# Then run any file with node
node <subdirectory>/<filename>.js
```

## Prerequisites

### MongoDB Requirements

- **Transactions** (lab_extra_01): Requires MongoDB replica set or sharded cluster
- **Sharding** (lab_extra_02): Requires MongoDB sharded cluster setup
- **Indexing** (lab_extra_03): Works with standalone MongoDB instance

### Node.js Setup

```bash
# Install dependencies if package.json exists
npm install

# Or install MongoDB driver manually
npm install mongodb
```

## Common Issues

1. **Transaction errors** - Transactions require replica set:

   ```bash
   # Check if running as replica set
   mongosh --eval "rs.status()"
   ```

2. **Sharding errors** - Requires sharded cluster:

   ```bash
   # Check sharding status
   mongosh --eval "sh.status()"
   ```

3. **Connection errors** - Update connection string in the files to match your MongoDB setup

4. **Module not found** - Install required dependencies:

   ```bash
   npm install mongodb
   ```

## Notes

- These are advanced labs that require specific MongoDB configurations
- Make sure to read the README.md in each subdirectory for specific requirements
- Some operations (like transactions and sharding) won't work on standalone MongoDB instances
