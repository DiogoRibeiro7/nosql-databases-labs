# Performance Notes

> All metrics were captured locally on MongoDB Community 7.0 running on the default Docker compose stack. Numbers focus on patterns, not raw throughput.

## Workload Recap

- 6 collections: `airlines`, `airports`, `countries`, `users`, `flights`, `reservations`
- 20 primary queries covering:
  1. **CRUD Operations** – Create reservations, update user info, cancel flights
  2. **Route Queries** – Find flights by route and date, cheapest flights, popular routes
  3. **Revenue Analytics** – Total revenue by airline, customer lifetime value
  4. **Capacity Management** – Available seats, low occupancy flights
  5. **Customer Analytics** – User reservations, most active users
  6. **Operational Queries** – Daily flights, upcoming landings, flight status

## Index Coverage

After running `queries/index_blueprint.mongosh.js`, the collection stats show:

```
airlines:
  - { airlineIata: 1 } unique, sparse          // guards reference integrity
airports:
  - { airportIdent: 1 } unique, sparse          // guards reference integrity
  - { municipality: 1 }                        // supports city-based airport queries (Query 07)
users:
  - { email: 1 } unique                         // guards reference integrity
flights:
  - { departureAirportIdent: 1, arrivalAirportIdent: 1, departureTime: 1 }  // supports route and date queries
  - { flightNumber: 1 }                         // supports flight lookups and joins
  - { airlineIata: 1 }                          // supports airline aggregations
  - { status: 1 }                               // supports status filtering
  - { departureAirportIdent: 1, status: 1 }     // supports canceling flights by airport (Query 03)
  - { arrivalAirportIdent: 1, arrivalTime: 1, status: 1 }  // supports upcoming landings (Query 08)
  - { departureTime: 1, status: 1 }             // supports last call flights (Query 09)
  - { status: 1, price: 1 }                     // supports price range queries with sorting (Query 20)
reservations:
  - { userId: 1 }                               // supports user reservation lookups
  - { flightNumber: 1 }                         // supports flight reservation lookups
  - { flightNumber: 1, status: 1 }              // supports capacity calculations
  - { flightId: 1 }                             // alternative lookup path
  - { status: 1, userId: 1 }                    // supports user analytics queries (Query 16, Query 18)
```

## Query Performance Analysis

### Query 01: Create Flight Reservation
**Execution Stats:**
- Execution Time: 10 ms
- Documents Examined: 0
- Documents Returned: 1
- Indexes Used: None (direct insert)

### Query 02: Update User Email
**Execution Stats:**
- Execution Time: 1 ms
- Documents Examined: 1
- Documents Modified: 1
- Indexes Used: `_id_`

### Query 03: Cancel All Airport Flights
**Execution Stats:**
- Execution Time: 1 ms
- Documents Examined: 21
- Documents Modified: 21
- Indexes Used: None (COLLSCAN)

### Query 04: Find User Reservations
**Execution Stats:**
- Execution Time: 14 ms
- Documents Examined: 9,188
- Documents Returned: 9,188
- Keys Examined: 9,188
- Indexes Used: `userId_1`

### Query 05: Check Flight Available Seats
**Execution Stats:**
- Execution Time: 2 ms
- Documents Examined: 1
- Documents Returned: 1
- Keys Examined: 1
- Indexes Used: `flightNumber_1`

### Query 06: Daily Flights by Airport
**Execution Stats:**
- Execution Time: 1 ms
- Documents Examined: 0
- Documents Returned: 0
- Keys Examined: 22
- Indexes Used: `departureAirportIdent_1_arrivalAirportIdent_1_departureTime_1`

### Query 07: List Airports in City
**Execution Stats:**
- Execution Time: 0 ms
- Documents Examined: 465
- Documents Returned: 2
- Keys Examined: 0
- Indexes Used: None (COLLSCAN)

### Query 08: Upcoming Airport Landings
**Execution Stats:**
- Execution Time: 6 ms
- Documents Examined: 9,477
- Documents Returned: 2
- Keys Examined: 9,478
- Indexes Used: `status_1`

### Query 09: Last Call Flights Status
**Execution Stats:**
- Execution Time: 0 ms
- Documents Examined: 1,220
- Documents Returned: 1
- Keys Examined: 1,220
- Indexes Used: `status_1`

### Query 10: Airlines Operating at Airport
**Execution Stats:**
- Execution Time: 1 ms
- Documents Examined: 21
- Documents Returned: 21
- Keys Examined: 21
- Indexes Used: `departureAirportIdent_1_arrivalAirportIdent_1_departureTime_1`

### Query 11: Find Flights by Route and Date
**Execution Stats:**
- Execution Time: 0 ms
- Documents Examined: 21
- Documents Returned: 21
- Keys Examined: 21
- Indexes Used: `departureAirportIdent_1_arrivalAirportIdent_1_departureTime_1`, `status_1`

### Query 12: Cheapest Flights by Route
**Execution Stats:**
- Execution Time: 0 ms
- Documents Examined: 22
- Documents Returned: 5
- Keys Examined: 22
- Indexes Used: `departureAirportIdent_1_arrivalAirportIdent_1_departureTime_1`, `status_1`

### Query 13: Total Revenue by Airline
**Execution Stats:**
- Execution Time: 1 ms
- Documents Examined: 14
- Documents Returned: 1
- Keys Examined: 14
- Indexes Used: `airlineIata_1`

### Query 14: Most Popular Routes
**Execution Stats:**
- Execution Time: 398 ms
- Documents Examined: 0
- Documents Returned: 10
- Keys Examined: 0
- Indexes Used: None (COLLSCAN)

### Query 15: Average Flight Duration by Route
**Execution Stats:**
- Execution Time: 18 ms
- Documents Examined: 10,025
- Documents Returned: 9,754
- Keys Examined: 0
- Indexes Used: None (COLLSCAN)

### Query 16: Users with Most Reservations
**Execution Stats:**
- Execution Time: 170 ms
- Documents Examined: 534,197
- Documents Returned: 10
- Keys Examined: 0
- Indexes Used: None (COLLSCAN)

### Query 17: Flights with Low Occupancy
**Execution Stats:**
- Execution Time: 440 ms
- Documents Examined: 10,025
- Documents Returned: 9,964
- Keys Examined: 0
- Indexes Used: None (COLLSCAN)

### Query 18: Customer Lifetime Value
**Execution Stats:**
- Execution Time: 4,268 ms (4.3 seconds)
- Documents Examined: 58
- Documents Returned: 20
- Keys Examined: 0
- Indexes Used: None (COLLSCAN)

### Query 19: Cancellation Analysis by Route
**Execution Stats:**
- Execution Time: 587 ms
- Documents Examined: 10,025
- Documents Returned: 9,727
- Keys Examined: 0
- Indexes Used: None (COLLSCAN)

### Query 20: Find Flights by Price Range
**Execution Stats:**
- Execution Time: 7 ms
- Documents Examined: 9,477
- Documents Returned: 9,295
- Keys Examined: 9,478
- Indexes Used: `status_1`
