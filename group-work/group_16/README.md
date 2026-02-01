# Food Express – NoSQL Final Project (MongoDB) group 16

This project demonstrates the implementation of a database management system for a food delivery platform (Food Express). The focus is on analyzing restaurant performance, managing orders, and optimizing queries through indexes and complex aggregations.

## Deliverables in This Folder

| Path | Purpose |
| ---- | ------- |
| `architecture.md` | Written rationale for the collections (`restaurants` and `orders`) and the linking strategy. |
| `data/` | JSON copies of the original datasets (`foodexpress_db.orders.json` and `foodexpress_db.restaurants.json`). |
| `queries/` | Twelve `.mongodb.js` scripts featuring CRUD examples and rich aggregation pipelines. |


### Teamwork Experience
Working as a group was fundamental to understanding the collaborative nature of database development. We learned to divide responsibilities between data modeling, query optimization, and documentation, ensuring that each part of the project was synchronized. This experience improved our communication skills and taught us how to perform peer reviews on our aggregation pipelines to reach the most efficient technical solutions.

## NOSQL in the future 

Learning NoSQL with MongoDB is essential because it reflects how modern, data-driven companies actually operate. Unlike traditional databases, NoSQL offers the flexibility to handle massive amounts of unstructured data and the scalability to grow alongside an application without rigid constraints. Mastering these tools—especially complex aggregations and performance optimization—equips us with the high-demand technical skills needed to build fast, real-time analytics.


## How to Run Everything (Local MongoDB)

### 1. Seed the Database
Ensure your MongoDB server is running and use the following commands from your terminal:

```bash
# Import Restaurants
mongoimport --db food_express --collection restaurants --file "data/foodexpress_db.restaurants.json" --jsonArray

# Import Orders
mongoimport --db food_express --collection orders --file "data/foodexpress_db.orders.json" --jsonArray

