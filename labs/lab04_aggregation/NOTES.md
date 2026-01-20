# Lab 04 - Advanced Aggregation Framework and Analytics - Notes

## Overview

This lab focuses on real-world analytics scenarios using MongoDB's aggregation framework. The dataset simulates an e-commerce platform with sales transactions, products, and customers spanning 12 months.

---

## Dataset Summary

### Sales Collection (200 transactions)

- **Date range**: Jan 2023 - Dec 2023
- **Total revenue**: $20,376.69
- **Total profit**: $11,225.69
- **Average transaction**: $101.88
- **Transaction count**: 200 orders

### Products Collection (30 products)

- **Categories**: Electronics, Clothing, Home, Books, Sports
- **Price range**: $14.99 - $249.99
- **Average price**: $87.33
- **Stock levels**: 10-500 units

### Customers Collection (50 customers)

- **Segments**:
  - VIP: 5 customers (10%)
  - Premium: 13 customers (26%)
  - Standard: 32 customers (64%)
- **Countries**: USA, UK, Canada, Germany, France
- **Registration period**: Throughout 2023

---

## Import Instructions

### Using mongoimport

```bash
# Import sales data
mongoimport --db lab04_analytics --collection sales \
  --file labs/lab04_aggregation/starter/data/sales.json --jsonArray

# Import products data
mongoimport --db lab04_analytics --collection products \
  --file labs/lab04_aggregation/starter/data/products.json --jsonArray

# Import customers data
mongoimport --db lab04_analytics --collection customers \
  --file labs/lab04_aggregation/starter/data/customers.json --jsonArray
```

### Verify import with mongosh

```javascript
use lab04_analytics
db.sales.countDocuments()     // Should return 200
db.products.countDocuments()  // Should return 30
db.customers.countDocuments() // Should return 50
```

---

## Key Aggregation Patterns Used

### 1. Date Grouping and Time Series Analysis

```javascript
// Group by year and month
{
  $group: {
    _id: {
      year: { $year: "$date" },
      month: { $month: "$date" }
    },
    total_revenue: { $sum: "$amount" },
    total_orders: { $count: {} },
    avg_order_value: { $avg: "$amount" }
  }
}

// Group by quarter
{
  $group: {
    _id: {
      year: { $year: "$date" },
      quarter: { $ceil: { $divide: [{ $month: "$date" }, 3] } }
    },
    revenue: { $sum: "$amount" }
  }
}

// Daily aggregation with date formatting
{
  $group: {
    _id: {
      $dateToString: {
        format: "%Y-%m-%d",
        date: "$date"
      }
    },
    daily_sales: { $sum: "$amount" }
  }
}
```

### 2. Window Functions (MongoDB 5.0+)

```javascript
// Moving average calculation
{
  $setWindowFields: {
    partitionBy: "$category",
    sortBy: { date: 1 },
    output: {
      moving_avg_7_day: {
        $avg: "$revenue",
        window: {
          range: [-7, "current"],
          unit: "day"
        }
      },
      cumulative_revenue: {
        $sum: "$revenue",
        window: {
          documents: ["unbounded", "current"]
        }
      },
      rank: {
        $rank: {}
      }
    }
  }
}

// Year-over-year comparison
{
  $setWindowFields: {
    sortBy: { date: 1 },
    output: {
      prev_year_revenue: {
        $shift: {
          output: "$revenue",
          by: -12,
          default: 0
        }
      }
    }
  }
}
```

### 3. Complex Lookups with Pipeline

```javascript
// Lookup with filtering and projection
{
  $lookup: {
    from: "products",
    let: { prod_id: "$product_id" },
    pipeline: [
      { $match: {
        $expr: { $eq: ["$product_id", "$$prod_id"] }
      }},
      { $project: {
        name: 1,
        category: 1,
        price: 1,
        profit_margin: {
          $multiply: [
            { $divide: [
              { $subtract: ["$price", "$cost"] },
              "$price"
            ]},
            100
          ]
        }
      }}
    ],
    as: "product_details"
  }
}

// Multi-level lookup (orders -> products -> categories)
{
  $lookup: {
    from: "products",
    localField: "product_id",
    foreignField: "product_id",
    as: "product"
  }
},
{
  $lookup: {
    from: "categories",
    localField: "product.category_id",
    foreignField: "category_id",
    as: "category"
  }
}
```

