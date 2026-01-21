// Crud

// Criar Utilizador
db.users.insertOne({ username: "joao", email: "joao@example.com", createdAt: new Date() });


// Encontrar Utilizador
db.users.findOne({ username: "miguel" });


// Atualizar Bio Utilizador
db.users.updateOne({ username: "miguel" }, { $set: { bio: "Nova bio!" } });


// Apagar Utilizador
db.users.deleteOne({ username: "rui" });

// Criar Post
db.posts.insertOne({
  userId: db.users.findOne({ username: "miguel" })._id,
  caption: "Mais um dia!",
  hashtags: ["#porto"],
  likes: 0,
  createdAt: new Date()
});

// Like num Post
db.posts.updateOne({ _id: ObjectId("...") }, { $inc: { likes: 1 } });


// Comentar num Post
db.comments.insertOne({
  postId: ObjectId("..."),
  userId: db.users.findOne({ username: "ricardo" })._id,
  text: "Adorei!",
  createdAt: new Date()
});


// Seguir Utilizador
db.follows.insertOne({
  userId: db.users.findOne({ username: "ricardo" })._id,
  targetId: db.users.findOne({ username: "miguel" })._id,
  createdAt: new Date()
});
