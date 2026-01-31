// Estatísticas completas por disciplina (média, máximo, mínimo, range).
// Usage: mongosh queries/03_estatisticas_por_disciplina.mongosh.js

db = db.getSiblingDB("group_08_school_final");
print("Estatísticas por disciplina:");
db.grades
  .aggregate([
    // Agrupar por disciplina com notas
    {
      $group: {
        _id: "$subjectCode",
        avgScore: { $avg: "$score" },
        maxScore: { $max: "$score" },
        minScore: { $min: "$score" },
        totalStudents: { $sum: 1 },
        scores: { $push: "$score" },
      },
    },
    // $lookup (JOIN em SQL) com subjects para nome e detalhes da disciplina
    {
      $lookup: {
        from: "subjects",
        localField: "_id",
        foreignField: "subjectCode",
        as: "subjectInfo",
      },
    },
    { $unwind: "$subjectInfo" },
    // Formata output com range de notas
    {
      $project: {
        _id: 0,
        subjectName: "$subjectInfo.name",
        teacher: "$subjectInfo.teacher",
        credits: "$subjectInfo.credits",
        avgScore: { $round: ["$avgScore", 2] },
        maxScore: 1,
        minScore: 1,
        totalStudents: 1,
        scoreRange: { $subtract: ["$maxScore", "$minScore"] },
      },
    },
    { $sort: { avgScore: -1 } },
  ])
  .forEach((doc) => printjson(doc));
