// faturação por loja e por filme
// Usage: mongosh queries/01_receita_por_loja_e_filme.mongosh.js


db.rentals.aggregate([
  // Filtramos apenas os alugueres finalizados
  { $match: { status: "returned" } },

  //  "Desmembramos" o array de filmes. 
  // Se um aluguer tiver 3 filmes, passamos a ter 3 documentos temporários.

  { $unwind: "$films" },

  // Agrupamos por Loja e por Filme
  { $group: {
      _id: { 
        storeId: "$storeId", 
        filmId: "$films.filmId",
        title: "$films.title" // Aproveitamos a denormalização para mostrar o nome!
      },
      totalRevenue: { $sum: "$films.amount" }, // Soma o valor de cada filme
      count: { $sum: 1 }                       // Conta quantas vezes foi alugado
  }},

  // Ordenamos pelos que renderam mais dinheiro
  { $sort: { totalRevenue: -1 } }
]).forEach(doc => printjson(doc));