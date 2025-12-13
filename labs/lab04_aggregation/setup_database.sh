#!/bin/bash

# Lab 04 - Aggregation Framework Setup Script
# This script sets up the database and collections for the aggregation lab

echo "========================================="
echo "Lab 04: Aggregation Framework Setup"
echo "========================================="

# Configuration
DB_NAME="lab04_analytics"
MONGO_PORT="27017"
DATA_DIR="./starter/data"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if MongoDB is running
check_mongodb() {
    echo "Checking MongoDB connection..."
    mongosh --port $MONGO_PORT --eval "db.version()" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ MongoDB is running on port $MONGO_PORT${NC}"
        return 0
    else
        echo -e "${RED}✗ MongoDB is not running on port $MONGO_PORT${NC}"
        echo "Please start MongoDB and try again"
        exit 1
    fi
}

# Function to import data
import_collection() {
    local collection=$1
    local file=$2

    echo "Importing $collection..."

    if [ ! -f "$file" ]; then
        echo -e "${RED}✗ File not found: $file${NC}"
        return 1
    fi

    mongoimport --db $DB_NAME \
                --collection $collection \
                --file "$file" \
                --jsonArray \
                --drop \
                2>/dev/null

    if [ $? -eq 0 ]; then
        count=$(mongosh --quiet --port $MONGO_PORT --eval "use $DB_NAME; db.$collection.countDocuments()")
        echo -e "${GREEN}✓ Imported $count documents into $collection${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to import $collection${NC}"
        return 1
    fi
}

# Function to create indexes
create_indexes() {
    echo "Creating indexes..."

    mongosh --port $MONGO_PORT --eval "
        use $DB_NAME;

        // Sales indexes
        db.sales.createIndex({ date: 1 });
        db.sales.createIndex({ customer_id: 1 });
        db.sales.createIndex({ product_id: 1 });
        db.sales.createIndex({ date: 1, customer_id: 1 });

        // Products indexes
        db.products.createIndex({ category: 1 });
        db.products.createIndex({ price: 1 });
        db.products.createIndex({ product_id: 1 });

        // Customers indexes
        db.customers.createIndex({ segment: 1 });
        db.customers.createIndex({ country: 1 });
        db.customers.createIndex({ customer_id: 1 });

        print('Indexes created successfully');
    " > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Indexes created successfully${NC}"
    else
        echo -e "${RED}✗ Failed to create indexes${NC}"
    fi
}

# Function to verify setup
verify_setup() {
    echo -e "\nVerifying setup..."

    mongosh --port $MONGO_PORT --eval "
        use $DB_NAME;

        const sales_count = db.sales.countDocuments();
        const products_count = db.products.countDocuments();
        const customers_count = db.customers.countDocuments();

        print('Database: ' + db.getName());
        print('Collections:');
        print('  - sales: ' + sales_count + ' documents');
        print('  - products: ' + products_count + ' documents');
        print('  - customers: ' + customers_count + ' documents');

        if (sales_count === 200 && products_count === 30 && customers_count === 50) {
            print('✓ All collections have the expected document count');
        } else {
            print('⚠ Warning: Document counts do not match expected values');
        }
    "
}

# Function to create sample aggregation views
create_views() {
    echo "Creating aggregation views..."

    mongosh --port $MONGO_PORT --eval "
        use $DB_NAME;

        // Drop existing views
        db.monthly_revenue.drop();
        db.top_customers.drop();
        db.product_performance.drop();

        // Monthly revenue view
        db.createView(
            'monthly_revenue',
            'sales',
            [
                {
                    \$group: {
                        _id: {
                            year: { \$year: '\$date' },
                            month: { \$month: '\$date' }
                        },
                        revenue: { \$sum: '\$amount' },
                        orders: { \$count: {} }
                    }
                },
                { \$sort: { '_id.year': 1, '_id.month': 1 } }
            ]
        );

        // Top customers view
        db.createView(
            'top_customers',
            'sales',
            [
                {
                    \$group: {
                        _id: '\$customer_id',
                        total_spent: { \$sum: '\$amount' },
                        order_count: { \$count: {} }
                    }
                },
                { \$sort: { total_spent: -1 } },
                { \$limit: 10 }
            ]
        );

        // Product performance view
        db.createView(
            'product_performance',
            'sales',
            [
                {
                    \$group: {
                        _id: '\$product_id',
                        revenue: { \$sum: '\$amount' },
                        units_sold: { \$sum: '\$quantity' }
                    }
                },
                { \$sort: { revenue: -1 } }
            ]
        );

        print('Views created successfully');
    " > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Views created successfully${NC}"
    else
        echo -e "${RED}✗ Failed to create views${NC}"
    fi
}

# Main execution
main() {
    echo "Starting setup..."
    echo ""

    # Check MongoDB
    check_mongodb

    # Drop existing database
    echo -e "\nDropping existing database..."
    mongosh --port $MONGO_PORT --eval "use $DB_NAME; db.dropDatabase();" > /dev/null 2>&1
    echo -e "${GREEN}✓ Database cleaned${NC}"

    # Import collections
    echo -e "\nImporting data..."
    import_collection "sales" "$DATA_DIR/sales.json"
    import_collection "products" "$DATA_DIR/products.json"
    import_collection "customers" "$DATA_DIR/customers.json"

    # Create indexes
    echo ""
    create_indexes

    # Create views
    echo ""
    create_views

    # Verify setup
    verify_setup

    echo -e "\n========================================="
    echo -e "${GREEN}Setup completed successfully!${NC}"
    echo "Database: $DB_NAME"
    echo "You can now run the aggregation exercises"
    echo ""
    echo "To connect:"
    echo "  mongosh --eval \"use $DB_NAME\""
    echo ""
    echo "To test aggregations:"
    echo "  node aggregation_basics.js"
    echo "  node aggregation_advanced.js"
    echo "========================================="
}

# Run main function
main