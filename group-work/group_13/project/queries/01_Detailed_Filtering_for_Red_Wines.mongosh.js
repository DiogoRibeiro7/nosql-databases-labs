
// Esta query seleciona vinhos tintos com várias condições químicas e sensoriais
db.wine.find({
  type: "red",                                 // Apenas vinhos tintos
  quality: { $gte: 6 },                        // Qualidade mínima de 6
  alcohol: { $gte: 10, $lte: 14 },             // Teor alcoólico entre 10% e 14%
  residual_sugar: { $gte: 1, $lte: 8 },        // Açúcar residual entre 1 e 8
  volatile_acidity: { $gte: 0.1, $lte: 0.7 },  // Acidez volátil controlada
  density: { $gte: 0.990, $lte: 1.005 },       // Densidade dentro do intervalo típico
  pH: { $gte: 2.9, $lte: 3.6 },                // Acidez equilibrada
  sulphates: { $gte: 0.3, $lte: 1.2 },         // Sulfatos moderados
  chlorides: { $lte: 0.12 },                   // Cloretos baixos
  free_sulfur_dioxide: { $gte: 5, $lte: 60 },  // SO₂ livre dentro do intervalo seguro
  total_sulfur_dioxide: { $gte: 20, $lte: 180 } // SO₂ total dentro dos limites típicos
})
