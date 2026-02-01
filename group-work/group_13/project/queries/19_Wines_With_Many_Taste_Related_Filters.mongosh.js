// Esta query foca-se em atributos que influenciam diretamente o sabor do vinho
db.wine.find({
  quality: { $gte: 6 },                   // Qualidade mínima
  alcohol: { $gte: 10 },                  // Teor alcoólico mínimo
  volatile_acidity: { $lte: 0.6 },        // Acidez volátil controlada
  citric_acid: { $gte: 0.2 },             // Ácido cítrico mínimo
  residual_sugar: { $lte: 10 },           // Açúcar residual moderado
  sulphates: { $gte: 0.5 },               // Sulfatos mínimos
  pH: { $gte: 3.0, $lte: 3.5 }            // Acidez equilibrada
})
