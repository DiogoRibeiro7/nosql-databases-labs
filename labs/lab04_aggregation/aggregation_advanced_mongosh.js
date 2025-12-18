// Lab 04 - Advanced Aggregation Pipeline Examples (mongosh)
// Run with:
//   mongosh "mongodb://localhost:27017" --file labs/lab04_aggregation/advanced_aggregations.mongosh.js
//
// Or (inside GH Actions mongo container):
//   docker exec -i "$MONGO_CID" mongosh --quiet "mongodb://127.0.0.1:27017" < labs/lab04_aggregation/advanced_aggregations_mongosh.js

"use strict";

function fmtMoney(x) {
  if (x === null || x === undefined) return "null";
  var n = Number(x);
  if (!Number.isFinite(n)) return String(x);
  return n.toFixed(2);
}

// Switch DB
use("lab04_analytics");

print("Connected to MongoDB (mongosh)");
print("DB = " + db.getName());

// ========================================
// 1. COMPLEX LOOKUP WITH PIPELINE
// ========================================
print("\n1. COMPLEX LOOKUP - Sales with Full Details");
print("============================================");

var detailedSales = db.sales
  .aggregate([
    { $limit: 3 },
    {
      $lookup: {
        from: "products",
        let: { prod_id: "$product_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$product_id", "$$prod_id"] } } },
          {
            $project: {
              name: 1,
              category: 1,
              price: 1,
              profit_margin: {
                $multiply: [
                  { $divide: [{ $subtract: ["$price", "$cost"] }, "$price"] },
                  100,
                ],
              },
            },
          },
        ],
        as: "product_details",
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "customer_id",
        foreignField: "customer_id",
        as: "customer_details",
      },
    },
    { $unwind: "$product_details" },
    { $unwind: "$customer_details" },
    {
      $project: {
        order_date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        customer_name: "$customer_details.name",
        customer_segment: "$customer_details.segment",
        product_name: "$product_details.name",
        product_category: "$product_details.category",
        quantity: 1,
        amount: { $round: ["$amount", 2] },
        profit_margin: { $round: ["$product_details.profit_margin", 2] },
      },
    },
  ])
  .toArray();

print("Detailed Sales:");
detailedSales.forEach(function (sale) {
  print(
    "  " +
      sale.order_date +
      ": " +
      sale.customer_name +
      " bought " +
      sale.quantity +
      "x " +
      sale.product_name +
      " for $" +
      fmtMoney(sale.amount)
  );
});

// ========================================
// 2. WINDOW FUNCTIONS (MongoDB 5.0+)
// ========================================
print("\n2. WINDOW FUNCTIONS - Running Totals & Rankings");
print("================================================");

var windowFunctions = db.sales
  .aggregate([
    { $match: { date: { $gte: new Date("2023-10-01") } } },
    { $sort: { date: 1 } },
    {
      $setWindowFields: {
        sortBy: { date: 1 },
        output: {
          running_total: {
            $sum: "$amount",
            window: { documents: ["unbounded", "current"] },
          },
          moving_avg_7: {
            $avg: "$amount",
            window: { documents: [-6, 0] },
          },
          rank: { $rank: {} },
          row_number: { $documentNumber: {} },
        },
      },
    },
    { $limit: 10 },
    {
      $project: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        amount: { $round: ["$amount", 2] },
        running_total: { $round: ["$running_total", 2] },
        moving_avg_7: { $round: ["$moving_avg_7", 2] },
        rank: 1,
        row_number: 1,
      },
    },
  ])
  .toArray();

print("Sales with Window Functions (First 10):");
windowFunctions.forEach(function (row) {
  print(
    "  Row " +
      row.row_number +
      ": " +
      row.date +
      " - Amount: $" +
      fmtMoney(row.amount) +
      ", Running Total: $" +
      fmtMoney(row.running_total)
  );
});

// ========================================
// 3. BUCKET ANALYSIS
// ========================================
print("\n3. BUCKET ANALYSIS - Price Distribution");
print("========================================");

var priceBuckets = db.sales
  .aggregate([
    {
      $bucket: {
        groupBy: "$amount",
        boundaries: [0, 50, 100, 150, 200, 300, 500],
        default: "Over 500",
        output: {
          count: { $sum: 1 },
          total_revenue: { $sum: "$amount" },
          avg_amount: { $avg: "$amount" },
          customers: { $addToSet: "$customer_id" },
        },
      },
    },
    {
      $project: {
        range: "$_id",
        count: 1,
        total_revenue: { $round: ["$total_revenue", 2] },
        avg_amount: { $round: ["$avg_amount", 2] },
        unique_customers: { $size: "$customers" },
      },
    },
  ])
  .toArray();

