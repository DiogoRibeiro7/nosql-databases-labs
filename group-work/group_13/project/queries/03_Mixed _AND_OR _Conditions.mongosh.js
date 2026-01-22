// Esta query demonstra como combinar vários blocos AND e OR dentro de um único
// find(). Continua simples, mas a estrutura é longa e muito descritiva, ideal
// para relatórios académicos.

db.wine.find({

  // Bloco OR: pelo menos uma destas condições deve ser verdadeira
  $or: [
    { type: "red" },               // vinho tinto
    { alcohol: { $gte: 12.5 } },   // teor alcoólico elevado
    { quality: { $gte: 7 } }       // qualidade alta
  ],

  // Bloco AND: todas estas condições devem ser verdadeiras
  $and: [
    { density: { $lte: 1.002 } },      // densidade baixa
    { volatile_acidity: { $lte: 0.7 } },// acidez volátil controlada
    { sulphates: { $gte: 0.3 } },       // sulfatos moderados
    { chlorides: { $lte: 0.12 } }       // cloretos baixos
  ],

  // Restrições adicionais simples
  pH: { $gte: 3.0, $lte: 3.6 },
  residual_sugar: { $gte: 1, $lte: 12 }

})

