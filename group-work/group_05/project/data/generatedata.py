import json
import random
import os
from datetime import datetime, timedelta

# ==========================================
# 1. SETUP PATHS
# ==========================================
# Define base path relative to current execution
BASE_DIR = os.path.join("group-work", "group_05", "project", "data")

# Ensure the directory exists
if not os.path.exists(BASE_DIR):
    os.makedirs(BASE_DIR)
    print(f"Created directory: {BASE_DIR}")

FILENAMES = {
    "hosts":    os.path.join(BASE_DIR, "hosts.json"),
    "listings": os.path.join(BASE_DIR, "listings.json"),
    "reviews":  os.path.join(BASE_DIR, "reviews.json")
}

# ==========================================
# 2. DATA GENERATION HELPERS
# ==========================================

def random_date(start_year=2021, end_year=2024):
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    delta = end - start
    random_days = random.randrange(delta.days)
    return (start + timedelta(days=random_days)).strftime("%Y-%m-%d")

def generate_phone():
    return f"+351 {random.randint(910, 999)} {random.randint(100, 999)} {random.randint(100, 999)}"

def generate_email(name):
    clean_name = name.lower().replace(" ", "_").replace(",", "")
    domains = ["gmail.com", "outlook.com", "yahoo.com", "sapo.pt", "hotmail.com"]
    return f"{clean_name}@{random.choice(domains)}"

def get_random_coords(center_lat, center_lon, radius=0.04):
    """
    Generates random coordinates within a small radius of a city center.
    radius 0.04 is roughly 4-5km.
    """
    lat = center_lat + random.uniform(-radius, radius)
    lon = center_lon + random.uniform(-radius, radius)
    return round(lat, 6), round(lon, 6)

def get_review_content(rating):
    if rating >= 4.8:
        return random.choice([
            "Absolutely stunning! The detail in the decor is amazing.",
            "Best Airbnb experience I've ever had. The host was wonderful.",
            "Immaculate and perfect location. Will definitely return.",
            "A true gem. Five stars all the way!",
            "Exceeded all expectations. Highly recommended."
        ])
    elif rating >= 4.0:
        return random.choice([
            "Great stay, very convenient location.",
            "The apartment was clean and the host was responsive.",
            "Good value for money. Would stay again.",
            "Nice place, just like the photos.",
            "Very comfortable bed and good amenities."
        ])
    elif rating >= 3.0:
        return random.choice([
            "It was okay. A bit noisy at night.",
            "Decent location but the cleanliness could be improved.",
            "Average stay. Good for a quick stopover.",
            "Smaller than expected, but fine for one person.",
            "The check-in process was a bit confusing."
        ])
    else:
        return random.choice([
            "Not great. The photos were misleading.",
            "Had issues with the hot water.",
            "Very loud neighbors and dirty floors.",
            "Would not recommend.",
            "Host was unresponsive."
        ])

# ==========================================
# 3. MAIN GENERATION LOGIC
# ==========================================

def generate_dataset():
    listings = []
    hosts_dict = {} 
    reviews = []
    
    review_global_id = 1
    
    # --- Config: Cities ---
    cities = {
        "Porto": {
            "center": (41.1496, -8.6109), # Aliados
            "neighbourhoods": ["Cedofeita", "Ribeira", "Baixa", "Bonfim", "Campanhã", "Paranhos", "Ramalde"],
            "id_start": 10000,
            "host_prefix": "Porto_Host_"
        },
        "Lisbon": {
            "center": (38.7223, -9.1393), # Marques de Pombal
            "neighbourhoods": ["Alfama", "Baixa", "Chiado", "Belém", "Príncipe Real", "Campo de Ourique"],
            "id_start": 20000,
            "host_prefix": "Lisbon_Host_"
        }
    }
    
    room_types = ["Entire home/apt", "Private room", "Shared room", "Hotel room"]
    
    # Generate 100 listings for each city
    for city_name, data in cities.items():
        center_lat, center_lon = data["center"]
        
        for i in range(100):
            l_id = data["id_start"] + i
            # Reuse hosts (1 host manages multiple listings)
            h_id = (l_id // 1000) * 1000 + (i % 20) 
            host_name = f"{data['host_prefix']}{i % 20}"
            
            # --- 1. Create Host (if new) ---
            if h_id not in hosts_dict:
                hosts_dict[h_id] = {
                    "id": h_id,
                    "name": host_name,
                    "email": generate_email(host_name),
                    "phone": generate_phone(),
                    "location": f"{city_name}, Portugal",
                    "join_date": random_date(2015, 2019),
                    "is_superhost": random.choice([True, False]),
                    "response_rate": f"{random.randint(90, 100)}%"
                }

            # --- 2. Create Listing with GeoJSON ---
            lat, lon = get_random_coords(center_lat, center_lon)
            
            listing = {
                "id": l_id,
                "host_id": h_id,
                "name": f"Charming {city_name} Apartment {i + 1}",
                "neighbourhood": data["neighbourhoods"][i % len(data["neighbourhoods"])],
                
                # GEOJSON FIELD (Critical for Mongo Geospatial Queries)
                "location": {
                    "type": "Point",
                    "coordinates": [lon, lat] # Note: MongoDB uses [Long, Lat]
                },
                # Keep scalar values for reference if needed
                "latitude": lat,
                "longitude": lon,
                
                "room_type": room_types[i % len(room_types)],
                "price": f"€{40 + (i % 10) * 15}",
                "accommodates": 2 + (i % 6),
                "bedrooms": 1 + (i % 4),
                "beds": 1 + (i % 5),
                "minimum_nights": 1 + (i % 5),
                "number_of_reviews": i * 3 if i < 10 else (i % 50) * 3,
                "review_scores_rating": round(4.0 + (i % 10) * 0.1, 1),
                "availability_365": 180 + i
            }
            listings.append(listing)

            # --- 3. Generate Reviews ---
            count_reviews = listing["number_of_reviews"]
            base_rating = listing["review_scores_rating"]
            
            for _ in range(count_reviews):
                # Randomize rating slightly around the listing average
                r_score = round(min(5.0, max(1.0, base_rating + random.uniform(-0.8, 0.5))), 1)
                
                reviews.append({
                    "id": review_global_id,
                    "listing_id": l_id,
                    "date": random_date(2022, 2024),
                    "reviewer_id": random.randint(500000, 999999),
                    "reviewer_name": random.choice(["John", "Maria", "Soraia", "Pedro", "Ana", "Luis", "Claire"]),
                    "rating": r_score,
                    "comments": get_review_content(r_score)
                })
                review_global_id += 1

    return list(hosts_dict.values()), listings, reviews

# ==========================================
# 4. EXECUTE & WRITE FILES
# ==========================================

print(f"Starting data generation...")
print(f"Target Directory: {BASE_DIR}")

hosts_data, listings_data, reviews_data = generate_dataset()

print(f"-> Generating {len(hosts_data)} hosts...")
with open(FILENAMES['hosts'], 'w', encoding='utf-8') as f:
    json.dump(hosts_data, f, indent=2, ensure_ascii=False)

print(f"-> Generating {len(listings_data)} listings...")
with open(FILENAMES['listings'], 'w', encoding='utf-8') as f:
    json.dump(listings_data, f, indent=2, ensure_ascii=False)

print(f"-> Generating {len(reviews_data)} reviews...")
with open(FILENAMES['reviews'], 'w', encoding='utf-8') as f:
    json.dump(reviews_data, f, indent=2, ensure_ascii=False)

print("\n✅ SUCCESS! All files generated in project/data/ folder.")