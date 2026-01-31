// Query to find all restaurants with menu items priced below $10

db.restaurants.find({ "menu.price": { $lt: 10 } });