/**
 * Lab 03 - Fixed Aggregation Pipelines (mongosh version)
 *
 * Run this in mongosh:
 * mongosh mflix --file aggregations_fixed_mongosh.js
 *
 * This file contains corrected aggregation pipelines for common use cases
 */

use('mflix');

print("=" .repeat(60));
print("Lab 03 - MongoDB Aggregation Pipeline Examples");
print("=" .repeat(60));

// ========================================================================
// 1. Top Rated Movies by Genre
// ========================================================================
print("\n1. TOP RATED MOVIES BY GENRE");
print("-".repeat(40));

const topByGenre = db.movies.aggregate([
    // Unwind genres array to process each genre separately
    { $unwind: "$genres" },

    // Filter out movies without ratings
    { $match: { "imdb.rating": { $exists: true, $ne: null } } },

    // Sort by rating within each genre
    { $sort: { "imdb.rating": -1 } },

    // Group by genre and get top 3 movies
    {
        $group: {
            _id: "$genres",
            topMovies: {
                $push: {
                    title: "$title",
                    year: "$year",
                    rating: "$imdb.rating",
                    votes: "$imdb.votes"
                }
            }
        }
    },

    // Limit to top 3 movies per genre
    {
        $project: {
            genre: "$_id",
            topMovies: { $slice: ["$topMovies", 3] }
        }
    },

    // Sort genres alphabetically
    { $sort: { genre: 1 } },

    // Limit to 5 genres for display
    { $limit: 5 }
]).toArray();

print("Top 3 movies per genre:");
topByGenre.forEach(genre => {
    print(`\n${genre.genre}:`);
    genre.topMovies.forEach((movie, index) => {
        print(`  ${index + 1}. ${movie.title} (${movie.year}) - Rating: ${movie.rating}, Votes: ${movie.votes}`);
    });
});

// ========================================================================
// 2. Movies Released Per Year with Statistics
// ========================================================================
print("\n2. MOVIES PER YEAR WITH STATISTICS");
print("-".repeat(40));

const moviesByYear = db.movies.aggregate([
    // Filter for movies with valid year
    { $match: {
        year: { $exists: true, $type: "number", $gte: 2010, $lte: 2020 }
    }},

    // Group by year
    {
        $group: {
            _id: "$year",
            count: { $sum: 1 },
            avgRating: { $avg: "$imdb.rating" },
            maxRating: { $max: "$imdb.rating" },
            minRating: { $min: "$imdb.rating" },
            totalVotes: { $sum: "$imdb.votes" },
            genres: { $addToSet: "$genres" }
        }
    },

    // Flatten and count unique genres
    {
        $project: {
            year: "$_id",
            count: 1,
            avgRating: { $round: ["$avgRating", 2] },
            maxRating: 1,
            minRating: 1,
            totalVotes: 1,
            uniqueGenreCount: {
                $size: {
                    $reduce: {
                        input: "$genres",
                        initialValue: [],
                        in: { $setUnion: ["$$value", "$$this"] }
                    }
                }
            }
        }
    },

    // Sort by year
    { $sort: { year: -1 } }
]).toArray();

print("\nMovie Statistics by Year (2010-2020):");
moviesByYear.forEach(yearData => {
    print(`\n${yearData.year}:`);
    print(`  Movies Released: ${yearData.count}`);
    print(`  Avg Rating: ${yearData.avgRating}`);
    print(`  Rating Range: ${yearData.minRating} - ${yearData.maxRating}`);
    print(`  Total Votes: ${yearData.totalVotes.toLocaleString()}`);
    print(`  Unique Genres: ${yearData.uniqueGenreCount}`);
});

// ========================================================================
// 3. Director Statistics
// ========================================================================
print("\n3. DIRECTOR STATISTICS");
print("-".repeat(40));

const directorStats = db.movies.aggregate([
    // Unwind directors array
    { $unwind: "$directors" },

    // Filter out null directors
    { $match: { directors: { $ne: null } } },

    // Group by director
    {
        $group: {
            _id: "$directors",
            movieCount: { $sum: 1 },
            avgRating: { $avg: "$imdb.rating" },
            totalVotes: { $sum: "$imdb.votes" },
            movies: { $push: { title: "$title", year: "$year", rating: "$imdb.rating" } },
            genres: { $addToSet: "$genres" },
            earliestMovie: { $min: "$year" },
            latestMovie: { $max: "$year" }
        }
    },

    // Calculate career span and flatten genres
    {
        $project: {
            director: "$_id",
            movieCount: 1,
            avgRating: { $round: ["$avgRating", 2] },
            totalVotes: 1,
            careerSpan: { $subtract: ["$latestMovie", "$earliestMovie"] },
            earliestMovie: 1,
            latestMovie: 1,
            genreCount: {
                $size: {
                    $reduce: {
                        input: "$genres",
                        initialValue: [],
                        in: { $setUnion: ["$$value", "$$this"] }
                    }
                }
            },
            bestMovie: { $arrayElemAt: [{ $sortArray: { input: "$movies", sortBy: { rating: -1 } } }, 0] }
        }
    },

    // Filter for directors with at least 3 movies
    { $match: { movieCount: { $gte: 3 } } },

    // Sort by average rating
    { $sort: { avgRating: -1 } },

    // Limit results
    { $limit: 10 }
]).toArray();

