#!/bin/bash

# Lab 03 - MongoDB sample data import
# Converts bundled JSON arrays or mongoexport files to NDJSON before importing.
set -euo pipefail

DATA_DIR="starter/data"
IMPORT_DIR="$DATA_DIR/mongoimport"

echo "Preparing NDJSON copies for mongoimport..."
python - "$DATA_DIR" <<'PY'
import json
import sys
from pathlib import Path

root = Path(sys.argv[1])
ndjson_dir = root / "mongoimport"
ndjson_dir.mkdir(exist_ok=True)

datasets = ["movies", "theaters", "users", "comments", "sessions"]
for name in datasets:
    src = root / f"{name}.json"
    dest = ndjson_dir / f"{name}.json"
    text = src.read_text(encoding="utf-8").strip()
    if not text:
        raise SystemExit(f"{src} is empty")
    if text.startswith("["):
        docs = json.loads(text)
    else:
        docs = [json.loads(line) for line in text.splitlines() if line.strip()]
    with dest.open("w", encoding="utf-8") as out:
        for doc in docs:
            out.write(json.dumps(doc))
            out.write("\n")
PY

echo "Setting up lab03_movies database..."
for collection in movies theaters users comments sessions; do
  echo "Importing $collection..."
  mongoimport \
    --drop \
    --db lab03_movies \
    --collection "$collection" \
    --file "$IMPORT_DIR/$collection.json" \
    --type json
done

echo "Database setup complete!"
echo "To verify, run in mongosh:"
echo "  use lab03_movies"
echo "  db.movies.countDocuments()"
echo "  db.theaters.countDocuments()"
echo "  db.users.countDocuments()"
echo "  db.comments.countDocuments()"
echo "  db.sessions.countDocuments()"
