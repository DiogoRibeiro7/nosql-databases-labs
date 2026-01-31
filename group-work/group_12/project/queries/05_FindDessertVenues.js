// Query to find all venues that offer dessert items in their menu

db.restaurants.find({ "menu.category": "dessert" });