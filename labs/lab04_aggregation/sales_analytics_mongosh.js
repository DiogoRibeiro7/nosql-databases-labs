/**
 * Lab 04 - Sales Analytics with Aggregation Pipeline (mongosh version)
 *
 * Run this file in mongosh:
 * mongosh lab04_sales --file sales_analytics_mongosh.js
 *
 * This script demonstrates complex aggregation pipelines for sales analytics
 */

use('lab04_sales');

print("=" .repeat(60));
print("Lab 04 - MongoDB Aggregation Pipeline: Sales Analytics");
print("=" .repeat(60));

// ========================================================================
// 1. Basic Aggregations - Total Sales
// ========================================================================
print("\n1. TOTAL SALES CALCULATION");
print("-".repeat(40));

const totalSales = db.sales.aggregate([
    {
        $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: "$total" },
            minOrder: { $min: "$total" },
            maxOrder: { $max: "$total" }
        }
    }
]).toArray()[0];

print("Sales Summary:");
print(`  Total Revenue: $${totalSales.totalRevenue.toFixed(2)}`);
print(`  Total Orders: ${totalSales.totalOrders}`);
print(`  Average Order Value: $${totalSales.avgOrderValue.toFixed(2)}`);
print(`  Min Order: $${totalSales.minOrder.toFixed(2)}`);
print(`  Max Order: $${totalSales.maxOrder.toFixed(2)}`);

// ========================================================================
// 2. Sales by Product Category
// ========================================================================
print("\n2. SALES BY PRODUCT CATEGORY");
print("-".repeat(40));

const salesByCategory = db.sales.aggregate([
    // Unwind the items array
    { $unwind: "$items" },

    // Lookup product details
    {
        $lookup: {
            from: "products",
            localField: "items.product_id",
            foreignField: "product_id",
            as: "product_info"
        }
    },

    // Unwind product info
    { $unwind: "$product_info" },

    // Group by category
    {
        $group: {
            _id: "$product_info.category",
            totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
            totalQuantity: { $sum: "$items.quantity" },
            orderCount: { $addToSet: "$order_id" }
        }
    },

    // Calculate order count properly
    {
        $project: {
            category: "$_id",
            totalRevenue: 1,
            totalQuantity: 1,
            orderCount: { $size: "$orderCount" },
            avgRevenuePerOrder: { $divide: ["$totalRevenue", { $size: "$orderCount" }] }
        }
    },

    // Sort by revenue
    { $sort: { totalRevenue: -1 } }
]).toArray();

print("Revenue by Category:");
salesByCategory.forEach((cat, index) => {
    print(`\n${index + 1}. ${cat.category || "Uncategorized"}`);
    print(`   Revenue: $${cat.totalRevenue.toFixed(2)}`);
    print(`   Units Sold: ${cat.totalQuantity}`);
    print(`   Orders: ${cat.orderCount}`);
    print(`   Avg Revenue/Order: $${cat.avgRevenuePerOrder.toFixed(2)}`);
});

// ========================================================================
// 3. Top Selling Products
// ========================================================================
print("\n3. TOP SELLING PRODUCTS");
print("-".repeat(40));

const topProducts = db.sales.aggregate([
    { $unwind: "$items" },

    {
        $group: {
            _id: "$items.product_id",
            productName: { $first: "$items.product_name" },
            totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
            totalQuantity: { $sum: "$items.quantity" },
            avgPrice: { $avg: "$items.price" },
            orderCount: { $sum: 1 }
        }
    },

    { $sort: { totalRevenue: -1 } },
    { $limit: 10 }
]).toArray();

print("Top 10 Products by Revenue:");
topProducts.forEach((product, index) => {
    print(`\n${index + 1}. ${product.productName || product._id}`);
    print(`   Revenue: $${product.totalRevenue.toFixed(2)}`);
    print(`   Units Sold: ${product.totalQuantity}`);
    print(`   Avg Price: $${product.avgPrice.toFixed(2)}`);
    print(`   Orders: ${product.orderCount}`);
});

// ========================================================================
// 4. Customer Analysis
// ========================================================================
print("\n4. CUSTOMER ANALYSIS");
print("-".repeat(40));

const customerAnalysis = db.sales.aggregate([
    {
        $group: {
            _id: "$customer_id",
            totalSpent: { $sum: "$total" },
            orderCount: { $sum: 1 },
            avgOrderValue: { $avg: "$total" },
            firstPurchase: { $min: "$date" },
            lastPurchase: { $max: "$date" },
            allItems: { $push: "$items" }
        }
    },

    // Calculate total items purchased
    {
        $addFields: {
            totalItemsPurchased: {
                $sum: {
                    $map: {
                        input: "$allItems",
                        as: "order",
                        in: { $size: "$$order" }
                    }
                }
            }
        }
    },

    // Remove the allItems array (no longer needed)
    { $project: { allItems: 0 } },

    // Sort by total spent
    { $sort: { totalSpent: -1 } },
    { $limit: 10 }
]).toArray();

