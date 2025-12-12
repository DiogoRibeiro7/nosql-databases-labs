// Lab 04 - Sales Analytics
// Database: lab04_analytics
// Collection: sales

use lab04_analytics

// ========================================
// TASK 1: SALES ANALYTICS
// ========================================

// 1. Revenue by Month
// Calculate total revenue per month for 2023
db.sales.aggregate([
  // Extract month and year from date
  {
    $addFields: {
      sale_date: { $toDate: "$date" }
    }
  },

  // Group by year and month
  {
    $group: {
      _id: {
        year: { $year: "$sale_date" },
        month: { $month: "$sale_date" }
      },
      revenue: { $sum: "$total_amount" },
      order_count: { $sum: 1 },
      total_profit: { $sum: "$profit" },
      total_units: { $sum: "$quantity" }
    }
  },

  // Calculate average order value
  {
    $addFields: {
      avg_order_value: {
        $divide: ["$revenue", "$order_count"]
      },
      profit_margin: {
        $multiply: [
          { $divide: ["$total_profit", "$revenue"] },
          100
        ]
      }
    }
  },

  // Sort by year and month descending
  {
    $sort: { "_id.year": -1, "_id.month": -1 }
  },

  // Reshape output
  {
    $project: {
      _id: 0,
      year: "$_id.year",
      month: "$_id.month",
      revenue: { $round: ["$revenue", 2] },
      order_count: 1,
      avg_order_value: { $round: ["$avg_order_value", 2] },
      total_profit: { $round: ["$total_profit", 2] },
      profit_margin: { $round: ["$profit_margin", 2] },
      total_units: 1
    }
  }
]);

// ========================================
// 2. Top Products by Revenue
db.sales.aggregate([
  // Group by product
  {
    $group: {
      _id: "$product_id",
      category: { $first: "$category" },
      total_revenue: { $sum: "$total_amount" },
      total_profit: { $sum: "$profit" },
      total_units: { $sum: "$quantity" },
      num_orders: { $sum: 1 }
    }
  },

  // Calculate metrics
  {
    $addFields: {
      avg_price: { $divide: ["$total_revenue", "$total_units"] },
      profit_margin: {
        $multiply: [
          { $divide: ["$total_profit", "$total_revenue"] },
          100
        ]
      }
    }
  },

  // Lookup product details
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "product_id",
      as: "product_info"
    }
  },

  // Unwind product info
  { $unwind: "$product_info" },

  // Sort by revenue
  { $sort: { total_revenue: -1 } },

  // Top 20
  { $limit: 20 },

  // Final projection
  {
    $project: {
      _id: 0,
      product_id: "$_id",
      product_name: "$product_info.name",
      category: 1,
      total_revenue: { $round: ["$total_revenue", 2] },
      total_profit: { $round: ["$total_profit", 2] },
      profit_margin: { $round: ["$profit_margin", 2] },
      total_units: 1,
      num_orders: 1,
      avg_price: { $round: ["$avg_price", 2] }
    }
  }
]);

// ========================================
// 3. Sales by Category
db.sales.aggregate([
  {
    $group: {
      _id: "$category",
      total_revenue: { $sum: "$total_amount" },
      total_profit: { $sum: "$profit" },
      total_units: { $sum: "$quantity" },
      num_orders: { $sum: 1 }
    }
  },

  {
    $addFields: {
      avg_price: { $divide: ["$total_revenue", "$total_units"] },
      avg_order_value: { $divide: ["$total_revenue", "$num_orders"] },
      profit_margin: {
        $multiply: [
          { $divide: ["$total_profit", "$total_revenue"] },
          100
        ]
      }
    }
  },

  { $sort: { total_revenue: -1 } },

  {
    $project: {
      _id: 0,
      category: "$_id",
      total_revenue: { $round: ["$total_revenue", 2] },
      total_profit: { $round: ["$total_profit", 2] },
      profit_margin: { $round: ["$profit_margin", 2] },
      total_units: 1,
      num_orders: 1,
      avg_price: { $round: ["$avg_price", 2] },
      avg_order_value: { $round: ["$avg_order_value", 2] }
    }
  }
]);

