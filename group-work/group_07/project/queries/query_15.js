// ============================================
// QUERY 15: Análise completa de padrões de movimento
// ============================================
// Base de dados: iot_sensors
// Coleção: motion_data
// Tipo: Agregação complexa e abrangente
// 
// Descrição: Análise completa que calcula:
//            - Total de documentos
//            - Estatísticas de magnitude de aceleração, rotação e gravidade
//            - Médias de orientação (pitch, roll, yaw)
//            - Valores máximos e mínimos
// Uso: Obter uma visão geral completa e resumida de todos os padrões de movimento nos dados.
//
// OBJETIVO EMPRESARIAL:
// Fornece um dashboard executivo completo com todas as métricas principais:
// - Visão holística do comportamento dos utilizadores/dispositivos
// - Base para relatórios executivos e apresentações a stakeholders
// - Identificação rápida de padrões gerais e anomalias
// - Suporte para decisões estratégicas baseadas em dados agregados
// - Benchmarking de performance de dispositivos e utilizadores
// - Validação de qualidade geral dos dados antes de análises detalhadas
// - Fundação para desenvolvimento de KPIs de negócio relacionados com movimento
// Esta query é essencial para gestão de dados e tomada de decisões estratégicas.
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
      },
      rotationMagnitude: {
        $sqrt: {
          $add: [
            { $pow: ["$rotationRate.x", 2] },
            { $pow: ["$rotationRate.y", 2] },
            { $pow: ["$rotationRate.z", 2] }
          ]
        }
      },
      gravityMagnitude: {
        $sqrt: {
          $add: [
            { $pow: ["$gravity.x", 2] },
            { $pow: ["$gravity.y", 2] },
            { $pow: ["$gravity.z", 2] }
          ]
        }
      }
    }
  },
  {
    $group: {
      _id: null,
      totalDocuments: { $sum: 1 },
      avgAccelMagnitude: { $avg: "$accelMagnitude" },
      avgRotationMagnitude: { $avg: "$rotationMagnitude" },
      avgGravityMagnitude: { $avg: "$gravityMagnitude" },
      maxAccelMagnitude: { $max: "$accelMagnitude" },
      maxRotationMagnitude: { $max: "$rotationMagnitude" },
      minAccelMagnitude: { $min: "$accelMagnitude" },
      minRotationMagnitude: { $min: "$rotationMagnitude" },
      avgPitch: { $avg: "$attitude.pitch" },
      avgRoll: { $avg: "$attitude.roll" },
      avgYaw: { $avg: "$attitude.yaw" }
    }
  },
  {
    $project: {
      _id: 0,
      totalDocuments: 1,
      acceleration: {
        average: "$avgAccelMagnitude",
        maximum: "$maxAccelMagnitude",
        minimum: "$minAccelMagnitude"
      },
      rotation: {
        average: "$avgRotationMagnitude",
        maximum: "$maxRotationMagnitude",
        minimum: "$minRotationMagnitude"
      },
      gravity: {
        average: "$avgGravityMagnitude"
      },
      orientation: {
        averagePitch: "$avgPitch",
        averageRoll: "$avgRoll",
        averageYaw: "$avgYaw"
      }
    }
  }
]);

