// Top 3 melhores alunos por cada disciplina.
// Usage: mongosh queries/05_top3_alunos_por_disciplina.mongosh.js

db = db.getSiblingDB("group_08_school_final");
print("Top 3 alunos por disciplina:");
db.grades
  .aggregate([
    //  $lookup (JOIN em SQL) com disciplinas   
    {
      $lookup: {
        from: "subjects",
        localField: "subjectCode",
        foreignField: "subjectCode",
        as: "subject",
      },
    },
    { $unwind: "$subject" },
    //  $lookup (JOIN em SQL) com students
    {
      $lookup: {
        from: "students",
        localField: "studentCode",
        foreignField: "studentCode",
        as: "student",
      },
    },
    { $unwind: "$student" },
    // Ordena por disciplina e nota decrescente (-1 = desc no MongoDB)
    { $sort: { "subject.name": 1, score: -1 } },
    // Agrupae por disciplina com lista de alunos
    {
      $group: {
        _id: "$subject.name",
        topStudents: {
          $push: {
            name: "$student.name",
            score: "$score",
          },
        },
      },
    },
    // Seleciona apenas top 3
    {
      $project: {
        _id: 0,
        subject: "$_id",
        top3: { $slice: ["$topStudents", 3] }, // Pega os 3 primeiros
      },
    },
    { $sort: { subject: 1 } },
  ])
  .forEach((doc) => printjson(doc));
