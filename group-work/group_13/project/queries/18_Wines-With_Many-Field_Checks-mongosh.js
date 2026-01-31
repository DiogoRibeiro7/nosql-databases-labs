// Esta query verifica vários campos ao mesmo tempo com condições simples
db.wine.find({
  alcohol: { $gte: 11 },                  // Teor alcoólico mínimo
  quality: { $gte: 6 },                   // Qualidade mínima
  residual_sugar: { $lte: 8 },            // Açúcar residual máximo
  density: { $lte: 1.003 },               // Densidade máxima
  pH: { $gte: 3.0 },                      // Acidez mínima
  sulphates: { $gte: 0.4 },               // Sulfatos mínimos
  chlorides: { $lte: 0.09 },              // Cloretos baixos
  volatile_acidity: { $lte: 0.6 },        // Acidez volátil controlada
  citric_acid: { $gte: 0.2 }              // Ácido cítrico mínimo
})
