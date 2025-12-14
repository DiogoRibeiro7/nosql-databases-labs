# Exercise 01 · Change Streams

Monitor real-time data changes and build alerting workflows using MongoDB change streams.

## Goals
1. Open a basic change stream on a collection.
2. Filter the stream to react only to specific operations.
3. Resume a stream from a saved token and fan out alerts to other collections.

## Files
| File | Purpose |
| --- | --- |
| `starter.js` | Skeleton with connection boilerplate and TODO markers for each task. |
| `solution.js` | Reference implementation executed by `npm run change-streams`. |
| `test.js` | Lightweight structural test; extend it with your own assertions. |

## Workflow
1. Copy/rename `starter.js` if you plan to build your own solution.
2. Ensure MongoDB is running as a replica set (see Lab 05 instructions) and set `MONGODB_URI` in `.env`.
3. Run the provided seeding script (`node setup/initialize_data.js`) to load sample data.
4. Execute `node starter.js` (or `npm run change-streams`) to iterate through the tasks.
5. Update the tests in `test.js` once you implement additional functionality (e.g., verifying alerts).*** End Patch*** End Patch
