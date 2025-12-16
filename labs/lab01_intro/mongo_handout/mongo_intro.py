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
    # Fail fast with a descriptive error when the URI is malformed.
    if not isinstance(uri, str):
        raise TypeError("MongoDB URI must be a string.")

    # The short timeout prevents the sample script from hanging if MongoDB
    # is not running on the student's machine.
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
    # Sanity-check identifiers before accessing PyMongo helpers.
    if not isinstance(db_name, str) or not db_name:
        raise TypeError("db_name must be a non-empty string.")
    if not isinstance(collection_name, str) or not collection_name:
        raise TypeError("collection_name must be a non-empty string.")

    # Delegate collection retrieval to PyMongo using the validated names.
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
    # PyMongo returns a list of strings directly, so we can forward it as-is.
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
    # Grab the parent database through the provided collection so students
    # can list related collections without reconnecting.
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

    # Return the documents so callers can decide how to present them.
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
