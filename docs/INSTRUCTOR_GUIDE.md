# 👨‍🏫 MongoDB NoSQL Labs - Instructor Guide

This comprehensive guide helps instructors effectively deliver the MongoDB NoSQL Labs course, manage student progress, and customize content for different contexts.

## 📋 Course Overview

### Course Structure
- **5 Core Labs**: Progressive skill building from basics to advanced
- **1 Modern Features Lab**: Cutting-edge MongoDB capabilities
- **Extra Labs**: Advanced topics for ambitious students
- **Group Work**: Collaborative exercises for team learning
- **Practice Exercises**: Additional challenges for reinforcement

### Time Requirements
| Component | Estimated Time | Flexible? |
|-----------|---------------|-----------|
| Core Labs (1-5) | 24 hours | No - Required |
| Modern Features | 8 hours | Yes - Optional |
| Extra Labs | 6 hours | Yes - Optional |
| Group Work | 10 hours | Yes - Recommended |
| **Total Course** | **48 hours** | **38 minimum** |

## 🚀 Getting Started

### 1. Environment Setup

#### Option A: Cloud-Based (MongoDB Atlas)
```bash
# Easiest for students - no local installation
1. Create Atlas account for class
2. Set up shared cluster (M0 free tier works)
3. Create database users for each student
4. Whitelist classroom IPs
5. Share connection strings
```

#### Option B: Docker (Recommended)
```bash
# Consistent environment across all machines
docker-compose up -d
npm run verify:setup
```

#### Option C: Local Installation
```bash
# Most control but requires setup
1. Install MongoDB Community Edition
2. Install MongoDB Shell (mongosh)
3. Run setup verification: npm run verify:setup
```

### 2. Pre-Course Checklist

- [ ] Test all lab exercises yourself
- [ ] Verify data files are accessible
- [ ] Set up grading infrastructure
- [ ] Create communication channels (Slack/Discord)
- [ ] Prepare supplementary materials
- [ ] Configure group folders
- [ ] Test submission system

## 📚 Teaching Each Lab

### Lab 01: Introduction (4 hours)

**Learning Objectives:**
- Install and configure MongoDB
- Execute CRUD operations
- Import/export data
- Create basic indexes

**Teaching Tips:**
- Start with MongoDB architecture overview
- Live demo each CRUD operation
- Common mistakes: forgetting to switch databases, JSON syntax errors

**Assessment Points:**
- Can students insert and query data? (30%)
- Do they understand database/collection concepts? (30%)
- Can they import the sample data? (20%)
- Basic indexing understanding? (20%)

### Lab 02: Data Modeling (5 hours)

**Learning Objectives:**
- Design document schemas
- Choose between embedding/referencing
- Implement validation rules

**Teaching Tips:**
- Use real-world examples (e-commerce, social media)
- Diagram embedding vs referencing tradeoffs
- Discuss the 16MB document limit

**Assessment Points:**
- Schema design appropriateness (40%)
- Justification of design choices (30%)
- Validation rules implementation (30%)

### Lab 03: Advanced Queries (5 hours)

**Learning Objectives:**
- Complex query operators
- Performance optimization
- Text and geospatial searches

**Teaching Tips:**
- Build queries incrementally
- Always show explain() output
- Demonstrate index impact on performance

**Assessment Points:**
- Query correctness (30%)
- Performance optimization (30%)
- Use of appropriate operators (20%)
- Index strategy (20%)

### Lab 04: Aggregation (6 hours)

**Learning Objectives:**
- Build aggregation pipelines
- Data transformation and analytics
- Window functions and facets

**Teaching Tips:**
- Start with simple pipelines, add stages gradually
- Visualize pipeline flow on whiteboard
- Show real analytics use cases

**Assessment Points:**
- Pipeline correctness (40%)
- Appropriate stage usage (30%)
- Performance considerations (30%)

### Lab 05: Replication (4 hours)

**Learning Objectives:**
- Configure replica sets
- Understand failover
- Read/write concerns

**Teaching Tips:**
- Demonstrate failover live
- Explain CAP theorem implications
- Show replication lag effects

**Assessment Points:**
- Replica set configuration (40%)
- Understanding of consistency levels (30%)
- Failover handling (30%)

## 🎯 Grading & Assessment

### Automated Grading Setup

1. **Configure Auto-Grader:**
```bash
cd group-work/scripts
node auto_grader.js --setup
```

2. **Grading Weights (Customizable):**
```javascript
// group-work/scripts/grading_config.json
{
  "weights": {
    "labs": {
      "lab01": 15,
      "lab02": 20,
      "lab03": 20,
      "lab04": 25,
      "lab05": 20
    },
    "components": {
      "correctness": 40,
      "performance": 20,
      "code_quality": 20,
      "documentation": 20
    }
  },
  "late_penalty": 5,  // percent per day
  "max_late_days": 7
}
```

3. **Run Grading:**
```bash
# Grade all submissions
npm run grade:all

# Grade specific group
npm run grade:group group_01

# Generate grade report
npm run grade:report
```

### Manual Grading Rubric

#### Lab Submission Rubric
| Criterion | Excellent (90-100%) | Good (70-89%) | Needs Work (< 70%) |
|-----------|-------------------|---------------|-------------------|
| **Functionality** | All tasks complete and working | Most tasks complete | Many tasks incomplete |
| **Code Quality** | Clean, well-organized | Generally good, minor issues | Messy, hard to follow |
| **Performance** | Optimized queries/indexes | Adequate performance | Poor performance |
| **Documentation** | Comprehensive comments/README | Basic documentation | Little/no documentation |

### Tracking Progress

Use the provided tracking spreadsheet template:
```bash
cp group-work/templates/grade_tracker.xlsx grades/
```

