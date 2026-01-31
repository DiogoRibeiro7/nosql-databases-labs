const { ObjectId } = require("mongodb");
const { getDb } = require("./db");

// Insert one restaurant
async function createRestaurant(restaurant) {
  const db = await getDb();
  const result = await db.collection("restaurants").insertOne(restaurant);
  return result.insertedId;
}

// Find restaurants by city
async function findRestaurantsByCity(city) {
  const db = await getDb();
  return db
    .collection("restaurants") 
    .find({ "address.city": city })
    .toArray();
}

// Update (one) restaurant's rating
async function updateRestaurantRating(id, newRating) {
  const db = await getDb();
  return db.collection("restaurants").updateOne(
    { _id: new ObjectId(id) },
    { $set: { rating: newRating } }
  );
}

// Delete (many) closed restaurants in a city
async function deleteClosedRestaurantsInCity(city) {
  const db = await getDb();
  return db.collection("restaurants").deleteMany({
    "address.city": city,
    open: false,
  });
}

module.exports = {
  createRestaurant,
  findRestaurantsByCity,
  updateRestaurantRating,
  deleteClosedRestaurantsInCity,
};