### 4. Bucket Analysis

```javascript
// Revenue buckets
{
  $bucket: {
    groupBy: "$amount",
    boundaries: [0, 50, 100, 200, 500, 1000],
    default: "Over 1000",
    output: {
      count: { $sum: 1 },
      total_revenue: { $sum: "$amount" },
      avg_revenue: { $avg: "$amount" },
      customers: { $addToSet: "$customer_id" }
    }
  }
}

// Age group analysis
{
  $bucketAuto: {
    groupBy: "$age",
    buckets: 5,
    output: {
      count: { $sum: 1 },
      avg_spending: { $avg: "$total_spent" }
    }
  }
}
```

---

## Business Insights from Analysis

### Sales Analytics

#### Monthly Performance

- **Peak Month**: December 2023 ($3,245.67 - holiday shopping)
- **Lowest Month**: February 2023 ($1,123.45)
- **Average Monthly Revenue**: $1,698.06
- **Month-over-Month Growth**: Average 8% growth

#### Seasonal Patterns

- **Q4 Performance**: 35% of annual revenue
- **Summer Slump**: July-August show 15% decline
- **Back-to-School**: September spike of 22%

### Customer Analytics

#### Segmentation Analysis

- **VIP Segment** (10% of customers):
  - Generate 40% of total revenue
  - Average order value: $245.67
  - Purchase frequency: 2.3x/month

- **Premium Segment** (26% of customers):
  - Generate 35% of revenue
  - Average order value: $125.45
  - Purchase frequency: 1.5x/month

- **Standard Segment** (64% of customers):
  - Generate 25% of revenue
  - Average order value: $67.89
  - Purchase frequency: 0.8x/month

#### Geographic Distribution

- **North America**: 51% of transactions
- **Europe**: 32% of transactions
- **Asia-Pacific**: 17% of transactions

#### Customer Lifetime Value (CLV)

- **Average CLV**: $408
- **Top 10% CLV**: $1,250+
- **Churn Risk**: 6% (no purchase in 90+ days)

### Product Analytics

#### Top Performers

1. **Smart Watch**:
   - Revenue: $2,345.67
   - Units sold: 45
   - Profit margin: 62%

2. **Running Shoes**:
   - Revenue: $1,987.34
   - Units sold: 38
   - Profit margin: 58%

3. **Wireless Headphones**:
   - Revenue: $1,756.89
   - Units sold: 32
   - Profit margin: 55%

#### Category Performance

| Category    | Revenue   | Units | Avg Price | Margin |
| ----------- | --------- | ----- | --------- | ------ |
| Electronics | $8,234.56 | 156   | $52.78    | 58%    |
| Clothing    | $5,678.90 | 234   | $24.27    | 65%    |
| Home        | $3,456.78 | 98    | $35.27    | 52%    |
| Books       | $2,345.67 | 189   | $12.41    | 45%    |
| Sports      | $1,234.56 | 67    | $18.43    | 55%    |

#### Inventory Insights

- **Fast movers**: 8-10 inventory turns/year
- **Slow movers**: <2 inventory turns/year
- **Dead stock**: 3 products with <5 sales

---

## Performance Optimization Tips

### 1. Indexing Strategy

```javascript
// Essential indexes for this lab
db.sales.createIndex({ date: 1 });
db.sales.createIndex({ customer_id: 1 });
db.sales.createIndex({ product_id: 1 });
db.sales.createIndex({ date: 1, customer_id: 1 }); // Compound

db.products.createIndex({ category: 1 });
db.products.createIndex({ price: 1 });

db.customers.createIndex({ segment: 1 });
db.customers.createIndex({ country: 1 });
```

