// Análise de desempenho dos alunos por professor.
// Usage: mongosh queries/09_desempenho_por_professor.mongosh.js

db = db.getSiblingDB("group_08_school_final");
print("Desempenho dos alunos por professor:");
db.grades
  .aggregate([
    // JOIN com subjects para obter professor
    {
      $lookup: {
        from: "subjects",
        localField: "subjectCode",
        foreignField: "subjectCode",
        as: "subject",
      },
    },
    { $unwind: "$subject" },
    // Agrupa por professor
    {
      $group: {
        _id: "$subject.teacher",
        subjectsTaught: { $addToSet: "$subject.name" },
        avgStudentScore: { $avg: "$score" },
        totalStudentsGraded: { $sum: 1 },
        highestScore: { $max: "$score" },
        lowestScore: { $min: "$score" },
      },
    },
    // Formata output com range de notas
    {
      $project: {
        _id: 0,
        teacher: "$_id",
        subjects: "$subjectsTaught",
        avgScore: { $round: ["$avgStudentScore", 2] },
        studentsGraded: "$totalStudentsGraded",
        scoreRange: {
          highest: "$highestScore",
          lowest: "$lowestScore",
        },
      },
    },
    { $sort: { avgScore: -1 } },
  ])
  .forEach((doc) => printjson(doc));
