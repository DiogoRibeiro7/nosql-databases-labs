// ============================================
// QUERY 1: Contar o total de documentos
// ============================================
// Base de dados: iot_sensors
// Coleção: motion_data
// Tipo: Contagem básica
// 
// Descrição: Retorna o número total de documentos na coleção.
// Uso: Verificar se todos os dados foram importados corretamente.
//
// OBJETIVO EMPRESARIAL:
// Esta query permite à empresa verificar a integridade dos dados após importação,
// garantindo que todos os dados de sensores foram corretamente armazenados.
// É essencial para validação de qualidade de dados e auditoria, assegurando
// que a base de dados está completa antes de análises críticas de negócio.
// ============================================

db.motion_data.countDocuments();

