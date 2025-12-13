# Lab 02 - Comprehensive Testing Guide

## Overview

Lab 02 now includes a comprehensive testing suite that validates your data modeling implementation from multiple perspectives. This guide explains each test component and how to use them effectively.

## Test Suite Components

### 1. Basic Query Tests (`test_queries.js`)
**Purpose**: Validates that your data model supports all required operations.

**What it tests**:
- Collection existence
- Data presence
- Customer orders queries
- Order items retrieval
- Top products aggregation
- Category filtering
- Index existence
- Data integrity
- Query performance
- Embedded vs referenced design decisions

**Run**: `node test_queries.js`

### 2. Data Integrity Validator (`data_integrity_validator.js`)
**Purpose**: Performs comprehensive data integrity and relationship validation.

**What it tests**:
- Unique constraints (customer IDs, emails, product IDs)
- Referential integrity (orders reference valid customers)
- Data consistency (order totals match item sums)
- Required fields presence
- Data types and formats (email validation, date formats)
- Business rules (positive quantities, valid ratings)
- Modeling decisions (embedded vs referenced)

**Run**: `node data_integrity_validator.js`

**Output**: Creates `validation_report.json` with detailed results

### 3. Performance Benchmarks (`performance_benchmarks.js`)
**Purpose**: Measures query performance and identifies optimization opportunities.

**What it tests**:
- Simple indexed queries (< 10ms target)
- Aggregation queries (< 50ms target)
- Complex queries (< 100ms target)
- Query plan analysis (index usage)
- Batch operations performance

**Run**: `node performance_benchmarks.js`

**Output**: Creates `benchmark_results.json` with timing statistics

### 4. Integration Tests (`integration_tests.js`)
**Purpose**: Validates deliverables and overall lab completion.

**What it tests**:
- Required files existence (model.md, queries.md, NOTES.md)
- Optional files (examples/, BASIC_EXERCISES.md)
- Model document content
- Query implementations
- Index coverage
- Lab completion assessment

**Run**: `node integration_tests.js`

**Output**: Creates `integration_test_report.json` with completion status

### 5. Validation Schemas (`validation_schemas.js`)
**Purpose**: Applies and tests MongoDB JSON Schema validation rules.

**Features**:
- Customer schema (email format, address structure)
- Product schema (price ranges, stock quantities)
- Order schema (item validation, status enum)
- Review schema (rating constraints)
- Cart schema (TTL support)

**Apply schemas**: `node validation_schemas.js`

**Test validation**: `node validation_schemas.js --test`

### 6. Modeling Scenarios (`examples/modeling_scenarios.js`)
**Purpose**: Provides practical examples of different modeling patterns.

**Examples included**:
- Embedding vs Referencing patterns
- Product variations (Attribute Pattern)
- Review handling (Subset Pattern)
- Shopping cart implementation
- Inventory tracking (Bucketing Pattern)
- Pre-aggregated analytics
- Hierarchical data (categories)
- Multi-tenant patterns

## Running All Tests

### Comprehensive Test Runner (`run_all_tests.js`)

Run all test suites in sequence with a single command:

```bash
# Run all tests
node run_all_tests.js

# Run only required tests (quick mode)
node run_all_tests.js --quick

# Skip performance benchmarks
node run_all_tests.js --skip-benchmarks

# Continue even if tests fail
node run_all_tests.js --continue
```

**Output**: Creates `test_summary_report.json` with overall results

## Performance Thresholds

The test suite uses the following performance thresholds:

- **Simple queries**: < 10ms
- **Aggregation queries**: < 50ms
- **Complex queries**: < 100ms
- **Batch operations**: < 500ms

## Data Model Requirements

Your implementation should meet these requirements to pass all tests:

### Collections Structure

1. **customers**
   - Unique customer_id and email
   - Embedded address
   - Optional order_summary for pre-aggregation

2. **products**
   - Unique product_id
   - Category field indexed
   - Ratings summary (not full reviews)

3. **orders**
   - References customer_id
   - Embedded items array with denormalized product data
   - Calculated total_amount

4. **reviews**
   - Separate collection (not embedded in products)
   - References product_id and customer_id
   - Rating between 1-5

### Required Indexes

- customers: customer_id, email
- products: product_id, category
- orders: order_id, customer_id
- reviews: product_id

## Troubleshooting

### Common Issues

1. **"Collection not found" errors**
   - Ensure you've run `import_data.js` first
   - Check database name matches `lab02_ecommerce`

2. **Performance test failures**
   - Add appropriate indexes
   - Consider denormalizing frequently accessed data
   - Use aggregation pipeline efficiently

3. **Validation failures**
   - Review data types (numbers vs strings)
   - Ensure required fields are present
   - Check referential integrity

4. **Integration test failures**
   - Verify all required files exist
   - Check file content is substantial (not empty)
   - Ensure model.md describes your design decisions

## Best Practices

1. **Run tests incrementally**
   - Start with basic query tests
   - Fix issues before running performance tests
   - Use integration tests to verify completion

2. **Use validation schemas**
   - Apply schemas early in development
   - Helps catch data issues at insert time
   - Documents expected data structure

3. **Monitor performance**
   - Run benchmarks after adding indexes
   - Compare before/after results
   - Use query explain plans

4. **Document your decisions**
   - Explain embedding vs referencing choices in model.md
   - Include index justifications
   - Note any trade-offs made

## Grading Criteria

Tests evaluate your implementation across these dimensions:

- **Correctness** (40%): Queries return expected results
- **Performance** (20%): Queries execute within thresholds
- **Data Integrity** (20%): Consistency and validation rules
- **Design Decisions** (20%): Appropriate use of embedding/referencing

## Getting Help

If tests are failing:

1. Read the specific error messages carefully
2. Check the generated JSON reports for details
3. Review the modeling scenarios examples
4. Consult the main Lab 02 README for requirements
5. Ask for help in office hours or forums

## Summary

The comprehensive test suite ensures your Lab 02 implementation:
- Supports all required queries efficiently
- Maintains data integrity
- Uses appropriate MongoDB patterns
- Performs within acceptable limits
- Includes all required deliverables

Run `node run_all_tests.js` to validate your complete implementation!