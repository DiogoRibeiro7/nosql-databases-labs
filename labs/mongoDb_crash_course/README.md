# MongoDB Crash Course

This crash course walks through essential MongoDB skills using a compact `EcommerceCrashCourse` database. Run the scripts in this folder with the MongoDB VS Code extension or mongosh to see each concept in action.

## Project Structure

| File                     | Description                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `01setup.mongodb.js`     | Resets and seeds the database with sample `products`, `orders`, and `contacts`. Always run this first. |
| `02reading.mongodb.js`   | Query examples: filtering, projections, sorting, and pagination.                                       |
| `03update.mongodb.js`    | Demonstrates `updateOne`, `updateMany`, and a `replaceOne` template.                                   |
| `04delete.mongodb.js`    | Shows selective deletes and a rolling cleanup example.                                                 |
| `06aggregate.mongodb.js` | Aggregation pipelines for customer revenue, category revenue, and computed projections.                |
| `07indexes.mongodb.js`   | Inspects existing indexes and creates single-field, compound, and text indexes.                        |

## Getting Started

1. Install the MongoDB VS Code extension (or use mongosh).
2. Connect to your MongoDB instance (local or Atlas).
3. Run `01setup.mongodb.js` to seed the data.
4. Execute the remaining scripts in any order to explore each feature.

## Key Concepts Covered

- CRUD operations
- Projections and pagination
- Aggregation pipelines (`$match`, `$group`, `$unwind`, `$project`)
- Indexing strategies (single, compound, text)

## Reference Material

- Video: <https://youtu.be/M1dKYQ7GsTg?si=z2FggHgGXU4UsrjB>
- Handbook: <https://cwh-full-next-space.fra1.cdn.digitaloceanspaces.com/YouTube/MongoDB%20Handbook.pdf>

Happy coding!
