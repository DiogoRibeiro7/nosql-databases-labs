// ============================================
// QUERY 2: Encontrar os primeiros 10 documentos
// ============================================
// Base de dados: iot_sensors
// Coleção: motion_data
// Tipo: Consulta simples
// 
// Descrição: Retorna os primeiros 10 documentos para visualização inicial dos dados.
// Uso: Explorar a estrutura dos dados importados.
//
// OBJETIVO EMPRESARIAL:
// Permite à equipa de desenvolvimento e análise explorar rapidamente a estrutura
// dos dados sem processar grandes volumes. Facilita a compreensão inicial dos
// dados de sensores IoT, permitindo validação rápida e tomada de decisões sobre
// como processar e analisar os dados para insights de negócio.
// ============================================

db.motion_data.find().limit(10).pretty();

