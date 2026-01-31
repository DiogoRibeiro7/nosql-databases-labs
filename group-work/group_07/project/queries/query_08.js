// ============================================
// QUERY 8: Calcular média de gravidade por componente
// ============================================

// Switch to the correct database
db = db.getSiblingDB('iot_sensors');

// Base de dados: iot_sensors
// Coleção: motion_data
// Tipo: Agregação com desvio padrão
// 
// Descrição: Calcula média e desvio padrão para cada componente do vetor gravitacional.
// Uso: Analisar a estabilidade da orientação do dispositivo em relação à gravidade.
//
// OBJETIVO EMPRESARIAL:
// Analisa a estabilidade e consistência da orientação do dispositivo:
// - Valida a qualidade dos dados de sensores (baixo desvio = dados consistentes)
// - Identifica problemas de calibração ou instabilidade do dispositivo
// - Suporta desenvolvimento de algoritmos de correção de orientação
// - Permite criar métricas de confiabilidade dos dados para sistemas críticos
// - Essencial para aplicações que dependem de orientação precisa (AR, navegação)
// ============================================

db.motion_data.aggregate([
  {
    $group: {
      _id: null,
      avgGravityX: { $avg: "$gravity.x" },
      avgGravityY: { $avg: "$gravity.y" },
      avgGravityZ: { $avg: "$gravity.z" },
      stdDevGravityX: { $stdDevPop: "$gravity.x" },
      stdDevGravityY: { $stdDevPop: "$gravity.y" },
      stdDevGravityZ: { $stdDevPop: "$gravity.z" }
    }
  }
]).forEach(printjson);

