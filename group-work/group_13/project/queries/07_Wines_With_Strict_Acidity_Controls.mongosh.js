// Esta query foca-se em vinhos com acidez bem controlada.
// Aplica vários filtros relacionados com diferentes tipos de acidez e densidade,
// ideais para identificar vinhos com perfil ácido equilibrado.

db.wine.find({

  pH: { $gte: 3.1, $lte: 3.4 },                 // pH entre 3.1 e 3.4 (acidez equilibrada)
  volatile_acidity: { $gte: 0.1, $lte: 0.5 },   // Acidez volátil entre 0.1 e 0.5 (não agressiva)
  fixed_acidity: { $gte: 5, $lte: 9 },          // Acidez fixa entre 5 e 9 (estrutura do vinho)
  citric_acid: { $gte: 0.1, $lte: 0.5 },        // Ácido cítrico equilibrado (frescura)
  density: { $gte: 0.990, $lte: 1.005 },        // Densidade dentro do intervalo típico
  quality: { $gte: 6 }                          // Qualidade mínima de 6 (vinhos equilibrados)

})