print("Top 10 Customers by Revenue:");
customerAnalysis.forEach((customer, index) => {
    print(`\n${index + 1}. Customer: ${customer._id}`);
    print(`   Total Spent: $${customer.totalSpent.toFixed(2)}`);
    print(`   Orders: ${customer.orderCount}`);
    print(`   Avg Order: $${customer.avgOrderValue.toFixed(2)}`);
    print(`   Items Purchased: ${customer.totalItemsPurchased}`);
    print(`   First Purchase: ${customer.firstPurchase}`);
    print(`   Last Purchase: ${customer.lastPurchase}`);
});

// ========================================================================
// 5. Time-Based Analysis
// ========================================================================
print("\n5. TIME-BASED ANALYSIS");
print("-".repeat(40));

// Sales by month
const salesByMonth = db.sales.aggregate([
    {
        $group: {
            _id: {
                year: { $year: "$date" },
                month: { $month: "$date" }
            },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 }
        }
    },

    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 12 }
]).toArray();

print("Sales by Month (Last 12 months):");
salesByMonth.forEach(month => {
    const monthName = new Date(month._id.year, month._id.month - 1).toLocaleString('default', { month: 'long' });
    print(`  ${monthName} ${month._id.year}: $${month.revenue.toFixed(2)} (${month.orders} orders)`);
});

// Sales by day of week
const salesByDayOfWeek = db.sales.aggregate([
    {
        $group: {
            _id: { $dayOfWeek: "$date" },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
            avgOrderValue: { $avg: "$total" }
        }
    },
    { $sort: { "_id": 1 } }
]).toArray();

print("\nSales by Day of Week:");
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
salesByDayOfWeek.forEach(day => {
    const dayName = dayNames[day._id - 1];
    print(`  ${dayName}: $${day.revenue.toFixed(2)} (${day.orders} orders, avg: $${day.avgOrderValue.toFixed(2)})`);
});

// ========================================================================
// 6. Sales Funnel Analysis
// ========================================================================
print("\n6. SALES FUNNEL ANALYSIS");
print("-".repeat(40));

const salesFunnel = db.sales.aggregate([
    {
        $facet: {
            "statusBreakdown": [
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                        revenue: { $sum: "$total" }
                    }
                },
                { $sort: { count: -1 } }
            ],
            "conversionRate": [
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        completed: {
                            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                        },
                        cancelled: {
                            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
                        }
                    }
                }
            ]
        }
    }
]).toArray()[0];

print("Order Status Breakdown:");
salesFunnel.statusBreakdown.forEach(status => {
    print(`  ${status._id}: ${status.count} orders ($${status.revenue.toFixed(2)})`);
});

if (salesFunnel.conversionRate[0]) {
    const conv = salesFunnel.conversionRate[0];
    print(`\nConversion Metrics:`);
    print(`  Completion Rate: ${(conv.completed / conv.total * 100).toFixed(1)}%`);
    print(`  Cancellation Rate: ${(conv.cancelled / conv.total * 100).toFixed(1)}%`);
}

// ========================================================================
// 7. Product Bundle Analysis
// ========================================================================
print("\n7. PRODUCT BUNDLE ANALYSIS");
print("-".repeat(40));

