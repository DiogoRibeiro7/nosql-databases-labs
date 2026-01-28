// Alunos que nunca tiveram nota abaixo de 80
// Usage: mongosh queries/11_alunos_sem_nota_abaixo_80.mongosh.js

db = db.getSiblingDB("group_08_school_final");
print("Alunos que nunca tiveram nota abaixo de 80:");
db.students.aggregate([
  {
    $lookup: {
      from: "grades",
      localField: "studentCode",
      foreignField: "studentCode",
      as: "grades"
    }
  },
  {
    $match: {
      "grades.score": { $not: { $lt: 80 } } // Nenhuma nota < 80
    }
  },
  {
    $project: {
      _id: 0,
      studentCode: 1,
      name: 1,
      grades: 1
    }
  }
]).forEach(doc => printjson(doc));
