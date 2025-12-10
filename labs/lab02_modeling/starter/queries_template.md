# Lab 02 - Sample Queries for [Your Data Model]

This document contains sample queries demonstrating how your data model supports required operations.

--------------------------------------------------------------------------------

## 1\. Given a Customer/User, List Their Recent Orders/Posts

**Requirement**: [Describe what this query needs to do]

### Query (MongoDB Shell)

```javascript
// Add your query here
db.[collection].find(
  { /* query criteria */ }
).sort({ /* sort criteria */ });
```

### How the Model Supports This

- **Collection**: [Which collection(s) are used?]
- **Index Used**: [Which index helps this query?]
- **Efficiency**: [Why is this efficient?]
- **Trade-offs**: [Any trade-offs?]

### Expected Result

```json
// Show example result structure
{
  // ...
}
```

--------------------------------------------------------------------------------

## 2\. Given an Order/Post, Show All Its Items/Comments

**Requirement**: [Describe what this query needs to do]

### Query

```javascript
// Add your query here
```

### How the Model Supports This

- **Collection**: [Which collection(s) are used?]
- **Index Used**: [Which index helps this query?]
- **Efficiency**: [Why is this efficient?]

### Expected Result

```json
// Show example result structure
```

--------------------------------------------------------------------------------

## 3\. List Top N Products/Posts by Metric

**Requirement**: [Describe what this query needs to do]

### Query (Aggregation Pipeline)

```javascript
db.[collection].aggregate([
  // Add your aggregation stages here
  { $match: { /* ... */ } },
  { $group: { /* ... */ } },
  { $sort: { /* ... */ } },
  { $limit: N }
]);
```

### How the Model Supports This

- **Collection**: [Which collection(s) are used?]
- **Pipeline Stages**: [Explain each stage]
- **Efficiency**: [Why is this approach efficient?]

### Expected Result

```json
// Show example result structure
```

--------------------------------------------------------------------------------

## 4\. Search/Filter by Category/Tag

**Requirement**: [Describe what this query needs to do]

### Query

```javascript
// Add your query here
```

### How the Model Supports This

- **Collection**: [Which collection(s) are used?]
- **Indexes Used**: [Which indexes help?]
- **Efficiency**: [Why is this efficient?]

### Expected Result

```json
// Show example result structure
```

--------------------------------------------------------------------------------

## 5\. Additional Queries

### 5.1\. [Additional Query Name]

```javascript
// Add any additional queries that demonstrate your model's capabilities
```

[Explain the query and its purpose]

--------------------------------------------------------------------------------

## 6\. Query Performance Summary

Operation     | Collections   | Indexes Used | Performance
------------- | ------------- | ------------ | --------------------
[Operation 1] | [Collections] | [Indexes]    | [Fast/Moderate/Slow]
[Operation 2] | [Collections] | [Indexes]    | [Fast/Moderate/Slow]
...           | ...           | ...          | ...

--------------------------------------------------------------------------------

## 7\. Conclusion

[Summarize how your data model efficiently supports all required operations]