// ========================================
// 4. Daily Sales Trends for a Specific Month (e.g., December 2023)
db.sales.aggregate([
  // Convert date to Date object
  {
    $addFields: {
      sale_date: { $toDate: "$date" }
    }
  },

  // Filter for December 2023
  {
    $match: {
      sale_date: {
        $gte: new Date("2023-12-01"),
        $lt: new Date("2024-01-01")
      }
    }
  },

  // Group by day
  {
    $group: {
      _id: { $dayOfMonth: "$sale_date" },
      daily_revenue: { $sum: "$total_amount" },
      daily_orders: { $sum: 1 },
      daily_units: { $sum: "$quantity" }
    }
  },

  // Sort by day
  { $sort: { _id: 1 } },

  // Reshape
  {
    $project: {
      _id: 0,
      day: "$_id",
      daily_revenue: { $round: ["$daily_revenue", 2] },
      daily_orders: 1,
      daily_units: 1
    }
  }
]);

// Alternative: With 7-day moving average (requires MongoDB 5.0+)
db.sales.aggregate([
  {
    $addFields: {
      sale_date: { $toDate: "$date" }
    }
  },

  {
    $match: {
      sale_date: {
        $gte: new Date("2023-12-01"),
        $lt: new Date("2024-01-01")
      }
    }
  },

  {
    $group: {
      _id: {
        $dateToString: {
          format: "%Y-%m-%d",
          date: "$sale_date"
        }
      },
      daily_revenue: { $sum: "$total_amount" },
      daily_orders: { $sum: 1 }
    }
  },

  { $sort: { _id: 1 } },

  // Add 7-day moving average using $setWindowFields
  {
    $setWindowFields: {
      sortBy: { _id: 1 },
      output: {
        moving_avg_7d: {
          $avg: "$daily_revenue",
          window: {
            documents: [-3, 3]  // 7-day window: 3 before, current, 3 after
          }
        }
      }
    }
  },

  {
    $project: {
      _id: 0,
      date: "$_id",
      daily_revenue: { $round: ["$daily_revenue", 2] },
      moving_avg_7d: { $round: ["$moving_avg_7d", 2] },
      daily_orders: 1
    }
  }
]);

// ========================================
// 5. Revenue vs. Cost Analysis
db.sales.aggregate([
  {
    $group: {
      _id: "$product_id",
      total_revenue: { $sum: "$total_amount" },
      total_cost: { $sum: { $multiply: ["$cost", "$quantity"] } },
      total_units: { $sum: "$quantity" }
    }
  },

  {
    $addFields: {
      total_profit: { $subtract: ["$total_revenue", "$total_cost"] },
      profit_margin: {
        $multiply: [
          {
            $divide: [
              { $subtract: ["$total_revenue", "$total_cost"] },
              "$total_revenue"
            ]
          },
          100
        ]
      }
    }
  },

  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "product_id",
      as: "product"
    }
  },

  { $unwind: "$product" },

  { $sort: { total_profit: -1 } },

  {
    $project: {
      _id: 0,
      product_id: "$_id",
      product_name: "$product.name",
      category: "$product.category",
      total_revenue: { $round: ["$total_revenue", 2] },
      total_cost: { $round: ["$total_cost", 2] },
      total_profit: { $round: ["$total_profit", 2] },
      profit_margin: { $round: ["$profit_margin", 2] },
      total_units: 1
    }
  }
]);

// ========================================
// ADDITIONAL SALES ANALYTICS
// ========================================

// 6. Month-over-Month Growth Rate
db.sales.aggregate([
  {
    $addFields: {
      sale_date: { $toDate: "$date" }
    }
  },

  {
    $group: {
      _id: {
        year: { $year: "$sale_date" },
        month: { $month: "$sale_date" }
      },
      revenue: { $sum: "$total_amount" }
    }
  },

  { $sort: { "_id.year": 1, "_id.month": 1 } },

  {
    $setWindowFields: {
      sortBy: { "_id.year": 1, "_id.month": 1 },
      output: {
        prev_month_revenue: {
          $shift: {
            output: "$revenue",
            by: -1
          }
        }
      }
    }
  },

  {
    $addFields: {
      mom_growth: {
        $cond: {
          if: { $eq: ["$prev_month_revenue", null] },
          then: null,
          else: {
            $multiply: [
              {
                $divide: [
                  { $subtract: ["$revenue", "$prev_month_revenue"] },
                  "$prev_month_revenue"
                ]
              },
              100
            ]
          }
        }
      }
    }
  },

  {
    $project: {
      _id: 0,
      year: "$_id.year",
      month: "$_id.month",
      revenue: { $round: ["$revenue", 2] },
      prev_month_revenue: { $round: ["$prev_month_revenue", 2] },
      mom_growth: { $round: ["$mom_growth", 2] }
    }
  }
]);

