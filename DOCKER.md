# Docker Architecture for Odin's Almanac

This document describes the Docker setup for Odin's Almanac, a three-tier application architecture.

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │  Port 3000
│   (React+Nginx) │  
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend       │  Port 8080
│   (Spring Boot) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Database      │  Port 5432
│   (PostgreSQL)  │
└─────────────────┘
```

## Services

### 1. Database (`db`)
- **Image**: `postgres:15`
- **Port**: 5432 (not exposed externally)
- **Credentials**:
  - Database: `odinsdb`
  - User: `odins`
  - Password: `odins` (change for production!)
- **Volume**: `db_data` for persistent storage

### 2. Backend (`backend`)
- **Build**: Multi-stage Dockerfile using Maven and Eclipse Temurin
- **Port**: 8080
- **Technology**: Java Spring Boot
- **Dependencies**: PostgreSQL database
- **Environment Variables**:
  - `DATABASE_URL`: Connection string to PostgreSQL
  - `PORT`: Server port (8080)

### 3. Frontend (`frontend`)
- **Build**: Multi-stage Dockerfile using Node.js and Nginx
- **Port**: 3000 (Nginx serves on port 80 internally)
- **Technology**: React application served by Nginx
- **Dependencies**: Backend service

## Files

### docker-compose.yml
Main orchestration file that defines all three services and their relationships.

### server/Dockerfile
Multi-stage build for the Java Spring Boot backend:
- **Stage 1**: Maven build environment
  - Uses `maven:3.9.4-eclipse-temurin-17`
  - Compiles Java application
  - Creates executable JAR
- **Stage 2**: Runtime environment
  - Uses `eclipse-temurin:17-jre-alpine`
  - Minimal image with only JRE
  - Runs the compiled JAR

### client/Dockerfile
Multi-stage build for the React frontend:
- **Stage 1**: Build environment
  - Uses `node:20-alpine`
  - Installs dependencies
  - Builds production React app
- **Stage 2**: Nginx server
  - Uses `nginx:alpine`
  - Serves static React build
  - Lightweight production image

## Usage

### Starting the Application

```bash
# Start all services in detached mode
docker compose up -d

# Start and rebuild if needed
docker compose up -d --build

# Start with logs visible
docker compose up
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

### Stopping the Application

```bash
# Stop services (keeps data)
docker compose stop

# Stop and remove containers (keeps volumes)
docker compose down

# Stop, remove containers and volumes (removes all data)
docker compose down -v
```

### Accessing Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Database**: localhost:5432

### Database Access

Connect to PostgreSQL directly:

```bash
# Using docker compose
docker compose exec db psql -U odins -d odinsdb

# Using psql client
psql -h localhost -p 5432 -U odins -d odinsdb
```

### Service Health Checks

```bash
# Check service status
docker compose ps

# Check backend health
curl http://localhost:8080/health

# Check frontend
curl http://localhost:3000
```

## Development Workflow

### Making Changes to Backend

1. Edit code in your IDE
2. Rebuild backend service:
   ```bash
   docker compose up -d --build backend
   ```
3. View logs:
   ```bash
   docker compose logs -f backend
   ```

### Making Changes to Frontend

1. Edit code in your IDE
2. Rebuild frontend service:
   ```bash
   docker compose up -d --build frontend
   ```
3. Refresh browser at http://localhost:3000

### Database Migrations

```bash
# Access database shell
docker compose exec db psql -U odins -d odinsdb

# Run SQL commands
\dt  # List tables
\d table_name  # Describe table
```

## Production Considerations

### Security

1. **Change default passwords**: Update database credentials in docker-compose.yml
2. **Use secrets**: Store sensitive data in Docker secrets or environment files
3. **Network isolation**: Configure custom networks to isolate services

### Environment Variables

Create a `.env` file for production:

```env
# Database
POSTGRES_PASSWORD=your_secure_password

# Backend
DATABASE_URL=postgres://odins:your_secure_password@db:5432/odinsdb
PORT=8080
SPRING_PROFILES_ACTIVE=production

# Add other backend environment variables
```

Update docker-compose.yml to use `.env`:

```yaml
services:
  db:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  backend:
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - PORT=${PORT}
```

### Performance

1. **Resource limits**: Add resource constraints
   ```yaml
   backend:
     deploy:
       resources:
         limits:
           cpus: '1.0'
           memory: 1G
   ```

2. **Health checks**: Add health checks to services
   ```yaml
   backend:
     healthcheck:
       test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
       interval: 30s
       timeout: 10s
       retries: 3
   ```

3. **Restart policies**: Ensure services restart on failure
   ```yaml
   backend:
     restart: unless-stopped
   ```

### Scaling

Scale services independently:

```bash
# Scale backend to 3 instances
docker compose up -d --scale backend=3

# Requires load balancer configuration
```

## Troubleshooting

### Services won't start

```bash
# Check logs
docker compose logs

# Check specific service
docker compose logs backend

# Inspect service
docker compose ps
```

### Database connection issues

```bash
# Verify database is running
docker compose ps db

# Check database logs
docker compose logs db

# Test connection
docker compose exec backend ping db
```

### Port conflicts

If ports 3000, 8080, or 5432 are already in use:

1. Stop conflicting services
2. Or modify ports in docker-compose.yml:
   ```yaml
   backend:
     ports:
       - "8081:8080"  # Use 8081 instead
   ```

### Rebuild from scratch

```bash
# Stop everything
docker compose down -v

# Remove images
docker compose down --rmi all

# Rebuild
docker compose up -d --build
```

## Next Steps

1. **Implement backend**: Add Java Spring Boot application code
2. **Implement frontend**: Add React application code
3. **Configure reverse proxy**: Add Nginx reverse proxy for production
4. **Add SSL/TLS**: Configure HTTPS certificates
5. **Set up CI/CD**: Automate builds and deployments
6. **Add monitoring**: Integrate logging and monitoring tools

## Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Spring Boot with Docker](https://spring.io/guides/gs/spring-boot-docker/)
- [React Docker Deployment](https://create-react-app.dev/docs/deployment/)
