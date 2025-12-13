# Lab 04 – Advanced Aggregation Framework and Analytics

## Objectives

By the end of this lab you should be able to:

- Build complex aggregation pipelines for real-world analytics scenarios.
- Use advanced aggregation operators and expressions.
- Perform data transformations and reshaping.
- Implement time-series analysis and trend detection.
- Optimize aggregation pipelines for performance.
- Create analytical reports and dashboards using aggregation.
- Work with window functions and advanced grouping.

---

## 1. Setup

### 1.1. Prerequisites

- MongoDB 5.0+ (for window functions)
- Completion of Labs 01-03
- Understanding of basic aggregation stages

### 1.2. Dataset

A comprehensive e-commerce dataset is provided:

```text
labs/lab04_aggregation/starter/data/sales.json
labs/lab04_aggregation/starter/data/products.json
labs/lab04_aggregation/starter/data/customers.json
```

This dataset represents:
- **sales**: 1000+ sales transactions with dates, amounts, products, customers
- **products**: Product catalog with categories, prices, costs, suppliers
- **customers**: Customer profiles with demographics, segments, lifetime value

---

## 2. Dataset Import

```bash
mongoimport --db lab04_analytics \
  --collection sales \
  --file labs/lab04_aggregation/starter/data/sales.json \
  --jsonArray

mongoimport --db lab04_analytics \
  --collection products \
  --file labs/lab04_aggregation/starter/data/products.json \
  --jsonArray

mongoimport --db lab04_analytics \
  --collection customers \
  --file labs/lab04_aggregation/starter/data/customers.json \
  --jsonArray
```

Verify:
```javascript
use lab04_analytics
db.sales.countDocuments()
db.products.countDocuments()
db.customers.countDocuments()
```

---

## 3. Tasks

**Important:** Before running any JavaScript files, please refer to [FILE_USAGE_GUIDE.md](FILE_USAGE_GUIDE.md) to understand which files should be run with Node.js vs MongoDB Shell (mongosh).

### Task 1: Sales Analytics (25%)

Build aggregation pipelines to analyze sales data:

1. **Revenue by Month**
   - Calculate total revenue per month for the last 12 months
   - Include: month, revenue, order count, average order value
   - Sort by month descending

2. **Top Products by Revenue**
   - Find top 20 products by total revenue
   - Include: product name, category, revenue, units sold, profit margin

3. **Sales by Category**
   - Group sales by product category
   - Calculate: total revenue, average price, units sold
   - Sort by revenue

4. **Daily Sales Trends**
   - Calculate daily revenue for a specific month
   - Identify peak sales days
   - Calculate moving average (7-day window)

5. **Revenue vs. Cost Analysis**
   - Calculate total revenue, total cost, and profit for each product
   - Compute profit margin percentage
   - Identify most profitable products

Save your pipelines in:
```text
labs/lab04_aggregation/sales_analytics.js
```

---

### Task 2: Customer Analytics (25%)

Build pipelines to analyze customer behavior:

1. **Customer Segmentation by Value**
   - Segment customers into tiers: VIP (>$10k), Premium ($5k-$10k), Standard (<$5k)
   - Count customers in each segment
   - Calculate average order value per segment

2. **Customer Cohort Analysis**
   - Group customers by their first purchase month
   - Calculate retention rate per cohort
   - Show cohort size and average customer lifetime value

3. **RFM Analysis (Recency, Frequency, Monetary)**
   - Calculate for each customer:
     - Recency: Days since last purchase
     - Frequency: Number of purchases
     - Monetary: Total amount spent
   - Assign RFM scores (1-5 scale)
   - Identify best customers (high scores on all)

4. **Customer Churn Prediction**
   - Identify customers who haven't purchased in 90+ days
   - Calculate their historical purchase patterns
   - Flag at-risk customers

5. **Geographic Analysis**
   - Group customers by country/region
   - Calculate total revenue per region
   - Identify most valuable regions

Save your pipelines in:
```text
labs/lab04_aggregation/customer_analytics.js
```

---

### Task 3: Product Analytics (20%)

Analyze product performance and inventory:

1. **Product Performance Matrix**
   - For each product, calculate:
     - Total units sold
     - Total revenue
     - Average rating (if available)
     - Number of orders
   - Categorize as: High-volume, High-value, Low-performer

