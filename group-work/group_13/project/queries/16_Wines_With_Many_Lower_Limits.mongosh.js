// Esta query define valores mínimos para vários atributos do vinho
db.wine.find({
  alcohol: { $gte: 9 },                   // Teor alcoólico mínimo de 9%
  quality: { $gte: 5 },                   // Qualidade mínima de 5
  residual_sugar: { $gte: 1 },            // Açúcar residual mínimo de 1
  density: { $gte: 0.990 },               // Densidade mínima aceitável
  pH: { $gte: 3.0 },                      // pH mínimo (acidez controlada)
  sulphates: { $gte: 0.4 },               // Sulfatos mínimos
  chlorides: { $gte: 0.02 },              // Cloretos mínimos
  volatile_acidity: { $gte: 0.1 }         // Acidez volátil mínima
})
