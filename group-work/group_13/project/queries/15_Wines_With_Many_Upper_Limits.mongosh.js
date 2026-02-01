// Esta query seleciona vinhos que não ultrapassam certos valores máximos em vários atributos.
// É útil para encontrar vinhos mais leves, suaves ou equilibrados, evitando excessos químicos.

db.wine.find({

  alcohol: { $lte: 13 },              // Teor alcoólico até 13% (evita vinhos muito fortes)
  quality: { $lte: 7 },               // Qualidade até 7 (exclui vinhos premium)
  residual_sugar: { $lte: 12 },       // Açúcar residual até 12 g/L (evita vinhos muito doces)
  density: { $lte: 1.005 },           // Densidade máxima aceitável (evita vinhos densos ou pesados)
  pH: { $lte: 3.5 },                  // pH até 3.5 (mantém acidez equilibrada)
  sulphates: { $lte: 1.0 },           // Sulfatos até 1.0 (limita conservantes)
  chlorides: { $lte: 0.10 },          // Cloretos até 0.10 (controla salinidade)
  volatile_acidity: { $lte: 0.7 }     // Acidez volátil até 0.7 (evita vinhos agressivos no nariz)

})
