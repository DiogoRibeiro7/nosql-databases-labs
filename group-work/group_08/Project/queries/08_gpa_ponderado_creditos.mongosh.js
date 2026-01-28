// Cálculo de GPA ponderado considerando os créditos de cada disciplina.
// Usage: mongosh queries/08_gpa_ponderado_creditos.mongosh.js

db = db.getSiblingDB("group_08_school_final");
print("GPA ponderado por créditos:");
db.grades
  .aggregate([
    // JOIN com subjects para obter créditos
    {
      $lookup: {
        from: "subjects",
        localField: "subjectCode",
        foreignField: "subjectCode",
        as: "subject",
      },
    },
    { $unwind: "$subject" }, // Desmonta array do $lookup
    // JOIN com students para nome
    {
      $lookup: {
        from: "students",
        localField: "studentCode",
        foreignField: "studentCode",
        as: "student",
      },
    },
    { $unwind: "$student" },
    // Calcula soma ponderada (nota * créditos)
    {
      $group: {
        _id: {
          studentCode: "$studentCode",
          studentName: "$student.name",
        },
        weightedSum: {
          $sum: { $multiply: ["$score", "$subject.credits"] },
        },
        totalCredits: { $sum: "$subject.credits" },
      },
    },
    // Calcula GPA = soma ponderada / total créditos
    {
      $project: {
        _id: 0,
        studentCode: "$_id.studentCode",
        studentName: "$_id.studentName",
        weightedGPA: {
          $round: [{ $divide: ["$weightedSum", "$totalCredits"] }, 2],
        },
        totalCredits: 1,
      },
    },
    { $sort: { weightedGPA: -1 } },
  ])
  .forEach((doc) => printjson(doc));
