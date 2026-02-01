// Esta query aplica intervalos mínimo e máximo para vários atributos ao mesmo tempo
db.wine.find({
  alcohol: { $gte: 10, $lte: 13 },        // Teor alcoólico entre 10% e 13%
  quality: { $gte: 6, $lte: 8 },          // Qualidade entre 6 e 8
  residual_sugar: { $gte: 2, $lte: 10 },  // Açúcar residual entre 2 e 10
  density: { $gte: 0.992, $lte: 1.004 },  // Densidade equilibrada
  pH: { $gte: 3.1, $lte: 3.4 },           // Acidez equilibrada
  sulphates: { $gte: 0.5, $lte: 1.0 },    // Sulfatos moderados
  chlorides: { $gte: 0.03, $lte: 0.10 }   // Cloretos dentro do intervalo aceitável
})
