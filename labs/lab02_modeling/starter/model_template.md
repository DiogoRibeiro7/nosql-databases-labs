# Lab 02 - Data Modeling for [Your Chosen Scenario]

## 1\. Conceptual Model

### 1.1\. Entities and Attributes

#### **[Entity 1 Name]**

- `[attribute1]` (description)
- `[attribute2]` (description)
- ...

#### **[Entity 2 Name]**

- `[attribute1]` (description)
- `[attribute2]` (description)
- ...

[Add more entities as needed]

### 1.2\. Relationships

1. **[Entity1] → [Entity2]**: [Relationship type and description]
2. **[Entity2] → [Entity3]**: [Relationship type and description] [Add more relationships as needed]

### 1.3\. Conceptual Diagram

[Draw or describe your conceptual model here]

--------------------------------------------------------------------------------

## 2\. NoSQL Logical Model (MongoDB)

### 2.1\. Collection: `[collection_name_1]`

**Strategy**: [Explain your approach - single collection, embedded docs, etc.]

**Reasoning**:

- [Why this approach?]
- [What are the benefits?]
- [What trade-offs are you accepting?]

**Example Document**:

```json
{
  // Add your example document structure here
}
```

**Required Fields**: [List required fields]

**Indexes**:

- [Index 1 description and purpose]
- [Index 2 description and purpose]

### 2.2\. Collection: `[collection_name_2]`

[Repeat the same structure for each collection]

--------------------------------------------------------------------------------

## 3\. Embedding vs Referencing Decisions

### 3.1\. Summary Table

Relationship     | Strategy                      | Reasoning
---------------- | ----------------------------- | ---------
[Relationship 1] | [Embed/Reference/Denormalize] | [Why?]
[Relationship 2] | [Embed/Reference/Denormalize] | [Why?]
...              | ...                           | ...

### 3.2\. Detailed Justification

[Explain your decisions in detail]

--------------------------------------------------------------------------------

## 4\. Trade-offs and Considerations

### 4.1\. Advantages of This Model

1. [Advantage 1]
2. [Advantage 2]
3. ...

### 4.2\. Disadvantages and Mitigations

Issue     | Mitigation
--------- | ------------------
[Issue 1] | [How to handle it]
[Issue 2] | [How to handle it]
...       | ...

--------------------------------------------------------------------------------

## 5\. Indexes and Performance

### 5.1\. Proposed Indexes

```javascript
// Add your index creation commands here
db.[collection].createIndex({ [field]: 1 });
```

### 5.2\. Trade-offs

[Discuss the benefits and costs of your indexes]

--------------------------------------------------------------------------------

## 6\. Scalability Considerations

### 6.1\. Sharding Strategy

[If applicable, discuss how you would shard your collections]

### 6.2\. Read/Write Patterns

[Discuss the expected read/write patterns and how your model supports them]

--------------------------------------------------------------------------------

## 7\. Conclusion

[Summarize your design decisions and how they support the application requirements]
