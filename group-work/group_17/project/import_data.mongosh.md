Run the following commands on the terminal:

mongosh

use group_17_db

mongoimport --db group_17_db --collection movies --file movies.json 
mongoimport --db group_17_db --collection comments --file comments.json
mongoimport --db group_17_db --collection users --file users.json
mongoimport --db group_17_db --collection theaters --file theaters.json
mongoimport --db group_17_db --collection sessions --file sessions.json