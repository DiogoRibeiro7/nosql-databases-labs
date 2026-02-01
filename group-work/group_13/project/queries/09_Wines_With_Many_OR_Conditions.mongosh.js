// Esta query seleciona vinhos que satisfaçam pelo menos uma das condições listadas
db.wine.find({
  $or: [
    { quality: { $gte: 8 } },          // Qualidade muito alta
    { alcohol: { $gte: 13 } },         // Teor alcoólico elevado
    { residual_sugar: { $gte: 12 } },  // Muito açúcar residual
    { sulphates: { $gte: 1.0 } },      // Sulfatos elevados
    { chlorides: { $lte: 0.05 } },     // Cloretos muito baixos
    { pH: { $gte: 3.4 } },             // pH mais alcalino
    { density: { $lte: 0.995 } }       // Densidade baixa
  ]
})