// 7. Sales by Region
db.sales.aggregate([
  {
    $group: {
      _id: "$region",
      total_revenue: { $sum: "$total_amount" },
      total_profit: { $sum: "$profit" },
      num_orders: { $sum: 1 }
    }
  },

  { $sort: { total_revenue: -1 } },

  {
    $project: {
      _id: 0,
      region: "$_id",
      total_revenue: { $round: ["$total_revenue", 2] },
      total_profit: { $round: ["$total_profit", 2] },
      num_orders: 1,
      avg_order_value: {
        $round: [{ $divide: ["$total_revenue", "$num_orders"] }, 2]
      }
    }
  }
]);

// 8. Peak Sales Hours (if time component exists)
db.sales.aggregate([
  {
    $addFields: {
      sale_date: { $toDate: "$date" }
    }
  },

  {
    $group: {
      _id: { $dayOfWeek: "$sale_date" },  // 1=Sunday, 7=Saturday
      total_revenue: { $sum: "$total_amount" },
      num_orders: { $sum: 1 }
    }
  },

  { $sort: { _id: 1 } },

  {
    $project: {
      _id: 0,
      day_of_week: {
        $switch: {
          branches: [
            { case: { $eq: ["$_id", 1] }, then: "Sunday" },
            { case: { $eq: ["$_id", 2] }, then: "Monday" },
            { case: { $eq: ["$_id", 3] }, then: "Tuesday" },
            { case: { $eq: ["$_id", 4] }, then: "Wednesday" },
            { case: { $eq: ["$_id", 5] }, then: "Thursday" },
            { case: { $eq: ["$_id", 6] }, then: "Friday" },
            { case: { $eq: ["$_id", 7] }, then: "Saturday" }
          ],
          default: "Unknown"
        }
      },
      total_revenue: { $round: ["$total_revenue", 2] },
      num_orders: 1,
      avg_order_value: {
        $round: [{ $divide: ["$total_revenue", "$num_orders"] }, 2]
      }
    }
  }
]);

// 9. Top 10 Best Performing Days
db.sales.aggregate([
  {
    $addFields: {
      sale_date: { $toDate: "$date" }
    }
  },

  {
    $group: {
      _id: {
        $dateToString: {
          format: "%Y-%m-%d",
          date: "$sale_date"
        }
      },
      daily_revenue: { $sum: "$total_amount" },
      num_orders: { $sum: 1 }
    }
  },

  { $sort: { daily_revenue: -1 } },

  { $limit: 10 },

  {
    $project: {
      _id: 0,
      date: "$_id",
      daily_revenue: { $round: ["$daily_revenue", 2] },
      num_orders: 1
    }
  }
]);

// 10. Quarterly Performance
db.sales.aggregate([
  {
    $addFields: {
      sale_date: { $toDate: "$date" }
    }
  },

  {
    $addFields: {
      quarter: {
        $ceil: { $divide: [{ $month: "$sale_date" }, 3] }
      },
      year: { $year: "$sale_date" }
    }
  },

  {
    $group: {
      _id: {
        year: "$year",
        quarter: "$quarter"
      },
      revenue: { $sum: "$total_amount" },
      profit: { $sum: "$profit" },
      orders: { $sum: 1 }
    }
  },

  { $sort: { "_id.year": 1, "_id.quarter": 1 } },

  {
    $project: {
      _id: 0,
      year: "$_id.year",
      quarter: "$_id.quarter",
      revenue: { $round: ["$revenue", 2] },
      profit: { $round: ["$profit", 2] },
      orders: 1
    }
  }
]);
