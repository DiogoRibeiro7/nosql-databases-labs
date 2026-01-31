// src/orderItemsCrud.js
const { ObjectId } = require("mongodb");
const { getDb } = require("./db");

// Insert one order item
async function createOrderItem(orderItem) {
  const db = await getDb();
  const result = await db.collection("order_items").insertOne(orderItem);
  return result.insertedId;
}

// Find many order items by order
async function findOrderItemsByOrder(orderId) {
  const db = await getDb();
  return db
    .collection("order_items")
    .find({ orderId: new ObjectId(orderId) })
    .toArray();
}

// Update one order item's quantity
async function updateOrderItemQuantity(id, newQty) {
  const db = await getDb();
  return db.collection("order_items").updateOne(
    { _id: new ObjectId(id) },
    { $set: { qty: newQty } }
  );
}

// Delete many order items by order
async function deleteOrderItemsByOrder(orderId) {
  const db = await getDb();
  return db.collection("order_items").deleteMany({
    orderId: new ObjectId(orderId),
  });
}

module.exports = {
  createOrderItem,
  findOrderItemsByOrder,
  updateOrderItemQuantity,
  deleteOrderItemsByOrder,
};
