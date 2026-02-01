// Estudantes com média de notas acima de 80
// Usage: mongosh queries/13_estudantes_media_acima_80.mongosh.js

db = db.getSiblingDB("group_08_school_final");
print("Estudantes com média de notas acima de 80:");
db.grades.aggregate([
  { $group: { _id: "$studentCode", avgScore: { $avg: "$score" } } },
  { $match: { avgScore: { $gt: 80 } } },
  {
    $lookup: {
      from: "students",
      localField: "_id",
      foreignField: "studentCode",
      as: "student"
    }
  },
  { $unwind: "$student" },
  { $project: { _id: 0, studentCode: "$_id", name: "$student.name", avgScore: { $round: ["$avgScore", 2] } } }
]).forEach(doc => printjson(doc));
