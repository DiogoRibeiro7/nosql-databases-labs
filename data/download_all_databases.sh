#!/bin/bash

# ============================================================================
# Quick Database Downloads for NoSQL Course
# Author: Diogo Ribeiro - ESMAD/IPP
# ============================================================================

echo "================================================"
echo "Sample Database Quick Downloads for NoSQL Course"
echo "================================================"

# Create directory structure
mkdir -p sample_databases/{sakila,northwind,chinook,imdb,airbnb,nyc_taxi,stackoverflow}

# ----------------------------------------------------------------------------
# 1. SAKILA (already done, but included for completeness)
# ----------------------------------------------------------------------------
echo -e "\n[1/8] Sakila Database"
echo "Previously downloaded - see sakila_json_to_mongodb.py"

# ----------------------------------------------------------------------------
# 2. NORTHWIND - E-commerce
# ----------------------------------------------------------------------------
echo -e "\n[2/8] Downloading Northwind..."
cd sample_databases/northwind

# Download all CSV files
wget -q https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/categories.csv
wget -q https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/customers.csv  
wget -q https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/employees.csv
wget -q https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/orders.csv
wget -q https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/order_details.csv
wget -q https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/products.csv
wget -q https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/regions.csv
wget -q https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/shippers.csv
wget -q https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/suppliers.csv
wget -q https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/territories.csv

echo "✓ Northwind CSV files downloaded"
cd ../..

# ----------------------------------------------------------------------------
# 3. CHINOOK - Music Store
# ----------------------------------------------------------------------------
echo -e "\n[3/8] Downloading Chinook..."
cd sample_databases/chinook

# Download SQLite database
wget -q https://github.com/lerocha/chinook-database/raw/master/ChinookDatabase/DataSources/Chinook_Sqlite.sqlite

# Download SQL scripts as alternative
wget -q https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_MySql.sql
wget -q https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_PostgreSql.sql

echo "✓ Chinook database downloaded"
cd ../..

# ----------------------------------------------------------------------------
# 4. IMDB - Movies Dataset
# ----------------------------------------------------------------------------
echo -e "\n[4/8] Downloading IMDb datasets..."
cd sample_databases/imdb

# Download compressed TSV files (these are large!)
echo "Downloading title.basics (movies)..."
wget -q https://datasets.imdbws.com/title.basics.tsv.gz
echo "Downloading title.ratings..."
wget -q https://datasets.imdbws.com/title.ratings.tsv.gz
echo "Downloading name.basics (people)..."
wget -q https://datasets.imdbws.com/name.basics.tsv.gz
echo "Downloading title.principals (cast/crew)..."
wget -q https://datasets.imdbws.com/title.principals.tsv.gz

# Extract samples (first 10000 rows)
echo "Extracting samples..."
gunzip -c title.basics.tsv.gz | head -10000 > title.basics.sample.tsv
gunzip -c title.ratings.tsv.gz | head -10000 > title.ratings.sample.tsv

echo "✓ IMDb samples ready"
cd ../..

# ----------------------------------------------------------------------------
# 5. AIRBNB - Porto & Lisbon Listings
# ----------------------------------------------------------------------------
echo -e "\n[5/8] Downloading Airbnb data..."
cd sample_databases/airbnb

# Porto listings
echo "Downloading Porto listings..."
wget -q http://data.insideairbnb.com/portugal/norte/porto/2024-09-25/data/listings.csv.gz -O porto_listings.csv.gz
wget -q http://data.insideairbnb.com/portugal/norte/porto/2024-09-25/data/reviews.csv.gz -O porto_reviews.csv.gz

# Lisbon listings
echo "Downloading Lisbon listings..."
wget -q http://data.insideairbnb.com/portugal/lisbon/lisbon/2024-09-17/data/listings.csv.gz -O lisbon_listings.csv.gz

# Extract
gunzip *.gz

echo "✓ Airbnb data ready"
cd ../..

# ----------------------------------------------------------------------------
# 6. NYC TAXI - January 2024 Sample
# ----------------------------------------------------------------------------
echo -e "\n[6/8] Downloading NYC Taxi data (January 2024)..."
cd sample_databases/nyc_taxi

# Download Parquet file (more efficient than CSV)
wget -q https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2024-01.parquet
wget -q https://d37ci6vzurychx.cloudfront.net/trip-data/green_tripdata_2024-01.parquet

echo "✓ NYC Taxi data downloaded (Parquet format)"
cd ../..

# ----------------------------------------------------------------------------
# 7. STACK OVERFLOW - Sample Dataset
# ----------------------------------------------------------------------------
echo -e "\n[7/8] Stack Overflow sample..."
echo "Full dataset is 50GB+. For sample data, use:"
echo "https://www.brentozar.com/archive/2021/03/download-the-current-stack-overflow-database-for-free-2021-02/"
echo "Or smaller sample: https://github.com/dgrtwo/StackLite"

