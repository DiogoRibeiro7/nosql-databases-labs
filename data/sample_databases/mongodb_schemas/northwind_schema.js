
// Suggested MongoDB Collections:
// 1. products (with embedded category and supplier)
// 2. customers (with embedded orders and order details)
// 3. employees (with territory assignments)

db.customers.insertOne({
  customer_id: "ALFKI",
  company_name: "Alfreds Futterkiste",
  contact: {
    name: "Maria Anders",
    title: "Sales Representative",
    phone: "030-0074321"
  },
  address: {
    street: "Obere Str. 57",
    city: "Berlin",
    postal_code: "12209",
    country: "Germany"
  },
  orders: [
    {
      order_id: 10248,
      order_date: ISODate("1996-07-04"),
      shipped_date: ISODate("1996-07-16"),
      ship_via: 3,
      freight: 32.38,
      order_details: [
        {
          product_id: 11,
          product_name: "Queso Cabrales",
          unit_price: 14,
          quantity: 12,
          discount: 0
        }
      ]
    }
  ]
});
