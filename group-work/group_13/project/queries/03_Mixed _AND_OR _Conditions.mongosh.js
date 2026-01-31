// Esta query combina condições alternativas (OR) com condições obrigatórias (AND).
// É útil para encontrar vinhos que tenham pelo menos uma característica desejada,
// mas que também respeitem limites técnicos importantes.

db.wine.find({

  // Bloco OR: pelo menos uma destas condições deve ser verdadeira
  $or: [
    { type: "red" },               // O vinho é tinto
    { alcohol: { $gte: 12.5 } },   // Ou tem teor alcoólico igual ou superior a 12.5%
    { quality: { $gte: 7 } }       // Ou tem qualidade igual ou superior a 7
  ],

  // Bloco AND: todas estas condições devem ser verdadeiras
  $and: [
    { density: { $lte: 1.002 } },         // Densidade máxima de 1.002 (vinhos mais leves)
    { volatile_acidity: { $lte: 0.7 } },  // Acidez volátil controlada
    { sulphates: { $gte: 0.3 } },         // Sulfatos mínimos de 0.3
    { chlorides: { $lte: 0.12 } }         // Cloretos até 0.12 (baixo teor de salinidade)
  ],

  // Condições adicionais fora dos blocos lógicos
  pH: { $gte: 3.0, $lte: 3.6 },           // pH entre 3.0 e 3.6 (acidez equilibrada)
  residual_sugar: { $gte: 1, $lte: 12 }   // Açúcar residual entre 1 e 12 g/L

})
