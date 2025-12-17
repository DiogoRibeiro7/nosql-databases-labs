/* eslint-env mongo */
/* eslint-disable no-global-assign */
db = db.getSiblingDB("exercises");
/* eslint-enable no-global-assign */

db.people.drop()

db.people.insert({ name: "Tim", country: "USA", age: 15 })
db.people.insert({ name: "Sandra", country: "USA", age: 18 })
db.people.insert({ name: "Alex", country: "France", age: 19 })
db.people.insert({ name: "Zhong", country: "Taiwan", age: 19 })
db.people.insert({ name: "Tom", country: "USA", age: 20 })
db.people.insert({ name: "Marc", country: "France", age: 20 })
db.people.insert({ name: "Hao", country: "Taiwan", age: 12 })
db.people.insert({ name: "Jennifer", country: "USA", age: 15 })
db.people.insert({ name: "Jean", country: "France", age: 17 })
db.people.insert({ name: "James", country: "USA", age: 17 })

// 1 count number of people per age, sort by age descending
db.people.aggregate([
    { $group: { _id: "$age", count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
])
