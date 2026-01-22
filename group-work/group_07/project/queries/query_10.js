// ============================================
// QUERY 10: Agrupar por faixas de aceleração e contar ocorrências
// ============================================
// Base de dados: iot_sensors
// Coleção: motion_data
// Tipo: Agregação com buckets
// 
// Descrição: Agrupa os documentos em faixas de magnitude de aceleração e conta 
//            ocorrências em cada faixa.
// Uso: Visualizar a distribuição de intensidades de movimento.
//
// OBJETIVO EMPRESARIAL:
// Cria uma distribuição estatística dos níveis de atividade que permite:
// - Identificar padrões de comportamento do utilizador (mais ativo vs. mais sedentário)
// - Desenvolver segmentação de utilizadores baseada em atividade física
// - Criar visualizações para dashboards executivos e relatórios
// - Estabelecer categorias de atividade para gamificação em apps de fitness
// - Detectar anomalias (distribuições inesperadas podem indicar problemas)
// - Suportar decisões de produto baseadas em dados de utilização real
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
    $bucket: {
      groupBy: "$accelMagnitude",
      boundaries: [0, 0.1, 0.3, 0.5, 0.7, 1.0, 2.0, 5.0],
      default: "other",
      output: {
        count: { $sum: 1 },
        avgAccel: { $avg: "$accelMagnitude" }
      }
    }
  }
]);