cd sample_databases/stackoverflow
# Download StackLite sample (SQLite, ~700MB)
wget -q https://github.com/dgrtwo/StackLite/releases/download/v1.0/stacklite.db.zip
unzip -q stacklite.db.zip

echo "✓ StackOverflow sample downloaded"
cd ../..

# ----------------------------------------------------------------------------
# 8. ADVENTUREWORKS - Microsoft's Enterprise Sample
# ----------------------------------------------------------------------------
echo -e "\n[8/8] AdventureWorks..."
echo "Download from: https://github.com/Microsoft/sql-server-samples/releases/download/adventureworks/AdventureWorks2019.bak"
echo "Or lightweight version: https://github.com/Microsoft/sql-server-samples/tree/master/samples/databases/adventure-works"

# ----------------------------------------------------------------------------
# Convert to JSON (requires Python with pandas)
# ----------------------------------------------------------------------------
echo -e "\n================================================"
echo "Converting to JSON format for MongoDB..."
echo "================================================"

# Python conversion script
cat > convert_to_json.py << 'EOF'
import pandas as pd
import sqlite3
import json
from pathlib import Path

def sqlite_to_json(db_path, output_dir):
    """Convert SQLite database tables to JSON."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    for table in tables:
        table_name = table[0]
        df = pd.read_sql_query(f"SELECT * FROM {table_name}", conn)
        
        # Save as JSON
        json_path = output_dir / f"{table_name}.json"
        df.to_json(json_path, orient='records', indent=2)
        print(f"  ✓ {table_name}: {len(df)} records")
    
    conn.close()

def csv_to_json(csv_dir, output_dir):
    """Convert CSV files to JSON."""
    csv_files = Path(csv_dir).glob("*.csv")
    
    for csv_file in csv_files:
        df = pd.read_csv(csv_file)
        
        json_path = output_dir / f"{csv_file.stem}.json"
        df.to_json(json_path, orient='records', indent=2)
        print(f"  ✓ {csv_file.stem}: {len(df)} records")

# Convert Chinook
print("\nConverting Chinook SQLite to JSON...")
sqlite_to_json("sample_databases/chinook/Chinook_Sqlite.sqlite", 
               Path("sample_databases/chinook/json"))

# Convert Northwind CSVs
print("\nConverting Northwind CSV to JSON...")
csv_to_json("sample_databases/northwind", 
            Path("sample_databases/northwind/json"))

# Convert Airbnb CSVs
print("\nConverting Airbnb CSV to JSON...")
csv_to_json("sample_databases/airbnb",
            Path("sample_databases/airbnb/json"))

print("\n✓ All conversions complete!")
EOF

python3 convert_to_json.py

# ----------------------------------------------------------------------------
# MongoDB Import Commands
# ----------------------------------------------------------------------------
echo -e "\n================================================"
echo "MongoDB Import Commands"
echo "================================================"

cat > mongodb_import.sh << 'EOF'
#!/bin/bash

# Set database name
DB="nosql_course"

# Northwind
mongoimport --db $DB --collection categories --file sample_databases/northwind/json/categories.json --jsonArray
mongoimport --db $DB --collection customers --file sample_databases/northwind/json/customers.json --jsonArray
mongoimport --db $DB --collection products --file sample_databases/northwind/json/products.json --jsonArray
mongoimport --db $DB --collection orders --file sample_databases/northwind/json/orders.json --jsonArray

# Chinook
mongoimport --db $DB --collection artists --file sample_databases/chinook/json/Artist.json --jsonArray
mongoimport --db $DB --collection albums --file sample_databases/chinook/json/Album.json --jsonArray
mongoimport --db $DB --collection tracks --file sample_databases/chinook/json/Track.json --jsonArray

# Airbnb
mongoimport --db $DB --collection porto_listings --file sample_databases/airbnb/json/porto_listings.json --jsonArray
mongoimport --db $DB --collection lisbon_listings --file sample_databases/airbnb/json/lisbon_listings.json --jsonArray

echo "✓ All collections imported to MongoDB"
EOF

chmod +x mongodb_import.sh

echo -e "\n================================================"
echo "✓ Setup Complete!"
echo "================================================"
echo ""
echo "Downloaded databases in: ./sample_databases/"
echo ""
echo "To import to MongoDB, run:"
echo "  ./mongodb_import.sh"
echo ""
echo "To start exploring:"
echo "  mongosh nosql_course"
echo "  > db.customers.findOne()"
echo "  > db.listings.find({price: {\$lt: 50}}).limit(5)"
echo ""
echo "For transformation examples, see:"
echo "  mongodb_modeling_patterns_guide.md"
echo "================================================"
