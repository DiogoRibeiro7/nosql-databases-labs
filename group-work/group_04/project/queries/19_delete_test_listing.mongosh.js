// Query 19: Delete Test Listing (DELETE)
// Demonstrates delete operation
// Usage: mongosh queries/19_delete_test_listing.mongosh.js

db = db.getSiblingDB("group_04_airbnb");

print("\n=== Delete Test Listing ===\n");

const TEST_LISTING_ID = 99999;

// Check if test listing exists
const existingListing = db.listings.findOne({ listing_id: TEST_LISTING_ID });

if (existingListing) {
  print("Test listing found:");
  printjson({
    listing_id: existingListing.listing_id,
    name: existingListing.name,
    host_name: existingListing.host.host_name
  });

  // Delete the test listing
  print("\nDeleting test listing...");
  const deleteResult = db.listings.deleteOne({ listing_id: TEST_LISTING_ID });
  printjson(deleteResult);

  // Verify deletion
  const verifyDeletion = db.listings.findOne({ listing_id: TEST_LISTING_ID });
  if (!verifyDeletion) {
    print("\n✓ Listing successfully deleted");
  } else {
    print("\n✗ Deletion failed");
  }
} else {
  print("Test listing (ID 99999) not found.");
  print("Run query 17 first to create the test listing.");
}

print("\n✓ Query executed successfully\n");
