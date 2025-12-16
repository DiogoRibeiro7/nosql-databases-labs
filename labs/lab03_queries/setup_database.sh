#!/bin/bash

# Setup script for lab03_movies database
# Run this script in your terminal to import the data

echo "Setting up lab03_movies database..."

# Import movies collection
echo "Importing movies..."
mongoimport \
  --db lab03_movies \
  --collection movies \
  --file labs/lab03_queries/starter/data/movies.json \
  --jsonArray

# Import theaters collection
echo "Importing theaters..."
mongoimport \
  --db lab03_movies \
  --collection theaters \
  --file labs/lab03_queries/starter/data/theaters.json \
  --jsonArray

# Import users collection
echo "Importing users..."
mongoimport \
  --db lab03_movies \
  --collection users \
  --file labs/lab03_queries/starter/data/users.json \
  --jsonArray

echo "Database setup complete!"
echo "To verify, run in mongosh:"
echo "  use lab03_movies"
echo "  db.movies.countDocuments()"
echo "  db.theaters.countDocuments()"
echo "  db.users.countDocuments()"