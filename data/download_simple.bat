@echo off
REM ============================================================================
REM Simple Database Download for NoSQL Course - Northwind & Chinook Only
REM Author: Diogo Ribeiro - ESMAD/IPP
REM ============================================================================
REM This is a simplified version that downloads only 2 small databases

cls
echo ================================================
echo Simple Database Download (Northwind and Chinook)
echo ================================================
echo.
echo This script will download 2 small sample databases:
echo   1. Northwind (E-commerce) - ~1MB
echo   2. Chinook (Music Store) - ~1MB
echo.
pause

REM Check if curl is available
where curl >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: curl is not available!
    echo Please use Windows 10 or later, or install curl manually.
    pause
    exit /b 1
)

REM Create directories
echo.
echo Creating directories...
if not exist "sample_databases" mkdir sample_databases
if not exist "sample_databases\northwind" mkdir sample_databases\northwind
if not exist "sample_databases\chinook" mkdir sample_databases\chinook

REM ============================================================================
REM NORTHWIND DATABASE
REM ============================================================================
echo.
echo ========================================
echo Downloading Northwind Database...
echo ========================================
cd sample_databases\northwind

echo Downloading categories.csv...
curl -# -O https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/categories.csv

echo Downloading customers.csv...
curl -# -O https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/customers.csv

echo Downloading products.csv...
curl -# -O https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/products.csv

echo Downloading orders.csv...
curl -# -O https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/orders.csv

echo Downloading order_details.csv...
curl -# -O https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/order_details.csv

echo Downloading employees.csv...
curl -# -O https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/employees.csv

echo Downloading suppliers.csv...
curl -# -O https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/suppliers.csv

echo Downloading shippers.csv...
curl -# -O https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/shippers.csv

cd ..\..

REM ============================================================================
REM CHINOOK DATABASE
REM ============================================================================
echo.
echo ========================================
echo Downloading Chinook Database...
echo ========================================
cd sample_databases\chinook

echo Downloading Chinook SQLite database...
curl -# -L -o Chinook_Sqlite.sqlite https://github.com/lerocha/chinook-database/raw/master/ChinookDatabase/DataSources/Chinook_Sqlite.sqlite

echo Downloading Chinook MySQL script...
curl -# -O https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_MySql.sql

cd ..\..

REM ============================================================================
REM Convert to JSON using Python (if available)
REM ============================================================================
echo.
echo ========================================
echo Converting to JSON format...
echo ========================================

REM Check if Python is available
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo Python not found. Skipping JSON conversion.
    echo You can convert these files later using Python with pandas.
    goto :skip_conversion
)

REM Check if pandas is installed
python -c "import pandas" 2>nul
if %errorlevel% neq 0 (
    echo pandas not installed. Installing...
    pip install pandas
)

REM Create conversion script
echo Creating conversion script...
(
echo import pandas as pd
echo import sqlite3
echo import json
echo from pathlib import Path
echo import os
echo.
echo # Convert Northwind CSVs to JSON
echo print^("Converting Northwind CSV files to JSON..."^)
echo northwind_path = Path^("sample_databases/northwind"^)
echo json_dir = northwind_path / "json"
echo json_dir.mkdir^(exist_ok=True^)
echo.
echo for csv_file in northwind_path.glob^("*.csv"^):
echo     try:
echo         df = pd.read_csv^(csv_file^)
echo         json_file = json_dir / f"{csv_file.stem}.json"
echo         df.to_json^(json_file, orient='records', indent=2^)
echo         print^(f"  Converted {csv_file.name} - {len^(df^)} records"^)
echo     except Exception as e:
echo         print^(f"  Error converting {csv_file.name}: {e}"^)
echo.
echo # Convert Chinook SQLite to JSON
echo print^("\nConverting Chinook SQLite to JSON..."^)
echo chinook_db = "sample_databases/chinook/Chinook_Sqlite.sqlite"
echo if os.path.exists^(chinook_db^):
echo     conn = sqlite3.connect^(chinook_db^)
echo     cursor = conn.cursor^(^)
echo     cursor.execute^("SELECT name FROM sqlite_master WHERE type='table';"^)
echo     tables = cursor.fetchall^(^)
echo.    
echo     json_dir = Path^("sample_databases/chinook/json"^)
echo     json_dir.mkdir^(exist_ok=True^)
echo.    
echo     for table in tables:
echo         table_name = table[0]
echo         try:
echo             df = pd.read_sql_query^(f"SELECT * FROM {table_name}", conn^)
echo             json_file = json_dir / f"{table_name}.json"
echo             df.to_json^(json_file, orient='records', indent=2^)
echo             print^(f"  Converted {table_name} - {len^(df^)} records"^)
echo         except Exception as e:
echo             print^(f"  Error converting {table_name}: {e}"^)
echo     conn.close^(^)
echo else:
echo     print^("  Chinook SQLite file not found"^)
echo.
echo print^("\nConversion complete!"^)
) > convert_simple.py

echo Running conversion...
python convert_simple.py
del convert_simple.py

:skip_conversion

REM ============================================================================
REM Create MongoDB import commands
REM ============================================================================
echo.
echo ========================================
echo Creating MongoDB import commands...
echo ========================================

(
echo @echo off
echo REM MongoDB Import Commands for Northwind and Chinook
echo.
echo set DB=nosql_course
echo.
echo echo Importing Northwind to MongoDB...
echo mongoimport --db %%DB%% --collection categories --file sample_databases\northwind\json\categories.json --jsonArray
echo mongoimport --db %%DB%% --collection customers --file sample_databases\northwind\json\customers.json --jsonArray
echo mongoimport --db %%DB%% --collection products --file sample_databases\northwind\json\products.json --jsonArray
echo mongoimport --db %%DB%% --collection orders --file sample_databases\northwind\json\orders.json --jsonArray
echo mongoimport --db %%DB%% --collection order_details --file sample_databases\northwind\json\order_details.json --jsonArray
echo.
echo echo Importing Chinook to MongoDB...
echo mongoimport --db %%DB%% --collection Artist --file sample_databases\chinook\json\Artist.json --jsonArray
echo mongoimport --db %%DB%% --collection Album --file sample_databases\chinook\json\Album.json --jsonArray
echo mongoimport --db %%DB%% --collection Track --file sample_databases\chinook\json\Track.json --jsonArray
echo mongoimport --db %%DB%% --collection Customer --file sample_databases\chinook\json\Customer.json --jsonArray
echo mongoimport --db %%DB%% --collection Invoice --file sample_databases\chinook\json\Invoice.json --jsonArray
echo.
echo echo Done! Check your MongoDB database: nosql_course
echo pause
) > import_to_mongodb.bat

REM ============================================================================
REM Done!
REM ============================================================================
echo.
echo ================================================
echo DOWNLOAD COMPLETE!
echo ================================================
echo.
echo Downloaded files are in: sample_databases\
echo.
echo Directory structure:
echo   sample_databases\
echo     northwind\        (CSV files and JSON folder)
echo     chinook\          (SQLite database and JSON folder)
echo.
echo Next steps:
echo   1. Make sure MongoDB is running
echo   2. Run: import_to_mongodb.bat
echo   3. Connect to MongoDB: mongosh nosql_course
echo   4. Try: db.products.findOne()
echo.
echo ================================================
pause
