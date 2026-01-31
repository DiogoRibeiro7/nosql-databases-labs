db = db.getSiblingDB("lab_results");
print("Top 10 Oldest Patients:");
db.patients
  .aggregate([
    {
      $sort: { "demographics.age": -1 },
    },
    {
      $limit: 10,
    },
    {
      $project: {
        _id: 0,
        Name: "$demographics.full_name",
        Age: "$demographics.age",
        BirthDate: "$demographics.date_of_birth",
      },
    },
  ])
  .forEach((doc) => printjson(doc));
