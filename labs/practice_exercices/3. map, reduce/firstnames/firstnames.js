/* eslint-env mongo */
/* eslint-disable no-global-assign */
db = db.getSiblingDB("exercises");
/* eslint-enable no-global-assign */

db.firstnames.find()

/*---
firstnames collection loaded with json data from firstnames.json
example: 
{ 
    "_id" : ObjectId("5f8d59d02bf41c40efb7b6c1"), 
    "firstname" : "Aaron", 
    "region" : "Brussel", 
    "year" : 2001, 
    "amount" : 9
}
--- */


//1 Give per region the total number of children born between 2000 and 2004 (limits included)
//[(Brussel,23282), (Vlaanderen,129239), (Wallonie,82910)]
db.firstnames.aggregate([
    { $match: { year: { $gte: 2000, $lte: 2004 } } },
    { $group: { _id: "$region", total: { $sum: "$amount" } } },
    { $sort: { _id: 1 } }
])


//2 Give the total number of times that Thomas was born throughout Belgium each year
//[(1995,1046), (1996,1132), (1997,1157), (1998,1044), (1999,966), (2000,1041), (2001,997), (2002,907), (2003,720), (2004,708)]
db.firstnames.aggregate([
    { $match: { firstname: "Thomas" } },
    { $group: { _id: "$year", total: { $sum: "$amount" } } },
    { $sort: { _id: 1 } }
])

//3 Give the top 10 of firstnames for the year 1995 throughout Belgium. There is sorting from more to less popular.
db.firstnames.aggregate([
    { $match: { year: 1995 } },
    { $group: { _id: "$firstname", total: { $sum: "$amount" } } },
    { $sort: { total: -1, _id: 1 } },
    { $limit: 10 }
])

//4 Give the most popular firstname for every year throughout Belgium
//[(1995,(Thomas,1046)), (1996,(Thomas,1132)), (1997,(Thomas,1157)), (1998,(Thomas,1044)),
//(1999,(Thomas,966)), (2000,(Thomas,1041)), (2001,(Thomas,997)), (2002,(Thomas,907)),
//(2003,(Thomas,720)), (2004,(Noah,724))]
db.firstnames.aggregate([
    { $group: { _id: { year: "$year", firstname: "$firstname" }, total: { $sum: "$amount" } } },
    { $sort: { "_id.year": 1, total: -1 } },
    {
        $group: {
            _id: "$_id.year",
            name: { $first: "$_id.firstname" },
            amount: { $first: "$total" }
        }
    },
    { $sort: { _id: 1 } }
])

//5 Give the firstnames that were given between 40 and 50 times to new born baby boys between the
//years 1995 and 2004 (limits included) in Belgium.
db.firstnames.aggregate([
    { $match: { year: { $gte: 1995, $lte: 2004 } } },
    { $group: { _id: "$firstname", total: { $sum: "$amount" } } },
    { $match: { total: { $gte: 40, $lte: 50 } } },
    { $sort: { total: -1, _id: 1 } }
])
