# 🚀 MongoDB NoSQL Labs - Setup Guide

Choose your setup path based on your experience level and environment preferences.

## 🎯 Quick Decision Tree

```mermaid
graph TD
    Start[Start Setup] --> Q1{Experience Level?}
    Q1 -->|Beginner| Docker[Use Docker]
    Q1 -->|Intermediate| Q2{Have MongoDB?}
    Q1 -->|Advanced| Custom[Custom Setup]

    Q2 -->|Yes| Local[Use Local MongoDB]
    Q2 -->|No| Q3{Install MongoDB?}

    Q3 -->|Yes| Install[Install Locally]
    Q3 -->|No| Atlas[Use MongoDB Atlas]

    Docker --> DockerSetup[Docker Setup Instructions]
    Local --> LocalSetup[Local Setup Instructions]
    Install --> InstallSetup[Installation Instructions]
    Atlas --> AtlasSetup[Atlas Setup Instructions]
    Custom --> CustomSetup[Advanced Setup Options]
```

---

## 🐳 Option 1: Docker Setup (Recommended for Beginners)

**Time Required**: 10 minutes
**Difficulty**: Easy
**Best For**: Quick start, consistent environment, easy cleanup

### Prerequisites

- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- 4GB RAM available for Docker
- 5GB disk space

### Step-by-Step Instructions

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/nosql-databases-labs.git
cd nosql-databases-labs
```

#### 2. Copy Environment Template

```bash
cp .env.template .env
# Edit .env if needed (usually not required for Docker)
```

#### 3. Start MongoDB Container

```bash
docker-compose up -d
```

#### 4. Verify Connection

```bash
docker exec -it mongodb-labs mongosh --eval "db.version()"
```

#### 5. Install Dependencies

```bash
npm install
```

#### 6. Run Setup Verification

```bash
npm run verify:setup
```

#### 7. Import Sample Data

```bash
docker exec -it mongodb-labs mongosh lab01_student --file /app/labs/lab01_intro/import_data.js
```

### Docker Commands Reference

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f mongodb

# Access MongoDB shell
docker exec -it mongodb-labs mongosh

# Remove everything (including data)
docker-compose down -v
```

---

## 💻 Option 2: Local MongoDB Installation

**Time Required**: 20 minutes
**Difficulty**: Medium
**Best For**: Better performance, permanent setup, debugging

### Windows Installation

#### 1. Download MongoDB

- Visit [MongoDB Download Center](https://www.mongodb.com/try/download/community)
- Download MongoDB Community Server (MSI installer)
- Download MongoDB Shell separately

#### 2. Install MongoDB

```powershell
# Run installer as Administrator
# Choose "Complete" installation
# Install as Windows Service (recommended)

# Verify installation
mongod --version
mongosh --version
```

#### 3. Set Environment Variables

```powershell
# Add to System PATH:
# C:\Program Files\MongoDB\Server\7.0\bin
# C:\Program Files\MongoDB\Tools\100\bin
```

#### 4. Create Data Directory

```powershell
mkdir C:\data\db
```

#### 5. Start MongoDB

```powershell
# If installed as service (automatic)
net start MongoDB

# Or manually
mongod --dbpath C:\data\db
```

### macOS Installation

#### 1. Install with Homebrew

```bash
# Install Homebrew if needed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add MongoDB tap
brew tap mongodb/brew

# Install MongoDB
brew install mongodb-community

# Install MongoDB Shell
brew install mongosh
```

#### 2. Start MongoDB

```bash
# Start as service
brew services start mongodb-community

# Or manually
mongod --config /usr/local/etc/mongod.conf
```

### Linux Installation (Ubuntu/Debian)

#### 1. Import MongoDB GPG Key

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
```

#### 2. Add MongoDB Repository

```bash
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
```

#### 3. Install MongoDB

```bash
sudo apt update
sudo apt install -y mongodb-org
```

#### 4. Start MongoDB

```bash
sudo systemctl start mongod
sudo systemctl enable mongod  # Auto-start on boot
```

### Verification for All Operating Systems

```bash
# Check MongoDB is running
mongosh --eval "db.version()"

# Clone repository
git clone https://github.com/your-username/nosql-databases-labs.git
cd nosql-databases-labs

# Install dependencies
npm install

# Copy environment file
cp .env.template .env

# Run verification
npm run verify:setup
```

---

## ☁️ Option 3: MongoDB Atlas (Cloud)

**Time Required**: 15 minutes
**Difficulty**: Easy
**Best For**: No installation, always available, collaboration

### Step-by-Step Atlas Setup

#### 1. Create Atlas Account

- Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Sign up for free account
- Verify email

#### 2. Create Cluster

```
1. Click "Build a Cluster"
2. Choose "Shared" (Free tier)
3. Select cloud provider (AWS recommended)
4. Select region closest to you
5. Name cluster: "nosql-labs"
6. Click "Create Cluster" (takes 3-5 minutes)
```

#### 3. Configure Security

##### Database User

```
1. Go to "Database Access"
2. Click "Add New Database User"
3. Username: labuser
4. Password: (generate secure password)
5. Role: "Read and write to any database"
6. Click "Add User"
```

##### Network Access

```
1. Go to "Network Access"
2. Click "Add IP Address"
3. For labs: "Allow Access from Anywhere" (0.0.0.0/0)
   (Note: For production, use specific IPs)
4. Click "Confirm"
```

#### 4. Get Connection String

```
1. Go to "Clusters"
2. Click "Connect"
3. Choose "Connect your application"
4. Copy connection string
5. Replace <password> with your password
```

#### 5. Update Environment

```bash
# Edit .env file
MONGODB_URI=mongodb+srv://labuser:password@nosql-labs.xxxxx.mongodb.net/
MONGODB_DB_NAME=nosql_labs
```

#### 6. Test Connection

```bash
mongosh "mongodb+srv://nosql-labs.xxxxx.mongodb.net/" --username labuser
```

---

## 🔧 Option 4: Advanced Setup Options

### Replica Set Setup (Lab 05)

#### Single Machine Replica Set

```bash
# Create data directories
mkdir -p /data/rs0-0 /data/rs0-1 /data/rs0-2

# Start instances
mongod --replSet rs0 --port 27017 --dbpath /data/rs0-0 --bind_ip localhost &
mongod --replSet rs0 --port 27018 --dbpath /data/rs0-1 --bind_ip localhost &
mongod --replSet rs0 --port 27019 --dbpath /data/rs0-2 --bind_ip localhost &

# Initialize replica set
mongosh --port 27017
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017", priority: 2 },
    { _id: 1, host: "localhost:27018", priority: 1 },
    { _id: 2, host: "localhost:27019", priority: 0 }
  ]
})
```

### Sharded Cluster Setup

```bash
# Config servers
mongod --configsvr --replSet configReplSet --port 27019 --dbpath /data/config &

