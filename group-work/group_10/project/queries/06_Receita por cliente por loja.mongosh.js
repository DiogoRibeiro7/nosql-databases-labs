
// Receita por cliente por loja (quem gasta onde)

// Seleciona explicitamente a base de dados correta
db = db.getSiblingDB("group_10_db");

db.rentals.aggregate([

  // 1) Considera apenas alugueres finalizados
  //    Garante que estamos a contar apenas receita efetiva
  { $match: { status: "returned" } },

  // 2) Abre o array "films":
  //    cada filme alugado passa a ser um documento separado
  { $unwind: "$films" },

  // 3) Agrupa por cliente e por loja
  {
    $group: {
      _id: {
        customerId: "$customerId",
        storeId: "$storeId"
      },

      // Soma o total gasto pelo cliente nessa loja
      revenue: { $sum: "$films.amount" },

      // Conta quantos filmes esse cliente alugou nessa loja
      rentals: { $sum: 1 }
    }
  },

  // 4) Ordena do cliente que mais gastou para o que menos gastou
  { $sort: { revenue: -1 } }

]).forEach(printjson);

