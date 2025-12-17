# ❓ Frequently Asked Questions (FAQ)

## 🚀 Getting Started

### Q: What are the system requirements for these labs?

**A:** You need:

- **OS**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **RAM**: Minimum 4GB, recommended 8GB+
- **Storage**: 10GB free space
- **Software**: Node.js 16+, MongoDB 5.0+, Git
- **Network**: Internet connection for package installation

### Q: Should I use Docker or install MongoDB locally?

**A:**

- **Docker** (Recommended): Consistent environment, easy cleanup, no system changes
- **Local Installation**: Better performance, easier debugging, permanent setup
- **Atlas Cloud**: No installation needed, always available, but requires internet

### Q: How do I know if my setup is correct?

**A:** Run our verification script:

```bash
npm run verify:setup
```

This checks MongoDB connectivity, Node.js version, dependencies, and data files.

---

## 📚 Lab-Specific Questions

### Lab 01: Introduction

### Q: I get "MongoNetworkError: connect ECONNREFUSED"

**A:** MongoDB isn't running. Solutions:

```bash
# Docker users:
docker-compose up -d

# Local installation:
mongod --dbpath /path/to/data

# Windows service:
net start MongoDB
```

### Q: How do I import the sample data?

**A:**

```bash
# Using mongosh:
mongosh lab01_student --file labs/lab01_intro/import_data.js

# Using Node.js:
node labs/lab01_intro/import_data.js
```

### Q: What's the difference between find() and findOne()?

**A:**

- `find()`: Returns a cursor to all matching documents
- `findOne()`: Returns the first matching document or null

```javascript
// Returns cursor (iterate with forEach or toArray)
db.users.find({ age: { $gte: 18 } });

// Returns single document
db.users.findOne({ email: "john@example.com" });
```

### Lab 02: Data Modeling

### Q: When should I embed vs reference?

**A:**

- **Embed when**:
  - Data is accessed together (1:1 or 1:few)
  - Child data doesn't exist without parent
  - Updates are infrequent
- **Reference when**:
  - Data is accessed separately (1:many or many:many)
  - Documents would exceed 16MB
  - Data is shared across multiple parents

### Q: What is the 16MB document size limit?

**A:** MongoDB's maximum BSON document size. If you hit this:

- Use references instead of embedding
- Store large files in GridFS
- Implement the bucket pattern for time-series
- Archive old data to separate collections

### Q: How do I validate my schema design?

**A:** Use JSON Schema validation:

```javascript
db.runCommand({
  collMod: "users",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "name"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        },
      },
    },
  },
});
```

### Lab 03: Advanced Queries

### Q: My queries are slow. How do I optimize them?

**A:**

1. Check query execution with `explain()`:

```javascript
db.collection.find(query).explain("executionStats");
```

2. Create appropriate indexes:

```javascript
db.collection.createIndex({ field1: 1, field2: -1 });
```

3. Use projections to limit returned fields:

```javascript
db.collection.find(query, { name: 1, email: 1 });
```

### Q: What's the difference between $in and $or?

**A:**

- `$in`: Checks if field matches any value in array (single field)
- `$or`: Evaluates multiple conditions (multiple fields)

```javascript
// $in - single field, multiple values
db.users.find({ status: { $in: ["active", "pending"] } });

// $or - multiple conditions
db.users.find({
  $or: [{ age: { $gte: 65 } }, { status: "veteran" }],
});
```

### Lab 04: Aggregation

### Q: Aggregation pipeline runs out of memory

**A:** Solutions:

1. Add `allowDiskUse: true`:

```javascript
db.collection.aggregate(pipeline, { allowDiskUse: true });
```

2. Use `$limit` early in pipeline
3. Add `$match` as first stage to reduce documents
4. Create indexes to support `$sort` operations

### Q: What's the difference between $group and $bucket?

**A:**

- `$group`: Groups by exact values
- `$bucket`: Groups into ranges/bins

```javascript
// $group - exact values
{ $group: { _id: "$category", count: { $sum: 1 } } }

// $bucket - ranges
{
  $bucket: {
    groupBy: "$age",
    boundaries: [0, 18, 35, 65, 100],
    default: "Other"
  }
}
```

### Lab 05: Replication

### Q: How do I initiate a replica set?

**A:**

```javascript
// Start mongod instances with --replSet flag
mongod --replSet rs0 --port 27017 --dbpath /data/rs0-0
mongod --replSet rs0 --port 27018 --dbpath /data/rs0-1
mongod --replSet rs0 --port 27019 --dbpath /data/rs0-2

// Connect to one instance and initiate
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
})
```

### Q: What are read/write concerns?

**A:**

- **Read Concern**: Isolation level for reads
  - `local`: Default, may read uncommitted
  - `majority`: Only committed data
  - `snapshot`: Point-in-time consistency

- **Write Concern**: Acknowledgment level for writes
  - `w: 1`: Primary acknowledges
  - `w: "majority"`: Majority of nodes acknowledge
  - `j: true`: Journaled to disk

---

## 🔧 Common Errors

### Q: "E11000 duplicate key error"

**A:** You're trying to insert a document with a duplicate value for a unique index:

- Check unique indexes: `db.collection.getIndexes()`
- Remove duplicate: `db.collection.deleteOne({ _id: duplicateId })`
- Drop index if not needed: `db.collection.dropIndex("indexName")`

### Q: "MongoServerError: authentication failed"

**A:**

- Check username/password in connection string
- Verify user exists: `db.getUsers()`
- Ensure connecting to correct database
- Check authentication mechanism matches

### Q: "cannot use session when not connected to a replica set"

**A:** Transactions require replica sets:

- Use replica set connection string
- Or convert standalone to single-node replica set:

```javascript
rs.initiate();
```

### Q: "Sort exceeded memory limit"

**A:**

- Create index on sort field
- Use `allowDiskUse: true`
- Reduce result set with `$match`
- Add `$limit` after `$sort`

---

## 🛠️ Development Tips

### Q: How do I debug MongoDB queries?

**A:**

1. Enable profiling:

```javascript
db.setProfilingLevel(2); // Log all operations
db.system.profile.find().limit(5);
```

2. Use explain plans:

```javascript
db.collection.find(query).explain("allPlansExecution");
```

3. Check slow query log:

```javascript
db.currentOp({ secs_running: { $gte: 3 } });
```

### Q: How do I backup my lab data?

**A:**

```bash
# Export specific collection
mongoexport --db=lab01_student --collection=customers --out=customers.json

# Backup entire database
mongodump --db=lab01_student --out=./backup

# Restore from backup
mongorestore --db=lab01_student ./backup/lab01_student
```

### Q: Can I reset a lab and start over?

**A:** Yes, each lab has reset scripts:

```bash
# Reset Lab 01
mongosh --file labs/lab01_intro/reset_database.js

# Or drop and reimport
mongosh lab01_student --eval "db.dropDatabase()"
mongosh lab01_student --file labs/lab01_intro/import_data.js
```

---

## 📊 Performance Questions

### Q: How many indexes should I create?

**A:** Balance is key:

- **Too few**: Slow queries
- **Too many**: Slow writes, increased storage
- **Rule of thumb**: Index fields used in:
  - Frequent queries
  - Sort operations
  - Unique constraints

### Q: What's the overhead of transactions?

**A:**

- ~10-20% performance impact
- Requires replica set
- Holds locks longer
- Use only when necessary for ACID guarantees

### Q: How do I monitor MongoDB performance?

**A:**

```javascript
// Server status
db.serverStatus();

// Database statistics
db.stats();

// Collection statistics
db.collection.stats();

// Current operations
db.currentOp();

// Index usage
db.collection.aggregate([{ $indexStats: {} }]);
```

---

## 🚨 Troubleshooting

### Q: MongoDB won't start

**A:** Check:

1. Port availability: `lsof -i :27017` (Linux/Mac) or `netstat -an | findstr 27017` (Windows)
2. Disk space: `df -h` (Linux/Mac) or check disk properties (Windows)
3. Permissions on data directory
4. Log file for errors: `/var/log/mongodb/mongod.log`

### Q: Connection timeouts

**A:**

- Check firewall rules
- Verify MongoDB is listening: `netstat -an | grep 27017`
- Test with mongosh: `mongosh --host localhost --port 27017`
- Check bind_ip in mongod.conf

### Q: Data not persisting between sessions

**A:**

- Ensure using persistent volume in Docker
- Check write concern: `{ w: 1, j: true }`
- Verify data directory path
- Check for disk space issues

---

## 📚 Learning Resources

### Q: Where can I learn more about MongoDB?

**A:**

- **Official Docs**: [docs.mongodb.com](https://docs.mongodb.com)
- **MongoDB University**: [university.mongodb.com](https://university.mongodb.com)
- **Community Forums**: [mongodb.com/community/forums](https://www.mongodb.com/community/forums)
- **YouTube**: MongoDB official channel
- **Books**: "MongoDB: The Definitive Guide" by Shannon Bradshaw

### Q: How do I prepare for MongoDB certification?

**A:**

1. Complete all labs in this course
2. Take MongoDB University courses (M001, M103, M121)
3. Practice with sample exam questions
4. Build a real project using MongoDB
5. Review the certification study guide

---

## 🤝 Getting Help

### Q: I'm stuck on a lab. Where can I get help?

**A:**

1. **Check Documentation**: Read lab README and this FAQ
2. **Review Solutions**: Look at `exercises/solutions/` after attempting
3. **Ask Peers**: Collaborate in group work folders
4. **Office Hours**: Attend instructor sessions
5. **GitHub Issues**: Report bugs or ask questions
6. **Community**: MongoDB forums and Stack Overflow

### Q: How do I report a bug in the labs?

**A:**

1. Check if already reported: GitHub Issues
2. Create minimal reproduction
3. Include:
   - Lab number and exercise
   - Error message
   - Your code
   - Expected vs actual behavior
   - System information

### Q: Can I contribute improvements?

**A:** Yes! See [CONTRIBUTING.md](../CONTRIBUTING.md):

1. Fork the repository
2. Create feature branch
3. Make improvements
4. Add tests
5. Submit pull request

---

## 🎯 Best Practices

### Q: What are MongoDB naming conventions?

**A:**

- **Databases**: lowercase, no spaces (e.g., `my_database`)
- **Collections**: lowercase, plural (e.g., `users`, `products`)
- **Fields**: camelCase (e.g., `firstName`, `createdAt`)
- **Indexes**: descriptive (e.g., `email_1_createdAt_-1`)

### Q: Should I use ObjectId or custom IDs?

**A:**

- **ObjectId**: Default, contains timestamp, guaranteed unique
- **Custom IDs**: Use when you have natural unique identifier

```javascript
// ObjectId (default)
{ _id: ObjectId("..."), email: "user@example.com" }

// Custom ID
{ _id: "user@example.com", name: "John Doe" }
```

### Q: How do I handle time zones?

**A:**

- Always store as UTC (ISODate)
- Convert to local time in application
- Store timezone separately if needed

```javascript
{
  eventTime: ISODate("2024-01-15T10:30:00Z"),  // UTC
  timezone: "America/New_York"  // For display
}
```

---

_Can't find your answer? Open an issue on GitHub or ask during office hours!_

_Last Updated: December 2024_