# Shard servers
mongod --shardsvr --replSet shard1 --port 27018 --dbpath /data/shard1 &

# Router
mongos --configdb configReplSet/localhost:27019 --port 27017 &
```

### WSL2 Setup (Windows)

```bash
# Install WSL2
wsl --install

# Inside WSL2 Ubuntu
sudo apt update
sudo apt install mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Access from Windows
mongosh --host $(hostname).local
```

---

## ✅ Post-Setup Verification

### 1. Run Complete Verification

```bash
npm run verify:setup
```

Expected output:

```
✓ Node.js version v18.0.0 is supported
✓ All critical dependencies installed
✓ MongoDB 7.0.0 is running
✓ All expected data files present
✓ All lab directories present
✓ Environment is ready for MongoDB labs!
```

### 2. Test Basic Operations

```bash
# Connect to MongoDB
mongosh

# In mongosh:
use test_db
db.test.insertOne({ message: "Setup successful!" })
db.test.find()
db.test.drop()
exit
```

### 3. Import Lab Data

```bash
# Import data for Lab 01
mongosh lab01_student --file labs/lab01_intro/import_data.js

# Verify import
mongosh lab01_student --eval "db.customers.countDocuments()"
# Should output: 5
```

### 4. Run Lab Tests

```bash
# Test Lab 01
npm run test:lab01

# Run all lab tests
npm run test:labs
```

---

## 🔥 Common Setup Issues & Solutions

### Issue: "command not found: mongosh"

**Solution**:

```bash
# Reinstall MongoDB Shell
# macOS: brew install mongosh
# Windows: Download from MongoDB website
# Linux: sudo apt install mongodb-mongosh
```

### Issue: "MongoNetworkError: connect ECONNREFUSED"

**Solution**:

```bash
# Start MongoDB service
# macOS: brew services start mongodb-community
# Windows: net start MongoDB
# Linux: sudo systemctl start mongod
# Docker: docker-compose up -d
```

### Issue: "npm install" fails

**Solution**:

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Docker "port already in use"

**Solution**:

```bash
# Find process using port 27017
# Linux/Mac: lsof -i :27017
# Windows: netstat -ano | findstr :27017

# Kill process or change port in docker-compose.yml
```

### Issue: Atlas connection timeout

**Solution**:

1. Check network whitelist (add current IP)
2. Verify username/password
3. Check if cluster is paused (free tier)
4. Try connection string with mongodb:// instead of mongodb+srv://

---

## 🎉 Setup Complete!

### Next Steps

1. **Start with Lab 01**: [Introduction to MongoDB](../labs/lab01_intro/README.md)
2. **Read Theory Primer**: [Document Databases](theory_primers/01_document_databases.md)
3. **Join Community**: Ask questions in GitHub Discussions

### Quick Commands Reference

```bash
# Verify setup
npm run verify:setup

# Start MongoDB (if not using Docker)
mongod  # or: sudo systemctl start mongod

# Access MongoDB Shell
mongosh

# Run tests
npm test

# Get help
npm run help
```

### Environment Variables Reference

Key variables in `.env`:

```bash
MONGODB_URI=mongodb://localhost:27017  # or your Atlas URI
MONGODB_DB_NAME=nosql_labs
NODE_ENV=development
LOG_LEVEL=info
```

---

## 📞 Need Help?

- **Documentation**: [docs/INDEX.md](INDEX.md)
- **FAQ**: [docs/FAQ.md](FAQ.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
- **GitHub Issues**: Report problems or ask questions
- **Office Hours**: See course schedule

---

_Remember: The setup process is a one-time investment. Once complete, you'll have a powerful MongoDB learning environment!_

_Last Updated: December 2024_
