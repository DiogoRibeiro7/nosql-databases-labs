# MongoDB Aggregation Pipeline Examples

This document shows MongoDB aggregation examples for key pipeline stages.

We will use two collections:

- `universities`
- `courses`

> Note: the data is not real.

---

## Sample data

### `universities` documents

```js
{
  country: 'Spain',
  city: 'Salamanca',
  name: 'USAL',
  location: {
    type: 'Point',
    coordinates: [ -5.6722512, 17, 40.9607792 ]
  },
  students: [
    { year: 2014, number: 24774 },
    { year: 2015, number: 23166 },
    { year: 2016, number: 21913 },
    { year: 2017, number: 21715 }
  ]
}

{
  country: 'Spain',
  city: 'Salamanca',
  name: 'UPSA',
  location: {
    type: 'Point',
    coordinates: [ -5.6691191, 17, 40.9631732 ]
  },
  students: [
    { year: 2014, number: 4788 },
    { year: 2015, number: 4821 },
    { year: 2016, number: 6550 },
    { year: 2017, number: 6125 }
  ]
}
```

### Insert `universities`

```js
use 3tdb

db.universities.insertMany([
  {
    country: 'Spain',
    city: 'Salamanca',
    name: 'USAL',
    location: {
      type: 'Point',
      coordinates: [ -5.6722512, 17, 40.9607792 ]
    },
    students: [
      { year: 2014, number: 24774 },
      { year: 2015, number: 23166 },
      { year: 2016, number: 21913 },
      { year: 2017, number: 21715 }
    ]
  },
  {
    country: 'Spain',
    city: 'Salamanca',
    name: 'UPSA',
    location: {
      type: 'Point',
      coordinates: [ -5.6691191, 17, 40.9631732 ]
    },
    students: [
      { year: 2014, number: 4788 },
      { year: 2015, number: 4821 },
      { year: 2016, number: 6550 },
      { year: 2017, number: 6125 }
    ]
  }
]);
```

---

### `courses` documents

```js
{
  university: 'USAL',
  name: 'Computer Science',
  level: 'Excellent'
}

{
  university: 'USAL',
  name: 'Electronics',
  level: 'Intermediate'
}

{
  university: 'USAL',
  name: 'Communication',
  level: 'Excellent'
}
```

### Insert `courses`

```js
db.courses.insertMany([
  {
    university: "USAL",
    name: "Computer Science",
    level: "Excellent",
  },
  {
    university: "USAL",
    name: "Electronics",
    level: "Intermediate",
  },
  {
    university: "USAL",
    name: "Communication",
    level: "Excellent",
  },
]);
```

---

# Aggregation stages

## $match

Filter documents by conditions.

```js
db.universities.aggregate([{ $match: { country: "Spain", city: "Salamanca" } }]).pretty();
```

**Output (example):**

```js
{
  "_id" : ObjectId("..."),
  "country" : "Spain",
  "city" : "Salamanca",
  "name" : "USAL",
  "location" : {
    "type" : "Point",
    "coordinates" : [ -5.6722512, 17, 40.9607792 ]
  },
  "students" : [
    { "year" : 2014, "number" : 24774 },
    { "year" : 2015, "number" : 23166 },
    { "year" : 2016, "number" : 21913 },
    { "year" : 2017, "number" : 21715 }
  ]
}

{
  "_id" : ObjectId("..."),
  "country" : "Spain",
  "city" : "Salamanca",
  "name" : "UPSA",
  "location" : {
    "type" : "Point",
    "coordinates" : [ -5.6691191, 17, 40.9631732 ]
  },
  "students" : [
    { "year" : 2014, "number" : 4788 },
    { "year" : 2015, "number" : 4821 },
    { "year" : 2016, "number" : 6550 },
    { "year" : 2017, "number" : 6125 }
  ]
}
```

---

## $project

Return only the fields you need (and optionally computed fields).

```js
db.universities.aggregate([{ $project: { _id: 0, country: 1, city: 1, name: 1 } }]).pretty();
```

**Output:**

```js
{ "country" : "Spain", "city" : "Salamanca", "name" : "USAL" }
{ "country" : "Spain", "city" : "Salamanca", "name" : "UPSA" }
```

Notes:

- Explicitly set `_id: 0` if you do not want `_id`.
- For other fields, specifying `1` is enough.

---

## $group

Aggregate / summarize: counts, totals, averages, maximums, etc.

Example: number of documents per university.

```js
db.universities.aggregate([{ $group: { _id: "$name", totaldocs: { $sum: 1 } } }]).pretty();
```

**Output:**

```js
{ "_id" : "UPSA", "totaldocs" : 1 }
{ "_id" : "USAL", "totaldocs" : 1 }
```

### Common $group operators

| Operator | Meaning                                            |
| -------- | -------------------------------------------------- |
| `$count` | Calculates the quantity of documents in the group. |
| `$max`   | Maximum value of a field in the group.             |
| `$min`   | Minimum value of a field in the group.             |
| `$avg`   | Average value of a field in the group.             |
| `$sum`   | Sums values across the group.                      |
| `$push`  | Pushes values into an array in the group output.   |

---

## $out

Write aggregation results to a new collection (must be the last stage).

```js
db.universities.aggregate([
  { $group: { _id: "$name", totaldocs: { $sum: 1 } } },
  { $out: "aggResults" },
]);

// Check the new collection

db.aggResults.find().pretty();
```

**Output:**

```js
{ "_id" : "UPSA", "totaldocs" : 1 }
{ "_id" : "USAL", "totaldocs" : 1 }
```

---

## $unwind

Turn each element of an array into a separate output document.

