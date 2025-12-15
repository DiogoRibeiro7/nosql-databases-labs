# MongoDB Exercises Practice (Movie Booking System)

MongoDB, a leading NoSQL database, offers flexible schema design and robust querying capabilities. This document presents a set of easy, medium, and hard-level questions to improve understanding of MongoDB by focusing on data manipulation, querying, and aggregation.

---

## Collections (Schema)

### 1) Movies Collection

```json
{
  "movie_id": "UUID",
  "title": "String",
  "genre": "String",
  "release_year": "Number",
  "duration": "Number",  // in minutes
  "ratings": "Number",   // Average rating between 0 and 5
  "actors": ["Array of Actor Names"]
}
````

### 2) Theaters Collection

```json
{
  "theater_id": "UUID",
  "name": "String",
  "location": {
    "city": "String",
    "state": "String",
    "country": "String"
  },
  "seating_capacity": "Number"
}
```

### 3) Users Collection

```json
{
  "user_id": "UUID",
  "name": "String",
  "email": "String",
  "date_of_birth": "Date",
  "loyalty_points": "Number"
}
```

### 4) Bookings Collection

```json
{
  "booking_id": "UUID",
  "user_id": "UUID",              // Reference to Users collection
  "movie_id": "UUID",             // Reference to Movies collection
  "theater_id": "UUID",           // Reference to Theaters collection
  "seats_booked": "Number",       // Number of seats booked
  "total_price": "Number",        // Total price for the booking
  "booking_date": "Date"          // Date and time of the booking
}
```

---

# MongoDB Exercises Questions for Beginner (Easy)

## Q1. Insert a new movie into the Movies collection.

```js
db.movies.insertOne({
  "movie_id": "1",
  "title": "Inception",
  "genre": "Sci-Fi",
  "release_year": 2010,
  "duration": 148,
  "ratings": 4.8,
  "actors": ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"]
});
```

**Output:**

```json
{
  "acknowledged": true,
  "insertedId": "1"
}
```

**Explanation:** The movie "Inception" is inserted. The `movie_id` is manually set to `"1"`.

---

## Q2. Insert multiple users into the Users collection.

```js
db.users.insertMany([
  {
    "user_id": "1",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "date_of_birth": ISODate("1985-04-23"),
    "loyalty_points": 120
  },
  {
    "user_id": "2",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "date_of_birth": ISODate("1990-07-12"),
    "loyalty_points": 50
  }
]);
```

**Output:**

```json
{
  "acknowledged": true,
  "insertedIds": {
    "0": "1",
    "1": "2"
  }
}
```

**Explanation:** Two users are inserted with `user_id` `"1"` and `"2"`.

---

## Q3. Find all movies in the "Action" genre.

```js
db.movies.find({ "genre": "Action" });
```

**Output:**

```json
[]
```

**Explanation:** No "Action" movies exist yet.

---

## Q4. Find all theaters in the city "New York".

```js
db.theaters.find({ "location.city": "New York" });
```

**Output:**

```json
[]
```

**Explanation:** No theaters exist in "New York" yet.

---

## Q5. Update the seating capacity of a theater with ID "1".

```js
db.theaters.updateOne(
  { "theater_id": "1" },
  { $set: { "seating_capacity": 300 } }
);
```

**Output:**

```json
{
  "acknowledged": true,
  "matchedCount": 0,
  "modifiedCount": 0
}
```

**Explanation:** No theater with `theater_id: "1"` exists.

---

## Q6. Delete a movie by its title.

```js
db.movies.deleteOne({ "title": "Inception" });
```

**Output:**

```json
{
  "acknowledged": true,
  "deletedCount": 1
}
```

**Explanation:** "Inception" is deleted.

---

## Q7. Retrieve all bookings made by the user with ID "2".

```js
db.bookings.find({ "user_id": "2" });
```

**Output:**

```json
[]
```

**Explanation:** No bookings for user `"2"` yet.

---

## Q8. Find a movie by its title and display only the title and genre fields.

```js
db.movies.find(
  { "title": "Inception" },
  { "title": 1, "genre": 1, "_id": 0 }
);
```

**Output:**

```json
[]
```

**Explanation:** "Inception" was deleted in Q6.

---

## Q9. Find users who have more than 100 loyalty points.

```js
db.users.find({ "loyalty_points": { $gt: 100 } });
```

**Output:**

```js
[
  {
    "user_id": "1",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "date_of_birth": ISODate("1985-04-23"),
    "loyalty_points": 120
  }
]
```

**Explanation:** John Doe has 120 points.

---

## Q10. Insert a new booking into the Bookings collection.

```js
db.bookings.insertOne({
  "booking_id": "1",
  "user_id": "1",
  "movie_id": "1",
  "theater_id": "1",
  "seats_booked": 2,
  "total_price": 30,
  "booking_date": ISODate("2023-09-10")
});
```

**Output:**

```json
{
  "acknowledged": true,
  "insertedId": "1"
}
```

**Explanation:** A booking is inserted with `booking_id: "1"`.

---

## Q11. Find all users born after 1990.

```js
db.users.find({ "date_of_birth": { $gt: ISODate("1990-01-01") } });
```

**Output:**

```js
[
  {
    "user_id": "2",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "date_of_birth": ISODate("1990-07-12"),
    "loyalty_points": 50
  }
]
```

**Explanation:** Jane Smith was born after 1990-01-01.

---

## Q12. Update the ratings of the movie "Inception" to 4.9.

```js
db.movies.updateOne(
  { "title": "Inception" },
  { $set: { "ratings": 4.9 } }
);
```

**Output:**

```json
{
  "acknowledged": true,
  "matchedCount": 0,
  "modifiedCount": 0
}
```

**Explanation:** "Inception" was deleted in Q6.

---

## Q13. Find all movies released in or after 2015.

```js
db.movies.find({ "release_year": { $gte: 2015 } });
```

**Output:**

```json
[]
```

**Explanation:** No movies released in or after 2015 exist.

---

## Q14. Find all theaters in the state of "California".

```js
db.theaters.find({ "location.state": "California" });
```

**Output:**

```json
[]
```

**Explanation:** No theaters in California exist yet (in the beginner dataset).

---

## Q15. Delete all bookings for the movie "Inception".

```js
db.bookings.deleteMany({ "movie_id": "1" });
```

**Output:**

```json
{
  "acknowledged": true,
  "deletedCount": 1
}
```

**Explanation:** Deletes the booking inserted in Q10.

---

## Q16. Insert a new theater into the Theaters collection.

```js
db.theaters.insertOne({
  "theater_id": "2",
  "name": "Regal Cinemas",
  "location": { "city": "San Francisco", "state": "California", "country": "USA" },
  "seating_capacity": 400
});
```

**Output:**

```json
{
  "acknowledged": true,
  "insertedId": "2"
}
```

**Explanation:** Inserts a theater with `theater_id: "2"`.

---

## Q17. Find the first 5 movies sorted by release year in descending order.

```js
db.movies.find().sort({ "release_year": -1 }).limit(5);
```

**Output:**

```json
[]
```

**Explanation:** Only one movie was inserted and then deleted.

---

## Q18. Count how many movies are in the "Sci-Fi" genre.

```js
db.movies.countDocuments({ "genre": "Sci-Fi" });
```

**Output:**

```json
0
```

**Explanation:** "Inception" was deleted.

---

## Q19. Find all users who have exactly 50 loyalty points.

```js
db.users.find({ "loyalty_points": 50 });
```

**Output:**

```js
[
  {
    "user_id": "2",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "date_of_birth": ISODate("1990-07-12"),
    "loyalty_points": 50
  }
]
```

**Explanation:** Jane Smith has exactly 50 points.

---

## Q20. Update the name of the user with ID "1" to "Johnny Doe".

```js
db.users.updateOne(
  { "user_id": "1" },
  { $set: { "name": "Johnny Doe" } }
);
```

**Output:**

```json
{
  "acknowledged": true,
  "insertedId": "1"
}
```

**Explanation:** (As written in the exercise text.)

---

# MongoDB Exercises Questions for Intermediate (Medium)

## Q1. Find all movies where "Leonardo DiCaprio" is one of the actors.

```js
db.movies.find({ "actors": "Leonardo DiCaprio" });
```

**Output:**

```js
[
  {
    "movie_id": "1",
    "title": "Inception",
    "genre": "Sci-Fi",
    "release_year": 2010,
    "duration": 148,
    "ratings": 4.9,
    "actors": ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page", "Tom Hardy"]
  }
]
```

**Explanation:** Finds movies where "Leonardo DiCaprio" appears in the `actors` array.

---

## Q2. Add a new actor to the "Inception" movie.

```js
db.movies.updateOne(
  { "title": "Inception" },
  { $push: { "actors": "Tom Hardy" } }
);
```

**Output:**

```json
{
  "acknowledged": true,
  "matchedCount": 1,
  "modifiedCount": 1
}
```

**Explanation:** Adds "Tom Hardy" to the `actors` array.

---

## Q3. Retrieve all bookings made in September 2023.

```js
db.bookings.find({
  "booking_date": {
    $gte: ISODate("2023-09-01"),
    $lt: ISODate("2023-10-01")
  }
});
```

**Output:**

```js
[
  {
    "booking_id": "1",
    "user_id": "1",
    "movie_id": "1",
    "theater_id": "1",
    "seats_booked": 2,
    "total_price": 30,
    "booking_date": ISODate("2023-09-10")
  },
  {
    "booking_id": "2",
    "user_id": "2",
    "movie_id": "3",
    "theater_id": "2",
    "seats_booked": 4,
    "total_price": 60,
    "booking_date": ISODate("2023-09-11")
  },
  {
    "booking_id": "3",
    "user_id": "3",
    "movie_id": "1",
    "theater_id": "1",
    "seats_booked": 1,
    "total_price": 15,
    "booking_date": ISODate("2023-09-12")
  }
]
```

**Explanation:** Retrieves bookings with `booking_date` inside September 2023.

---

## Q4. Calculate the total price for all bookings made by the user with ID "1".

```js
db.bookings.aggregate([
  { $match: { "user_id": "1" } },
  { $group: { _id: null, total: { $sum: "$total_price" } } }
]);
```

**Output:**

```js
[
  { "_id": null, "total": 30 }
]
```

**Explanation:** Sums `total_price` for user "1".

---

## Q5. Delete all users who have less than 10 loyalty points.

```js
db.users.deleteMany({ "loyalty_points": { $lt: 10 } });
```

**Output:**

```json
{
  "acknowledged": true,
  "deletedCount": 0
}
```

**Explanation:** No users match the condition.

---

## Q6. Find all movies that are either in the "Action" or "Adventure" genres.

```js
db.movies.find({ "genre": { $in: ["Action", "Adventure"] } });
```

**Output:**

```json
[]
```

**Explanation:** No matching movies exist in the dataset.

---

## Q7. Insert multiple bookings into the Bookings collection.

```js
db.bookings.insertMany([
  {
    "booking_id": "2",
    "user_id": "2",
    "movie_id": "3",
    "theater_id": "2",
    "seats_booked": 4,
    "total_price": 60,
    "booking_date": ISODate("2023-09-11")
  },
  {
    "booking_id": "3",
    "user_id": "3",
    "movie_id": "1",
    "theater_id": "1",
    "seats_booked": 1,
    "total_price": 15,
    "booking_date": ISODate("2023-09-12")
  }
]);
```

**Output:**

```json
{
  "acknowledged": true,
  "insertedIds": {
    "0": "2",
    "1": "3"
  }
}
```

**Explanation:** Inserts two bookings.

---

## Q8. Find the total number of bookings made for the movie with ID "1".

```js
db.bookings.countDocuments({ "movie_id": "1" });
```

**Output:**

```json
3
```

**Explanation:** Counts bookings where `movie_id` is "1".

---

## Q9. Find all theaters in the USA with a seating capacity greater than 300.

```js
db.theaters.find({
  "location.country": "USA",
  "seating_capacity": { $gt: 300 }
});
```

**Output:**

```js
[
  {
    "theater_id": "2",
    "name": "Regal Cinemas",
    "location": {
      "city": "San Francisco",
      "state": "California",
      "country": "USA"
    },
    "seating_capacity": 400
  }
]
```

**Explanation:** Filters by country and capacity.

---

## Q10. Update loyalty points for users who have booked more than 3 seats (add 10 points).

```js
db.bookings.aggregate([
  { $group: { _id: "$user_id", total_seats: { $sum: "$seats_booked" } } },
  { $match: { total_seats: { $gt: 3 } } }
]).forEach(function(user) {
  db.users.updateOne(
    { "user_id": user._id },
    { $inc: { "loyalty_points": 10 } }
  );
});
```

**Output:**

```js
[
  { "acknowledged": true, "matchedCount": 1, "modifiedCount": 1 },
  { "acknowledged": true, "matchedCount": 1, "modifiedCount": 1 }
]
```

**Explanation:** Users with more than 3 total seats get +10 points.

---

## Q11. Find all movies where the genre is not "Comedy".

```js
db.movies.find({ "genre": { $ne: "Comedy" } });
```

**Output:**

```js
[
  {
    "movie_id": "1",
    "title": "Inception",
    "genre": "Sci-Fi",
    "release_year": 2010,
    "duration": 148,
    "ratings": 4.9,
    "actors": ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page", "Tom Hardy"]
  }
]
```

**Explanation:** Uses `$ne` to exclude "Comedy".

---

## Q12. Find the number of seats booked for each movie.

```js
db.bookings.aggregate([
  { $group: { _id: "$movie_id", total_seats: { $sum: "$seats_booked" } } }
]);
```

**Output:**

```js
[
  { "_id": "1", "total_seats": 3 },
  { "_id": "3", "total_seats": 4 }
]
```

**Explanation:** Groups by `movie_id` and sums seats.

---

## Q13. Find all users who booked seats in "California" theaters.

```js
db.bookings.aggregate([
  { $lookup: { from: "theaters", localField: "theater_id", foreignField: "theater_id", as: "theater_info" } },
  { $unwind: "$theater_info" },
  { $match: { "theater_info.location.state": "California" } },
  { $group: { _id: "$user_id" } }
]);
```

**Output:**

```js
[
  { "_id": "1" },
  { "_id": "2" }
]
```

**Explanation:** Joins bookings with theaters, filters by state, then extracts unique user IDs.

---

## Q14. Increase the ticket price for all bookings made after 2023-09-10 by 5%.

```js
db.theaters.updateMany(
  { "location.state": "California" },
  { $set: { "seating_capacity": 500 } }
);
```

**Output:**

```json
{
  "acknowledged": true,
  "matchedCount": 2,
  "modifiedCount": 2
}
```

**Explanation:** (As written in the exercise text.)

---

## Q15. Find the average rating of all movies in the "Sci-Fi" genre.

```js
db.movies.aggregate([
  { $match: { "genre": "Sci-Fi" } },
  { $group: { _id: null, avg_rating: { $avg: "$ratings" } } }
]);
```

**Output:**

```js
[
  { "_id": null, "avg_rating": 4.9 }
]
```

**Explanation:** Filters Sci-Fi movies and averages `ratings`.

---

## Q16. Find the movie with the longest duration.

```js
db.movies.aggregate([
  { $match: { "genre": "Sci-Fi" } },
  { $group: { _id: null, avg_duration: { $avg: "$duration" } } }
]);
```

**Output:**

```js
[
  {
    "movie_id": "1",
    "title": "Inception",
    "genre": "Sci-Fi",
    "release_year": 2010,
    "duration": 148,
    "ratings": 4.9,
    "actors": ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page", "Tom Hardy"]
  }
]
```

**Explanation:** (As written in the exercise text.)

---

## Q17. Find all bookings where the user booked more than 2 seats.

```js
db.bookings.find({ "seats_booked": { $gt: 2 } });
```

**Output:**

```js
[
  {
    "booking_id": "2",
    "user_id": "2",
    "movie_id": "3",
    "theater_id": "2",
    "seats_booked": 4,
    "total_price": 60,
    "booking_date": ISODate("2023-09-11")
  }
]
```

**Explanation:** Filters bookings where `seats_booked > 2`.

---

## Q18. Find all movies that have both "Tom Hardy" and "Leonardo DiCaprio" in their cast.

```js
db.movies.find({ "actors": { $all: ["Tom Hardy", "Leonardo DiCaprio"] } });
```

**Output:**

```js
[
  {
    "movie_id": "1",
    "title": "Inception",
    "genre": "Sci-Fi",
    "release_year": 2010,
    "duration": 148,
    "ratings": 4.9,
    "actors": ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page", "Tom Hardy"]
  }
]
```

**Explanation:** Uses `$all` for "must contain both" semantics.

---

## Q19. Find all users who have not made any bookings.

```js
db.users.find({ "user_id": { $nin: db.bookings.distinct("user_id") } });
```

**Output:**

```js
[
  {
    "user_id": "4",
    "name": "Eve",
    "loyalty_points": 15
  }
]
```

**Explanation:** Excludes users whose IDs appear in bookings.

---

## Q20. Delete all movies that have less than 3 stars in ratings.

```js
db.movies.deleteMany({ "ratings": { $lt: 3 } });
```

**Output:**

```json
{
  "acknowledged": true,
  "deletedCount": 0
}
```

**Explanation:** No movies match `ratings < 3`.

---

# Advanced MongoDB Exercises Questions (Hard)

## Q1. Find the top 3 users who have spent the most on bookings (total_price).

```js
db.bookings.aggregate([
  { $group: { _id: "$user_id", total_spent: { $sum: "$total_price" } } },
  { $sort: { total_spent: -1 } },
  { $limit: 3 }
]);
```

**Output:**

```js
[
  { "_id": "2", "total_spent": 150 },
  { "_id": "1", "total_spent": 90 },
  { "_id": "3", "total_spent": 80 }
]
```

**Explanation:** Groups by user, sums spending, sorts descending, limits to top 3.

---

## Q2. Find all movies that have been booked in more than 2 different theaters.

```js
db.bookings.aggregate([
  { $group: { _id: { movie_id: "$movie_id", theater_id: "$theater_id" } } },
  { $group: { _id: "$_id.movie_id", theater_count: { $sum: 1 } } },
  { $match: { theater_count: { $gt: 2 } } }
]);
```

**Output:**

```js
[
  { "_id": "3", "theater_count": 3 }
]
```

**Explanation:** Counts distinct theater IDs per movie.

---

## Q3. Find the theater with the most seats booked across all movies.

```js
db.bookings.aggregate([
  { $group: { _id: "$theater_id", total_seats: { $sum: "$seats_booked" } } },
  { $sort: { total_seats: -1 } },
  { $limit: 1 }
]);
```

**Output:**

```js
[
  { "_id": "1", "total_seats": 8 }
]
```

**Explanation:** Sums seats per theater and returns the top one.

---

## Q4. Find the average number of loyalty points for users who booked seats in "California".

```js
db.bookings.aggregate([
  { $lookup: { from: "theaters", localField: "theater_id", foreignField: "theater_id", as: "theater_info" } },
  { $unwind: "$theater_info" },
  { $match: { "theater_info.location.state": "California" } },
  { $lookup: { from: "users", localField: "user_id", foreignField: "user_id", as: "user_info" } },
  { $unwind: "$user_info" },
  { $group: { _id: null, avg_loyalty_points: { $avg: "$user_info.loyalty_points" } } }
]);
```

**Output:**

```js
[
  { "_id": null, "avg_loyalty_points": 25 }
]
```

**Explanation:** Joins theaters and users, filters by California, then averages loyalty points.

---

## Q5. Create an index on the booking_date field in Bookings.

```js
db.bookings.createIndex({ "booking_date": 1 });
```

**Output:**

```js
{
  "createdCollectionAutomatically": false,
  "numIndexesBefore": 1,
  "numIndexesAfter": 2,
  "ok": 1
}
```

**Explanation:** Adds an index to speed up date-based queries.

---

## Q6. Find the top 5 most popular actors by number of movies they appear in.

```js
db.movies.aggregate([
  { $unwind: "$actors" },
  { $group: { _id: "$actors", movie_count: { $sum: 1 } } },
  { $sort: { movie_count: -1 } },
  { $limit: 5 }
]);
```

**Output:**

```js
[
  { "_id": "Leonardo DiCaprio", "movie_count": 3 },
  { "_id": "Tom Hardy", "movie_count": 2 },
  { "_id": "Joseph Gordon-Levitt", "movie_count": 2 }
]
```

**Explanation:** Unwinds actors arrays, counts appearances, sorts descending, limits to top 5.

---

## Q7. Find the user who booked the most seats in September 2023.

```js
db.bookings.aggregate([
  { $match: { "booking_date": { $gte: ISODate("2023-09-01"), $lt: ISODate("2023-10-01") } } },
  { $group: { _id: "$user_id", total_seats: { $sum: "$seats_booked" } } },
  { $sort: { total_seats: -1 } },
  { $limit: 1 }
]);
```

**Output:**

```js
[
  { "_id": "2", "total_seats": 8 }
]
```

**Explanation:** Filters by month, sums seats per user, returns the maximum.

---

## Q8. Find all movies that have not been booked by any user.

```js
db.movies.find({
  "movie_id": { $nin: db.bookings.distinct("movie_id") }
});
```

**Output:**

```js
[
  {
    "movie_id": "5",
    "title": "Uncharted",
    "genre": "Adventure",
    "release_year": 2022
  }
]
```

**Explanation:** Excludes movies that appear in bookings.

---

## Q9. Create a compound index on genre and release_year in Movies.

```js
db.movies.createIndex({ "genre": 1, "release_year": -1 });
```

**Output:**

```js
{
  "createdCollectionAutomatically": false,
  "numIndexesBefore": 2,
  "numIndexesAfter": 3,
  "ok": 1
}
```

**Explanation:** Speeds up queries filtering by genre and sorting by release year.

---

## Q10. Find the user who made the first booking ever, show name and email.

```js
db.bookings.aggregate([
  { $sort: { "booking_date": 1 } },
  { $limit: 1 },
  { $lookup: { from: "users", localField: "user_id", foreignField: "user_id", as: "user_info" } },
  { $unwind: "$user_info" },
  { $project: { name: "$user_info.name", email: "$user_info.email" } }
]);
```

**Output:**

```js
[
  { "name": "Alice", "email": "alice@example.com" }
]
```

**Explanation:** Sorts bookings by date ascending, picks first, then joins users to project name and email.
