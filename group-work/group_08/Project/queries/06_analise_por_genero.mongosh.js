// Distribuição de estudantes e média de notas por género.
// Usage: mongosh queries/06_analise_por_genero.mongosh.js

db = db.getSiblingDB("group_08_school_final");
print("Análise estatística por género:");
db.students
  .aggregate([
    //  $lookup (JOIN em SQL) com grades para obter notas
    {
      $lookup: {
        from: "grades",
        localField: "studentCode",
        foreignField: "studentCode",
        as: "grades",
      },
    },
    // Calcular por estudante
    {
      $project: {
        gender: 1,
        avgScore: { $avg: "$grades.score" },
        totalGrades: { $size: "$grades" },
      },
    },
    // Agrupar por género
    // Media
    // Quantas notas
    {
      $group: {
        _id: "$gender",
        count: { $sum: 1 },
        avgScoreByGender: { $avg: "$avgScore" },
        totalGradesRecorded: { $sum: "$totalGrades" },
      },
    },
    // Formata output
    // Nomes legíveis
    // Média arredondada
    {
      $project: {
        _id: 0,
        gender: "$_id",
        studentCount: "$count",
        avgScore: { $round: ["$avgScoreByGender", 2] },
        totalGradesRecorded: 1,
      },
    },
  ])
  .forEach((doc) => printjson(doc));
