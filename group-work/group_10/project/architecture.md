
Arquitetura do Projeto Videoclube
1. Nome da Base de Dados
videoclube


2. Coleções
films

Descrição: Catálogo de filmes disponíveis para aluguer.
Campos principais: title (string) – obrigatório
description (string | null)
releaseYear (int | null)
rentalDurationDays (int) – obrigatório
rentalRate (double) – obrigatório
lastUpdate (date | null)
Índices: { title: "text" } para pesquisa por título
{ releaseYear: 1 }
Validator: Título obrigatório, preço ≥ 0, duração ≥ 1 dia


customers

Descrição: Registo dos clientes do videoclube.
Campos principais: firstName (string) – obrigatório
lastName (string) – obrigatório
email (string) – obrigatório, único
active (bool)
createDate (date)
lastUpdate (date | null)
Índices: { email: 1 } (único)
{ lastName: 1, firstName: 1 }
Validator: Email com regex, campos obrigatórios, active booleano


inventory

Descrição: Representa cada cópia física de um filme.
Campos principais: filmId (ObjectId) – obrigatório
format (enum: DVD, BluRay, Digital)
status (enum: available, rented, lost, maintenance)
lastUpdate (date | null)
Índices: { filmId: 1 }
{ status: 1 }
Validator: format e status com valores controlados


rentals

Descrição: Histórico de alugueres.
Campos principais: inventoryId (ObjectId)
filmId (ObjectId)
customerId (ObjectId)
rentalDate (date)
dueDate (date)
returnDate (date | null)
status (enum: rented, overdue, returned, cancelled)
amount (double)
lateFee (double | null)
lastUpdate (date | null)
Índices: { customerId: 1, rentalDate: -1 }
{ inventoryId: 1, rentalDate: -1 }
{ status: 1 }
{ dueDate: 1 }
Validator: Datas coerentes (dueDate > rentalDate), amount ≥ 0, status controlado


3. Relacionamentos

inventory.filmId → films._id
rentals.inventoryId → inventory._id
rentals.customerId → customers._id


4. Decisões de Modelagem

Separação de inventory para evitar arrays crescentes em films.
Uso de referências para manter integridade e facilitar consultas.
Validators para garantir consistência (tipos, enums, limites).


5. Diagrama Simplificado
films ───< inventory ───< rentals >─── customers




6. Justificativas

Refs vs Embed: Refs escolhidas para permitir escalabilidade e auditoria.
Índices: Criados para otimizar pesquisas por título, cliente, status e datas.
Validators: Implementados para prevenir dados inválidos e manter coerência.


7. Próximos Passos

Criar scripts create_collections.js com validators.
Criar create_indexes.js.
Preparar ficheiros JSON para seeds iniciais.
Documentar queries principais no diretório queries/.
