# Data Folder

These files contain the sample data for the project. Each file represents a collection and can be loaded directly by mongosh when running the import script.

| File | Description |
| ---- | ----------- |
| `comments.json` | List of all comments made by users. |
| `movies.json` | Movies available on the platform. |
| `sessions.json` | Current user session. |
| `theaters.json` | List of all available theaters on the platform. |
| `users.json` | List of all users registered. |
Usage tips:

1. Run `mongosh import_data.mongosh.js` and the script will import the data into MongoDB.