print("Price Buckets:");
priceBuckets.forEach(function (bucket) {
  var range =
    bucket.range === "Over 500"
      ? bucket.range
      : "$" + bucket.range[0] + "-" + bucket.range[1];
  print(
    "  " +
      range +
      ": " +
      bucket.count +
      " orders, avg: $" +
      fmtMoney(bucket.avg_amount) +
      ", " +
      bucket.unique_customers +
      " customers"
  );
});

// ========================================
// 4. AUTO BUCKET
// ========================================
print("\n4. AUTO BUCKET - Automatic Distribution");
print("========================================");

var autoBuckets = db.products
  .aggregate([
    {
      $bucketAuto: {
        groupBy: "$price",
        buckets: 5,
        output: {
          count: { $sum: 1 },
          products: { $push: "$name" },
          avg_stock: { $avg: "$stock_quantity" },
        },
      },
    },
  ])
  .toArray();

print("Auto-generated Price Buckets:");
autoBuckets.forEach(function (bucket) {
  var min = Number(bucket._id.min);
  var max = Number(bucket._id.max);
  print(
    "  $" +
      (Number.isFinite(min) ? min.toFixed(2) : "?") +
      " - $" +
      (Number.isFinite(max) ? max.toFixed(2) : "?") +
      ": " +
      bucket.count +
      " products"
  );
});

// ========================================
// 5. GRAPH LOOKUP
// ========================================
print("\n5. GRAPH LOOKUP - Customer Referral Network");
print("============================================");

var graphExample = db.customers
  .aggregate([
    { $limit: 1 },
    {
      $graphLookup: {
        from: "customers",
        startWith: "$customer_id",
        connectFromField: "customer_id",
        connectToField: "referred_by",
        as: "referral_network",
        maxDepth: 2,
      },
    },
    {
      $project: {
        customer_id: 1,
        name: 1,
        network_size: { $size: "$referral_network" },
      },
    },
  ])
  .toArray();

print("Graph Lookup Example:");
printjson(graphExample[0]);

// ========================================
// 6. COMPLEX GROUP WITH MULTIPLE ACCUMULATORS
// ========================================
print("\n6. COMPLEX GROUPING - Category Performance");
print("===========================================");

var categoryPerformance = db.sales
  .aggregate([
    {
      $lookup: {
        from: "products",
        localField: "product_id",
        foreignField: "product_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $group: {
        _id: "$product.category",
        revenue: { $sum: "$amount" },
        units_sold: { $sum: "$quantity" },
        unique_customers: { $addToSet: "$customer_id" },
        avg_order_value: { $avg: "$amount" },
        min_order: { $min: "$amount" },
        max_order: { $max: "$amount" },
        dates: { $addToSet: { $dayOfYear: "$date" } },
      },
    },
    {
      $project: {
        category: "$_id",
        revenue: { $round: ["$revenue", 2] },
        units_sold: 1,
        customer_count: { $size: "$unique_customers" },
        avg_order_value: { $round: ["$avg_order_value", 2] },
        min_order: { $round: ["$min_order", 2] },
        max_order: { $round: ["$max_order", 2] },
        active_days: { $size: "$dates" },
      },
    },
    { $sort: { revenue: -1 } },
  ])
  .toArray();

print("Category Performance:");
categoryPerformance.forEach(function (cat) {
  print("  " + cat.category + ":");
  print("    Revenue: $" + fmtMoney(cat.revenue) + ", Units: " + cat.units_sold);
  print("    Customers: " + cat.customer_count + ", Active Days: " + cat.active_days);
  print("    Order Range: $" + fmtMoney(cat.min_order) + " - $" + fmtMoney(cat.max_order));
});

// ========================================
// 7. TIME SERIES ANALYSIS
// ========================================
print("\n7. TIME SERIES - Daily Sales Trend");
print("===================================");

