import json
import random
import os
from datetime import datetime, timedelta

# ==========================================
# 1. SETUP PATHS
# ==========================================
# This gets the folder where you are currently executing the script
current_folder = os.getcwd()

FILENAMES = {
    "hosts":  "./group-work/group_05/project/data/hosts.json",
    "listings": "./group-work/group_05/project/data/listings.json",
    "reviews": "./group-work/group_05/project/data/reviews.json"
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
    
    # --- Generate Porto Data ---
    porto_neighbourhoods = ["Cedofeita", "Ribeira", "Baixa", "Bonfim", "Campanhã", "Paranhos", "Ramalde"]
    room_types = ["Entire home/apt", "Private room", "Shared room", "Hotel room"]
    
    for i in range(100):
        l_id = 10000 + i
        h_id = 1000 + (i % 20) # 20 unique hosts
        host_name = f"Porto_Host_{i % 20}"
        
        # Create Host if not exists
        if h_id not in hosts_dict:
            hosts_dict[h_id] = {
                "id": h_id,
                "name": host_name,
                "email": generate_email(host_name),
                "phone": generate_phone(),
                "location": "Porto, Portugal",
                "join_date": random_date(2015, 2019),
                "is_superhost": random.choice([True, False]),
                "response_rate": f"{random.randint(90, 100)}%"
            }

        # Create Listing
        listing = {
            "id": l_id,
            "host_id": h_id,
            "name": f"Charming Porto Apartment {i + 1}",
            "neighbourhood": porto_neighbourhoods[i % len(porto_neighbourhoods)],
            "latitude": 41.1496 + (i * 0.001),
            "longitude": -8.6109 + (i * 0.001),
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

        # Generate Reviews
        count_reviews = listing["number_of_reviews"]
        base_rating = listing["review_scores_rating"]
        
        for _ in range(count_reviews):
            r_score = round(min(5.0, max(1.0, base_rating + random.uniform(-0.5, 0.5))), 1)
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

    # --- Generate Lisbon Data ---
    lisbon_neighbourhoods = ["Alfama", "Baixa", "Chiado", "Belém", "Príncipe Real", "Campo de Ourique"]
    
    for i in range(100):
        l_id = 20000 + i
        h_id = 2000 + (i % 20)
        host_name = f"Lisbon_Host_{i % 20}"

        if h_id not in hosts_dict:
            hosts_dict[h_id] = {
                "id": h_id,
                "name": host_name,
                "email": generate_email(host_name),
                "phone": generate_phone(),
                "location": "Lisbon, Portugal",
                "join_date": random_date(2016, 2020),
                "is_superhost": random.choice([True, False]),
                "response_rate": f"{random.randint(85, 100)}%"
            }

        listing = {
            "id": l_id,
            "host_id": h_id,
            "name": f"Beautiful Lisbon Flat {i + 1}",
            "neighbourhood": lisbon_neighbourhoods[i % len(lisbon_neighbourhoods)],
            "latitude": 38.7223 + (i * 0.001),
            "longitude": -9.1393 + (i * 0.001),
            "room_type": room_types[i % len(room_types)],
            "price": f"€{50 + (i % 10) * 20}",
            "accommodates": 2 + (i % 8),
            "bedrooms": 1 + (i % 5),
            "beds": 1 + (i % 6),
            "minimum_nights": 2 + (i % 4),
            "number_of_reviews": i * 4 if i < 10 else (i % 60) * 4,
            "review_scores_rating": round(4.1 + (i % 9) * 0.09, 2),
            "availability_365": 200 + i
        }
        listings.append(listing)

        count_reviews = listing["number_of_reviews"]
        base_rating = listing["review_scores_rating"]

        for _ in range(count_reviews):
            r_score = round(min(5.0, max(1.0, base_rating + random.uniform(-0.5, 0.5))), 1)
            reviews.append({
                "id": review_global_id,
                "listing_id": l_id,
                "date": random_date(2022, 2024),
                "reviewer_id": random.randint(500000, 999999),
                "reviewer_name": random.choice(["James", "Sofia", "Tiago", "Ines", "Rui", "Emma", "Lucas"]),
                "rating": r_score,
                "comments": get_review_content(r_score)
            })
            review_global_id += 1

    return list(hosts_dict.values()), listings, reviews

# ==========================================
# 4. WRITE FILES TO CURRENT FOLDER
# ==========================================

print(f"Starting data generation in: {current_folder}")

hosts_data, listings_data, reviews_data = generate_dataset()

print(f" Writing {len(hosts_data)} hosts to {FILENAMES['hosts']}...")
with open(FILENAMES['hosts'], 'w', encoding='utf-8') as f:
    json.dump(hosts_data, f, indent=2, ensure_ascii=False)

print(f" Writing {len(listings_data)} listings to {FILENAMES['listings']}...")
with open(FILENAMES['listings'], 'w', encoding='utf-8') as f:
    json.dump(listings_data, f, indent=2, ensure_ascii=False)

print(f" Writing {len(reviews_data)} reviews to {FILENAMES['reviews']}...")
with open(FILENAMES['reviews'], 'w', encoding='utf-8') as f:
    json.dump(reviews_data, f, indent=2, ensure_ascii=False)

print("\nSUCCESS! Data has been written to the current folder:")
print(f" -> {current_folder}")