//últimos empréstimos requisitados ATIVOS com limitador

use("mongo_project");

db.loans.aggregate([
  { $match: { status: "LOANED" } },
  { $sort: { loanDate: -1 } },
  { $lookup: { from: "books", localField: "bookId", foreignField: "_id", as: "book" } },
  { $unwind: "$book" },
  { $project: { _id: 0, loanId: "$_id", userId: "$userId", status: 1, loanDate: 1, title: "$book.title" } },
  { $limit: 10 }
]);