2. **Cross-Sell Analysis**
   - Find products frequently bought together
   - Use $lookup to join sales transactions
   - Identify top product combinations

3. **Product Lifecycle Analysis**
   - Group products by launch date
   - Calculate sales velocity over time
   - Identify products in decline vs. growth

4. **Inventory Optimization**
   - Calculate inventory turnover ratio
   - Identify slow-moving products
   - Recommend reorder quantities based on sales velocity

5. **Price Elasticity Analysis**
   - Analyze sales volume at different price points
   - Calculate optimal pricing
   - Identify discount impact on revenue

Save your pipelines in:
```text
labs/lab04_aggregation/product_analytics.js
```

---

### Task 4: Advanced Techniques (30%)

Use advanced aggregation features:

#### 4.1. Window Functions (MongoDB 5.0+)

1. **Running Total**
   - Calculate cumulative revenue over time
   - Use `$setWindowFields` with $sum

2. **Ranking**
   - Rank customers by total spending
   - Rank products by revenue within each category

3. **Moving Averages**
   - Calculate 7-day and 30-day moving average of sales
   - Smooth out daily fluctuations

#### 4.2. Complex Joins and Lookups

1. **Sales with Product Details**
   - Join sales with products collection
   - Include product name, category, cost in sales report

2. **Customer Purchase History**
   - For each customer, embed their full purchase history
   - Include product details in each purchase

3. **Multi-Collection Analysis**
   - Join sales → products → customers
   - Create comprehensive transaction report

#### 4.3. Data Transformation

1. **Pivot/Unpivot Data**
   - Transform sales data into a pivot table format
   - Rows: Products, Columns: Months, Values: Revenue

2. **Array Operations**
   - Use `$map`, `$filter`, `$reduce` on arrays
   - Transform nested data structures

3. **Conditional Aggregation**
   - Use `$cond`, `$switch` for conditional logic
   - Create calculated fields based on business rules

#### 4.4. Performance Optimization

1. **Index Usage**
   - Ensure aggregations use appropriate indexes
   - Check with explain()

2. **Pipeline Optimization**
   - Reorder stages for better performance
   - Use $project early to reduce document size
   - Use $match early to filter documents

3. **Aggregation Options**
   - Use `allowDiskUse` for large datasets
   - Set batch size appropriately
   - Configure cursor timeout

Save your pipelines in:
```text
labs/lab04_aggregation/advanced_techniques.js
```

---

## 4. What to Submit

Inside `labs/lab04_aggregation/`, you should have:

* `sales_analytics.js` – Sales analysis pipelines (Task 1)
* `customer_analytics.js` – Customer analysis pipelines (Task 2)
* `product_analytics.js` – Product analysis pipelines (Task 3)
* `advanced_techniques.js` – Advanced aggregation techniques (Task 4)
* `NOTES.md` – Explanations, insights, and optimization notes
* Optional: `dashboard_queries.js` – Pre-built queries for a dashboard

Follow the submission guidelines in
[`instructions/submission_guide.md`](../../instructions/submission_guide.md).

---

## 5. Self-Assessment Checklist

Before moving on, make sure you can demonstrate:

* **Task 1 – Sales Analytics**: Pipelines return sensible revenue/volume numbers and are documented in `sales_analytics.js`.
* **Task 2 – Customer Analytics**: Your RFM/cohort logic is explained and reproducible.
* **Task 3 – Product Analytics**: Cross-sell or inventory insights include the aggregation stages used to derive them.
* **Task 4 – Advanced Techniques**: At least one pipeline uses window functions or performance tweaks with recorded metrics.

If any item feels shaky, revisit the corresponding section or practice pipeline before proceeding.

---

## 6. Tips and Best Practices

### 6.1. Aggregation Pipeline Optimization

1. **$match early**: Filter documents before processing
2. **$project early**: Reduce document size
3. **$limit early**: Stop processing when you have enough results
4. **Use indexes**: Ensure first $match uses an index
5. **Avoid $lookup**: Use embedding when possible

### 6.2. Common Patterns

#### Pattern 1: Group and Reshape
```javascript
db.collection.aggregate([
  { $group: { _id: "$field", total: { $sum: "$value" } } },
  { $project: { _id: 0, field: "$_id", total: 1 } },
  { $sort: { total: -1 } }
]);
```

