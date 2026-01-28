# Data Folder

These JSON files contain the source data for the Flight Management System. They are loaded by `import_data.mongosh.js` which performs preprocessing and transformation before inserting the data into MongoDB.

## Data Files

| File | Description | Collection |
| ---- | ----------- | ---------- |
| `airlines.json` | Catalog of airlines with IATA codes and country information. Contains airline name, IATA code, and country code. | `airlines` |
| `airports.json` | Global airport directory with identifiers, names, locations, and municipality information. | `airports` |
| `countries.json` | Reference data for countries with ISO country codes, names, and continent codes. | `countries` |
| `flights.json` | Flight schedule data including flight numbers, routes, departure/arrival times, capacity, status, and pricing. | `flights` |
| `reservations.json` | Passenger reservations linking users to flights with seat assignments and booking status. | `reservations` |
| `users.json` | User account information including email, name, and password hashes. | `users` |

## Preprocessing Steps

The `import_data.mongosh.js` script performs the following transformations:

### Airlines (`airlines.json`)
- **Deduplication**: Removes duplicate airlines based on IATA code (keeps first occurrence)
- **Filtering**: Removes airlines with null, undefined, or empty IATA codes
- **Field Renaming**: Renames `iata` field to `airlineIata` to match the flights collection schema

### Airports (`airports.json`)
- **Deduplication**: Removes duplicate airports based on ident code (keeps first occurrence)
- **Filtering**: Removes airports with null, undefined, or empty ident codes
- **Field Renaming**: Renames `ident` field to `airportIdent` to match the flights collection schema

### Flights (`flights.json`)
- **Date Conversion**: Converts `departureTime` and `arrivalTime` from ISO 8601 strings to MongoDB Date objects

### Reservations (`reservations.json`)
- **User ID Population**: Maps `userEmail` to `userId` using the inserted users collection
- **Field Removal**: Removes `userEmail` field after populating `userId` to maintain referential integrity

### Users (`users.json`)
- **No preprocessing**: Inserted as-is into the `users` collection

### Countries (`countries.json`)
- **No preprocessing**: Inserted as-is into the `countries` collection

## Data Validation Notes

- **Referential Integrity**: The import script ensures that reservations reference valid users by mapping emails to user IDs
- **Data Consistency**: Duplicate airlines and airports are removed to prevent data inconsistencies
- **Required Fields**: The import script filters out records with missing critical identifiers (IATA codes for airlines, ident codes for airports)
- **Date Format**: Flight dates are stored as MongoDB Date objects for proper querying and indexing

## Usage Tips

1. **Import Data**: Run `mongosh import_data.mongosh.js` from the `project/` directory. The script will:
   - Drop the existing database to ensure a clean state
   - Load and preprocess all JSON files
   - Insert data into MongoDB collections
   - Create indexes automatically

2. **Data Expansion**: If you need to expand the dataset:
   - Update the JSON files with new records
   - Ensure the data follows the same schema structure
   - Re-run the import script to reload all data

3. **Data Inspection**: You can inspect the JSON files directly to understand the data structure before import, but note that the final MongoDB documents may have different field names (e.g., `iata` → `airlineIata`).

4. **Reproducibility**: The import script is idempotent—running it multiple times will produce the same result by dropping and recreating the database each time.

## Data Sources

The data files were sourced from the following public datasets:

- **Countries**: [Countries of the World Dataset](https://www.kaggle.com/datasets/fernandol/countries-of-the-world) - Kaggle
- **Airports**: [Airports Data](https://www.kaggle.com/datasets/asadcodes/airports-data) - Kaggle
- **Airlines**: [Airlines CSV](https://github.com/elmoallistair/datasets/blob/main/airlines.csv) - GitHub

The data structure is designed to support realistic airline operations queries including:
- Flight scheduling and availability
- Reservation management
- Route analytics
- Revenue analysis
- Customer relationship management
