## MongoDB Intro Script

This folder contains a small Node.js script (`mongo_intro.js`) that connects to a local MongoDB instance and runs a few basic operations.

### Prerequisites

* Node.js installed (v18+ recommended)
* A local MongoDB server running on `mongodb://127.0.0.1:27017`
* This repository checked out

### 1. Initialize the Node project

From inside the `mongo_handout` folder:

```bash
cd mongo_handout
```

Create a `package.json` (only needed once):

```bash
yarn init -y
# or, if you prefer npm:
# npm init -y
```

Mark the project as an ES module so we can use `import`:

```jsonc
// package.json (snippet)
{
  "name": "mongo-handout",
  "version": "1.0.0",
  "type": "module"
}
```

> The `"type": "module"` field tells Node to treat `.js` files as ES modules, so `import { MongoClient } from 'mongodb';` works.

### 2. Install the MongoDB driver

Still in `mongo_handout`, install the official MongoDB Node.js driver:

```bash
yarn add mongodb
# or:
# npm install mongodb
```

This creates a `node_modules/` folder and adds `mongodb` as a dependency in `package.json`.

### 3. Example script (`mongo_intro.js`)

A minimal example script looks like this:

```js
// mongo_intro.js
import { MongoClient } from 'mongodb';

const uri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('myDatabase');
    const collection = db.collection('myCollection');

    const count = await collection.countDocuments();
    console.log(`There are ${count} documents in myCollection`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('Error in main():', err);
});
```

### 4. Running the script

From the `mongo_handout` directory:

```bash
node mongo_intro.js
```

If everything is configured correctly, you should see:

* A log saying that the connection to MongoDB succeeded.
* The number of documents in the `myCollection` collection of `myDatabase`.

You can then inspect the same database and collection using MongoDB Compass as a GUI.
