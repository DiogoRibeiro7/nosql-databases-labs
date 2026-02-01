# Motion Sensor Data Analysis – Final Project

This project demonstrates comprehensive analysis of motion data collected from IoT devices equipped with inertial sensors. The solution implements data import, multiple analytical queries, and performance validation using mongosh scripts to track motion intensity, activity patterns, and sensor correlations.

## Deliverables in This Folder

| Path | Purpose |
| ---- | ------- |
| `import_data.js` | Bootstrap script that wipes/creates the database and loads motion sensor data. |
| `architecture.md` | Written rationale for the data model, embedding strategy, and indexing decisions. |
| `Data/` | CSV files containing the raw sensor readings used for analysis. |
| `queries/query_0*.js` | Fifteen analytical scripts implementing various motion analysis use cases with aggregation pipelines. |
| `queries/README.md` | Documentation describing each query's purpose and insights. |

## How to Run Everything (Local MongoDB)

```bash
cd group-work/group_07/project

# 1. Seed the database with motion data
mongosh import_data.js

# 2. Explore the analytical queries (run any file you need)
mongosh queries/query_01.js
mongosh queries/query_02.js
mongosh queries/query_03.js
mongosh queries/query_04.js
mongosh queries/query_05.js
mongosh queries/query_06.js
mongosh queries/query_07.js
mongosh queries/query_08.js
mongosh queries/query_09.js
mongosh queries/query_10.js
mongosh queries/query_11.js
mongosh queries/query_12.js
mongosh queries/query_13.js
mongosh queries/query_14.js
mongosh queries/query_15.js
```

The scripts assume a MongoDB instance is available at the default `mongodb://127.0.0.1:27017`. If you point mongosh at another URI, export `MONGODB_URI` before running the commands.

## Scenario Summary

- **Business driver:** Analyze motion sensor data to identify activity patterns, detect extreme movements, and understand the correlation between different physical motion components (acceleration, rotation, gravity, orientation).
- **Key data:** `motion_data` collection containing high-frequency sensor readings with embedded acceleration, rotation rate, gravity, and attitude vectors.
- **Why mongosh only?** Pure mongosh scripts ensure reproducibility and eliminate driver dependency requirements. Each script is idempotent and interacts with MongoDB through standard mongosh helpers.

## Data Model Highlights

**Single Collection:** `motion_data`
- Each document represents a single sensor reading from an IoT motion sensor
- Contains embedded vectors for user acceleration, rotation rate, gravity, and attitude
- Optimized for analytical queries and aggregation-based insights

**Key Fields:**
- `userAcceleration`: {x, y, z} components of linear acceleration
- `rotationRate`: {x, y, z} rotational velocity components
- `gravity`: {x, y, z} gravity vector components
- `attitude`: {roll, pitch, yaw} device orientation angles

See `architecture.md` for detailed modeling decisions and access patterns.

## Suggested Presentation Flow

1. Open the README and explain the import and analysis commands.
2. Review the diagrams and design rationale in `architecture.md`.
3. Run the query scripts and discuss the analytical insights they reveal.
4. Highlight key findings about motion patterns, acceleration peaks, and sensor correlations.
5. Discuss potential extensions such as real-time anomaly detection or machine learning classification of activities.
