// Switch to the airbnb database
db = db.getSiblingDB("airbnb");

/**
 * USE CASE: "Host Portfolio & Geographic Spread"
 * * * User Story:
 * "As a market analyst, I want to analyze the portfolio of the 'Lisbon' property 
 * management brand. I need to see their full geographic footprint (unique neighbourhoods)
 * and the total volume of their managed inventory to assess their market dominance."
 * * * Technical Goal:
 * Perform a "Filter by Parent" operation. We join the 'listings' with 'hosts', 
 * apply a Regex filter on the joined host name, and then perform a global grouping 
 * ($group: _id: null) to calculate distinct sets and total counts.
 */

const portfolioAnalysis = db.listings.aggregate([
  {
    // Bring in Host data to check the name
    $lookup: {
      from: "hosts",
      localField: "host_id",
      foreignField: "id",
      as: "host_info"
    }
  },
  {
    // Flatten the array to access fields directly
    $unwind: "$host_info"
  },
  {
    // Match only hosts belonging to the "Lisbon" brand
    // (Simulating a brand search using Regex)
    $match: {
      "host_info.name": /^Lisbon/ 
    }
  },
  {
    // Consolidate all matching documents into one summary
    $group: {
      _id: null, // null = Group everything into one bucket
      unique_neighbourhoods: { $addToSet: "$neighbourhood" }, // distinct values
      total_listings: { $sum: 1 } // count the docs
    }
  },
  {
    // Format the output
    $project: {
      _id: 0,
      brand_filter: "Lisbon*",
      total_listings: 1,
      unique_neighbourhoods: 1
    }
  }
])

// Execute and Print
if (portfolioAnalysis.length > 0) {
    printjson(portfolioAnalysis[0]);
} else {
    print("No listings found for this brand.");
}