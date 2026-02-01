db = db.getSiblingDB('group_17_db');

print("Total number of horror movies:");
// total number of movies by genre
db.movies.countDocuments({ genres: "Horror" });