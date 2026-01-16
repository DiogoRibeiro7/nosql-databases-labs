
// Suggested MongoDB Collections:
// 1. artists (with embedded albums and tracks)
// 2. customers (with embedded invoices and invoice lines)
// 3. playlists (with track references)

db.artists.insertOne({
  artist_id: 1,
  name: "AC/DC",
  albums: [
    {
      album_id: 1,
      title: "For Those About To Rock",
      tracks: [
        {
          track_id: 1,
          name: "For Those About To Rock",
          composer: "Angus Young",
          milliseconds: 343719,
          unit_price: 0.99,
          genre: { id: 1, name: "Rock" },
          media_type: { id: 1, name: "MPEG audio file" }
        }
      ]
    }
  ]
});
