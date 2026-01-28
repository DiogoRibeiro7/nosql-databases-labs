/* eslint-disable no-undef */
// Updates a user's email address.
// Usage: mongosh queries/02_update_user_email.mongosh.js

db = db.getSiblingDB("group_01_flight_management_system_final");
print("Updating user email...");
const result = db.users.updateOne(
  { _id: ObjectId("6970f4706ce286344ba74913") },
  { $set: { email: "newemail@example.com" } }
);
printjson(result);
