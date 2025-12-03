# MongoDB Setup Guide with mongosh

This guide explains how to set up and use MongoDB with the modern `mongosh`.

## Prerequisites

1. **MongoDB Server**:
   - Local MongoDB installation
   - Or MongoDB Atlas (cloud)

2. **MongoDB Shell (mongosh)**:
   - Download from: [mongosh download page](https://www.mongodb.com/try/download/shell)

3. **MongoDB Compass download** (for import/export):
   - Download from: [MongoDB Compass download page](https://www.mongodb.com/try/download/compass)

## Installation

### Windows

1. Download and install MongoDB Community Server
2. Download and install MongoDB Shell (mongosh) separately
3. Download and install MongoDB Database Tools
4. Add all three to your PATH environment variable

### macOS

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew install mongosh
brew install mongodb-database-tools
```

### Linux (Ubuntu/Debian)

```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org mongodb-mongosh mongodb-database-tools
```


## Setup Methods

### Method 1: Using the Setup Script (Recommended)

We provide automated setup scripts for both Windows and Unix systems:

#### Windows
```cmd
cd labs/lab01_intro
setup_database.bat
```

#### Linux/macOS
```bash
cd labs/lab01_intro
chmod +x setup_database.sh
./setup_database.sh
```

### Method 2: Using mongoimport

```bash
# Navigate to lab directory
cd labs/lab01_intro

# Import data using mongoimport
mongoimport --db lab01_student \
            --collection customers \
            --file sample.json \
            --jsonArray

# With authentication (if needed)
mongoimport --host localhost \
            --port 27017 \
            --username yourUsername \
            --password yourPassword \
            --authenticationDatabase admin \
            --db lab01_student \
            --collection customers \
            --file sample.json \
            --jsonArray
```

### Method 3: Using mongosh Script

```bash
# Connect to MongoDB
mongosh

# Run the import script
load('import_data.js')
```

Or run directly from command line:
```bash
mongosh --file import_data.js
```

## Verification

After setup, verify your installation:

```javascript
// Connect to MongoDB
mongosh

// Switch to database
use lab01_student

// Check document count
db.customers.countDocuments()  // Should return 5

// View sample data
db.customers.find().pretty()

// Check indexes
db.customers.getIndexes()
```

## Running Queries

### Interactive Mode

```javascript
// Connect and switch to database
mongosh
use lab01_student

// Load and run queries
load('queries.js')
```

### Script Mode

```bash
# Run queries directly
mongosh lab01_student --file queries.js

# Or with authentication
mongosh -u yourUsername -p yourPassword --authenticationDatabase admin lab01_student --file queries.js
```

### Individual Queries

You can also copy and paste queries from `queries.js` directly into the mongosh shell.

## Key Differences: mongosh vs mongo

| Feature | Old (mongo) | New (mongosh) |
|---------|------------|---------------|
| **Syntax Highlighting** | No | Yes |
| **Autocomplete** | Basic | Advanced |
| **Error Messages** | Basic | Detailed |
| **Node.js Integration** | No | Yes |
| **Async/Await** | No | Yes |
| **npm Packages** | No | Yes |

### New Features in mongosh

1. **Better Output Formatting**
   ```javascript
   // Automatically formats output
   db.customers.find()
   ```

2. **Improved Scripting**
   ```javascript
   // Can use modern JavaScript
   const results = await db.customers.find().toArray();
   console.log(results.length);
   ```

3. **Better Error Messages**
   ```javascript
   // Clear error messages with suggestions
   db.customers.fnd()  // Typo - will suggest 'find()'
   ```

## Troubleshooting

### Connection Issues

```bash
# Test connection
mongosh --eval "db.version()"

# Check if MongoDB is running
# Windows
sc query MongoDB

# Linux/macOS
systemctl status mongod
# or
ps aux | grep mongod
```

### Permission Issues

```bash
# Connect with authentication
mongosh -u yourUsername -p yourPassword --authenticationDatabase admin

# Create a user for the database
use lab01_student
db.createUser({
  user: "labuser",
  pwd: "labpassword",
  roles: [{ role: "readWrite", db: "lab01_student" }]
})
```

### Import Issues

```bash
# Check if mongoimport is installed
mongoimport --version

# Use absolute path if needed
mongoimport --db lab01_student \
            --collection customers \
            --file /full/path/to/sample.json \
            --jsonArray
```

## Additional Resources

- [mongosh Documentation](https://docs.mongodb.com/mongodb-shell/)
- [mongosh vs mongo Comparison](https://docs.mongodb.com/mongodb-shell/mongosh-vs-mongo/)
- [MongoDB CRUD Operations](https://docs.mongodb.com/manual/crud/)
- [MongoDB University Free Courses](https://university.mongodb.com/)

## Next Steps

After successful setup:

1. Complete the queries in `queries.js`
2. Experiment with the aggregation pipeline
3. Try creating custom indexes
4. Explore the MongoDB documentation for advanced features