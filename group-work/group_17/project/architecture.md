# Architecture & Data Model: Movie Theater Database

## Domain Snapshot

This project models the operations of an online movie platform using MongoDB. The system manages movies, users, sessions, theaters, and user comments. The database is designed to answer:

1. How do user ratings and comments vary by movie?
2. Which cities have the most theaters?

## Collections

| Collection   | Role                    | Notes |
|-------------|-------------------------|-------|
| `movies`    | Reference/master data   | Stores information about movies being shown at the cinema. |
| `users`     | Reference/master data   | Registered users of the cinema system. |
| `sessions`  | Fact/telemetry          | Represents logged in users. |
| `theaters`  | Reference/master data   | Information about individual theater rooms. |
| `comments`  | Fact/telemetry          | User comments and reviews for movies. |

## Schema Highlights

```javascript
// movies
{
  _id: ObjectId,            
  title: String,
  genres: [String],
  runtime: Number,
  cast: [String],
  countries: [String],
  release_date: Date,
  director: String,
  rated: String,
  plot: String,
  awards: {
    wins: Number,
    nominations: Number,
    text: String
  },
  imdb: {
    rating: Number,
    votes: Number,
    id: Number
  },
  tomatoes: {
    viewer: {
      rating: Number,
      numReviews: Number,
      meter: Number
    },
    lastUpdated: Date
  },
  lastUpdated: Date
}


// users
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String
}


// sessions
{
  _id: ObjectId,
  user_id: String,
  jwt: String
}


// theaters
{
  _id: ObjectId,
  theaterId: Number,
  location: {
    address: {
      street1: String,
      city: String,
      state: String,
      zipcode: String
    },
    geo: {
      type: String,
      coordinates: [Number]
    }
  }
}


// comments
{
  _id: ObjectId,
  name: String,
  email: String,
  movie_id: ObjectId,
  text: String,
  date: Date
}
```

## Modeling Decisions

1. **User comments** – Comments are stored separately and reference both users and movies for detailed feedback and analytics.
2. **Embedded arrays** – Genres, cast, and preferences are stored as arrays for easy querying and aggregation.

## Relationships & Access Patterns

- `comments` → `users` (N:1 via `user_id`)
- `comments` → `movies` (N:1 via `movie_id`)

Comments are used for movie ratings and feedback analysis.

## Index Blueprint

- `comments` index `{ movie_id: 1, user_id: 1 }` – enables fast retrieval of reviews for a movie or by a user.
- `movies` unique index `{ title: 1 }` – prevents duplicate movie entries.
- `movies` index { genres: 1 } – allows fast genre-based searches.
- `theaters` unique index { theaterId: 1 } – prevents duplicate theater entries.
- `comments` compound index { movie_id: 1, email: 1 } – fast retrieval of all comments for a movie or by a user.

Indexes should be provisioned via a dedicated script so they can be reapplied after a drop/reload cycle.

## Example Use Cases

- List all information about a specific movie.
- Find all comments for a specific movie.
- Get average rating for a movie based on comments.