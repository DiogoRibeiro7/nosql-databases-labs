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

### Utility Datasets

- **`datasets/`** - Collection of various JSON datasets including:

  - Books, companies, countries data
  - City inspections
  - Obesity statistics
  - Product catalogs
  - User profiles

- **`DBEnvyLoad/`** - Database load testing data

- **`GraphTest/`** - Graph database test data

## Usage

These datasets are used for:

- Learning NoSQL database concepts
- Performance benchmarking
- Data modeling exercises
- Query optimization practice
- Migration and transformation examples

## Data Formats

Most datasets are available in:

- JSON format (for MongoDB and document databases)
- CSV format (for data import/export)
- SQL format (for relational database sources)

## Notes

- Some datasets may contain large files. Check file sizes before loading entire datasets into memory
- Sample datasets (prefixed with `sample_`) are optimized for educational purposes
- Production datasets may require preprocessing before use in exercises
