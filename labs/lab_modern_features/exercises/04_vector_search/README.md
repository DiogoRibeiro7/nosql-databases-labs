# Exercise 04 · Vector Search

Combine MongoDB Atlas Vector Search (or simulated embeddings) with semantic search and recommendation flows.

## Goals
1. Store normalized embeddings alongside product, document, or media metadata.
2. Implement similarity queries for text, images, and hybrid metadata filters.
3. Explore approximate search parameters and post-processing (re-ranking, cosine similarity).

## Files
| File | Purpose |
| --- | --- |
| `starter.js` | Boilerplate for connecting, inserting embeddings, and issuing basic similarity queries. |
| `solution.js` | Full reference implementation triggered by `npm run vector-search`. |
| `test.js` | Verifies exported methods so you can extend with more precise assertions. |

## Workflow
1. Ensure embeddings exist (seed via `node setup/initialize_data.js`, which writes placeholder vectors).
2. Fill in the TODOs inside `starter.js` or explore `solution.js` for inspiration.
3. Update `test.js` with quantitative expectations (e.g., nearest neighbor counts) once you build your own dataset.
