// ============================================
// QUERY 9: Encontrar picos de movimento (alta aceleração E alta rotação)
// ============================================
// Base de dados: iot_sensors
// Coleção: motion_data
// Tipo: Filtro complexo com expressões
// 
// Descrição: Encontra documentos com alta aceleração (>0.5) E alta rotação (>1.5) simultaneamente.
// Uso: Identificar momentos de movimento mais intenso e dinâmico.
//
// OBJETIVO EMPRESARIAL:
// Identifica eventos de movimento complexo e dinâmico que podem representar:
// - Quedas ou acidentes (crítico para apps de segurança e saúde)
// - Atividades físicas intensas (corrida, exercícios) para apps de fitness
// - Eventos anómalos que requerem atenção imediata em sistemas IoT
// - Padrões de movimento complexos para treino de modelos de machine learning
// - Oportunidades para notificações contextuais ou recomendações personalizadas
// Esta análise é fundamental para sistemas de detecção de emergência e análise comportamental.
// ============================================

db.motion_data.find({
  $and: [
    {
      $expr: {
        $gt: [
          {
            $sqrt: {
              $add: [
                { $pow: ["$userAcceleration.x", 2] },
                { $pow: ["$userAcceleration.y", 2] },
                { $pow: ["$userAcceleration.z", 2] }
              ]
            }
          },
          0.5
        ]
      }
    },
    {
      $expr: {
        $gt: [
          {
            $sqrt: {
              $add: [
                { $pow: ["$rotationRate.x", 2] },
                { $pow: ["$rotationRate.y", 2] },
                { $pow: ["$rotationRate.z", 2] }
              ]
            }
          },
          1.5
        ]
      }
    }
  ]
}).limit(30);

