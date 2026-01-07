@echo off
REM NoSQL Databases Labs - Development Environment Setup Script for Windows
REM This script automates the setup process for the development environment

setlocal enabledelayedexpansion

REM Colors are limited in Windows batch, using echo statements
echo ================================================
echo   NoSQL Databases Labs - Setup Script (Windows)
echo ================================================
echo.

REM Check prerequisites
echo [INFO] Checking prerequisites...

REM Check for Git
where git >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Git is installed
) else (
    echo [ERROR] Git is not installed
    echo [WARNING] Please install Git from: https://git-scm.com/
    set MISSING_DEPS=1
)

REM Check for Docker
where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Docker is installed
) else (
    echo [ERROR] Docker is not installed
    echo [WARNING] Please install Docker Desktop from: https://www.docker.com/get-started
    set MISSING_DEPS=1
)

REM Check for Python
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Python is installed
) else (
    where python3 >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [SUCCESS] Python3 is installed
    ) else (
        echo [ERROR] Python is not installed
        echo [WARNING] Please install Python from: https://www.python.org/
        set MISSING_DEPS=1
    )
)

REM Check for Node.js (optional)
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Node.js is installed (optional)
) else (
    echo [WARNING] Node.js is not installed - optional but recommended
    echo [WARNING] Install from: https://nodejs.org/
)

if defined MISSING_DEPS (
    echo [ERROR] Some required dependencies are missing. Please install them and run this script again.
    pause
    exit /b 1
)

echo [SUCCESS] All required prerequisites are installed!
echo.

REM Setup Python environment
echo [INFO] Setting up Python environment...

REM Check if venv exists
if exist "venv\" (
    echo [WARNING] Virtual environment already exists. Skipping creation.
) else (
    REM Create virtual environment
    python -m venv venv 2>nul || python3 -m venv venv
    echo [SUCCESS] Created virtual environment
)

REM Activate virtual environment
echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat

REM Install Python dependencies
echo [INFO] Installing Python dependencies...
python -m pip install --quiet --upgrade pip

REM Install requirements if they exist
if exist "requirements.txt" (
    pip install --quiet -r requirements.txt
    echo [SUCCESS] Installed requirements.txt
)

if exist "requirements-dev.txt" (
    pip install --quiet -r requirements-dev.txt
    echo [SUCCESS] Installed requirements-dev.txt
)

REM Install additional development tools
pip install --quiet pymongo pytest pytest-cov black flake8 pylint faker
echo [SUCCESS] Installed development tools
echo.

REM Setup Docker environment
echo [INFO] Setting up Docker environment...

REM Check if Docker daemon is running
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker daemon is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

REM Pull required Docker images
echo [INFO] Pulling Docker images - this may take a few minutes...
docker pull mongo:7.0 >nul 2>&1
docker pull mongo-express:latest >nul 2>&1
echo [SUCCESS] Docker images pulled successfully

REM Start Docker containers
echo [INFO] Starting Docker containers...
docker-compose up -d >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Docker containers started
) else (
    REM Try docker compose (newer version)
    docker compose up -d >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [SUCCESS] Docker containers started
    ) else (
        echo [ERROR] Failed to start Docker containers
        pause
        exit /b 1
    )
)

REM Wait for MongoDB to be ready
echo [INFO] Waiting for MongoDB to be ready...
set COUNTER=0
:wait_loop
if !COUNTER! GEQ 30 goto :timeout
docker exec nosql-labs-mongodb mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] MongoDB is ready!
    goto :mongodb_ready
)
timeout /t 2 /nobreak >nul
set /a COUNTER+=1
echo.
goto :wait_loop

:timeout
echo [ERROR] MongoDB failed to start within timeout
pause
exit /b 1

:mongodb_ready
echo.

REM Check sample data
echo [INFO] Checking sample data...
docker exec nosql-labs-mongodb mongosh -u labuser -p labpass123 nosql_labs --eval "db.students.countDocuments()" 2>nul | findstr "3" >nul
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Sample data already loaded
) else (
    echo [INFO] Sample data will be loaded automatically
)
echo.

REM Create useful batch file for aliases
echo [INFO] Creating useful commands...
(
echo @echo off
echo REM Useful commands for NoSQL Labs
echo.
echo if "%%1"=="shell" goto :shell
echo if "%%1"=="admin" goto :admin
echo if "%%1"=="stop" goto :stop
echo if "%%1"=="start" goto :start
echo if "%%1"=="restart" goto :restart
echo if "%%1"=="logs" goto :logs
echo if "%%1"=="test" goto :test
echo.
echo echo Usage: lab [command]
echo echo Commands:
echo echo   shell   - Open MongoDB shell
echo echo   admin   - Open MongoDB admin shell
echo echo   stop    - Stop Docker containers
echo echo   start   - Start Docker containers
echo echo   restart - Restart Docker containers
echo echo   logs    - View MongoDB logs
echo echo   test    - Run tests
echo goto :eof
echo.
echo :shell
echo docker exec -it nosql-labs-mongodb mongosh -u labuser -p labpass123 nosql_labs
echo goto :eof
echo.
echo :admin
echo docker exec -it nosql-labs-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
echo goto :eof
echo.
echo :stop
echo docker-compose down
echo goto :eof
echo.
echo :start
echo docker-compose up -d
echo goto :eof
echo.
echo :restart
echo docker-compose restart
echo goto :eof
echo.
echo :logs
echo docker-compose logs -f mongodb
echo goto :eof
echo.
echo :test
echo python -m pytest tests/ -v
echo goto :eof
) > lab.bat

echo [SUCCESS] Created lab.bat with useful commands
echo.

REM VS Code setup
where code >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] VS Code detected. Installing recommended extensions...

    REM Install extensions
    call code --install-extension mongodb.mongodb-vscode 2>nul
    call code --install-extension ms-azuretools.vscode-docker 2>nul
    call code --install-extension ms-python.python 2>nul

    echo [SUCCESS] VS Code extensions installation initiated
) else (
    echo [WARNING] VS Code not found. Please install recommended extensions manually.
)
echo.

REM Final summary
echo ================================================
echo   Setup Complete!
echo ================================================
echo.
echo MongoDB is running at:
echo   - Database: localhost:27017
echo   - Web UI:   http://localhost:8081
echo.
echo Connection Details:
echo   - Database: nosql_labs
echo   - Username: labuser
echo   - Password: labpass123
echo.
echo Quick Commands (use: lab [command]):
echo   - lab shell   : Open MongoDB shell
echo   - lab admin   : Open admin shell
echo   - lab stop    : Stop containers
echo   - lab start   : Start containers
echo   - lab logs    : View logs
echo   - lab test    : Run tests
echo.
echo Next Steps:
echo   1. Activate Python environment: venv\Scripts\activate
echo   2. Open VS Code: code .
echo   3. Start working on the labs!
echo.
echo [SUCCESS] Happy coding!
echo.
pause