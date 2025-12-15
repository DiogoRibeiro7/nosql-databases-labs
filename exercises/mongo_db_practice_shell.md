# MongoDB Practice

MongoDB exercise in the Mongo shell.

---

## Create database

Connect to a running MongoDB instance and use a database named `mongo_practice`.

```js
use mongo_practice
````

---

## Insert documents

Insert the following documents into a `movies` collection.

### Fight Club

**Document**

```yaml
title: Fight Club
writer: Chuck Palahniuk
year: 1999
actors:
  - Brad Pitt
  - Edward Norton
```

**Insert**

```js
db.movies.insert({
  title: "Fight Club",
  writer: "Chuck Palahniuk",
  year: "1999",
  actors: ["Brad Pitt", "Edward Norton"]
});
```

---

### Pulp Fiction

**Document**

```yaml
title: Pulp Fiction
writer: Quentin Tarantino
year: 1994
actors:
  - John Travolta
  - Uma Thurman
```

**Insert**

```js
db.movies.insert({
  title: "Pulp Fiction",
  writer: "Quentin Tarantino",
  year: "2009",
  actors: ["John Travolta", "Uma Thurman"]
});
```

---

### Inglorious Basterds

**Document**

```yaml
title: Inglorious Basterds
writer: Quentin Tarantino
year: 2009
actors:
  - Brad Pitt
  - Diane Kruger
  - Eli Roth
```

**Insert**

```js
db.movies.insert({
  title: "Inglorious Basterds",
  writer: "Quentin Tarantino",
  year: "2009",
  actors: ["Brad Pitt", "Diane Kruger", "Eli Roth"]
});
```

---

### The Hobbit: An Unexpected Journey

**Document**

```yaml
title: The Hobbit: An Unexpected Journey
writer: J.R.R. Tolkein
year: 2012
franchise: The Hobbit
```

**Insert**

```js
db.movies.insert({
  title: "The Hobbit: An unexpected Journey",
  writer: "J.R.R. Tolkein",
  year: "2012",
  franchise: "The Hobbit"
});
```

---

### The Hobbit: The Desolation of Smaug

**Document**

```yaml
title: The Hobbit: The Desolation of Smaug
writer: J.R.R. Tolkein
year: 2013
franchise: The Hobbit
```

**Insert**

```js
db.movies.insert({
  title: "The Hobbit: The Desolation of Smaug",
  writer: "J.R.R Tolkien",
  year: "2013",
  franchise: "The Hobbit"
});
```

---

### The Hobbit: The Battle of the Five Armies

**Document**

```yaml
title: The Hobbit: The Battle of the Five Armies
writer: J.R.R. Tolkein
year: 2012
franchise: The Hobbit
synopsis: >
  Bilbo and Company are forced to engage in a war against an array of combatants
  and keep the Lonely Mountain from falling into the hands of a rising darkness.