print("\nTop 10 Directors (min 3 movies):");
directorStats.forEach((director, index) => {
    print(`\n${index + 1}. ${director.director}`);
    print(`   Movies: ${director.movieCount}`);
    print(`   Avg Rating: ${director.avgRating}`);
    print(`   Career: ${director.earliestMovie} - ${director.latestMovie} (${director.careerSpan} years)`);
    print(`   Genre Diversity: ${director.genreCount} genres`);
    if (director.bestMovie) {
        print(`   Best Movie: ${director.bestMovie.title} (${director.bestMovie.rating})`);
    }
});

// ========================================================================
// 4. Cast Member Analysis
// ========================================================================
print("\n4. CAST MEMBER ANALYSIS");
print("-".repeat(40));

const castAnalysis = db.movies.aggregate([
    // Sample to reduce processing time
    { $sample: { size: 1000 } },

    // Unwind cast array
    { $unwind: "$cast" },

    // Group by cast member
    {
        $group: {
            _id: "$cast",
            movieCount: { $sum: 1 },
            avgRating: { $avg: "$imdb.rating" },
            genres: { $addToSet: "$genres" },
            directors: { $addToSet: "$directors" },
            yearRange: {
                $push: "$year"
            }
        }
    },

    // Process arrays
    {
        $project: {
            actor: "$_id",
            movieCount: 1,
            avgRating: { $round: ["$avgRating", 2] },
            genreCount: {
                $size: {
                    $reduce: {
                        input: "$genres",
                        initialValue: [],
                        in: { $setUnion: ["$$value", "$$this"] }
                    }
                }
            },
            directorCount: {
                $size: {
                    $reduce: {
                        input: "$directors",
                        initialValue: [],
                        in: { $setUnion: ["$$value", "$$this"] }
                    }
                }
            },
            firstYear: { $min: "$yearRange" },
            lastYear: { $max: "$yearRange" }
        }
    },

    // Filter for actors with multiple movies
    { $match: { movieCount: { $gte: 5 } } },

    // Sort by movie count
    { $sort: { movieCount: -1 } },

    // Limit results
    { $limit: 10 }
]).toArray();

print("\nTop 10 Most Prolific Actors (from sample):");
castAnalysis.forEach((actor, index) => {
    print(`\n${index + 1}. ${actor.actor}`);
    print(`   Movies: ${actor.movieCount}`);
    print(`   Avg Rating: ${actor.avgRating}`);
    print(`   Worked in ${actor.genreCount} genres`);
    print(`   Worked with ${actor.directorCount} directors`);
    print(`   Active: ${actor.firstYear} - ${actor.lastYear}`);
});

// ========================================================================
// 5. Award Winners Analysis
// ========================================================================
print("\n5. AWARD WINNERS ANALYSIS");
print("-".repeat(40));

const awardAnalysis = db.movies.aggregate([
    // Filter for movies with awards
    { $match: {
        "awards.wins": { $gt: 0 },
        year: { $gte: 2000 }
    }},

    // Create award categories
    {
        $project: {
            title: 1,
            year: 1,
            "imdb.rating": 1,
            totalAwards: { $add: ["$awards.wins", "$awards.nominations"] },
            wins: "$awards.wins",
            nominations: "$awards.nominations",
            winRate: {
                $cond: {
                    if: { $eq: [{ $add: ["$awards.wins", "$awards.nominations"] }, 0] },
                    then: 0,
                    else: { $divide: ["$awards.wins", { $add: ["$awards.wins", "$awards.nominations"] }] }
                }
            },
            awardCategory: {
                $switch: {
                    branches: [
                        { case: { $gte: ["$awards.wins", 50] }, then: "Highly Decorated" },
                        { case: { $gte: ["$awards.wins", 20] }, then: "Well Awarded" },
                        { case: { $gte: ["$awards.wins", 10] }, then: "Moderately Awarded" },
                        { case: { $gte: ["$awards.wins", 5] }, then: "Some Awards" }
                    ],
                    default: "Few Awards"
                }
            }
        }
    },

    // Group by category
    {
        $group: {
            _id: "$awardCategory",
            count: { $sum: 1 },
            avgRating: { $avg: "$imdb.rating" },
            avgWins: { $avg: "$wins" },
            avgWinRate: { $avg: "$winRate" },
            examples: {
                $push: {
                    title: "$title",
                    year: "$year",
                    wins: "$wins",
                    rating: "$imdb.rating"
                }
            }
        }
    },

    // Sort by average wins
    { $sort: { avgWins: -1 } }
]).toArray();

