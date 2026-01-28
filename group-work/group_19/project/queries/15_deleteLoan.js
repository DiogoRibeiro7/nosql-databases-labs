// Remover um empréstimo da coleção loans

use("mongo_project");

db.loans.deleteOne({ _id: 9001 });
