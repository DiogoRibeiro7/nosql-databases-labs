// Esta query exclui vinhos com valores extremos ou indesejados em vários atributos
db.wine.find({
  alcohol: { $not: { $lt: 8 } },                // Excluir álcool muito baixo
  residual_sugar: { $not: { $gt: 20 } },        // Excluir vinhos muito doces
  volatile_acidity: { $not: { $gt: 1.0 } },     // Excluir acidez volátil extrema
  pH: { $not: { $lt: 2.8 } },                   // Excluir pH muito ácido
  density: { $not: { $gt: 1.015 } },            // Excluir densidade muito alta
  sulphates: { $not: { $gt: 1.5 } }             // Excluir sulfatos excessivos
})
