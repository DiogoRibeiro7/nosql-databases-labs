# Medical Database - Student Exercises

## NoSQL Databases Course - ESMAD/IPP
**Instructor**: Diogo Ribeiro  
**Database**: Medical Records MongoDB System

---

## 📚 Exercise Set 1: Basic Queries (Week 1)

### 1.1 Patient Searches
Find and return the following:

a) All patients from Porto
```javascript
// Your solution here
```

b) Patients with blood type O- (universal donors)
```javascript
// Your solution here
```

c) Female patients over 65 years old
```javascript
// Your solution here
```

d) Patients allergic to Penicillin
```javascript
// Your solution here
```

### 1.2 Counting and Statistics
Calculate:

a) Total number of patients per city
b) Average age of all patients
c) Count of patients by blood type
d) Number of patients with no chronic conditions

### 1.3 Projection Practice
Write queries that return only:

a) Patient names and birth dates (no other information)
b) Patient ID, allergies, and current medications
c) Contact information for patients in Lisboa

---

## 📊 Exercise Set 2: Complex Queries (Week 2)

### 2.1 Array Operations
Using array operators, find:

a) Patients with MORE than 2 chronic conditions
```javascript
db.patients.find({
    // Your solution using $size or $expr
})
```

b) Patients taking Metformin OR Lisinopril
```javascript
// Use $in operator
```

c) Patients with BOTH Hypertension AND Diabetes
```javascript
// Use $all operator
```

### 2.2 Date Range Queries
Find:

a) Visits in the last 30 days
b) Patients born between 1950 and 1960
c) Lab results from Q1 2024
d) Most recent visit for each department

### 2.3 Regex and Text Search
Implement:

a) Find patients whose last name starts with "S"
b) Search for visits mentioning "chest pain" in symptoms
c) Find all lab results for glucose-related tests

---

## 🔄 Exercise Set 3: Aggregation Pipeline (Week 3)

### 3.1 Basic Aggregation
Create pipelines to:

a) Group visits by department and count them
```javascript
db.visits.aggregate([
    // Your pipeline here
])
```

b) Calculate average age by city
c) Find the most common diagnosis codes
d) List top 5 most prescribed medications

### 3.2 Multi-Stage Pipelines
Build pipelines that:

a) Find the busiest day of the week for each department
```javascript
db.visits.aggregate([
    {$project: {
        dayOfWeek: {$dayOfWeek: "$visit_date"},
        department: 1
    }},
    // Continue...
])
```

b) Calculate monthly trends for emergency visits
c) Find departments with highest average patient age

### 3.3 $lookup Joins
Create aggregations with lookups:

a) Get all visits for a patient with their demographic info
b) Find patients with abnormal lab results and their latest visit
c) Match prescriptions with patient chronic conditions

---

## 🏥 Exercise Set 4: Healthcare Analytics (Week 4)

### 4.1 Risk Assessment
Develop queries to identify:

a) High-risk patients (elderly with 3+ conditions and recent abnormal labs)
```javascript
// Combine multiple collections
```

b) Diabetic patients with poor glucose control (HbA1c > 8)
c) Patients overdue for follow-up (>6 months since last visit)

### 4.2 Population Health
Calculate:

a) Prevalence of each chronic condition by age group
b) Medication adherence (patients with conditions but no matching medications)
c) Geographic distribution of specific conditions

### 4.3 Quality Metrics
Measure:

a) Average time between visit and lab results
b) Percentage of patients with completed immunizations
c) Emergency readmission rate (return within 30 days)

---

## 💡 Exercise Set 5: Optimization (Week 5)

### 5.1 Index Design
Create indexes to optimize:

a) Patient lookup by SNS number
b) Visit searches by date range and department
c) Lab result queries by patient and abnormal flag
d) Full-text search on patient names

**Measure performance before and after indexing using explain()**

### 5.2 Query Optimization
Rewrite these inefficient queries:

a) Inefficient:
```javascript
db.patients.find({
    $where: "this.demographics.age > 65"
})
```
Optimized:
```javascript
// Your solution
```

b) Optimize aggregation pipelines by reordering stages
c) Use covered queries where possible

### 5.3 Schema Design Decisions
Analyze and answer:

a) Should lab results be embedded in visits or kept separate? Why?
b) Design a schema for appointment scheduling
c) How would you handle patient medical images?

---

## 🎯 Mini-Project: Patient Dashboard

### Requirements:
Build a set of aggregation pipelines that create a dashboard showing:

