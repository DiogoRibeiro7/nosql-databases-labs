/* global db */

const exercisesDb = db.getSiblingDB("exercises");
const people = exercisesDb.people;

people.drop();

people.insert({ name: "Tim", country: "USA", age: 15 });
people.insert({ name: "Sandra", country: "USA", age: 18 });
people.insert({ name: "Alex", country: "France", age: 19 });
people.insert({ name: "Zhong", country: "Taiwan", age: 19 });
people.insert({ name: "Tom", country: "USA", age: 20 });
people.insert({ name: "Marc", country: "France", age: 20 });
people.insert({ name: "Hao", country: "Taiwan", age: 12 });
people.insert({ name: "Jennifer", country: "USA", age: 15 });
people.insert({ name: "Jean", country: "France", age: 17 });
people.insert({ name: "James", country: "USA", age: 17 });

// 1 count number of people per age, sort by age descending
people.aggregate([{ $group: { _id: "$age", count: { $sum: 1 } } }, { $sort: { _id: -1 } }]);
