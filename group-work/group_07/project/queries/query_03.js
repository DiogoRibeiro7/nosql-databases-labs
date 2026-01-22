// ============================================
// QUERY 3: Encontrar documentos com aceleração do utilizador alta (> 1.0 m/s²)
// ============================================
// Base de dados: iot_sensors
// Coleção: motion_data
// Tipo: Filtro com condições
// 
// Descrição: Encontra documentos onde pelo menos um componente de aceleração 
//            do utilizador é maior que 1.0 m/s².
// Uso: Identificar momentos de movimento intenso durante a caminhada.
//
// OBJETIVO EMPRESARIAL:
// Identifica eventos críticos de movimento intenso que podem indicar:
// - Quedas ou acidentes em aplicações de saúde e segurança
// - Atividades físicas intensas para apps de fitness
// - Anomalias em dispositivos IoT que requerem atenção imediata
// - Padrões de comportamento que podem ser usados para personalização de serviços
// Esta análise é crucial para sistemas de alerta e detecção de eventos importantes.
// ============================================

db.motion_data.find({
  $or: [
    { "userAcceleration.x": { $gt: 1.0 } },
    { "userAcceleration.y": { $gt: 1.0 } },
    { "userAcceleration.z": { $gt: 1.0 } }
  ]
}).limit(20);

