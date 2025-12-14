# Exercise 05 · GridFS File Storage

Store and retrieve large assets using MongoDB GridFS, including metadata lookups and streaming APIs.

## Goals
1. Configure a GridFS bucket and upload/download sample files.
2. Attach metadata/tags and build queries over the `.files` collection.
3. Implement resumable downloads and transform streams for processing files in-flight.

## Files
| File | Purpose |
| --- | --- |
| `starter.js` | Boilerplate for connecting to GridFS and performing basic upload/download actions. |
| `solution.js` | Complete implementation run by `npm run gridfs`. |
| `test.js` | Minimal sanity test that ensures the exported helpers exist. |

## Workflow
1. Seed the GridFS sample via `node setup/initialize_data.js` or upload your own assets.
2. Use `starter.js` to experiment with new flows (chunk sizing, streaming adapters, etc.).
3. Run `node exercises/05_gridfs/test.js` to confirm the module exports the expected API.
