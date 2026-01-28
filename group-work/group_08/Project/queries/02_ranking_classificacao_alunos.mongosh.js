// Ranking de alunos com classificação baseada na média (Excelente/Bom/Satisfatório/Aprovado/Reprovado).
// Usage: mongosh queries/02_ranking_classificacao_alunos.mongosh.js

db = db.getSiblingDB("group_08_school_final");
print("Ranking de alunos com classificação:");
db.grades
  .aggregate([
    // Calcula média por estudante
    {
      $group: {
        _id: "$studentCode",
        averageScore: { $avg: "$score" },
      },
    },
    // $lookup (JOIN em SQL) com students
    {
      $lookup: {
        from: "students",
        localField: "_id",
        foreignField: "studentCode",
        as: "student",
      },
    },
    { $unwind: "$student" },
    // Atribui classificação baseada na média
    {
      $project: {
        _id: 0,
        studentName: "$student.name",
        email: "$student.email",
        averageScore: { $round: ["$averageScore", 2] },
        status: {
          $switch: {
            branches: [
              { case: { $gte: ["$averageScore", 90] }, then: "Excelente" },
              { case: { $gte: ["$averageScore", 80] }, then: "Muito Bom" },
              { case: { $gte: ["$averageScore", 70] }, then: "Bom" },
              { case: { $gte: ["$averageScore", 50] }, then: "Satisfaz" },
            ],
            default: "Nao Satisfaz",
          },
        },
      },
    },
    { $sort: { averageScore: -1 } },
  ])
  .forEach((doc) => printjson(doc));
