// Esta query combina condições alternativas (OR) com condições obrigatórias (AND).
// É útil para encontrar vinhos que tenham pelo menos uma característica desejada,
// mas que também respeitem limites técnicos importantes.

db.wine.find({

  // Bloco OR: pelo menos uma destas condições deve ser verdadeira
  $or: [
    { type: "red" },                   // O vinho é tinto
    { quality: { $gte: 7 } },          // Ou tem qualidade igual ou superior a 7
    { alcohol: { $gte: 12 } }          // Ou tem teor alcoólico igual ou superior a 12%
  ],

  // Bloco AND: todas estas condições devem ser verdadeiras
  $and: [
    { density: { $lte: 1.005 } },      // Densidade máxima de 1.005 (vinhos mais leves)
    { pH: { $gte: 3.0 } },             // pH mínimo de 3.0 (acidez equilibrada)
    { sulphates: { $gte: 0.4 } },      // Sulfatos mínimos de 0.4 (preservação adequada)
    { chlorides: { $lte: 0.12 } }      // Cloretos até 0.12 (baixo teor de salinidade)
  ]

})

