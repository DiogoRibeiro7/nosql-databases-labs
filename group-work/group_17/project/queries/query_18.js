db = db.getSiblingDB('group_17_db');

print("Total number of movies:");
// total number of movies
db.movies.countDocuments();