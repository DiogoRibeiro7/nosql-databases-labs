// Top utilizadores com mais seguidores

db.follows.aggregate([
  { $group: { _id: "$targetId", followers: { $sum: 1 } } },
  { $sort: { followers: -1 } },
  { $limit: 5 }
]);


// Posts com mais likes

db.posts.aggregate([
  { $sort: { likes: -1 } },
  { $limit: 10 }
]);

//Número de posts por utilizador

db.posts.aggregate([
  { $group: { _id: "$userId", totalPosts: { $sum: 1 } } }
]);


// Feed de um utilizador (merge de follows + posts)

db.follows.aggregate([
  { $match: { userId: db.users.findOne({ username: "ricardo" })._id } },
  { $lookup: {
      from: "posts",
      localField: "targetId",
      foreignField: "userId",
      as: "feedPosts"
  }},
  { $unwind: "$feedPosts" },
  { $sort: { "feedPosts.createdAt": -1 } }
]);


// Hashtags mais usadas

db.posts.aggregate([
  { $unwind: "$hashtags" },
  { $group: { _id: "$hashtags", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);


// Número de comentários por post

db.comments.aggregate([
  { $group: { _id: "$postId", totalComments: { $sum: 1 } } }
]);


// Média de likes por utilizador

db.posts.aggregate([
  { $group: { _id: "$userId", avgLikes: { $avg: "$likes" } } }
]);


// Posts com hashtag específica

db.posts.aggregate([
  { $match: { hashtags: "#porto" } }
]);


// Últimas mensagens entre dois utilizadores

db.messages.aggregate([
  { $match: { senderId: ObjectId("..."), receiverId: ObjectId("...") } },
  { $sort: { createdAt: -1 } }
]);


// Utilizadores sugeridos (seguidores em comum)

db.follows.aggregate([
  { $group: { _id: "$targetId", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);