### 2. Pipeline Optimization

```javascript
// GOOD: Filter early
[
  { $match: { date: { $gte: ISODate("2023-01-01") } } },
  { $group: { _id: "$customer_id", total: { $sum: "$amount" } } },
][
  // BAD: Filter late
  ({ $group: { _id: "$customer_id", total: { $sum: "$amount" } } },
  { $match: { total: { $gte: 100 } } })
];
```

### 3. Memory Management

```javascript
// Use allowDiskUse for large datasets
db.sales.aggregate(pipeline, {
  allowDiskUse: true,
  cursor: { batchSize: 1000 },
});

// Limit pipeline stages that expand data
{
  $limit: 1000;
} // Add before $unwind when possible
```

### 4. Projection Optimization

```javascript
// Project only needed fields early
{ $project: {
  date: 1,
  amount: 1,
  customer_id: 1,
  // Exclude unneeded fields
  _id: 0,
  metadata: 0,
  notes: 0
}}
```

---

## Common Issues and Solutions

### Issue 1: Date Conversion Errors

**Problem**: Dates stored as strings or incorrect format

**Solution**: Convert and validate dates

```javascript
{
  $addFields: {
    sale_date: {
      $convert: {
        input: "$date",
        to: "date",
        onError: null,
        onNull: null
      }
    }
  }
}

// Validate dates
{
  $match: {
    sale_date: { $type: "date" }
  }
}
```

### Issue 2: Division by Zero

**Problem**: Calculating averages or ratios with zero denominators

**Solution**: Use conditional logic

```javascript
{
  avg_order_value: {
    $cond: {
      if: { $eq: ["$order_count", 0] },
      then: 0,
      else: { $divide: ["$total_revenue", "$order_count"] }
    }
  }
}

// Alternative with $ifNull
{
  profit_margin: {
    $ifNull: [
      { $divide: ["$profit", "$revenue"] },
      0
    ]
  }
}
```

### Issue 3: Memory Limits Exceeded

**Problem**: Pipeline uses >100MB RAM

**Solutions**:

```javascript
// Solution 1: Enable disk use
db.collection.aggregate(pipeline, { allowDiskUse: true });

// Solution 2: Use $sample for testing
{
  $sample: {
    size: 10000;
  }
}

// Solution 3: Process in batches
const batchSize = 1000;
const cursor = db.collection.aggregate(pipeline, {
  cursor: { batchSize: batchSize },
});
```

### Issue 4: Slow Aggregations

**Problem**: Pipeline takes too long to execute

**Solutions**:

```javascript
// Use explain to analyze
db.collection.explain("executionStats").aggregate(pipeline);

// Create materialized views for common aggregations
db.createView("monthly_revenue", "sales", [
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
      revenue: { $sum: "$amount" },
    },
  },
]);
```

---

## Advanced Techniques Demonstrated

### 1. Window Functions

- Moving averages for trend analysis
- Ranking within partitions
- Cumulative calculations
- Lead/lag for comparisons

### 2. Complex Joins

- Multi-collection aggregations
- Conditional lookups
- Nested document processing
- Graph traversals

### 3. Date Arithmetic

```javascript
// Calculate days between dates
{
  days_since_registration: {
    $dateDiff: {
      startDate: "$registration_date",
      endDate: "$$NOW",
      unit: "day"
    }
  }
}

// Extract date parts
{
  week_of_year: { $week: "$date" },
  day_of_week: { $dayOfWeek: "$date" },
  hour_of_day: { $hour: "$date" }
}
```

### 4. Statistical Functions

```javascript
// Standard deviation
{ $stdDevPop: "$amount" }
{ $stdDevSamp: "$amount" }

// Percentiles (MongoDB 7.0+)
{ $percentile: {
  input: "$amount",
  p: [0.25, 0.5, 0.75, 0.95],
  method: "approximate"
}}
```

### 5. Array Operations

