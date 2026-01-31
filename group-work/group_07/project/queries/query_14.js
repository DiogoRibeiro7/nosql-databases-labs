// ============================================
// QUERY 14: Calcular percentis de aceleração
// ============================================

// Switch to the correct database
db = db.getSiblingDB('iot_sensors');

// Base de dados: iot_sensors
// Coleção: motion_data
// Tipo: Agregação avançada
// 
// Descrição: Calcula percentis (25%, 50%, 75%, 90%, 95%) da magnitude de aceleração.
// Uso: Análise estatística detalhada da distribuição de acelerações.
//
// OBJETIVO EMPRESARIAL:
// Fornece análise estatística avançada que permite:
// - Estabelecer limites normais e anómalos baseados em distribuição real dos dados
// - Criar sistemas de alerta com thresholds estatisticamente fundamentados
// - Desenvolver algoritmos de detecção de outliers mais precisos
// - Suportar decisões de produto com dados estatisticamente robustos
// - Criar relatórios executivos com métricas de percentis (ex: "90% dos utilizadores...")
// - Validar hipóteses de negócio com análise estatística rigorosa
// Essencial para análises avançadas e machine learning.
// ============================================

db.motion_data.aggregate([
  {
    $addFields: {
      accelMagnitude: {
        $sqrt: {
          $add: [
            { $pow: ["$userAcceleration.x", 2] },
            { $pow: ["$userAcceleration.y", 2] },
            { $pow: ["$userAcceleration.z", 2] }
          ]
        }
      }
    }
  },
  {
    $sort: { accelMagnitude: 1 }
  },
  {
    $group: {
      _id: null,
      values: { $push: "$accelMagnitude" }
    }
  },
  {
    $project: {
      p25: { $arrayElemAt: ["$values", { $floor: { $multiply: [{ $size: "$values" }, 0.25] } }] },
      p50: { $arrayElemAt: ["$values", { $floor: { $multiply: [{ $size: "$values" }, 0.50] } }] },
      p75: { $arrayElemAt: ["$values", { $floor: { $multiply: [{ $size: "$values" }, 0.75] } }] },
      p90: { $arrayElemAt: ["$values", { $floor: { $multiply: [{ $size: "$values" }, 0.90] } }] },
      p95: { $arrayElemAt: ["$values", { $floor: { $multiply: [{ $size: "$values" }, 0.95] } }] },
      count: { $size: "$values" }
    }
  }
]).forEach(printjson);

