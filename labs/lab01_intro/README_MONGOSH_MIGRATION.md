# Lab01 Migration to mongosh - Summary

## What Was Fixed

This lab has been fully updated to use `mongosh` (MongoDB Shell) instead of the deprecated `mongo` shell command.

## Changes Made

### 1. New Files Created

- **`setup_database.sh`** - Automated setup script for Linux/macOS
- **`setup_database.bat`** - Automated setup script for Windows
- **`import_data.js`** - mongosh-compatible import script that can be run directly
- **`test_setup.js`** - Verification script to test the setup
- **`SETUP_MONGOSH.md`** - Comprehensive guide for using mongosh

### 2. Files Updated

- **`README.md`** - Updated to reference `mongosh` instead of `mongo`
- **`NOTES.md`** - Updated prerequisites and commands to use `mongosh`
- **`queries.js`** - Added comments about mongosh compatibility

## How to Use

### Quick Setup (Recommended)

#### Option 1: Using Setup Scripts

**Windows:**
```cmd
cd labs/lab01_intro
setup_database.bat
```

**Linux/macOS:**
```bash
cd labs/lab01_intro
chmod +x setup_database.sh
./setup_database.sh
```

#### Option 2: Using mongosh Script

```bash
cd labs/lab01_intro
mongosh --file import_data.js
```

### Running Queries

After setup, you can run queries in several ways:

1. **Run all queries at once:**
   ```bash
   mongosh lab01_student --file queries.js
   ```

2. **Interactive mode:**
   ```bash
   mongosh
   use lab01_student
   load('labs/lab01_intro/queries.js')
   ```

3. **Copy and paste individual queries:**
   - Open `queries.js` in an editor
   - Copy queries you want to run
   - Paste them into mongosh shell

### Verify Setup

To verify everything is working:

```bash
cd labs/lab01_intro
mongosh --file test_setup.js
```

## Key Differences from Old Setup

| Old (mongo) | New (mongosh) |
|------------|---------------|
| `mongo --version` | `mongosh --version` |
| `mongo lab01_student` | `mongosh lab01_student` |
| Basic JavaScript | Modern JavaScript with async/await |
| Limited autocomplete | Advanced autocomplete |
| Basic error messages | Detailed error messages with suggestions |

## Troubleshooting

### If mongoimport is not available

Use the `import_data.js` script instead:
```bash
mongosh --file import_data.js
```

This script includes the data directly and doesn't require mongoimport.

### If MongoDB is not running

**Local Installation:**
- Windows: Check Services for MongoDB
- Linux: `sudo systemctl start mongod`
- macOS: `brew services start mongodb-community`

### Connection Issues

Test connection:
```bash
mongosh --eval "db.version()"
```

If this fails, ensure:
1. MongoDB is running
2. Port 27017 is not blocked
3. No authentication is required (or provide credentials)

## Benefits of mongosh

1. **Modern JavaScript Support** - Use ES6+ features, async/await
2. **Better Error Messages** - Clear, actionable error messages
3. **Improved Scripting** - Better script execution and debugging
4. **Node.js Integration** - Can use npm packages
5. **Active Development** - Regular updates and new features

## Next Steps

1. Complete the lab exercises in `queries.js`
2. Experiment with mongosh features like async/await
3. Try the aggregation pipeline examples
4. Create custom indexes and test performance

## Resources

- [mongosh Documentation](https://www.mongodb.com/docs/mongodb-shell/)
- [Migration Guide](https://www.mongodb.com/docs/mongodb-shell/mongosh-vs-mongo/)
- [CRUD Operations](https://www.mongodb.com/docs/manual/crud/)

---

*Note: The `mongo` shell was deprecated in MongoDB 5.0 and removed in MongoDB 6.0. All new projects should use `mongosh`.*