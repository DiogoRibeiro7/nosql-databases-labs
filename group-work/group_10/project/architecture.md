
# Arquitetura do Sistema de Videoclube (MongoDB)

Este documento descreve as decisões de modelação, estrutura das coleções, escolha de índices e estratégias de embedding/referencing utilizadas no projeto final do Grupo 10.

---

# 1. Visão Geral do Modelo de Dados

O sistema implementa um **videoclube** composto por quatro coleções principais:

- **customers** – clientes registados, com endereço embebido  
- **films** – catálogo de filmes  
- **stores** – lojas onde é possível alugar filmes, com localização geoespacial  
- **rentals** – registo histórico de alugueres, incluindo filmes embebidos  

customers ───┐
├── rentals (referência lógica por customerId e storeId)
films ───────┘
stores ──────┘



O modelo segue uma combinação equilibrada de **embedding** (para dados estáveis) e **referencing lógico** (para dados dinâmicos ou relacionamentos históricos).

---

# 2. Estrutura das Coleções e Justificação

## 2.1. customers
### Estrutura
Cada cliente contém:
- Identificador lógico `customerId`
- Informação pessoal
- Estado (`active`)
- Datas de criação e atualização
- **Endereço embebido**

### Porque usar *embedding* para o endereço?
O endereço:
- Não cresce indefinidamente  
- Não é partilhado por outras entidades  
- É de leitura muito frequente  
- Simplifica queries e evita `$lookup`

➡️ **Embedding é a escolha ideal.**

---

## 2.2. films
Filmes têm:
- Identificador lógico `filmId`
- Atributos fixos (título, descrição, ano)
- Preço de aluguer
- Política opcional de penalização (stockPolicy)

### Observações de design

- `stockPolicy` é opcional → por isso, é permitido `null`
- Não há lista de atores (manter o projeto simples)

### Decisão
Modelado como documento simples → não justifica referencing nem estruturas complexas.

---

## 2.3. stores
Lojas incluem:
- Identificador `storeId`
- Nome da loja
- Gestor (nome + optional staffId)
- Cidade
- Localização geoespacial com `{ type: "Point" }`

### Porque armazenar geolocalização?
Permite queries do tipo:
- “Qual a loja mais próxima de mim?”
- “Mostra todas as lojas num raio de 5 km”

➡️ Suporta índices **2dsphere**, necessários para `$near` e `geoWithin`.

---

## 2.4. rentals
A coleção mais importante contém:
- Datas de aluguer e devolução
- Estado (`rented`, `returned`, `overdue`, `cancelled`)
- **Lista embebida de filmes**
- Referências lógicas:
  - `customerId`
  - `storeId`

### Porque filmes estão embebidos?
- São **imutáveis no contexto histórico**  
- O preço aplicado pertence ao momento da transação  
- Evita múltiplos lookups desnecessários  
- Permite calcular faturação diretamente num só documento

➡️ **Embedding é a abordagem mais eficiente.**

### Porque referencing para clientes e lojas?
- Clientes podem mudar atributos (email, telefone, ativo)  
- Stores podem ser atualizadas  
- rentals é histórico → não deve ser alterado como um todo  
- Permite filtrar grandes volumes via índice composto

---

# 3. Estratégia de Embedding vs Referencing

| Situação | Estratégia | Justificação |
|---------|------------|--------------|
| Endereço do cliente | Embedding | Dados estáveis, leitura frequente |
| Filmes dentro do rental | Embedding | Registo imutável da transação, evita joins |
| Ligação rental → customer | Referência lógica | Dados mutáveis, histórico independente |
| Ligação rental → store | Referência lógica | Permite análises por loja |
| Localização da loja | Embedding simples | Estrutura pequena, ideal para 2dsphere |

---

# 4. Validação com JSON Schema

Todas as coleções utilizam `$jsonSchema` para assegurar:

- Tipos corretos (string, int, double, date, object)
- Campos obrigatórios
- Estruturas internas bem definidas
- `additionalProperties: false` para **evitar lixo na base de dados**
- Padrões (regex) em:
  - `customerId`: `CUST-XXX`
  - `filmId`: `FILM-XXX`
  - `storeId`: `STORE-XX`
  - `email`

➡️ Permite capturar erros **antes da inserção**, garantindo qualidade.

---

# 5. Índices e Razões de Existência

## 5.1 customers
- `{ email: 1 }` (unique)  
  → Evita duplicações e suporta login.

- `{ active: 1 }`  
  → Usado para listagens rápidas de clientes ativos.

- `{ "address.city": 1 }`  
  → Utilizado em relatórios por região.

---

## 5.2 films
- `{ title: "text" }`  
  → Pesquisa por palavras no título.

- `{ releaseYear: 1 }`  
  → Ordenação cronológica mais eficiente.

- `{ rentalRate: 1 }`  
  → Filtros por preço (filmes até X €).

---

## 5.3 stores
- `{ storeId: 1 }` (unique)  
  → Integridade no sistema.

- `{ storeName: 1 }`  
  → Listagens ordenadas.

- `{ "address.location": "2dsphere" }`  
  → Obrigatório para consultas geoespaciais.

---

## 5.4 rentals
- `{ customerId: 1, rentalDate: -1 }`  
  → Histórico ordenado por cliente.

- `{ status: 1, rentalDate: -1 }`  
  → Relatórios por estado (ex.: overdue).

- `{ storeId: 1, rentalDate: -1 }`  
  → Faturação e contadores por loja.

- `{ "films.filmId": 1 }`  
  → Identificar rapidamente todos os alugueres envolvendo determinado filme.

---

# 6. Justificação dos Principais Casos de Uso

O modelo foi pensado para suportar:

### • Consultas comerciais
- Faturação por loja  
- Faturação por dia/mês  
- Filmes mais alugados  
- Clientes com mais atividade  

### • Operações do dia a dia
- Criar novos rentals  
- Listar rentals ativos  
- Procurar filmes por preço, título ou ano  

### • Análises avançadas
- Proximidade de lojas (geospatial)  
- Tendência de alugueres ao longo do tempo  
- Distribuição de estados (rented/overdue/etc)

---

# 7. Considerações de Performance

As escolhas feitas permitem que:
- A maioria dos relatórios funcionem **sem joins**  
- HISTÓRICOS sejam triviais com índices compostos  
- Agregações de faturação funcionem diretamente sobre rentals  
- Buscas por texto sejam rápidas  
- Consultas geoespaciais funcionem de imediato  
- O sistema seja escalável sem sobrecarregar coleções

Estratégias adicionais descritas em `performance_analysis.md`.

---

# 8. Conclusão

O modelo adotado maximiza:
- Performance  
- Simplicidade  
- Validação de regras de negócio  
- Coerência com as melhores práticas de MongoDB  
- Requisitos do enunciado do projeto  

A combinação de embedding e referencing garante uma base eficiente, fácil de consultar e preparada para análises comerciais e operacionais do videoclube.


