// Esta query obtém vinhos que cumprem várias condições simples e, além disso,
// utiliza projeção para devolver uma lista longa de campos específicos.
// É uma query simples, mas muito extensa e descritiva.

db.wine.find(

  // Condições de filtragem
  {
    quality: { $gte: 6 },
    alcohol: { $gte: 10 },
    residual_sugar: { $lte: 12 },
    density: { $gte: 0.990, $lte: 1.005 },
    pH: { $gte: 3.0, $lte: 3.5 },
    sulphates: { $gte: 0.4 },
    chlorides: { $lte: 0.10 }
  },

  // Projeção: selecionar muitos campos explicitamente
  {
    type: 1,
    quality: 1,
    alcohol: 1,
    residual_sugar: 1,
    density: 1,
    pH: 1,
    sulphates: 1,
    chlorides: 1,
    volatile_acidity: 1,
    citric_acid: 1,
    free_sulfur_dioxide: 1,
    total_sulfur_dioxide: 1
  }

)
