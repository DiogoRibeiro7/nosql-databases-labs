#!/bin/bash

# ============================================================================
# Medical Records MongoDB Database - Setup Script
# Author: Diogo Ribeiro - ESMAD/IPP
# ============================================================================

echo "================================================"
echo "Medical Records MongoDB Database Setup"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Python is installed
echo -e "\n${YELLOW}[1/6] Checking Python installation...${NC}"
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}✓ Python3 found: $(python3 --version)${NC}"
    PYTHON_CMD=python3
elif command -v python &> /dev/null; then
    echo -e "${GREEN}✓ Python found: $(python --version)${NC}"
    PYTHON_CMD=python
else
    echo -e "${RED}✗ Python is not installed. Please install Python 3.7+${NC}"
    exit 1
fi

# Install Python dependencies
echo -e "\n${YELLOW}[2/6] Installing Python dependencies...${NC}"
if [ -f "requirements_medical.txt" ]; then
    $PYTHON_CMD -m pip install -r requirements_medical.txt --quiet
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    $PYTHON_CMD -m pip install faker pandas pymongo --quiet
    echo -e "${GREEN}✓ Core dependencies installed${NC}"
fi

# Check if MongoDB is running
echo -e "\n${YELLOW}[3/6] Checking MongoDB...${NC}"
if command -v mongosh &> /dev/null || command -v mongo &> /dev/null; then
    echo -e "${GREEN}✓ MongoDB client found${NC}"
    
    # Try to connect to MongoDB
    if mongosh --quiet --eval "db.version()" &> /dev/null 2>&1; then
        echo -e "${GREEN}✓ MongoDB is running${NC}"
        MONGO_RUNNING=true
    elif mongo --quiet --eval "db.version()" &> /dev/null 2>&1; then
        echo -e "${GREEN}✓ MongoDB is running${NC}"
        MONGO_RUNNING=true
    else
        echo -e "${YELLOW}⚠ MongoDB is not running${NC}"
        MONGO_RUNNING=false
    fi
else
    echo -e "${YELLOW}⚠ MongoDB client not found${NC}"
    MONGO_RUNNING=false
fi

# Option to start MongoDB with Docker
if [ "$MONGO_RUNNING" = false ]; then
    if command -v docker &> /dev/null && [ -f "docker-compose.yml" ]; then
        echo -e "\n${YELLOW}Would you like to start MongoDB using Docker? (y/n)${NC}"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            docker-compose up -d
            echo -e "${GREEN}✓ MongoDB started with Docker${NC}"
            echo "  Access MongoDB Express at: http://localhost:8081"
            echo "  Username: admin, Password: admin123"
            sleep 5
        fi
    fi
fi

# Generate synthetic medical data
echo -e "\n${YELLOW}[4/6] Generating synthetic medical data...${NC}"
echo "How many patients would you like to generate? (default: 1000)"
read -r num_patients
num_patients=${num_patients:-1000}

if [ -f "generate_medical_database.py" ]; then
    $PYTHON_CMD generate_medical_database.py --patients "$num_patients"
    echo -e "${GREEN}✓ Generated $num_patients patient records${NC}"
else
    echo -e "${RED}✗ generate_medical_database.py not found${NC}"
    exit 1
fi

# Import data to MongoDB
echo -e "\n${YELLOW}[5/6] Importing data to MongoDB...${NC}"
if [ "$MONGO_RUNNING" = true ] || mongosh --quiet --eval "db.version()" &> /dev/null 2>&1; then
    if [ -f "medical_mongodb_analytics.py" ]; then
        $PYTHON_CMD medical_mongodb_analytics.py --import --data-dir ./medical_database
        echo -e "${GREEN}✓ Data imported to MongoDB${NC}"
    else
        # Manual import
        mongoimport --db medical --collection patients --file medical_database/patients.json --jsonArray 2>/dev/null
        mongoimport --db medical --collection visits --file medical_database/visits.json --jsonArray 2>/dev/null
        mongoimport --db medical --collection lab_results --file medical_database/lab_results.json --jsonArray 2>/dev/null
        echo -e "${GREEN}✓ Data imported to MongoDB (manual)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ MongoDB not available - skipping import${NC}"
    echo "  JSON files saved in: ./medical_database/"
fi

# Run sample analytics
echo -e "\n${YELLOW}[6/6] Running sample analytics...${NC}"
if [ "$MONGO_RUNNING" = true ] || mongosh --quiet --eval "db.version()" &> /dev/null 2>&1; then
    if [ -f "medical_mongodb_analytics.py" ]; then
        echo "Would you like to run sample analytics? (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            $PYTHON_CMD medical_mongodb_analytics.py
        fi
    fi
fi

# Summary
echo -e "\n================================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "================================================"
echo ""
echo "Generated files:"
echo "  • medical_database/patients.json ($num_patients patients)"
echo "  • medical_database/visits.json"
echo "  • medical_database/lab_results.json"
echo ""

if [ "$MONGO_RUNNING" = true ]; then
    echo "MongoDB Database:"
    echo "  • Database: medical"
    echo "  • Collections: patients, visits, lab_results"
    echo ""
    echo "Try these commands:"
    echo "  mongosh medical"
    echo "  > db.patients.findOne()"
    echo "  > db.patients.countDocuments()"
    echo ""
fi

echo "Next steps:"
echo "  1. Review README_medical_database.md for documentation"
echo "  2. Explore the data with MongoDB Compass or mongosh"
echo "  3. Run analytics: python medical_mongodb_analytics.py"
echo ""
echo "================================================"
