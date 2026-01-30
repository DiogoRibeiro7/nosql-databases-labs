use("healthcare");

/*
Business Case:
Gestão e consulta de dados demográficos dos pacientes, permitindo
localização rápida de registos clínicos e apoio ao atendimento
administrativo e médico.

Utilizadores alvo:
- Administração
- Profissionais de saúde
*/

// 1. Listar todos os pacientes
db.Patients.find().pretty();

// 2. Procurar paciente por ID
db.Patients.findOne({ patientId: "P0001" });

// 3. Procurar pacientes por apelido
db.Patients.find({ "name.last": "Silva" });

// 4. Listar pacientes ordenados por apelido
db.Patients.find().sort({ "name.last": 1 });

// 5. Contar número total de pacientes
db.Patients.countDocuments();
