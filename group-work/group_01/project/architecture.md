# Architecture & Data Model

## Domain Snapshot

The Flight Management System tracks airline operations, flight schedules, and passenger reservations. The system needs to answer:

1. Which routes are most popular based on confirmed reservations?
2. What is the revenue performance by airline?
3. Which flights have low occupancy and may need pricing adjustments?
4. What is the customer lifetime value for frequent travelers?
5. How do cancellation rates vary by route?

## Collections

| Collection      | Role                    | Notes                                                                                    |
| --------------- | ----------------------- | ---------------------------------------------------------------------------------------- |
| `airlines`      | Reference/master data   | Stable identifiers (`airlineIata`) with airline name and country code.                  |
| `airports`      | Reference/master data   | Airport identifiers (`airportIdent`) with location metadata (continent, country, city). |
| `countries`     | Reference/master data   | Country codes and metadata.                                                              |
| `users`         | Reference/master data   | User accounts with email (unique), name, and authentication data.                       |
| `flights`       | Fact/transactional data | Each document represents a scheduled flight with route, timing, capacity, and pricing.  |
| `reservations`  | Fact/transactional data | Each document captures a passenger reservation linked to a flight and user.              |

### Schema Highlights

```javascript
// airlines
{
  _id: ObjectId,
  airlineIata: "NI",                                        // Unique IATA code
  name: "1Time Airline",
  country: "ZA"
}

// airports
{
  _id: ObjectId,
  airportIdent: "KSYR",                                     // Unique airport identifier
  name: "Syracuse Hancock International Airport",
  continent: "NA",
  country: "US",
  municipality: "Syracuse"
}

// countries
{
  _id: ObjectId,
  code: "US",                                               // Country code
  name: "United States",
}

// users
{
  _id: ObjectId,
  email: "john.smith@example.com",                          // Unique email
  firstName: "John",
  lastName: "Smith",
  passwordHash: "$2b$10$..."                                // Hashed password
}

// flights
{
  _id: ObjectId,
  flightNumber: "NI5666",                                   // Unique flight identifier
  airlineIata: "NI",                                        // Reference to airlines.airlineIata
  departureAirportIdent: "KSYR",                            // Reference to airports.airportIdent
  arrivalAirportIdent: "MMHO",                              // Reference to airports.airportIdent
  departureTime: ISODate("2024-02-25T05:29:55Z"),
  arrivalTime: ISODate("2024-02-25T10:30:55Z"),
  maxCapacity: 197,
  status: "completed",                                      // completed, scheduled, cancelled, delayed
  price: 175.42
}

// reservations
{
  _id: ObjectId,
  flightNumber: "VD9531",                                   // Reference to flights.flightNumber
  userId: ObjectId("..."),                                  // Reference to users._id
  seatNumber: "61F",
  status: "confirmed",                                      // confirmed, pending, cancelled
  reservationDate: ISODate("2025-01-15T10:30:00Z"),
  amount: 324.17                                            // optional; paid amount (fare class). If absent, revenue uses flight.price
}
```

### Modeling Decisions

1. **Reference-based relationships** – Flights reference airlines and airports via IATA/ident codes rather than embedding. This allows:
   - Efficient updates to airline/airport metadata without touching flight documents
   - Reduced document size for high-volume flight data
   - Clear referential integrity through unique indexes

2. **Reservations reference flights by flightNumber** – Using `flightNumber` (string) instead of `flightId` (ObjectId) provides:
   - Human-readable queries and debugging
   - Easier data import from external systems

3. **Reservations reference users by ObjectId** – Using `userId` (ObjectId) ensures:
   - Strong referential integrity
   - Efficient lookups via indexed ObjectId fields
   - Support for user account management

4. **Flight status as string enum** – Status values (`completed`, `scheduled`, `cancelled`, `delayed`) enable:
   - Simple filtering and aggregation
   - Clear business logic in queries
   - Easy extension for future status types

5. **Separate collections for reference data** – Airlines, airports, and countries are kept separate to:
   - Minimize duplication across flight documents
   - Support independent updates and maintenance
   - Enable efficient lookups via indexes

## Relationships & Access Patterns

- `flights` → `airlines`      (N:1 via `airlineIata`)
- `flights` → `airports`      (N:1 via `departureAirportIdent` and `arrivalAirportIdent`)
- `reservations` → `flights`  (N:1 via `flightNumber`)
- `reservations` → `users`    (N:1 via `userId`)

### Primary Query Patterns

1. **Route-based queries** – Filter flights by departure/arrival airports and date ranges
2. **Reservation lookups** – Find all reservations for a user or flight
3. **Revenue analytics** – Aggregate reservations by airline, route, or time period
4. **Capacity management** – Calculate available seats by comparing flight capacity with confirmed reservations
5. **Customer analytics** – Group reservations by user to calculate lifetime value and frequency

## Index Blueprint

Indexes are provisioned via `queries/index_blueprint.mongosh.js`:

### Reference Data Indexes

- `airlines.airlineIata` (unique, sparse) – Ensures unique airline codes and supports lookups
- `airports.airportIdent` (unique, sparse) – Ensures unique airport identifiers and supports lookups
- `users.email` (unique) – Ensures unique user emails and supports authentication lookups

### Flight Indexes

- `flights.{departureAirportIdent, arrivalAirportIdent, departureTime}` (compound) – Supports route and date range queries (e.g., `11_find_flights_by_route_and_date.mongosh.js`)
- `flights.flightNumber` – Supports direct flight lookups and joins with reservations
- `flights.airlineIata` – Supports airline-based aggregations (e.g., `13_total_revenue_by_airline.mongosh.js`)
- `flights.status` – Supports filtering by flight status

### Reservation Indexes

- `reservations.userId` – Supports user reservation lookups (e.g., `04_find_user_reservations.mongosh.js`)
- `reservations.flightNumber` – Supports flight reservation lookups and joins
- `reservations.{flightNumber, status}` (compound) – Supports capacity calculations filtering by confirmed reservations (e.g., `05_check_flight_available_seats.mongosh.js`)
- `reservations.flightId` – Alternative lookup path if needed
