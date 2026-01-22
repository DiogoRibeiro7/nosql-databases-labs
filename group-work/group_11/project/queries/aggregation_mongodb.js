//fazer a soma total de listings por tipo de quarto
db.porto_listings.aggregate([
  {
    $group: {
      _id: "$room_type",
      total: { $sum: 1 }
    }
  }
]);
//listar os alojamentos no bairro Baixa com 3 ou mais camas e rating superior a 4.2
db.porto_listings.find({
  neighbourhood: "Baixa",
  beds: { $gte: 3 },
  review_scores_rating: { $gte: 4.2 }
});
//listar os 5 bairros com maior numero de hosts unicos
db.porto_listings.aggregate([
  {
    $group: {
      _id: {
        neighbourhood: "$neighbourhood",
        host_id: "$host_id"
      }
    }
  },
  {
    $group: {
      _id: "$_id.neighbourhood",
      total_hosts: { $sum: 1 }
    }
  },
  {
    $sort: { total_hosts: -1 }
  }
]);
