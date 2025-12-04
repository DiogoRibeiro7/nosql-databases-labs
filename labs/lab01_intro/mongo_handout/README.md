
# MongoDB: Connecting and Exploring Data (Python & JavaScript)

This handout shows how to connect to a **local MongoDB database** and explore data using **Python** and **JavaScript (Node.js)**.

It is meant for students who already have MongoDB installed locally (e.g. via MongoDB Community Server, Docker, or similar).

---

## 1. Core concepts

Very short definitions your students can remember:

- **MongoDB Server**: the process running on your machine (by default on port `27017`).
- **Database**: a logical grouping of data (e.g. `library`, `shop`, `school`).
- **Collection**: similar to a table in SQL, but stores JSON-like objects (e.g. `books`, `students`).
- **Document**: one JSON-like record inside a collection.

Example document in a `books` collection:

```json
{
  "_id": 1,
  "title": "Unlocking Android",
  "isbn": "1933988673",
  "pageCount": 416
}
```

---

## 2. Check that MongoDB is running (using `mongosh`)

Before writing code, make sure the MongoDB **server** is actually running.

1. Open a terminal and run:

   ```bash
   mongosh
   ```

2. Inside `mongosh`, run:

   ```js
   show dbs        // list existing databases
   use library     // or any db name you want
   show collections
   ```

If this works, the server is running and listening on `mongodb://localhost:27017`.

If not, you need to start the MongoDB service or container. The exact command depends on how MongoDB was installed.

---

## 3. Connecting with Python (PyMongo)

### 3.1. Install the driver

In a terminal:

```bash
python -m pip install "pymongo[srv]"
```

### 3.2. Minimal but structured example

File: `mongo_intro.py`

```python
from typing import Any, Dict, List
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.errors import ConnectionFailure


def get_mongo_client(uri: str = "mongodb://localhost:27017") -> MongoClient:
    """
    Create and return a connected MongoClient instance.

    Parameters
    ----------
    uri : str
        MongoDB connection URI. For a local server, usually "mongodb://localhost:27017".

    Returns
    -------
    MongoClient
        A connected MongoClient.

    Raises
    ------
    TypeError
        If `uri` is not a string.
    ConnectionFailure
        If the server cannot be reached.
    """
    if not isinstance(uri, str):
        raise TypeError("MongoDB URI must be a string.")

    client = MongoClient(uri, serverSelectionTimeoutMS=5000)

    # 'ping' is a simple command to check that MongoDB is reachable.
    client.admin.command("ping")

    return client


def get_collection(
    client: MongoClient,
    db_name: str,
    collection_name: str,
) -> Collection:
    """
    Get a MongoDB collection handle.

    Parameters
    ----------
    client : MongoClient
        Active MongoDB client.
    db_name : str
        Name of the database (e.g. 'library').
    collection_name : str
        Name of the collection (e.g. 'books').

    Returns
    -------
    Collection
        A PyMongo Collection object.

    Raises
    ------
    TypeError
        If db_name or collection_name are not non-empty strings.
    """
    if not isinstance(db_name, str) or not db_name:
        raise TypeError("db_name must be a non-empty string.")
    if not isinstance(collection_name, str) or not collection_name:
        raise TypeError("collection_name must be a non-empty string.")

    db = client[db_name]
    return db[collection_name]


def list_databases(client: MongoClient) -> List[str]:
    """
    List existing database names.

    Parameters
    ----------
    client : MongoClient
        Active MongoDB client.

    Returns
    -------
    list of str
        Names of databases.
    """
    return client.list_database_names()


def list_collections(collection: Collection) -> List[str]:
    """
    List collections in the parent database of `collection`.

    Parameters
    ----------
    collection : Collection
        Any collection from the database.

    Returns
    -------
    list of str
        Names of collections in the same database.
    """
    db = collection.database
    return db.list_collection_names()


def find_example_documents(collection: Collection) -> List[Dict[str, Any]]:
    """
    Example 'find' query to explore data.

    Parameters
    ----------
    collection : Collection
        Target collection (e.g. 'books').

    Returns
    -------
    list of dict
        The documents returned by the query.
    """
    # 1) Find ALL documents:
    # docs = list(collection.find({}))

    # 2) Find documents with a filter:
    #    here: all books with more than 300 pages
    docs = list(collection.find({"pageCount": {"$gt": 300}}))

    # 3) Limit and sort (uncomment to try):
    # docs = list(
    #     collection.find({})
    #     .sort("pageCount", -1)  # -1 = descending, 1 = ascending
    #     .limit(5)
    # )

    return docs


if __name__ == "__main__":
    client: MongoClient | None = None

    try:
        client = get_mongo_client()

        print("Databases available:", list_databases(client))

        # Choose your database and collection
        books_collection = get_collection(client, "library", "books")
        print("Collections in 'library':", list_collections(books_collection))

        documents = find_example_documents(books_collection)

        print("Example documents:")
        for doc in documents:
            print(doc)

    except ConnectionFailure as exc:
        print("Could not connect to MongoDB:", exc)
    except Exception as exc:
        # For teaching: catch any unexpected error
        print("Unexpected error:", exc)
    finally:
        if client is not None:
            client.close()
```

