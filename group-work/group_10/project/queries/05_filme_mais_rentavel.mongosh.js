
db = db.getSiblingDB("group_10_db");


//A pipeline começa na coleção rentals.
//Cada documento representa um aluguer, que pode conter vários filmes.

db.rentals.aggregate([

  //$unwind Cria um documento por cada filme alugado
  { $unwind: "$films" },

  //Agrupar por filme

  { $group: {
      _id: "$films.filmId", 
      title: { $first: "$films.title" },
      revenue: { $sum: "$films.amount" } 
  }},
  { $sort: { revenue: -1 } }
]).forEach(printjson);

