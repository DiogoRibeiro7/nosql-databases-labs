// Esta query obtém vinhos brancos aplicando uma lista longa de filtros simples.
// O objetivo é mostrar como combinar vários limites numéricos num único find(),
// mantendo tudo fácil de entender.

db.wine.find({

  // Selecionar apenas vinhos brancos
  type: "white",

  // A qualidade deve ser boa ou excelente
  quality: { $gte: 7 },

  // O teor alcoólico deve ser moderado a alto
  alcohol: { $gte: 9, $lte: 13.5 },

  // O açúcar residual pode variar bastante nos brancos
  residual_sugar: { $gte: 2, $lte: 20 },

  // A acidez volátil deve ser baixa
  volatile_acidity: { $lte: 0.5 },

  // O ácido cítrico deve estar dentro de valores típicos
  citric_acid: { $gte: 0.1, $lte: 0.6 },

  // A densidade deve ser realista para vinhos brancos
  density: { $gte: 0.990, $lte: 1.010 },

  // O pH deve estar dentro de um intervalo típico de acidez
  pH: { $gte: 3.0, $lte: 3.5 },

  // Os sulfatos devem estar num intervalo moderado
  sulphates: { $gte: 0.3, $lte: 1.0 },

  // Os cloretos devem ser baixos
  chlorides: { $lte: 0.10 },

  // O SO₂ livre deve estar dentro de limites seguros
  free_sulfur_dioxide: { $gte: 10, $lte: 70 },

  // O SO₂ total deve estar dentro dos limites típicos
  total_sulfur_dioxide: { $gte: 30, $lte: 200 }

})
