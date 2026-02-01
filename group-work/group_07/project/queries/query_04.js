// ============================================
// QUERY 4: Calcular estatísticas de aceleração do utilizador
// ============================================

// Switch to the correct database
db = db.getSiblingDB('iot_sensors');

// Base de dados: iot_sensors
// Coleção: motion_data
// Tipo: Agregação com estatísticas
// 
// Descrição: Calcula média, máximo e mínimo para cada componente de aceleração (X, Y, Z).
// Uso: Obter uma visão geral dos padrões de aceleração nos dados.
//
// OBJETIVO EMPRESARIAL:
// Fornece métricas estatísticas essenciais para:
// - Estabelecer benchmarks de comportamento normal vs. anormal
// - Desenvolver algoritmos de machine learning com dados normalizados
// - Criar dashboards executivos com KPIs de movimento
// - Identificar limites operacionais para sistemas de segurança
// - Suportar decisões de produto baseadas em dados reais de utilizadores
// ============================================

db.motion_data.aggregate([
  {
    $group: {
      _id: null,
      avgAccelX: { $avg: "$userAcceleration.x" },
      avgAccelY: { $avg: "$userAcceleration.y" },
      avgAccelZ: { $avg: "$userAcceleration.z" },
      maxAccelX: { $max: "$userAcceleration.x" },
      maxAccelY: { $max: "$userAcceleration.y" },
      maxAccelZ: { $max: "$userAcceleration.z" },
      minAccelX: { $min: "$userAcceleration.x" },
      minAccelY: { $min: "$userAcceleration.y" },
      minAccelZ: { $min: "$userAcceleration.z" }
    }
  }
]).forEach(printjson);

