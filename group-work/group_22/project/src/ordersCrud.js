const { ObjectId } = require("mongodb");
const { getDb } = require("./db");

// Insert (one) order
async function createOrder(order) {
  const db = await getDb();
  const result = await db.collection("orders").insertOne(order);
  return result.insertedId;
}

// Find (many) orders by status
async function findOrdersByStatus(status) {
  const db = await getDb();
  return db.collection("orders").find({ status }).toArray();
}

// Update (one) order's status
async function updateOrderStatus(id, newStatus) {
  const db = await getDb();
  return db.collection("orders").updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: newStatus } }
  );
}

// Delete (many) orders by status
async function deleteOrdersByStatus(status) {
  const db = await getDb();
  return db.collection("orders").deleteMany({ status });
}

module.exports = {
  createOrder,
  findOrdersByStatus,
  updateOrderStatus,
  deleteOrdersByStatus,
};
