# Docker Setup Guide for NoSQL Labs

This guide explains how to use Docker for a consistent development environment across all platforms.

## Prerequisites

- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)
- At least 4GB of free disk space
- 4GB of available RAM

## Quick Start

### 1. Start the Basic MongoDB Environment

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd nosql-databases-labs

# Start MongoDB and Mongo Express
docker-compose up -d

# Verify services are running
docker-compose ps
```

This starts:
- **MongoDB** on port 27017
- **Mongo Express** (web UI) on port 8081

### 2. Access the Services

#### MongoDB Connection
- **Host:** localhost
- **Port:** 27017
- **Admin Username:** admin
- **Admin Password:** admin123
- **Lab Database:** nosql_labs
- **Lab Username:** labuser
- **Lab Password:** labpass123

#### Mongo Express Web UI
- **URL:** http://localhost:8081
- No authentication required (disabled for development)

### 3. Load Sample Data

The sample data is automatically loaded when the container first starts. To manually reload data:

```bash
# Load Sakila dataset
docker exec -it nosql-labs-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin sakila < data/sakila/sakila-schema.js
docker exec -it nosql-labs-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin sakila < data/sakila/sakila-data.js

# Load other datasets
docker exec -it nosql-labs-mongodb mongosh -u labuser -p labpass123 nosql_labs < data/datasets/your-data.json
```

## Working with Different Labs

### Lab 01-04: Basic MongoDB
The default setup is sufficient for Labs 1-4:

```bash
docker-compose up -d
```

### Lab 05: Replication
For the replication lab, start the replica set:

```bash
# Start replica set containers
docker-compose --profile replication up -d

# Initialize the replica set
docker exec -it nosql-labs-mongodb-replica-1 mongosh --eval "
rs.initiate({
  _id: 'rs0',
  members: [
    { _id: 0, host: 'nosql-labs-mongodb-replica-1:27017' },
    { _id: 1, host: 'nosql-labs-mongodb-replica-2:27017' },
    { _id: 2, host: 'nosql-labs-mongodb-replica-3:27017' }
  ]
})
"

# Check replica set status
docker exec -it nosql-labs-mongodb-replica-1 mongosh --eval "rs.status()"
```

Replica set members are available on:
- Primary: localhost:27018
- Secondary 1: localhost:27019
- Secondary 2: localhost:27020

### Development Environment
For Python development and testing:

```bash
# Start the Python environment
docker-compose --profile development up -d

# Enter the Python container
docker exec -it nosql-labs-python bash

# Inside the container, run tests
cd /workspace
python -m pytest tests/

# Run the faker generator
cd mongodb-faker-generator
python generate.py
```

## Common Commands

### Container Management

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove all data (clean start)
docker-compose down -v

# View logs
docker-compose logs -f mongodb
docker-compose logs -f mongo-express

# Restart a service
docker-compose restart mongodb
```

### MongoDB Shell Access

```bash
# Connect to MongoDB as admin
docker exec -it nosql-labs-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# Connect to MongoDB as lab user
docker exec -it nosql-labs-mongodb mongosh -u labuser -p labpass123 nosql_labs

# Run a MongoDB command
docker exec -it nosql-labs-mongodb mongosh -u labuser -p labpass123 nosql_labs --eval "db.students.find()"
```

### Data Management

```bash
# Backup a database
docker exec nosql-labs-mongodb mongodump -u admin -p admin123 --authenticationDatabase admin --db nosql_labs --out /tmp/backup
docker cp nosql-labs-mongodb:/tmp/backup ./backup

# Restore a database
docker cp ./backup nosql-labs-mongodb:/tmp/backup
docker exec nosql-labs-mongodb mongorestore -u admin -p admin123 --authenticationDatabase admin --db nosql_labs /tmp/backup/nosql_labs

# Import JSON data
docker cp data/sample.json nosql-labs-mongodb:/tmp/
docker exec nosql-labs-mongodb mongoimport -u labuser -p labpass123 --authenticationDatabase nosql_labs --db nosql_labs --collection sample --file /tmp/sample.json
```

## Troubleshooting

### Port Already in Use
If port 27017 is already in use:

1. Stop any local MongoDB service:
   ```bash
   # Windows
   net stop MongoDB

   # macOS
   brew services stop mongodb-community

   # Linux
   sudo systemctl stop mongod
   ```

2. Or change the port in docker-compose.yml:
   ```yaml
   ports:
     - "27018:27017"  # Change 27018 to any free port
   ```

### Container Won't Start
Check logs for errors:
```bash
docker-compose logs mongodb
```

Common issues:
- Insufficient disk space: Free up space or run `docker system prune`
- Corrupted data: Remove volumes with `docker-compose down -v`

### Connection Refused
Ensure the service is healthy:
```bash
docker-compose ps
docker exec nosql-labs-mongodb mongosh --eval "db.adminCommand('ping')"
```

### Permission Denied
On Linux, you might need to run Docker commands with sudo:
```bash
sudo docker-compose up -d
```

Or add your user to the docker group:
```bash
sudo usermod -aG docker $USER
# Log out and log back in
```

## Performance Tips

1. **Allocate Sufficient Resources**: In Docker Desktop settings, allocate at least:
   - 4GB RAM
   - 2 CPUs
   - 10GB disk space

2. **Use Volumes for Data**: The compose file already uses named volumes for persistence

3. **Clean Up Regularly**: Remove unused containers and images:
   ```bash
   docker system prune -a
   ```

## VS Code Integration

If using VS Code, install these extensions:
- Docker (ms-azuretools.vscode-docker)
- MongoDB for VS Code (mongodb.mongodb-vscode)

Connect to MongoDB in VS Code:
1. Open MongoDB extension
2. Add connection: `mongodb://labuser:labpass123@localhost:27017/nosql_labs`
3. Browse collections and run queries directly

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [MongoDB Connection String URI Format](https://docs.mongodb.com/manual/reference/connection-string/)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review container logs: `docker-compose logs`
3. Ensure Docker Desktop is running and updated
4. Report issues in the course repository