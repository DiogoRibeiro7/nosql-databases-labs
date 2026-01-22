# Restaurant queries

Each query is a self-contained script you can run with `node` from inside this folder.

Files:

- `01-open-restaurants-by-city.js` — Q1: open restaurants in a city
  - Usage: `node 01-open-restaurants-by-city.js [city]`
- `02-restaurants-by-cuisine.js` — Q2: restaurants by cuisine
  - Usage: `node 02-restaurants-by-cuisine.js [cuisineType]`
- `03-top-restaurants-by-rating.js` — Q3: top N restaurants by rating
  - Usage: `node 03-top-restaurants-by-rating.js [limit]`
- `04-menu-items-by-category.js` — Q4: menu items by category for a given restaurant
  - Usage: `node 04-menu-items-by-category.js [restaurantId] [category]`
- `05-average-price-per-category.js` — Q5: average price per category
  - Usage: `node 05-average-price-per-category.js`
- `06-restaurants-by-average-menu-price.js` — Q6: restaurants by average menu price
  - Usage: `node 06-restaurants-by-average-menu-price.js`
- `07-most-popular-cuisine-per-city.js` — Q7: most popular cuisine per city
  - Usage: `node 07-most-popular-cuisine-per-city.js`
- `08-best-value-restaurants.js` — Q8: best value restaurants
  - Usage: `node 08-best-value-restaurants.js`

Notes:
- Each script uses the project `db` helper so it will pick up the `.env` file in the project root.
