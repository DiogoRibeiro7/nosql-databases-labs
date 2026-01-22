// ============================================
// QUERY 12: Calcular correlação entre aceleração e rotação
// ============================================
// Base de dados: iot_sensors
// Coleção: motion_data
// Tipo: Agregação com cálculos
// 
// Descrição: Calcula magnitudes médias e máximas de aceleração e rotação 
//            para análise de correlação.
// Uso: Estudar a relação entre aceleração linear e rotação angular.
//
// OBJETIVO EMPRESARIAL:
// Analisa a correlação entre diferentes tipos de movimento para:
// - Desenvolver modelos preditivos mais precisos de comportamento
// - Identificar padrões complexos de movimento para reconhecimento de atividades
// - Melhorar algoritmos de detecção de quedas e emergências
// - Otimizar sistemas de classificação de atividades físicas
// - Criar métricas compostas de atividade física mais robustas
// - Suportar pesquisa e desenvolvimento de novos produtos baseados em movimento
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
      }
    }
  },
  {
    $group: {
      _id: null,
      avgAccelMag: { $avg: "$accelMagnitude" },
      avgRotationMag: { $avg: "$rotationMagnitude" },
      maxAccelMag: { $max: "$accelMagnitude" },
      maxRotationMag: { $max: "$rotationMagnitude" }
    }
  }
]);

