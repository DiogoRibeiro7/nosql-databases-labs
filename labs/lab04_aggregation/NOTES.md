# Lab 04 - Advanced Aggregation Framework and Analytics - Notes

## Overview

This lab focuses on real-world analytics scenarios using MongoDB's aggregation framework. The dataset simulates an e-commerce platform with sales transactions, products, and customers spanning 12 months.

---

## Dataset Summary

**Sales Collection** (200 transactions):
- Date range: Jan 2023 - Dec 2023
- Total revenue: $20,376.69
- Total profit: $11,225.69
- Average transaction: $101.88

**Products Collection** (30 products):
- Categories: Electronics, Clothing, Home, Books, Sports
- Price range: $14.99 - $249.99

**Customers Collection** (50 customers):
- Segments: 5 VIP, 13 Premium, 32 Standard
- Countries: USA, UK, Canada, Germany, France

---

## Import Instructions

```bash
mongoimport --db lab04_analytics --collection sales \
  --file labs/lab04_aggregation/starter/data/sales.json --jsonArray

mongoimport --db lab04_analytics --collection products \
  --file labs/lab04_aggregation/starter/data/products.json --jsonArray

mongoimport --db lab04_analytics --collection customers \
  --file labs/lab04_aggregation/starter/data/customers.json --jsonArray
```

---

## Key Aggregation Patterns Used

### 1. Date Grouping
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

### 2. Window Functions (MongoDB 5.0+)
```javascript
{
  $setWindowFields: {
    sortBy: { date: 1 },
    output: {
      moving_avg: {
        $avg: "$revenue",
        window: { documents: [-3, 3] }
      }
    }
  }
}
```

### 3. Complex Lookups
```javascript
{
  $lookup: {
    from: "products",
    localField: "product_id",
    foreignField: "product_id",
    as: "product_details"
  }
}
```

---

## Business Insights from Analysis

### Sales Analytics
- **Peak Month**: December 2023 (holiday shopping)
- **Top Category**: Electronics (highest revenue)
- **Best Product**: Smart Watch (most revenue & profit)
- **Month-over-Month Growth**: Average 8% growth

### Customer Analytics
- **VIP Segment**: 10% of customers, 40% of revenue
- **Average Customer Lifetime Value**: $408
- **Churn Risk**: 6% of customers (no purchase in 90+ days)
- **Top Region**: North America (51% of transactions)

### Product Analytics
- **High Performers**: Smart Watch, Running Shoes, Wireless Headphones
- **Low Performers**: 3 products with <5 sales
- **Profit Margin**: 55.1% average across all products
- **Inventory Turnover**: Best sellers turn over 8-10 times/year

---

##Performance Optimization Tips

1. **Use indexes on date fields**:
   ```javascript
   db.sales.createIndex({ date: 1 });
   ```

2. **$match early in pipeline**:
   - Filter before grouping
   - Reduces data processed

3. **$project early**:
   - Keep only needed fields
   - Reduces document size

4. **Use allowDiskUse for large datasets**:
   ```javascript
   db.collection.aggregate(pipeline, { allowDiskUse: true });
   ```

5. **Avoid multiple $lookup stages**:
   - Embed data when possible
   - Denormalize for read-heavy workloads

---

## Common Issues and Solutions

### Issue 1: Date conversion errors
**Problem**: Dates stored as strings
**Solution**: Use `$toDate` to convert:
```javascript
{ $addFields: { sale_date: { $toDate: "$date" } } }
```

### Issue 2: Division by zero
**Problem**: Calculating averages with zero orders
**Solution**: Use `$cond`:
```javascript
{
  $cond: {
    if: { $eq: ["$orders", 0] },
    then: 0,
    else: { $divide: ["$revenue", "$orders"] }
  }
}
```

### Issue 3: Memory limits exceeded
**Problem**: Aggregation uses >100MB RAM
**Solution**: Add `allowDiskUse`:
```javascript
db.collection.aggregate(pipeline, { allowDiskUse: true });
```

---

## Advanced Techniques Demonstrated

1. **Window Functions**: Moving averages, ranking
2. **Complex Joins**: Multi-collection aggregations
3. **Date Arithmetic**: Date differences, date formatting
4. **Conditional Logic**: $cond, $switch for business rules
5. **Statistical Functions**: $stdDevPop, percentiles
6. **Array Operations**: $unwind, $map, $filter

---

## Real-World Applications

This lab's techniques are used for:
- **Executive Dashboards**: Revenue, profit, growth metrics
- **Customer Segmentation**: RFM analysis, lifetime value
- **Inventory Management**: Stock levels, reorder points
- **Marketing Analytics**: Campaign ROI, customer acquisition cost
- **Sales Forecasting**: Trend analysis, seasonality detection
- **Product Recommendations**: Cross-sell, upsell opportunities

---

## Next Steps

To deepen your knowledge:
1. Explore MongoDB Atlas Charts for visualization
2. Implement real-time aggregations with change streams
3. Build a dashboard with pre-aggregated views
4. Experiment with time-series collections
5. Add geospatial analytics for location-based insights

---

## References

- [MongoDB Aggregation Framework](https://docs.mongodb.com/manual/core/aggregation-pipeline/)
- [Window Functions](https://docs.mongodb.com/manual/reference/operator/aggregation/setWindowFields/)
- [Date Operators](https://docs.mongodb.com/manual/reference/operator/aggregation/date/)
- [Optimization Best Practices](https://docs.mongodb.com/manual/core/aggregation-pipeline-optimization/)
