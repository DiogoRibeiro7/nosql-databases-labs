#!/bin/bash

# Lab 02 - Database Setup Script (Unix/Linux/Mac)
#
# This script sets up the MongoDB database for Lab 02 - Data Modeling.
# It imports sample data and creates necessary indexes.

echo "============================================================"
echo "Lab 02 - E-Commerce Data Model Setup"
echo "============================================================"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo "Checking MongoDB connection..."
if ! mongosh --quiet --eval "db.version()" > /dev/null 2>&1; then
    echo -e "${RED}Error: MongoDB is not running or not accessible${NC}"
    echo "Please start MongoDB and try again."
    echo
    echo "To start MongoDB:"
    echo "  - On macOS with Homebrew: brew services start mongodb-community"
    echo "  - On Ubuntu/Debian: sudo systemctl start mongod"
    echo "  - On Windows: net start MongoDB (in Administrator command prompt)"
    exit 1
fi
echo -e "${GREEN}✓ MongoDB is running${NC}"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js is installed${NC}"
echo

# Check if required npm packages are installed
echo "Checking npm dependencies..."
if [ ! -d "../../node_modules/mongodb" ]; then
    echo -e "${YELLOW}Installing MongoDB driver...${NC}"
    cd ../.. && npm install mongodb && cd labs/lab02_modeling
fi
echo -e "${GREEN}✓ Dependencies ready${NC}"
echo

# Ask user if they want to reset existing data
echo -e "${YELLOW}Warning: This will reset the lab02_ecommerce database if it exists.${NC}"
read -p "Do you want to continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi
echo

# Run the import script
echo "Starting database import..."
echo "------------------------------------------------------------"
node import_data.js
IMPORT_EXIT_CODE=$?

if [ $IMPORT_EXIT_CODE -ne 0 ]; then
    echo
    echo -e "${RED}Error: Database import failed${NC}"
    echo "Please check the error messages above and try again."
    exit 1
fi

echo
echo "------------------------------------------------------------"
echo -e "${GREEN}✓ Database setup completed successfully!${NC}"
echo

# Run verification
echo "Running verification tests..."
echo "------------------------------------------------------------"
node test_queries.js
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo
    echo -e "${YELLOW}Warning: Some tests failed${NC}"
    echo "The database is set up, but there may be issues with the data model."
    echo "Please review the test results above."
else
    echo
    echo -e "${GREEN}✓ All tests passed!${NC}"
fi

echo
echo "============================================================"
echo "Setup Complete!"
echo "============================================================"
echo
echo "The lab02_ecommerce database is now ready with:"
echo "  - customers collection (with sample customers)"
echo "  - products collection (with sample products)"
echo "  - orders collection (with sample orders)"
echo "  - reviews collection (with sample reviews)"
echo "  - All required indexes created"
echo
echo "You can now:"
echo "  1. Run queries: node queries.js"
echo "  2. Test the model: node test_queries.js"
echo "  3. Connect with mongosh: mongosh lab02_ecommerce"
echo "  4. Reset database: node reset_database.js"
echo
echo "Happy coding!"