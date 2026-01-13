#!/bin/bash

# NoSQL Databases Labs - Development Environment Setup Script
# This script automates the setup process for the development environment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_command() {
    if command -v $1 &> /dev/null; then
        print_success "$1 is installed"
        return 0
    else
        print_error "$1 is not installed"
        return 1
    fi
}

# Banner
echo "================================================"
echo "  NoSQL Databases Labs - Setup Script"
echo "================================================"
echo ""

# Detect OS
print_status "Detecting operating system..."
OS=""
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    print_success "Detected Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    print_success "Detected macOS"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="windows"
    print_success "Detected Windows"
else
    print_error "Unsupported operating system: $OSTYPE"
    exit 1
fi

# Check prerequisites
print_status "Checking prerequisites..."
MISSING_DEPS=0

# Check for Git
if ! check_command git; then
    MISSING_DEPS=1
    print_warning "Please install Git from: https://git-scm.com/"
fi

# Check for Docker
if ! check_command docker; then
    MISSING_DEPS=1
    print_warning "Please install Docker from: https://www.docker.com/get-started"
fi

# Check for Docker Compose
if ! check_command docker-compose; then
    # Try docker compose (newer version)
    if docker compose version &> /dev/null; then
        print_success "docker compose is installed (Docker Compose V2)"
    else
        MISSING_DEPS=1
        print_warning "Please install Docker Compose"
    fi
else
    print_success "docker-compose is installed"
fi

# Check for Python
if ! check_command python3; then
    if ! check_command python; then
        MISSING_DEPS=1
        print_warning "Please install Python 3.8+ from: https://www.python.org/"
    fi
fi

# Check for Node.js (optional but recommended)
if ! check_command node; then
    print_warning "Node.js is not installed (optional but recommended)"
    print_warning "Install from: https://nodejs.org/"
fi

# Check for MongoDB Shell (optional)
if ! check_command mongosh; then
    print_warning "MongoDB Shell (mongosh) is not installed locally (optional)"
    print_warning "It will be available inside Docker containers"
fi

if [ $MISSING_DEPS -eq 1 ]; then
    print_error "Some required dependencies are missing. Please install them and run this script again."
    exit 1
fi

print_success "All required prerequisites are installed!"
echo ""

# Setup Python environment
print_status "Setting up Python environment..."

# Check if venv exists
if [ -d "venv" ]; then
    print_warning "Virtual environment already exists. Skipping creation."
else
    # Create virtual environment
    if command -v python3 &> /dev/null; then
        python3 -m venv venv
    else
        python -m venv venv
    fi
    print_success "Created virtual environment"
fi

# Activate virtual environment
print_status "Activating virtual environment..."
if [ "$OS" == "windows" ]; then
    source venv/Scripts/activate 2>/dev/null || source venv/bin/activate
else
    source venv/bin/activate
fi

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install --quiet --upgrade pip

# Install requirements if they exist
if [ -f "requirements.txt" ]; then
    pip install --quiet -r requirements.txt
    print_success "Installed requirements.txt"
fi

if [ -f "requirements-dev.txt" ]; then
    pip install --quiet -r requirements-dev.txt
    print_success "Installed requirements-dev.txt"
fi

# Install additional development tools
pip install --quiet pymongo pytest pytest-cov black flake8 pylint faker
print_success "Installed development tools"

echo ""

# Setup Docker environment
print_status "Setting up Docker environment..."

# Check if Docker daemon is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker daemon is not running. Please start Docker Desktop."
    exit 1
fi

# Pull required Docker images
print_status "Pulling Docker images (this may take a few minutes)..."
docker pull mongo:7.0 > /dev/null 2>&1
docker pull mongo-express:latest > /dev/null 2>&1
print_success "Docker images pulled successfully"

# Start Docker containers
print_status "Starting Docker containers..."
if docker-compose up -d 2>/dev/null; then
    print_success "Docker containers started with docker-compose"
elif docker compose up -d 2>/dev/null; then
    print_success "Docker containers started with docker compose"
else
    print_error "Failed to start Docker containers"
    exit 1
