db = db.getSiblingDB("group_10_db");

// Exemplo: Coordenadas atuais do cliente (ex: Terreiro do Paço)


const userLocation = [-9.1360, 38.7075]; 

print("--- A encontrar a loja mais próxima do utilizador ---");

db.stores.find({
  "address.location": {
    $near: {
      $geometry: {
         type: "Point",
         coordinates: userLocation
      },
      $maxDistance: 10000 // Limitar a 10km
    }
  }
}).limit(1).forEach(printjson);