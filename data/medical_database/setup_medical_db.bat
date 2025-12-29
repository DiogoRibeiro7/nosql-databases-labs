@echo off
REM ============================================================================
REM Medical Records MongoDB Database - Setup Script (Windows)
REM Author: Diogo Ribeiro - ESMAD/IPP
REM ============================================================================

cls
echo ================================================
echo Medical Records MongoDB Database Setup
echo ================================================

REM Check Python installation
echo.
echo [1/6] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python found: 
    python --version
    set PYTHON_CMD=python
) else (
    python3 --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Python3 found:
        python3 --version
        set PYTHON_CMD=python3
    ) else (
        echo [ERROR] Python is not installed. Please install Python 3.7+
        pause
        exit /b 1
    )
)

REM Install Python dependencies
echo.
echo [2/6] Installing Python dependencies...
if exist requirements_medical.txt (
    %PYTHON_CMD% -m pip install -r requirements_medical.txt --quiet
    echo [OK] Dependencies installed
) else (
    %PYTHON_CMD% -m pip install faker pandas pymongo --quiet
    echo [OK] Core dependencies installed
)

REM Check MongoDB
echo.
echo [3/6] Checking MongoDB...
mongosh --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] MongoDB client found
    set MONGO_CLIENT=mongosh
) else (
    mongo --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] MongoDB client found
        set MONGO_CLIENT=mongo
    ) else (
        echo [WARNING] MongoDB client not found
        set MONGO_CLIENT=none
    )
)

REM Test MongoDB connection
set MONGO_RUNNING=false
if not "%MONGO_CLIENT%"=="none" (
    %MONGO_CLIENT% --quiet --eval "db.version()" >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] MongoDB is running
        set MONGO_RUNNING=true
    ) else (
        echo [WARNING] MongoDB is not running
    )
)

REM Option to start MongoDB with Docker
if "%MONGO_RUNNING%"=="false" (
    docker --version >nul 2>&1
    if %errorlevel% equ 0 (
        if exist docker-compose.yml (
            echo.
            set /p start_docker="Would you like to start MongoDB using Docker? (y/n): "
            if /i "%start_docker%"=="y" (
                docker-compose up -d
                echo [OK] MongoDB started with Docker
                echo   Access MongoDB Express at: http://localhost:8081
                echo   Username: admin, Password: admin123
                timeout /t 5 /nobreak >nul
                set MONGO_RUNNING=true
            )
        )
    )
)

REM Generate synthetic medical data
echo.
echo [4/6] Generating synthetic medical data...
set /p num_patients="How many patients would you like to generate? (default: 1000): "
if "%num_patients%"=="" set num_patients=1000

if exist generate_medical_database.py (
    %PYTHON_CMD% generate_medical_database.py --patients %num_patients%
    echo [OK] Generated %num_patients% patient records
) else (
    echo [ERROR] generate_medical_database.py not found
    pause
    exit /b 1
)

REM Import data to MongoDB
echo.
echo [5/6] Importing data to MongoDB...
if "%MONGO_RUNNING%"=="true" (
    if exist medical_mongodb_analytics.py (
        %PYTHON_CMD% medical_mongodb_analytics.py --import --data-dir ./medical_database
        echo [OK] Data imported to MongoDB
    ) else (
        REM Manual import
        mongoimport --db medical --collection patients --file medical_database\patients.json --jsonArray 2>nul
        mongoimport --db medical --collection visits --file medical_database\visits.json --jsonArray 2>nul
        mongoimport --db medical --collection lab_results --file medical_database\lab_results.json --jsonArray 2>nul
        echo [OK] Data imported to MongoDB (manual)
    )
) else (
    echo [WARNING] MongoDB not available - skipping import
    echo   JSON files saved in: .\medical_database\
)

REM Run sample analytics
echo.
echo [6/6] Sample analytics...
if "%MONGO_RUNNING%"=="true" (
    if exist medical_mongodb_analytics.py (
        set /p run_analytics="Would you like to run sample analytics? (y/n): "
        if /i "%run_analytics%"=="y" (
            %PYTHON_CMD% medical_mongodb_analytics.py
        )
    )
)

REM Summary
echo.
echo ================================================
echo Setup Complete!
echo ================================================
echo.
echo Generated files:
echo   - medical_database\patients.json (%num_patients% patients)
echo   - medical_database\visits.json
echo   - medical_database\lab_results.json
echo.

if "%MONGO_RUNNING%"=="true" (
    echo MongoDB Database:
    echo   - Database: medical
    echo   - Collections: patients, visits, lab_results
    echo.
    echo Try these commands:
    echo   %MONGO_CLIENT% medical
    echo   ^> db.patients.findOne^(^)
    echo   ^> db.patients.countDocuments^(^)
    echo.
)

echo Next steps:
echo   1. Review README_medical_database.md for documentation
echo   2. Explore the data with MongoDB Compass or mongosh
echo   3. Run analytics: %PYTHON_CMD% medical_mongodb_analytics.py
echo.
echo ================================================
pause
