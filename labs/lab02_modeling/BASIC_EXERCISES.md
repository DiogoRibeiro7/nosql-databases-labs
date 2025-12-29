# Lab 02 – Basic Modeling Exercises

Use these prompts if you need a short warm-up before producing the full design package. Estimated time: 30 minutes.

---

## Exercise 1: Domain Snapshot

1. Pick one scenario (E-commerce, Content, or Custom) and list:
   - 3 entities (e.g., `Customer`, `Order`, `Product`)
   - 3 attributes per entity
2. Capture the list in `NOTES.md` under “Basic Exercises”.

## Exercise 2: Relationship Sketch

1. For each pair of entities, decide whether the relationship is 1:N, N:1, or N:M.
2. Note at least one justification (e.g., “One order has many items, but each item belongs to exactly one order”).
3. Write this as a bullet table or ASCII diagram.

## Exercise 3: Embedding vs Referencing Checklist

Create a mini-table with columns `Relationship`, `Embedding?`, `Why/Why not?`. Fill it out for at least three relationships. Aim for quick heuristics, e.g., “Orders → Items: Embed because items are always fetched with orders”.

## Exercise 4: Sample Document Draft

1. Draft one example document in JSON for a key collection (Orders or Posts).
2. Keep it simple—2 nesting levels max—but include at least one array.
3. Validate the JSON using `jq` or an online tool, then save it as `examples/basic_order.json`.

---

Completing these basics should give you enough clarity to begin the full conceptual and logical models described in the main README.
