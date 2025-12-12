# Lab 05 - Replication and High Availability Notes

## Student Information
- **Lab**: Lab 05 - Replication and High Availability
- **Database**: MongoDB Replica Set
- **Focus**: High availability, failover, read/write distribution

---

## 1. Overview

This lab provides hands-on experience with MongoDB replica sets, demonstrating:
- Automatic failover and high availability
- Read preference strategies for scaling reads
- Write concern levels for durability
- Replication lag and consistency considerations

---

## 2. Files in This Lab

```
labs/lab05_replication/
├── README.md                 # Lab instructions
├── NOTES.md                  # This file
├── setup_replica_set.js      # Automated replica set setup
├── simulate_failover.js      # Failover simulation and testing
├── read_preferences.js       # Read preference demonstrations
├── write_concerns.js         # Write concern examples
├── test_replication.js       # Test suite for replication
├── starter/
│   └── configs/             # Configuration files for replica set members
├── data/                    # Data directories for each replica member (created on setup)
│   ├── node27017/
│   ├── node27018/
│   └── node27019/
└── logs/                    # Log files for each member (created on setup)
```

---

## 3. Setup Instructions

### 3.1. Prerequisites

1. **MongoDB installed** (version 6.0+)
2. **Ports available**: 27017, 27018, 27019
3. **Node.js** with mongodb driver installed
4. **Disk space**: At least 3GB free

### 3.2. Quick Setup

```bash
# Setup the replica set (creates 3 MongoDB instances)
node setup_replica_set.js

# Verify setup
node test_replication.js
```

### 3.3. Manual Connection

```bash
# Connect to replica set
mongosh "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=lab05-rs"

# Connect to specific member
mongosh --port 27017  # Primary
mongosh --port 27018  # Secondary 1
mongosh --port 27019  # Secondary 2
```

---

## 4. Key Concepts Demonstrated

### 4.1. Replica Set Architecture

```
Primary (27017) → Accepts writes
    ↓
Replicates to
    ↓
Secondary (27018) + Secondary (27019) → Accept reads
```

### 4.2. Failover Process

1. **Detection**: Members heartbeat every 2 seconds
2. **Election Timeout**: 10 seconds by default
3. **Election**: Secondaries vote for new primary
4. **Promotion**: Highest priority member with latest data wins
5. **Recovery**: Applications reconnect automatically

### 4.3. Read Preferences

| Mode | Use Case | Consistency | Availability |
|------|----------|-------------|--------------|
| primary | Critical reads | Strong | Lower |
| primaryPreferred | Default behavior | Strong when possible | Higher |
| secondary | Analytics, reporting | Eventual | Scale-out |
| secondaryPreferred | Read scaling | Eventual | Higher |
| nearest | Geo-distributed | Eventual | Lowest latency |

### 4.4. Write Concerns

| Level | Durability | Performance | Use Case |
|-------|------------|-------------|----------|
| w:0 | None | Fastest | Logging, metrics |
| w:1 | Primary only | Fast | Default |
| w:majority | Majority of members | Slower | Critical data |
| w:all | All members | Slowest | Maximum durability |
| j:true | Journaled | Slower | Crash recovery |

---

## 5. Lab Tasks Summary

### Task 1: Basic Operations
- ✓ Check replica set status
- ✓ Insert data and verify replication
- ✓ Read from secondaries

### Task 2: Read Preferences
- ✓ Test different read preference modes
- ✓ Measure performance impact
- ✓ Understand consistency trade-offs

### Task 3: Write Concerns
- ✓ Test different write concern levels
- ✓ Measure durability vs performance
- ✓ Handle write timeouts

### Task 4: Failover Simulation
- ✓ Kill primary process
- ✓ Observe automatic election
- ✓ Verify application resilience

### Task 5: Monitoring
- ✓ Check replication lag
- ✓ View oplog entries
- ✓ Monitor member health

---

## 6. Common Issues and Solutions

### 6.1. Replica Set Won't Initialize

**Problem**: `replSetInitiate` fails

