// ============================================
// QUERY 13: Encontrar períodos de movimento estável (baixa aceleração e rotação)
// ============================================

// Switch to the correct database
db = db.getSiblingDB('iot_sensors');

// Base de dados: iot_sensors
// Coleção: motion_data
// Tipo: Filtro com expressões complexas
// 
// Descrição: Encontra documentos com baixa aceleração (<0.1) E baixa rotação (<0.2) simultaneamente.
// Uso: Identificar momentos de movimento suave ou quase estático.
//
// OBJETIVO EMPRESARIAL:
// Identifica períodos de baixa atividade que podem representar:
// - Períodos de repouso ou sono em apps de saúde e bem-estar
// - Oportunidades para economizar bateria em dispositivos IoT
// - Estados de calma que podem ser usados para notificações menos intrusivas
// - Baseline de atividade para comparação com períodos ativos
// - Detecção de inatividade prolongada (possível problema de saúde ou dispositivo)
// - Segmentação de utilizadores sedentários para campanhas de engajamento
// ============================================

db.motion_data.find({
  $and: [
    {
      $expr: {
        $lt: [
          {
            $sqrt: {
              $add: [
                { $pow: ["$userAcceleration.x", 2] },
                { $pow: ["$userAcceleration.y", 2] },
                { $pow: ["$userAcceleration.z", 2] }
              ]
            }
          },
          0.1
        ]
      }
    },
    {
      $expr: {
        $lt: [
          {
            $sqrt: {
              $add: [
                { $pow: ["$rotationRate.x", 2] },
                { $pow: ["$rotationRate.y", 2] },
                { $pow: ["$rotationRate.z", 2] }
              ]
            }
          },
          0.2
        ]
      }
    }
  ]
}).limit(30).forEach(printjson);

