// queries/restaurant-queries.js


// Q1 – All open restaurants in a given city

async function getOpenRestaurantsByCity(db, city) {
  return db.collection('restaurants').find(
    { 'address.city': city, open: true },
    {
      projection: {
        name: 1,
        type: 1,
        rating: 1,
        address: 1,
        open: 1,
      },
    }
  ).toArray();
}


// Q2 – Restaurants by cuisine type, sorted by rating (desc)

async function getRestaurantsByCuisineSorted(db, cuisineType) {
  return db.collection('restaurants').find(
    { type: cuisineType },
    {
      projection: {
        name: 1,
        type: 1,
        rating: 1,
        'address.city': 1,
      },
    }
  ).sort({ rating: -1 }).toArray();
}

// Q3 – Top N restaurants by rating overall
async function getTopRestaurantsByRating(db, limit = 10) {
  return db.collection('restaurants').find(
    {},
    {
      projection: {
        name: 1,
        rating: 1,
        type: 1,
        'address.city': 1,
      },
    }
  ).sort({ rating: -1 }).limit(limit).toArray();
}


// Q4 – Menu items by category for a given restaurant

async function getMenuItemsByCategory(db, restaurantId, category) {
  const restaurant = await db.collection('restaurants').findOne(
    { _id: restaurantId },
    { projection: { menu: 1 } }
  );

  if (!restaurant || !Array.isArray(restaurant.menu)) {
    return [];
  }

  // Return as an array of items already; no extra toArray needed here.
  return restaurant.menu.filter(item => item.category === category);
}

// Q5 – Average price per category (global, across all restaurants)
async function getAveragePricePerCategory(db) {
  const pipeline = [
    { $unwind: '$menu' },
    {
      $group: {
        _id: '$menu.category',
        avgPrice: { $avg: '$menu.price' },
        itemCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        avgPrice: 1,
        itemCount: 1,
      },
    },
  ];

  return db.collection('restaurants').aggregate(pipeline).toArray();
}

// Q6 – Restaurants ordered from cheapest to most expensive
// Uses average menu item price per restaurant.
async function getRestaurantsByAverageMenuPrice(db) {
  const pipeline = [
    { $unwind: '$menu' },
    {
      $group: {
        _id: '$_id',
        name: { $first: '$name' },
        type: { $first: '$type' },
        city: { $first: '$address.city' },
        avgMenuPrice: { $avg: '$menu.price' },
      },
    },
    { $sort: { avgMenuPrice: 1 } },
  ];

  return db.collection('restaurants').aggregate(pipeline).toArray();
}

// Q7 – Most popular cuisine in each city
// Based on delivered orders joined to restaurants.
async function getMostPopularCuisinePerCity(db) {
  const pipeline = [
    // Only delivered orders
    { $match: { status: 'delivered' } },
    // Group orders by restaurant to count how many orders per restaurant
    {
      $group: {
        _id: '$restaurantId',
        ordersCount: { $sum: 1 },
      },
    },
    // Join restaurant data
    {
      $lookup: {
        from: 'restaurants',
        localField: '_id',
        foreignField: '_id',
        as: 'restaurant',
      },
    },
    { $unwind: '$restaurant' },
    // Group by city + cuisine type
    {
      $group: {
        _id: {
          city: '$restaurant.address.city',
          type: '$restaurant.type',
        },
        totalOrders: { $sum: '$ordersCount' },
      },
    },
    // Sort so we can pick top per city
    {
      $sort: {
        '_id.city': 1,
        totalOrders: -1,
      },
    },
    // Group again by city, keeping only the top cuisine
    {
      $group: {
        _id: '$_id.city',
        topCuisine: { $first: '$_id.type' },
        totalOrders: { $first: '$totalOrders' },
      },
    },
    {
      $project: {
        _id: 0,
        city: '$_id',
        topCuisine: 1,
        totalOrders: 1,
      },
    },
  ];

  return db.collection('orders').aggregate(pipeline).toArray();
}



module.exports = {
  getOpenRestaurantsByCity,           // Q1
  getRestaurantsByCuisineSorted,      // Q2
  getTopRestaurantsByRating,          // Q3
  getMenuItemsByCategory,             // Q4
  getAveragePricePerCategory,         // Q5
  getRestaurantsByAverageMenuPrice,   // Q6
  getMostPopularCuisinePerCity,       // Q7
};
