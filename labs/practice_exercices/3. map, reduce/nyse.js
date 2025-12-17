use exercises

/* ---
nyse collection loaded with data from nyse.json

example:
{ 
    "_id" : ObjectId("5f8d50cf2bf41c40efab4edc"), 
    "stock_symbol" : "ASP", 
    "date" : "37256", 
    "stock_price_open" : 12.55, 
    "stock_price_high" : 12.8, 
    "stock_price_low" : 12.42, 
    "stock_price_close" : 12.8, 
    "stock_volume" : 11300
}
--- */

//1 Calculate the number of entries for each stock_symbol
db.nyse.aggregate([
    { $group: { _id: "$stock_symbol", entries: { $sum: 1 } } },
    { $sort: { _id: 1 } }
])

//2 Calculate the maximum stock_price_close for each stock_symbol
db.nyse.aggregate([
    { $group: { _id: "$stock_symbol", maxClose: { $max: "$stock_price_close" } } },
    { $sort: { _id: 1 } }
])

// 3 Calculate the maximum stock_price_close and the date on which this 
// stock_price_close was reached, for each stock_symbol
db.nyse.aggregate([
    { $sort: { stock_symbol: 1, stock_price_close: -1, date: 1 } },
    {
        $group: {
            _id: "$stock_symbol",
            maxClose: { $first: "$stock_price_close" },
            date: { $first: "$date" }
        }
    },
    { $sort: { _id: 1 } }
])
