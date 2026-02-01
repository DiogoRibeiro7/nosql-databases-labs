// $facet: alunos e disciplinas com média acima de 85
// Usage: mongosh queries/15_facet_alunos_disciplinas_acima_85.mongosh.js

db = db.getSiblingDB("group_08_school_final");
print("Resumo: alunos e disciplinas com média > 85 (usando $facet):");
db.grades.aggregate([
  {
    $facet: {
      alunos: [
        { $group: { _id: "$studentCode", avgScore: { $avg: "$score" } } },
        { $match: { avgScore: { $gt: 85 } } },
        { $count: "alunosComMediaAcima85" }
      ],
      disciplinas: [
        { $group: { _id: "$subjectCode", avgScore: { $avg: "$score" } } },
        { $match: { avgScore: { $gt: 85 } } },
        { $count: "disciplinasComMediaAcima85" }
      ]
    }
  }
]).forEach(doc => printjson(doc));
