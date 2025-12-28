# 🐳 Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB RAM available
- Ports 3000 and 5432 available

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env  # or vim .env
```

**Required Variables:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `ASSEMBLYAI_API_KEY`
- `OPENAI_API_KEY`

### 2. Start Services
```bash
# Start PostgreSQL and Web Application
docker-compose up -d

# View logs
docker-compose logs -f web

# Check status
docker-compose ps
```

### 3. Access Application
- **Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

### 4. Optional: Database Management
```bash
# Start with pgAdmin
docker-compose --profile tools up -d

# Access pgAdmin at: http://localhost:5050
# Email: admin@aidoctor.com
# Password: admin123 (or your PGADMIN_PASSWORD)
```

## Architecture

```
┌─────────────────────┐
│   Next.js Web App   │  Port 3000
│  (ai_doctor_web)    │
└──────────┬──────────┘
           │
           │ DATABASE_URL
           │
┌──────────▼──────────┐
│   PostgreSQL 16     │  Port 5432
│ (ai_doctor_postgres)│
└─────────────────────┘
```

## Docker Commands

### Container Management
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart a specific service
docker-compose restart web

# Remove all containers and volumes (⚠️ DELETES DATA)
docker-compose down -v
```

### Logs & Debugging
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f web
docker-compose logs -f postgres

# Execute command in container
docker-compose exec web sh
docker-compose exec postgres psql -U postgres -d doctor_ai
```

### Database Operations
```bash
# Run Prisma migrations manually
docker-compose exec web npx prisma migrate deploy

# Generate Prisma client
docker-compose exec web npx prisma generate

# Access PostgreSQL shell
docker-compose exec postgres psql -U postgres -d doctor_ai

# Create database backup
docker-compose exec postgres pg_dump -U postgres doctor_ai > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres doctor_ai < backup.sql
```

### Rebuilding
```bash
# Rebuild after code changes
docker-compose up -d --build

# Force clean rebuild
docker-compose build --no-cache
docker-compose up -d
```

## Production Deployment

### 1. Update Environment
```bash
# Set production environment
NODE_ENV=production

# Use strong passwords
POSTGRES_PASSWORD=<secure-random-password>
PGADMIN_PASSWORD=<secure-random-password>

# Set production URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. SSL/TLS (Recommended)
Use a reverse proxy like Nginx or Traefik:

```yaml
# docker-compose.override.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - web
```

### 3. Resource Limits
```yaml
# Add to docker-compose.yml
services:
  web:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### 4. Health Monitoring
```bash
# Check health status
curl http://localhost:3000/api/health

# Expected response:
# {"status":"healthy","timestamp":"...","database":"connected"}
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs web

# Common issues:
# 1. Port already in use
sudo lsof -i :3000
sudo lsof -i :5432

# 2. Missing environment variables
docker-compose config

# 3. Database connection failed
docker-compose exec postgres pg_isready
```

### Database Connection Error
```bash
# Verify DATABASE_URL
docker-compose exec web env | grep DATABASE_URL

# Test connection
docker-compose exec web npx prisma db pull
```

### Migration Issues
```bash
# Reset database (⚠️ DELETES ALL DATA)
docker-compose exec web npx prisma migrate reset

# Force migration
docker-compose exec web npx prisma migrate deploy --force
```

### Out of Memory
```bash
# Increase Docker memory limit (Docker Desktop)
# Settings → Resources → Memory → Increase to 4GB+

# Check container memory usage
docker stats
```

## Performance Optimization

### 1. Multi-stage Build
The Dockerfile uses multi-stage builds to minimize image size:
- `deps`: Install dependencies
- `builder`: Build application
- `runner`: Production runtime

### 2. Layer Caching
```bash
# Optimize for faster rebuilds
docker-compose build --pull
```

### 3. Volume Management
```bash
# List volumes
docker volume ls | grep ai-docter-agent

# Cleanup unused volumes
docker volume prune
```

## Security Best Practices

1. **Never commit .env file**
2. **Use strong passwords**
3. **Limit container resources**
4. **Run containers as non-root user** (already implemented)
5. **Keep images updated**:
```bash
docker-compose pull
docker-compose up -d
```

## Scaling (Advanced)

### Horizontal Scaling
```bash
# Run multiple web instances
docker-compose up -d --scale web=3
```

### Load Balancer
```yaml
# docker-compose.override.yml
services:
  load-balancer:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./load-balancer.conf:/etc/nginx/nginx.conf
```

## Backup & Restore

### Automated Backups
```bash
# Create backup script
cat > backup.sh <<EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U postgres doctor_ai > backup_\$DATE.sql
find . -name "backup_*.sql" -mtime +7 -delete
EOF

chmod +x backup.sh

# Add to crontab (daily at 2 AM)
0 2 * * * /path/to/backup.sh
```

## Monitoring

### Container Health
```bash
# Watch container status
watch docker-compose ps

# Resource usage
docker stats ai_doctor_web ai_doctor_postgres
```

### Application Logs
```bash
# Tail logs in real-time
docker-compose logs -f --tail=100 web

# Save logs to file
docker-compose logs web > web-logs.txt
```

## Development vs Production

### Development
```bash
# Use .env with local settings
docker-compose up

# Hot reload enabled
# Ports exposed for debugging
```

### Production
```bash
# Use .env.production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Optimized build
# Health checks enabled
# Resource limits applied
```

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment: `docker-compose config`
3. Test health: `curl http://localhost:3000/api/health`
4. See main [README.md](./README.md) for application documentation

## Clean Uninstall

```bash
# Stop and remove everything
docker-compose down -v

# Remove images
docker rmi $(docker images -q ai-docter-agent*)

# Remove dangling volumes
docker volume prune
```
