// ============================================
// QUERY 11: Encontrar documentos com valores extremos de yaw
// ============================================
// Base de dados: iot_sensors
// Coleção: motion_data
// Tipo: Filtro com múltiplas condições
// 
// Descrição: Encontra documentos com yaw (rotação em Z) fora do intervalo [-3.0, 3.0] radianos.
// Uso: Identificar orientações extremas do dispositivo.
//
// OBJETIVO EMPRESARIAL:
// Detecta orientações extremas que podem indicar:
// - Problemas de calibração ou falhas de sensor em dispositivos IoT
// - Comportamentos anómalos que requerem investigação
// - Situações onde o dispositivo está em posição não padrão
// - Necessidade de correção de dados antes de análises subsequentes
// - Oportunidades para melhorar algoritmos de detecção de orientação
// Essencial para garantir qualidade de dados em sistemas de produção.
// ============================================

db.motion_data.find({
  $or: [
    { "attitude.yaw": { $lt: -3.0 } },
    { "attitude.yaw": { $gt: 3.0 } }
  ]
}).sort({ "attitude.yaw": 1 }).limit(20);

