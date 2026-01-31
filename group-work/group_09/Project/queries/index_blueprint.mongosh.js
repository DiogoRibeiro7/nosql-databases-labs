
//speed up queries

//3
db.rental.createIndex({ customer_id: 1 });
db.inventory.createIndex({ inventory_id: 1 }, { unique: true });
db.film.createIndex({ film_id: 1 }, { unique: true });
db.staff.createIndex({ staff_id: 1 }, { unique: true });

//9
db.rental.createIndex({ inventory_id: 1 });
db.inventory.createIndex({ inventory_id: 1, film_id: 1 });
db.film_category.createIndex({ film_id: 1, category_id: 1 });
db.category.createIndex({ category_id: 1 });