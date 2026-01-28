// Esta query aplica vários filtros com intervalos numéricos típicos para selecionar vinhos equilibrados.
// Todos os campos são avaliados com limites mínimo e/ou máximo, sem operadores compostos.

db.wine.find({

  alcohol: { $gte: 9, $lte: 14 },                 // Teor alcoólico entre 9% e 14%
  quality: { $gte: 5, $lte: 8 },                  // Qualidade entre 5 e 8
  residual_sugar: { $gte: 1, $lte: 15 },          // Açúcar residual entre 1 e 15 g/L
  density: { $gte: 0.990, $lte: 1.010 },          // Densidade dentro do intervalo típico
  pH: { $gte: 2.9, $lte: 3.6 },                   // pH entre 2.9 e 3.6 (acidez equilibrada)
  sulphates: { $gte: 0.3, $lte: 1.2 },            // Sulfatos entre 0.3 e 1.2
  chlorides: { $lte: 0.12 },                      // Cloretos até 0.12
  volatile_acidity: { $gte: 0.1, $lte: 0.8 },     // Acidez volátil entre 0.1 e 0.8
  citric_acid: { $gte: 0.0, $lte: 0.6 }           // Ácido cítrico entre 0.0 e 0.6

})