1. **Patient Summary Card**
   - Basic demographics
   - Current medications
   - Next appointment needed
   - Risk score (based on age, conditions, recent labs)

2. **Department Analytics**
   - Visits per department (last 30 days)
   - Average wait time estimate
   - Most common procedures

3. **Population Health Metrics**
   - Disease prevalence chart
   - Age distribution
   - Geographic heat map data

4. **Alerts System**
   - Patients with critical lab values
   - Overdue follow-ups
   - Medication interactions warnings

### Deliverables:
- MongoDB queries/aggregations
- Performance analysis with explain()
- Index strategy documentation
- 1-page report on schema design decisions

---

## 📝 Assignment 1: Data Migration

### Scenario:
The hospital is migrating from a relational database. You need to:

1. Design a migration strategy from this relational schema:
```sql
-- Tables: 
-- patients, doctors, appointments, prescriptions, 
-- lab_tests, lab_results, diagnoses, procedures
```

2. Write transformation scripts to denormalize appropriately
3. Justify embedding vs referencing decisions
4. Create necessary indexes
5. Validate data integrity after migration

### Evaluation Criteria:
- Schema design (40%)
- Query performance (20%)
- Code quality (20%)
- Documentation (20%)

---

## 🏆 Assignment 2: Analytics Pipeline

### Task:
Create a comprehensive analytics system that:

1. **Real-time Monitoring**
   - Current ED occupancy
   - Critical patients count
   - Pending lab results

2. **Predictive Analytics**
   - Identify patients likely to be readmitted
   - Predict peak hours for each department
   - Forecast medication needs

3. **Reporting**
   - Monthly department reports
   - Patient satisfaction metrics
   - Cost analysis per diagnosis

### Technologies:
- MongoDB Aggregation Framework
- MongoDB Change Streams (for real-time)
- Python for analysis
- Optional: Visualization with Plotly/Dash

---

## 🔍 Research Questions

### For Advanced Students:
1. How would you implement audit logging for HIPAA compliance?
2. Design a data archival strategy for records older than 7 years
3. Implement field-level encryption for sensitive data
4. Create a disaster recovery plan with backup strategies
5. Design a multi-tenant schema for multiple hospitals

---

## 📊 Grading Rubric

| Criteria | Excellent (90-100%) | Good (70-89%) | Satisfactory (50-69%) | Needs Improvement (<50%) |
|----------|-------------------|---------------|----------------------|--------------------------|
| **Query Correctness** | All queries return correct results | Most queries correct with minor issues | Some queries work correctly | Many queries have errors |
| **Performance** | Optimized with appropriate indexes | Good performance, some optimization | Functional but slow | Poor performance |
| **Code Quality** | Clean, commented, follows best practices | Readable code with some comments | Basic structure, minimal comments | Poorly organized |
| **Schema Design** | Excellent embedding/referencing decisions | Good design with minor issues | Adequate design | Poor design choices |
| **Documentation** | Comprehensive explanation of decisions | Good documentation | Basic documentation | Insufficient documentation |

---

## 🎓 Learning Objectives

By completing these exercises, students will be able to:

1. ✅ Write complex MongoDB queries using various operators
2. ✅ Design aggregation pipelines for data analysis
3. ✅ Make informed schema design decisions
4. ✅ Optimize query performance with indexes
5. ✅ Apply NoSQL concepts to real-world healthcare scenarios
6. ✅ Understand Portuguese healthcare system data requirements
7. ✅ Handle time-series medical data effectively
8. ✅ Implement privacy-conscious data designs

---

## 💻 Tips for Success

1. **Always test with small datasets first** - Use `.limit(10)` during development
2. **Use explain()** - Understand how MongoDB executes your queries
3. **Think in documents** - Don't try to normalize like SQL
4. **Consider the access patterns** - Design for how data will be queried
5. **Use the aggregation pipeline** - It's more powerful than find()
6. **Remember Portuguese context** - SNS numbers, local cities, etc.
7. **Keep medical logic realistic** - Medications should match conditions

---

## 📚 Additional Resources

- [MongoDB University Healthcare Course](https://university.mongodb.com)
- [MongoDB Manual - Aggregation](https://docs.mongodb.com/manual/aggregation/)
- [Portuguese SNS Documentation](https://www.sns.gov.pt)
- [HL7 FHIR Standards](https://www.hl7.org/fhir/)
- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa/)

---

**Note**: All exercises use synthetic data. Never use these patterns with real patient data without proper security measures and compliance verification.
