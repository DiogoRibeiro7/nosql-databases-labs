// Dados de exemplo

db.users.insertMany([
  { username: "miguel", name: "Miguel Silva", email: "miguel@example.com", createdAt: new Date() },
  { username: "ricardo", name: "Ricardo Viana", email: "ricardo@example.com", createdAt: new Date() },
  { username: "rui", name: "Rui Santos", email: "rui@example.com", createdAt: new Date() }
]);

db.posts.insertMany([
  {
    userId: db.users.findOne({ username: "miguel" })._id,
    caption: "Primeiro post!",
    hashtags: ["#hello", "#first"],
    likes: 10,
    createdAt: new Date()
  }
]);

db.follows.insertOne({
  userId: db.users.findOne({ username: "ricardo" })._id,
  targetId: db.users.findOne({ username: "miguel" })._id,
  createdAt: new Date()
});