# VibeFM Deployment Guide for Coolify

This guide provides detailed step-by-step instructions for deploying VibeFM to Coolify.

## Prerequisites

1. **Coolify Instance**: You need a running Coolify instance with access to deploy applications
2. **Git Repository**: Your VibeFM code should be pushed to a Git repository (GitHub, GitLab, etc.)
3. **Domain/Subdomain**: (Optional) A domain or subdomain pointing to your Coolify server

## Project Overview

VibeFM has been configured to run as a single container that:
- Serves the frontend React application on port 1504
- Provides the backend API on the same port (1504) under `/api` routes
- Uses environment variables for configuration
- Includes health checks for monitoring

## Step-by-Step Deployment Instructions

### Step 1: Prepare Your Repository

1. **Push your code to a Git repository** (if not already done):
   ```bash
   git add .
   git commit -m "Configure VibeFM for single-port Docker deployment"
   git push origin main
   ```

2. **Ensure your repository contains these files**:
   - `Dockerfile` (root level)
   - `docker-compose.yml` (for local testing)
   - `.dockerignore` (root level)
   - `frontend2/.env.production` (for production API config)
   - Updated `backend/server.js` (with port 1504)
   - Updated frontend API configurations

### Step 2: Access Coolify Dashboard

1. **Log into your Coolify dashboard**
2. **Navigate to "Applications"** in the sidebar
3. **Click "New Application"** or the "+" button

### Step 3: Create New Application

1. **Application Details**:
   - **Name**: `vibefm` (or your preferred name)
   - **Description**: `VibeFM - Music Streaming Application`

2. **Source Configuration**:
   - **Source Type**: Select `Git Repository`
   - **Repository URL**: Enter your Git repository URL
     ```
     https://github.com/yourusername/vibefm.git
     ```
   - **Branch**: `main` (or your deployment branch)
   - **Auto Deploy**: Enable this for automatic deployments on push

### Step 4: Configure Build Settings

1. **Build Configuration**:
   - **Build Method**: `Dockerfile`
   - **Dockerfile Path**: `./Dockerfile` (default)
   - **Docker Context**: `.` (root directory)

2. **Advanced Build Settings** (click "Show Advanced"):
   - **Build Args**: Leave empty (not needed)
   - **Docker Compose Override**: Leave empty

### Step 5: Configure Runtime Settings

1. **General Settings**:
   - **Port**: `1504`
   - **Health Check URL**: `/api/charts`
   - **Health Check Method**: `GET`

2. **Environment Variables**:
   Add these environment variables:
   ```
   NODE_ENV=production
   PORT=1504
   ```

3. **Resource Limits** (adjust based on your server):
   - **Memory Limit**: `512MB` (minimum recommended)
   - **CPU Limit**: `0.5` (adjust as needed)

### Step 6: Configure Network Settings

1. **Domain Configuration**:
   - **Primary Domain**: Set your domain/subdomain (e.g., `vibefm.yourdomain.com`)
   - **Generate SSL**: Enable (recommended)
   - **Force HTTPS**: Enable (recommended)

2. **Port Mapping**:
   - **Internal Port**: `1504`
   - **External Port**: `80` (HTTP) / `443` (HTTPS)

### Step 7: Deploy the Application

1. **Review Configuration**: Double-check all settings
2. **Click "Deploy"**: Start the deployment process
3. **Monitor Deployment**: Watch the build logs in real-time

### Step 8: Verify Deployment

1. **Check Build Logs**: Ensure the build completed successfully
2. **Check Runtime Logs**: Verify the application started correctly
3. **Test Endpoints**:
   - **Frontend**: `https://yourdomain.com`
   - **API Health**: `https://yourdomain.com/api/charts`
   - **Search API**: `https://yourdomain.com/api/search?q=test`

### Step 9: Post-Deployment Configuration

1. **Set Up Monitoring**:
   - Configure Coolify's built-in monitoring
   - Set up alerts for downtime or high resource usage

2. **Configure Backups** (if needed):
   - VibeFM is stateless, so database backups aren't required
   - Consider backing up any uploaded assets if applicable

3. **Update DNS** (if using custom domain):
   - Point your domain to your Coolify server's IP
   - Configure appropriate A/CNAME records

## Environment Variables Reference

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Sets Node.js environment mode |
| `PORT` | `1504` | Application port (internal) |

## Troubleshooting Common Issues

### Build Failures

1. **Out of Memory**:
   ```
   Solution: Increase memory limit in Coolify settings or optimize build process
   ```

2. **Missing Dependencies**:
   ```
   Check: package.json files in both frontend2/ and backend/ directories
   Verify: npm ci commands complete successfully
   ```

3. **TypeScript Errors**:
   ```
   Fix: Resolve any TypeScript compilation errors in frontend2/
   Check: tsconfig.json configuration
   ```

### Runtime Issues

1. **Port Binding Errors**:
   ```
   Verify: PORT environment variable is set to 1504
   Check: No conflicting port assignments
   ```

2. **API Not Accessible**:
   ```
   Test: Health check endpoint (/api/charts)
   Verify: Backend server configuration in server.js
   ```

3. **Frontend Not Loading**:
   ```
   Check: Frontend build completed successfully
   Verify: Static files are being served from correct path
   Test: Production environment variables
   ```

### Performance Issues

1. **Slow Loading**:
   ```
   Monitor: Resource usage in Coolify dashboard
   Consider: Increasing memory/CPU limits
   Optimize: Frontend bundle size if needed
   ```

2. **High Memory Usage**:
   ```
   Check: Application logs for memory leaks
   Monitor: Long-running processes
   Consider: Adding memory limit safeguards
   ```

## Maintenance and Updates

### Updating the Application

1. **Push changes** to your Git repository
2. **Coolify will auto-deploy** (if auto-deploy is enabled)
3. **Monitor deployment** through the dashboard
4. **Verify functionality** after deployment

### Scaling Considerations

- **Horizontal Scaling**: Deploy multiple instances behind a load balancer
- **Vertical Scaling**: Increase memory/CPU limits in Coolify
- **Database**: Consider external database if adding persistent data

### Monitoring

Monitor these key metrics:
- **Response Time**: API endpoint performance
- **Memory Usage**: Application memory consumption
- **CPU Usage**: Processing load
- **Error Rates**: Application error frequency
- **Uptime**: Service availability

## Security Considerations

1. **Environment Variables**: Keep sensitive data in environment variables
2. **HTTPS**: Always use SSL/TLS in production
3. **CORS**: Configure appropriate CORS policies
4. **Rate Limiting**: Consider implementing API rate limiting
5. **Health Checks**: Ensure health checks are working properly

## Support and Additional Resources

- **Coolify Documentation**: [https://coolify.io/docs](https://coolify.io/docs)
- **Docker Documentation**: [https://docs.docker.com](https://docs.docker.com)
- **Node.js Best Practices**: [https://nodejs.org/en/docs/guides](https://nodejs.org/en/docs/guides)

## Quick Commands for Local Testing

Test your Docker setup locally before deploying:

```bash
# Build the image
docker build -t vibefm:latest .

# Run locally
docker run -p 1504:1504 -e NODE_ENV=production vibefm:latest

# Test with Docker Compose
docker-compose up -d

# Stop and clean up
docker-compose down
```

Your VibeFM application should now be successfully deployed and running on Coolify!
