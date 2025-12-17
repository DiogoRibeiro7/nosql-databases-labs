#!/bin/bash

# Lab 01 - MongoDB Setup Script (Using mongosh)
# This script sets up the database and imports initial data

set -euo pipefail

echo "==================================="
echo "Lab 01 - MongoDB Database Setup"
echo "==================================="
echo ""

# Configuration
DB_NAME="lab01_student"
COLLECTION_NAME="customers"
DATA_FILE="sample.json"

# Check if mongosh is available
if ! command -v mongosh >/dev/null 2>&1; then
    echo "Error: mongosh is not installed or not in PATH"
    echo "Please install MongoDB Shell (mongosh) from: https://www.mongodb.com/try/download/shell"
    exit 1
fi

# Check if mongoimport is available
if ! command -v mongoimport >/dev/null 2>&1; then
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
if ! mongosh --quiet --eval "db.version()" >/dev/null 2>&1; then
    echo "Error: Cannot connect to MongoDB. Please ensure MongoDB is running."
    echo ""
    echo "Start MongoDB with:"
    echo "  sudo systemctl start mongod    # Linux"
    echo "  brew services start mongodb-community    # macOS"
    exit 1
fi

echo "[OK] Successfully connected to MongoDB"
echo ""

echo "Step 2: Creating database and importing data..."
echo "---------------------------------------"

# Always drop the collection so rerunning the script remains idempotent.
mongoimport --drop --db "$DB_NAME" --collection "$COLLECTION_NAME" --file "$DATA_FILE" --jsonArray

echo ""
echo "Step 3: Verifying import..."
echo "---------------------------------------"

# Verify the import using mongosh to give the student a quick sanity check.
COUNT=$(mongosh "$DB_NAME" --quiet --eval "db.$COLLECTION_NAME.countDocuments()")
echo "[OK] Successfully imported $COUNT documents into $DB_NAME.$COLLECTION_NAME"

echo ""
echo "Step 4: Creating indexes..."
echo "---------------------------------------"

# Create indexes using mongosh
mongosh "$DB_NAME" --quiet --eval "
    db.$COLLECTION_NAME.createIndex({ city: 1 });
    print('[OK] Created index on city');
"
mongosh "$DB_NAME" --quiet --eval "
    db.$COLLECTION_NAME.createIndex({ country: 1 });
    print('[OK] Created index on country');
"
mongosh "$DB_NAME" --quiet --eval "
    db.$COLLECTION_NAME.createIndex({ age: 1, balance: -1 });
    print('[OK] Created compound index on age and balance');
"
mongosh "$DB_NAME" --quiet --eval "
    db.$COLLECTION_NAME.createIndex({ email: 1 }, { unique: true });
    print('[OK] Created unique index on email');
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
echo "  mongosh $DB_NAME --file queries.js"
echo ""
echo "Or interactively:"
echo "  mongosh"
echo "  use $DB_NAME"
echo "  load('queries.js')"
