# Group 20 – NoSQL Final Project

## Group Information

**Group Number:** 20  
**Project Theme:** Health (Project 4 – Healthcare Patient Records System)  
**Course:** NoSQL Databases

### Team Members

| Name | Student ID |
|------|------------|
| Diogo Pinheiro | 40220098 |
| Samuel Fernandes | 40220214 |

---

## Executive Summary

This project is based on **Suggestion Point 4 – Health**, focusing on the design and implementation of a **Healthcare Patient Records System** using MongoDB. The system aims to model complex medical data while ensuring security, privacy, auditability, and performance, following healthcare best practices.

The solution demonstrates advanced NoSQL data modeling, indexing strategies, aggregation queries, and compliance-aware design suitable for healthcare environments.

---

## Problem Statement

Healthcare systems manage highly sensitive and complex data, including patient demographics, clinical encounters, laboratory results, and audit logs. Traditional relational models often struggle with flexibility, scalability, and evolving medical schemas.

The goal of this project is to design a MongoDB-based solution that:
- Efficiently stores patient and clinical data
- Supports complex medical queries and analytics
- Enforces access control and audit logging
- Scales with growing data volume

---

## Requirements

- Design a flexible NoSQL data model for healthcare records
- Implement patient, encounter, lab, and audit collections
- Support complex aggregation queries
- Apply indexing strategies for performance
- Address security and privacy considerations

---

## Solution Architecture

### Data Model Design

The system is composed of the following main collections:

- **Patients** – demographic and medical history data
- **Clinical Encounters** – visits, diagnoses, and treatment plans
- **Lab Results** – structured laboratory test data
- **Providers** – healthcare professionals
- **Audit Logs** – complete access and change history

Embedding is used for tightly related data (e.g., patient allergies), while referencing is used for high-growth or shared entities (e.g., encounters and labs).

---

## Implementation

### Setup Instructions

```bash
# Install dependencies
npm install

# Seed the database
node seed.js

# Run queries
node queries.js
```

---

## Core Queries

### Example Query – Patient Summary

Retrieves a patient profile with recent clinical encounters and lab results using aggregation pipelines.

### Example Query – Population Health Analytics

Aggregates patient data to analyze chronic conditions and lab indicators across the population.

---

## Testing

Testing includes:
- Data validation tests
- Aggregation correctness
- Index usage and performance checks

Performance metrics are collected using MongoDB `explain("executionStats")`.

---

## Challenges and Solutions

**Challenge:** Modeling highly variable medical data  
**Solution:** Use of flexible schemas and embedded documents

**Challenge:** Query performance on large datasets  
**Solution:** Targeted indexing and aggregation optimization

---

## Learning Outcomes

- Practical experience with healthcare-oriented NoSQL modeling
- Advanced MongoDB aggregation pipelines
- Understanding of security and audit requirements in sensitive domains

---

## Future Improvements

- Add role-based access control enforcement
- Extend analytics for population health metrics
- Implement data encryption at field level

---

## Declaration

We declare that this project is our own work and complies with academic integrity guidelines.

**Group 20**

