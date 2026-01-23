# Group 19 - MongoDB NoSQL Database Project

## Team Members
| Name | Student ID | Email | Contribution % |
| ---- | ---------- | ----- | -------------- |
| Nuno SIlva | 40210353 | 40210353@esmad.ipp.pt | 33,3% |
| Diogo Vieira | 40210454 | 40210454@esmad.ipp.pt | 33,3% |
| Francisco Araújo | 40220422 | 40220422@esmad.ipp.pt | 33,3% |


# Projeto Final MongoDB — Dataset Books

Este repositório demonstra modelação NoSQL e queries em MongoDB usando um dataset público de livros (books) e duas coleções adicionais criadas para suportar operações “reais” de biblioteca: users e loans.

O objetivo é mostrar:

- queries de exploração (find, projeções, filtros, ordenações, paginação);
- qualidade de dados (campos em falta);
- pesquisa (regex e $text);
- agregações ($unwind, $group, $sort, $limit);
- CRUD em coleções próprias;
- um exemplo de “before/after index” em books.

## Estrutura do Repositório

| Caminho           | Descrição                                                   |
| ----------------- | ----------------------------------------------------------- |
| `data/`           | Ficheiro JSON no data set base (`books`).                   |
| `queries/`        | Scripts JavaScript com as queries. indices e coleções.      |
| `architecture.md` | Justificação da modelação das coleções, relações e índices. |
| `README.md`       | Visão geral do projeto e guia de execução.                  |

---

## Dataset

O projeto utiliza um dataset público de livros, tratado como **catálogo principal**.

Para suportar operações multi-coleção e queries mais próximas de um cenário real, foram criadas duas coleções adicionais com seed data:

- **books**: Dataset principal importado. Coleção orientada a leitura e análise.
- **users**: Perfis mínimos de utilizadores, criados como seed data para suportar junções.
- **loans**: Histórico de empréstimos, com crescimento ao longo do tempo, uso em queries multi-coleção e operações CRUD.

O dataset `books` é tratado como fonte de verdade e não é alterado por operações de negócio.
A coleção `loans`\* representa eventos operacionais (empréstimos) e é separada da coleção books para evitar crescimento ilimitado de documentos e permitir queries temporais eficientes.

## Coleções e Modelação

### books

Coleção principal do projeto, contendo informação bibliográfica:

- identificador
- título
- isbn
- número de páginas
- data publicação
- link para a thumbnail
- descrição pequena
- descrição longa
- status
- autores
- categorias

Nesta dataset foi usada indexação.

### users

Coleção com dados mínimos de utilizadores:

- identificador
- nome
- email

Criada para permitir queries multi-coleção.

### loans

Coleção operacional que representa empréstimos de livros:

- identificador utilizador (`userId`)
- identificador do livro (`bookId`)
- data do empréstimo
- prazo
- estado
- data entrega

Esta coleção é utilizada para demonstrar CRUD, `$lookup`.

---

## Objetivos de Aprendizagem Atingidos

- Utilização da linguagem de queries do MongoDB (`find`, `update`, `delete`, `insert`, `aggregate`).
- Modelação NoSQL com múltiplas coleções relacionadas por referência.
- Criação de índices simples e compostos para otimização de performance.
- Implementação explícita de operações CRUD.
- Análise de performance com queries before/after index.

---

## Queries Implementadas

As queries encontram-se organizadas na pasta `queries/` e cobrem os seguintes blocos funcionais:

### Exploração do Dataset

- contagem total de livros (`countDocuments`);
- amostragem e projeção de campos;
- filtros por categoria e autor.

### Análise e Filtros

- intervalos de datas de publicação;
- ordenação por data e número de páginas;
- paginação de resultados com `skip` e `limit`;
- análise de qualidade de dados (campos em falta);
- pesquisa por regex;
- pesquisa textual com índice de texto.

### Aggregation

- exibe os livros requisitados mencionando o utilizador usando `$match`, `&sort`;

### CRUD

- inserção de novos empréstimos (`insertOne`);
- atualização de status de empréstimos (`updateOne`);
- remoção de empréstimos (`deleteOne`).

### Multi-Coleção

- junção de dados entre `loans` e `users` usando `$lookup`;
- projeção de resultados combinados.

### Performance

- execução de uma agregação antes e depois da criação de um índice composto;
- demonstração do impacto do índice em queries frequentes;
- utilização de `explain("executionStats")` para análise do plano de execução.

---

## Índices

Foram criados índices de acordo com os padrões reais de acesso:

- índices multikey em campos do catálogo (`categories`, `authors`);
- índice em `publishedDate` para ordenações por data mais recente;
- índice composto para filtros + ordenação;
- índice de texto para pesquisa textual;
- índice único sobre `email` previne duplicação de utilizadores.

---

## Execução do Projeto

1. Importar o dataset `books` para o MongoDB (ex.: MongoDB Compass).
2. Executar o script `00_collections.js` de criação das coleções adicionais (`users` e `loans`).
3. Criar os índices definidos no projeto executando o script `00_setup.js`.
4. Executar as queries da pasta `queries/` individualmente através do mongosh ou MongoDB Compass.
5. As queries são independentes, exceto a query 13(insert) e 15(delete).

---
