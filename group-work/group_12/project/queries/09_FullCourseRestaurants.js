// Query to find all restaurants that have both "entrée" and "plat" categories in their menu

db.restaurants.find({ 
    "menu.category": { $all: ["entrée", "plat"] } 
});