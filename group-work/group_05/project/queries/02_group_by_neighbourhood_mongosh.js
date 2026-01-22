/* eslint-disable */
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

// Switch to the airbnb database
db = db.getSiblingDB("airbnb");

const optimizedPortfolio = db.hosts.aggregate([
  {
    // Since we start with 'hosts', we can use the 'name' index immediately.
    $match: {
      name: /^Lisbon/
    }
  },
  {
    // Go get the listings for these specific hosts
    $lookup: {
      from: "listings",
      localField: "id",
      foreignField: "host_id",
      as: "property_portfolio"
    }
  },
  {
    // Expand the list of properties
    $unwind: "$property_portfolio"
  },
  {
    // Calculate the stats
    // Note: We now reference fields inside the 'property_portfolio' array
    $group: {
      _id: null,
      unique_neighbourhoods: { $addToSet: "$property_portfolio.neighbourhood" },
      total_listings: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      brand_filter: "Lisbon*",
      total_listings: 1,
      unique_neighbourhoods: 1
    }
  }
]);

// Print the plan
printjson(optimizedPortfolio);