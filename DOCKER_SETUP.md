# Taskflow - Docker & Deployment Guide

## 🐳 Docker Setup

### Prerequisites
- Docker Desktop (installed and running)
- AWS S3 account with credentials

### Quick Start

1. **Clone/Navigate to project:**
```bash
cd taskflow
```

2. **Configure environment variables:**
```bash
# Copy and update .env file
cp .env.example .env

# Add your AWS credentials to .env:
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here
AWS_S3_BUCKET=taskflow-uploads-demo
```

3. **Start all services (with one command):**
```bash
docker-compose up -d
```

4. **Access the application:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **MongoDB:** localhost:27017 (internal only)

### Services

| Service | Port | Description |
|---------|------|-------------|
| MongoDB | 27017 | Database (internal) |
| Backend | 5000 | Node.js/Express API |
| Frontend | 3000 | React application |

### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild images
docker-compose build --no-cache

# Stop and remove volumes
docker-compose down -v
```

### Environment Variables

The `.env` file contains:
- `AWS_REGION`: AWS region (default: ap-south-1)
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_S3_BUCKET`: S3 bucket name
- `ADMIN_SEED_KEY`: Admin seeding key
- `SECRET_KEY`: JWT secret key

## 🚀 AWS EC2 Deployment

### Prerequisites
- AWS Account
- EC2 instance running (Ubuntu 20.04 or 22.04)
- Security Group with ports 80, 443, 5000, 3000 open
- SSH access to instance

### Deployment Steps

1. **SSH into your EC2 instance:**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

2. **Install Docker:**
```bash
sudo apt update
sudo apt install -y docker.io docker-compose git

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu
```

3. **Clone your repository:**
```bash
git clone your-repo-url
cd taskflow
```

4. **Set up environment variables:**
```bash
# Create .env file with your AWS credentials
cat > .env << EOF
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=taskflow-uploads-demo
SECRET_KEY=taskflow_jwt_secret_123
ADMIN_SEED_KEY=mysecretkey
EOF
```

5. **Start containers:**
```bash
docker-compose up -d
```

6. **Setup Nginx Reverse Proxy (Optional but recommended):**

Create `/etc/nginx/sites-available/taskflow`:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # or use EC2 Elastic IP

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable Nginx configuration:
```bash
sudo ln -s /etc/nginx/sites-available/taskflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Access Your Application
- **Frontend:** http://your-ec2-ip (or your domain)
- **Backend API:** http://your-ec2-ip/api

### Monitoring & Logs

```bash
# View container logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend

# Check container status
docker-compose ps

# SSH into running container
docker-compose exec backend sh
```

### Troubleshooting

**Containers won't start:**
```bash
docker-compose logs -f
```

**Database connection issues:**
- Ensure MongoDB container is healthy: `docker-compose ps`
- Check MongoDB is initialized: `docker-compose logs mongodb`

**File upload not working:**
- Verify AWS credentials in `.env`
- Check S3 bucket exists and is accessible
- Verify IAM user has S3 permissions

## 📊 File Structure

```
taskflow/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── index.js
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── middleware/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── src/
├── docker-compose.yml
├── .env
├── .env.example
└── .dockerignore
```

## 🧪 Testing

Unit tests coming in next phase.

## 📝 Notes

- All uploaded files are stored in AWS S3
- MongoDB data persists in Docker volumes
- Files older than retention period can be auto-deleted via S3 lifecycle policies