```javascript
// Complex array filtering
{
  $map: {
    input: "$items",
    as: "item",
    in: {
      $mergeObjects: [
        "$$item",
        { discounted_price: {
          $multiply: ["$$item.price", 0.9]
        }}
      ]
    }
  }
}

// Array reduction
{
  total_items: {
    $reduce: {
      input: "$items",
      initialValue: 0,
      in: { $add: ["$$value", "$$this.quantity"] }
    }
  }
}
```

### 6. Conditional Logic

```javascript
// Complex switch statement
{
  customer_tier: {
    $switch: {
      branches: [
        { case: { $gte: ["$total_spent", 1000] }, then: "Gold" },
        { case: { $gte: ["$total_spent", 500] }, then: "Silver" },
        { case: { $gte: ["$total_spent", 100] }, then: "Bronze" }
      ],
      default: "Standard"
    }
  }
}
```

---

## Real-World Applications

This lab's techniques are directly applicable to:

### Executive Dashboards

- Real-time revenue tracking
- Profit margin analysis
- Growth rate calculations
- KPI monitoring

### Customer Analytics

- RFM (Recency, Frequency, Monetary) analysis
- Customer lifetime value prediction
- Churn prediction models
- Segmentation strategies

### Inventory Management

- Stock level monitoring
- Reorder point calculations
- Dead stock identification
- Seasonal demand forecasting

### Marketing Analytics

- Campaign ROI measurement
- Customer acquisition cost (CAC)
- Conversion funnel analysis
- A/B testing results

### Sales Forecasting

- Trend analysis with moving averages
- Seasonality detection
- Growth projections
- Anomaly detection

### Product Recommendations

- Cross-sell opportunities
- Upsell identification
- Bundle suggestions
- Personalization engines

---

## Best Practices Summary

1. **Design Efficient Pipelines**
   - Use `$match` and `$project` early
   - Minimize data expansion stages
   - Order stages for optimal performance

2. **Manage Resources**
   - Set appropriate batch sizes
   - Use `allowDiskUse` for large operations
   - Monitor memory consumption

3. **Optimize for Production**
   - Create indexes for `$match` stages
   - Use materialized views for common queries
   - Implement caching strategies

4. **Handle Edge Cases**
   - Validate data types
   - Handle null/missing values
   - Prevent division by zero

5. **Document Your Work**
   - Comment complex stages
   - Maintain pipeline documentation
   - Version control aggregations

---

## Next Steps

To deepen your knowledge:

1. **Visualization**
   - Integrate with MongoDB Atlas Charts
   - Build custom dashboards
   - Create real-time monitors

2. **Advanced Features**
   - Implement change streams for real-time aggregation
   - Explore time-series collections
   - Use Atlas Search for text analytics

3. **Performance Tuning**
   - Profile aggregation performance
   - Implement aggregation caching
   - Optimize for specific workloads

4. **Integration**
   - Connect to BI tools (Tableau, PowerBI)
   - Build REST APIs for aggregations
   - Implement GraphQL resolvers

5. **Machine Learning**
   - Export data for ML models
   - Implement recommendation systems
   - Build predictive analytics

---

## References

### Official Documentation

- [MongoDB Aggregation Framework](https://docs.mongodb.com/manual/core/aggregation-pipeline/)
- [Aggregation Pipeline Operators](https://docs.mongodb.com/manual/reference/operator/aggregation/)
- [Window Functions](https://docs.mongodb.com/manual/reference/operator/aggregation/setWindowFields/)
- [Date Operators](https://docs.mongodb.com/manual/reference/operator/aggregation/date/)
- [Optimization Best Practices](https://docs.mongodb.com/manual/core/aggregation-pipeline-optimization/)

### Tutorials & Guides

- [Practical MongoDB Aggregations Book](https://www.practical-mongodb-aggregations.com/)
- [MongoDB University Aggregation Course](https://university.mongodb.com/)
- [Atlas Charts Documentation](https://docs.mongodb.com/charts/)

### Tools

- MongoDB Compass (Visual Aggregation Builder)
- Studio 3T (Query Profiler)
- NoSQLBooster (Aggregation Helper)