Example: unwind `students` only for USAL.

```js
db.universities.aggregate([{ $match: { name: "USAL" } }, { $unwind: "$students" }]).pretty();
```

**Output (example):**

```js
{ "name" : "USAL", "students" : { "year" : 2014, "number" : 24774 }, ... }
{ "name" : "USAL", "students" : { "year" : 2015, "number" : 23166 }, ... }
{ "name" : "USAL", "students" : { "year" : 2016, "number" : 21913 }, ... }
{ "name" : "USAL", "students" : { "year" : 2017, "number" : 21715 }, ... }
```

---

## $sort

Sort by a specific field.

Example: unwind USAL students, project year/number, then sort by number descending.

```js
db.universities
  .aggregate([
    { $match: { name: "USAL" } },
    { $unwind: "$students" },
    { $project: { _id: 0, "students.year": 1, "students.number": 1 } },
    { $sort: { "students.number": -1 } },
  ])
  .pretty();
```

**Output:**

```js
{ "students" : { "year" : 2014, "number" : 24774 } }
{ "students" : { "year" : 2015, "number" : 23166 } }
{ "students" : { "year" : 2016, "number" : 21913 } }
{ "students" : { "year" : 2017, "number" : 21715 } }
```

---

## $limit

Keep only the first N results.

```js
db.universities
  .aggregate([
    { $match: { name: "USAL" } },
    { $unwind: "$students" },
    { $project: { _id: 0, "students.year": 1, "students.number": 1 } },
    { $sort: { "students.number": -1 } },
    { $limit: 2 },
  ])
  .pretty();
```

**Output:**

```js
{ "students" : { "year" : 2014, "number" : 24774 } }
{ "students" : { "year" : 2015, "number" : 23166 } }
```

Note: if you want the “top N” from sorted results, use `$limit` immediately after `$sort`.

---

## $addFields

Add fields to the output documents.

```js
db.universities
  .aggregate([{ $match: { name: "USAL" } }, { $addFields: { foundation_year: 1218 } }])
  .pretty();
```

**Output (example):**

```js
{ "name" : "USAL", "foundation_year" : 1218, ... }
```

---

## $count

Count the number of output documents from previous stages.

```js
db.universities.aggregate([{ $unwind: "$students" }, { $count: "total_documents" }]).pretty();
```

**Output:**

```js
{ "total_documents" : 8 }
```

---

## $lookup

Join data across collections.

Example: for USAL, add matching courses.

```js
db.universities
  .aggregate([
    { $match: { name: "USAL" } },
    { $project: { _id: 0, name: 1 } },
    {
      $lookup: {
        from: "courses",
        localField: "name",
        foreignField: "university",
        as: "courses",
      },
    },
  ])
  .pretty();
```

**Output (example):**

```js
{
  "name" : "USAL",
  "courses" : [
    { "university" : "USAL", "name" : "Computer Science", "level" : "Excellent", ... },
    { "university" : "USAL", "name" : "Electronics", "level" : "Intermediate", ... },
    { "university" : "USAL", "name" : "Communication", "level" : "Excellent", ... }
  ]
}
```

Indexing tip:

- Index `universities.name`
- Index `courses.university`

---

## $sortByCount

Shortcut for: group by a field, count, then sort descending.

Example: number of courses per level.

```js
db.courses.aggregate([{ $sortByCount: "$level" }]).pretty();
```

**Output:**

```js
{ "_id" : "Excellent", "count" : 2 }
{ "_id" : "Intermediate", "count" : 1 }
```

---

## $facet

Run multiple pipelines on the same input and return multiple “reports”.

Example: for USAL, build two outputs:

- `countingLevels`: count courses per level
- `yearWithLessStudents`: year with the fewest students

```js
db.universities
  .aggregate([
    { $match: { name: "USAL" } },
    {
      $lookup: {
        from: "courses",
        localField: "name",
        foreignField: "university",
        as: "courses",
      },
    },
    {
      $facet: {
        countingLevels: [{ $unwind: "$courses" }, { $sortByCount: "$courses.level" }],
        yearWithLessStudents: [
          { $unwind: "$students" },
          { $project: { _id: 0, students: 1 } },
          { $sort: { "students.number": 1 } },
          { $limit: 1 },
        ],
      },
    },
  ])
  .pretty();
```

**Output (example):**

```js
{
  "countingLevels" : [
    { "_id" : "Excellent", "count" : 2 },
    { "_id" : "Intermediate", "count" : 1 }
  ],
  "yearWithLessStudents" : [
    { "students" : { "year" : 2017, "number" : 21715 } }
  ]
}
```

---

# Exercise

## Total number of students (total alumni) per university

```js
db.universities
  .aggregate([
    { $unwind: "$students" },
    { $group: { _id: "$name", totalalumni: { $sum: "$students.number" } } },
  ])
  .pretty();
```

**Output:**

```js
{ "_id" : "UPSA", "totalalumni" : 22284 }
{ "_id" : "USAL", "totalalumni" : 91568 }
```

## Sort by total alumni descending

```js
db.universities
  .aggregate([
    { $unwind: "$students" },
    { $group: { _id: "$name", totalalumni: { $sum: "$students.number" } } },
    { $sort: { totalalumni: -1 } },
  ])
  .pretty();
```

---

# Performance notes

- Prefer `$match` before `$sort` to reduce how many documents need sorting.
- To take advantage of indexes, use `$match` and/or `$sort` early in the pipeline.
- You can inspect the plan with `explain`:

```js
const pipeline = [ /* ... */ ];

db.<collectionName>.aggregate(pipeline, { explain: true });
```