// Find products frequently bought together
const productPairs = db.sales.aggregate([
    { $match: { "items.1": { $exists: true } } }, // Orders with 2+ items
    { $unwind: "$items" },
    {
        $group: {
            _id: "$order_id",
            products: { $push: "$items.product_name" }
        }
    },
    { $project: {
        productPairs: {
            $reduce: {
                input: { $range: [0, { $subtract: [{ $size: "$products" }, 1] }] },
                initialValue: [],
                in: {
                    $concatArrays: [
                        "$$value",
                        {
                            $map: {
                                input: { $range: [{ $add: ["$$this", 1] }, { $size: "$products" }] },
                                as: "j",
                                in: {
                                    $cond: [
                                        { $lt: [{ $arrayElemAt: ["$products", "$$this"] },
                                               { $arrayElemAt: ["$products", "$$j"] }] },
                                        {
                                            product1: { $arrayElemAt: ["$products", "$$this"] },
                                            product2: { $arrayElemAt: ["$products", "$$j"] }
                                        },
                                        {
                                            product1: { $arrayElemAt: ["$products", "$$j"] },
                                            product2: { $arrayElemAt: ["$products", "$$this"] }
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                }
            }
        }
    }},
    { $unwind: "$productPairs" },
    {
        $group: {
            _id: "$productPairs",
            count: { $sum: 1 }
        }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
]).toArray();

print("Top 10 Product Pairs (Frequently Bought Together):");
productPairs.forEach((pair, index) => {
    if (pair._id.product1 && pair._id.product2) {
        print(`${index + 1}. ${pair._id.product1} + ${pair._id.product2}: ${pair.count} times`);
    }
});

// ========================================================================
// 8. Geographic Analysis (if location data available)
// ========================================================================
print("\n8. GEOGRAPHIC ANALYSIS");
print("-".repeat(40));

const geoAnalysis = db.sales.aggregate([
    {
        $group: {
            _id: "$shipping_address.country",
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
            avgOrderValue: { $avg: "$total" }
        }
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 }
]).toArray();

if (geoAnalysis.length > 0) {
    print("Top Countries by Revenue:");
    geoAnalysis.forEach((country, index) => {
        print(`${index + 1}. ${country._id || "Unknown"}: $${country.revenue.toFixed(2)} (${country.orders} orders)`);
    });
} else {
    print("No geographic data available");
}

// ========================================================================
// 9. Customer Segmentation
// ========================================================================
print("\n9. CUSTOMER SEGMENTATION");
print("-".repeat(40));

const customerSegments = db.sales.aggregate([
    {
        $group: {
            _id: "$customer_id",
            totalSpent: { $sum: "$total" },
            orderCount: { $sum: 1 },
            avgOrderValue: { $avg: "$total" }
        }
    },
    {
        $bucket: {
            groupBy: "$totalSpent",
            boundaries: [0, 100, 500, 1000, 5000, 10000, Infinity],
            default: "Other",
            output: {
                count: { $sum: 1 },
                totalRevenue: { $sum: "$totalSpent" },
                avgOrders: { $avg: "$orderCount" }
            }
        }
    }
]).toArray();

print("Customer Segments by Spending:");
const segmentNames = ["< $100", "$100-500", "$500-1K", "$1K-5K", "$5K-10K", "> $10K"];
customerSegments.forEach((segment, index) => {
    if (segment._id !== "Other") {
        const name = segmentNames[customerSegments.indexOf(segment)] || segment._id;
        print(`\n${name}:`);
        print(`  Customers: ${segment.count}`);
        print(`  Total Revenue: $${segment.totalRevenue.toFixed(2)}`);
        print(`  Avg Orders/Customer: ${segment.avgOrders.toFixed(1)}`);
    }
});

// ========================================================================
// 10. Performance Metrics Dashboard
// ========================================================================
print("\n10. PERFORMANCE METRICS DASHBOARD");
print("-".repeat(40));

const dashboard = db.sales.aggregate([
    {
        $facet: {
            "summary": [
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$total" },
                        totalOrders: { $sum: 1 },
                        uniqueCustomers: { $addToSet: "$customer_id" },
                        avgOrderValue: { $avg: "$total" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalRevenue: 1,
                        totalOrders: 1,
                        uniqueCustomers: { $size: "$uniqueCustomers" },
                        avgOrderValue: 1
                    }
                }
            ],
            "topMetrics": [
                { $unwind: "$items" },
                {
                    $group: {
                        _id: null,
                        uniqueProducts: { $addToSet: "$items.product_id" },
                        totalItemsSold: { $sum: "$items.quantity" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        uniqueProducts: { $size: "$uniqueProducts" },
                        totalItemsSold: 1
                    }
                }
            ],
            "recentTrend": [
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        dailyRevenue: { $sum: "$total" }
                    }
                },
                { $sort: { _id: -1 } },
                { $limit: 7 }
            ]
        }
    }
]).toArray()[0];

print("\n📊 EXECUTIVE DASHBOARD");
print("=".repeat(40));

if (dashboard.summary[0]) {
    const s = dashboard.summary[0];
    print("Overall Metrics:");
    print(`  💰 Total Revenue: $${s.totalRevenue.toFixed(2)}`);
    print(`  📦 Total Orders: ${s.totalOrders}`);
    print(`  👥 Unique Customers: ${s.uniqueCustomers}`);
    print(`  💵 Avg Order Value: $${s.avgOrderValue.toFixed(2)}`);
}

if (dashboard.topMetrics[0]) {
    const t = dashboard.topMetrics[0];
    print(`\nProduct Metrics:`);
    print(`  🏷️ Unique Products Sold: ${t.uniqueProducts}`);
    print(`  📈 Total Items Sold: ${t.totalItemsSold}`);
}

print("\nLast 7 Days Revenue:");
dashboard.recentTrend.forEach(day => {
    print(`  ${day._id}: $${day.dailyRevenue.toFixed(2)}`);
});

print("\n" + "=".repeat(60));
print("✓ Sales Analytics completed successfully!");
print("=".repeat(60));