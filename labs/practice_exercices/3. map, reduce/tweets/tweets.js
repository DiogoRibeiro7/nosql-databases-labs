use exercises

/*---
tweets collection loaded with json data from tweets.json
{ id: ..., tweet: "example of a #tweet" } 
--- */

// We want to know which hashtags are trending. Make a list of how often each hashtag occurs. There is no
// difference between small letters and capital letters. The list is ordered from high to low. 
db.tweets.aggregate([
    {
        $project: {
            hashtags: {
                $map: {
                    input: {
                        $regexFindAll: {
                            input: "$tweet",
                            regex: /#[A-Za-z0-9_]+/g
                        }
                    },
                    as: "tag",
                    in: { $toLower: "$$tag.match" }
                }
            }
        }
    },
    { $unwind: "$hashtags" },
    { $group: { _id: "$hashtags", count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $project: { hashtag: "$_id", count: 1, _id: 0 } }
])
