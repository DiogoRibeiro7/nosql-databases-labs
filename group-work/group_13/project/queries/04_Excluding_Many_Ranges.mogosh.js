// Esta query utiliza o operador $not para excluir vários intervalos.
// É longa, mas extremamente simples e direta.

db.wine.find({

  // Excluir vinhos com teor alcoólico muito baixo
  alcohol: { $not: { $lt: 9 } },

  // Excluir vinhos muito doces
  residual_sugar: { $not: { $gt: 20 } },

  // Excluir vinhos com acidez volátil muito elevada
  volatile_acidity: { $not: { $gt: 1.0 } },

  // Excluir vinhos com pH muito baixo
  pH: { $not: { $lt: 2.8 } },

  // Excluir vinhos com densidade demasiado alta
  density: { $not: { $gt: 1.010 } },

  // Excluir vinhos com sulfatos muito baixos
  sulphates: { $not: { $lt: 0.3 } }

})

