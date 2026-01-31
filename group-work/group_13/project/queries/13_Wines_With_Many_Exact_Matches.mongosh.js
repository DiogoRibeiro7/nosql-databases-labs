// Esta query procura vinhos com valores exatos em vários campos
db.wine.find({
  type: "red",                    // Tipo tinto
  quality: 6,                     // Qualidade exata
  alcohol: 11,                    // Teor alcoólico exato
  pH: 3.2,                        // pH exato
  sulphates: 0.6,                 // Sulfatos exatos
  chlorides: 0.08,                // Cloretos exatos
  density: 0.996,                 // Densidade exata
  volatile_acidity: 0.4,         // Acidez volátil exata
  citric_acid: 0.3               // Ácido cítrico exato
})

