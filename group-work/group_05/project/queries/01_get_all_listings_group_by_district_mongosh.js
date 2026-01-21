db = db.getSiblingDB("airbnb");

/**
 * USE CASE: "City-by-City Apartment Catalog"
 * * User Story:
 * "As a user planning a multi-city trip, I want to view all available apartments
 * organized by district (Lisbon, Porto, etc.) so that I can easily browse
 * options for each destination in a single list."
 * * Technical Goal:
 * Transform a flat list of listings into a hierarchical structure
 * (District -> List of Apartments) to power a "Browse by City" feature.
 */
const listingsByDistrict = db.airbnb_data.aggregate([
  {
    // Extract 'district' from 'host_name'
    $addFields: {
      district: {
        $arrayElemAt: [{ $split: ["$host_name", "_"] }, 0],
      },
    },
  },
  {
    // Group by district and push listings into an array
    $group: {
      _id: "$district",
      total_listings: { $sum: 1 },
      listings: {
        $push: {
          name: "$name",
          price: "$price",
          neighbourhood: "$neighbourhood",
          room_type: "$room_type",
        },
      },
    },
  },
  {
    $project: {
      _id: 0,
      district: "$_id",
      total_listings: 1,
      listings: 1,
    },
  },
]);

print(listingsByDistrict);
