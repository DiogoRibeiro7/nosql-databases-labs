// Disciplinas com 4+ créditos e quantos alunos faltam avaliar.
// Usage: mongosh queries/07_disciplinas_sem_avaliacoes.mongosh.js

db = db.getSiblingDB("group_08_school_final");
print("Disciplinas importantes (4+ créditos) com avaliações em falta:");
db.subjects
  .aggregate([
    // Filtrar disciplinas com 4 ou mais créditos
    { $match: { credits: { $gte: 4 } } }, //$match = WHERE em SQL
    //  $lookup (JOIN em SQL) com grades para ver quantos têm nota
    {
      $lookup: {
        from: "grades",
        localField: "subjectCode",
        foreignField: "subjectCode",
        as: "enrolledGrades",
      },
    },
    // Calcula quantos faltam
    {
      $project: { 
        _id: 0,
        subjectName: "$name",
        subjectCode: 1,
        credits: 1,
        teacher: 1,
        enrolledStudents: { $size: "$enrolledGrades" }, // $size conta elementos no array
        missingEnrollments: { $subtract: [10, { $size: "$enrolledGrades" }] }, // Assumindo 10 alunos total
      },
    },
    // Ordena por mais alunos em falta
    { $sort: { missingEnrollments: -1 } },
  ])
  .forEach((doc) => printjson(doc));