```

**Insert**

```js
db.movies.insert({
  title: "The Hobbit: The Battle of the Five Armies",
  writer: "J.R.R Tolkien",
  year: "2002",
  franchise: "The Hobbit",
  synopsis: "Bilbo and Company are forced to engage in a war against an array of combatants and keep the Lonely Mountain from falling into the hands of a rising darkness."
});
```

---

### Pee Wee Herman's Big Adventure

**Document**

```yaml
title: Pee Wee Herman's Big Adventure
```

**Insert**

```js
db.movies.insert({
  title: "Pee Wee Herman's Big Adventures"
});
```

---

### Avatar

**Document**

```yaml
title: Avatar
```

**Insert**

```js
db.movies.insert({ title: "Avatar" });
```

---

## Query / find documents

Query the `movies` collection.

### 1) Get all documents

```js
db.movies.find();
```

### 2) Get all documents with `writer` set to "Quentin Tarantino"

```js
db.movies.find({ writer: "Quentin Tarantino" });
```

### 3) Get all documents where `actors` include "Brad Pitt"

```js
db.movies.find({ actors: "Brad Pitt" });
```

### 4) Get all documents with `franchise` set to "The Hobbit"

```js
db.movies.find({ franchise: "The Hobbit" });
```

### 5) Get all movies released in the 90s

```js
db.movies.find({ year: { $gt: "1990", $lt: "2000" } });
```

### 6) Get all movies released before 2000 or after 2010

```js
db.movies.find({
  $or: [
    { year: { $gt: "2010" } },
    { year: { $lt: "2000" } }
  ]
});
```

---

## Update documents

### 1) Add a synopsis to "The Hobbit: An Unexpected Journey"

Synopsis:

> A reluctant hobbit, Bilbo Baggins, sets out to the Lonely Mountain with a spirited group of dwarves to reclaim their mountain home - and the gold within it - from the dragon Smaug.

```js
db.movies.update(
  { _id: ObjectId("5c9f98e5e5c2dfe9b3729bfe") },
  {
    $set: {
      synopsis: "A reluctant hobbit, Bilbo Baggins, sets out to the Lonely Mountain with a spirited group of dwarves to reclaim their mountain home - and the gold within it - from the dragon Smaug."
    }
  }
);
```

### 2) Add a synopsis to "The Hobbit: The Desolation of Smaug"

Synopsis:

> The dwarves, along with Bilbo Baggins and Gandalf the Grey, continue their quest to reclaim Erebor, their homeland, from Smaug. Bilbo Baggins is in possession of a mysterious and magical ring.

```js
db.movies.update(
  { _id: ObjectId("5c9fa42ae5c2dfe9b3729c03") },
  {
    $set: {
      synopsis: "The dwarves, along with Bilbo Baggins and Gandalf the Grey, continue their quest to reclaim Erebor, their homeland, from Smaug. Bilbo Baggins is in possession of a mysterious and magical ring."
    }
  }
);
```

### 3) Add an actor named "Samuel L. Jackson" to "Pulp Fiction"

```js
db.movies.update(
  { _id: ObjectId("5c9f983ce5c2dfe9b3729bfc") },
  { $push: { actors: "Samuel L. Jackson" } }
);
```

---

## Text search (regex)

### 1) Find movies with synopsis containing "Bilbo"

```js
db.movies.find({ synopsis: { $regex: "Bilbo" } });
```

### 2) Find movies with synopsis containing "Gandalf"

```js
db.movies.find({ synopsis: { $regex: "Gandalf" } });
```

### 3) Find synopsis containing "Bilbo" and not containing "Gandalf"

```js
db.movies.find({
  $and: [
    { synopsis: { $regex: "Bilbo" } },
    { synopsis: { $not: /Gandalf/ } }
  ]
});
```

### 4) Find synopsis containing "dwarves" or "hobbit"

```js
db.movies.find({
  $or: [
    { synopsis: { $regex: "dwarves" } },
    { synopsis: { $regex: "hobbit" } }
  ]
});
```

### 5) Find synopsis containing "gold" and "dragon"

```js
db.movies.find({
  $and: [
    { synopsis: { $regex: "gold" } },
    { synopsis: { $regex: "dragon" } }
  ]
});
```

---

## Delete documents

### 1) Delete the movie "Pee Wee Herman's Big Adventure"

```js
db.movies.remove({ _id: ObjectId("5c9f992ae5c2dfe9b3729c00") });
```

### 2) Delete the movie "Avatar"

```js
db.movies.remove({ _id: ObjectId("5c9f9936e5c2dfe9b3729c01") });
```

---

## Relationships

### Insert documents into a `users` collection

#### GoodGuyGreg

```yaml
username: GoodGuyGreg
first_name: "Good Guy"
last_name: "Greg"
```

```js
db.users.insert({ _id: 1, username: "GoodGuyGreg", first_name: "Good Guy", last_name: "Greg" });
```

#### ScumbagSteve

```yaml
username: ScumbagSteve
full_name:
  first: "Scumbag"
  last: "Steve"
