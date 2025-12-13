# Dataset Schema Documentation

This document provides detailed schema information for all datasets available in the NoSQL Labs repository.

## Table of Contents

1. [Sakila Database](#sakila-database)
2. [Sample Training](#sample-training)
3. [Sample AirBnB](#sample-airbnb)
4. [Sample Analytics](#sample-analytics)
5. [Sample MFlix](#sample-mflix)
6. [Sample Geospatial](#sample-geospatial)
7. [Sample Supplies](#sample-supplies)
8. [Sample Weather](#sample-weather)
9. [World Database](#world-database)
10. [Additional Datasets](#additional-datasets)

---

## Sakila Database

**Location:** `data/sakila-db/`
**Description:** Classic MySQL Sakila sample database adapted for MongoDB
**Use Case:** Film rental store management system

### Collections

#### `actors`
```javascript
{
  _id: ObjectId,
  actor_id: Number,
  first_name: String,
  last_name: String,
  last_update: Date,
  films: [
    {
      film_id: Number,
      title: String,
      year: Number
    }
  ]
}
```

#### `films`
```javascript
{
  _id: ObjectId,
  film_id: Number,
  title: String,
  description: String,
  release_year: Number,
  language_id: Number,
  rental_duration: Number,
  rental_rate: Number,
  length: Number,         // Duration in minutes
  replacement_cost: Number,
  rating: String,         // G, PG, PG-13, R, NC-17
  special_features: [String],
  last_update: Date,
  categories: [String],
  actors: [
    {
      actor_id: Number,
      first_name: String,
      last_name: String
    }
  ]
}
```

#### `customers`
```javascript
{
  _id: ObjectId,
  customer_id: Number,
  store_id: Number,
  first_name: String,
  last_name: String,
  email: String,
  address: {
    address: String,
    district: String,
    city: String,
    country: String,
    postal_code: String,
    phone: String
  },
  active: Boolean,
  create_date: Date,
  last_update: Date
}
```

#### `rentals`
```javascript
{
  _id: ObjectId,
  rental_id: Number,
  rental_date: Date,
  inventory_id: Number,
  customer_id: Number,
  return_date: Date,
  staff_id: Number,
  film: {
    film_id: Number,
    title: String
  },
  customer: {
    customer_id: Number,
    first_name: String,
    last_name: String
  },
  payment: {
    payment_id: Number,
    amount: Number,
    payment_date: Date
  }
}
```

---

## Sample Training

**Location:** `data/sample_training/`
**Description:** MongoDB's official training dataset
**Use Case:** Learning MongoDB operations and aggregation

### Collections

#### `companies`
```javascript
{
  _id: ObjectId,
  name: String,
  permalink: String,
  category_code: String,
  founded_year: Number,
  founded_month: Number,
  founded_day: Number,
  deadpooled_year: Number,
  homepage_url: String,
  blog_url: String,
  blog_feed_url: String,
  twitter_username: String,
  number_of_employees: Number,
  email_address: String,
  phone_number: String,
  description: String,
  overview: String,
  total_money_raised: String,
  funding_rounds: [
    {
      round_code: String,
      raised_amount: Number,
      raised_currency_code: String,
      funded_year: Number,
      funded_month: Number,
      funded_day: Number,
      investments: [
        {
          company: {
            name: String,
            permalink: String
          },
          financial_org: {
            name: String,
            permalink: String
          },
          person: {
            first_name: String,
            last_name: String,
            permalink: String
          }
        }
      ]
    }
  ],
  offices: [
    {
      description: String,
      address1: String,
      address2: String,
      city: String,
      state_code: String,
      country_code: String,
      latitude: Number,
      longitude: Number
    }
  ],
  milestones: [
    {
      id: Number,
      description: String,
      stoned_year: Number,
      stoned_month: Number,
      stoned_day: Number,
      source_url: String,
      source_text: String,
      source_description: String,
      stoneable_type: String,
      stoned_value: Number,
      stoned_value_type: String,
      stoned_acquirer: String
    }
  ],
  ipo: {
    valuation_amount: Number,
    valuation_currency_code: String,
    pub_year: Number,
    pub_month: Number,
    pub_day: Number,
    stock_symbol: String
  },
  acquisition: {
    price_amount: Number,
    price_currency_code: String,
    term_code: String,
    source_url: String,
    source_description: String,
    acquired_year: Number,
    acquired_month: Number,
    acquired_day: Number,
    acquiring_company: {
      name: String,
      permalink: String
    }
  },
  partners: [
    {
      partner_name: String,
      homepage_url: String
    }
  ]
}
```

#### `grades`
```javascript
{
  _id: ObjectId,
  student_id: Number,
  class_id: Number,
  scores: [
    {
      type: String,     // "exam", "quiz", "homework"
      score: Number     // 0-100
    }
  ]
}
```

#### `trips`
```javascript
{
  _id: ObjectId,
  tripduration: Number,     // Duration in seconds
  start_station_id: Number,
  start_station_name: String,
  end_station_id: Number,
  end_station_name: String,
  bikeid: Number,
  usertype: String,         // "Customer" or "Subscriber"
  birth_year: Number,
  gender: Number,          // 0=unknown, 1=male, 2=female
  start_time: Date,
  stop_time: Date
}
```

#### `zips`
```javascript
{
  _id: String,           // ZIP code
  city: String,
  state: String,         // 2-letter state code
  pop: Number,           // Population
  loc: [Number, Number]  // [longitude, latitude]
}
```

---

## Sample AirBnB

**Location:** `data/sample_airbnb/`
**Description:** Airbnb listings and reviews dataset
**Use Case:** Property rental analysis and review sentiment

### Collections

#### `listingsAndReviews`
```javascript
{
  _id: String,
  listing_url: String,
  name: String,
  summary: String,
  space: String,
  description: String,
  neighborhood_overview: String,
  notes: String,
  transit: String,
  access: String,
  interaction: String,
  house_rules: String,
  property_type: String,
  room_type: String,
  bed_type: String,
  minimum_nights: String,
  maximum_nights: String,
  cancellation_policy: String,
  last_scraped: Date,
  calendar_last_scraped: Date,
  first_review: Date,
  last_review: Date,
  accommodates: Number,
  bedrooms: Number,
  beds: Number,
  number_of_reviews: Number,
  bathrooms: Decimal128,
  amenities: [String],
  price: Decimal128,
  security_deposit: Decimal128,
  cleaning_fee: Decimal128,
  extra_people: Decimal128,
  guests_included: Decimal128,
  images: {
    thumbnail_url: String,
    medium_url: String,
    picture_url: String,
    xl_picture_url: String
  },
  host: {
    host_id: String,
    host_url: String,
    host_name: String,
    host_location: String,
    host_about: String,
    host_response_time: String,
    host_thumbnail_url: String,
    host_picture_url: String,
    host_neighbourhood: String,
    host_response_rate: Number,
    host_is_superhost: Boolean,
    host_has_profile_pic: Boolean,
    host_identity_verified: Boolean,
    host_listings_count: Number,
    host_total_listings_count: Number,
    host_verifications: [String]
  },
  address: {
    street: String,
    suburb: String,
    government_area: String,
    market: String,
    country: String,
    country_code: String,
    location: {
      type: "Point",
      coordinates: [Number, Number],  // [longitude, latitude]
      is_location_exact: Boolean
    }
  },
  availability: {
    availability_30: Number,
    availability_60: Number,
    availability_90: Number,
    availability_365: Number
  },
  review_scores: {
    review_scores_accuracy: Number,
    review_scores_cleanliness: Number,
    review_scores_checkin: Number,
    review_scores_communication: Number,
    review_scores_location: Number,
    review_scores_value: Number,
    review_scores_rating: Number
  },
  reviews: [
    {
      _id: String,
      date: Date,
      listing_id: String,
      reviewer_id: String,
      reviewer_name: String,
      comments: String
    }
  ]
}
```

---

## Sample Analytics

**Location:** `data/sample_analytics/`
**Description:** Financial services customer and transaction data
**Use Case:** Customer analytics and transaction patterns

### Collections

#### `customers`
```javascript
{
  _id: ObjectId,
  username: String,
  name: String,
  address: String,
  birthdate: Date,
  email: String,
  accounts: [Number],      // Array of account numbers
  tier_and_details: {
    tier: String,          // "Bronze", "Silver", "Gold", "Platinum"
    id: String,
    active: Boolean,
    benefits: [String]
  }
}
```

#### `accounts`
```javascript
{
  _id: ObjectId,
  account_id: Number,
  limit: Number,
  products: [String]       // "Brokerage", "Commodity", "InvestmentStock", etc.
}
```

#### `transactions`
```javascript
{
  _id: ObjectId,
  account_id: Number,
  transaction_count: Number,
  bucket_start_date: Date,
  bucket_end_date: Date,
  transactions: [
    {
      date: Date,
      amount: Number,
      transaction_code: String,   // "buy", "sell", "deposit", "withdraw"
      symbol: String,             // Stock symbol or transaction type
      price: String,
      total: String
    }
  ]
}
```

---

## Sample MFlix

**Location:** `data/sample_mflix/`
**Description:** Movie database with detailed film information
**Use Case:** Movie recommendation and review system

### Collections

#### `movies`
```javascript
{
  _id: ObjectId,
  plot: String,
  genres: [String],
  runtime: Number,
  cast: [String],
  num_mflix_comments: Number,
  poster: String,
  title: String,
  fullplot: String,
  languages: [String],
  released: Date,
  directors: [String],
  writers: [String],
  awards: {
    wins: Number,
    nominations: Number,
    text: String
  },
  lastupdated: String,
  year: Number,
  imdb: {
    rating: Number,
    votes: Number,
    id: Number
  },
  countries: [String],
  type: String,
  tomatoes: {
    viewer: {
      rating: Number,
      numReviews: Number,
      meter: Number
    },
    dvd: Date,
    critic: {
      rating: Number,
      numReviews: Number,
      meter: Number
    },
    lastUpdated: Date,
    consensus: String,
    rotten: Number,
    production: String,
    fresh: Number
  },
  rated: String
}
```

#### `comments`
```javascript
{
  _id: ObjectId,
  movie_id: ObjectId,
  user: {
    name: String,
    email: String
  },
  text: String,
  date: Date
}
```

#### `users`
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String
}
```

#### `sessions`
```javascript
{
  _id: ObjectId,
  user_id: String,
  jwt: String
}
```

#### `theaters`
```javascript
{
  _id: ObjectId,
  theaterId: Number,
  location: {
    address: {
      street1: String,
      city: String,
      state: String,
      zipcode: String
    },
    geo: {
      type: "Point",
      coordinates: [Number, Number]  // [longitude, latitude]
    }
  }
}
```

---

## Sample Geospatial

**Location:** `data/sample_geospatial/`
**Description:** Shipwreck locations with coordinates
**Use Case:** Geospatial queries and mapping

### Collections

#### `shipwrecks`
```javascript
{
  _id: ObjectId,
  feature_type: String,
  chart: String,
  latdec: Number,        // Latitude decimal
  londec: Number,        // Longitude decimal
  coordinates: [Number, Number],  // [longitude, latitude]
  gp_quality: String,
  depth: Number,
  sounding_type: String,
  history: String,
  quasou: String,
  watlev: String,
  recrd: String,
  vesslterms: String,
  name: String
}
```

---

## Sample Supplies

**Location:** `data/sample_supplies/`
**Description:** Office supply sales data
**Use Case:** Sales analysis and inventory management

### Collections

#### `sales`
```javascript
{
  _id: ObjectId,
  saleDate: Date,
  items: [
    {
      name: String,
      tags: [String],
      price: Decimal128,
      quantity: Number
    }
  ],
  storeLocation: String,
  customer: {
    gender: String,      // "M" or "F"
    age: Number,
    email: String,
    satisfaction: Number  // 1-5
  },
  couponUsed: Boolean,
  purchaseMethod: String  // "Online", "Phone", "In store"
}
```

---

## Sample Weather

**Location:** `data/sample_weatherdata/`
**Description:** Weather sensor readings
**Use Case:** Time-series data analysis

### Collections

#### `data`
```javascript
{
  _id: ObjectId,
  st: String,           // Station identifier
  ts: Date,            // Timestamp
  position: {
    type: "Point",
    coordinates: [Number, Number]  // [longitude, latitude]
  },
  elevation: Number,
  callLetters: String,
  qualityControlProcess: String,
  dataSource: String,
  type: String,
  airTemperature: {
    value: Number,
    quality: String
  },
  dewPoint: {
    value: Number,
    quality: String
  },
  pressure: {
    value: Number,
    quality: String
  },
  wind: {
    direction: {
      angle: Number,
      quality: String
    },
    type: String,
    speed: {
      rate: Number,
      quality: String
    }
  },
  visibility: {
    distance: {
      value: Number,
      quality: String
    },
    variability: {
      value: String,
      quality: String
    }
  },
  skyCondition: {
    ceilingHeight: {
      value: Number,
      quality: String,
      determination: String
    },
    cavok: String
  },
  sections: [String],
  precipitationEstimatedObservation: {
    discrepancy: String,
    estimatedWaterDepth: Number
  },
  pastWeatherObservationManual: {
    atmosphericCondition: {
      value: String,
      quality: String
    },
    period: {
      value: Number,
      quality: String
    }
  },
  presentWeatherObservationManual: {
    condition: String,
    quality: String
  },
  atmosphericPressureChange: {
    tendency: {
      code: String,
      quality: String
    },
    quantity3Hours: {
      value: Number,
      quality: String
    },
    quantity24Hours: {
      value: Number,
      quality: String
    }
  },
  seaSurfaceTemperature: {
    value: Number,
    quality: String
  },
  waveMeasurement: {
    waves: {
      period: Number,
      height: Number,
      quality: String
    },
    seaState: {
      code: String,
      quality: String
    }
  }
}
```

---

## World Database

**Location:** `data/world-db/`
**Description:** Countries, cities, and languages information
**Use Case:** Geographic and demographic analysis

### Collections

#### `countries`
```javascript
{
  _id: ObjectId,
  code: String,          // ISO country code
  name: String,
  continent: String,
  region: String,
  surface_area: Number,
  indep_year: Number,
  population: Number,
  life_expectancy: Number,
  gnp: Number,
  gnp_old: Number,
  local_name: String,
  government_form: String,
  head_of_state: String,
  capital: Number,       // City ID
  code2: String         // 2-letter ISO code
}
```

#### `cities`
```javascript
{
  _id: ObjectId,
  id: Number,
  name: String,
  country_code: String,
  district: String,
  population: Number
}
```

#### `languages`
```javascript
{
  _id: ObjectId,
  country_code: String,
  language: String,
  is_official: Boolean,
  percentage: Number
}
```

---

## Additional Datasets

### ColoradoScooters
**Location:** `data/ColoradoScooters/`
**Description:** Scooter rental and usage data
**Collections:** `rentals`, `scooters`, `stations`

### Crunchbase
**Location:** `data/crunchbase/`
**Description:** Startup and investment data
**Collections:** `companies`, `people`, `acquisitions`

### Enron
**Location:** `data/enron/`
**Description:** Email communications dataset
**Collections:** `emails`, `users`

### FoodMart
**Location:** `data/foodmart/`
**Description:** Retail food store transactions
**Collections:** `products`, `stores`, `sales`, `customers`

### Movies Kaggle
**Location:** `data/movies_kaggle/`
**Description:** Extended movie dataset from Kaggle
**Collections:** `movies`, `credits`, `keywords`, `ratings`

### Wine Quality
**Location:** `data/wine_quality/`
**Description:** Wine characteristics and quality ratings
**Collections:** `red_wines`, `white_wines`

---

## Data Loading Instructions

### Using MongoDB Shell

```bash
# Load JSON file
mongoimport --uri="mongodb://labuser:labpass123@localhost:27017/nosql_labs" \
            --collection=collection_name \
            --file=path/to/file.json

# Load JavaScript file
mongosh -u labuser -p labpass123 nosql_labs < path/to/script.js
```

### Using Docker

```bash
# Copy file to container
docker cp data/sample.json nosql-labs-mongodb:/tmp/

# Import in container
docker exec nosql-labs-mongodb mongoimport \
  -u labuser -p labpass123 \
  --authenticationDatabase nosql_labs \
  --db nosql_labs --collection sample \
  --file /tmp/sample.json
```

### Using Python

```python
from pymongo import MongoClient
import json

client = MongoClient("mongodb://labuser:labpass123@localhost:27017/nosql_labs")
db = client.nosql_labs

with open('data/sample.json', 'r') as f:
    data = json.load(f)
    db.collection_name.insert_many(data)
```

---

## Schema Validation

MongoDB supports JSON Schema validation. Example:

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email"],
      properties: {
        name: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "must be a valid email address and is required"
        },
        age: {
          bsonType: "int",
          minimum: 0,
          maximum: 120,
          description: "must be an integer between 0 and 120"
        }
      }
    }
  }
})
```

---

## Best Practices

1. **Indexing**: Create indexes on frequently queried fields
2. **Embedding vs Referencing**: Embed for 1:1 and 1:few, reference for 1:many
3. **Document Size**: Keep documents under 16MB (MongoDB limit)
4. **Field Names**: Use consistent naming conventions (camelCase or snake_case)
5. **Data Types**: Use appropriate BSON types (ObjectId, Date, Decimal128, etc.)

---

## Resources

- [MongoDB Schema Design Best Practices](https://www.mongodb.com/blog/post/6-rules-of-thumb-for-mongodb-schema-design)
- [MongoDB Data Types](https://docs.mongodb.com/manual/reference/bson-types/)
- [MongoDB Import/Export Tools](https://docs.mongodb.com/database-tools/mongoimport/)
- [JSON Schema Validation](https://docs.mongodb.com/manual/core/schema-validation/)

---

*Last updated: December 2024*