// Relatório completo de um estudante com JOIN múltiplo (3 coleções).
// Usage: mongosh queries/04_relatorio_completo_estudante.mongosh.js

db = db.getSiblingDB("group_08_school_final");
print("Relatório completo do estudante STU-001:");
db.students
  .aggregate([
    // Filtra estudante específico (alterar código conforme necessário)
    { $match: { studentCode: "STU-001" } },
    //  $lookup (JOIN em SQL) com grades
    {
      $lookup: {
        from: "grades",
        localField: "studentCode",
        foreignField: "studentCode",
        as: "grades",
      },
    },
    { $unwind: "$grades" },
    //  $lookup (JOIN em SQL) com subjects para detalhes da disciplina
    {
      $lookup: {
        from: "subjects",
        localField: "grades.subjectCode",
        foreignField: "subjectCode",
        as: "subjectInfo",
      },
    },
    { $unwind: "$subjectInfo" },
    // Reagrupar com todas as disciplinas do aluno
    {
      $group: {
        _id: {
          studentCode: "$studentCode",
          name: "$name",
          email: "$email",
        },
        subjects: {
          $push: {
            subject: "$subjectInfo.name",
            teacher: "$subjectInfo.teacher",
            credits: "$subjectInfo.credits",
            score: "$grades.score",
          },
        },
        totalCredits: { $sum: "$subjectInfo.credits" },
        avgScore: { $avg: "$grades.score" },
      },
    },
    // Formata output final
    {
      $project: {
        _id: 0,
        studentCode: "$_id.studentCode",
        name: "$_id.name",
        email: "$_id.email",
        subjects: 1,
        totalCredits: 1,
        avgScore: { $round: ["$avgScore", 2] },
      },
    },
  ])
  .forEach((doc) => printjson(doc));
