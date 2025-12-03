@echo off
REM Lab 01 - MongoDB Setup Script for Windows (Using mongosh)
REM This script sets up the database and imports initial data

echo ===================================
echo Lab 01 - MongoDB Database Setup
echo ===================================
echo.

REM Configuration
set DB_NAME=lab01_student
set COLLECTION_NAME=customers
set DATA_FILE=sample.json

REM Check if mongosh is available
where mongosh >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: mongosh is not installed or not in PATH
    echo Please install MongoDB Shell ^(mongosh^) from: https://www.mongodb.com/try/download/shell
    exit /b 1
)

REM Check if mongoimport is available
where mongoimport >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: mongoimport is not installed or not in PATH
    echo Please install MongoDB Database Tools from: https://www.mongodb.com/try/download/database-tools
    exit /b 1
)

REM Check if data file exists
if not exist %DATA_FILE% (
    echo Error: Data file %DATA_FILE% not found!
    echo Please ensure you're running this script from the lab01_intro directory
    exit /b 1
)

echo Step 1: Checking MongoDB connection...
echo ---------------------------------------

REM Test connection to MongoDB using mongosh
mongosh --eval "db.version()" >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Cannot connect to MongoDB. Please ensure MongoDB is running.
    echo.
    echo Check that the MongoDB service is running in Windows Services.
    exit /b 1
)

echo √ Successfully connected to MongoDB
echo.

echo Step 2: Creating database and importing data...
echo ---------------------------------------

REM Drop existing collection if it exists (optional - uncomment if needed)
REM mongosh %DB_NAME% --eval "db.%COLLECTION_NAME%.drop()" >nul 2>&1

REM Import data using mongoimport
mongoimport --db %DB_NAME% --collection %COLLECTION_NAME% --file %DATA_FILE% --jsonArray

if %errorlevel% equ 0 (
    echo.
    echo Step 3: Verifying import...
    echo ---------------------------------------

    REM Verify the import using mongosh and capture the count
    for /f %%i in ('mongosh %DB_NAME% --quiet --eval "db.%COLLECTION_NAME%.countDocuments()"') do set COUNT=%%i
    echo √ Successfully imported %COUNT% documents into %DB_NAME%.%COLLECTION_NAME%

    echo.
    echo Step 4: Creating indexes...
    echo ---------------------------------------

    REM Create indexes using mongosh
    mongosh %DB_NAME% --quiet --eval "db.%COLLECTION_NAME%.createIndex({ city: 1 }); print('√ Created index on city');"
    mongosh %DB_NAME% --quiet --eval "db.%COLLECTION_NAME%.createIndex({ country: 1 }); print('√ Created index on country');"
    mongosh %DB_NAME% --quiet --eval "db.%COLLECTION_NAME%.createIndex({ age: 1, balance: -1 }); print('√ Created compound index on age and balance');"
    mongosh %DB_NAME% --quiet --eval "db.%COLLECTION_NAME%.createIndex({ email: 1 }, { unique: true }); print('√ Created unique index on email');"

    echo.
    echo ===================================
    echo Setup completed successfully!
    echo ===================================
    echo.
    echo To connect to the database, run:
    echo   mongosh %DB_NAME%
    echo.
    echo To run queries from queries.js file:
    echo   mongosh %DB_NAME% --file queries.js
    echo.
    echo Or interactively:
    echo   mongosh
    echo   use %DB_NAME%
    echo   load('queries.js'^)
) else (
    echo Error: Failed to import data
    exit /b 1
)