#### Pattern 2: Conditional Aggregation
```javascript
{
  $group: {
    _id: "$category",
    highValue: { $sum: { $cond: [{ $gte: ["$price", 100] }, 1, 0] } },
    lowValue: { $sum: { $cond: [{ $lt: ["$price", 100] }, 1, 0] } }
  }
}
```

#### Pattern 3: Date Grouping
```javascript
{
  $group: {
    _id: {
      year: { $year: "$date" },
      month: { $month: "$date" }
    },
    total: { $sum: "$amount" }
  }
}
```

### 6.3. Window Functions (MongoDB 5.0+)

```javascript
{
  $setWindowFields: {
    partitionBy: "$category",
    sortBy: { date: 1 },
    output: {
      cumulativeRevenue: {
        $sum: "$revenue",
        window: { documents: ["unbounded", "current"] }
      },
      movingAverage: {
        $avg: "$revenue",
        window: { documents: [-6, 0] }  // 7-day window
      }
    }
  }
}
```

### 6.4. Complex Lookups

```javascript
{
  $lookup: {
    from: "products",
    let: { product_id: "$product_id" },
    pipeline: [
      { $match: { $expr: { $eq: ["$_id", "$$product_id"] } } },
      { $project: { name: 1, category: 1, price: 1 } }
    ],
    as: "product_details"
  }
}
```

---

## 7. Business Questions to Answer

Use your aggregations to answer:

1. **What are our top 5 revenue-generating products?**
2. **Which customer segment generates the most revenue?**
3. **What is the average time between customer purchases?**
4. **Which products have declining sales trends?**
5. **What is our month-over-month revenue growth rate?**
6. **Which geographic regions have the highest customer lifetime value?**
7. **What is the optimal reorder point for our top 10 products?**
8. **Which product categories have the highest profit margins?**
9. **What percentage of customers are at risk of churning?**
10. **What is the revenue impact of our promotions?**

Document your answers in `NOTES.md`.

---

## 8. Optional Extensions

1. **Build a Real-Time Dashboard**
   - Create views for dashboard widgets
   - Optimize for fast refresh

2. **Forecasting**
   - Use historical data to predict future sales
   - Implement simple linear regression in aggregation

3. **Anomaly Detection**
   - Identify unusual sales patterns
   - Flag suspicious transactions

4. **A/B Test Analysis**
   - Compare performance of different product variants
   - Calculate statistical significance

5. **Market Basket Analysis**
   - Find association rules (if A then B)
   - Calculate support, confidence, lift

---

### Basic Warm-up (Optional)

Need to brush up before tackling the full analytics backlog? Run the starter pipelines in [`BASIC_EXERCISES.md`](BASIC_EXERCISES.md) covering simple grouping, lookups, customer segments, and a first aggregation explain plan.

---

### Advanced Challenges (Bonus Track)

Students aiming for deeper mastery should read [`ADVANCED_EXERCISES.md`](ADVANCED_EXERCISES.md). It introduces:

1. Sliding-window anomaly detection with `$setWindowFields`.
2. A reusable pipeline helper library to reduce duplication.
3. An aggregation benchmarking harness that captures `executionStats`.

Summaries belong in the “Advanced Exercises Dashboard” section of `NOTES.md`.

---

## 9. Resources

- [Aggregation Pipeline](https://docs.mongodb.com/manual/core/aggregation-pipeline/)
- [Aggregation Pipeline Operators](https://docs.mongodb.com/manual/reference/operator/aggregation/)
- [Window Functions](https://docs.mongodb.com/manual/reference/operator/aggregation/setWindowFields/)
- [$lookup](https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/)
- [Optimization](https://docs.mongodb.com/manual/core/aggregation-pipeline-optimization/)
- [Aggregation Pipeline Limits](https://docs.mongodb.com/manual/core/aggregation-pipeline-limits/)

---

Good luck! This lab simulates real-world analytics work you'd do as a data analyst or backend engineer.

---

### Feedback & Collaboration

- File enhancement ideas or bugs via [GitHub Issues](https://github.com/diogoribeiro7/nosql-databases-labs/issues) tagged `lab04`.
- Share pipeline patterns or visualizations in [Discussions](https://github.com/diogoribeiro7/nosql-databases-labs/discussions) to inspire classmates.
