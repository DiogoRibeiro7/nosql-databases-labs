/* global db */

const exercisesDb = db.getSiblingDB("exercises");
const zips = exercisesDb.zips;

/* ---
zips collection loaded with JSON data from media.mongodb.org/zips.json
--- */

// 1 Return States with Populations above 10 Million
zips.aggregate([
    { $group: { _id: "$state", totalPop: { $sum: "$pop" } } },
    { $match: { totalPop: { $gte: 10000000 } } }
])

// 2 Return Average City Population by State
zips.aggregate([
    { $group: { _id: { state: "$state", city: "$city" }, cityPop: { $sum: "$pop" } } }, //total population per city, per state
    { $group: { _id: "$_id.state", avgCityPop: { $avg: "$cityPop" } } } //get the avg of the cities per state
])

// 3 Return Largest and Smallest Cities by State (name and population)
zips.aggregate([
    { $group: { _id: { state: "$state", city: "$city" }, cityPop: { $sum: "$pop" } } }, //total population per city, per state
    { $sort: { cityPop: 1 } }, //per state, sort cities by city population
    {
        $group: {
            _id: "$_id.state",
            smallestCity: { $first: "$_id.city" }, smallestPop: { $first: "$cityPop" },
            largestCity: { $last: "$_id.city" }, largestPop: { $last: "$cityPop" }
        } // take the first and last (smallest and biggest) cities
    }
])

// 4 Return the top 5 states with the most number of cities
zips.aggregate([
    { $group: { _id: { state: true, city: true } } }, // get unique state, city pairs
    { $group: { _id: "$_id.state", numberOfCities: { $sum: 1 } } }, //count every time a state is mentioned, as this means a city is present
    { $sort: { numberOfCities: -1 } }, //sort large to small
    { $limit: 5 } //get top 5
])
