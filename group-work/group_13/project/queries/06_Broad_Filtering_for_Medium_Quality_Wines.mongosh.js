// This query retrieves wines that fall into a broad "medium quality" category,
// while also applying a long list of simple numeric constraints. The purpose
// is to demonstrate a verbose but easy-to-understand filter that touches many
// fields without using advanced MongoDB features.

db.wine.find({

  // Quality between 5 and 7 (inclusive)
  quality: { $gte: 5, $lte: 7 },

  // Alcohol content must be moderate
  alcohol: { $gte: 9, $lte: 13 },

  // Residual sugar must be within a typical range
  residual_sugar: { $gte: 1, $lte: 15 },

  // Density must be realistic for wine
  density: { $gte: 0.990, $lte: 1.010 },

  // pH must be within a normal acidity range
  pH: { $gte: 2.9, $lte: 3.6 },

  // Volatile acidity must not be too high
  volatile_acidity: { $lte: 0.8 },

  // Citric acid must be within a typical range
  citric_acid: { $gte: 0.0, $lte: 0.6 },

  // Sulphates must be moderate
  sulphates: { $gte: 0.3, $lte: 1.2 },

  // Chlorides must be low
  chlorides: { $lte: 0.12 }

})


