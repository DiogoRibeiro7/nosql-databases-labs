# Extra Labs - Advanced MongoDB Topics

This folder contains three optional advanced labs for students who want to explore deeper MongoDB concepts beyond the core curriculum. These labs are designed for extended courses or self-paced learning.

## Available Extra Labs

### Lab Extra 01: Consistency Patterns & Transactions
**Folder:** `lab_extra_01_transactions/`

**Topics Covered:**
- ACID transactions in MongoDB
- Multi-document transactions
- Read/Write concerns
- Causal consistency
- Saga pattern implementation
- Distributed locks
- Error handling and retry logic

**Prerequisites:** Completion of Labs 1-5, MongoDB 4.0+ with replica set

---

### Lab Extra 02: Sharding & Horizontal Scaling
**Folder:** `lab_extra_02_sharding/`

**Topics Covered:**
- Sharding architecture and components
- Choosing optimal shard keys
- Setting up sharded clusters
- Zone sharding for geo-distribution
- Chunk balancing and migration
- Query routing and optimization
- Monitoring shard distribution

**Prerequisites:** Completion of Labs 1-5, MongoDB 4.4+, Multiple instances or Docker

---

### Lab Extra 03: Indexing Strategies & Advanced Performance
**Folder:** `lab_extra_03_indexing/`

**Topics Covered:**
- All MongoDB index types (single, compound, multikey, text, geo, wildcard)
- Index selection strategies (ESR rule)
- Query optimization with explain plans
- Performance profiling and monitoring
- Text search optimization
- Geospatial queries
- Index maintenance and management

**Prerequisites:** Completion of Labs 1-5, MongoDB 5.0+

---

## Getting Started

**Important:** Before running any JavaScript files, please refer to [FILE_USAGE_GUIDE.md](FILE_USAGE_GUIDE.md) to understand which files should be run with Node.js vs MongoDB Shell (mongosh).

Each lab is self-contained with its own:
- `README.md` - Detailed instructions and exercises
- `package.json` - Node.js dependencies
- Implementation files - Sample code and utilities
- Test files - Validation scripts

### Setup Instructions

1. **Ensure MongoDB is running:**
   ```bash
   # Check if MongoDB is running
   mongosh --eval "db.version()"

   # If not running, start MongoDB service
   # Windows: net start MongoDB
   # Mac: brew services start mongodb-community
   # Linux: sudo systemctl start mongod
   ```

2. **Navigate to the desired lab:**
   ```bash
   cd lab_extra_01_transactions/
   # or
   cd lab_extra_02_sharding/
   # or
   cd lab_extra_03_indexing/
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run setup (if available):**
   ```bash
   npm run setup
   ```

5. **Follow the lab README instructions**

**Note:** All database interaction uses `mongosh` (MongoDB Shell). The term `mongod` only appears when referring to the server process itself.

---

## Learning Path Recommendations

### For Database Administrators:
1. Start with **Lab Extra 03** (Indexing) - Critical for performance
2. Continue with **Lab Extra 02** (Sharding) - Scaling strategies
3. Complete with **Lab Extra 01** (Transactions) - Data consistency

### For Application Developers:
1. Start with **Lab Extra 01** (Transactions) - Application patterns
2. Continue with **Lab Extra 03** (Indexing) - Query optimization
3. Optional: **Lab Extra 02** (Sharding) - Understanding infrastructure

### For Full-Stack Engineers:
Complete all three labs in order (01 → 02 → 03) for comprehensive knowledge

---

## Time Estimates

- **Lab Extra 01:** 3-4 hours (including exercises)
- **Lab Extra 02:** 4-5 hours (cluster setup + exercises)
- **Lab Extra 03:** 3-4 hours (including performance testing)

**Total:** 10-13 hours for all extra labs

---

## Assessment Guidelines

### Lab Extra 01 - Transactions (100 points)
- Transaction implementation: 40 points
- Consistency patterns: 30 points
- Error handling: 20 points
- Saga pattern exercise: 10 points

### Lab Extra 02 - Sharding (100 points)
- Cluster setup: 30 points
- Shard key design: 30 points
- Zone configuration: 20 points
- Performance analysis: 20 points

### Lab Extra 03 - Indexing (100 points)
- Index design: 35 points
- Query optimization: 35 points
- Performance profiling: 20 points
- Text/Geo search: 10 points

---

## Support Resources

### Documentation
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [MongoDB University](https://university.mongodb.com/)
- [MongoDB Developer Center](https://www.mongodb.com/developer/)

### Community
- [MongoDB Community Forums](https://www.mongodb.com/community/forums/)

---

## Feedback & Collaboration

- Log suggestions or issues for any extra lab via [GitHub Issues](https://github.com/diogoribeiro7/nosql-databases-labs/issues) and tag them with `lab_extra`.
- Use the [Discussions tab](https://github.com/diogoribeiro7/nosql-databases-labs/discussions) to share lessons learned, environment tips, or questions so others can jump in.

Please search existing threads before opening new ones to keep the history tidy.
- [Stack Overflow - MongoDB](https://stackoverflow.com/questions/tagged/mongodb)

### Tools
- [MongoDB Compass](https://www.mongodb.com/products/compass) - GUI for MongoDB
- [Studio 3T](https://studio3t.com/) - Advanced MongoDB IDE
- [Robo 3T](https://robomongo.org/) - Lightweight MongoDB GUI

---

## Contributing

To contribute improvements or corrections to these labs:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## License

These labs are provided as educational material under the MIT License.
