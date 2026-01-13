# Lab 02 - Starter Files

This folder contains starter files and sample data for Lab 02 - Data Modeling in NoSQL.

## Contents

- **`data/`** - Sample data files in JSON format
  - `customers.json` - Sample customer documents
  - `products.json` - Sample product documents
  - `orders.json` - Sample order documents
  - `reviews.json` - Sample review documents

- **`model_template.md`** - Template for documenting your data model

- **`queries_template.md`** - Template for documenting your queries

## Getting Started

1. **Choose Your Scenario**

- Option A: E-commerce (customers, products, orders)
- Option B: Content platform (users, posts, comments)
- Option C: Custom (as specified by instructor)

2. **Design Your Model**

- Use `model_template.md` as a starting point
- Document your entity relationships
- Justify embedding vs referencing decisions
- Define collections and indexes

3. **Write Sample Queries**

- Use `queries_template.md` as a starting point
- Write queries for all required operations
- Explain how your model supports each query

4. **Test Your Model**

- Import the sample data using the setup scripts
- Run your queries to verify they work
- Use the test script to validate your design

## Setup Instructions

### Automated Setup (Recommended)

From the `lab02_modeling` directory:

```bash
# Unix/Linux/Mac:
./setup_database.sh

# Windows:
setup_database.bat

# Or using Node.js:
node import_data.js
```

### Manual Setup

1. Start MongoDB
2. Import data files using mongoimport or the provided scripts
3. Create indexes as defined in your model
4. Test your queries

## Submission

When complete, your solution should include:

- Completed `model.md` file
- Completed `queries.md` file
- Any additional documentation in `NOTES.md`

## Tips

- Start with the conceptual model before diving into MongoDB specifics
- Consider your query patterns when deciding on embedding vs referencing
- Test your queries with the sample data to ensure they work
- Document your reasoning for design decisions

Good luck!
