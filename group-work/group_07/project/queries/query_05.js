// ============================================
// QUERY 5: Encontrar documentos com taxa de rotação elevada (> 2.0 rad/s)
// ============================================

// Switch to the correct database
db = db.getSiblingDB('iot_sensors');

// Base de dados: iot_sensors
// Coleção: motion_data
// Tipo: Filtro e ordenação
// 
// Descrição: Encontra documentos com taxa de rotação superior a 2.0 rad/s, 
//            ordenados por maior rotação.
// Uso: Identificar momentos de mudança rápida de orientação do dispositivo.
//
// OBJETIVO EMPRESARIAL:
// Detecta rotações extremas que podem indicar:
// - Quedas ou movimentos bruscos em aplicações de saúde e segurança
// - Mudanças de direção rápidas em apps de navegação e transporte
// - Problemas de calibração em dispositivos IoT
// - Eventos que requerem notificações ou alertas ao utilizador
// Útil para sistemas de detecção de emergência e análise de padrões de movimento.
// ============================================

db.motion_data.find({
  $or: [
    { "rotationRate.x": { $gt: 2.0 } },
    { "rotationRate.y": { $gt: 2.0 } },
    { "rotationRate.z": { $gt: 2.0 } }
  ]
}).sort({ "rotationRate.x": -1 }).limit(10).forEach(printjson);

