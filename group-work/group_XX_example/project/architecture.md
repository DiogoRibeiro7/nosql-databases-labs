# Architecture & Data Model

## Domain Snapshot

The municipality sponsors weekend night markets. Each event hosts 3–4 rotating vendors and generates hundreds of small basket orders. The project needs to answer:

1. Which vendors drive the most revenue per hour?
2. How do wait times vary by event/vendor pair?
3. Which neighborhoods deliver the highest repeat attendance?

## Collections

| Collection | Role | Notes |
| ---------- | ---- | ----- |
| `vendors` | Reference/master data | Stable identifiers (`vendorId`) enriched with operational capacity, tier, and featured items. |
| `events` | Semi-static reference data | Embeds venue details to avoid additional joins during reporting. |
| `orders` | Fact/telemetry | Each document captures the sales basket, wait time, payment method, and minimal customer segmentation. |

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
  partnershipTier: "silver"
}

// events
{
  _id: ObjectId,
  eventCode: "EVT-PRT-RIVERSIDE-002",
  title: "Douro Riverside Brunch",
  eventDate: ISODate("2025-08-02T10:00:00Z"),
  venue: { name: "Jardins do Palácio", neighborhood: "Massarelos", capacity: 900 },
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
  customer: { customerId: "CUS-109", district: "Gaia", returning: false },
  items: [{ name: "cod ceviche", qty: 1, unitPrice: 10.5 }],
  totalAmount: NumberDecimal,
  waitTimeMinutes: NumberInt,
  feedbackScore: 4.5,
  createdAt: ISODate("2025-09-14T20:30:00Z")
}
```

### Modeling Decisions

1. **Event venue embedded** – Venues rarely change per event, so embedding reduces lookups and keeps slides self-explanatory.
2. **Customer dimension kept minimal** – Only coarse-grained data (district + loyalty flag) is stored to avoid PII, yet still supports segmentation.
3. **Order items embedded** – Orders are short-lived analytics data; embedding keeps totals and averages in a single document for faster aggregations.

## Relationships & Access Patterns

- `orders` → `events` (N:1 via `eventCode`).
- `orders` → `vendors` (N:1 via `vendorId`).
- Most dashboards aggregate orders grouped by event, vendor, district, or time windows.
- Rare admin tasks filter by `partnershipTier` or `sustainabilityTier`.

## Index Blueprint

- `orders` composite index `{ eventCode: 1, vendorId: 1, createdAt: 1 }` – supports top-line KPI rollups and chronological trend charts.
- `orders` index `{ customer.customerId: 1 }` – allows deduplicating visitors without scanning the entire collection.
- `vendors` unique index `{ vendorId: 1 }` and `events` unique index `{ eventCode: 1 }` – prevents accidental duplicates when importing data from spreadsheets.

Indexes are provisioned via `queries/index_blueprint.mongosh.js` so students can reapply them after a drop/reload cycle.
