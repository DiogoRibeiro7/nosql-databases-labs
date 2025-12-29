/* global use db print printjson */

// Lab 04 - Business Analytics Aggregations (mongosh)
// Real-world analytics scenarios using MongoDB aggregation
//
// Run:
//   mongosh "mongodb://localhost:27017" --file labs/lab04_aggregation/aggregation_analytics_mongosh.js

"use strict";

function fmtMoney(x) {
  if (x === null || x === undefined) return "null";
  var n = Number(x);
  if (!Number.isFinite(n)) return String(x);
  return n.toFixed(2);
}

function safeFixed(x, digits) {
  var n = Number(x);
  if (!Number.isFinite(n)) return String(x);
  return n.toFixed(digits);
}

use("lab04_analytics");

print("Connected to MongoDB for Analytics (mongosh)");
print("DB = " + db.getName());

// ========================================
// 1. CUSTOMER LIFETIME VALUE (CLV)
// ========================================
print("\n1. CUSTOMER LIFETIME VALUE ANALYSIS");
print("====================================");

var clvAnalysis = db.sales
  .aggregate([
    {
      $group: {
        _id: "$customer_id",
        first_purchase: { $min: "$date" },
        last_purchase: { $max: "$date" },
        total_spent: { $sum: "$amount" },
        order_count: { $sum: 1 },
        avg_order_value: { $avg: "$amount" },
        products_bought: { $addToSet: "$product_id" },
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "_id",
        foreignField: "customer_id",
        as: "customer_info",
      },
    },
    { $unwind: "$customer_info" },
    {
      $project: {
        customer_id: "$_id",
        customer_name: "$customer_info.name",
        segment: "$customer_info.segment",
        lifetime_days: {
          $divide: [{ $subtract: ["$last_purchase", "$first_purchase"] }, 1000 * 60 * 60 * 24],
        },
        total_spent: { $round: ["$total_spent", 2] },
        order_count: 1,
        avg_order_value: { $round: ["$avg_order_value", 2] },
        product_diversity: { $size: "$products_bought" },
        purchase_frequency: {
          $cond: {
            if: { $eq: [{ $subtract: ["$last_purchase", "$first_purchase"] }, 0] },
            then: 0,
            else: {
              $divide: [
                "$order_count",
                {
                  $add: [
                    {
                      $divide: [
                        { $subtract: ["$last_purchase", "$first_purchase"] },
                        1000 * 60 * 60 * 24,
                      ],
                    },
                    1,
                  ],
                },
              ],
            },
          },
        },
      },
    },
    { $sort: { total_spent: -1 } },
    { $limit: 10 },
  ])
  .toArray();

print("Top 10 Customers by CLV:");
clvAnalysis.forEach(function (customer, index) {
  print(index + 1 + ". " + customer.customer_name + " (" + customer.segment + ")");
  print("   CLV: $" + fmtMoney(customer.total_spent) + " | Orders: " + customer.order_count);
  print(
    "   Active for: " +
      Math.round(Number(customer.lifetime_days)) +
      " days | Frequency: " +
      safeFixed(customer.purchase_frequency, 2) +
      " orders/day"
  );
});

// ========================================
// 2. RFM ANALYSIS (Recency, Frequency, Monetary)
// ========================================
print("\n2. RFM SEGMENTATION");
print("====================");

var currentDate = new Date("2024-01-01");

var rfmAnalysis = db.sales
  .aggregate([
    {
      $group: {
        _id: "$customer_id",
        last_purchase: { $max: "$date" },
        frequency: { $sum: 1 },
        monetary: { $sum: "$amount" },
      },
    },
    {
      $project: {
        customer_id: "$_id",
        recency_days: {
          $divide: [{ $subtract: [currentDate, "$last_purchase"] }, 1000 * 60 * 60 * 24],
        },
        frequency: 1,
        monetary: { $round: ["$monetary", 2] },
      },
    },
    {
      $bucketAuto: {
        groupBy: "$recency_days",
        buckets: 3,
        output: {
          customers: { $push: "$customer_id" },
          avg_frequency: { $avg: "$frequency" },
          avg_monetary: { $avg: "$monetary" },
        },
      },
    },
  ])
  .toArray();

print("RFM Segments:");
rfmAnalysis.forEach(function (segment, index) {
  var recencyLabel = index === 0 ? "Recent" : index === 1 ? "Medium" : "Lapsed";
  print(
    recencyLabel +
      " Customers (" +
      Number(segment._id.min).toFixed(0) +
      "-" +
      Number(segment._id.max).toFixed(0) +
      " days ago):"
  );
  print(
    "  Count: " +
      segment.customers.length +
      " | Avg Frequency: " +
      safeFixed(segment.avg_frequency, 1) +
      " | Avg Value: $" +
      safeFixed(segment.avg_monetary, 2)
  );
});

// ========================================
// 3. COHORT ANALYSIS
// ========================================
print("\n3. COHORT ANALYSIS");
print("==================");

