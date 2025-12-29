# Load Stocks JSONL into MongoDB (3 collections)

This guide loads four JSONL files into MongoDB and produces **exactly 3 collections**:

* `securities` — **securities + embedded fundamentals** (one document per ticker)
* `prices` — raw daily prices (time-series if supported)
* `prices_split_adjusted` — split-adjusted daily prices (time-series if supported)

The pipeline uses two **staging collections** internally:

* `securities_raw`
* `fundamentals_stage`

These are dropped at the end.

---

## Input files

Place these files in the same folder (example: `./data/`):

* `securities.jsonl`
* `fundamentals.jsonl`
* `prices.jsonl`
* `prices-split-adjusted.jsonl`

Each file must be **JSON Lines** (one JSON object per line).

Example rows (your dataset):

* `fundamentals.jsonl`

  * has keys like `"Ticker Symbol"`, `"Period Ending"`, and many metric columns
* `securities.jsonl`

  * has keys like `"Ticker symbol"`, `"Security"`, `"GICS Sector"`, `"CIK"`
* `prices.jsonl`

  * has `date` like `"2016-01-05 00:00:00"`
* `prices-split-adjusted.jsonl`

  * has `date` like `"2016-01-05"`

---

## What you will get in MongoDB

### 1) `securities`

One document per ticker, with fundamentals embedded:

```js
{
  _id: "MMM",
  ticker: "MMM",
  name: "3M Company",
  sec_filings: "reports",
  gics_sector: "Industrials",
  gics_sub_industry: "Industrial Conglomerates",
  hq_address: "St. Paul, Minnesota",
  date_first_added: null,
  cik: 66740,
  fundamentals: [
    {
      symbol: "AAL",
      period_ending: ISODate("2012-12-31"),
      "Accounts Payable": 3068000000,
      "Net Income": -1876000000,
      "For Year": 2012,
      "Estimated Shares Outstanding": 335000000
      // ... many other metrics
    }
  ]
}
```

Notes:

* `fundamentals.period_ending` is converted to a **BSON Date**.
* Metric keys with spaces (e.g. `"Net Income"`) are preserved.

### 2) `prices`

One document per symbol-day:

```js
{
  symbol: "WLTW",
  date: ISODate("2016-01-05"),
  open: 123.43,
  high: 126.25,
  low: 122.309998,
  close: 125.839996,
  volume: 2163600
}
```

Notes:

* `date` is converted to a **BSON Date**.
* Supports both `"YYYY-MM-DD HH:MM:SS"` and `"YYYY-MM-DD"` formats.

### 3) `prices_split_adjusted`

Same schema as `prices`, but split-adjusted series.

---

## MongoDB requirements

* Recommended: MongoDB **5.0+**

  * enables `$getField` (used to read JSON keys that contain spaces like `"Ticker symbol"`)
  * enables time-series collection creation (optional)

If time-series creation fails (older server / permissions), the scripts automatically fall back to standard collections.

---

## Option A — Python loader

### Install

```bash
pip install pymongo
```

### Save the script

Save the Python script as:

* `load_stocks_to_mongo.py`

(Use the script provided in chat.)

### Run

```bash
python load_stocks_to_mongo.py \
  --mongo-uri "mongodb://localhost:27017" \
  --db stocks \
  --input-dir ./data \
  --drop
```

Flags:

* `--drop` drops existing target + staging collections first.
* `--batch-size` controls insert batch size (default: `5000`).

---

## Option B — Node.js loader

### Install (Yarn)

```bash
yarn init -y
yarn add mongodb
```

### Save the script

Save the Node script as:

* `load_stocks_to_mongo.mjs`

(Use the script provided in chat.)

### Ensure ESM is enabled

Because the loader uses ES Modules (`.mjs` + `import`), set this in your `package.json`:

```json
{
  "type": "module"
}
```

You can do it from the terminal:

```bash
yarn pkg set type module
```

### Run

```bash
node load_stocks_to_mongo.mjs \
  --mongo-uri "mongodb://localhost:27017" \
  --db stocks \
  --input-dir ./data \
  --drop
```

Optional: add a Yarn script in `package.json`:

```json
{
  "scripts": {
    "load": "node load_stocks_to_mongo.mjs"
  }
}
```

Then run:

```bash
yarn load -- \
  --mongo-uri "mongodb://localhost:27017" \
  --db stocks \
  --input-dir ./data \
  --drop
```

Flags:

* `--drop` drops existing target + staging collections first.
* `--batch-size` controls insert batch size (default: `2000`).

---

## What happens during the load (both scripts)

1. **Import JSONL**

   * `securities.jsonl` → `securities_raw` (staging)
   * `fundamentals.jsonl` → `fundamentals_stage` (staging)
   * `prices.jsonl` → `prices`
   * `prices-split-adjusted.jsonl` → `prices_split_adjusted`

2. **Normalize price dates**

   * Convert `prices.date` from string to BSON Date (supports both formats)
   * Convert `prices_split_adjusted.date` from string to BSON Date

3. **Build final `securities`**

   * Transform `securities_raw` → `securities`
   * Set `_id` to `"Ticker symbol"`
   * Rename fields into snake_case

4. **Embed fundamentals**

   * Group fundamentals by `"Ticker Symbol"`
   * Convert `"Period Ending"` → `period_ending` as BSON Date
   * Merge into `securities.fundamentals`

5. **Cleanup**

   * Drop `securities_raw` and `fundamentals_stage`

---

## Indexes created

* `prices`: `{ symbol: 1, date: 1 }`
* `prices_split_adjusted`: `{ symbol: 1, date: 1 }`
* `securities`:

  * `{ ticker: 1 }`
  * `{ gics_sector: 1 }`
  * `{ gics_sub_industry: 1 }`

---

## Sanity checks

In `mongosh`:

```js
use stocks

// Securities + embedded fundamentals
db.securities.findOne({ _id: "MMM" })

// Latest raw price
db.prices.find({ symbol: "WLTW" }).sort({ date: -1 }).limit(1)

// Latest split-adjusted price
db.prices_split_adjusted.find({ symbol: "WLTW" }).sort({ date: -1 }).limit(1)
```

---

## Troubleshooting

### Dates are still strings

Check types:

```js
db.prices.findOne({}, { date: 1 })
db.prices_split_adjusted.findOne({}, { date: 1 })
```

If the date format differs from the examples, adjust the date parsing formats in the scripts.

### MongoDB < 5.0

If your server is older than 5.0, `$getField` is not available. In that case:

* Prefer upgrading MongoDB
* Or pre-normalize keys in JSONL (rename `"Ticker symbol"` → `ticker`, etc.) before ingest

---

## Notes on schema choices

* Prices are stored as separate collections (raw vs split-adjusted) because:

  * queries remain simple
  * no duplication within a single collection
  * storage is explicit

* Fundamentals are embedded in `securities` because:

  * they are low-frequency (annual/quarterly)
  * they avoid extra joins/lookup for company pages and summaries
