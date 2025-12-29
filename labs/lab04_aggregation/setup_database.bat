@echo off
REM Lab 04 - Aggregation Framework Setup Script for Windows
REM This script sets up the database and collections for the aggregation lab

echo =========================================
echo Lab 04: Aggregation Framework Setup
echo =========================================

REM Configuration
set DB_NAME=lab04_analytics
set MONGO_PORT=27017
set DATA_DIR=.\starter\data

REM Check if MongoDB is running
echo Checking MongoDB connection...
mongosh --port %MONGO_PORT% --eval "db.version()" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] MongoDB is not running on port %MONGO_PORT%
    echo Please start MongoDB and try again
    pause
    exit /b 1
)
echo [OK] MongoDB is running on port %MONGO_PORT%

REM Drop existing database
echo.
echo Dropping existing database...
mongosh --port %MONGO_PORT% --eval "use %DB_NAME%; db.dropDatabase();" >nul 2>&1
echo [OK] Database cleaned

REM Import sales data
echo.
echo Importing data...
echo Importing sales collection...
if not exist "%DATA_DIR%\sales.json" (
    echo [ERROR] File not found: %DATA_DIR%\sales.json
    pause
    exit /b 1
)

mongoimport --db %DB_NAME% --collection sales --file "%DATA_DIR%\sales.json" --jsonArray --drop 2>nul
if %errorlevel% equ 0 (
    for /f %%i in ('mongosh --quiet --port %MONGO_PORT% --eval "use %DB_NAME%; db.sales.countDocuments()"') do set SALES_COUNT=%%i
    echo [OK] Imported documents into sales collection
) else (
    echo [ERROR] Failed to import sales collection
)

REM Import products data
echo Importing products collection...
if not exist "%DATA_DIR%\products.json" (
    echo [ERROR] File not found: %DATA_DIR%\products.json
    pause
    exit /b 1
)

mongoimport --db %DB_NAME% --collection products --file "%DATA_DIR%\products.json" --jsonArray --drop 2>nul
if %errorlevel% equ 0 (
    echo [OK] Imported documents into products collection
) else (
    echo [ERROR] Failed to import products collection
)

REM Import customers data
echo Importing customers collection...
if not exist "%DATA_DIR%\customers.json" (
    echo [ERROR] File not found: %DATA_DIR%\customers.json
    pause
    exit /b 1
)

mongoimport --db %DB_NAME% --collection customers --file "%DATA_DIR%\customers.json" --jsonArray --drop 2>nul
if %errorlevel% equ 0 (
    echo [OK] Imported documents into customers collection
) else (
    echo [ERROR] Failed to import customers collection
)

REM Create indexes
echo.
echo Creating indexes...
mongosh --port %MONGO_PORT% --quiet --eval ^
    "use %DB_NAME%; ^
    db.sales.createIndex({ date: 1 }); ^
    db.sales.createIndex({ customer_id: 1 }); ^
    db.sales.createIndex({ product_id: 1 }); ^
    db.sales.createIndex({ date: 1, customer_id: 1 }); ^
    db.products.createIndex({ category: 1 }); ^
    db.products.createIndex({ price: 1 }); ^
    db.products.createIndex({ product_id: 1 }); ^
    db.customers.createIndex({ segment: 1 }); ^
    db.customers.createIndex({ country: 1 }); ^
    db.customers.createIndex({ customer_id: 1 }); ^
    print('Indexes created');" >nul 2>&1

if %errorlevel% equ 0 (
    echo [OK] Indexes created successfully
) else (
    echo [WARNING] Failed to create some indexes
)

REM Create views
echo.
echo Creating aggregation views...
mongosh --port %MONGO_PORT% --quiet --eval ^
    "use %DB_NAME%; ^
    db.monthly_revenue.drop(); ^
    db.top_customers.drop(); ^
    db.product_performance.drop(); ^
    db.createView('monthly_revenue', 'sales', [ ^
        { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, ^
                   revenue: { $sum: '$amount' }, orders: { $count: {} } } }, ^
        { $sort: { '_id.year': 1, '_id.month': 1 } } ^
    ]); ^
    db.createView('top_customers', 'sales', [ ^
        { $group: { _id: '$customer_id', total_spent: { $sum: '$amount' }, ^
                   order_count: { $count: {} } } }, ^
        { $sort: { total_spent: -1 } }, ^
        { $limit: 10 } ^
    ]); ^
    db.createView('product_performance', 'sales', [ ^
        { $group: { _id: '$product_id', revenue: { $sum: '$amount' }, ^
                   units_sold: { $sum: '$quantity' } } }, ^
        { $sort: { revenue: -1 } } ^
    ]); ^
    print('Views created');" >nul 2>&1

if %errorlevel% equ 0 (
    echo [OK] Views created successfully
) else (
    echo [WARNING] Failed to create some views
)

REM Verify setup
echo.
echo Verifying setup...
mongosh --port %MONGO_PORT% --eval ^
    "use %DB_NAME%; ^
    const sales_count = db.sales.countDocuments(); ^
    const products_count = db.products.countDocuments(); ^
    const customers_count = db.customers.countDocuments(); ^
    print(''); ^
    print('Database: ' + db.getName()); ^
    print('Collections:'); ^
    print('  - sales: ' + sales_count + ' documents'); ^
    print('  - products: ' + products_count + ' documents'); ^
    print('  - customers: ' + customers_count + ' documents'); ^
    print(''); ^
    if (sales_count === 200 && products_count === 30 && customers_count === 50) { ^
        print('All collections have the expected document count'); ^
    } else { ^
        print('Warning: Document counts do not match expected values'); ^
    }"

echo.
echo =========================================
echo Setup completed successfully!
echo Database: %DB_NAME%
echo.
echo You can now run the aggregation exercises
echo.
echo To connect:
echo   mongosh --eval "use %DB_NAME%"
echo.
echo To test aggregations:
echo   node aggregation_basics.js
echo   node aggregation_advanced.js
echo =========================================
echo.
pause