var cohortAnalysis = db.sales
  .aggregate([
    {
      $group: {
        _id: {
          customer_id: "$customer_id",
          cohort_month: { $dateToString: { format: "%Y-%m", date: "$date" } },
        },
        revenue: { $sum: "$amount" },
      },
    },
    {
      $group: {
        _id: "$_id.cohort_month",
        customers: { $addToSet: "$_id.customer_id" },
        total_revenue: { $sum: "$revenue" },
      },
    },
    {
      $project: {
        cohort: "$_id",
        customer_count: { $size: "$customers" },
        total_revenue: { $round: ["$total_revenue", 2] },
        avg_revenue_per_customer: {
          $round: [{ $divide: ["$total_revenue", { $size: "$customers" }] }, 2],
        },
      },
    },
    { $sort: { cohort: 1 } },
    { $limit: 6 },
  ])
  .toArray();

print("Monthly Cohorts:");
cohortAnalysis.forEach(function (cohort) {
  print(
    cohort.cohort +
      ": " +
      cohort.customer_count +
      " customers, $" +
      fmtMoney(cohort.avg_revenue_per_customer) +
      " avg revenue"
  );
});

// ========================================
// 4. PRODUCT AFFINITY ANALYSIS
// ========================================
// NOTE: Your Node version has a logical issue:
//   $filter cond: { $ne: ["$$this", "$$this"] } is always false.
// In mongosh we fix it properly by generating all i<j pairs using $range.

print("\n4. PRODUCT AFFINITY / MARKET BASKET");
print("====================================");

