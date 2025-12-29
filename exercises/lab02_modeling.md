# Lab 02 – Practice Exercises

Design-first scenarios that extend the official modeling lab. Keep them in a separate working directory (e.g., `labs/lab02_modeling/practice/`) so they don’t interfere with graded deliverables.

---

## Exercise A · Rental Marketplace

**Scenario:** Short-term rentals with hosts, listings, reservations, and reviews.

Tasks:

1. Model hosts → listings as a one-to-many relationship using embedding for the most frequent queries.
2. Reservations must store snapshot info for listing title, nightly price, and host rating. Document the denormalization trade-offs.
3. Reviews reference both the listing and the guest; design indexes to support:
   - “All reviews for listing X ordered by date.”
   - “All reviews written by guest Y in the last 6 months.”
4. Provide validation rules ensuring:
   - `reservation.checkOut > checkIn`
   - `review.rating` between 1–5.

Deliverables: ER-style diagram (Markdown table or mermaid) and JSON schema snippets.

## Exercise B · Fitness App

**Scenario:** Users log workouts, nutrition entries, and wearable sensor summaries.

Tasks:

1. Pick three core read patterns (e.g., “last 30 workouts”, “daily calorie summary”, “sensor anomalies”).
2. Propose at least two schema options (embedding vs referencing) and analyze trade-offs for each read pattern.
3. Implement a `validation_schemas_practice.js` file capturing your final design.
4. Run a micro-benchmark to compare update costs between designs (use simple loops inserting 1k documents).

## Exercise C · Support Ticketing

**Scenario:** Multi-tenant SaaS for customer support.

Tasks:

1. Tenants own their own agents, customers, and tickets. Minimize data leakage risk.
2. Model ticket timelines with mixed content (text, attachments, status changes). Consider using buckets or referencing to keep documents under 16 MB.
3. Define partial indexes or compound indexes that support:
   - “Open tickets per tenant sorted by priority.”
   - “Tickets updated in the last 24h with SLA breached.”
4. Provide migration steps to move from single-tenant to multi-tenant layout.

Document each exercise in `labs/lab02_modeling/practice/README.md` or split by subfolders if you prefer.
