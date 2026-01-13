// Lab 04 - Business Analytics Aggregations
// Real-world analytics scenarios using MongoDB aggregation

const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const dbName = "lab04_analytics";

async function runAnalytics() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB for Analytics");
    const db = client.db(dbName);

    // ========================================
    // 1. CUSTOMER LIFETIME VALUE (CLV)
    // ========================================
    console.log("\n1. CUSTOMER LIFETIME VALUE ANALYSIS");
    console.log("====================================");

    const clvAnalysis = await db
      .collection("sales")
      .aggregate([
        {
          $group: {
            _id: "$customer_id",
            first_purchase: { $min: "$date" },
            last_purchase: { $max: "$date" },
            total_spent: { $sum: "$amount" },
            order_count: { $count: {} },
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

    console.log("Top 10 Customers by CLV:");
    clvAnalysis.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.customer_name} (${customer.segment})`);
      console.log(`   CLV: $${customer.total_spent} | Orders: ${customer.order_count}`);
      console.log(
        `   Active for: ${Math.round(customer.lifetime_days)} days | Frequency: ${customer.purchase_frequency.toFixed(2)} orders/day`
      );
    });

    // ========================================
    // 2. RFM ANALYSIS (Recency, Frequency, Monetary)
    // ========================================
    console.log("\n2. RFM SEGMENTATION");
    console.log("====================");

    const currentDate = new Date("2024-01-01");

    const rfmAnalysis = await db
      .collection("sales")
      .aggregate([
        {
          $group: {
            _id: "$customer_id",
            last_purchase: { $max: "$date" },
            frequency: { $count: {} },
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

    console.log("RFM Segments:");
    rfmAnalysis.forEach((segment, index) => {
      const recencyLabel = index === 0 ? "Recent" : index === 1 ? "Medium" : "Lapsed";
      console.log(
        `${recencyLabel} Customers (${segment._id.min.toFixed(0)}-${segment._id.max.toFixed(0)} days ago):`
      );
      console.log(
        `  Count: ${segment.customers.length} | Avg Frequency: ${segment.avg_frequency.toFixed(1)} | Avg Value: $${segment.avg_monetary.toFixed(2)}`
      );
    });

    // ========================================
    // 3. COHORT ANALYSIS
    // ========================================
    console.log("\n3. COHORT ANALYSIS");
    console.log("==================");

    const cohortAnalysis = await db
      .collection("sales")
      .aggregate([
        {
          $group: {
            _id: {
              customer_id: "$customer_id",
              cohort_month: {
                $dateToString: {
                  format: "%Y-%m",
                  date: "$date",
                },
              },
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

    console.log("Monthly Cohorts:");
    cohortAnalysis.forEach((cohort) => {
      console.log(
        `${cohort.cohort}: ${cohort.customer_count} customers, $${cohort.avg_revenue_per_customer} avg revenue`
      );
    });

    // ========================================
    // 4. PRODUCT AFFINITY ANALYSIS
    // ========================================
    console.log("\n4. PRODUCT AFFINITY / MARKET BASKET");
    console.log("====================================");

    const productAffinity = await db
      .collection("sales")
      .aggregate([
        {
          $group: {
            _id: "$customer_id",
            products: { $addToSet: "$product_id" },
          },
        },
        {
          $project: {
            product_pairs: {
              $reduce: {
                input: "$products",
                initialValue: [],
                in: {
                  $concatArrays: [
                    "$$value",
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: "$products",
                            cond: { $ne: ["$$this", "$$this"] },
                          },
                        },
                        as: "other",
                        in: {
                          $cond: {
                            if: { $lt: ["$$this", "$$other"] },
                            then: { product1: "$$this", product2: "$$other" },
                            else: { product1: "$$other", product2: "$$this" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        { $unwind: "$product_pairs" },
        {
          $group: {
            _id: "$product_pairs",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ])
      .toArray();

    console.log("Top Product Pairs (Frequently Bought Together):");
    productAffinity.forEach((pair) => {
      if (pair._id.product1 && pair._id.product2) {
        console.log(`  ${pair._id.product1} + ${pair._id.product2}: ${pair.count} times`);
      }
    });

    // ========================================
    // 5. SALES FUNNEL ANALYSIS
    // ========================================
    console.log("\n5. SALES FUNNEL ANALYSIS");
    console.log("========================");

    const funnelAnalysis = await db
      .collection("sales")
      .aggregate([
        {
          $group: {
            _id: "$customer_id",
            first_purchase: { $min: "$date" },
            second_purchase: {
              $min: {
                $cond: [{ $ne: ["$date", { $min: "$date" }] }, "$date", null],
              },
            },
            total_purchases: { $count: {} },
          },
        },
        {
          $group: {
            _id: null,
            total_customers: { $count: {} },
            single_purchase: {
              $sum: {
                $cond: [{ $eq: ["$total_purchases", 1] }, 1, 0],
              },
            },
            repeat_customers: {
              $sum: {
                $cond: [{ $gt: ["$total_purchases", 1] }, 1, 0],
              },
            },
            high_value_customers: {
              $sum: {
                $cond: [{ $gte: ["$total_purchases", 5] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            total_customers: 1,
            single_purchase_rate: {
              $round: [
                { $multiply: [{ $divide: ["$single_purchase", "$total_customers"] }, 100] },
                2,
              ],
            },
            repeat_rate: {
              $round: [
                { $multiply: [{ $divide: ["$repeat_customers", "$total_customers"] }, 100] },
                2,
              ],
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

    console.log("Customer Funnel:", funnelAnalysis[0]);

    // ========================================
    // 6. SEASONALITY ANALYSIS
    // ========================================
    console.log("\n6. SEASONALITY ANALYSIS");
    console.log("=======================");

    const seasonalityAnalysis = await db
      .collection("sales")
      .aggregate([
        {
          $project: {
            month: { $month: "$date" },
            dayOfWeek: { $dayOfWeek: "$date" },
            hour: { $hour: "$date" },
            amount: 1,
            quarter: {
              $ceil: { $divide: [{ $month: "$date" }, 3] },
            },
          },
        },
        {
          $facet: {
            by_month: [
              {
                $group: {
                  _id: "$month",
                  revenue: { $sum: "$amount" },
                  orders: { $count: {} },
                },
              },
              { $sort: { _id: 1 } },
            ],
            by_quarter: [
              {
                $group: {
                  _id: "$quarter",
                  revenue: { $sum: "$amount" },
                  orders: { $count: {} },
                },
              },
              { $sort: { _id: 1 } },
            ],
            by_day_of_week: [
              {
                $group: {
                  _id: "$dayOfWeek",
                  revenue: { $sum: "$amount" },
                  orders: { $count: {} },
                },
              },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ])
      .toArray();

    console.log("Seasonal Patterns:");
    console.log("By Quarter:");
    seasonalityAnalysis[0].by_quarter.forEach((q) => {
      console.log(`  Q${q._id}: $${q.revenue.toFixed(2)} (${q.orders} orders)`);
    });

    // ========================================
    // 7. CUSTOMER CHURN PREDICTION
    // ========================================
    console.log("\n7. CHURN RISK ANALYSIS");
    console.log("======================");

    const churnAnalysis = await db
      .collection("sales")
      .aggregate([
        {
          $group: {
            _id: "$customer_id",
            last_order_date: { $max: "$date" },
            order_count: { $count: {} },
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
            customer_count: { $count: {} },
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

    console.log("Churn Risk Segments:");
    churnAnalysis.forEach((segment) => {
      console.log(`${segment.risk_level}: ${segment.customer_count} customers`);
      console.log(`  Avg LTV: $${segment.avg_ltv} | Total Value: $${segment.total_value}`);
    });

    // ========================================
    // 8. PROFITABILITY ANALYSIS
    // ========================================
    console.log("\n8. PROFITABILITY ANALYSIS");
    console.log("=========================");

    const profitabilityAnalysis = await db
      .collection("sales")
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
            profit: {
              $subtract: ["$amount", { $multiply: ["$quantity", "$product.cost"] }],
            },
            margin: {
              $multiply: [
                {
                  $divide: [
                    {
                      $subtract: ["$amount", { $multiply: ["$quantity", "$product.cost"] }],
                    },
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
              $round: [
                {
                  $multiply: [{ $divide: ["$total_profit", "$total_revenue"] }, 100],
                },
                2,
              ],
            },
            product_diversity: { $size: "$product_count" },
          },
        },
        { $sort: { total_profit: -1 } },
      ])
      .toArray();

    console.log("Profitability by Category:");
    profitabilityAnalysis.forEach((cat) => {
      console.log(`${cat.category}:`);
      console.log(`  Revenue: $${cat.total_revenue} | Profit: $${cat.total_profit}`);
      console.log(`  Margin: ${cat.profit_margin}% | Products: ${cat.product_diversity}`);
    });
  } catch (error) {
    console.error("Error running analytics:", error);
  } finally {
    await client.close();
    console.log("\nDisconnected from MongoDB");
  }
}

// Run the analytics
runAnalytics().catch(console.error);