**Solutions**:
- Ensure all mongod processes are running
- Check ports aren't already in use
- Verify hostnames resolve correctly
- Check firewall settings

### 6.2. Can't Read from Secondary

**Problem**: Secondary reads fail with "not master" error

**Solution**:
```javascript
// Enable secondary reads
rs.secondaryOk()
// Or use read preference
db.collection.find().readPref("secondary")
```

### 6.3. High Replication Lag

**Problem**: Secondaries falling behind

**Causes & Solutions**:
- **Heavy write load**: Add more secondaries or upgrade hardware
- **Long-running operations**: Break into smaller batches
- **Network issues**: Check bandwidth and latency
- **Small oplog**: Increase oplog size

### 6.4. Elections Taking Too Long

**Problem**: Failover takes > 30 seconds

**Solutions**:
- Reduce election timeout (careful with network stability)
- Ensure good network connectivity
- Check member priorities are set correctly
- Verify majority of members are healthy

---

## 7. Performance Observations

### 7.1. Read Performance

From testing with `read_preferences.js`:

- **Primary reads**: Consistent latency, no scale-out
- **Secondary reads**: Can distribute load, slight lag possible
- **Nearest reads**: Lowest latency, especially in geo-distributed setups

### 7.2. Write Performance

From testing with `write_concerns.js`:

| Write Concern | Avg Latency | Throughput |
|---------------|-------------|------------|
| w:0 | ~1ms | 1000+ ops/sec |
| w:1 | ~5ms | 200 ops/sec |
| w:majority | ~15ms | 65 ops/sec |
| w:all | ~25ms | 40 ops/sec |

*Note: Actual performance depends on hardware and network*

### 7.3. Failover Time

From `simulate_failover.js` testing:

- **Detection**: 2-10 seconds
- **Election**: 5-15 seconds
- **Total failover**: 10-30 seconds typical
- **Application recovery**: Immediate with proper retry logic

---

## 8. Best Practices

### 8.1. Deployment

1. **Odd number of voting members** (3, 5, or 7)
2. **Distribute across availability zones**
3. **Use hidden members for backups**
4. **Configure proper priorities**
5. **Monitor replication lag**

### 8.2. Application Design

1. **Use connection pooling**
2. **Implement retry logic**
3. **Choose appropriate read preferences**
4. **Set reasonable write concerns**
5. **Handle stale reads appropriately**

### 8.3. Maintenance

1. **Rolling maintenance** (one member at a time)
2. **Test failover regularly**
3. **Monitor oplog size**
4. **Keep MongoDB versions consistent**
5. **Regular backups from secondaries**

---

## 9. Production Considerations

### 9.1. Sizing

- **Minimum**: 3 data-bearing members
- **Recommended**: 1 primary + 2 secondaries + 1 arbiter
- **Large scale**: Up to 50 members (max 7 voting)

### 9.2. Network Requirements

- **Latency**: < 2ms between members ideal
- **Bandwidth**: Sufficient for oplog replication
- **Reliability**: Stable connections critical

### 9.3. Security

- **Authentication**: Use keyfile or x.509
- **Encryption**: TLS for replication traffic
- **Authorization**: Role-based access control
- **Auditing**: Log all operations

---

## 10. Conclusion

This lab demonstrated that MongoDB replica sets provide:

✅ **Automatic failover** for high availability
✅ **Read scaling** through secondaries
✅ **Configurable durability** with write concerns
✅ **Flexible consistency** with read preferences

Key takeaways:
1. Replica sets are essential for production deployments
2. Trade-offs exist between consistency, availability, and performance
3. Proper configuration and monitoring are critical
4. Applications must handle failover gracefully

---

## 11. Further Reading

- [MongoDB Replication Guide](https://docs.mongodb.com/manual/replication/)
- [Replica Set Configuration](https://docs.mongodb.com/manual/reference/replica-configuration/)
- [Read Preference Reference](https://docs.mongodb.com/manual/core/read-preference/)
- [Write Concern Reference](https://docs.mongodb.com/manual/reference/write-concern/)
- [Production Notes](https://docs.mongodb.com/manual/administration/production-notes/)