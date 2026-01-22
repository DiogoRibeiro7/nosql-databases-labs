# Movie Theater Database Project

This project implements a NoSQL database for a movie theater (cinema), designed to manage movies, users, sessions, theaters, and user comments. The database is structured for use with MongoDB and includes sample data, import scripts, example queries, and documentation of the database schema.

## Deliverables

| Path | Purpose |
| ---- | ------- |
| `import_data.mongosh.js` | Script to create the `group_17_db` database and load sample data. |
| `architecture.md` | Documentation of the collections, schema, and relationships. |
| `data/` | JSON files with sample data for movies, users, sessions, theaters, and comments. |
| `queries/` | JavaScript files with example queries for various use cases. |
| `tests/` | Scripts for data validation and quality checks. |

## Project Structure

- **data/**: Contains JSON files with sample data for movies, users, sessions, theaters, and comments.
- **import_data.mongosh.js**: Script to import the provided data into MongoDB.
- **queries/**: JavaScript files with example queries for various use cases.
- **tests/**: Directory for test scripts or validation queries.
- **architecture.md**: Documentation of the database schema and relationships.

## Scenario Summary

This project models the core operations of a movie theater, including:
- Managing a catalog of movies
- Registering users and tracking their activity
- Scheduling movie sessions in different theaters
- Collecting user comments and ratings for movies

## Key Entities

See [architecture.md](architecture.md) for a detailed description of the data model and relationships.

## Suggested Presentation Flow

1. Showcase the project structure and main files.
2. Walk through the diagrams and explanations inside `architecture.md`.
3. Demonstrate some of the example queries in the `queries/` folder.
4. Discuss how the data model supports typical cinema operations and reporting.
5. Mention possible extensions, such as online ticketing or advanced analytics.

## Authors

Group 17:
- Diana Teles
- Guilherme Sampaio

## License

This project is for educational purposes.