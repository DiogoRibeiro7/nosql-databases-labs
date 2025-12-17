# Data Directory

This directory contains various datasets and sample data collections used for NoSQL database labs, experiments, and benchmarks. The data is organized into different folders based on their source, purpose, or database type.

## Directory Structure

### Sample MongoDB Atlas Datasets

These are standard sample datasets provided by MongoDB Atlas for learning and testing purposes:

- **`sample_airbnb/`** - Airbnb listing and review data
- **`sample_analytics/`** - Financial and customer analytics data
- **`sample_geospatial/`** - Geographic and location-based data
- **`sample_mflix/`** - Movie database with reviews, users, and theaters
- **`sample_supplies/`** - Sales and supply chain data
- **`sample_training/`** - Training dataset with various collections
- **`sample_weatherdata/`** - Weather observation data

### Domain-Specific Datasets

- **`sakila-db/`** - MySQL Sakila sample database (converted to various formats)

  - Contains SQL schema and data files
  - Output folder with converted JSON/CSV files
  - Python conversion scripts

- **`world-db/`** - MySQL World sample database (converted to various formats)

  - Contains world.sql with countries, cities, and languages data
  - Output folder with converted JSON/CSV files
  - Python conversion scripts

- **`ColoradoScooters/`** - Scooter rental/sharing data from Colorado

- **`crunchbase/`** - Startup and company data from Crunchbase

- **`enron/`** - Enron email dataset for text analysis and graph databases

- **`foodmart/`** - Retail food mart sales and inventory data

- **`mongomart/`** - E-commerce sample data for MongoDB

- **`movies_kaggle/`** - Movie dataset from Kaggle competitions

- **`wine_quality/`** - Wine quality assessment data

- **`airbnb_data/`** - Curated Lisbon and Porto listing snapshots used in lab extensions (see `sample_lisbon_listings.json` and `sample_porto_listings.json`)

- **`food_express/`** - Synthetic restaurant and order documents used for CRUD modeling demos (`foodexpress_db.restaurants.json`, `foodexpress_db.orders.json`)

- **`sample_databases/`** - Mirrors of companion SQL/JSON datasets (Northwind, Chinook, IMDB, MongoDB schema references) plus the LaTeX design notes that produce `northwind_mongodb_schema_design.pdf`

### Utility Datasets

- **`datasets/`** - Collection of various JSON datasets including:

  - Books, companies, countries data
  - City inspections
  - Obesity statistics
  - Product catalogs
  - User profiles

- **`DBEnvyLoad/`** - Database load testing data

- **`GraphTest/`** - Graph database test data

### Full datasets

The full datasets are **not** versioned in this GitHub repository.

- AirportDB (MySQL HeatWave JSONL/CSV): <https://drive.google.com/file/d/1Cq4tHKu-7qcmES1-xgsgtf_gf74BPunY/view?usp=sharing>

After downloading the archive, extract it. The extracted `AirportDB` folder should be placed inside the `data/` directory alongside other datasets.

## Usage

These datasets are used for:

- Learning NoSQL database concepts
- Performance benchmarking
- Data modeling exercises
- Query optimization practice
- Migration and transformation examples
- Seeding MongoDB instances with rich synthetic data for labs (see below)

### Data validation and tooling

- Run `npm run test:data` (or `node scripts/data-smoke-test.js`) from the repo root to execute the dataset smoke tests.  
  This script counts every document in `data/datasets/` and BSON bundles such as `data/foodmart/` to ensure nothing is missing or corrupted.
- The `data/validation_schemas/` folder contains JSON Schema definitions that mirror what the smoke tests expect.
- Conversion helpers like `world-db/world_sql_to_csv_json.py` and `sakila-db/sql_to_csv_json.py` regenerate JSON/CSV exports from the upstream SQL dumps.
- For advanced demos, the `mongodb-faker-generator/` package can synthesize realistic `users`, `products`, `transactions`, and `logs` collections that feed several labs. See [mongodb-faker-generator/README.md](../mongodb-faker-generator/README.md) for regeneration instructions.

### Download helpers

If you need to refresh the datasets locally, use the scripts in this directory:

- `download_all_databases.sh` / `.bat` fetch every supported dataset.
- `download_simple.bat` downloads only the sample MongoDB archives for Windows labs.
- `download_sample_databases.py` is a cross-platform helper used by CI to verify mirrors.
Each script writes into the current `data/` directory, so run them from the repo root.

## Data Formats

Most datasets are available in:

- JSON format (for MongoDB and document databases)
- CSV format (for data import/export)
- SQL format (for relational database sources)

## Notes

- Some datasets may contain large files. Check file sizes before loading entire datasets into memory
- Sample datasets (prefixed with `sample_`) are optimized for educational purposes
- Production datasets may require preprocessing before use in exercises
