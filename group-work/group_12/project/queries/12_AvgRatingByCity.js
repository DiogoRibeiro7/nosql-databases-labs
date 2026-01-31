// Query to calculate the average rating of restaurants by city

db.restaurants.aggregate([
    { $group: { 
        _id: "$address.city", 
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 }
    }},
    { $sort: { avgRating: -1 } }
]);