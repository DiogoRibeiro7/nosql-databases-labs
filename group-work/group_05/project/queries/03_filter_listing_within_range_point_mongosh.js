// Switch to the airbnb database
db = db.getSiblingDB("airbnb");

/**
 * USE CASE: "Top Reviews per Listing"
 * * User Story:
 * "As a potential guest, I want to see the 'Highlights' for every apartment.
 * Specifically, I want to see the 5 highest-rated reviews for each property
 * so I can quickly read the best experiences others have had."
 * * * Technical Goal:
 * Perform a "One-to-Many" join using a $lookup pipeline.
 * Inside the lookup, we Match -> Sort (Desc) -> Limit (5) to efficiently 
 * retrieve only the subset of relevant sub-documents.
 */

const topReviewsPerListing = db.listings.aggregate([
  {
    // 1. JOIN with Pipeline: Efficiently fetch only the needed reviews
    $lookup: {
      from: "reviews",
      let: { local_id: "$id" }, // Pass the Listing ID to the pipeline
      pipeline: [
        { 
          // Match reviews belonging to this listing
          $match: { 
            $expr: { $eq: ["$listing_id", "$$local_id"] } 
          } 
        },
        { 
          // Sort by Rating (Highest first), then Date (Newest first)
          $sort: { rating: -1, date: -1 } 
        },
        { 
          // Only keep the top 5
          $limit: 5 
        },
        {
          // Clean up the review object for display
          $project: { 
            _id: 0, 
            reviewer_name: 1, 
            rating: 1, 
            date: 1,
            comments: 1 
          }
        }
      ],
      as: "reviews" // The output array name
    }
  },
  {
    // Format the final listing document
    $project: {
      _id: 0,
      listing_name: "$name",
      neighbourhood: "$neighbourhood",
      reviews: 1
    }
  },
  {
    // Optional: Just limiting the result to 3 listings so we don't flood the console
    $limit: 3
  }
]).toArray();

printjson(topReviewsPerListing);