```

```js
db.users.insert({ _id: 2, username: "ScumbagSteve", fullname: { first: "Scumbag", last: "Steve" } });
```

---

### Insert documents into a `posts` collection

#### GoodGuyGreg posts

```yaml
username: GoodGuyGreg
title: Passes out at party
body: Wakes up early and cleans house
```

```js
db.posts.insert({ username: "GoodGuyGreg", title: "Passes out at Party", body: "Raises your credit score" });
```

```yaml
username: GoodGuyGreg
title: Steals your identity
body: Raises your credit score
```

```js
db.posts.insert({ username: "GoodGuyGreg", title: "Steals your identity", body: "Raises your credit score" });
```

```yaml
username: GoodGuyGreg
title: Reports a bug in your code
body: Sends you a Pull Request
```

```js
db.posts.insert({ username: "GoodGuyGreg", title: "Reports a bug in your code", body: "Sends you a pull request" });
```

#### ScumbagSteve posts

```yaml
username: ScumbagSteve
title: Borrows something
body: Sells it
```

```js
db.posts.insert({ username: "ScumbagSteve", title: "Borrows something", body: "Sells it" });
```

```yaml
username: ScumbagSteve
title: Borrows everything
body: The end
```

```js
db.posts.insert({ username: "ScumbagSteve", title: "Borrows everything", body: "The end" });
```

```yaml
username: ScumbagSteve
title: Forks your repo on github
body: Sets to private
```

```js
db.posts.insert({ username: "ScumbagSteve", title: "Forks your repo on github", body: "Sets to private" });
```

---

### Insert documents into a `comments` collection

#### Comment by GoodGuyGreg on "Borrows something"

```yaml
username: GoodGuyGreg
comment: Hope you got a good deal!
post: [post_obj_id]
```

```js
db.comments.insert({
  username: "GoodGuyGreg",
  comment: "Hope you got a good deal!",
  post: ObjectId("5ca0b7e96435f98b5901f463")
});
```

#### Comment by GoodGuyGreg on "Borrows everything"

```yaml
username: GoodGuyGreg
comment: What's mine is yours!
post: [post_obj_id]
```

```js
db.comments.insert({
  username: "GoodGuyGreg",
  comment: "What's mine is yours!",
  post: ObjectId("5ca0b9706435f98b5901f46a")
});
```

#### Comment by GoodGuyGreg on "Forks your repo on github"

```yaml
username: GoodGuyGreg
comment: Don't violate the licensing agreement!
post: [post_obj_id]
```

```js
db.comments.insert({
  username: "GoodGuyGreg",
  comment: "Don't violate the licensing agreement!",
  post: ObjectId("5ca0b8766435f98b5901f467")
});
```

#### Comment by ScumbagSteve on "Passes out at party"

```yaml
username: ScumbagSteve
comment: It still isn't clean
post: [post_obj_id]
```

```js
db.comments.insert({
  username: "ScumbagSteve",
  comment: "It still isn't clean",
  post: ObjectId("5ca0b8546435f98b5901f466")
});
```

#### Comment by ScumbagSteve on "Reports a bug in your code"

```yaml
username: ScumbagSteve
comment: Denied your PR cause I found a hack
post: [post_obj_id]
```

```js
db.comments.insert({
  username: "ScumbagSteve",
  comment: "Denied your PR cause I found a hack",
  post: ObjectId("5ca0b9256435f98b5901f469")
});
```

---

## Querying related collections

1. Find all users

```js
db.users.find().pretty();
```

2. Find all posts

```js
db.posts.find().pretty();
```

3. Find all posts authored by "GoodGuyGreg"

```js
db.posts.find({ username: "GoodGuyGreg" });
```

4. Find all posts authored by "ScumbagSteve"

```js
db.posts.find({ username: "ScumbagSteve" });
```

5. Find all comments

```js
db.comments.find().pretty();
```

6. Find all comments authored by "GoodGuyGreg"

```js
db.comments.find({ username: "GoodGuyGreg" });
```

7. Find all comments authored by "ScumbagSteve"

```js
db.comments.find({ username: "ScumbagSteve" });
```

8. Find all comments belonging to the post "Reports a bug in your code"

```js
// You need the ObjectId of the post document for "Reports a bug in your code",
// then query comments by that post id.

