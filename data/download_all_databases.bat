@echo off
REM ============================================================================
REM Quick Database Downloads for NoSQL Course (Windows Version)
REM Author: Diogo Ribeiro - ESMAD/IPP
REM ============================================================================

echo ================================================
echo Sample Database Quick Downloads for NoSQL Course
echo Windows Batch Version
echo ================================================

REM Create directory structure
echo Creating directory structure...
mkdir sample_databases 2>nul
mkdir sample_databases\sakila 2>nul
mkdir sample_databases\northwind 2>nul
mkdir sample_databases\chinook 2>nul
mkdir sample_databases\imdb 2>nul
mkdir sample_databases\airbnb 2>nul
mkdir sample_databases\nyc_taxi 2>nul
mkdir sample_databases\stackoverflow 2>nul

REM ----------------------------------------------------------------------------
REM 1. SAKILA (already done, but included for completeness)
REM ----------------------------------------------------------------------------
echo.
echo [1/8] Sakila Database
echo Previously downloaded - see sakila_json_to_mongodb.py

REM ----------------------------------------------------------------------------
REM 2. NORTHWIND - E-commerce
REM ----------------------------------------------------------------------------
echo.
echo [2/8] Downloading Northwind...
cd sample_databases\northwind

REM Download all CSV files using curl (available in Windows 10+)
curl -s -O https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/categories.csv
curl -s -O https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/customers.csv
curl -s -O https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/employees.csv
curl -s -O https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/orders.csv
curl -s -O https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/order_details.csv
curl -s -O https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/products.csv
curl -s -O https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/regions.csv
curl -s -O https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/shippers.csv
curl -s -O https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/suppliers.csv
curl -s -O https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/territories.csv

echo Northwind CSV files downloaded
cd ..\..

REM ----------------------------------------------------------------------------
REM 3. CHINOOK - Music Store
REM ----------------------------------------------------------------------------
echo.
echo [3/8] Downloading Chinook...
cd sample_databases\chinook

REM Download SQLite database
curl -s -L -o Chinook_Sqlite.sqlite https://github.com/lerocha/chinook-database/raw/master/ChinookDatabase/DataSources/Chinook_Sqlite.sqlite

REM Download SQL scripts as alternative
curl -s -O https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_MySql.sql
curl -s -O https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_PostgreSql.sql

echo Chinook database downloaded
cd ..\..

REM ----------------------------------------------------------------------------
REM 4. IMDB - Movies Dataset
REM ----------------------------------------------------------------------------
echo.
echo [4/8] Downloading IMDb datasets...
cd sample_databases\imdb

REM Download compressed TSV files (these are large!)
echo Downloading title.basics (movies)...
curl -s -O https://datasets.imdbws.com/title.basics.tsv.gz
echo Downloading title.ratings...
curl -s -O https://datasets.imdbws.com/title.ratings.tsv.gz
echo Downloading name.basics (people)...
curl -s -O https://datasets.imdbws.com/name.basics.tsv.gz
echo Downloading title.principals (cast/crew)...
curl -s -O https://datasets.imdbws.com/title.principals.tsv.gz

echo IMDb files downloaded (use 7-Zip or tar to extract .gz files)
cd ..\..

REM ----------------------------------------------------------------------------
REM 5. AIRBNB - Porto and Lisbon Listings
REM ----------------------------------------------------------------------------
echo.
echo [5/8] Downloading Airbnb data...
cd sample_databases\airbnb

REM Porto listings
echo Downloading Porto listings...
curl -s -o porto_listings.csv.gz http://data.insideairbnb.com/portugal/norte/porto/2024-09-25/data/listings.csv.gz
curl -s -o porto_reviews.csv.gz http://data.insideairbnb.com/portugal/norte/porto/2024-09-25/data/reviews.csv.gz

