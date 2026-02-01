// ============================================
// QUERY 6: Calcular a magnitude total da aceleração do utilizador
// ============================================

// Switch to the correct database
db = db.getSiblingDB('iot_sensors');

// Base de dados: iot_sensors
// Coleção: motion_data
// Tipo: Cálculo e projeção
// 
// Descrição: Calcula a magnitude total do vetor de aceleração (√(x² + y² + z²)) 
//            e ordena pelos maiores valores.
// Uso: Analisar a intensidade geral do movimento, independentemente da direção.
//
// OBJETIVO EMPRESARIAL:
// Calcula a intensidade total do movimento, permitindo:
// - Classificar atividades por nível de intensidade (baixa, média, alta)
// - Desenvolver algoritmos de reconhecimento de atividades (AR - Activity Recognition)
// - Criar sistemas de scoring de atividade física para apps de fitness
// - Identificar picos de atividade para otimização de bateria em dispositivos IoT
// - Análise de padrões de movimento para personalização de experiência do utilizador
// ============================================

db.motion_data.aggregate([
  {
    $addFields: {
      accelerationMagnitude: {
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
    $project: {
      _id: 1,
      accelerationMagnitude: 1,
      userAcceleration: 1
    }
  },
  {
    $sort: { accelerationMagnitude: -1 }
  },
  {
    $limit: 20
  }
]).forEach(printjson);

