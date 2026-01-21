
// Seleciona a base de dados do projeto
db = db.getSiblingDB("food_express");

print("Recent orders >= 20€:");

// Pesquisa na coleção orders
db.orders.find( { totalPrice: { $gte: 20 } },

    // Projeção: define quais os campos a mostrar (0 = esconder, 1 = mostrar)
    {
      _id: 0, orderNumber: 1,restaurantId: 1,totalPrice: 1,status: 1,createdAt: 1
    }
  )

  // Ordena as encomendas da mais recente para a mais antiga
  .sort({ createdAt: -1 })

  // Limita o resultado às 10 encomendas mais recentes
  .limit(10)

  // Imprime cada documento de forma legível no terminal
  .forEach((doc) => printjson(doc));