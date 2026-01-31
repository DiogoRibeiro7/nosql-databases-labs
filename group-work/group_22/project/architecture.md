# Architecture & Data Model

## Domain Snapshot

FoodExpress operates a network of restaurant partners that accept online orders and deliver short, frequent baskets. The project focuses on analyzing restaurant performance, menu popularity, and order trends to answer questions such as:

1. Which restaurants generate the most revenue and at what times?
2. What menu items are most popular per restaurant and category?
3. How does basket size and repeat ordering vary by restaurant?

## Collections

| Collection | Role | Notes |
| ---------- | ---- | ----- |
| `restaurants` | Reference/master data | Restaurant profiles and operating metadata (address, cuisine, open hours). |
| `menu_items` | Reference/catalog | Menu catalogue for restaurants with category, price and availability. |
| `orders` | Fact/transactions | Each order records customer meta, totals, timestamps and a summary of items. |
| `order_items` | Order detail | Line-item level details for orders (used for detailed reporting and inventory analysis). |

## Schema Highlights

```javascript
// restaurants
{
	_id: ObjectId,
	restaurantId: "RST-1001",
	name: "Mama Rosa",
	address: { city: "Denver", neighborhood: "LoDo" },
	cuisine: "Italian",
	rating: 4.5,
	openHours: [{ day: "Mon", open: "11:00", close: "21:30" }],
	tags: ["family", "takeout"]
}

// menu_items
{
	_id: ObjectId,
	menuItemId: "MI-9001",
	restaurantId: "RST-1001",
	name: "Margherita Pizza",
	category: "pizza",
	price: NumberDecimal("12.50"),
	active: true
}

// order_items
{
	_id: ObjectId,
	orderItemId: "OI-3001",
	orderId: "ORD-2001",
	menuItemId: "MI-9001",
	qty: 2,
	unitPrice: NumberDecimal("12.50")
}

// orders
{
	_id: ObjectId,
	orderId: "ORD-2001",
	restaurantId: "RST-1001",
	customer: { customerId: "CUS-501", neighborhood: "LoDo", returning: true },
	itemsSummary: [{ menuItemId: "MI-9001", qty: 2, lineTotal: NumberDecimal("25.00") }],
	totalPrice: NumberDecimal("25.00"), 
	status: "delivered",
	createdAt: ISODate("2025-09-14T20:30:00Z")
}
```

## Modeling Decisions

- `order_items` separated from `orders` for pedagogical clarity: `orders` stores a compact `itemsSummary` for fast aggregations while `order_items` holds line-level records for detailed analytics and joins.
- `menu_items` is a catalog collection, enabling joins/lookup to evaluate item-level popularity across restaurants.

## Relationships & Access Patterns

- `orders` → `restaurants` (N:1 via `restaurantId`) — dashboards roll up revenue and basket KPIs by restaurant.
- `orders` → `order_items` (1:N via `orderId`) — detailed item-level analytics and top-dish queries.
- `order_items` → `menu_items` (N:1 via `menuItemId`) — enrich line items with category and price for category-level reports.

Common queries this model supports:
- Top N restaurants by revenue and rating over time windows.
- Top menu items per restaurant and per category.
- Revenues per restaurant.

## Index Blueprint

- `orders` composite index `{ restaurantId: 1, createdAt: 1 }` — supports time-windowed revenue and trends.
- `orders` index `{ customer.customerId: 1 }` — allows quick customer-level lookups for loyalty analysis.
- `restaurants` index `{ restaurantId: 1 }` (unique) and `{ address.city: 1, cuisine: 1 }` — supports geo and cuisine filters.
- `menu_items` index `{ restaurantId: 1, category: 1, price: 1 }` — speeds category-level aggregations and price filtering.
- `order_items` index `{ orderId: 1 }` and `{ menuItemId: 1 }` — speeds joins and top-item calculations.


## Notes & Next Steps

- Seed data: run the provided `seed.js` to populate `restaurants`, `menu_items`, `orders`, and `order_items` for hands-on queries.
