db = db.getSiblingDB("food_express");

print("Recent orders >= 20€:");

// Search in the collection "orders" for orders with totalPrice >= 80€
db.orders.find( { totalPrice: { $gte: 80 } },

    // Projeção: define quais os campos a mostrar (0 = esconder, 1 = mostrar)
    {
      _id: 0, orderNumber: 1,restaurantId: 1,totalPrice: 1,status: 1,createdAt: 1
    }
  )

  // Ordena as encomendas da mais recente para a mais antiga
  .sort({ createdAt: -1 })


  .limit(10)


  .forEach((doc) => printjson(doc));