// Switch to the airbnb database
db = db.getSiblingDB("airbnb");
print(`Using database: ${db.getName()}`);

/**
 * USE CASE: "Host Portfolio & Geographic Spread"
 * * User Story:
 * "As a market analyst, I want to analyze the portfolio of a specific property
 * management brand in Lisbon. I need to know exactly
 * which neighbourhoods they are active in and the total number of properties
 * they manage."
 * * * Technical Goal:
 * Filter documents using a Regex pattern, then perform a global grouping
 * (_id: null) to consolidate data into a single summary document containing
 * a distinct array of values ($addToSet) and a total document count.
 */
const neighbourhoodListings = db.airbnb_data.aggregate([
  // For efficiency clean all non Lisbon Properties
  { $match: { host_name: /^Lisbon/ } },
  {
    $group: {
      _id: null,
      unique_neighbourhoods: { $addToSet: "$neighbourhood" },
      total_listings: { $count: {} },
    },
  },
  { $project: { _id: 0, unique_neighbourhoods: 1, total_listings: 1 } },
]);

print("Unique neighbourhoods for hosts named 'Lisbon...': ", neighbourhoodListings);
