## Database Design

DataBase food_express
Collections Orders
Collections Restaurants

```javascript


{
  "_id": {
    "$oid": "690367d6b52abfb7d152f782"
  },
  "orderNumber": "ORD-1001",
  "restaurantId": {
    "$oid": "067f7d3d9be342e3957ff81d"
  },
  "items": [
    {
      "name": "Pâtes Carbonara",
      "qty": 2,
      "unitPrice": 16.6
    },
    {
      "name": "Burger Gourmet",
      "qty": 1,
      "unitPrice": 17.91
    }
  ],
  "totalPrice": 108.05,
  "status": "delivered",
  "createdAt": {
    "$date": "2025-10-22T00:00:00.000Z"
  }
}

{
  "_id": {
    "$oid": "51fe29d3685d4a0a9f055a87"
  },
  "name": "Pizza Pino Nice",
  "type": "Libanais",
  "rating": 3.6,
  "open": false,
  "address": {
    "street": "61 rue de Bordeaux",
    "city": "Bordeaux",
    "postalCode": "88455"
  },
  "menu": [
    {
      "item": "Tiramisu",
      "price": 15.92,
      "category": "dessert"
    },
    {
      "item": "Lasagnes",
      "price": 11.99,
      "category": "dessert"
    }
  ]
}

