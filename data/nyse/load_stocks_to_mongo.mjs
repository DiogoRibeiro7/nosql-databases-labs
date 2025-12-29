#!/usr/bin/env node
/**
 * Load JSONL stocks dataset into MongoDB with exactly 3 collections:
 *   - securities               (securities + embedded fundamentals)
 *   - prices                   (raw)
 *   - prices_split_adjusted    (split-adjusted)
 *
 * Input files expected in --input-dir:
 *   securities.jsonl
 *   fundamentals.jsonl
 *   prices.jsonl
 *   prices-split-adjusted.jsonl
 *
 * Requires MongoDB 5.0+ for $getField and time-series collections (time-series is optional; script falls back).
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import process from "node:process";
import { MongoClient } from "mongodb";

/** @typedef {Record<string, any>} JsonObj */

function assertNonEmptyString(name, v) {
  if (typeof v !== "string" || v.trim().length === 0) {
    throw new Error(`${name} must be a non-empty string`);
  }
}

function parseArgs(argv) {
  /** @type {Record<string, string|boolean|number>} */
  const out = {
    mongoUri: "",
    db: "stocks",
    inputDir: "",
    batchSize: 2000,
    drop: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];

    if (a === "--mongo-uri") out.mongoUri = argv[++i] ?? "";
    else if (a === "--db") out.db = argv[++i] ?? "stocks";
    else if (a === "--input-dir") out.inputDir = argv[++i] ?? "";
    else if (a === "--batch-size") out.batchSize = Number(argv[++i] ?? "2000");
    else if (a === "--drop") out.drop = true;
    else throw new Error(`Unknown argument: ${a}`);
  }

  assertNonEmptyString("--mongo-uri", out.mongoUri);
  assertNonEmptyString("--input-dir", out.inputDir);

  if (!Number.isFinite(out.batchSize) || out.batchSize <= 0) {
    throw new Error("--batch-size must be a positive number");
  }

  return out;
}

function mustExist(p) {
  if (!fs.existsSync(p)) throw new Error(`Missing file: ${p}`);
}

/**
 * Stream a JSONL file and insert into a collection in batches.
 * @param {import("mongodb").Collection} coll
 * @param {string} filePath
 * @param {number} batchSize
 */
async function insertJsonl(coll, filePath, batchSize) {
  mustExist(filePath);

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: "utf-8" }),
    crlfDelay: Infinity,
  });

  /** @type {JsonObj[]} */
  let batch = [];
  let total = 0;

  for await (const line of rl) {
    const s = String(line).trim();
    if (!s) continue;

    /** @type {JsonObj} */
    let obj;
    try {
      obj = JSON.parse(s);
    } catch (e) {
      throw new Error(`Invalid JSON in ${filePath}: ${String(e)}`);
    }

    batch.push(obj);

    if (batch.length >= batchSize) {
      // ordered:false -> faster, continues on some errors
      await coll.insertMany(batch, { ordered: false });
      total += batch.length;
      batch = [];
    }
  }

  if (batch.length > 0) {
    await coll.insertMany(batch, { ordered: false });
    total += batch.length;
  }

  console.log(`Inserted ${total} docs into ${coll.collectionName} from ${path.basename(filePath)}`);
}

/**
 * Create a time-series collection if possible; otherwise create a normal one.
 * @param {import("mongodb").Db} db
 * @param {string} name
 * @param {string} timeField
 * @param {string} metaField
 */
async function createTimeseriesOrFallback(db, name, timeField, metaField) {
  const existing = await db.listCollections({ name }).toArray();
  if (existing.length > 0) return db.collection(name);

  try {
    await db.createCollection(name, {
      timeseries: { timeField, metaField, granularity: "days" },
    });
    console.log(`Created time-series collection: ${name}`);
  } catch (e) {
    console.warn(`Could not create time-series collection ${name}. Falling back. Reason: ${String(e)}`);
    await db.createCollection(name);
  }
  return db.collection(name);
}

/**
 * Drop a collection if it exists.
 * @param {import("mongodb").Db} db
 * @param {string} name
 */
