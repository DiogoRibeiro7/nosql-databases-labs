/**
 * Exercise 02: Time-Series Collections
 *
 * MongoDB Time-Series Collections are optimized for storing time-series data,
 * such as IoT sensor readings, stock prices, server metrics, etc.
 * They provide improved query performance and reduced storage costs.
 */

const { MongoClient } = require('mongodb');

class TimeSeriesExercises {
  constructor(connectionUrl) {
    this.connectionUrl = connectionUrl || 'mongodb://localhost:27017';
    this.client = null;
    this.db = null;
  }

  async connect() {
    this.client = new MongoClient(this.connectionUrl);
    await this.client.connect();
    this.db = this.client.db('modern_features_lab');
    console.log('Connected to MongoDB');
  }

  /**
   * Exercise 1: Create a Time-Series Collection
   * Set up a collection for IoT sensor data
   */
  async createTimeSeriesCollection() {
    console.log('Creating time-series collection for IoT sensors...');

    // Drop if exists
    await this.db.collection('sensor_readings').drop().catch(() => {});

    // Create time-series collection
    await this.db.createCollection('sensor_readings', {
      timeseries: {
        timeField: 'timestamp',
        metaField: 'metadata',
        granularity: 'seconds'
      },
      expireAfterSeconds: 86400 * 30 // 30 days TTL
    });

    console.log('Time-series collection created with:');
    console.log('  - Time field: timestamp');
    console.log('  - Meta field: metadata');
    console.log('  - Granularity: seconds');
    console.log('  - TTL: 30 days');

    // Get collection info
    const collections = await this.db.listCollections({ name: 'sensor_readings' }).toArray();
    console.log('\nCollection details:', JSON.stringify(collections[0].options, null, 2));
  }

  /**
   * Exercise 2: Insert Time-Series Data
   * Insert IoT sensor readings
   */
  async insertTimeSeriesData() {
    const collection = this.db.collection('sensor_readings');

    // Generate sample sensor data
    const sensorData = [];
    const sensors = ['sensor-001', 'sensor-002', 'sensor-003'];
    const locations = ['warehouse-A', 'warehouse-B', 'warehouse-C'];

    const now = new Date();
    for (let i = 0; i < 100; i++) {
      for (let j = 0; j < sensors.length; j++) {
        sensorData.push({
          timestamp: new Date(now.getTime() - i * 60000), // Every minute
          metadata: {
            sensorId: sensors[j],
            location: locations[j],
            type: 'temperature',
            unit: 'celsius'
          },
          temperature: 20 + Math.random() * 10, // 20-30°C
          humidity: 40 + Math.random() * 20,    // 40-60%
          pressure: 1000 + Math.random() * 50   // 1000-1050 hPa
        });
      }
    }

    console.log(`Inserting ${sensorData.length} sensor readings...`);
    const result = await collection.insertMany(sensorData);
    console.log(`Inserted ${result.insertedCount} documents`);

    // Show storage statistics
    const stats = await collection.aggregate([
      { $collStats: { storageStats: {} } }
    ]).toArray();

    if (stats[0]) {
      console.log('\nStorage Statistics:');
      console.log(`  Total size: ${(stats[0].storageStats.size / 1024).toFixed(2)} KB`);
      console.log(`  Average document size: ${stats[0].storageStats.avgObjSize} bytes`);
    }
  }