REM Lisbon listings
echo Downloading Lisbon listings...
curl -s -o lisbon_listings.csv.gz http://data.insideairbnb.com/portugal/lisbon/lisbon/2024-09-17/data/listings.csv.gz

echo Airbnb data downloaded (use 7-Zip or tar to extract .gz files)
cd ..\..

REM ----------------------------------------------------------------------------
REM 6. NYC TAXI - January 2024 Sample
REM ----------------------------------------------------------------------------
echo.
echo [6/8] Downloading NYC Taxi data (January 2024)...
cd sample_databases\nyc_taxi

REM Download Parquet files
curl -s -O https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2024-01.parquet
curl -s -O https://d37ci6vzurychx.cloudfront.net/trip-data/green_tripdata_2024-01.parquet

echo NYC Taxi data downloaded (Parquet format)
cd ..\..

REM ----------------------------------------------------------------------------
REM 7. STACK OVERFLOW - Sample Dataset
REM ----------------------------------------------------------------------------
echo.
echo [7/8] Stack Overflow sample...
echo Full dataset is 50GB+. Downloading smaller sample...

cd sample_databases\stackoverflow

REM Download StackLite sample (SQLite, ~700MB)
echo Downloading StackLite sample (this is large, ~700MB)...
curl -s -L -o stacklite.db.zip https://github.com/dgrtwo/StackLite/releases/download/v1.0/stacklite.db.zip

echo StackOverflow sample downloaded (extract with 7-Zip or Windows Explorer)
cd ..\..

REM ----------------------------------------------------------------------------
REM 8. ADVENTUREWORKS - Microsoft's Enterprise Sample
REM ----------------------------------------------------------------------------
echo.
echo [8/8] AdventureWorks...
echo Download manually from: 
echo https://github.com/Microsoft/sql-server-samples/releases/download/adventureworks/AdventureWorks2019.bak

REM ----------------------------------------------------------------------------
REM Extract compressed files using PowerShell
REM ----------------------------------------------------------------------------
echo.
echo ================================================
echo Extracting compressed files...
echo ================================================

REM PowerShell commands to extract .gz files
powershell -Command "cd sample_databases\imdb; Get-ChildItem *.gz | ForEach-Object { & 'C:\Program Files\7-Zip\7z.exe' e $_.Name -y 2>nul || tar -xzf $_.Name 2>nul }"
powershell -Command "cd sample_databases\airbnb; Get-ChildItem *.gz | ForEach-Object { & 'C:\Program Files\7-Zip\7z.exe' e $_.Name -y 2>nul || tar -xzf $_.Name 2>nul }"
powershell -Command "cd sample_databases\stackoverflow; if (Test-Path stacklite.db.zip) { Expand-Archive -Path stacklite.db.zip -DestinationPath . -Force }"

REM ----------------------------------------------------------------------------
REM Create Python conversion script
REM ----------------------------------------------------------------------------
echo.
echo ================================================
echo Creating Python conversion script...
echo ================================================

