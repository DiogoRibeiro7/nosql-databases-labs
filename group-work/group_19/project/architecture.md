# Arquitetura & Modelo de Dados

## Visão do Domínio

Este projeto modela um sistema simples de catálogo/biblioteca utilizando um dataset público de livros. O dataset original fornece apenas informação estática sobre livros, pelo que o domínio foi estendido com entidades adicionais para suportar operações reais, como empréstimos, consultas multi-coleção e análise de performance.

O sistema permite responder a questões como:

- Quantos livros estão no catalogo
- Que categorias dominam o catálogo?
- Que utilizadores têm empréstimos ativos e que livros estão associados?
- Como a indexação afeta a performance de queries frequentes?

---

## Coleções

| Coleção | Papel                 | Descrição                                                                                                   |
| ------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| books   | Catálogo / Referência | Dataset principal importado. Coleção orientada a leitura e análise.                                         |
| users   | Master data           | Perfis mínimos de utilizadores, criados como seed data para suportar junções.                               |
| loans   | Factos operacionais   | Histórico de empréstimos, com crescimento ao longo do tempo, uso em queries multi-coleção e operações CRUD. |

---

## Estrutura dos Documentos

### books

```js
{
  _id: <Number | ObjectId>,
  title: String,
  isbn: Number,
  authors: [String],
  categories: [String],
  pageCount: Number,
  publishedDate: ISODate,
  thumbnailUrl: String,
  shortDescription: String,
  longDescription: String,
  status: "PUBLISHED" | "MEAP"
}
```

### users

```js
{
  _id: NumberInt,
  name: String,
  email: String,
}
```

### loans

```js
{
  _id: NumberInt,
  userId: NumberInt,
  bookId: <Number | ObjectId>,
  loanDate: ISODate,
  dueDate: ISODate,
  status: "LOANED" | "RETURNED",
  returnedDate: ISODate //So é definido após execução da query de update(14)
}
```

---

## Decisões de Modelação

A coleção `books` é tratada como fonte de verdade e não é alterada por operações de negócio. As ações operacionais (empréstimos) são armazenadas numa coleção separada (`loans`), evitando modificações diretas no dataset base.

Os empréstimos referenciam livros e utilizadores através de identificadores (`bookId` e `userId`), evitando duplicação de dados e permitindo que o histórico de empréstimos cresça sem limitar o tamanho dos documentos `books` ou `users`.

A coleção `users` contém apenas informação essencial e não sensível. O seu objetivo é suportar junções mas não implementar um sistema completo de autenticação.

A coleção `loans` é a única projetada para crescer continuamente, refletindo um padrão comum em sistemas reais onde dados históricos são acumulados para análise.

---

## Relações Entre Coleções

- **loans → users (N:1)**
  Um utilizador pode ter vários empréstimos ao longo do tempo.

- **loans → books (N:1)**
  Um livro pode ser emprestado várias vezes a diferentes utilizadores.

---

## Padrões de Acesso

As queries mais frequentes incluem:

- filtros e ordenações sobre `books` (categoria, autor, data de publicação);
- paginação de resultados para navegação;
- análise de qualidade de dados (campos em falta);
- obtenção de empréstimos ativos por utilizador com junção a `books`.

---

## Estratégia de Indexação

### Índices na coleção books

- `{ categories: 1 }`
  Suporta filtros por categoria (índice multikey).
- `{ authors: 1 }`
  Suporta filtros por autor.
- `{ publishedDate: -1 }`
  Suporta ordenação por livros mais recentes.
- `{ categories: 1, publishedDate: -1 }`
  Índice composto para filtros por categoria com ordenação por data.
- Índice de texto em `{ title, shortDescription, longDescription }`
  Permite pesquisa textual com `$text`.

### Índices na coleção users

- `{ email: 1 }` (único)
  Garante unicidade e evita duplicação de utilizadores.

---

## Performance e Otimização

## A performance da consulta é avaliada executando a mesma query na coleção `books` antes e depois da criação do índice composto `{ categories: 1, publishedDate: -1 }`, utilizando `explain("executionStats")` para comparar o plano de execução, o número de documentos examinados e o número de chaves de índice analisadas.

## Considerações Finais

A arquitetura adotada segue boas práticas de modelação NoSQL, privilegiando simplicidade, alinhamento entre modelo de dados, queries e índices, e evitando duplicação desnecessária de informação.
