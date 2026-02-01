// Melhor aluno por disciplina
// Usage: mongosh queries/14_melhor_aluno_por_disciplina.mongosh.js

db = db.getSiblingDB("group_08_school_final");
print("Melhor aluno por disciplina:");
db.grades.aggregate([
  { $sort: { subjectCode: 1, score: -1 } },
  {
    $group: {
      _id: "$subjectCode",
      bestScore: { $first: "$score" },
      studentCode: { $first: "$studentCode" }
    }
  },
  {
    $lookup: {
      from: "students",
      localField: "studentCode",
      foreignField: "studentCode",
      as: "student"
    }
  },
  { $unwind: "$student" },
  {
    $lookup: {
      from: "subjects",
      localField: "_id",
      foreignField: "subjectCode",
      as: "subject"
    }
  },
  { $unwind: "$subject" },
  {
    $project: {
      _id: 0,
      subject: "$subject.name",
      student: "$student.name",
      bestScore: 1
    }
  }
]).forEach(doc => printjson(doc));
