// Esta query exclui vinhos com características indesejadas
db.wine.find({
  alcohol: { $not: { $lt: 9 } },             // Excluir vinhos com álcool < 9%
  residual_sugar: { $not: { $gt: 20 } },     // Excluir vinhos muito doces
  volatile_acidity: { $not: { $gt: 1.0 } },  // Excluir acidez volátil extrema
  pH: { $not: { $lt: 2.8 } },                // Excluir pH muito baixo
  density: { $not: { $gt: 1.015 } },         // Excluir densidade muito alta
  sulphates: { $not: { $lt: 0.3 } }          // Excluir sulfatos muito baixos
})
