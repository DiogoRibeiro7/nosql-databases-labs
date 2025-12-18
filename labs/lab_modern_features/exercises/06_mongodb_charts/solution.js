/**
 * Exercise 06: MongoDB Charts Visualization
 *
 * MongoDB Charts is a data visualization tool that allows you to create
 * visual representations of your MongoDB data. While Charts itself is a
 * web-based tool, this exercise prepares data and demonstrates patterns
 * for effective visualization.
 */

const { MongoClient } = require("mongodb");

class MongoDBChartsExercises {
  constructor(connectionUrl) {
    this.connectionUrl = connectionUrl || "mongodb://localhost:27017";
    this.client = null;
    this.db = null;
  }

  async connect() {
    this.client = new MongoClient(this.connectionUrl);
    await this.client.connect();
    this.db = this.client.db("modern_features_lab");
    console.log("Connected to MongoDB");
  }

  /**
   * Exercise 1: Sales Dashboard Data
   * Prepare e-commerce sales data for visualization
   */
  async prepareSalesData() {
    console.log("Preparing sales dashboard data...");

    const sales = this.db.collection("sales_data");
    await sales.drop().catch(() => {});

    // Generate sales data for the last 90 days
    const salesData = [];
    const products = ["Laptop", "Phone", "Tablet", "Headphones", "Watch", "Camera"];
    const regions = ["North America", "Europe", "Asia", "South America", "Africa", "Australia"];
    const categories = ["Electronics", "Accessories", "Computing", "Mobile", "Wearables"];

    const now = new Date();
    for (let days = 0; days < 90; days++) {
      const date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      // Generate 10-50 sales per day
      const salesCount = 10 + Math.floor(Math.random() * 40);

      for (let i = 0; i < salesCount; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const region = regions[Math.floor(Math.random() * regions.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];

        salesData.push({
          date: date,
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate(),
          weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
          quarter: Math.floor((date.getMonth() + 3) / 3),
          product: product,
          category: category,
          region: region,
          quantity: 1 + Math.floor(Math.random() * 5),
          unitPrice: 50 + Math.floor(Math.random() * 2000),
          discount: Math.floor(Math.random() * 20),
          revenue: 0, // Will be calculated
          customer: {
            type: Math.random() > 0.3 ? "returning" : "new",
            satisfaction: 3 + Math.floor(Math.random() * 3),
          },
        });
      }
    }

    // Calculate revenue
    salesData.forEach((sale) => {
      sale.revenue = sale.quantity * sale.unitPrice * (1 - sale.discount / 100);
      sale.profit = sale.revenue * (0.2 + Math.random() * 0.3); // 20-50% profit margin
    });

    await sales.insertMany(salesData);
    console.log(`Inserted ${salesData.length} sales records`);

    // Aggregations for Charts
    console.log("\n=== Chart-Ready Aggregations ===\n");

    // 1. Daily Revenue Trend (Line Chart)
    console.log("1. Daily Revenue Trend:");
    const dailyRevenue = await sales
      .aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalRevenue: { $sum: "$revenue" },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 30 },
      ])
      .toArray();

    console.log(`  Last 30 days: ${dailyRevenue.length} data points`);
    console.log(`  Sample: ${dailyRevenue[0]._id} - $${dailyRevenue[0].totalRevenue.toFixed(2)}`);

    // 2. Revenue by Region (Pie/Donut Chart)
    console.log("\n2. Revenue by Region:");
    const regionRevenue = await sales
      .aggregate([
        {
          $group: {
            _id: "$region",
            revenue: { $sum: "$revenue" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
      ])
      .toArray();

    regionRevenue.forEach((region) => {
      const percentage = (
        (region.revenue / salesData.reduce((sum, s) => sum + s.revenue, 0)) *
        100
      ).toFixed(1);
      console.log(`  ${region._id}: $${region.revenue.toFixed(0)} (${percentage}%)`);
    });

    // 3. Product Performance (Bar Chart)
    console.log("\n3. Top Products by Revenue:");
    const productPerformance = await sales
      .aggregate([
        {
          $group: {
            _id: "$product",
            revenue: { $sum: "$revenue" },
            unitsSold: { $sum: "$quantity" },
            avgPrice: { $avg: "$unitPrice" },
          },
        },
        { $sort: { revenue: -1 } },
      ])
      .toArray();

    productPerformance.forEach((product) => {
      console.log(`  ${product._id}: $${product.revenue.toFixed(0)} (${product.unitsSold} units)`);
    });

    // 4. Heatmap Data (Sales by Day and Hour)
    console.log("\n4. Sales Heatmap Pattern:");
    const heatmapData = await sales
      .aggregate([
        {
          $group: {
            _id: {
              weekday: "$weekday",
              hour: { $hour: "$date" },
            },
            sales: { $sum: 1 },
            revenue: { $sum: "$revenue" },
          },
        },
        { $sort: { "_id.weekday": 1, "_id.hour": 1 } },
        { $limit: 10 },
      ])
      .toArray();

    console.log("  Sample heatmap points (weekday/hour):");
    heatmapData.slice(0, 3).forEach((point) => {
      console.log(`    ${point._id.weekday} ${point._id.hour}:00 - ${point.sales} sales`);
    });
  }

  /**
   * Exercise 2: Real-time Metrics Data
   * Prepare server metrics for real-time dashboard
   */
  async prepareMetricsData() {
    console.log("\n=== Preparing Real-time Metrics ===\n");

    const metrics = this.db.collection("server_metrics_charts");
    await metrics.drop().catch(() => {});

    // Generate server metrics for the last hour
    const metricsData = [];
    const servers = ["web-01", "web-02", "api-01", "api-02", "db-01"];
    const now = new Date();

    for (let minutes = 0; minutes < 60; minutes++) {
      const timestamp = new Date(now.getTime() - minutes * 60000);

      servers.forEach((server) => {
        const baseLoad = server.startsWith("db") ? 60 : 40;
        metricsData.push({
          timestamp: timestamp,
          server: server,
          metrics: {
            cpu: baseLoad + Math.random() * 40,
            memory: 50 + Math.random() * 30,
            diskIO: Math.random() * 100,
            networkIn: Math.random() * 1000,
            networkOut: Math.random() * 1000,
            requestsPerSecond: server.startsWith("web") ? Math.floor(Math.random() * 1000) : 0,
            responseTime: server.startsWith("web") ? 50 + Math.random() * 200 : null,
          },
          status: Math.random() > 0.95 ? "warning" : "healthy",
        });
      });
    }

    await metrics.insertMany(metricsData);

    // Gauge Chart Data (Current Values)
    console.log("Gauge Chart Data (Current CPU):");
    const currentMetrics = await metrics
      .aggregate([
        { $sort: { timestamp: -1 } },
        {
          $group: {
            _id: "$server",
            currentCPU: { $first: "$metrics.cpu" },
            currentMemory: { $first: "$metrics.memory" },
            status: { $first: "$status" },
          },
        },
      ])
      .toArray();

    currentMetrics.forEach((server) => {
      console.log(
        `  ${server._id}: CPU ${server.currentCPU.toFixed(1)}%, Memory ${server.currentMemory.toFixed(1)}%`
      );
    });

    // Multi-line Chart Data (CPU over time)
    console.log("\nMulti-line Chart Data (CPU Trends):");
    const cpuTrends = await metrics
      .aggregate([
        {
          $match: {
            timestamp: { $gte: new Date(now.getTime() - 10 * 60000) }, // Last 10 minutes
          },
        },
        {
          $group: {
            _id: {
              server: "$server",
              minute: { $dateToString: { format: "%H:%M", date: "$timestamp" } },
            },
            avgCPU: { $avg: "$metrics.cpu" },
          },
        },
        { $sort: { "_id.server": 1, "_id.minute": 1 } },
        { $limit: 20 },
      ])
      .toArray();

    console.log(`  ${cpuTrends.length} data points for multi-line chart`);
  }

  /**
   * Exercise 3: Customer Analytics Data
   */
  async prepareCustomerData() {
    console.log("\n=== Preparing Customer Analytics ===\n");

    const customers = this.db.collection("customer_analytics");
    await customers.drop().catch(() => {});

    // Generate customer data
    const customerData = [];
    const countries = ["USA", "UK", "Germany", "France", "Japan", "Brazil", "India", "Australia"];
    const segments = ["Premium", "Regular", "Basic"];
    const channels = ["Web", "Mobile App", "Store", "Phone"];

    for (let i = 0; i < 1000; i++) {
      const registrationDate = new Date(2024, 0, 1 + Math.floor(Math.random() * 365));
      const lastPurchase = new Date(
        Math.max(registrationDate.getTime(), Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      );

      customerData.push({
        customerId: `CUST-${1000 + i}`,
        country: countries[Math.floor(Math.random() * countries.length)],
        segment: segments[Math.floor(Math.random() * segments.length)],
        registrationDate: registrationDate,
        lastPurchaseDate: lastPurchase,
        totalPurchases: Math.floor(Math.random() * 50),
        totalSpent: Math.floor(Math.random() * 10000),
        averageOrderValue: 0,
        preferredChannel: channels[Math.floor(Math.random() * channels.length)],
        satisfaction: 1 + Math.floor(Math.random() * 5),
        churnRisk: Math.random(),
        lifetime: Math.floor((Date.now() - registrationDate.getTime()) / (24 * 60 * 60 * 1000)),
      });
    }

    // Calculate average order value
    customerData.forEach((customer) => {
      customer.averageOrderValue =
        customer.totalPurchases > 0 ? customer.totalSpent / customer.totalPurchases : 0;
    });

    await customers.insertMany(customerData);

    // Funnel Chart Data
    console.log("Funnel Chart - Customer Journey:");
    const funnel = [
      { stage: "Website Visits", count: 10000 },
      { stage: "Sign-ups", count: 2500 },
      { stage: "First Purchase", count: 1200 },
      { stage: "Repeat Purchase", count: 600 },
      { stage: "Loyal Customer", count: 200 },
    ];

    funnel.forEach((stage) => {
      const percentage = ((stage.count / funnel[0].count) * 100).toFixed(1);
      console.log(`  ${stage.stage}: ${stage.count} (${percentage}%)`);
    });

    // Scatter Plot Data (Spending vs Purchases)
    console.log("\nScatter Plot - Customer Behavior:");
    const scatterData = await customers
      .aggregate([
        {
          $project: {
            totalPurchases: 1,
            totalSpent: 1,
            segment: 1,
          },
        },
        { $limit: 100 },
      ])
      .toArray();

    console.log(`  ${scatterData.length} points for scatter plot`);
    console.log("  Axes: X = Total Purchases, Y = Total Spent, Color = Segment");

    // Geo Chart Data
    console.log("\nGeo Chart - Customers by Country:");
    const geoData = await customers
      .aggregate([
        {
          $group: {
            _id: "$country",
            customers: { $sum: 1 },
            totalRevenue: { $sum: "$totalSpent" },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ])
      .toArray();

    geoData.forEach((country) => {
      console.log(
        `  ${country._id}: ${country.customers} customers, $${country.totalRevenue.toFixed(0)} revenue`
      );
    });
  }

  /**
   * Exercise 4: Financial Data Visualization
   */
  async prepareFinancialData() {
    console.log("\n=== Preparing Financial Data ===\n");

    const financial = this.db.collection("financial_data");
    await financial.drop().catch(() => {});

    // Generate stock/financial data
    const stockData = [];
    const symbols = ["TECH", "RETAIL", "ENERGY", "HEALTH", "FINANCE"];
    const startDate = new Date(2024, 0, 1);

    for (let day = 0; day < 365; day++) {
      const date = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);

      symbols.forEach((symbol) => {
        const basePrice = symbol === "TECH" ? 150 : symbol === "RETAIL" ? 80 : 100;
        const volatility = basePrice * 0.02;

        const open = basePrice + (Math.random() - 0.5) * volatility;
        const close = open + (Math.random() - 0.5) * volatility;
        const high = Math.max(open, close) + (Math.random() * volatility) / 2;
        const low = Math.min(open, close) - (Math.random() * volatility) / 2;

        stockData.push({
          date: date,
          symbol: symbol,
          open: open,
          high: high,
          low: low,
          close: close,
          volume: Math.floor(1000000 + Math.random() * 500000),
          change: close - open,
          changePercent: ((close - open) / open) * 100,
        });
      });
    }

    await financial.insertMany(stockData);

    // Candlestick Chart Data
    console.log("Candlestick Chart Data:");
    const candlestick = await financial
      .aggregate([
        { $match: { symbol: "TECH" } },
        { $sort: { date: -1 } },
        { $limit: 30 },
        {
          $project: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            open: { $round: ["$open", 2] },
            high: { $round: ["$high", 2] },
            low: { $round: ["$low", 2] },
            close: { $round: ["$close", 2] },
            volume: 1,
          },
        },
      ])
      .toArray();

    console.log(`  ${candlestick.length} days of OHLC data`);
    console.log(
      `  Latest: ${candlestick[0].date} - O:${candlestick[0].open} H:${candlestick[0].high} L:${candlestick[0].low} C:${candlestick[0].close}`
    );

    // Waterfall Chart Data (Profit & Loss)
    console.log("\nWaterfall Chart - Monthly P&L:");
    const waterfallData = [
      { category: "Starting Balance", value: 100000 },
      { category: "Sales Revenue", value: 50000 },
      { category: "Service Revenue", value: 20000 },
      { category: "Operating Costs", value: -30000 },
      { category: "Marketing", value: -10000 },
      { category: "R&D", value: -15000 },
      { category: "Tax", value: -8000 },
      { category: "Net Profit", value: 107000 },
    ];

    let running = 100000;
    waterfallData.forEach((item) => {
      if (item.category !== "Starting Balance" && item.category !== "Net Profit") {
        running += item.value;
      }
      console.log(`  ${item.category}: ${item.value > 0 ? "+" : ""}${item.value.toLocaleString()}`);
    });
    console.log(`  Running total after adjustments: ${running.toLocaleString()}`);
  }

  /**
   * Exercise 5: IoT Sensor Dashboard Data
   */
  async prepareIoTData() {
    console.log("\n=== Preparing IoT Dashboard Data ===\n");

    const iot = this.db.collection("iot_sensors");
    await iot.drop().catch(() => {});

    // Generate IoT sensor data
    const sensorTypes = ["temperature", "humidity", "pressure", "air_quality", "motion"];
    const locations = ["Building A", "Building B", "Building C"];
    const iotData = [];

    const now = new Date();
    for (let hours = 0; hours < 24; hours++) {
      const timestamp = new Date(now.getTime() - hours * 3600000);

      locations.forEach((location) => {
        sensorTypes.forEach((type) => {
          let value, unit, threshold, status;

          switch (type) {
            case "temperature":
              value = 20 + Math.random() * 10;
              unit = "°C";
              threshold = { min: 18, max: 28 };
              break;
            case "humidity":
              value = 40 + Math.random() * 30;
              unit = "%";
              threshold = { min: 30, max: 60 };
              break;
            case "pressure":
              value = 1000 + Math.random() * 50;
              unit = "hPa";
              threshold = { min: 980, max: 1030 };
              break;
            case "air_quality":
              value = Math.random() * 100;
              unit = "AQI";
              threshold = { min: 0, max: 50 };
              break;
            case "motion":
              value = Math.random() > 0.7 ? 1 : 0;
              unit = "detected";
              threshold = { min: 0, max: 0 };
              break;
          }

          status = value >= threshold.min && value <= threshold.max ? "normal" : "alert";

          iotData.push({
            timestamp: timestamp,
            location: location,
            sensorType: type,
            value: value,
            unit: unit,
            threshold: threshold,
            status: status,
          });
        });
      });
    }

    await iot.insertMany(iotData);

    // Area Chart Data (Temperature over time)
    console.log("Area Chart - Temperature Trends:");
    const tempTrends = await iot
      .aggregate([
        { $match: { sensorType: "temperature" } },
        {
          $group: {
            _id: {
              hour: { $hour: "$timestamp" },
              location: "$location",
            },
            avgTemp: { $avg: "$value" },
            maxTemp: { $max: "$value" },
            minTemp: { $min: "$value" },
          },
        },
        { $sort: { "_id.hour": 1 } },
        { $limit: 10 },
      ])
      .toArray();

    console.log(`  ${tempTrends.length} data points for area chart`);

    // Alert Summary
    console.log("\nAlert Summary:");
    const alerts = await iot
      .aggregate([
        { $match: { status: "alert" } },
        {
          $group: {
            _id: {
              location: "$location",
              sensorType: "$sensorType",
            },
            count: { $sum: 1 },
            lastAlert: { $max: "$timestamp" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ])
      .toArray();

    alerts.forEach((alert) => {
      console.log(`  ${alert._id.location} - ${alert._id.sensorType}: ${alert.count} alerts`);
    });
  }

  /**
   * Exercise 6: Charts Configuration Guide
   */
  async chartsConfigurationGuide() {
    console.log("\n=== MongoDB Charts Configuration Guide ===\n");

    console.log("Chart Type Recommendations:\n");

    const chartGuide = [
      {
        chartType: "Line Chart",
        bestFor: "Time-series trends",
        example: "Daily revenue, CPU usage over time",
        configuration: {
          xAxis: "Date field",
          yAxis: "Metric field",
          series: "Category field (optional)",
        },
      },
      {
        chartType: "Bar Chart",
        bestFor: "Comparing categories",
        example: "Sales by product, Revenue by region",
        configuration: {
          xAxis: "Category field",
          yAxis: "Metric field",
          color: "Sub-category (optional)",
        },
      },
      {
        chartType: "Pie/Donut Chart",
        bestFor: "Part-to-whole relationships",
        example: "Market share, Budget allocation",
        configuration: {
          label: "Category field",
          value: "Metric field",
        },
      },
      {
        chartType: "Scatter Plot",
        bestFor: "Correlation analysis",
        example: "Price vs Quantity, Age vs Income",
        configuration: {
          xAxis: "Numeric field 1",
          yAxis: "Numeric field 2",
          size: "Third metric (optional)",
          color: "Category (optional)",
        },
      },
      {
        chartType: "Heatmap",
        bestFor: "Density visualization",
        example: "Sales by day/hour, Error rates by server/time",
        configuration: {
          xAxis: "Category 1",
          yAxis: "Category 2",
          value: "Metric field",
        },
      },
      {
        chartType: "Gauge",
        bestFor: "Single metric status",
        example: "CPU usage, Completion rate",
        configuration: {
          value: "Current metric",
          min: "Minimum value",
          max: "Maximum value",
          thresholds: "Color bands",
        },
      },
    ];

    chartGuide.forEach((chart) => {
      console.log(`${chart.chartType}:`);
      console.log(`  Best for: ${chart.bestFor}`);
      console.log(`  Example: ${chart.example}`);
      console.log(`  Configuration:`, chart.configuration);
      console.log("");
    });

    // Dashboard Best Practices
    console.log("Dashboard Best Practices:\n");
    console.log("1. Layout:");
    console.log("   - Place key metrics at the top");
    console.log("   - Group related charts together");
    console.log("   - Use consistent color schemes");
    console.log("");
    console.log("2. Performance:");
    console.log("   - Use aggregation pipelines for data reduction");
    console.log("   - Enable auto-refresh for real-time data");
    console.log("   - Set appropriate refresh intervals");
    console.log("");
    console.log("3. Interactivity:");
    console.log("   - Add filters for time ranges");
    console.log("   - Enable drill-down capabilities");
    console.log("   - Use chart linking for related data");
    console.log("");
    console.log("4. Accessibility:");
    console.log("   - Include chart titles and descriptions");
    console.log("   - Use color-blind friendly palettes");
    console.log("   - Provide data tables as alternatives");
  }

  async cleanup() {
    // Clean up collections
    const collections = [
      "sales_data",
      "server_metrics_charts",
      "customer_analytics",
      "financial_data",
      "iot_sensors",
    ];

    for (const coll of collections) {
      await this.db
        .collection(coll)
        .drop()
        .catch(() => {});
    }

    await this.client.close();
    console.log("\nCleanup completed");
  }
}

// Main execution
async function main() {
  const exercises = new MongoDBChartsExercises();

  try {
    await exercises.connect();

    console.log("=== MongoDB Charts Visualization Exercises ===\n");
    console.log("Note: These exercises prepare data for MongoDB Charts.");
    console.log("To visualize, connect MongoDB Charts to your database.\n");

    await exercises.prepareSalesData();
    await exercises.prepareMetricsData();
    await exercises.prepareCustomerData();
    await exercises.prepareFinancialData();
    await exercises.prepareIoTData();
    await exercises.chartsConfigurationGuide();

    console.log("\n=== Next Steps ===\n");
    console.log("1. Go to MongoDB Atlas Charts (charts.mongodb.com)");
    console.log("2. Connect to your database");
    console.log("3. Create dashboards using the prepared collections:");
    console.log("   - sales_data: E-commerce dashboard");
    console.log("   - server_metrics_charts: Real-time monitoring");
    console.log("   - customer_analytics: Customer insights");
    console.log("   - financial_data: Financial dashboard");
    console.log("   - iot_sensors: IoT monitoring");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await exercises.cleanup();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = MongoDBChartsExercises;
