// Esta query exclui vinhos com valores específicos indesejados
db.wine.find({
  type: { $ne: "white" },             // Excluir vinhos brancos
  quality: { $ne: 3 },                // Excluir qualidade 3
  alcohol: { $ne: 8 },                // Excluir álcool 8%
  pH: { $ne: 2.9 },                   // Excluir pH 2.9
  density: { $ne: 1.010 },            // Excluir densidade 1.010
  sulphates: { $ne: 0.2 },            // Excluir sulfatos 0.2
  chlorides: { $ne: 0.15 },           // Excluir cloretos 0.15
  volatile_acidity: { $ne: 1.0 }      // Excluir acidez volátil 1.0
})