fi

# Wait for MongoDB to be ready
print_status "Waiting for MongoDB to be ready..."
MAX_TRIES=30
COUNTER=0
while [ $COUNTER -lt $MAX_TRIES ]; do
    if docker exec nosql-labs-mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
        print_success "MongoDB is ready!"
        break
    fi
    COUNTER=$((COUNTER+1))
    if [ $COUNTER -eq $MAX_TRIES ]; then
        print_error "MongoDB failed to start within timeout"
        exit 1
    fi
    sleep 2
    echo -n "."
done
echo ""

# Load sample data (if needed)
print_status "Checking sample data..."
if docker exec nosql-labs-mongodb mongosh -u labuser -p labpass123 nosql_labs --eval "db.students.countDocuments()" 2>/dev/null | grep -q "3"; then
    print_success "Sample data already loaded"
else
    print_status "Loading sample data..."
    # Data will be loaded automatically by the init script in Docker
    print_success "Sample data loading initiated"
fi

echo ""

# Setup Git hooks
print_status "Setting up Git hooks..."
if [ -d ".git" ]; then
    # Create hooks directory if it doesn't exist
    mkdir -p .git/hooks

    # We'll create the pre-commit hook in the next step
    print_success "Git hooks directory prepared"
else
    print_warning "Not a Git repository. Skipping Git hooks setup."
fi

echo ""

# Create useful aliases
print_status "Creating useful aliases..."
cat > .env.local << 'EOF'
# MongoDB connection strings
export MONGODB_URI="mongodb://labuser:labpass123@localhost:27017/nosql_labs"
export MONGODB_ADMIN_URI="mongodb://admin:admin123@localhost:27017/admin"

# Aliases for common commands
alias mongo-shell='docker exec -it nosql-labs-mongodb mongosh -u labuser -p labpass123 nosql_labs'
alias mongo-admin='docker exec -it nosql-labs-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin'
alias mongo-stop='docker-compose down'
alias mongo-start='docker-compose up -d'
alias mongo-restart='docker-compose restart'
alias mongo-logs='docker-compose logs -f mongodb'
alias run-tests='python -m pytest tests/ -v'
alias run-faker='cd mongodb-faker-generator && python generate.py'
EOF

print_success "Created .env.local with useful aliases"
print_status "To use aliases, run: source .env.local"

echo ""

# VS Code setup
if command -v code &> /dev/null; then
    print_status "VS Code detected. Installing recommended extensions..."

    # Install extensions
    code --install-extension mongodb.mongodb-vscode 2>/dev/null
    code --install-extension ms-azuretools.vscode-docker 2>/dev/null
    code --install-extension ms-python.python 2>/dev/null

    print_success "VS Code extensions installation initiated"
else
    print_warning "VS Code not found in PATH. Please install recommended extensions manually."
fi

echo ""

# Final checks and summary
print_status "Running final checks..."
echo ""

echo "================================================"
echo "  Setup Complete!"
echo "================================================"
echo ""
echo "✅ Python virtual environment: $(which python)"
echo "✅ Docker containers running:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep nosql-labs || true
echo ""
echo "📚 Available Services:"
echo "   - MongoDB:       localhost:27017"
echo "   - Mongo Express: http://localhost:8081"
echo ""
echo "🔗 Connection Details:"
echo "   - Database: nosql_labs"
echo "   - Username: labuser"
echo "   - Password: labpass123"
echo ""
echo "🚀 Quick Start Commands:"
echo "   - Activate Python env:  source venv/bin/activate"
echo "   - Load aliases:         source .env.local"
echo "   - Open MongoDB shell:   mongo-shell (after loading aliases)"
echo "   - Run tests:           python -m pytest tests/"
echo "   - Stop containers:     docker-compose down"
echo ""
echo "📖 Next Steps:"
echo "   1. Activate the virtual environment"
echo "   2. Load the aliases: source .env.local"
echo "   3. Open VS Code: code ."
echo "   4. Start working on the labs!"
echo ""
print_success "Happy coding! 🎉"