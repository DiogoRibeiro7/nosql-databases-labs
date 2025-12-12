# Sakila Database - MongoDB Import Guide

This directory contains the Sakila sample database exported in JSON format, ready to be imported into MongoDB.

## Overview

The Sakila database is a sample database that models a DVD rental store. It contains tables for films, actors, customers, rentals, payments, and more. The JSON files in the `output/` directory have been converted from the original MySQL database.

## Prerequisites

- MongoDB installed and running (version 4.0 or higher recommended)
- MongoDB Database Tools installed (includes `mongoimport`)
- Access to MongoDB instance (local or remote)

## JSON Files Available

The following collections are available for import:

- `actor.json` - Information about film actors
- `address.json` - Address information for customers and staff
- `category.json` - Film categories
- `city.json` - City information
- `country.json` - Country information
- `customer.json` - Customer details
- `film.json` - Film/movie information
- `film_actor.json` - Many-to-many relationship between films and actors
- `film_category.json` - Many-to-many relationship between films and categories
- `inventory.json` - Store inventory
- `language.json` - Language information
- `payment.json` - Payment transactions
- `rental.json` - Rental transactions
- `staff.json` - Staff/employee information
- `store.json` - Store locations

## Import Instructions

### 1. Single Collection Import

To import a single JSON file into MongoDB:

```bash
mongoimport --db sakila --collection <collection_name> --file output/<filename>.json --jsonArray
```

Example:
```bash
mongoimport --db sakila --collection films --file output/film.json --jsonArray
```

### 2. Import All Collections (Windows)

Create a batch script or run these commands sequentially:

```bash
# Create the database (MongoDB will create it automatically on first import)

# Import all collections
mongoimport --db sakila --collection actor --file output/actor.json --jsonArray
mongoimport --db sakila --collection address --file output/address.json --jsonArray
mongoimport --db sakila --collection category --file output/category.json --jsonArray
mongoimport --db sakila --collection city --file output/city.json --jsonArray
mongoimport --db sakila --collection country --file output/country.json --jsonArray
mongoimport --db sakila --collection customer --file output/customer.json --jsonArray
mongoimport --db sakila --collection film --file output/film.json --jsonArray
mongoimport --db sakila --collection film_actor --file output/film_actor.json --jsonArray
mongoimport --db sakila --collection film_category --file output/film_category.json --jsonArray
mongoimport --db sakila --collection inventory --file output/inventory.json --jsonArray
mongoimport --db sakila --collection language --file output/language.json --jsonArray
mongoimport --db sakila --collection payment --file output/payment.json --jsonArray
mongoimport --db sakila --collection rental --file output/rental.json --jsonArray
mongoimport --db sakila --collection staff --file output/staff.json --jsonArray
mongoimport --db sakila --collection store --file output/store.json --jsonArray
```

### 3. Import All Collections (Linux/Mac)

Create a shell script `import_sakila.sh`:

```bash
#!/bin/bash

DB_NAME="sakila"
OUTPUT_DIR="output"

# Array of collection names
collections=(
    "actor"
    "address"
    "category"
    "city"
    "country"
    "customer"
    "film"
    "film_actor"
    "film_category"
    "inventory"
    "language"
    "payment"
    "rental"
    "staff"
    "store"
)

# Import each collection
for collection in "${collections[@]}"; do
    echo "Importing $collection..."
    mongoimport --db $DB_NAME --collection $collection --file $OUTPUT_DIR/$collection.json --jsonArray
done

echo "Import complete!"
```

Make the script executable and run it:
```bash
chmod +x import_sakila.sh
./import_sakila.sh
```

### 4. Using MongoDB Compass

If you prefer a GUI approach:

1. Open MongoDB Compass
2. Connect to your MongoDB instance
3. Create a new database named `sakila`
4. For each collection:
   - Click "Create Collection"
   - Name it appropriately
   - Click on the collection
   - Click "Add Data" → "Import File"
   - Select the corresponding JSON file from the `output/` directory
   - Choose "JSON" as the file type
   - Click "Import"

## Connection Options

### Remote MongoDB Instance

If connecting to a remote MongoDB instance, add connection parameters:

```bash
mongoimport --host <hostname>:<port> --username <username> --password <password> --db sakila --collection <collection_name> --file output/<filename>.json --jsonArray
```

### MongoDB Atlas (Cloud)

For MongoDB Atlas, use the connection string:

```bash
mongoimport --uri "mongodb+srv://<username>:<password>@<cluster-url>/<database>" --collection <collection_name> --file output/<filename>.json --jsonArray
```

## Verify Import

After importing, verify the data in MongoDB:

```javascript
// Connect to MongoDB
mongosh

// Switch to sakila database
use sakila

// Check collections
show collections

// Count documents in each collection
db.actor.countDocuments()
db.film.countDocuments()
db.customer.countDocuments()
db.rental.countDocuments()
db.payment.countDocuments()

// Sample query
db.film.findOne()
```

## Data Schema Notes

- The original relational database foreign keys are preserved as ID references in the JSON
- Dates are stored as ISO 8601 strings
- Some collections (like `film_actor`, `film_category`) represent many-to-many relationships from the original relational model

## Creating Indexes

For better query performance, consider creating indexes after import:

```javascript
// In MongoDB shell
use sakila

// Examples of useful indexes
db.customer.createIndex({ "customer_id": 1 })
db.film.createIndex({ "title": 1 })
db.rental.createIndex({ "customer_id": 1 })
db.rental.createIndex({ "rental_date": 1 })
db.payment.createIndex({ "customer_id": 1 })
db.payment.createIndex({ "payment_date": 1 })
```

## Troubleshooting

### Common Issues

1. **"mongoimport: command not found"**
   - Ensure MongoDB Database Tools are installed
   - Add MongoDB bin directory to your PATH

2. **Connection refused**
   - Verify MongoDB is running: `mongosh --version`
   - Check if MongoDB service is started

3. **Large file import fails**
   - For large files (like payment.json or rental.json), you might need to increase the batch size:
   ```bash
   mongoimport --db sakila --collection payment --file output/payment.json --jsonArray --batchSize 100
   ```

4. **Authentication failed**
   - Ensure correct username/password
   - Check if user has write permissions to the database

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [mongoimport Documentation](https://docs.mongodb.com/database-tools/mongoimport/)
- [Original Sakila Database](https://dev.mysql.com/doc/sakila/en/)

## License

The Sakila sample database is licensed under the New BSD license by Oracle Corporation.