  /**
   * Exercise 3: Query Time-Series Data
   * Perform various time-based queries
   */
  async queryTimeSeriesData() {
    const collection = this.db.collection('sensor_readings');

    // 1. Query last hour of data for a specific sensor
    console.log('\n1. Last hour data for sensor-001:');
    const lastHour = new Date(Date.now() - 3600000);
    const recentData = await collection.find({
      'metadata.sensorId': 'sensor-001',
      timestamp: { $gte: lastHour }
    }).limit(5).toArray();
    console.log(`Found ${recentData.length} readings`);

    // 2. Aggregate average temperature by location
    console.log('\n2. Average temperature by location (last 24 hours):');
    const yesterday = new Date(Date.now() - 86400000);
    const avgByLocation = await collection.aggregate([
      {
        $match: {
          timestamp: { $gte: yesterday }
        }
      },
      {
        $group: {
          _id: '$metadata.location',
          avgTemp: { $avg: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    avgByLocation.forEach(loc => {
      console.log(`  ${loc._id}: ${loc.avgTemp.toFixed(2)}°C (${loc.count} readings)`);
    });

    // 3. Find temperature anomalies
    console.log('\n3. Temperature anomalies (>28°C):');
    const anomalies = await collection.find({
      temperature: { $gt: 28 }
    }).limit(5).toArray();

    anomalies.forEach(reading => {
      console.log(`  ${reading.metadata.sensorId} at ${reading.timestamp}: ${reading.temperature.toFixed(2)}°C`);
    });
  }

  /**
   * Exercise 4: Window Functions
   * Use window functions for moving averages
   */
  async windowFunctions() {
    const collection = this.db.collection('sensor_readings');

    console.log('\nCalculating moving averages with window functions...');

    const movingAvg = await collection.aggregate([
      {
        $match: {
          'metadata.sensorId': 'sensor-001'
        }
      },
      { $sort: { timestamp: 1 } },
      {
        $setWindowFields: {
          partitionBy: '$metadata.sensorId',
          sortBy: { timestamp: 1 },
          output: {
            movingAvgTemp: {
              $avg: '$temperature',
              window: {
                range: [-5, 5],
                unit: 'row'
              }
            },
            minTemp: {
              $min: '$temperature',
              window: {
                range: [-10, 0],
                unit: 'row'
              }
            },
            maxTemp: {
              $max: '$temperature',
              window: {
                range: [-10, 0],
                unit: 'row'
              }
            }
          }
        }
      },
      { $limit: 10 }
    ]).toArray();

    console.log('Moving average results:');
    movingAvg.forEach(reading => {
      console.log(`  Time: ${reading.timestamp.toISOString().slice(11, 19)}`);
      console.log(`    Current: ${reading.temperature.toFixed(2)}°C`);
      console.log(`    Moving Avg: ${reading.movingAvgTemp?.toFixed(2)}°C`);
      console.log(`    10-period Min/Max: ${reading.minTemp?.toFixed(2)}°C / ${reading.maxTemp?.toFixed(2)}°C`);
    });
  }

  /**
   * Exercise 5: Stock Price Time-Series
   * Financial data with time-series
   */
  async stockPriceTimeSeries() {
    console.log('\nCreating stock price time-series collection...');

    // Drop and recreate
    await this.db.collection('stock_prices').drop().catch(() => {});

    await this.db.createCollection('stock_prices', {
      timeseries: {
        timeField: 'timestamp',
        metaField: 'stock',
        granularity: 'minutes'
      }
    });

    const collection = this.db.collection('stock_prices');

    // Generate sample stock data
    const stocks = ['AAPL', 'GOOGL', 'MSFT'];
    const stockData = [];
    const now = new Date();

    for (let i = 0; i < 60; i++) { // 60 minutes of data
      for (const symbol of stocks) {
        const basePrice = symbol === 'AAPL' ? 150 : symbol === 'GOOGL' ? 2800 : 400;
        const volatility = basePrice * 0.002; // 0.2% volatility

        stockData.push({
          timestamp: new Date(now.getTime() - i * 60000),
          stock: {
            symbol: symbol,
            exchange: 'NASDAQ'
          },
          price: basePrice + (Math.random() - 0.5) * volatility,
          volume: Math.floor(1000000 + Math.random() * 500000)
        });
      }
    }

    await collection.insertMany(stockData);

    // Calculate OHLC (Open, High, Low, Close) for 15-minute candles
    console.log('\n15-minute OHLC candles:');
    const ohlc = await collection.aggregate([
      {
        $match: {
          'stock.symbol': 'AAPL'
        }
      },
      {
        $group: {
          _id: {
            interval: {
              $dateTrunc: {
                date: '$timestamp',
                unit: 'minute',
                binSize: 15
              }
            }
          },
          open: { $first: '$price' },
          high: { $max: '$price' },
          low: { $min: '$price' },
          close: { $last: '$price' },
          volume: { $sum: '$volume' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.interval': -1 } },
      { $limit: 4 }
    ]).toArray();

    ohlc.forEach(candle => {
      console.log(`  ${candle._id.interval.toISOString().slice(11, 16)}:`);
      console.log(`    OHLC: ${candle.open.toFixed(2)} / ${candle.high.toFixed(2)} / ${candle.low.toFixed(2)} / ${candle.close.toFixed(2)}`);
      console.log(`    Volume: ${candle.volume.toLocaleString()}`);
    });
  }

  /**
   * Exercise 6: Server Metrics Time-Series
   * Monitor server performance metrics
   */
  async serverMetricsTimeSeries() {
    console.log('\nCreating server metrics collection...');

    await this.db.collection('server_metrics').drop().catch(() => {});

    await this.db.createCollection('server_metrics', {
      timeseries: {
        timeField: 'timestamp',
        metaField: 'server',
        granularity: 'seconds'
      }
    });

    const collection = this.db.collection('server_metrics');

    // Generate server metrics
    const servers = ['web-01', 'web-02', 'app-01', 'db-01'];
    const metrics = [];
    const now = new Date();

    for (let i = 0; i < 120; i++) { // 2 minutes of data, every second
      for (const serverId of servers) {
        const isDatabase = serverId.startsWith('db');
        const baseLoad = isDatabase ? 60 : 40;

        metrics.push({
          timestamp: new Date(now.getTime() - i * 1000),
          server: {
            id: serverId,
            type: isDatabase ? 'database' : serverId.startsWith('web') ? 'web' : 'application',
            datacenter: 'us-east-1'
          },
          cpu: baseLoad + Math.random() * 30,
          memory: 50 + Math.random() * 30,
          disk_io: Math.floor(Math.random() * 100),
          network_in: Math.floor(Math.random() * 1000),
          network_out: Math.floor(Math.random() * 1000)
        });
      }
    }

    await collection.insertMany(metrics);

    // Detect servers with high CPU usage
    console.log('\nHigh CPU usage alerts (>70%):');
    const highCpu = await collection.aggregate([
      {
        $match: {
          cpu: { $gt: 70 },
          timestamp: { $gte: new Date(now.getTime() - 60000) } // Last minute
        }
      },
      {
        $group: {
          _id: '$server.id',
          avgCpu: { $avg: '$cpu' },
          maxCpu: { $max: '$cpu' },
          incidents: { $sum: 1 }
        }
      },
      {
        $match: {
          incidents: { $gte: 5 } // At least 5 high CPU readings
        }
      }
    ]).toArray();

    highCpu.forEach(alert => {
      console.log(`  Server ${alert._id}: Avg CPU ${alert.avgCpu.toFixed(1)}%, Max ${alert.maxCpu.toFixed(1)}% (${alert.incidents} incidents)`);
    });

    // Calculate percentiles
    console.log('\nCPU usage percentiles (all servers, last minute):');
    const percentiles = await collection.aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(now.getTime() - 60000) }
        }
      },
      {
        $group: {
          _id: null,
          cpuValues: { $push: '$cpu' }
        }
      },
      {
        $project: {
          p50: { $percentile: { input: '$cpuValues', p: [0.5], method: 'approximate' } },
          p75: { $percentile: { input: '$cpuValues', p: [0.75], method: 'approximate' } },
          p95: { $percentile: { input: '$cpuValues', p: [0.95], method: 'approximate' } },
          p99: { $percentile: { input: '$cpuValues', p: [0.99], method: 'approximate' } }
        }
      }
    ]).toArray();

    if (percentiles[0]) {
      const p = percentiles[0];
      console.log(`  P50: ${p.p50[0]?.toFixed(1)}%`);
      console.log(`  P75: ${p.p75[0]?.toFixed(1)}%`);
      console.log(`  P95: ${p.p95[0]?.toFixed(1)}%`);
      console.log(`  P99: ${p.p99[0]?.toFixed(1)}%`);
    }
  }

  /**
   * Exercise 7: Weather Station Data
   * Complex time-series with multiple measurements
   */
  async weatherStationData() {
    console.log('\nCreating weather station collection...');

    await this.db.collection('weather_data').drop().catch(() => {});

    await this.db.createCollection('weather_data', {
      timeseries: {
        timeField: 'timestamp',
        metaField: 'station',
        granularity: 'hours'
      }
    });

    const collection = this.db.collection('weather_data');

    // Generate weather data for multiple stations
    const stations = [
      { id: 'NYC-001', city: 'New York', lat: 40.7128, lon: -74.0060 },
      { id: 'LA-001', city: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
      { id: 'CHI-001', city: 'Chicago', lat: 41.8781, lon: -87.6298 }
    ];

    const weatherData = [];
    const now = new Date();

    for (let hours = 0; hours < 24; hours++) {
      for (const station of stations) {
        // Simulate different weather patterns per city
        const baseTemp = station.city === 'Los Angeles' ? 22 :
                        station.city === 'Chicago' ? 10 : 15;

        weatherData.push({
          timestamp: new Date(now.getTime() - hours * 3600000),
          station: station,
          measurements: {
            temperature: baseTemp + Math.sin(hours / 24 * Math.PI * 2) * 5 + Math.random() * 2,
            humidity: 60 + Math.random() * 30,
            pressure: 1013 + Math.random() * 20 - 10,
            windSpeed: Math.random() * 30,
            windDirection: Math.floor(Math.random() * 360),
            precipitation: Math.random() > 0.7 ? Math.random() * 5 : 0,
            visibility: 10 - Math.random() * 5
          },
          conditions: {
            sky: ['clear', 'partly cloudy', 'cloudy', 'overcast'][Math.floor(Math.random() * 4)],
            phenomena: Math.random() > 0.8 ? ['rain', 'snow', 'fog'][Math.floor(Math.random() * 3)] : null
          }
        });
      }
    }

    await collection.insertMany(weatherData);

    // Daily summaries per station
    console.log('\nDaily weather summaries:');
    const dailySummary = await collection.aggregate([
      {
        $group: {
          _id: {
            station: '$station.city',
            day: { $dateTrunc: { date: '$timestamp', unit: 'day' } }
          },
          avgTemp: { $avg: '$measurements.temperature' },
          maxTemp: { $max: '$measurements.temperature' },
          minTemp: { $min: '$measurements.temperature' },
          totalPrecip: { $sum: '$measurements.precipitation' },
          avgWindSpeed: { $avg: '$measurements.windSpeed' }
        }
      },
      { $sort: { '_id.station': 1, '_id.day': -1 } }
    ]).toArray();

    dailySummary.forEach(summary => {
      console.log(`  ${summary._id.station}:`);
      console.log(`    Temp: ${summary.minTemp.toFixed(1)}°C - ${summary.maxTemp.toFixed(1)}°C (avg: ${summary.avgTemp.toFixed(1)}°C)`);
      console.log(`    Precipitation: ${summary.totalPrecip.toFixed(1)}mm`);
      console.log(`    Wind: ${summary.avgWindSpeed.toFixed(1)} km/h`);
    });
  }

  async cleanup() {
    // Clean up collections
    const collections = [
      'sensor_readings', 'stock_prices',
      'server_metrics', 'weather_data'
    ];

    for (const coll of collections) {
      await this.db.collection(coll).drop().catch(() => {});
    }

    await this.client.close();
    console.log('\nCleanup completed');
  }
}

// Main execution
async function main() {
  const exercises = new TimeSeriesExercises();

  try {
    await exercises.connect();

    console.log('=== Exercise 1: Create Time-Series Collection ===\n');
    await exercises.createTimeSeriesCollection();

    console.log('\n=== Exercise 2: Insert Time-Series Data ===\n');
    await exercises.insertTimeSeriesData();

    console.log('\n=== Exercise 3: Query Time-Series Data ===');
    await exercises.queryTimeSeriesData();

    console.log('\n=== Exercise 4: Window Functions ===');
    await exercises.windowFunctions();

    console.log('\n=== Exercise 5: Stock Price Time-Series ===');
    await exercises.stockPriceTimeSeries();

    console.log('\n=== Exercise 6: Server Metrics Time-Series ===');
    await exercises.serverMetricsTimeSeries();

    console.log('\n=== Exercise 7: Weather Station Data ===');
    await exercises.weatherStationData();

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await exercises.cleanup();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = TimeSeriesExercises;