var dailyTrend = db.sales
  .aggregate([
    { $match: { date: { $gte: new Date("2023-11-01") } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          dayOfWeek: { $dayOfWeek: "$date" },
        },
        revenue: { $sum: "$amount" },
        orders: { $sum: 1 },
      },
    },
    {
      $project: {
        date: "$_id.date",
        dayOfWeek: {
          $switch: {
            branches: [
              { case: { $eq: ["$_id.dayOfWeek", 1] }, then: "Sunday" },
              { case: { $eq: ["$_id.dayOfWeek", 2] }, then: "Monday" },
              { case: { $eq: ["$_id.dayOfWeek", 3] }, then: "Tuesday" },
              { case: { $eq: ["$_id.dayOfWeek", 4] }, then: "Wednesday" },
              { case: { $eq: ["$_id.dayOfWeek", 5] }, then: "Thursday" },
              { case: { $eq: ["$_id.dayOfWeek", 6] }, then: "Friday" },
              { case: { $eq: ["$_id.dayOfWeek", 7] }, then: "Saturday" },
            ],
            default: "Unknown",
          },
        },
        revenue: { $round: ["$revenue", 2] },
        orders: 1,
      },
    },
    { $sort: { date: 1 } },
    { $limit: 7 },
  ])
  .toArray();

print("Daily Trend (Last Week):");
dailyTrend.forEach(function (day) {
  print("  " + day.date + " (" + day.dayOfWeek + "): $" + fmtMoney(day.revenue) + " from " + day.orders + " orders");
});

// ========================================
// 8. MERGE STAGE - Write Results
// ========================================
print("\n8. MERGE STAGE - Creating Summary Collection");
print("=============================================");

db.sales
  .aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          customer_id: "$customer_id",
        },
        monthly_spend: { $sum: "$amount" },
        order_count: { $sum: 1 },
      },
    },
    {
      $merge: {
        into: "customer_monthly_summary",
        on: "_id",
        whenMatched: "replace",
        whenNotMatched: "insert",
      },
    },
  ])
  .toArray();

var summaryCount = db.customer_monthly_summary.countDocuments();
print("Created customer_monthly_summary collection with " + summaryCount + " documents");

// ========================================
// 9. ARRAY OPERATORS
// ========================================
print("\n9. ARRAY OPERATORS - Product Combinations");
print("==========================================");

var multiItemOrders = db.sales
  .aggregate([
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "product_id",
        foreignField: "product_id",
        as: "product_info",
      },
    },
    { $unwind: "$product_info" },
    {
      $group: {
        _id: "$customer_id",
        products_bought: { $addToSet: "$product_info.name" },
        total_spent: { $sum: "$amount" },
      },
    },
    {
      $project: {
        customer: "$_id",
        product_count: { $size: "$products_bought" },
        products_bought: { $slice: ["$products_bought", 3] },
        total_spent: { $round: ["$total_spent", 2] },
      },
    },
  ])
  .toArray();

print("Customer Product Combinations:");
multiItemOrders.forEach(function (order) {
  print("  Customer " + order.customer + ": " + order.product_count + " different products");
  print("    Products: " + order.products_bought.join(", "));
});

// ========================================
// 10. EXPRESSION OPERATORS
// ========================================
print("\n10. EXPRESSION OPERATORS - Complex Calculations");
print("================================================");

var complexCalc = db.sales
  .aggregate([
    { $match: { date: { $gte: new Date("2023-12-01") } } },
    {
      $group: {
        _id: null,
        total_revenue: { $sum: "$amount" },
        total_quantity: { $sum: "$quantity" },
        order_count: { $sum: 1 },
        all_amounts: { $push: "$amount" },
      },
    },
    {
      $project: {
        total_revenue: { $round: ["$total_revenue", 2] },
        avg_revenue_per_item: {
          $round: [{ $divide: ["$total_revenue", "$total_quantity"] }, 2],
        },
        revenue_variance: {
          $round: [
            {
              $divide: [
                {
                  $reduce: {
                    input: "$all_amounts",
                    initialValue: 0,
                    in: {
                      $add: [
                        "$$value",
                        {
                          $pow: [
                            { $subtract: ["$$this", { $avg: "$all_amounts" }] },
                            2,
                          ],
                        },
                      ],
                    },
                  },
                },
                { $subtract: ["$order_count", 1] },
              ],
            },
            2,
          ],
        },
      },
    },
  ])
  .toArray();

print("Complex Calculations (December):");
printjson(complexCalc[0]);

print("\nDisconnected from MongoDB (mongosh)");