Or use the automated tracker:
```bash
node group-work/scripts/progress_tracker.js --export
```

## 🔧 Customization Options

### Adjusting Difficulty

#### For Beginners:
- Provide starter code templates
- Add more guided exercises
- Extend time limits
- Allow pair programming
- Focus on Labs 1-3

#### For Advanced Students:
- Remove scaffolding
- Add performance requirements
- Require optimization proofs
- Include Extra Labs
- Add competitive elements

### Industry-Specific Customization

#### For Web Developers:
```javascript
// Emphasize these topics:
- User authentication schemas
- Session management
- Real-time features (change streams)
- API design patterns
```

#### For Data Scientists:
```javascript
// Emphasize these topics:
- Aggregation pipelines
- Time-series collections
- Statistical operations
- Data export for analysis
```

#### For DevOps/DBAs:
```javascript
// Emphasize these topics:
- Replication and sharding
- Backup strategies
- Monitoring and metrics
- Performance tuning
```

### Adding Custom Labs

1. **Create Lab Structure:**
```bash
mkdir labs/lab_custom
cp labs/lab01_intro/README.md labs/lab_custom/
# Edit README with custom content
```

2. **Add to Manifest:**
```javascript
// labs/MANIFEST.json
"lab_custom": {
  "id": "lab_custom",
  "title": "Your Custom Lab",
  "difficulty": "intermediate",
  "duration_hours": 4,
  // ... other metadata
}
```

3. **Create Test File:**
```javascript
// tests/test_lab_custom.js
const validateCustomLab = require('./validators/custom');
// Add test cases
```

## 📊 Student Management

### Group Formation

**Random Assignment:**
```bash
node group-work/scripts/group_formation.js --random --size 4
```

**Skill-Balanced Assignment:**
```bash
node group-work/scripts/group_formation.js --balanced --survey survey_results.csv
```

### Monitoring Progress

**Real-time Dashboard:**
```bash
npm run monitor:dashboard
# Opens http://localhost:3000/instructor
```

**Weekly Progress Reports:**
```bash
node scripts/generate_progress_report.js --week 3
```

**Identify Struggling Students:**
```bash
node scripts/identify_at_risk.js --threshold 70
```

## 🛠️ Troubleshooting Common Issues

### Student Environment Problems

| Issue | Solution |
|-------|----------|
| Cannot connect to MongoDB | Check firewall, verify connection string |
| Import fails | Check file path, ensure JSON format |
| Tests timeout | Increase timeout in .env |
| Replica set won't initialize | Check port availability, network settings |

### Grading System Issues

| Issue | Solution |
|-------|----------|
| Auto-grader crashes | Check Node.js version, reinstall dependencies |
| Grades not updating | Clear cache: `npm run grade:clear-cache` |
| Submission not detected | Verify folder structure, check permissions |

## 📈 Best Practices

### Effective Teaching Strategies

1. **Live Coding**: Demonstrate concepts in real-time
2. **Think Aloud**: Verbalize problem-solving process
3. **Peer Review**: Students review each other's schemas
4. **Real Data**: Use interesting, relatable datasets
5. **Incremental Complexity**: Build solutions step-by-step

### Managing Large Classes

- Use teaching assistants for lab support
- Create FAQ document from common questions
- Set up office hours schedule
- Use automated grading where possible
- Create video walkthroughs for complex topics

### Encouraging Engagement

- **Gamification**: Leaderboards for query performance
- **Competitions**: Fastest aggregation pipeline
- **Show & Tell**: Students present solutions
- **Real Projects**: Connect to actual applications
- **Industry Speakers**: Invite MongoDB experts

## 📝 Administrative Tasks

### Beginning of Course

```bash
# 1. Setup environment
npm install
npm run verify:setup

# 2. Create student accounts
node scripts/create_student_accounts.js students.csv

# 3. Initialize group folders
npm run standardize:groups

# 4. Send welcome email with setup instructions
node scripts/send_welcome_email.js
```

### During Course

```bash
# Weekly tasks
npm run grade:weekly
npm run progress:report
npm run identify:issues

# After each lab
npm run validate:lab01  # (lab02, lab03, etc.)
npm run generate:feedback
```

### End of Course

```bash
# Final grading
npm run grade:final
npm run export:grades

# Generate certificates
node scripts/generate_certificates.js

# Archive submissions
npm run archive:semester
```

## 🔗 Additional Resources

### For Instructors
- [MongoDB University Educator Program](https://university.mongodb.com/educators)
- [Teaching Materials Repository](./teaching_materials/)
- [Slide Templates](./slides/)
- [Video Tutorials](./videos/)

### For Students
- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [MongoDB University](https://university.mongodb.com/)
- [Community Forums](https://www.mongodb.com/community/forums/)

## 📞 Support

### Getting Help
- **Technical Issues**: Open issue on GitHub
- **Pedagogical Questions**: instructor-support@example.edu
- **Emergency Support**: +1-555-MONGODB (24/7 during semester)

### Contributing Back
We welcome contributions from instructors:
- Submit new lab ideas
- Share successful customizations
- Report bugs and issues
- Improve documentation

## 🎓 Certification Alignment

This course aligns with MongoDB certifications:

| Certification | Relevant Labs | Additional Study |
|--------------|---------------|------------------|
| Developer Associate | Labs 1-4 | Application development patterns |
| DBA Associate | Labs 1, 5, Extra | Security, backup/recovery |
| Data Analyst | Labs 3-4, Modern | BI Connector, Charts |

---

**Quick Commands Reference:**
```bash
npm run verify:setup        # Check environment
npm run test:all           # Run all tests
npm run grade:all          # Grade submissions
npm run monitor:dashboard  # Open monitoring
npm run help              # Show all commands
```

*Last Updated: December 2024*
*Version: 2.0.0*