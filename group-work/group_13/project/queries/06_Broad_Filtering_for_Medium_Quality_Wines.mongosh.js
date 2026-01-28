// Esta query seleciona vinhos com qualidade média e várias características químicas equilibradas.
// É útil para análises de vinhos comuns, nem muito fracos nem muito premium.

db.wine.find({

  quality: { $gte: 5, $lte: 7 },                // Qualidade entre 5 e 7 (nível médio)
  alcohol: { $gte: 9, $lte: 13 },               // Teor alcoólico moderado
  residual_sugar: { $gte: 1, $lte: 15 },        // Açúcar residual dentro de intervalo típico
  density: { $gte: 0.990, $lte: 1.010 },        // Densidade realista para vinhos
  pH: { $gte: 2.9, $lte: 3.6 },                 // pH dentro de uma faixa equilibrada
  volatile_acidity: { $lte: 0.8 },              // Acidez volátil controlada
  citric_acid: { $gte: 0.0, $lte: 0.6 },        // Ácido cítrico dentro do normal
  sulphates: { $gte: 0.3, $lte: 1.2 },          // Sulfatos moderados
  chlorides: { $lte: 0.12 }                     // Cloretos baixos (salinidade controlada)

})
