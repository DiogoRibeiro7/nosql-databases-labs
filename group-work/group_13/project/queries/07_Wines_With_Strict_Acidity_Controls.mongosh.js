// This query focuses on acidity-related fields. It is long because it checks
// multiple acidity indicators at once, but all conditions are simple comparisons.

db.wine.find({

  // pH must be in a narrow range
  pH: { $gte: 3.1, $lte: 3.4 },

  // Volatile acidity must be low
  volatile_acidity: { $gte: 0.1, $lte: 0.5 },

  // Fixed acidity must be moderate
  fixed_acidity: { $gte: 5, $lte: 9 },

  // Citric acid must be within a typical range
  citric_acid: { $gte: 0.1, $lte: 0.5 },

  // Density must match acidity expectations
  density: { $gte: 0.990, $lte: 1.005 },

  // Quality must be at least acceptable
  quality: { $gte: 6 }

})

