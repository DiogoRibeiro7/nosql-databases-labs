# NoSQL Databases Course Syllabus

## Course Information

**Course Title:** NoSQL Databases
**Prerequisites:** Basic database concepts, programming fundamentals
**Duration:** 15 weeks (1 semester)
**Format:** Lectures + Hands-on Labs

## Course Description

This course provides a comprehensive introduction to NoSQL databases with a focus on MongoDB. Students will learn the fundamental concepts of document-oriented databases, data modeling techniques, query optimization, aggregation frameworks, and distributed database concepts including replication and sharding. The course emphasizes practical, hands-on experience through lab exercises and group projects.

## Learning Objectives

By the end of this course, students will be able to:

1. Understand the differences between SQL and NoSQL databases
2. Design effective data models for document-oriented databases
3. Perform complex queries and aggregations in MongoDB
4. Implement and manage database replication
5. Apply performance optimization techniques
6. Work with real-world datasets and solve practical problems

## Course Schedule

### Module 1: Introduction to NoSQL (Weeks 1-3)
**Lab:** [Lab 01 - Introduction to NoSQL](labs/lab01_intro/)

Topics:
- NoSQL vs SQL databases
- Document-oriented database concepts
- MongoDB basics and architecture
- CRUD operations (Create, Read, Update, Delete)
- Working with MongoDB shell and drivers
- Basic data types and document structure

**Deliverables:**
- Individual exercises on CRUD operations
- Quiz on NoSQL concepts

### Module 2: Data Modeling (Weeks 4-6)
**Lab:** [Lab 02 - Data Modeling](labs/lab02_modeling/)

Topics:
- Schema design patterns
- Embedded vs referenced documents
- One-to-one, one-to-many, many-to-many relationships
- Denormalization strategies
- Schema validation
- Data migration techniques

**Deliverables:**
- Design a schema for a given business scenario
- Group project: Data model design

### Module 3: Advanced Queries (Weeks 7-9)
**Lab:** [Lab 03 - Advanced Queries](labs/lab03_queries/)

Topics:
- Complex query operators
- Working with arrays and nested documents
- Text search and regular expressions
- Geospatial queries
- Query optimization and explain plans
- Index strategies

**Deliverables:**
- Individual query exercises
- Performance optimization assignment

### Module 4: Aggregation Framework (Weeks 10-12)
**Lab:** [Lab 04 - Aggregation Pipeline](labs/lab04_aggregation/)

Topics:
- Aggregation pipeline stages
- Data transformation and analysis
- Group operations and accumulators
- Working with arrays in aggregations
- Pipeline optimization
- Real-world analytics use cases

**Deliverables:**
- Complex aggregation exercises
- Data analysis project

### Module 5: Replication & High Availability (Weeks 13-15)
**Lab:** [Lab 05 - Replication](labs/lab05_replication/)

Topics:
- Replica set architecture
- Setting up and configuring replica sets
- Failover and recovery mechanisms
- Read preferences and write concerns
- Monitoring and maintenance
- Backup strategies

**Deliverables:**
- Replica set configuration exercise
- Final group project presentation

## Optional/Advanced Topics

For advanced students or extended courses, additional labs are available:

### Extra Module 1: Consistency Patterns & Transactions
Topics:
- ACID transactions in MongoDB
- Multi-document transactions
- Read and write concerns
- Consistency patterns for distributed systems

### Extra Module 2: Sharding & Horizontal Scaling
Topics:
- Sharding concepts and architecture
- Choosing effective shard keys
- Chunk migration and balancing
- Monitoring sharded clusters

### Extra Module 3: Advanced Indexing & Performance
Topics:
- Index types and strategies
- Query optimization techniques
- Performance monitoring tools
- Database profiling

## Assessment

### Grade Distribution
- Lab Exercises: 30%
- Individual Assignments: 20%
- Group Project: 25%
- Midterm Exam: 10%
- Final Exam: 15%

### Lab Exercises
Each lab includes hands-on exercises that must be completed individually. Students will work with real datasets including:
- Sakila film database
- AirBnB listings
- Sample training data
- Social media data

### Group Project
Students will work in groups of 3-4 to design and implement a complete NoSQL database solution for a real-world scenario. Projects include:
- Schema design
- Data import and transformation
- Query implementation
- Performance optimization
- Presentation of findings

## Required Resources

### Software
- MongoDB Community Edition (latest stable version)
- MongoDB Compass (GUI tool)
- Text editor or IDE (VS Code recommended)
- Git for version control
- Docker (optional but recommended)

### Datasets
All required datasets are provided in the course repository:
- `data/sakila/` - Film rental database
- `data/datasets/` - Various sample datasets
- `data/sample_training/` - MongoDB training data

### Recommended Reading
- MongoDB Manual: https://docs.mongodb.com/manual/
- "MongoDB: The Definitive Guide" by Kristina Chodorow
- "Designing Data-Intensive Applications" by Martin Kleppmann

## Course Policies

### Attendance
Lab sessions are mandatory as they contain hands-on exercises essential for understanding the material.

### Late Submission
- Lab exercises: 10% penalty per day late
- Group projects: 20% penalty per day late
- No submissions accepted after 5 days

### Collaboration Policy
- Individual exercises must be completed independently
- Group projects encourage collaboration within teams
- Code sharing between groups is prohibited
- Properly cite all external resources

### Academic Integrity
All work submitted must be original. Plagiarism or unauthorized collaboration will result in course failure.

## Getting Help

### Office Hours
- Instructor: [TBD based on schedule]
- Teaching Assistants: [TBD based on schedule]

### Resources
- Course repository: Access via Git
- Discussion forum: [Platform TBD]
- MongoDB University free courses
- Stack Overflow for technical questions

## Tips for Success

1. **Practice Regularly:** MongoDB requires hands-on practice to master
2. **Start Early:** Begin assignments well before deadlines
3. **Ask Questions:** Use office hours and forums actively
4. **Work with Real Data:** Experiment with the provided datasets
5. **Read Documentation:** MongoDB docs are comprehensive and helpful
6. **Collaborate:** Learn from peers in group projects
7. **Build Projects:** Apply concepts to personal projects

## Course Changelog

- **Current Version:** 5 core labs + 3 optional advanced labs
- **Recent Updates:** Added Labs 03, 04, and 05 covering advanced queries, aggregation, and replication
- **Upcoming:** Docker support, enhanced testing framework, additional datasets

---

*This syllabus is subject to change. Any modifications will be announced in class and updated in the course repository.*