# Practice Exercises

These labs are a grab bag of quick MongoDB drills. Each subfolder targets a specific skill (CRUD, aggregation, map/reduce rewrites). Run every script with `mongosh` from this directory (or copy/paste commands) so the relative paths stay consistent.

## Folder Map

| Folder | Focus | How to Run |
| --- | --- | --- |
| `1. find, insert, update, remove` | CRUD warm-ups with small catalog datasets | `mongosh "1. find, insert, update, remove/<dataset>.js"` |
| `2. aggregate` | Aggregation builders for user, cheese, zips, BEL20 data | `mongosh "2. aggregate/<dataset>.js"` |
| `3. map, reduce` | Modern aggregation equivalents for the old mapReduce labs (first names, NYSE, tweets, etc.) | `mongosh "3. map, reduce/<script>.js"` |

## Data Imports

- `3. map, reduce/firstnames/firstnames.json`: `mongoimport --db exercises --collection firstnames --drop --file firstnames.json --jsonArray`.
- `3. map, reduce/tweets/tweets.json`: `mongoimport --db exercises --collection tweets --drop --file tweets.json --jsonArray`.
- Any script that references `db.nyse` or `db.people` expects you to import the matching `*.json` file in the same folder beforehand.

The CRUD scripts now drop their collections at the top, so feel free to rerun them while experimenting without duplicating data. When you finish a JSON import, re-run the script to reset indexes/aggregations to a clean state.
