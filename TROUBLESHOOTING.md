# MongoDB Troubleshooting Guide

This guide covers common MongoDB issues encountered in the labs and their solutions.

## Table of Contents

1. [Connection Issues](#connection-issues)
2. [Docker Issues](#docker-issues)
3. [Query Problems](#query-problems)
4. [Performance Issues](#performance-issues)
5. [Replication Issues](#replication-issues)
6. [Data Import/Export Issues](#data-importexport-issues)
7. [Authentication Issues](#authentication-issues)
8. [Common Error Messages](#common-error-messages)

---

## Connection Issues

### Problem: Cannot connect to MongoDB

**Error:** `MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017`

**Solutions:**

1. Check if MongoDB is running:

   ```bash
   # Docker
   docker ps | grep mongodb

   # Local installation
   sudo systemctl status mongod  # Linux
   brew services list | grep mongodb  # macOS
   net start MongoDB  # Windows
   ```

2. Start MongoDB if not running:

   ```bash
   # Docker
   docker-compose up -d

   # Local
   sudo systemctl start mongod  # Linux
   brew services start mongodb-community  # macOS
   net start MongoDB  # Windows
   ```

3. Check if port 27017 is in use:

   ```bash
   # Linux/macOS
   lsof -i :27017

   # Windows
   netstat -an | findstr :27017
   ```

### Problem: Connection timeout

**Error:** `MongoServerSelectionError: Server selection timed out after 30000 ms`

**Solutions:**

1. Check firewall settings - ensure port 27017 is open
2. For Docker, check container network:
   ```bash
   docker network ls
   docker network inspect nosql-labs-network
   ```
3. Use correct connection string:

   ```javascript
   // Local
   mongodb://localhost:27017/nosql_labs

   // Docker from host
   mongodb://labuser:labpass123@localhost:27017/nosql_labs

   // Docker container to container
   mongodb://labuser:labpass123@mongodb:27017/nosql_labs
   ```

### Problem: Connection refused in VS Code MongoDB extension

**Solutions:**

1. Use the full connection string with credentials:
   ```
   mongodb://labuser:labpass123@localhost:27017/nosql_labs?authSource=nosql_labs
   ```
2. Try connecting without authentication first to test:
   ```
   mongodb://localhost:27017
   ```

---

## Docker Issues

### Problem: Docker daemon not running

**Error:** `Cannot connect to the Docker daemon`

**Solutions:**

1. Start Docker Desktop (Windows/macOS)
2. Linux: Start Docker service:
   ```bash
   sudo systemctl start docker
   ```

### Problem: Container keeps restarting

**Solutions:**

1. Check logs:
   ```bash
   docker logs nosql-labs-mongodb
   ```
2. Common causes:
   - Insufficient disk space
   - Port already in use
   - Corrupted data volume

3. Reset completely:
   ```bash
   docker-compose down -v  # Warning: deletes all data
   docker-compose up -d
   ```

### Problem: "No space left on device"

**Solutions:**

1. Clean up Docker:
   ```bash
   docker system prune -a --volumes
   ```
2. Check disk space:
   ```bash
   df -h  # Linux/macOS
   ```
3. Increase Docker disk allocation in Docker Desktop settings

### Problem: Container network issues

**Solutions:**

1. Recreate network:
   ```bash
   docker-compose down
   docker network prune
   docker-compose up -d
   ```

---

## Query Problems

### Problem: Query returns no results but data exists

**Common Causes:**

1. **Wrong database selected:**

   ```javascript
   // Ensure you're in the right database
   use nosql_labs
   db.collection.find()
   ```

2. **Case sensitivity:**

   ```javascript
   // Wrong
   db.collection.find({ name: "john" });

   // Correct (if stored as "John")
   db.collection.find({ name: "John" });

   // Case-insensitive
   db.collection.find({ name: /john/i });
   ```

3. **Type mismatch:**
   ```javascript
   // If age is stored as string "25"
   db.collection.find({ age: 25 }); // No results
   db.collection.find({ age: "25" }); // Works
   ```

### Problem: "Unsupported projection option"

**Solution:** Separate query and projection:

```javascript
// Wrong
db.collection.find({ name: "John", age: 1 });

// Correct
db.collection.find({ name: "John" }, { age: 1 });
```

### Problem: Array query not working

**Solutions:**

```javascript
// Find documents where array contains value
db.collection.find({ tags: "mongodb" });

// Find by exact array
db.collection.find({ tags: ["mongodb", "database"] });

// Find by array element
db.collection.find({ "tags.0": "mongodb" });

// Find arrays with specific size
db.collection.find({ tags: { $size: 2 } });
```

---

## Performance Issues

### Problem: Queries running slowly

**Solutions:**

1. **Check indexes:**

   ```javascript
   // List indexes
   db.collection.getIndexes();

   // Create index
   db.collection.createIndex({ field: 1 });

   // Create compound index
   db.collection.createIndex({ field1: 1, field2: -1 });
   ```

2. **Use explain to analyze:**

   ```javascript
   db.collection.find({ field: value }).explain("executionStats");
   ```

3. **Common optimizations:**
   - Add indexes on frequently queried fields
   - Use projection to limit returned fields
   - Limit result set size
   - Avoid $where and JavaScript expressions

### Problem: Out of memory errors

**Solutions:**

1. **Use cursor with batch size:**

   ```javascript
   db.collection.find().batchSize(100);
   ```

2. **Increase memory limits (Docker):**
   ```yaml
   # docker-compose.yml
   services:
     mongodb:
       deploy:
         resources:
           limits:
             memory: 4G
   ```

### Problem: Aggregation pipeline timeout

**Solutions:**

1. **Allow disk use for large aggregations:**

   ```javascript
   db.collection.aggregate(pipeline, { allowDiskUse: true });
   ```

2. **Increase timeout:**
   ```javascript
   db.collection.aggregate(pipeline, { maxTimeMS: 60000 });
   ```

---

## Replication Issues

### Problem: Cannot initialize replica set

**Error:** `"ok" : 0, "errmsg" : "already initialized"`

**Solution:**

```javascript
// Force reconfiguration
rs.reconfig(config, { force: true });
```

### Problem: Member stuck in STARTUP state

**Solutions:**

1. Check connectivity between members:

   ```bash
   docker exec nosql-labs-mongodb-replica-1 ping nosql-labs-mongodb-replica-2
   ```

2. Check replica set status:

   ```javascript
   rs.status();
   ```

3. Restart the stuck member:
   ```bash
   docker-compose restart mongodb-replica-1
   ```

### Problem: Primary election not happening

**Solutions:**

1. Ensure odd number of voting members
2. Check priority settings:
   ```javascript
   cfg = rs.conf();
   cfg.members[0].priority = 2;
   rs.reconfig(cfg);
   ```

---

## Data Import/Export Issues

### Problem: mongoimport fails with authentication

**Solution:**

```bash
# Correct format with auth
mongoimport --uri="mongodb://labuser:labpass123@localhost:27017/nosql_labs?authSource=nosql_labs" \
            --collection=mycollection \
            --file=data.json

# Or specify separately
mongoimport -u labuser -p labpass123 \
            --authenticationDatabase nosql_labs \
            --db nosql_labs \
            --collection mycollection \
            --file data.json
```

### Problem: JSON import fails

**Common Issues:**

1. **Invalid JSON format:**

   ```bash
   # Validate JSON first
   python -m json.tool < data.json
   ```

2. **Array of documents:**

   ```bash
   # Use --jsonArray flag
   mongoimport --collection=test --jsonArray < array.json
   ```

3. **Large files:**
   ```bash
   # Split into smaller chunks
   split -l 10000 large.json chunk_
   ```

---

## Authentication Issues

### Problem: Authentication failed

**Error:** `MongoServerError: Authentication failed`

**Solutions:**

1. **Check credentials:**

   ```javascript
   // Verify user exists
   use admin
   db.system.users.find()
   ```

2. **Create user if missing:**

   ```javascript
   use nosql_labs
   db.createUser({
     user: "labuser",
     pwd: "labpass123",
     roles: [{role: "readWrite", db: "nosql_labs"}]
   })
   ```

3. **Specify authentication database:**
   ```bash
   mongosh -u labuser -p labpass123 --authenticationDatabase nosql_labs
   ```

### Problem: Insufficient privileges

**Solution:**

```javascript
// Grant additional roles
use nosql_labs
db.grantRolesToUser("labuser", [
  {role: "dbAdmin", db: "nosql_labs"}
])
```

---

## Common Error Messages

### `E11000 duplicate key error`

**Cause:** Trying to insert duplicate value in unique index field

**Solution:**

```javascript
// Check for duplicates before insert
db.collection.findOne({ _id: value });

// Or use upsert
db.collection.replaceOne({ _id: value }, document, { upsert: true });
```

### `Document failed validation`

**Cause:** Schema validation rules not met

**Solution:**

```javascript
// Check validation rules
db.getCollectionInfos({ name: "collection" })[0].options.validator;

// Temporarily bypass validation
db.runCommand({
  collMod: "collection",
  validationLevel: "off",
});
```

### `Maximum document size exceeded`

**Cause:** Document larger than 16MB limit

**Solutions:**

1. Use GridFS for large files
2. Split document into multiple documents
3. Store large data in separate collection with reference

### `Too many open connections`

**Solution:**

```javascript
// Check current connections
db.serverStatus().connections;

// In application, use connection pooling
const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
};
```

---

## Quick Diagnostic Commands

### Health Check

```javascript
// Check if MongoDB is responding
db.adminCommand({ ping: 1 });

// Server status
db.serverStatus();

// Current operations
db.currentOp();

// Database stats
db.stats();
```

### Performance Monitoring

```javascript
// Enable profiling
db.setProfilingLevel(2);

// Check slow queries
db.system.profile.find().limit(5).sort({ millis: -1 });

// Collection stats
db.collection.stats();
```

### Clean Up

```javascript
// Compact collection
db.runCommand({ compact: "collection" });

// Repair database (use carefully)
db.repairDatabase();
```

---

## Getting Help

### Resources

1. **MongoDB Documentation:** https://docs.mongodb.com/
2. **MongoDB University:** https://university.mongodb.com/
3. **Stack Overflow:** Tag questions with `mongodb`
4. **MongoDB Forums:** https://www.mongodb.com/community/forums/

### Debugging Tips

1. Always check logs first:

   ```bash
   docker logs nosql-labs-mongodb --tail 50
   ```

2. Use verbose mode for commands:

   ```bash
   mongosh --verbose
   ```

3. Enable debug logging:

   ```javascript
   db.setLogLevel(1);
   ```

4. Test with minimal example:
   - Isolate the problem
   - Create simple test case
   - Verify basic functionality works

### When Asking for Help

Provide:

1. MongoDB version: `db.version()`
2. Error message (complete)
3. Query/command that failed
4. Sample document structure
5. What you've already tried

---

## Prevention Best Practices

1. **Regular Backups:**

   ```bash
   # Automated backup script
   mongodump --uri="mongodb://..." --out=/backup/$(date +%Y%m%d)
   ```

2. **Monitor Resources:**
   - Disk space
   - Memory usage
   - Connection pool

3. **Test in Development:**
   - Always test queries in dev environment
   - Use sample data similar to production

4. **Index Management:**
   - Regular index analysis
   - Remove unused indexes
   - Monitor index usage

5. **Connection Management:**
   - Use connection pooling
   - Close connections properly
   - Set appropriate timeouts

---

_Last updated: December 2025_
