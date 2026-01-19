
// receita por cliente por loja (quem gasta onde)

// Seleciona explicitamente a base de dados "group_10_db".
// getSiblingDB é seguro e evita problemas se o script for corrido noutra DB por engano.
db = db.getSiblingDB("group_10_db");

db.rentals.aggregate([

  // 1) $unwind abre o array "films" criando um documento por cada filme alugado.
  //    Exemplo:
  //    Se um rental tiver 2 filmes, passa a ser 2 documentos separados.
  { $unwind: "$films" },

  // 2) $group agrega por filmId — ou seja, junta todos os rentals que
  //    incluíram cada filme.
  {
    $group: {
      _id: "$films.filmId",         // filmId torna-se a chave da agregação

      // $first retorna o primeiro título encontrado.
      // Como todos os documentos desse grupo têm o mesmo título,
      // isto é suficiente e eficiente.
      title: { $first: "$films.title" },

      // Soma o amount de cada rental para calcular a receita total desse filme.
      revenue: { $sum: "$films.amount" }
    }
  },

  // 3) Ordena os filmes pela receita total, do maior para o menor.
  { $sort: { revenue: -1 } }

  // Por fim, imprime cada documento do resultado em formato JSON legível.
]).forEach(printjson);