### 3.3. What students should understand

- How to create a `MongoClient` for a local server.
- How to:
  - List databases (`list_database_names()`).
  - Choose a database and collection (`client["library"]["books"]`).
  - Run `.find()` with filters, sorting, and limit.

Encourage them to modify the filter and print only selected fields.

---

## 4. Connecting with JavaScript (Node.js)

### 4.1. Install the driver

In the project folder:

```bash
yarn add mongodb
```

Use Node.js 18 or newer.

### 4.2. Connection and exploration example (ES modules)

File: `mongo_intro.js`

```js
// mongo_intro.js
/**
 * Small script that:
 *  - connects to a local MongoDB server
 *  - lists databases and collections
 *  - runs a simple query on a 'books' collection
 */

import { MongoClient } from "mongodb";

/**
 * Create and return a connected MongoClient.
 *
 * @param {string} [uri="mongodb://localhost:27017"]
 *   MongoDB connection URI.
 * @returns {Promise<MongoClient>}
 *   Connected MongoClient.
 * @throws {TypeError}
 *   If URI is not a string.
 * @throws {Error}
 *   If connection fails.
 */
async function getMongoClient(uri = "mongodb://localhost:27017") {
  if (typeof uri !== "string") {
    throw new TypeError("MongoDB URI must be a string.");
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  // Connect and ping to confirm.
  await client.connect();
  await client.db("admin").command({ ping: 1 });

  return client;
}

/**
 * List database names for exploration.
 *
 * @param {MongoClient} client
 * @returns {Promise<string[]>}
 */
async function listDatabases(client) {
  const adminDb = client.db().admin();
  const { databases } = await adminDb.listDatabases();
  return databases.map((db) => db.name);
}

/**
 * Get a collection from a database.
 *
 * @param {MongoClient} client
 * @param {string} dbName
 * @param {string} collectionName
 * @returns {import("mongodb").Collection}
 */
function getCollection(client, dbName, collectionName) {
  if (typeof dbName !== "string" || dbName.length === 0) {
    throw new TypeError("dbName must be a non-empty string.");
  }
  if (typeof collectionName !== "string" || collectionName.length === 0) {
    throw new TypeError("collectionName must be a non-empty string.");
  }

  const db = client.db(dbName);
  return db.collection(collectionName);
}

/**
 * List collection names in a database.
 *
 * @param {MongoClient} client
 * @param {string} dbName
 * @returns {Promise<string[]>}
 */
async function listCollections(client, dbName) {
  const db = client.db(dbName);
  const collections = await db.collections();
  return collections.map((c) => c.collectionName);
}

/**
 * Run example queries on the 'books' collection.
 *
 * @param {import("mongodb").Collection} collection
 * @returns {Promise<object[]>}
 */
async function findExampleDocuments(collection) {
  // 1) Find all documents:
  // const docs = await collection.find({}).toArray();

  // 2) Filter: books with more than 300 pages,
  //    sorted by pageCount descending, limited to 5 results.
  const docs = await collection
    .find({ pageCount: { $gt: 300 } })
    .sort({ pageCount: -1 })
    .limit(5)
    .toArray();

  return docs;
}

async function main() {
  let client;

  try {
    client = await getMongoClient();

    const dbNames = await listDatabases(client);
    console.log("Databases:", dbNames);

    const dbName = "library";
    const collectionName = "books";

    const collections = await listCollections(client, dbName);
    console.log(`Collections in '${dbName}':`, collections);

    const booksCollection = getCollection(client, dbName, collectionName);
    const docs = await findExampleDocuments(booksCollection);

    console.log("Example documents:");
    for (const doc of docs) {
      console.log(doc);
    }
  } catch (error) {
    console.error("Error while working with MongoDB:", error);
    process.exitCode = 1;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
```