print("\nMovies by Award Categories:");
awardAnalysis.forEach(category => {
    print(`\n${category._id}:`);
    print(`  Count: ${category.count} movies`);
    print(`  Avg Rating: ${category.avgRating?.toFixed(2) || 'N/A'}`);
    print(`  Avg Wins: ${category.avgWins.toFixed(1)}`);
    print(`  Win Rate: ${(category.avgWinRate * 100).toFixed(1)}%`);

    if (category.examples.length > 0) {
        const topExample = category.examples.sort((a, b) => b.wins - a.wins)[0];
        print(`  Top Example: ${topExample.title} (${topExample.year}) - ${topExample.wins} wins`);
    }
});

// ========================================================================
// 6. Runtime Analysis by Genre
// ========================================================================
print("\n6. RUNTIME ANALYSIS BY GENRE");
print("-".repeat(40));

const runtimeByGenre = db.movies.aggregate([
    // Filter for movies with runtime
    { $match: { runtime: { $exists: true, $type: "number", $gt: 0 } } },

    // Unwind genres
    { $unwind: "$genres" },

    // Group by genre
    {
        $group: {
            _id: "$genres",
            avgRuntime: { $avg: "$runtime" },
            minRuntime: { $min: "$runtime" },
            maxRuntime: { $max: "$runtime" },
            count: { $sum: 1 },
            longMovies: {
                $sum: { $cond: [{ $gte: ["$runtime", 150] }, 1, 0] }
            },
            shortMovies: {
                $sum: { $cond: [{ $lte: ["$runtime", 90] }, 1, 0] }
            }
        }
    },

    // Calculate percentages
    {
        $project: {
            genre: "$_id",
            avgRuntime: { $round: ["$avgRuntime", 1] },
            minRuntime: 1,
            maxRuntime: 1,
            count: 1,
            percentLong: {
                $round: [{ $multiply: [{ $divide: ["$longMovies", "$count"] }, 100] }, 1]
            },
            percentShort: {
                $round: [{ $multiply: [{ $divide: ["$shortMovies", "$count"] }, 100] }, 1]
            }
        }
    },

    // Sort by average runtime
    { $sort: { avgRuntime: -1 } },

    // Limit to top genres
    { $limit: 10 }
]).toArray();

print("\nRuntime Statistics by Genre:");
runtimeByGenre.forEach(genre => {
    print(`\n${genre.genre}:`);
    print(`  Avg Runtime: ${genre.avgRuntime} minutes`);
    print(`  Range: ${genre.minRuntime} - ${genre.maxRuntime} minutes`);
    print(`  Long Movies (>150min): ${genre.percentLong}%`);
    print(`  Short Movies (<90min): ${genre.percentShort}%`);
});

// ========================================================================
// 7. Comments Analysis by Movie
// ========================================================================
print("\n7. COMMENTS ANALYSIS");
print("-".repeat(40));

const commentsAnalysis = db.movies.aggregate([
    // Sample movies for performance
    { $sample: { size: 100 } },

    // Lookup comments
    {
        $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "movie_id",
            as: "comments"
        }
    },

    // Filter movies with comments
    { $match: { "comments.0": { $exists: true } } },

    // Analyze comments
    {
        $project: {
            title: 1,
            year: 1,
            "imdb.rating": 1,
            commentCount: { $size: "$comments" },
            commenters: { $size: { $setUnion: "$comments.email" } },
            avgCommentLength: {
                $avg: {
                    $map: {
                        input: "$comments",
                        as: "comment",
                        in: { $strLenCP: "$$comment.text" }
                    }
                }
            },
            earliestComment: { $min: "$comments.date" },
            latestComment: { $max: "$comments.date" }
        }
    },

    // Sort by comment count
    { $sort: { commentCount: -1 } },

    // Limit results
    { $limit: 10 }
]).toArray();

print("\nTop 10 Most Discussed Movies (from sample):");
commentsAnalysis.forEach((movie, index) => {
    print(`\n${index + 1}. ${movie.title} (${movie.year})`);
    print(`   Rating: ${movie.imdb?.rating || 'N/A'}`);
    print(`   Comments: ${movie.commentCount}`);
    print(`   Unique Commenters: ${movie.commenters}`);
    print(`   Avg Comment Length: ${Math.round(movie.avgCommentLength)} characters`);

    if (movie.earliestComment && movie.latestComment) {
        const daysDiff = Math.floor((movie.latestComment - movie.earliestComment) / (1000 * 60 * 60 * 24));
        print(`   Discussion Period: ${daysDiff} days`);
    }
});

print("\n" + "=".repeat(60));
print("✓ All aggregation pipelines completed successfully!");
print("=".repeat(60));