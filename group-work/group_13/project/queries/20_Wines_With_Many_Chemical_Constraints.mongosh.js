// Esta query aplica várias restrições químicas comuns para selecionar vinhos equilibrados
db.wine.find({
  fixed_acidity: { $gte: 5, $lte: 10 },           // Acidez fixa equilibrada
  volatile_acidity: { $gte: 0.1, $lte: 0.7 },     // Acidez volátil controlada
  citric_acid: { $gte: 0.1, $lte: 0.5 },          // Ácido cítrico equilibrado
  residual_sugar: { $gte: 1, $lte: 12 },          // Açúcar residual moderado
  chlorides: { $lte: 0.10 },                      // Cloretos baixos
  free_sulfur_dioxide: { $gte: 5, $lte: 60 },     // SO₂ livre dentro do intervalo seguro
  total_sulfur_dioxide: { $gte: 20, $lte: 180 },  // SO₂ total dentro dos limites
  density: { $gte: 0.990, $lte: 1.005 },          // Densidade equilibrada
  pH: { $gte: 3.0, $lte: 3.5 },                   // Acidez equilibrada
  sulphates: { $gte: 0.4, $lte: 1.0 }             // Sulfatos moderados
})
