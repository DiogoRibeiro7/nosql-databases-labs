// Esta query obtém vinhos tintos que cumprem uma longa lista de condições
// simples e diretas. O objetivo não é complexidade, mas sim demonstrar como
// aplicar muitos filtros básicos ao mesmo tempo. Cada condição é independente
// e utiliza operadores de comparação simples.

db.wine.find({

  // Selecionar apenas vinhos tintos
  type: "red",

  // A qualidade deve ser pelo menos 6 (qualidade média ou superior)
  quality: { $gte: 6 },

  // O teor alcoólico deve estar entre 10% e 14%
  alcohol: { $gte: 10, $lte: 14 },

  // O açúcar residual deve ser baixo a moderado
  residual_sugar: { $gte: 1, $lte: 8 },

  // A acidez volátil deve estar controlada (valores mais baixos são melhores)
  volatile_acidity: { $gte: 0.1, $lte: 0.7 },

  // A densidade deve estar dentro de um intervalo realista para vinhos
  density: { $gte: 0.990, $lte: 1.005 },

  // O pH deve estar dentro de um intervalo típico de acidez
  pH: { $gte: 2.9, $lte: 3.6 },

  // Os sulfatos devem estar num intervalo moderado
  sulphates: { $gte: 0.3, $lte: 1.2 },

  // Os cloretos devem ser baixos (indicador de salinidade)
  chlorides: { $lte: 0.12 },

  // O dióxido de enxofre livre deve estar dentro de limites seguros
  free_sulfur_dioxide: { $gte: 5, $lte: 60 },

  // O dióxido de enxofre total deve estar dentro dos limites típicos
  total_sulfur_dioxide: { $gte: 20, $lte: 180 }

})
