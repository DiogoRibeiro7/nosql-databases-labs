@echo off
REM Lab 02 - Database Setup Script (Windows)
REM
REM This script sets up the MongoDB database for Lab 02 - Data Modeling.
REM It imports sample data and creates necessary indexes.

echo ============================================================
echo Lab 02 - E-Commerce Data Model Setup
echo ============================================================
echo.

REM Check if MongoDB is running
echo Checking MongoDB connection...
mongosh --quiet --eval "db.version()" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: MongoDB is not running or not accessible
    echo Please start MongoDB and try again.
    echo.
    echo To start MongoDB on Windows:
    echo   - Open Services (services.msc^)
    echo   - Find "MongoDB" service
    echo   - Right-click and select "Start"
    echo   OR
    echo   - Run as Administrator: net start MongoDB
    echo.
    pause
    exit /b 1
)
echo MongoDB is running
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js is installed
echo.

REM Check if required npm packages are installed
echo Checking npm dependencies...
if not exist "..\..\node_modules\mongodb" (
    echo Installing MongoDB driver...
    cd ..\..
    call npm install mongodb
    cd labs\lab02_modeling
)
echo Dependencies ready
echo.

REM Ask user if they want to reset existing data
echo Warning: This will reset the lab02_ecommerce database if it exists.
set /p CONFIRM="Do you want to continue? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo Setup cancelled.
    pause
    exit /b 0
)
echo.

REM Run the import script
echo Starting database import...
echo ------------------------------------------------------------
node import_data.js
set IMPORT_EXIT_CODE=%ERRORLEVEL%

if %IMPORT_EXIT_CODE% NEQ 0 (
    echo.
    echo Error: Database import failed
    echo Please check the error messages above and try again.
    pause
    exit /b 1
)

echo.
echo ------------------------------------------------------------
echo Database setup completed successfully!
echo.

REM Run verification
echo Running verification tests...
echo ------------------------------------------------------------
node test_queries.js
set TEST_EXIT_CODE=%ERRORLEVEL%

if %TEST_EXIT_CODE% NEQ 0 (
    echo.
    echo Warning: Some tests failed
    echo The database is set up, but there may be issues with the data model.
    echo Please review the test results above.
) else (
    echo.
    echo All tests passed!
)

echo.
echo ============================================================
echo Setup Complete!
echo ============================================================
echo.
echo The lab02_ecommerce database is now ready with:
echo   - customers collection (with sample customers^)
echo   - products collection (with sample products^)
echo   - orders collection (with sample orders^)
echo   - reviews collection (with sample reviews^)
echo   - All required indexes created
echo.
echo You can now:
echo   1. Run queries: node queries.js
echo   2. Test the model: node test_queries.js
echo   3. Connect with mongosh: mongosh lab02_ecommerce
echo   4. Reset database: node reset_database.js
echo.
echo Happy coding!
echo.
pause