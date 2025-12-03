#!/bin/bash

# Lab 01 - MongoDB Setup Script (Using mongosh)
# This script sets up the database and imports initial data

echo "==================================="
echo "Lab 01 - MongoDB Database Setup"
echo "==================================="
echo ""

# Configuration
DB_NAME="lab01_student"
COLLECTION_NAME="customers"
DATA_FILE="sample.json"

# Check if mongosh is available
if ! command -v mongosh &> /dev/null; then
    echo "Error: mongosh is not installed or not in PATH"
    echo "Please install MongoDB Shell (mongosh) from: https://www.mongodb.com/try/download/shell"
    exit 1
fi

# Check if mongoimport is available
if ! command -v mongoimport &> /dev/null; then
    echo "Error: mongoimport is not installed or not in PATH"
    echo "Please install MongoDB Database Tools from: https://www.mongodb.com/try/download/database-tools"
    exit 1
fi

# Check if data file exists
if [ ! -f "$DATA_FILE" ]; then
    echo "Error: Data file $DATA_FILE not found!"
    echo "Please ensure you're running this script from the lab01_intro directory"
    exit 1
fi

echo "Step 1: Checking MongoDB connection..."
echo "---------------------------------------"

# Test connection to MongoDB using mongosh
mongosh --eval "db.version()" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Error: Cannot connect to MongoDB. Please ensure MongoDB is running."
    echo ""
    echo "Start MongoDB with:"
    echo "  sudo systemctl start mongod  # Linux"
    echo "  brew services start mongodb-community  # macOS"
    exit 1
fi

echo "✓ Successfully connected to MongoDB"
echo ""

echo "Step 2: Creating database and importing data..."
echo "---------------------------------------"

# Drop existing collection if it exists (optional - uncomment if needed)
# mongosh $DB_NAME --eval "db.$COLLECTION_NAME.drop()" > /dev/null 2>&1

# Import data using mongoimport
mongoimport --db $DB_NAME --collection $COLLECTION_NAME --file $DATA_FILE --jsonArray

if [ $? -eq 0 ]; then
    echo ""
    echo "Step 3: Verifying import..."
    echo "---------------------------------------"

    # Verify the import using mongosh
    COUNT=$(mongosh $DB_NAME --quiet --eval "db.$COLLECTION_NAME.countDocuments()")
    echo "✓ Successfully imported $COUNT documents into $DB_NAME.$COLLECTION_NAME"

    echo ""
    echo "Step 4: Creating indexes..."
    echo "---------------------------------------"

    # Create indexes using mongosh
    mongosh $DB_NAME --quiet --eval "
        // Create index on city
        db.$COLLECTION_NAME.createIndex({ city: 1 });
        print('✓ Created index on city');

        // Create index on country
        db.$COLLECTION_NAME.createIndex({ country: 1 });
        print('✓ Created index on country');

        // Create compound index on age and balance
        db.$COLLECTION_NAME.createIndex({ age: 1, balance: -1 });
        print('✓ Created compound index on age and balance');

        // Create unique index on email
        db.$COLLECTION_NAME.createIndex({ email: 1 }, { unique: true });
        print('✓ Created unique index on email');
    "

    echo ""
    echo "==================================="
    echo "Setup completed successfully!"
    echo "==================================="
    echo ""
    echo "To connect to the database, run:"
    echo "  mongosh $DB_NAME"
    echo ""
    echo "To run queries from queries.js file:"
    echo "  mongosh $DB_NAME < queries.js"
    echo ""
    echo "Or interactively:"
    echo "  mongosh"
    echo "  use $DB_NAME"
    echo "  load('queries.js')"
else
    echo "Error: Failed to import data"
    exit 1
fi