> **Note for students**  
> To run this as an ES module, either:
>
> - Name the file `mongo_intro.mjs`, **or**
> - Add `"type": "module"` to `package.json`.
>
> Then run:
>
> ```bash
> node mongo_intro.js
> ```

---

## 5. Common query patterns (Python & JS)

These patterns are similar in Python and JavaScript.

### 5.1. Basic filters

- All documents:

  - Python:

    ```python
    list(collection.find({}))
    ```

  - JavaScript:

    ```js
    await collection.find({}).toArray();
    ```

- Field equal to value, e.g. `pageCount == 416`:

  - Python:

    ```python
    list(collection.find({"pageCount": 416}))
    ```

  - JavaScript:

    ```js
    await collection.find({ pageCount: 416 }).toArray();
    ```

- Comparison operators:

  | Operator | Meaning       | Example                          |
  |----------|---------------|----------------------------------|
  | `$gt`    | greater than  | `{"pageCount": {"$gt": 300}}`    |
  | `$lt`    | less than     | `{"pageCount": {"$lt": 200}}`    |
  | `$gte`   | greater or == | `{"pageCount": {"$gte": 500}}`   |
  | `$lte`   | less or ==    | `{"pageCount": {"$lte": 100}}`   |

### 5.2. Projection (select only some fields)

- Python:

  ```python
  list(collection.find(
      {"pageCount": {"$gt": 300}},
      {"title": 1, "pageCount": 1, "_id": 0}
  ))
  ```

- JavaScript:

  ```js
  await collection
    .find(
      { pageCount: { $gt: 300 } },
      { projection: { title: 1, pageCount: 1, _id: 0 } },
    )
    .toArray();
  ```

### 5.3. Sorting and limiting

- Python:

  ```python
  list(
      collection.find({})
      .sort("pageCount", -1)  # -1 desc, 1 asc
      .limit(10)
  )
  ```

- JavaScript:

  ```js
  await collection
    .find({})
    .sort({ pageCount: -1 })
    .limit(10)
    .toArray();
  ```

---

## 6. Suggested exercises for students

You can provide a `books` collection and ask students to:

1. List all databases and collections.
2. Count how many books have more than 300 pages.
3. Find the top 5 longest books and print only `title` and `pageCount`.
4. Find all books where `title` contains a given word.
5. Insert a new book into the collection and confirm that it appears in the query results.
6. Modify the queries to:
   - Sort ascending instead of descending.
   - Change the limit (e.g. top 3, top 10).
   - Select only specific fields with projection.

These tasks help them become comfortable with connecting to MongoDB, exploring existing data, and writing simple queries in both Python and JavaScript.
