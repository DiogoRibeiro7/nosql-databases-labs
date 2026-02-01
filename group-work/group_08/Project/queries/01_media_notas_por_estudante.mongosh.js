// Média de notas por estudante com nome usando $lookup (JOIN).
// Usage: mongosh queries/01_media_notas_por_estudante.mongosh.js

db = db.getSiblingDB("group_08_school_final");
print("Média de notas por estudante:");
db.grades
  .aggregate([
    // Agrupa notas por estudante calculando estatísticas
    {
      $group: {
        _id: "$studentCode",
        averageScore: { $avg: "$score" },
        totalSubjects: { $sum: 1 },
        maxScore: { $max: "$score" },
        minScore: { $min: "$score" },
      },
    },
    // $lookup (JOIN em SQL) com coleção students
    {
      $lookup: {
        from: "students",
        localField: "_id",
        foreignField: "studentCode",
        as: "studentInfo",
      },
    },
    { $unwind: "$studentInfo" },

    {
      $project: { // $project = SELECT em SQL
        _id: 0,
        studentCode: "$_id",
        studentName: "$studentInfo.name",
        averageScore: { $round: ["$averageScore", 2] },
        totalSubjects: 1,
        maxScore: 1,
        minScore: 1,
      },
    },
    // Ordena por média decrescente
    { $sort: { averageScore: -1 } },
  ])
  .forEach((doc) => printjson(doc));
