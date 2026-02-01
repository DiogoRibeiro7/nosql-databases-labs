// Esta query seleciona vinhos que cumprem várias condições simples
// e depois mostra apenas os campos que nos interessam (projeção).
// É útil para análises específicas onde queremos ver só alguns atributos.

db.wine.find(

  // Filtros aplicados aos dados
  {
    quality: { $gte: 6 },                      // Qualidade igual ou superior a 6
    alcohol: { $gte: 10 },                     // Teor alcoólico mínimo de 10%
    residual_sugar: { $lte: 12 },              // Açúcar residual até 12 g/L
    density: { $gte: 0.990, $lte: 1.005 },     // Densidade dentro do intervalo típico
    pH: { $gte: 3.0, $lte: 3.5 },              // pH entre 3.0 e 3.5 (acidez equilibrada)
    sulphates: { $gte: 0.4 },                  // Sulfatos mínimos de 0.4
    chlorides: { $lte: 0.10 }                  // Cloretos até 0.10 (baixo teor de salinidade)
  },

  // Projeção: definir quais os campos que queremos ver no resultado
  {
    type: 1,                        // Tipo de vinho (tinto ou branco)
    quality: 1,                     // Qualidade
    alcohol: 1,                     // Teor alcoólico
    residual_sugar: 1,             // Açúcar residual
    density: 1,                    // Densidade
    pH: 1,                         // Acidez (pH)
    sulphates: 1,                  // Sulfatos
    chlorides: 1,                  // Cloretos
    volatile_acidity: 1,          // Acidez volátil
    citric_acid: 1,               // Ácido cítrico
    free_sulfur_dioxide: 1,       // SO₂ livre
    total_sulfur_dioxide: 1       // SO₂ total
  }

)

