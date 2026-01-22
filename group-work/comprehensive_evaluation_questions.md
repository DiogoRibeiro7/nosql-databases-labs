# Comprehensive Evaluation Questions for Group Submissions

## 1. Project Structure & Documentation

### Organization & Setup
1. Have you created the `group_<group_number>` folder with proper lab subdirectories, maintaining the required folder structure as specified in `group-work/README.md`?
2. Does your README clearly explain the lab objectives, list all team members with their contributions, and provide a project overview that allows reviewers to quickly understand your work?
3. Are all deliverables properly organized with consistent naming conventions (lowercase, underscore/kebab-case) as specified in the submission guidelines?

### Documentation Quality
4. Does your documentation include a clear problem statement, solution approach, and architectural decisions with sufficient technical depth?
5. Have you documented all design trade-offs, explaining why you chose specific approaches (e.g., embedding vs. referencing, index strategies)?
6. Are your code comments meaningful and do they explain complex logic, algorithms, and non-obvious implementation choices?

## 2. Technical Implementation

### Data Model & Schema Design
7. How did you design your data model to optimize for your specific use cases, and what were the key factors that influenced your schema decisions?
8. What validation rules did you implement, and how do they ensure data integrity and consistency?
9. Can you explain your choice between embedded documents and references, and how this impacts query performance and data consistency?

### Query Implementation & Optimization
10. Which indexes did you create, and how did you determine they were necessary based on your query patterns?
11. What performance metrics did you collect (execution time, documents examined, index usage), and how did you use them to optimize your queries?
12. Did you implement any aggregation pipelines? If so, how did you optimize them for performance (e.g., early filtering, proper stage ordering)?
13. How did you handle pagination, projection, and batching to optimize query performance for large datasets?

### Code Quality
14. Is your code modular, reusable, and following consistent naming conventions throughout the project?
15. How did you handle errors and edge cases in your implementation?
16. Did you properly manage database connections and avoid hard-coding credentials or sensitive information?


## 4. Problem Solving & Analysis

### Challenges & Solutions
23. What were the most significant technical challenges you encountered, and how did you overcome them?
24. Were there any unexpected issues with data modeling or query performance, and how did you address them?
25. If you encountered failures in CI/CD or validation scripts, how did you troubleshoot and resolve them?

### Design Decisions
26. Can you explain your most critical architectural decision and its impact on the overall solution?
27. What alternative approaches did you consider but ultimately rejected, and why?
28. How did you balance competing concerns like performance, maintainability, and development time?

## 5. Learning & Reflection

### Skills Development
29. What new MongoDB features or techniques did you learn during this project?
30. How has this lab improved your understanding of NoSQL database design principles?
31. What aspects of MongoDB (aggregation framework, indexing, sharding, etc.) do you now feel more confident with?

### Future Improvements
32. If you had more time, what additional features or optimizations would you implement?
33. What would you do differently if you were to start this project again from scratch?
34. Are there any MongoDB features you discovered but didn't use that might have improved your solution?

## 6. Collaboration & Process

### Team Dynamics
35. How did you distribute work among team members, and how did you ensure everyone contributed meaningfully?
36. What collaboration tools and practices did you use to coordinate your work?
37. How did you handle disagreements about technical approaches or design decisions?

### Version Control & Submission
38. Did your pull request follow the template, include all required information, and properly reference the group and lab numbers?
39. Was your submission properly tested with a clean `git status`, no merge conflicts, and up-to-date with the main branch?
40. Did you follow conventional commit messages and maintain a clear git history?

## 7. Advanced Topics (If Applicable)

### Scalability & Production Readiness
41. How would your solution scale to handle 10x or 100x the current data volume?
42. What monitoring and logging would you implement for a production deployment?
43. Have you considered security implications (authentication, authorization, data encryption)?

### Performance Optimization
44. Did you use any advanced MongoDB features like covered queries, hint(), or explain() to optimize performance?
45. How did you handle concurrent operations and potential race conditions?
46. Did you implement any caching strategies or connection pooling?

## 8. Specific Requirements Verification

### Compliance Check
47. Have you met all the specific requirements listed in the lab instructions?
48. Are all required queries implemented and producing the expected output format?
49. Did you include all necessary artifacts (data files, scripts, screenshots) as specified in the submission guide?

### Final Validation
50. Have you performed a final review to ensure no sensitive data, API keys, or large binary files are included in your submission?

---

## Evaluation Notes

When answering these questions:
- Provide specific examples from your code where relevant
- Reference line numbers or file paths when discussing implementation details (e.g., `queries/query1.js:45`)
- Include performance metrics and test results as evidence
- Be honest about limitations and areas for improvement
- Focus on demonstrating understanding rather than just listing features

## Grading Focus Areas

1. **Technical Correctness** (Questions 7-16, 47-48)
2. **Performance & Optimization** (Questions 10-13, 20-22, 44-46)
3. **Documentation & Communication** (Questions 4-6, 38-40)
4. **Problem-Solving & Learning** (Questions 23-34)
5. **Testing & Validation** (Questions 17-19, 49-50)
6. **Collaboration & Process** (Questions 35-37, 1-3)

---