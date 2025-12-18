// Lab 04 - Basic Aggregation Pipeline Examples (mongosh)
// This file demonstrates fundamental aggregation concepts
//
// Run:
//   mongosh "mongodb://localhost:27017" --file labs/lab04_aggregation/basic_aggregations_mongosh.js

"use strict";

function fmtMoney(x) {
  if (x === null || x === undefined) return "null";
  var n = Number(x);
  if (!Number.isFinite(n)) return String(x);
  return n.toFixed(2);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

use("lab04_analytics");

print("Connected to MongoDB (mongosh)");
print("DB = " + db.getName());

// ========================================
// 1. BASIC AGGREGATION - $group
// ========================================
print("\n1. BASIC AGGREGATION - Total Revenue");
print("=====================================");

var totalRevenue = db.sales
  .aggregate([
    {
      $group: {
        _id: null,
        total_revenue: { $sum: "$amount" },
        total_orders: { $sum: 1 }, // $count is a stage, not an accumulator
        avg_order_value: { $avg: "$amount" },
      },
    },
  ])
  .toArray();

print("Total Revenue:");
printjson(totalRevenue[0]);

// ========================================
// 2. FILTERING WITH $match
// ========================================
print("\n2. FILTERING - Sales in Q4 2023");
print("================================");

var q4Sales = db.sales
  .aggregate([
    {
      $match: {
        date: {
          $gte: new Date("2023-10-01"),
          $lt: new Date("2024-01-01"),
        },
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$amount" },
        orders: { $sum: 1 },
      },
    },
  ])
  .toArray();

print("Q4 2023 Sales:");
printjson(q4Sales[0]);

// ========================================
// 3. GROUPING BY FIELD
// ========================================
print("\n3. GROUP BY - Revenue by Customer Segment");
print("==========================================");

var revenueBySegment = db.sales
  .aggregate([
    {
      $lookup: {
        from: "customers",
        localField: "customer_id",
        foreignField: "customer_id",
        as: "customer",
      },
    },
    { $unwind: "$customer" },
    {
      $group: {
        _id: "$customer.segment",
        revenue: { $sum: "$amount" },
        orders: { $sum: 1 },
        avg_order: { $avg: "$amount" },
      },
    },
    { $sort: { revenue: -1 } },
  ])
  .toArray();

print("Revenue by Segment:");
revenueBySegment.forEach(function (segment) {
  print(
    "  " + segment._id + ": $" + fmtMoney(segment.revenue) + " (" + segment.orders + " orders)"
  );
});

// ========================================
// 4. DATE OPERATIONS
// ========================================
print("\n4. DATE OPERATIONS - Monthly Revenue");
print("=====================================");

var monthlyRevenue = db.sales
  .aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
        revenue: { $sum: "$amount" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    { $limit: 6 }, // "First 6" after sorting asc; if you want "last 6", sort desc then limit.
  ])
  .toArray();

print("Monthly Revenue (First 6 after sort):");
monthlyRevenue.forEach(function (month) {
  print("  " + month._id.year + "-" + pad2(month._id.month) + ": $" + fmtMoney(month.revenue));
});

// ========================================
// 5. PROJECTION WITH $project
// ========================================
print("\n5. PROJECTION - Formatted Sales Data");
print("=====================================");

var formattedSales = db.sales
  .aggregate([
    { $limit: 5 },
    {
      $project: {
        _id: 0,
        order_id: "$_id",
        date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        customer: "$customer_id",
        amount: { $round: ["$amount", 2] },
        year: { $year: "$date" },
        month: { $month: "$date" },
        dayOfWeek: { $dayOfWeek: "$date" },
      },
    },
  ])
  .toArray();

print("Formatted Sales (First 5):");
formattedSales.forEach(function (sale) {
  print("  Order " + sale.customer + " on " + sale.date + ": $" + fmtMoney(sale.amount));
});

// ========================================
// 6. SORTING AND LIMITING
// ========================================
print("\n6. TOP CUSTOMERS - By Revenue");
print("==============================");

