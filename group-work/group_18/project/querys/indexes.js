// Índice para login

db.users.createIndex({ email: 1 }, { unique: true });


// Índice para feed

db.posts.createIndex({ userId: 1, createdAt: -1 });


// Índice para hashtags

db.posts.createIndex({ hashtags: 1 });

// Índice para seguidores

db.follows.createIndex({ userId: 1 });
db.follows.createIndex({ targetId: 1 });

// Análise com explain()

db.posts.find({ userId: ObjectId("...") }).sort({ createdAt: -1 }).explain("executionStats");
