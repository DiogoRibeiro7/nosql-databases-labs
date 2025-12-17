/* global db, use */
use("EcommerceCrashCourse");

// Delete one product by name.
const hubDelete = db.products.deleteOne({ name: "USB-C Hub" });
print("USB-C Hub delete result:");
printjson(hubDelete);

// Delete many: remove deeply discounted accessories.
const clearanceDelete = db.products.deleteMany({
  category: "accessories",
  price: { $lt: 30 },
});
print("Clearance delete result:");
printjson(clearanceDelete);

// Delete contacts older than 30 days (example).
const cutoff = new Date();
cutoff.setDate(cutoff.getDate() - 30);
const staleContacts = db.contacts.deleteMany({ createdAt: { $lt: cutoff } });
print("Stale contacts delete result:");
printjson(staleContacts);

// Delete everything (commented out - dangerous!)
// db.products.deleteMany({});
