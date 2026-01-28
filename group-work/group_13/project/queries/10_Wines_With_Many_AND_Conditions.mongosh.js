// Esta query seleciona vinhos que cumprem todas as condições listadas.
// Utiliza o operador $and para garantir que todas as regras sejam verdadeiras ao mesmo tempo.

db.wine.find({

  $and: [
    { quality: { $gte: 6 } },                      // Qualidade igual ou superior a 6
    { alcohol: { $gte: 10 } },                     // Teor alcoólico mínimo de 10%
    { residual_sugar: { $lte: 10 } },              // Açúcar residual até 10 g/L
    { volatile_acidity: { $lte: 0.6 } },           // Acidez volátil controlada (máximo 0.6)
    { density: { $gte: 0.990, $lte: 1.003 } },     // Densidade dentro de um intervalo aceitável
    { pH: { $gte: 3.0, $lte: 3.5 } },              // pH dentro de uma faixa equilibrada
    { sulphates: { $gte: 0.4 } },                  // Sulfatos com valor mínimo de 0.4
    { chlorides: { $lte: 0.10 } }                  // Cloretos com valor máximo de 0.10
  ]

})