(
echo import pandas as pd
echo import sqlite3
echo import json
echo from pathlib import Path
echo.
echo def sqlite_to_json^(db_path, output_dir^):
echo     """Convert SQLite database tables to JSON."""
echo     output_dir = Path^(output_dir^)
echo     output_dir.mkdir^(exist_ok=True^)
echo     conn = sqlite3.connect^(db_path^)
echo     cursor = conn.cursor^(^)
echo.    
echo     # Get all tables
echo     cursor.execute^("SELECT name FROM sqlite_master WHERE type='table';"^)
echo     tables = cursor.fetchall^(^)
echo.    
echo     for table in tables:
echo         table_name = table[0]
echo         df = pd.read_sql_query^(f"SELECT * FROM {table_name}", conn^)
echo.        
echo         # Save as JSON
echo         json_path = output_dir / f"{table_name}.json"
echo         df.to_json^(json_path, orient='records', indent=2^)
echo         print^(f"  ✓ {table_name}: {len^(df^)} records"^)
echo.    
echo     conn.close^(^)
echo.
echo def csv_to_json^(csv_dir, output_dir^):
echo     """Convert CSV files to JSON."""
echo     csv_dir = Path^(csv_dir^)
echo     output_dir = Path^(output_dir^)
echo     output_dir.mkdir^(exist_ok=True^)
echo     csv_files = csv_dir.glob^("*.csv"^)
echo.    
echo     for csv_file in csv_files:
echo         df = pd.read_csv^(csv_file^)
echo.        
echo         json_path = output_dir / f"{csv_file.stem}.json"
echo         df.to_json^(json_path, orient='records', indent=2^)
echo         print^(f"  ✓ {csv_file.stem}: {len^(df^)} records"^)
echo.
echo # Convert Chinook
echo print^("\nConverting Chinook SQLite to JSON..."^)
echo sqlite_to_json^("sample_databases\\chinook\\Chinook_Sqlite.sqlite", 
echo                "sample_databases\\chinook\\json"^)
echo.
echo # Convert Northwind CSVs
echo print^("\nConverting Northwind CSV to JSON..."^)
echo csv_to_json^("sample_databases\\northwind", 
echo             "sample_databases\\northwind\\json"^)
echo.
echo # Convert Airbnb CSVs
echo print^("\nConverting Airbnb CSV to JSON..."^)
echo csv_to_json^("sample_databases\\airbnb",
echo             "sample_databases\\airbnb\\json"^)
echo.
echo print^("\n✓ All conversions complete!"^)
) > convert_to_json.py

echo.
echo Running Python conversion script...
python convert_to_json.py

REM ----------------------------------------------------------------------------
REM Create MongoDB import script
REM ----------------------------------------------------------------------------
echo.
echo ================================================
echo Creating MongoDB import script...
echo ================================================

(
echo @echo off
echo REM MongoDB Import Commands for Windows
echo.
echo REM Set database name
echo set DB=nosql_course
echo.
echo REM Northwind
echo mongoimport --db %%DB%% --collection categories --file sample_databases\northwind\json\categories.json --jsonArray
echo mongoimport --db %%DB%% --collection customers --file sample_databases\northwind\json\customers.json --jsonArray
echo mongoimport --db %%DB%% --collection products --file sample_databases\northwind\json\products.json --jsonArray
echo mongoimport --db %%DB%% --collection orders --file sample_databases\northwind\json\orders.json --jsonArray
echo.
echo REM Chinook
echo mongoimport --db %%DB%% --collection artists --file sample_databases\chinook\json\Artist.json --jsonArray
echo mongoimport --db %%DB%% --collection albums --file sample_databases\chinook\json\Album.json --jsonArray
echo mongoimport --db %%DB%% --collection tracks --file sample_databases\chinook\json\Track.json --jsonArray
echo.
echo REM Airbnb
echo mongoimport --db %%DB%% --collection porto_listings --file sample_databases\airbnb\json\porto_listings.json --jsonArray
echo mongoimport --db %%DB%% --collection lisbon_listings --file sample_databases\airbnb\json\lisbon_listings.json --jsonArray
echo.
echo echo All collections imported to MongoDB
) > mongodb_import.bat

echo.
echo ================================================
echo Setup Complete!
echo ================================================
echo.
echo Downloaded databases in: .\sample_databases\
echo.
echo To extract .gz files (if not auto-extracted):
echo   - Use 7-Zip: Right-click the .gz file, select 7-Zip -^> Extract Here
echo   - Or use tar: tar -xzf filename.gz
echo.
echo To import to MongoDB, run:
echo   mongodb_import.bat
echo.
echo To start exploring:
echo   mongosh nosql_course
echo   ^> db.customers.findOne^(^)
echo   ^> db.listings.find^({price: {$lt: 50}}^).limit^(5^)
echo.
echo For transformation examples, see:
echo   mongodb_modeling_patterns_guide.md
echo ================================================

pause