// Example:
// const post = db.posts.findOne({ title: "Reports a bug in your code" }, { _id: 1 });
// db.comments.find({ post: post._id }).pretty();
```

---

## Import a CSV to MongoDB

Example documents (JSON lines):

```js
{ "_id" : "02906", "city" : "PROVIDENCE", "pop" : 31069, "state" : "RI", "capital" : { "name" : "Providence", "electoralCollege" : 4 } }
{ "_id" : "02108", "city" : "BOSTON", "pop" : 3697, "state" : "MA", "capital" : { "name" : "Boston", "electoralCollege" : 11 } }
{ "_id" : "10001", "city" : "NEW YORK", "pop" : 18913, "state" : "NY", "capital" : { "name" : "Albany", "electoralCollege" : 29 } }
{ "_id" : "01012", "city" : "CHESTERFIELD", "pop" : 177, "state" : "MA", "capital" : { "name" : "Boston", "electoralCollege" : 11 } }
{ "_id" : "32801", "city" : "ORLANDO", "pop" : 9275, "state" : "FL", "capital" : { "name" : "Tallahassee", "electoralCollege" : 29 } }
{ "_id" : "12966", "city" : "BANGOR", "pop" : 2867, "state" : "NY", "capital" : { "name" : "Albany", "electoralCollege" : 29 } }
{ "_id" : "32920", "city" : "CAPE CANAVERAL", "pop" : 7655, "state" : "FL", "capital" : { "name" : "Tallahassee", "electoralCollege" : 29 } }
{ "_id" : "NY", "name" : "New York", "pop" : 28300000, "state" : 1788 }
{ "_id" : "33125", "city" : "MIAMI", "pop" : 47761, "state" : "FL", "capital" : { "name" : "Tallahassee", "electoralCollege" : 29 } }
{ "_id" : "RI", "name" : "Rhode Island", "pop" : 1060000, "state" : 1790 }
{ "_id" : "MA", "name" : "Massachusetts", "pop" : 6868000, "state" : 1790 }
{ "_id" : "FL", "name" : "Florida", "pop" : 6800000, "state" : 1845 }
{ "_id" : "1", "name" : "Tom", "addresses" : [ "01001", "12997" ] }
{ "_id" : "02907", "city" : "CRANSTON", "pop" : 25668, "state" : "RI", "capital" : { "name" : "Providence", "electoralCollege" : 4 } }
{ "_id" : "2", "name" : "Bill", "addresses" : [ "01001", "12967", "32920" ] }
{ "_id" : "3", "name" : "Mary", "addresses" : [ "32801", "32920", "33125" ] }
{ "_id" : "12967", "city" : "NORTH LAWRENCE", "pop" : 943, "state" : "NY", "capital" : { "name" : "Albany", "electoralCollege" : 29 } }
{ "_id" : "01001", "city" : "AGAWAM", "pop" : 15338, "state" : "MA", "capital" : { "name" : "Boston", "electoralCollege" : 11 } }
{ "_id" : "12997", "city" : "WILMINGTON", "pop" : 958, "state" : "NY", "capital" : { "name" : "Albany", "electoralCollege" : 29 } }
```

Import command:

```bash
mongoimport --db <database_name> --collection <collection_name> --file <drag file here>
```

### 1) Show name and population of cities where population > 10000

```js
db.docs.find(
  { city: { $exists: true }, pop: { $gt: 10000 } },
  { _id: 0, city: 1, pop: 1 }
);
```

### 2) Show the name and population of each state based on the cities shown

```js
db.docs.aggregate([
  { $match: { city: { $exists: true } } },
  { $group: { _id: "$state", "Total Pop": { $sum: "$pop" } } }
]);
```

### 3) Show the total cities in NY as 'Population'

```js
db.docs.aggregate([
  { $match: { state: "NY" } },
  { $group: { _id: "$state", "Total Pop": { $sum: "$pop" } } }
]);
```

### 4) Show the _id, city, and capital name of each city with population > 20,000

```js
db.docs.find(
  { city: { $exists: true }, pop: { $gt: 20000 } },
  { city: 1, "capital.name": 1 }
);
```
