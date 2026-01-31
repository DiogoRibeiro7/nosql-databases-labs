// Query to find the top 3 highest rated open venues

db.restaurants.find({ open: true })
    .sort({ rating: -1 })
    .limit(3);