async function dropIfExists(db, name) {
  const existing = await db.listCollections({ name }).toArray();
  if (existing.length > 0) {
    await db.collection(name).drop();
    console.log(`Dropped collection: ${name}`);
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const inputDir = path.resolve(String(args.inputDir));

  const files = {
    securities: path.join(inputDir, "securities.jsonl"),
    fundamentals: path.join(inputDir, "fundamentals.jsonl"),
    prices: path.join(inputDir, "prices.jsonl"),
    pricesAdj: path.join(inputDir, "prices-split-adjusted.jsonl"),
  };

  // Basic file checks
  mustExist(files.securities);
  mustExist(files.fundamentals);
  mustExist(files.prices);
  mustExist(files.pricesAdj);

  const client = new MongoClient(String(args.mongoUri), {
    // good defaults; tune if needed
    maxPoolSize: 20,
  });

  await client.connect();
  const db = client.db(String(args.db));

  try {
    if (args.drop) {
      // final + staging
      await dropIfExists(db, "securities");
      await dropIfExists(db, "prices");
      await dropIfExists(db, "prices_split_adjusted");
      await dropIfExists(db, "securities_raw");
      await dropIfExists(db, "fundamentals_stage");
    }

    // staging collections
    const securitiesRaw = db.collection("securities_raw");
    const fundamentalsStage = db.collection("fundamentals_stage");

    // final collections
    const prices = await createTimeseriesOrFallback(db, "prices", "date", "symbol");
    const pricesSplitAdjusted = await createTimeseriesOrFallback(db, "prices_split_adjusted", "date", "symbol");
    const securities = db.collection("securities"); // will be created on first write if not existing

    // Load JSONL
    await insertJsonl(securitiesRaw, files.securities, Number(args.batchSize));
    await insertJsonl(fundamentalsStage, files.fundamentals, Number(args.batchSize));
    await insertJsonl(prices, files.prices, Number(args.batchSize));
    await insertJsonl(pricesSplitAdjusted, files.pricesAdj, Number(args.batchSize));

    // Convert price dates to BSON Date
    // prices: "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DD"
    await prices.updateMany(
      { date: { $type: "string" } },
      [
        {
          $set: {
            date: {
              $ifNull: [
                { $dateFromString: { dateString: "$date", format: "%Y-%m-%d %H:%M:%S", onError: null } },
                { $dateFromString: { dateString: "$date", format: "%Y-%m-%d", onError: null } },
              ],
            },
          },
        },
      ]
    );

    // prices_split_adjusted: "YYYY-MM-DD"
    await pricesSplitAdjusted.updateMany(
      { date: { $type: "string" } },
      [
        {
          $set: {
            date: { $dateFromString: { dateString: "$date", format: "%Y-%m-%d", onError: null } },
          },
        },
      ]
    );

    // Indexes (useful even if time-series)
    await prices.createIndex({ symbol: 1, date: 1 });
    await pricesSplitAdjusted.createIndex({ symbol: 1, date: 1 });

    // Build securities from securities_raw using $getField (handles keys with spaces)
    await securitiesRaw.aggregate(
      [
        {
          $project: {
            _id: { $getField: { field: "Ticker symbol", input: "$$ROOT" } },
            ticker: { $getField: { field: "Ticker symbol", input: "$$ROOT" } },
            name: { $getField: { field: "Security", input: "$$ROOT" } },
            sec_filings: { $getField: { field: "SEC filings", input: "$$ROOT" } },
            gics_sector: { $getField: { field: "GICS Sector", input: "$$ROOT" } },
            gics_sub_industry: { $getField: { field: "GICS Sub Industry", input: "$$ROOT" } },
            hq_address: { $getField: { field: "Address of Headquarters", input: "$$ROOT" } },
            date_first_added: {
              $let: {
                vars: { v: { $getField: { field: "Date first added", input: "$$ROOT" } } },
                in: {
                  $cond: [
                    { $or: [{ $eq: ["$$v", null] }, { $eq: ["$$v", ""] }] },
                    null,
                    { $dateFromString: { dateString: "$$v", onError: null } },
                  ],
                },
              },
            },
            cik: {
              $convert: {
                input: { $getField: { field: "CIK", input: "$$ROOT" } },
                to: "int",
                onError: null,
                onNull: null,
              },
            },
          },
        },
        {
          $merge: {
            into: "securities",
            on: "_id",
            whenMatched: "replace",
            whenNotMatched: "insert",
          },
        },
      ],
      { allowDiskUse: true }
    ).toArray(); // force execution

    // Embed fundamentals into securities.fundamentals
    await fundamentalsStage.aggregate(
      [
        {
          $set: {
            symbol: { $getField: { field: "Ticker Symbol", input: "$$ROOT" } },
            period_ending: {
              $dateFromString: {
                dateString: { $getField: { field: "Period Ending", input: "$$ROOT" } },
                format: "%Y-%m-%d",
                onError: null,
              },
            },
          },
        },
        { $unset: ["Unnamed: 0", "Ticker Symbol", "Period Ending"] },
        { $sort: { symbol: 1, period_ending: 1 } },
        { $group: { _id: "$symbol", fundamentals: { $push: "$$ROOT" } } },
        {
          $merge: {
            into: "securities",
            on: "_id",
            whenMatched: [{ $set: { fundamentals: "$fundamentals" } }],
            whenNotMatched: "discard",
          },
        },
      ],
      { allowDiskUse: true }
    ).toArray(); // force execution

    // Final helpful indexes on securities
    await securities.createIndex({ ticker: 1 });
    await securities.createIndex({ gics_sector: 1 });
    await securities.createIndex({ gics_sub_industry: 1 });

    // Cleanup staging
    await dropIfExists(db, "securities_raw");
    await dropIfExists(db, "fundamentals_stage");

    console.log("Done. Final collections: securities, prices, prices_split_adjusted");
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
