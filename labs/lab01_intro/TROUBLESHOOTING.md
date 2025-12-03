# Troubleshooting Guide for Lab01 with mongosh

## Common Issues and Solutions

### Issue 1: "SyntaxError: Missing semicolon" when running mongosh commands

**Problem:**
```
> mongosh --file import_data.js
SyntaxError: Missing semicolon. (1:10)
```

**Cause:** You're trying to run a terminal command from within the mongosh shell.

**Solution:**
- If you see a prompt like `test>` or `lab01_student>`, you're inside mongosh
- Type `exit` to leave mongosh
- Run the command from your regular terminal/command prompt

**Correct usage:**
```bash
# From terminal (NOT from within mongosh)
cd labs/lab01_intro
mongosh --file import_data.js
```

### Issue 2: "use lab01_student" doesn't work in script files

**Problem:**
```
SyntaxError: Missing semicolon at "use lab01_student"
```

**Cause:** The `use` command is a shell helper that doesn't work in JavaScript files.

**Solution:** Replace with `db.getSiblingDB()`:
```javascript
// Instead of:
use lab01_student

// Use:
db = db.getSiblingDB('lab01_student');
```

### Issue 3: mongoimport not found

**Problem:**
```
mongoimport: command not found
```

**Cause:** MongoDB Database Tools not installed.

**Solution:**
1. Either install MongoDB Database Tools from https://www.mongodb.com/try/download/database-tools
2. OR use the JavaScript import script instead:
   ```bash
   mongosh --file import_data.js
   ```

### Issue 4: Cannot connect to MongoDB

**Problem:**
```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**Cause:** MongoDB server is not running.

**Solution:**
1. Start MongoDB:
   - **Windows:** Check Services for MongoDB
   - **Linux:** `sudo systemctl start mongod`
   - **macOS:** `brew services start mongodb-community`

2. Verify it's running:
   ```bash
   mongosh --eval "db.version()"
   ```

### Issue 5: Duplicate key error when importing

**Problem:**
```
E11000 duplicate key error collection: lab01_student.customers
```

**Cause:** Data already exists with unique constraints (like email).

**Solution:** Clear the collection first:
```javascript
// In mongosh or at the start of your import script
db = db.getSiblingDB('lab01_student');
db.customers.drop();
```

### Issue 6: Scripts run but nothing happens

**Problem:** Script executes but no output or changes visible.

**Cause:** Script might be using wrong database or syntax.

**Solution:** Add debug output:
```javascript
// At the start of your script
db = db.getSiblingDB('lab01_student');
print(`Connected to database: ${db.getName()}`);
print(`Collections: ${db.getCollectionNames()}`);
```

## Quick Verification Steps

### Step 1: Check mongosh is installed
```bash
mongosh --version
```
Expected: Version number (e.g., "2.3.1")

### Step 2: Check MongoDB is running
```bash
mongosh --eval "db.version()"
```
Expected: MongoDB version (e.g., "7.0.0")

### Step 3: Set up the database
```bash
cd labs/lab01_intro
mongosh --file import_data.js
```
Expected: "Database setup completed!" message

### Step 4: Verify the setup
```bash
mongosh --file test_setup.js
```
Expected: "All tests passed successfully!"

### Step 5: Test queries
```bash
mongosh --file test_queries.js
```
Expected: Query results displayed

## Working Commands Reference

### From Terminal/Command Prompt
```bash
# Navigate to lab directory
cd C:\Users\diogo\work_code\nosql-databases-labs\labs\lab01_intro

# Import data
mongosh --file import_data.js

# Run tests
mongosh --file test_setup.js
mongosh --file test_queries.js

# Run queries
mongosh lab01_student --file queries.js

# Quick query test
mongosh --eval "db.getSiblingDB('lab01_student').customers.countDocuments()"
```

### From Within mongosh
```javascript
// Connect to database
use lab01_student
// or
db = db.getSiblingDB('lab01_student')

// Load a script
load('import_data.js')
load('queries.js')

// Run individual queries
db.customers.find()
db.customers.find({ city: "New York" })
db.customers.countDocuments()
```

## File Purposes

- **`import_data.js`** - Sets up database with sample data
- **`queries.js`** - Contains all lab queries (updated for mongosh)
- **`test_setup.js`** - Verifies installation and setup
- **`test_queries.js`** - Tests subset of queries
- **`setup_database.sh`** - Automated setup for Linux/macOS
- **`setup_database.bat`** - Automated setup for Windows

## Still Having Issues?

1. **Clear everything and start fresh:**
   ```javascript
   // In mongosh
   use lab01_student
   db.dropDatabase()
   exit
   ```
   Then run:
   ```bash
   mongosh --file import_data.js
   ```

2. **Check MongoDB logs:**
   - Windows: Check Event Viewer
   - Linux: `sudo journalctl -u mongod -f`
   - macOS: Check `/usr/local/var/log/mongodb/mongo.log`

3. **Verify file paths:**
   - Make sure you're in the correct directory
   - Use `pwd` (Linux/macOS) or `cd` (Windows) to check current directory
   - Use `ls` or `dir` to list files

4. **Try the simplest possible test:**
   ```bash
   mongosh --eval "print('MongoDB is working')"
   ```

If this works, MongoDB and mongosh are properly installed.