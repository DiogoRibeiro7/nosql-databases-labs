// Dashboard resumo geral do sistema escolar usando $facet para múltiplas agregações.
// Usage: mongosh queries/10_dashboard_resumo_geral.mongosh.js

db = db.getSiblingDB("group_08_school_final");
print("Dashboard - Resumo Geral do Sistema Escolar:");
db.grades
  .aggregate([
    {
      $facet: { // $facet permite múltiplas pipelines paralelas
        // Pipeline 1: Estatísticas gerais
        generalStats: [
          {
            $group: {
              _id: null,
              totalGrades: { $sum: 1 },
              overallAverage: { $avg: "$score" },
              highestScore: { $max: "$score" },
              lowestScore: { $min: "$score" },
            },
          },
          {
            $project: {
              _id: 0,
              totalGradesRecorded: "$totalGrades",
              schoolAverage: { $round: ["$overallAverage", 2] },
              highestScore: 1,
              lowestScore: 1,
            },
          },
        ],
        // Pipeline 2: Distribuição por faixa de notas
        gradeDistribution: [
          {
            $bucket: { // $bucket cria faixas de valores
              groupBy: "$score",
              boundaries: [0, 50, 60, 70, 80, 90, 101],
              default: "Other",
              output: {
                count: { $sum: 1 },
                students: { $push: "$studentCode" },
              },
            },
          },
          {
            $project: {
              _id: 0,
              range: {
                $switch: { // $switch para nomes legíveis
                  branches: [
                    { case: { $eq: ["$_id", 0] }, then: "0-29 (Negativa)" },
                    { case: { $eq: ["$_id", 50] }, then: "30-59 (Nao Satisfaz)" },
                    { case: { $eq: ["$_id", 60] }, then: "60-69 (Satisfaz)" },
                    { case: { $eq: ["$_id", 70] }, then: "70-79 (Bom)" },
                    { case: { $eq: ["$_id", 80] }, then: "80-89 (Muito Bom)" },
                    { case: { $eq: ["$_id", 90] }, then: "90-100 (Excelente)" },
                  ],
                },
              },
              count: 1,
            },
          },
        ],
        // Pipeline 3: Contagem de entidades únicas
        entityCounts: [
          {
            $group: {
              _id: null,
              uniqueStudents: { $addToSet: "$studentCode" },
              uniqueSubjects: { $addToSet: "$subjectCode" },
            },
          },
          {
            $project: {
              _id: 0,
              studentsWithGrades: { $size: "$uniqueStudents" },
              subjectsWithGrades: { $size: "$uniqueSubjects" },
            },
          },
        ],
      },
    },
    // Combina resultados das 3 pipelines
    {
      $project: {
        summary: { $arrayElemAt: ["$generalStats", 0] },
        gradeDistribution: 1,
        counts: { $arrayElemAt: ["$entityCounts", 0] },
      },
    },
  ])
  .forEach((doc) => printjson(doc));