var topCustomers = db.sales
  .aggregate([
    {
      $group: {
        _id: "$customer_id",
        total_spent: { $sum: "$amount" },
        order_count: { $sum: 1 },
        avg_order: { $avg: "$amount" },
      },
    },
    { $sort: { total_spent: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "customers",
        localField: "_id",
        foreignField: "customer_id",
        as: "details",
      },
    },
    { $unwind: "$details" },
    {
      $project: {
        customer_id: "$_id",
        name: "$details.name",
        segment: "$details.segment",
        total_spent: { $round: ["$total_spent", 2] },
        order_count: 1,
        avg_order: { $round: ["$avg_order", 2] },
      },
    },
  ])
  .toArray();

print("Top 5 Customers:");
topCustomers.forEach(function (customer, index) {
  print(
    "  " +
      (index + 1) +
      ". " +
      customer.name +
      " (" +
      customer.segment +
      "): $" +
      fmtMoney(customer.total_spent) +
      " - " +
      customer.order_count +
      " orders"
  );
});

// ========================================
// 7. ARRAY OPERATIONS (grouping into arrays)
// ========================================
print("\n7. ARRAY OPERATIONS - Product Categories");
print("=========================================");

var productCategories = db.products
  .aggregate([
    {
      $group: {
        _id: "$category",
        products: { $push: "$name" },
        avg_price: { $avg: "$price" },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ])
  .toArray();

print("Products by Category:");
productCategories.forEach(function (cat) {
  print("  " + cat._id + ": " + cat.count + " products, avg price: $" + fmtMoney(cat.avg_price));
});

// ========================================
// 8. CONDITIONAL OPERATIONS WITH $cond
// ========================================
print("\n8. CONDITIONAL - Order Size Classification");
print("===========================================");

var orderSizes = db.sales
  .aggregate([
    {
      $project: {
        customer_id: 1,
        amount: 1,
        order_size: {
          $cond: {
            if: { $gte: ["$amount", 200] },
            then: "Large",
            else: {
              $cond: {
                if: { $gte: ["$amount", 100] },
                then: "Medium",
                else: "Small",
              },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: "$order_size",
        count: { $sum: 1 },
        total_revenue: { $sum: "$amount" },
        avg_amount: { $avg: "$amount" },
      },
    },
    { $sort: { avg_amount: -1 } },
  ])
  .toArray();

print("Order Size Distribution:");
orderSizes.forEach(function (size) {
  print("  " + size._id + ": " + size.count + " orders, avg: $" + fmtMoney(size.avg_amount));
});

// ========================================
// 9. ACCUMULATOR OPERATORS
// ========================================
print("\n9. ACCUMULATORS - Statistical Analysis");
print("=======================================");

var stats = db.sales
  .aggregate([
    {
      $group: {
        _id: null,
        min_order: { $min: "$amount" },
        max_order: { $max: "$amount" },
        avg_order: { $avg: "$amount" },
        std_deviation: { $stdDevPop: "$amount" },
        total_quantity: { $sum: "$quantity" },
        unique_customers: { $addToSet: "$customer_id" },
      },
    },
    {
      $project: {
        _id: 0,
        min_order: { $round: ["$min_order", 2] },
        max_order: { $round: ["$max_order", 2] },
        avg_order: { $round: ["$avg_order", 2] },
        std_deviation: { $round: ["$std_deviation", 2] },
        total_quantity: 1,
        unique_customer_count: { $size: "$unique_customers" },
      },
    },
  ])
  .toArray();

print("Sales Statistics:");
printjson(stats[0]);

// ========================================
// 10. FACETED SEARCH WITH $facet
// ========================================
print("\n10. FACETED SEARCH - Multiple Aggregations");
print("===========================================");

var facetedResults = db.sales
  .aggregate([
    {
      $facet: {
        revenue_by_month: [
          { $group: { _id: { $month: "$date" }, revenue: { $sum: "$amount" } } },
          { $sort: { _id: 1 } },
        ],
        top_products: [
          { $group: { _id: "$product_id", revenue: { $sum: "$amount" } } },
          { $sort: { revenue: -1 } },
          { $limit: 3 },
        ],
        order_stats: [
          {
            $group: {
              _id: null,
              total_orders: { $sum: 1 },
              total_revenue: { $sum: "$amount" },
              avg_order: { $avg: "$amount" },
            },
          },
        ],
      },
    },
  ])
  .toArray();

print("Faceted Results:");
print(
  "  Top 3 Products: " +
    facetedResults[0].top_products
      .map(function (p) {
        return p._id;
      })
      .join(", ")
);
print("  Order Stats:");
printjson(facetedResults[0].order_stats[0]);

print("\nDone.");
