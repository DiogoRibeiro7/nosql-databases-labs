# Group 13 – Architecture & Data Model

## Domain Snapshot

The municipality sponsors rotating weekend night markets across Porto. Each event hosts 3–4 rotating food vendors and generates hundreds of small basket orders. The project delivers actionable insights on:

1. Which vendors drive the most revenue per event and time period?
2. How do wait times and customer satisfaction vary by event/vendor pair?
3. Which neighborhoods deliver the highest repeat customer attendance?
4. What are the operational bottlenecks during peak hours?

## Collections

| Collection | Role | Notes |
| ---------- | ---- | ----- |
| `vendors` | Reference/master data | Stable identifiers (`vendorId`) enriched with operational capacity, tier, and featured items. |
| `events` | Semi-static reference data | Embeds venue details to avoid additional joins during reporting. |
| `orders` | Fact/telemetry | Each document captures the sales basket, wait time, payment method, customer segmentation, and feedback. |

### Schema Highlights

```javascript
// vendors
{
  _id: ObjectId,
  vendorId: "VNDR-02",
  name: "Mar Atlântico Bowls",
  cuisine: "Seafood fusion",
  featuredItems: ["cod ceviche", "ocean quinoa bowl"],
  prepMinutes: Number,
  capacityPerEvent: Number,
  partnershipTier: "silver",
  avgRating: Number
}

// events
{
  _id: ObjectId,
  eventCode: "EVT-PRT-RIVERSIDE-002",
  title: "Douro Riverside Brunch",
  eventDate: ISODate("2025-08-02T10:00:00Z"),
  venue: { 
    name: "Jardins do Palácio", 
    neighborhood: "Massarelos", 
    capacity: 900 
  },
  focusAreas: ["families", "live music"],
  vendors: ["VNDR-01", "VNDR-02", "VNDR-04"],
  sustainabilityTier: "A"
}

// orders
{
  _id: ObjectId,
  orderCode: "ORD-0010",
  eventCode: "EVT-PRT-ARTISANS-003",        // reference to events.eventCode
  vendorId: "VNDR-02",                      // reference to vendors.vendorId
  customer: { 
    customerId: "CUS-109", 
    district: "Gaia", 
    returning: false 
  },
  items: [
    { name: "cod ceviche", qty: 1, unitPrice: 10.5 }
  ],
  totalAmount: NumberDecimal,
  waitTimeMinutes: NumberInt,
  customerRating: Number,
  paymentMethod: "card",
  createdAt: ISODate("2025-09-14T20:30:00Z")
}
```

### Modeling Decisions

1. **Event venue embedded** – Venues remain stable per event; embedding eliminates costly lookups and enables self-contained reporting dashboards.

2. **Customer dimension kept minimal** – Only coarse-grained segmentation (district, loyalty flag) stored to respect privacy, yet sufficient for geographic and behavioral analysis.

3. **Order items embedded** – Orders are transient; embedding items avoids document fragmentation and accelerates sum/average aggregations across all orders.

4. **Denormalized ratings** – Both vendor average ratings and per-order customer ratings enable fast satisfaction trend analysis without additional lookups.

## Relationships & Access Patterns

- `orders` → `events` (N:1 via `eventCode`)
- `orders` → `vendors` (N:1 via `vendorId`)
- **Primary aggregations:** Orders grouped by event, vendor, district, or hourly time windows
- **Secondary filters:** Partnership tier, sustainability tier, customer loyalty status
- **Reporting:** Revenue KPIs, wait-time trends, neighborhood heatmaps, repeat visitor segmentation

## Index Blueprint

Indexes created by `queries/index_blueprint.mongosh.js`:

```
orders:
  1. { eventCode: 1, vendorId: 1, createdAt: 1 }
     └─ Supports: revenue rollups, satisfaction by event/vendor, timeline queries
  
  2. { customer.customerId: 1 }
     └─ Supports: loyalty detection, repeat visitor segmentation, visit frequency
  
  3. { customer.district: 1 }
     └─ Supports: neighborhood heatmaps, geographic demand analysis
  
  4. { createdAt: 1 }
     └─ Supports: hourly ops metrics, time-series dashboards, rolling aggregations

vendors:
  5. { vendorId: 1 } UNIQUE
     └─ Prevents: accidental duplicate vendor records during data imports

events:
  6. { eventCode: 1 } UNIQUE
     └─ Prevents: accidental duplicate event records during data imports
```

## Query Families & Coverage

**Group 13's 20 queries are organized across four analytical domains:**

| Query Range | Domain | Sample Questions |
| ----------- | ------ | ---------------- |
| 01–05 | Revenue & Satisfaction | Top vendors by revenue, avg ratings by event/vendor, payment mix analysis |
| 06–10 | Loyalty & Repeat Visitors | Repeat customer counts, visit frequency by district, multi-visit patterns |
| 11–15 | Geographic & Operational | Neighborhood demand heatmaps, vendor presence across events, district loyalty |
| 16–20 | Hourly & Time-Series Metrics | Service pulse by hour, wait-time trends, vendor rankings, collection statistics |

## Rationale for Pure mongosh Implementation

- **Reproducibility:** No external driver dependencies simplifies grading and eliminates environment setup friction.
- **Idempotency:** All scripts use drop-and-recreate patterns for data import; index recreation is always safe.
- **Clarity:** Aggregation pipelines are readable inline; no ORM abstraction layer obscures the actual MongoDB operations.

---

**Last updated:** January 22, 2026  
**Group:** 13  
**Domain:** Porto Night Markets Vendor Analytics
