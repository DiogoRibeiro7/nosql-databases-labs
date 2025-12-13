# Data Dictionary - NoSQL Databases Labs

## Overview

This document provides a comprehensive data dictionary for all sample datasets used in the NoSQL Databases Labs repository. Each dataset is documented with its schema, field descriptions, data types, constraints, and usage information.

## Table of Contents

1. [Core Datasets](#core-datasets)
2. [Lab-Specific Datasets](#lab-specific-datasets)
3. [External Datasets](#external-datasets)
4. [Data Types Reference](#data-types-reference)
5. [Version Information](#version-information)

---

## Core Datasets

### 1. Books Collection (`data/datasets/books.json`)

**Description**: Collection of book information including titles, authors, and publication details.

| Field | Type | Description | Constraints | Example |
|-------|------|-------------|-------------|---------|
| _id | ObjectId | Unique identifier | Required, Unique | "507f1f77bcf86cd799439011" |
| title | String | Book title | Required, Max 500 chars | "The Great Gatsby" |
| author | String | Author name | Required | "F. Scott Fitzgerald" |
| isbn | String | ISBN number | Pattern: /^\d{10}(\d{3})?$/ | "9780743273565" |
| pages | Number | Number of pages | Min: 1, Max: 10000 | 180 |
| year | Number | Publication year | Min: 1000, Max: current year | 1925 |
| publisher | String | Publisher name | Max 200 chars | "Scribner" |
| categories | Array[String] | Book categories | Max 10 items | ["Fiction", "Classic"] |
| language | String | Language code | ISO 639-1 | "en" |
| rating | Number | Average rating | Min: 0, Max: 5 | 4.5 |
| stock | Number | Stock quantity | Min: 0 | 15 |

**Indexes**:
- `title` (text index)
- `author` (ascending)
- `isbn` (unique)
- `categories` (multikey)

**Used in Labs**: Lab 01 (Introduction), Lab 03 (Advanced Queries)

---

### 2. Products Collection (`data/datasets/products.json`)

**Description**: E-commerce product catalog with pricing and inventory information.

| Field | Type | Description | Constraints | Example |
|-------|------|-------------|-------------|---------|
| _id | ObjectId | Unique identifier | Required, Unique | "507f1f77bcf86cd799439012" |
| product_id | String | Product SKU | Required, Pattern: /^PROD\d{3,}$/ | "PROD001" |
| name | String | Product name | Required, Max 200 chars | "Wireless Mouse" |
| description | String | Product description | Max 2000 chars | "Ergonomic wireless mouse..." |
| category | String | Product category | Required, Enum | "Electronics" |
| subcategory | String | Product subcategory | Max 100 chars | "Computer Accessories" |
| price | Number | Price in USD | Required, Min: 0.01 | 29.99 |
| cost | Number | Cost in USD | Min: 0 | 15.00 |
| stock_quantity | Number | Available stock | Required, Min: 0 | 150 |
| manufacturer | String | Manufacturer name | Max 100 chars | "TechCorp" |
| tags | Array[String] | Product tags | Max 20 items | ["wireless", "ergonomic"] |
| specifications | Object | Technical specs | Nested object | {"color": "black", "weight": "100g"} |
| ratings | Object | Rating summary | See nested schema | {"average": 4.5, "count": 234} |
| created_at | Date | Creation date | Required | "2024-01-15T10:00:00Z" |
| updated_at | Date | Last update date | Auto-updated | "2024-01-20T15:30:00Z" |

**Nested Schema - Ratings**:
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| average | Number | Average rating | Min: 0, Max: 5 |
| count | Number | Number of ratings | Min: 0 |
| distribution | Object | Rating distribution | {"5": 120, "4": 80, "3": 20, "2": 10, "1": 4} |

**Indexes**:
- `product_id` (unique)
- `category, subcategory` (compound)
- `name` (text)
- `price` (ascending)

**Used in Labs**: Lab 02 (Data Modeling), Lab 04 (Aggregation)

---

### 3. Students Collection (`data/datasets/students.json`)

**Description**: Student records with academic information and grades.

| Field | Type | Description | Constraints | Example |
|-------|------|-------------|-------------|---------|
| _id | ObjectId | Unique identifier | Required, Unique | "507f1f77bcf86cd799439013" |
| student_id | String | Student ID | Required, Pattern: /^STU\d{6}$/ | "STU123456" |
| first_name | String | First name | Required, Max 50 chars | "John" |
| last_name | String | Last name | Required, Max 50 chars | "Doe" |
| email | String | Email address | Required, Email format | "john.doe@university.edu" |
| date_of_birth | Date | Birth date | Required | "2000-05-15" |
| enrollment_date | Date | Enrollment date | Required | "2020-09-01" |
| major | String | Major field | Required, Enum | "Computer Science" |
| year | Number | Academic year | Min: 1, Max: 6 | 3 |
| gpa | Number | Grade point average | Min: 0, Max: 4.0 | 3.75 |
| courses | Array[Object] | Enrolled courses | See nested schema | See below |
| address | Object | Home address | See nested schema | See below |
| status | String | Enrollment status | Enum: ["active", "inactive", "graduated"] | "active" |

**Nested Schema - Courses**:
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| course_id | String | Course identifier | Required |
| name | String | Course name | Required |
| credits | Number | Credit hours | Min: 1, Max: 6 |
| grade | String | Letter grade | Enum: ["A", "B", "C", "D", "F"] |
| semester | String | Semester taken | Pattern: /^(Fall|Spring|Summer) \d{4}$/ |

**Indexes**:
- `student_id` (unique)
- `email` (unique)
- `last_name, first_name` (compound)
- `major` (ascending)

**Used in Labs**: Lab 03 (Advanced Queries), Lab 04 (Aggregation)

---

### 4. Companies Collection (`data/datasets/companies.json`)

**Description**: Company information for business analytics.

| Field | Type | Description | Constraints | Example |
|-------|------|-------------|-------------|---------|
| _id | ObjectId | Unique identifier | Required, Unique | "507f1f77bcf86cd799439014" |
| name | String | Company name | Required, Max 200 chars | "Tech Innovations Inc" |
| founded_year | Number | Year founded | Min: 1800, Max: current year | 2010 |
| industry | String | Industry sector | Required, Enum | "Technology" |
| employees | Number | Number of employees | Min: 1 | 5000 |
| revenue | Number | Annual revenue (USD) | Min: 0 | 50000000 |
| headquarters | Object | HQ location | See nested schema | See below |
| website | String | Company website | URL format | "https://techinnovations.com" |
| stock_symbol | String | Stock ticker | Pattern: /^[A-Z]{1,5}$/ | "TECH" |
| subsidiaries | Array[String] | Subsidiary companies | Max 50 items | ["TechLabs", "InnoSoft"] |
| founded_by | Array[String] | Founders | Max 10 items | ["Jane Smith", "Bob Johnson"] |

**Nested Schema - Headquarters**:
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| city | String | City name | Required |
| state | String | State/Province | Max 100 chars |
| country | String | Country name | Required |
| coordinates | Object | GPS coordinates | {"lat": Number, "lng": Number} |

**Used in Labs**: Lab 04 (Aggregation), Lab 05 (Replication)

---

## Lab-Specific Datasets

### 5. Orders Collection (`labs/lab02_modeling/starter/data/orders.json`)

**Description**: E-commerce order data for modeling exercises.

| Field | Type | Description | Constraints | Example |
|-------|------|-------------|-------------|---------|
| order_id | String | Order identifier | Required, Pattern: /^ORD\d{3,}$/ | "ORD001" |
| customer_id | String | Customer reference | Required, Pattern: /^CUST\d{3,}$/ | "CUST001" |
| order_date | Date | Order placement date | Required | "2024-01-15T14:30:00Z" |
| status | String | Order status | Enum: ["pending", "processing", "shipped", "delivered", "cancelled"] | "shipped" |
| items | Array[Object] | Order line items | Required, Min 1 item | See nested schema |
| shipping_address | Object | Delivery address | Required | See address schema |
| payment | Object | Payment information | Required | See payment schema |
| subtotal | Number | Subtotal amount | Required, Min: 0 | 99.99 |
| tax_amount | Number | Tax amount | Required, Min: 0 | 10.00 |
| shipping_cost | Number | Shipping cost | Required, Min: 0 | 5.99 |
| total_amount | Number | Total amount | Required, Min: 0.01 | 115.98 |

**Nested Schema - Items**:
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| product_id | String | Product reference | Required |
| product_name | String | Product name (denormalized) | Required |
| quantity | Number | Quantity ordered | Required, Min: 1 |
| unit_price | Number | Price per unit | Required, Min: 0.01 |
| discount | Number | Discount percentage | Min: 0, Max: 100 |

**Used in Labs**: Lab 02 (Data Modeling)

---

### 6. Customers Collection (`labs/lab02_modeling/starter/data/customers.json`)

**Description**: Customer information for e-commerce platform.

| Field | Type | Description | Constraints | Example |
|-------|------|-------------|-------------|---------|
| customer_id | String | Customer identifier | Required, Pattern: /^CUST\d{3,}$/ | "CUST001" |
| name | String | Full name | Required, Max 100 chars | "Alice Johnson" |
| email | String | Email address | Required, Email format, Unique | "alice@example.com" |
| phone | String | Phone number | Pattern: /^\+?[\d\s\-()]+$/ | "+1-555-123-4567" |
| address | Object | Customer address | Required | See address schema |
| registration_date | Date | Account creation date | Required | "2023-01-15T10:00:00Z" |
| last_login | Date | Last login timestamp | Auto-updated | "2024-01-20T09:15:00Z" |
| order_count | Number | Total orders placed | Min: 0 | 15 |
| total_spent | Number | Total amount spent | Min: 0 | 1250.50 |
| loyalty_points | Number | Loyalty program points | Min: 0 | 500 |
| preferences | Object | Customer preferences | Optional | {"newsletter": true, "sms": false} |

**Used in Labs**: Lab 02 (Data Modeling)

---

## External Datasets

### 7. Crunchbase Companies (`data/crunchbase/crunchbase_database.json`)

**Description**: Startup and company data from Crunchbase.

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| name | String | Company name | Crunchbase |
| permalink | String | Unique URL slug | Crunchbase |
| category_code | String | Industry category | Crunchbase |
| founded_year | Number | Year founded | Crunchbase |
| total_money_raised | String | Funding raised | Crunchbase |
| offices | Array[Object] | Office locations | Crunchbase |
| funding_rounds | Array[Object] | Funding history | Crunchbase |

**License**: Crunchbase Open Data License
**Last Updated**: Check data_versions.json

---

### 8. Enron Email Dataset (`data/enron/enron_messages.json`)

**Description**: Email communications from the Enron investigation.

| Field | Type | Description | Notes |
|-------|------|-------------|-------|
| message_id | String | Unique message ID | Original dataset |
| date | Date | Email timestamp | Parsed from headers |
| from | String | Sender email | Anonymized where needed |
| to | Array[String] | Recipients | May be empty |
| subject | String | Email subject | May contain encoding issues |
| body | String | Email content | Text only |
| folder | String | Mail folder | User's folder structure |

**License**: Public Domain
**Ethical Note**: This dataset is for educational purposes only

---

## Data Types Reference

### Standard MongoDB Types

| Type | Description | Example | JSON Representation |
|------|-------------|---------|---------------------|
| ObjectId | 12-byte identifier | ObjectId("507f1f77bcf86cd799439011") | {"$oid": "507f1f77bcf86cd799439011"} |
| String | UTF-8 string | "Hello World" | "Hello World" |
| Number | 64-bit floating point | 42.5 | 42.5 |
| Boolean | True/False | true | true |
| Date | UTC datetime | ISODate("2024-01-15T10:00:00Z") | {"$date": "2024-01-15T10:00:00Z"} |
| Array | Ordered list | ["a", "b", "c"] | ["a", "b", "c"] |
| Object | Nested document | {"key": "value"} | {"key": "value"} |
| Null | Null value | null | null |

### Common Patterns

**Address Schema**:
```json
{
  "street": "123 Main St",
  "city": "Springfield",
  "state": "IL",
  "zip": "62701",
  "country": "USA"
}
```

**Timestamp Fields**:
- `created_at`: Record creation time (immutable)
- `updated_at`: Last modification time (auto-updated)
- `deleted_at`: Soft deletion timestamp (nullable)

**Status Enums**:
- Orders: `["pending", "processing", "shipped", "delivered", "cancelled"]`
- Users: `["active", "inactive", "suspended", "deleted"]`
- Products: `["available", "out_of_stock", "discontinued"]`

---

## Version Information

### Versioning Scheme

All datasets follow semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Incompatible schema changes
- **MINOR**: Backwards-compatible additions
- **PATCH**: Backwards-compatible fixes

### Freshness Indicators

| Status | Description | Action Required |
|--------|-------------|-----------------|
| ✓ Fresh | Updated within 30 days | None |
| ⚠️ Stale | Not updated for 30+ days | Review for updates |
| ❌ Expired | Past expiration date | Update required |

### Update Tracking

To check the current version and freshness of all datasets:

```bash
node data/data_version_tracker.js --check-freshness
```

To update version tracking after modifying datasets:

```bash
node data/data_version_tracker.js --update
```

---

## Usage Guidelines

### Best Practices

1. **Always validate data** before importing into MongoDB
2. **Check version compatibility** with lab requirements
3. **Use appropriate indexes** based on query patterns
4. **Consider data size** when choosing datasets for exercises
5. **Respect data licenses** and attribution requirements

### Data Import

Standard import command:
```bash
mongoimport --db <database> --collection <collection> --file <path/to/file.json> --jsonArray
```

With validation:
```bash
node scripts/import_with_validation.js --file <path> --collection <name> --validate
```

### Data Export

Standard export command:
```bash
mongoexport --db <database> --collection <collection> --out <path/to/output.json> --jsonArray --pretty
```

---

## Contributing

To add or update dataset documentation:

1. Update this data dictionary with schema information
2. Add validation schema in `data/validation_schemas/`
3. Run version tracking: `node data/data_version_tracker.js --update`
4. Submit PR with changes

---

## License

Individual datasets may have different licenses. Check the specific dataset documentation or metadata files for license information.

---

*Last Updated: 2024-01-20*
*Version: 1.0.0*