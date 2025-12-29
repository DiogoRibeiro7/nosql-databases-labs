#!/usr/bin/env python3
"""
Airbnb Data Downloader for Porto/Lisbon
========================================
Focused script to download Airbnb data with multiple fallback URLs.

Author: Diogo Ribeiro - ESMAD/IPP
"""

import requests
import gzip
import pandas as pd
from pathlib import Path
from datetime import datetime
import json


def download_airbnb():
    """Download Airbnb data for Porto and Lisbon with multiple fallbacks."""
    
    # Create output directory
    output_dir = Path("./airbnb_data")
    output_dir.mkdir(exist_ok=True)
    
    print("=" * 60)
    print("Airbnb Data Downloader for Porto & Lisbon")
    print("=" * 60)
    
    # List of possible URLs to try (Airbnb updates monthly)
    porto_urls = [
        # 2024 URLs
        "http://data.insideairbnb.com/portugal/norte/porto/2024-09-25/data/listings.csv.gz",
        "http://data.insideairbnb.com/portugal/norte/porto/2024-06-24/data/listings.csv.gz",
        "http://data.insideairbnb.com/portugal/norte/porto/2024-03-26/data/listings.csv.gz",
        # 2023 URLs (fallback)
        "http://data.insideairbnb.com/portugal/norte/porto/2023-12-26/data/listings.csv.gz",
        "http://data.insideairbnb.com/portugal/norte/porto/2023-09-27/data/listings.csv.gz",
    ]
    
    lisbon_urls = [
        # 2024 URLs
        "http://data.insideairbnb.com/portugal/lisbon/lisbon/2024-09-17/data/listings.csv.gz",
        "http://data.insideairbnb.com/portugal/lisbon/lisbon/2024-06-20/data/listings.csv.gz",
        "http://data.insideairbnb.com/portugal/lisbon/lisbon/2024-03-25/data/listings.csv.gz",
        # 2023 URLs (fallback)
        "http://data.insideairbnb.com/portugal/lisbon/lisbon/2023-12-18/data/listings.csv.gz",
        "http://data.insideairbnb.com/portugal/lisbon/lisbon/2023-09-22/data/listings.csv.gz",
    ]
    
    # Function to try downloading from multiple URLs
    def try_download(urls, city_name):
        """Try downloading from a list of URLs."""
        print(f"\nAttempting to download {city_name} data...")
        
        for i, url in enumerate(urls):
            print(f"  Attempt {i+1}/{len(urls)}: {url}")
            
            try:
                # Add headers to avoid being blocked
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
                
                response = requests.get(url, headers=headers, timeout=60, stream=True)
                response.raise_for_status()
                
                # Save the compressed file
                gz_path = output_dir / f"{city_name.lower()}_listings.csv.gz"
                
                total_size = int(response.headers.get('content-length', 0))
                downloaded = 0
                
                with open(gz_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                            downloaded += len(chunk)
                            if total_size > 0:
                                percent = (downloaded / total_size) * 100
                                mb = downloaded / (1024 * 1024)
                                print(f"    Progress: {percent:.1f}% ({mb:.1f} MB)", end='\r')
                
                print(f"\n  ✓ Downloaded successfully!")
                
                # Try to extract and convert to JSON
                try:
                    print(f"  Extracting {city_name} data...")
                    
                    # Read the compressed CSV
                    with gzip.open(gz_path, 'rt', encoding='utf-8', errors='ignore') as f:
                        # Read only first 2000 rows to keep file size manageable
                        df = pd.read_csv(f, nrows=2000, low_memory=False)
                    
                    # Select useful columns if they exist
                    useful_columns = [
                        'id', 'listing_url', 'name', 'description',
                        'host_id', 'host_name', 'host_since', 'host_response_rate',
                        'neighbourhood', 'neighbourhood_cleansed', 'neighbourhood_group_cleansed',
                        'latitude', 'longitude',
                        'property_type', 'room_type', 'accommodates', 'bedrooms', 'beds', 'bathrooms_text',
                        'price', 'minimum_nights', 'maximum_nights',
                        'number_of_reviews', 'review_scores_rating',
                        'availability_30', 'availability_365'
                    ]
                    
                    # Get columns that exist in the dataframe
                    available_columns = [col for col in useful_columns if col in df.columns]
                    
                    if available_columns:
                        df_filtered = df[available_columns]
                        print(f"  ✓ Selected {len(available_columns)} useful columns")
                    else:
                        # If no matching columns, take first 30 columns
                        df_filtered = df.iloc[:, :min(30, len(df.columns))]
                        print(f"  ✓ Using first {min(30, len(df.columns))} columns")
                    
                    # Save as JSON
                    json_path = output_dir / f"{city_name.lower()}_listings.json"
                    df_filtered.to_json(json_path, orient='records', indent=2)
                    
                    print(f"  ✓ Saved {len(df_filtered)} listings to {json_path}")
                    print(f"  ✓ Columns: {', '.join(df_filtered.columns[:10])}...")
                    
                    # Show sample statistics
                    if 'price' in df_filtered.columns:
                        # Clean price column (remove €, $, commas)
                        df_filtered['price_clean'] = df_filtered['price'].astype(str).str.replace(r'[€$,]', '', regex=True)
                        try:
                            prices = pd.to_numeric(df_filtered['price_clean'], errors='coerce')
                            print(f"  ✓ Price range: €{prices.min():.0f} - €{prices.max():.0f}")
                        except:
                            pass
                    
                    return True
                    
                except Exception as e:
                    print(f"  ⚠ Warning: Could not process the downloaded file: {e}")
                    return True  # Still consider it successful if download worked
                    
            except requests.exceptions.Timeout:
                print(f"    ✗ Timeout - URL might be slow")
            except requests.exceptions.HTTPError as e:
                print(f"    ✗ HTTP Error {e.response.status_code if hasattr(e, 'response') else ''}")
            except requests.exceptions.ConnectionError:
                print(f"    ✗ Connection error - URL might be down")
            except Exception as e:
                print(f"    ✗ Error: {e}")
        
        return False
    
    # Try downloading Porto data
    porto_success = try_download(porto_urls, "Porto")
    
    # Try downloading Lisbon data
    lisbon_success = try_download(lisbon_urls, "Lisbon")
    
    # If neither worked, create sample data
    if not porto_success and not lisbon_success:
        print("\n⚠ Could not download real data. Creating sample dataset...")
        
        sample_data = []
        neighborhoods_porto = ["Cedofeita", "Ribeira", "Baixa", "Bonfim", "Campanhã", "Paranhos", "Ramalde"]
        neighborhoods_lisbon = ["Alfama", "Baixa", "Chiado", "Belém", "Príncipe Real", "Campo de Ourique"]
        room_types = ["Entire home/apt", "Private room", "Shared room", "Hotel room"]
        
        # Create Porto samples
        for i in range(100):
            listing = {
                "id": 10000 + i,
                "name": f"Charming Porto Apartment {i+1}",
                "host_id": 1000 + (i % 20),
                "host_name": f"Porto_Host_{i % 20}",
                "neighbourhood": neighborhoods_porto[i % len(neighborhoods_porto)],
                "latitude": 41.1496 + (i % 100) * 0.001,
                "longitude": -8.6109 + (i % 100) * 0.001,
                "room_type": room_types[i % len(room_types)],
                "price": f"€{40 + (i % 10) * 15}",
                "accommodates": 2 + (i % 6),
                "bedrooms": 1 + (i % 4),
                "beds": 1 + (i % 5),
                "minimum_nights": 1 + (i % 5),
                "number_of_reviews": (i * 3) % 200,
                "review_scores_rating": round(4.0 + (i % 10) * 0.1, 2),
                "availability_365": 180 + (i % 180)
            }
            sample_data.append(listing)
        
        json_path = output_dir / "sample_porto_listings.json"
        with open(json_path, 'w') as f:
            json.dump(sample_data, f, indent=2)
        print(f"  ✓ Created sample Porto dataset: 100 listings")
        
        # Create Lisbon samples
        sample_data = []
        for i in range(100):
            listing = {
                "id": 20000 + i,
                "name": f"Beautiful Lisbon Flat {i+1}",
                "host_id": 2000 + (i % 20),
                "host_name": f"Lisbon_Host_{i % 20}",
                "neighbourhood": neighborhoods_lisbon[i % len(neighborhoods_lisbon)],
                "latitude": 38.7223 + (i % 100) * 0.001,
                "longitude": -9.1393 + (i % 100) * 0.001,
                "room_type": room_types[i % len(room_types)],
                "price": f"€{50 + (i % 10) * 20}",
                "accommodates": 2 + (i % 8),
                "bedrooms": 1 + (i % 5),
                "beds": 1 + (i % 6),
                "minimum_nights": 2 + (i % 4),
                "number_of_reviews": (i * 4) % 250,
                "review_scores_rating": round(4.1 + (i % 10) * 0.09, 2),
                "availability_365": 200 + (i % 165)
            }
            sample_data.append(listing)
        
        json_path = output_dir / "sample_lisbon_listings.json"
        with open(json_path, 'w') as f:
            json.dump(sample_data, f, indent=2)
        print(f"  ✓ Created sample Lisbon dataset: 100 listings")
    
    print("\n" + "=" * 60)
    print("Download Complete!")
    print(f"Files saved in: {output_dir.absolute()}")
    print("=" * 60)
    
    print("\nNext steps:")
    print("1. Import to MongoDB:")
    print("   mongoimport --db airbnb --collection porto --file airbnb_data/porto_listings.json --jsonArray")
    print("   mongoimport --db airbnb --collection lisbon --file airbnb_data/lisbon_listings.json --jsonArray")
    print("\n2. Create geospatial index:")
    print('   db.porto.createIndex({"latitude": 1, "longitude": 1})')
    print('   db.porto.createIndex({"location": "2dsphere"})  # For GeoJSON')


if __name__ == "__main__":
    download_airbnb()
