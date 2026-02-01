// Alunos com pelo menos 2 disciplinas com nota acima de 90
// Usage: mongosh queries/12_alunos_com_2_notas_acima_90.mongosh.js

db = db.getSiblingDB("group_08_school_final");
print("Alunos com pelo menos 2 notas acima de 90:");
db.grades.aggregate([
  { $match: { score: { $gt: 90 } } },
  { $group: { _id: "$studentCode", count: { $sum: 1 } } },
  { $match: { count: { $gte: 2 } } },
  {
    $lookup: {
      from: "students",
      localField: "_id",
      foreignField: "studentCode",
      as: "student"
    }
  },
  { $unwind: "$student" },
  { $project: { _id: 0, studentCode: "$_id", name: "$student.name", count: 1 } }
]).forEach(doc => printjson(doc));

//Nenhum aluno encontrado com 2 ou mais notas acima de 90
