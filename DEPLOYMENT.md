# Deployment Guide - AAB to APK Converter

## ⚠️ Important: Vercel Limitations

**This application CANNOT run on Vercel** due to the following limitations:

### Why Vercel Won't Work:

1. **No Java Runtime**: Vercel serverless functions don't have Java installed
2. **No System Dependencies**: Cannot install Java or other system packages
3. **Ephemeral File System**: Files are deleted after function execution
4. **Timeout Limits**: 
   - Hobby: 10 seconds
   - Pro: 60 seconds (our conversion needs 5+ minutes)
5. **No Persistent Storage**: Bundletool download would be lost
6. **Memory Constraints**: Limited memory for large file processing

## ✅ Recommended Hosting Options

### Option 1: Self-Hosted (Recommended)

Deploy on your own server with full control:

#### Requirements:
- VPS/Server (DigitalOcean, AWS EC2, Linode, etc.)
- Node.js 18+
- Java 8+ installed
- Ubuntu/Debian/CentOS Linux or Windows Server

#### Steps:

1. **Set up server:**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install Java
   sudo apt update
   sudo apt install default-jdk

   # Verify
   java -version
   node --version
   ```

2. **Clone and deploy:**
   ```bash
   git clone <your-repo>
   cd Abb-to-apk
   npm install
   npm run build
   npm start
   ```

3. **Use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "aab-converter" -- start
   pm2 save
   pm2 startup
   ```

### Option 2: Docker Deployment

Create a Docker container with Java and Node.js:

#### Dockerfile:
```dockerfile
FROM node:18

# Install Java
RUN apt-get update && \
    apt-get install -y openjdk-17-jdk && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

#### Deploy to:
- **Railway**: Supports Docker, easy deployment
- **Render**: Supports Docker, free tier available
- **Fly.io**: Good for Docker deployments
- **AWS ECS/Fargate**: Enterprise solution
- **DigitalOcean App Platform**: Simple Docker deployment

### Option 3: Railway (Recommended for Easy Deployment)

Railway supports Docker and has Java available:

1. **Create `railway.json`:**
   ```json
   {
     "build": {
       "builder": "DOCKERFILE",
       "dockerfilePath": "Dockerfile"
     },
     "deploy": {
       "startCommand": "npm start",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

2. **Deploy:**
   - Connect GitHub repo to Railway
   - Railway will auto-detect Dockerfile
   - Deploy automatically

### Option 4: Render

Render supports Docker and system dependencies:

1. **Create `render.yaml`:**
   ```yaml
   services:
     - type: web
       name: aab-to-apk-converter
       env: docker
       dockerfilePath: ./Dockerfile
       dockerContext: .
       plan: starter
       envVars:
         - key: NODE_ENV
           value: production
   ```

2. **Deploy via Render dashboard or CLI**

### Option 5: Separate Backend Service

Keep frontend on Vercel, backend elsewhere:

#### Architecture:
```
Frontend (Vercel) → Backend API (Self-hosted/Railway) → Conversion Service
```

1. **Frontend on Vercel:**
   - Deploy UI to Vercel
   - Point API calls to your backend URL

2. **Backend on separate service:**
   - Deploy API route to Railway/Render/self-hosted
   - Handle conversion with Java/bundletool

3. **Update frontend API URL:**
   ```typescript
   // In app/page.tsx
   const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/convert';
   
   const response = await fetch(`${API_URL}`, {
     method: 'POST',
     body: formData,
   });
   ```

### Option 6: AWS Lambda with Container Image

Use AWS Lambda with a custom container:

1. **Create Dockerfile for Lambda:**
   ```dockerfile
   FROM public.ecr.aws/lambda/nodejs:18

   # Install Java
   RUN yum install -y java-17-amazon-corretto-headless

   # Copy application
   COPY . ${LAMBDA_TASK_ROOT}

   # Install dependencies
   RUN npm install

   CMD [ "app/api/convert/handler.handler" ]
   ```

2. **Deploy to AWS Lambda** (requires AWS account)

## 🚀 Quick Start: Railway Deployment

### Step 1: Create Dockerfile
Create the Dockerfile shown in Option 2 above.

### Step 2: Deploy to Railway

1. **Sign up at [railway.app](https://railway.app)**
2. **Create new project**
3. **Connect GitHub repository**
4. **Railway will auto-detect Dockerfile**
5. **Deploy!**

### Step 3: Configure Environment

- Set `NODE_ENV=production`
- Railway will provide a URL like: `https://your-app.railway.app`

### Step 4: Update Frontend (if using separate frontend)

Update API URL in your frontend code.

## 📊 Comparison Table

| Platform | Java Support | File System | Timeout | Cost | Difficulty |
|----------|-------------|-------------|---------|------|------------|
| **Vercel** | ❌ No | ❌ Ephemeral | 10-60s | Free/Paid | Easy |
| **Railway** | ✅ Yes (Docker) | ✅ Persistent | Unlimited | Paid | Easy |
| **Render** | ✅ Yes (Docker) | ✅ Persistent | Unlimited | Free/Paid | Easy |
| **Self-Hosted** | ✅ Yes | ✅ Full | Unlimited | VPS Cost | Medium |
| **AWS Lambda** | ✅ Yes (Container) | ❌ Limited | 15min | Pay-per-use | Hard |
| **Fly.io** | ✅ Yes (Docker) | ✅ Volumes | Unlimited | Paid | Medium |

## 🔧 Environment Variables

For production deployment, set these environment variables:

```bash
NODE_ENV=production
PORT=3000
# Add any other required vars
```

## 📝 Deployment Checklist

- [ ] Java installed and accessible
- [ ] Node.js 18+ installed
- [ ] Environment variables configured
- [ ] File upload directory has write permissions
- [ ] Sufficient disk space for conversions
- [ ] Firewall rules configured (if self-hosting)
- [ ] SSL certificate configured (HTTPS)
- [ ] Domain name configured (optional)
- [ ] Monitoring/logging set up
- [ ] Backup strategy in place

## 🐳 Docker Compose (Self-Hosted)

For easy self-hosting with Docker Compose:

```yaml
version: '3.8'

services:
  aab-converter:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./uploads:/app/uploads
      - ./tools:/app/tools
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

## 🆘 Troubleshooting Deployment

### Java not found in container
- Ensure Java is installed in Dockerfile
- Verify Java path in container
- Check JAVA_HOME environment variable

### File upload fails
- Check directory permissions
- Ensure uploads directory exists
- Verify disk space

### Conversion timeout
- Increase timeout in code
- Check server resources
- Optimize conversion process

### Memory issues
- Increase container memory limit
- Optimize file handling
- Use streaming for large files

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Docker Documentation](https://docs.docker.com)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

## 💡 Recommendations

**For Production:**
- Use **Railway** or **Render** for easy deployment
- Or **self-host** for full control

**For Development:**
- Use **Docker** locally to match production
- Test with real AAB files
- Monitor resource usage

**For Scale:**
- Consider **AWS ECS** or **Google Cloud Run**
- Use **Redis** for job queue
- Implement **background job processing**

