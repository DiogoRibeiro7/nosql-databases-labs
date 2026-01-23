// ============================================
// QUERY 7: Encontrar documentos com orientação específica (pitch negativo)
// ============================================

// Switch to the correct database
db = db.getSiblingDB('iot_sensors');

// Base de dados: iot_sensors
// Coleção: motion_data
// Tipo: Filtro simples
// 
// Descrição: Encontra documentos onde o pitch (inclinação) é menor que -1.0 radianos.
// Uso: Identificar momentos onde o dispositivo estava inclinado para baixo.
//
// OBJETIVO EMPRESARIAL:
// Identifica orientações específicas do dispositivo que podem indicar:
// - Postura do utilizador (sentado, deitado) em apps de saúde
// - Uso do dispositivo em diferentes contextos (bolso, mão, mesa)
// - Problemas de calibração ou posicionamento incorreto do sensor
// - Padrões de comportamento que podem afetar a precisão de outras análises
// Útil para melhorar a precisão de algoritmos que dependem da orientação do dispositivo.
// ============================================

db.motion_data.find({
  "attitude.pitch": { $lt: -1.0 }
}).limit(20).forEach(printjson);

