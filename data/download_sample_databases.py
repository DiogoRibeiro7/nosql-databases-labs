#!/usr/bin/env python3
"""
Sample Database Downloader for NoSQL Courses (Improved)
========================================================
Downloads and prepares various sample databases for MongoDB transformation.
Includes better error handling and multiple Airbnb URL fallbacks.

Author: Diogo Ribeiro - ESMAD/IPP
"""

import os
import requests
import gzip
import json
import sqlite3
import pandas as pd
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import argparse


class DatabaseDownloader:
    """Download and prepare sample databases for NoSQL transformation."""
    
    def __init__(self, output_dir: str = "./sample_databases"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
    def download_file(self, url: str, dest_path: Path, timeout: int = 30) -> bool:
        """Download a file from URL with timeout and better error handling."""
        print(f"  Downloading: {url}")
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, stream=True, timeout=timeout, headers=headers)
            response.raise_for_status()
            
            total_size = int(response.headers.get('content-length', 0))
            downloaded = 0
            
            with open(dest_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)
                        if total_size > 0:
                            percent = (downloaded / total_size) * 100
                            mb_downloaded = downloaded / (1024 * 1024)
                            mb_total = total_size / (1024 * 1024)
                            print(f"  Progress: {percent:.1f}% ({mb_downloaded:.1f}/{mb_total:.1f} MB)", end='\r')
            
            print(f"\n  ✓ Saved to: {dest_path}")
            return True
        except requests.exceptions.Timeout:
            print(f"\n  ✗ Error: Download timeout after {timeout} seconds")
            return False
        except requests.exceptions.HTTPError as e:
            print(f"\n  ✗ HTTP Error: {e}")
            return False
        except Exception as e:
            print(f"\n  ✗ Error: {e}")
            return False
    
    def download_airbnb_with_fallbacks(self):
        """Download Airbnb data with multiple URL attempts."""
        print("\n[Airbnb] Downloading Porto/Lisbon Dataset...")
        db_dir = self.output_dir / "airbnb"
        db_dir.mkdir(exist_ok=True)
        
        # Generate possible dates (Airbnb updates monthly)
        today = datetime.now()
        date_options = []
        for i in range(6):  # Try last 6 months
            date = today - timedelta(days=30*i)
            date_str = date.strftime("%Y-%m-%d")
            # Round to common update dates (usually around 15th or 25th)
            date_options.append(date.strftime("%Y-%m-25"))
            date_options.append(date.strftime("%Y-%m-17"))
        
        # URLs to try for Porto
        porto_urls = [
            f"http://data.insideairbnb.com/portugal/norte/porto/{date}/data/listings.csv.gz"
            for date in date_options
        ]
        
        # Add known working dates
        porto_urls = [
            "http://data.insideairbnb.com/portugal/norte/porto/2024-09-25/data/listings.csv.gz",
            "http://data.insideairbnb.com/portugal/norte/porto/2024-06-24/data/listings.csv.gz",
            "http://data.insideairbnb.com/portugal/norte/porto/2024-03-26/data/listings.csv.gz",
        ] + porto_urls
        
        # Try Porto downloads
        porto_success = False
        porto_path = db_dir / "porto_listings.csv.gz"
        
        print("\n  Trying Porto listings...")
        for url in porto_urls[:5]:  # Try first 5 URLs
            if self.download_file(url, porto_path, timeout=60):
                porto_success = True
                break
            print(f"    Trying alternate URL...")
        
        if porto_success:
            # Extract Porto data
            try:
                print("  Extracting Porto listings...")
                with gzip.open(porto_path, 'rt', encoding='utf-8') as f:
                    df = pd.read_csv(f, low_memory=False)
                    
                    # Select important columns if they exist
                    available_cols = df.columns.tolist()
                    desired_cols = ['id', 'name', 'host_id', 'host_name', 'neighbourhood_cleansed',
                                  'latitude', 'longitude', 'room_type', 'price', 
                                  'minimum_nights', 'number_of_reviews', 'availability_365',
                                  'neighbourhood', 'accommodates', 'bedrooms', 'beds']
                    
                    cols_to_use = [col for col in desired_cols if col in available_cols]
                    
                    if cols_to_use:
                        df_filtered = df[cols_to_use].head(2000)  # Sample 2000 listings
                    else:
                        # If columns don't match, take first 20 columns and 2000 rows
                        df_filtered = df.iloc[:2000, :20]
                    
                    json_path = db_dir / "porto_listings.json"
                    df_filtered.to_json(json_path, orient='records', indent=2)
                    print(f"  ✓ Porto Listings: {len(df_filtered)} records")
                    
                    # Show available columns for debugging
                    print(f"  ✓ Available columns: {', '.join(available_cols[:10])}...")
                    
            except Exception as e:
                print(f"  ✗ Error extracting Porto data: {e}")
        else:
            print("  ⚠ Could not download Porto data - trying alternate source...")
            
            # Try a simplified direct CSV if available
            simple_url = "https://raw.githubusercontent.com/diogoribeiro7/sample-data/main/airbnb_porto.csv"
            simple_path = db_dir / "porto_listings.csv"
            
            if self.download_file(simple_url, simple_path, timeout=30):
                try:
                    df = pd.read_csv(simple_path)
                    json_path = db_dir / "porto_listings.json"
                    df.to_json(json_path, orient='records', indent=2)
                    print(f"  ✓ Porto Listings (alternate): {len(df)} records")
                except Exception as e:
                    print(f"  ✗ Could not process alternate source: {e}")
        
        # Try Lisbon with similar approach
        lisbon_urls = [
            "http://data.insideairbnb.com/portugal/lisbon/lisbon/2024-09-17/data/listings.csv.gz",
            "http://data.insideairbnb.com/portugal/lisbon/lisbon/2024-06-20/data/listings.csv.gz",
            "http://data.insideairbnb.com/portugal/lisbon/lisbon/2024-03-25/data/listings.csv.gz",
        ]
        
        lisbon_path = db_dir / "lisbon_listings.csv.gz"
        lisbon_success = False
        
        print("\n  Trying Lisbon listings...")
        for url in lisbon_urls:
            if self.download_file(url, lisbon_path, timeout=60):
                lisbon_success = True
                break
        
        if lisbon_success:
            try:
                print("  Extracting Lisbon listings...")
                with gzip.open(lisbon_path, 'rt', encoding='utf-8') as f:
                    df = pd.read_csv(f, nrows=2000, low_memory=False)  # Read only 2000 rows
                    
                    json_path = db_dir / "lisbon_listings.json"
                    # Take first 20 columns to avoid issues
                    df_filtered = df.iloc[:, :20]
                    df_filtered.to_json(json_path, orient='records', indent=2)
                    print(f"  ✓ Lisbon Listings: {len(df_filtered)} records")
            except Exception as e:
                print(f"  ✗ Error extracting Lisbon data: {e}")
        
        # Create a sample dataset if nothing worked
        if not porto_success and not lisbon_success:
            print("\n  Creating sample Airbnb dataset...")
            self.create_sample_airbnb_data(db_dir)
        
        print(f"\n  ✓ Airbnb data ready in: {db_dir}")
    
    def create_sample_airbnb_data(self, db_dir: Path):
        """Create a sample Airbnb dataset for testing."""
        sample_data = []
        neighborhoods = ["Cedofeita", "Ribeira", "Baixa", "Bonfim", "Campanhã"]
        room_types = ["Entire home/apt", "Private room", "Shared room"]
        
        for i in range(100):
            listing = {
                "id": 10000 + i,
                "name": f"Lovely Porto Apartment {i+1}",
                "host_id": 1000 + (i % 20),
                "host_name": f"Host_{i % 20}",
                "neighbourhood": neighborhoods[i % len(neighborhoods)],
                "latitude": 41.14 + (i % 100) * 0.001,
                "longitude": -8.61 + (i % 100) * 0.001,
                "room_type": room_types[i % len(room_types)],
                "price": f"€{30 + (i % 10) * 10}",
                "minimum_nights": 1 + (i % 5),
                "number_of_reviews": i % 100,
                "availability_365": 180 + (i % 180),
                "accommodates": 2 + (i % 6),
                "bedrooms": 1 + (i % 4),
                "beds": 1 + (i % 5)
            }
            sample_data.append(listing)
        
        json_path = db_dir / "sample_listings.json"
        with open(json_path, 'w') as f:
            json.dump(sample_data, f, indent=2)
        
        print(f"  ✓ Created sample dataset: 100 listings")
    
    def download_chinook(self):
        """Download and convert Chinook SQLite database."""
        print("\n[Chinook] Downloading Music Store Database...")
        db_dir = self.output_dir / "chinook"
        db_dir.mkdir(exist_ok=True)
        
        # Download SQLite file
        sqlite_path = db_dir / "chinook.sqlite"
        url = "https://github.com/lerocha/chinook-database/raw/master/ChinookDatabase/DataSources/Chinook_Sqlite.sqlite"
        
        if self.download_file(url, sqlite_path, timeout=30):
            try:
                # Convert to JSON
                conn = sqlite3.connect(sqlite_path)
                cursor = conn.cursor()
                
                # Get all tables
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
                tables = [table[0] for table in cursor.fetchall()]
                
                print(f"  Found tables: {', '.join(tables)}")
                
                for table in tables:
                    try:
                        query = f"SELECT * FROM {table}"
                        df = pd.read_sql_query(query, conn)
                        
                        json_path = db_dir / f"{table.lower()}.json"
                        df.to_json(json_path, orient='records', indent=2)
                        print(f"  ✓ Exported {table}: {len(df)} records")
                    except Exception as e:
                        print(f"  ✗ Error exporting {table}: {e}")
                
                conn.close()
                print(f"  ✓ Chinook ready in: {db_dir}")
            except Exception as e:
                print(f"  ✗ Error processing SQLite database: {e}")
    
    def download_northwind(self):
        """Download Northwind CSV files."""
        print("\n[Northwind] Downloading Traders Database...")
        db_dir = self.output_dir / "northwind"
        db_dir.mkdir(exist_ok=True)
        
        northwind_urls = {
            "categories": "https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/categories.csv",
            "customers": "https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/customers.csv",
            "employees": "https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/employees.csv",
            "orders": "https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/orders.csv",
            "order_details": "https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/order_details.csv",
            "products": "https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/products.csv",
            "regions": "https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/regions.csv",
            "shippers": "https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/shippers.csv",
            "suppliers": "https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/suppliers.csv",
            "territories": "https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/territories.csv",
            "employee_territories": "https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv/employee_territories.csv"
        }
        
        for table, url in northwind_urls.items():
            csv_path = db_dir / f"{table}.csv"
            if self.download_file(url, csv_path, timeout=30):
                try:
                    # Convert to JSON
                    df = pd.read_csv(csv_path)
                    json_path = db_dir / f"{table}.json"
                    df.to_json(json_path, orient='records', indent=2)
                    print(f"  ✓ {table}: {len(df)} records")
                except Exception as e:
                    print(f"  ✗ Error converting {table}: {e}")
        
        print(f"  ✓ Northwind ready in: {db_dir}")
    
    def download_imdb_sample(self):
        """Download IMDb sample (first 1000 movies with ratings)."""
        print("\n[IMDb] Downloading Sample Movie Dataset...")
        db_dir = self.output_dir / "imdb"
        db_dir.mkdir(exist_ok=True)
        
        # Note: IMDb files are very large, so we'll create a smaller sample
        print("  Note: IMDb files are very large (>100MB). Creating sample dataset...")
        
        # Create sample movie data
        sample_movies = []
        genres = ["Action", "Comedy", "Drama", "Thriller", "Romance", "Sci-Fi", "Horror"]
        
        for i in range(500):
            movie = {
                "tconst": f"tt{7000000 + i:07d}",
                "titleType": "movie",
                "primaryTitle": f"Sample Movie {i+1}",
                "originalTitle": f"Sample Movie {i+1}",
                "isAdult": 0,
                "startYear": 1980 + (i % 45),
                "runtimeMinutes": 90 + (i % 60),
                "genres": ",".join([genres[i % len(genres)], genres[(i+1) % len(genres)]])
            }
            sample_movies.append(movie)
        
        movies_path = db_dir / "movies.json"
        with open(movies_path, 'w') as f:
            json.dump(sample_movies, f, indent=2)
        print(f"  ✓ Movies: {len(sample_movies)} records")
        
        # Create sample ratings
        sample_ratings = []
        for i in range(500):
            rating = {
                "tconst": f"tt{7000000 + i:07d}",
                "averageRating": round(5.0 + (i % 50) / 10, 1),
                "numVotes": 100 + i * 10
            }
            sample_ratings.append(rating)
        
        ratings_path = db_dir / "ratings.json"
        with open(ratings_path, 'w') as f:
            json.dump(sample_ratings, f, indent=2)
        print(f"  ✓ Ratings: {len(sample_ratings)} records")
        
        print(f"  ✓ IMDb sample ready in: {db_dir}")
    
    def run(self, databases: List[str] = None):
        """Download specified databases or all if none specified."""
        if databases is None:
            databases = ["chinook", "northwind", "imdb", "airbnb"]
        
        print("=" * 60)
        print("Sample Database Downloader for NoSQL Courses")
        print("=" * 60)
        
        if "chinook" in databases:
            self.download_chinook()
        
        if "northwind" in databases:
            self.download_northwind()
        
        if "imdb" in databases:
            self.download_imdb_sample()
        
        if "airbnb" in databases:
            self.download_airbnb_with_fallbacks()
        
        print("\n" + "=" * 60)
        print("✓ All databases downloaded and ready!")
        print(f"✓ Location: {self.output_dir}")
        print("=" * 60)
        
        print("\nNext steps:")
        print("1. Check the JSON files in each database folder")
        print("2. Use the JSON files for MongoDB import:")
        print("   mongoimport --db nosql_course --collection listings --file airbnb/porto_listings.json --jsonArray")
        print("3. Transform using the provided Python scripts")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download sample databases for NoSQL courses")
    parser.add_argument(
        "--databases", "-d",
        nargs="+",
        choices=["chinook", "northwind", "imdb", "airbnb", "all"],
        default=["all"],
        help="Databases to download"
    )
    parser.add_argument(
        "--output", "-o",
        default="./sample_databases",
        help="Output directory"
    )
    
    args = parser.parse_args()
    
    databases = None if "all" in args.databases else args.databases
    
    downloader = DatabaseDownloader(args.output)
    downloader.run(databases)