var productAffinity = db.sales
  .aggregate([
    { $group: { _id: "$customer_id", products: { $addToSet: "$product_id" } } },
    {
      $project: {
        products: 1,
        pairs: {
          $let: {
            vars: { n: { $size: "$products" } },
            in: {
              $reduce: {
                input: { $range: [0, { $max: [0, { $subtract: ["$$n", 1] }] }] },
                initialValue: [],
                in: {
                  $let: {
                    vars: { i: "$$this", acc: "$$value" },
                    in: {
                      $concatArrays: [
                        "$$acc",
                        {
                          $map: {
                            input: { $range: [{ $add: ["$$i", 1] }, "$$n"] },
                            as: "j",
                            in: {
                              product1: { $arrayElemAt: ["$products", "$$i"] },
                              product2: { $arrayElemAt: ["$products", "$$j"] },
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    { $unwind: "$pairs" },
    { $group: { _id: "$pairs", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ])
  .toArray();

print("Top Product Pairs (Frequently Bought Together):");
productAffinity.forEach(function (pair) {
  if (pair._id && pair._id.product1 && pair._id.product2) {
    print("  " + pair._id.product1 + " + " + pair._id.product2 + ": " + pair.count + " times");
  }
});

// ========================================
// 5. SALES FUNNEL ANALYSIS
// ========================================
// NOTE: The Node version's "second_purchase" calculation is not valid as written.
// Here we compute first/second purchase correctly: sort dates, then pick 0/1.

print("\n5. SALES FUNNEL ANALYSIS");
print("========================");

var funnelAnalysis = db.sales
  .aggregate([
    {
      $group: {
        _id: "$customer_id",
        dates: { $push: "$date" },
        total_purchases: { $sum: 1 },
      },
    },
    {
      $project: {
        total_purchases: 1,
        sorted_dates: { $sortArray: { input: "$dates", sortBy: 1 } },
      },
    },
    {
      $project: {
        total_purchases: 1,
        first_purchase: { $arrayElemAt: ["$sorted_dates", 0] },
        second_purchase: { $arrayElemAt: ["$sorted_dates", 1] },
      },
    },
    {
      $group: {
        _id: null,
        total_customers: { $sum: 1 },
        single_purchase: { $sum: { $cond: [{ $eq: ["$total_purchases", 1] }, 1, 0] } },
        repeat_customers: { $sum: { $cond: [{ $gt: ["$total_purchases", 1] }, 1, 0] } },
        high_value_customers: { $sum: { $cond: [{ $gte: ["$total_purchases", 5] }, 1, 0] } },
      },
    },
    {
      $project: {
        _id: 0,
        total_customers: 1,
        single_purchase_rate: {
          $round: [{ $multiply: [{ $divide: ["$single_purchase", "$total_customers"] }, 100] }, 2],
        },
        repeat_rate: {
          $round: [{ $multiply: [{ $divide: ["$repeat_customers", "$total_customers"] }, 100] }, 2],
        },
        high_value_rate: {
          $round: [
            { $multiply: [{ $divide: ["$high_value_customers", "$total_customers"] }, 100] },
            2,
          ],
        },
      },
    },
  ])
  .toArray();

print("Customer Funnel:");
printjson(funnelAnalysis[0]);

// ========================================
// 6. SEASONALITY ANALYSIS
// ========================================
print("\n6. SEASONALITY ANALYSIS");
print("=======================");

var seasonalityAnalysis = db.sales
  .aggregate([
    {
      $project: {
        month: { $month: "$date" },
        dayOfWeek: { $dayOfWeek: "$date" },
        hour: { $hour: "$date" },
        amount: 1,
        quarter: { $ceil: { $divide: [{ $month: "$date" }, 3] } },
      },
    },
    {
      $facet: {
        by_month: [
          { $group: { _id: "$month", revenue: { $sum: "$amount" }, orders: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ],
        by_quarter: [
          { $group: { _id: "$quarter", revenue: { $sum: "$amount" }, orders: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ],
        by_day_of_week: [
          { $group: { _id: "$dayOfWeek", revenue: { $sum: "$amount" }, orders: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ])
  .toArray();

print("Seasonal Patterns:");
print("By Quarter:");
seasonalityAnalysis[0].by_quarter.forEach(function (q) {
  print("  Q" + q._id + ": $" + safeFixed(q.revenue, 2) + " (" + q.orders + " orders)");
});

// ========================================
// 7. CUSTOMER CHURN PREDICTION
// ========================================
print("\n7. CHURN RISK ANALYSIS");
print("======================");

var churnAnalysis = db.sales
  .aggregate([
    {
      $group: {
        _id: "$customer_id",
        last_order_date: { $max: "$date" },
        order_count: { $sum: 1 },
        avg_order_value: { $avg: "$amount" },
        total_spent: { $sum: "$amount" },
      },
    },
    {
      $project: {
        customer_id: "$_id",
        days_since_last_order: {
          $divide: [{ $subtract: [currentDate, "$last_order_date"] }, 1000 * 60 * 60 * 24],
        },
        order_count: 1,
        avg_order_value: { $round: ["$avg_order_value", 2] },
        total_spent: { $round: ["$total_spent", 2] },
        churn_risk: {
          $switch: {
            branches: [
              { case: { $lte: ["$days_since_last_order", 30] }, then: "Active" },
              { case: { $lte: ["$days_since_last_order", 60] }, then: "At Risk" },
              { case: { $lte: ["$days_since_last_order", 90] }, then: "High Risk" },
            ],
            default: "Churned",
          },
        },
      },
    },
    {
      $group: {
        _id: "$churn_risk",
        customer_count: { $sum: 1 },
        avg_ltv: { $avg: "$total_spent" },
        total_value: { $sum: "$total_spent" },
      },
    },
    {
      $project: {
        risk_level: "$_id",
        customer_count: 1,
        avg_ltv: { $round: ["$avg_ltv", 2] },
        total_value: { $round: ["$total_value", 2] },
      },
    },
  ])
  .toArray();

print("Churn Risk Segments:");
churnAnalysis.forEach(function (segment) {
  print(segment.risk_level + ": " + segment.customer_count + " customers");
  print(
    "  Avg LTV: $" + fmtMoney(segment.avg_ltv) + " | Total Value: $" + fmtMoney(segment.total_value)
  );
});

// ========================================
// 8. PROFITABILITY ANALYSIS
// ========================================
print("\n8. PROFITABILITY ANALYSIS");
print("=========================");

var profitabilityAnalysis = db.sales
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
      $project: {
        product_id: 1,
        product_name: "$product.name",
        category: "$product.category",
        revenue: "$amount",
        cost: { $multiply: ["$quantity", "$product.cost"] },
        profit: { $subtract: ["$amount", { $multiply: ["$quantity", "$product.cost"] }] },
        margin: {
          $multiply: [
            {
              $divide: [
                { $subtract: ["$amount", { $multiply: ["$quantity", "$product.cost"] }] },
                "$amount",
              ],
            },
            100,
          ],
        },
      },
    },
    {
      $group: {
        _id: "$category",
        total_revenue: { $sum: "$revenue" },
        total_cost: { $sum: "$cost" },
        total_profit: { $sum: "$profit" },
        avg_margin: { $avg: "$margin" },
        product_count: { $addToSet: "$product_id" },
      },
    },
    {
      $project: {
        category: "$_id",
        total_revenue: { $round: ["$total_revenue", 2] },
        total_profit: { $round: ["$total_profit", 2] },
        profit_margin: {
          $round: [{ $multiply: [{ $divide: ["$total_profit", "$total_revenue"] }, 100] }, 2],
        },
        product_diversity: { $size: "$product_count" },
      },
    },
    { $sort: { total_profit: -1 } },
  ])
  .toArray();

print("Profitability by Category:");
profitabilityAnalysis.forEach(function (cat) {
  print(cat.category + ":");
  print("  Revenue: $" + fmtMoney(cat.total_revenue) + " | Profit: $" + fmtMoney(cat.total_profit));
  print("  Margin: " + safeFixed(cat.profit_margin, 2) + "% | Products: " + cat.product_diversity);
});

print("\nDone.");
