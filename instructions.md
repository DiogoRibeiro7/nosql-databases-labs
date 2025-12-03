# MongoDB Data Import Instructions

This guide explains how to import JSON and BSON files from the `data` folder into MongoDB using various methods.

## Prerequisites

- MongoDB installed and running (locally or remotely)
- MongoDB Database Tools installed (includes `mongoimport` and `mongorestore`)
- Access to MongoDB connection string or local instance

## Available Data Files

The `data` folder contains various datasets in JSON and BSON formats:

### JSON Files
- **datasets/** - General purpose datasets (books, companies, products, etc.)
- **sample_airbnb/** - Airbnb listings and reviews
- **sample_analytics/** - Financial analytics data
- **sample_geospatial/** - Geographic data with shipwrecks
- **sample_mflix/** - Movie database with comments and theaters
- **sample_supplies/** - Sales data
- **sample_training/** - Training datasets for learning MongoDB
- **sample_weatherdata/** - Weather data samples

### BSON Files
- **ColoradoScooters/** - Scooter rental data with zipcodes

## Method 1: Import JSON Files using mongoimport

The `mongoimport` tool is the standard way to import JSON files into MongoDB.

### Basic Syntax
```bash
mongoimport --db <database_name> --collection <collection_name> --file <path_to_json_file> --jsonArray
```

### Examples

#### Import a single JSON file
```bash
# Import books.json into the 'bookstore' database, 'books' collection
mongoimport --db bookstore --collection books --file data/datasets/books.json --jsonArray

# Import companies.json
mongoimport --db business --collection companies --file data/datasets/companies.json --jsonArray

# Import restaurant data
mongoimport --db food --collection restaurants --file data/datasets/restaurant.json --jsonArray
```

#### Import with authentication (if MongoDB requires auth)
```bash
mongoimport --host localhost:27017 \
  --username myuser \
  --password mypassword \
  --authenticationDatabase admin \
  --db mydb \
  --collection mycollection \
  --file data/datasets/products.json \
  --jsonArray
```

#### Import to MongoDB Atlas (cloud)
```bash
mongoimport --uri "mongodb+srv://username:password@cluster.mongodb.net/database" \
  --collection movies \
  --file data/sample_mflix/movies.json \
  --jsonArray
```

### Common Options
- `--drop`: Drop the collection before importing
- `--jsonArray`: Treat input as a JSON array
- `--type json`: Specify file type (default is JSON)
- `--headerline`: Use first line as field names (for CSV)

## Method 2: Import BSON Files using mongorestore

BSON files are MongoDB's binary format and require `mongorestore`.

### Basic Syntax
```bash
mongorestore --db <database_name> --collection <collection_name> <path_to_bson_file>
```

### Examples

#### Import BSON files from ColoradoScooters
```bash
# Import scooters collection
mongorestore --db colorado --collection scooters data/ColoradoScooters/scooters.bson

# Import zipcodes collection
mongorestore --db colorado --collection zipcodes data/ColoradoScooters/zipcodes.bson
```

#### Restore entire directory
```bash
# This will restore all BSON files in the directory
mongorestore --db colorado data/ColoradoScooters/
```

## Method 3: Using MongoDB Shell (mongosh)

You can also load data directly from the MongoDB shell.

### Load JSON file in mongosh
```javascript
// Connect to MongoDB
mongosh

// Switch to your database
use myDatabase

// Load and insert JSON data
const data = JSON.parse(fs.readFileSync('data/datasets/books.json', 'utf8'))
db.books.insertMany(data)
```

### Using a script file
```javascript
// Create a script file (e.g., import_script.js)
db = db.getSiblingDB('myDatabase');
const books = JSON.parse(cat('data/datasets/books.json'));
db.books.insertMany(books);
print('Imported ' + books.length + ' books');
```

Run the script:
```bash
mongosh --file import_script.js
```

## Method 4: Using MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect to your MongoDB instance
3. Select or create a database
4. Select or create a collection
5. Click "Add Data" → "Import File"
6. Browse and select your JSON file
7. Configure import options
8. Click "Import"

## Method 5: Programmatic Import (Node.js Example)

```javascript
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function importData() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('myDatabase');
    const collection = database.collection('myCollection');

    const filePath = path.join(__dirname, 'data', 'datasets', 'books.json');
    const raw = fs.readFileSync(filePath, 'utf8');

    const docs = raw
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const doc = JSON.parse(line);

        // convert { "$date": "..." } → Date
        if (
          doc.publishedDate &&
          typeof doc.publishedDate === 'object' &&
          typeof doc.publishedDate.$date === 'string'
        ) {
          doc.publishedDate = new Date(doc.publishedDate.$date);
        }

        return doc;
      });

    const result = await collection.insertMany(docs);
    console.log(`${result.insertedCount} documents inserted`);
  } finally {
    await client.close();
  }
}

importData().catch(console.error);
```

## Batch Import Script

For importing multiple files at once, create a batch script:

### Windows (batch_import.bat)
```batch
@echo off
echo Importing all datasets...

mongoimport --db training --collection books --file data/datasets/books.json --jsonArray --drop
mongoimport --db training --collection companies --file data/datasets/companies.json --jsonArray --drop
mongoimport --db training --collection products --file data/datasets/products.json --jsonArray --drop
mongoimport --db training --collection students --file data/datasets/students.json --jsonArray --drop

echo Import complete!
```

### Linux/Mac (batch_import.sh)
```bash
#!/bin/bash
echo "Importing all datasets..."

mongoimport --db training --collection books --file data/datasets/books.json --jsonArray --drop
mongoimport --db training --collection companies --file data/datasets/companies.json --jsonArray --drop
mongoimport --db training --collection products --file data/datasets/products.json --jsonArray --drop
mongoimport --db training --collection students --file data/datasets/students.json --jsonArray --drop

echo "Import complete!"
```

## Verification

After importing, verify your data:

```bash
# Connect to MongoDB
mongosh

# Check databases
show dbs

# Switch to your database
use myDatabase

# Check collections
show collections

# Count documents
db.myCollection.countDocuments()

# View sample documents
db.myCollection.find().limit(5).pretty()
```

## Troubleshooting

### Common Issues and Solutions

1. **"mongoimport: command not found"**
   - Install MongoDB Database Tools: https://www.mongodb.com/try/download/database-tools

2. **Connection refused**
   - Ensure MongoDB is running: `mongod` or `net start MongoDB` (Windows)

3. **Authentication failed**
   - Check username/password
   - Verify authentication database (usually 'admin')

4. **Invalid JSON**
   - Ensure file is valid JSON: Use a JSON validator
   - Check for `--jsonArray` flag if file contains array

5. **Large files timeout**
   - Use `--batchSize` option to process in smaller chunks
   - Example: `mongoimport --batchSize 100 --file large_file.json`

## Best Practices

1. **Always backup before dropping collections**
   ```bash
   mongodump --db myDatabase --out backup/
   ```

2. **Validate data after import**
   - Check document count
   - Verify data integrity
   - Test queries

3. **Use indexes after import**
   ```javascript
   db.collection.createIndex({ field: 1 })
   ```

4. **Consider data types**
   - Dates should be in ISO format
   - Numbers should not be quoted
   - ObjectIds need special handling

5. **For production imports**
   - Test in development first
   - Use transactions for critical data
   - Monitor performance during import

## Quick Reference

| File Type | Tool | Basic Command |
|-----------|------|---------------|
| JSON | mongoimport | `mongoimport --db dbname --collection collname --file data.json --jsonArray` |
| BSON | mongorestore | `mongorestore --db dbname --collection collname data.bson` |
| CSV | mongoimport | `mongoimport --db dbname --collection collname --type csv --headerline --file data.csv` |

## Additional Resources

- [MongoDB Documentation - mongoimport](https://docs.mongodb.com/database-tools/mongoimport/)
- [MongoDB Documentation - mongorestore](https://docs.mongodb.com/database-tools/mongorestore/)
- [MongoDB Shell (mongosh) Documentation](https://docs.mongodb.com/mongodb-shell/)
- [MongoDB Compass Documentation](https://docs.mongodb.com/compass/)
