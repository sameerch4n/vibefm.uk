# VibeFM Deployment Checklist

## Pre-Deployment Checklist

- [ ] Code pushed to Git repository
- [ ] All files present:
  - [ ] `Dockerfile`
  - [ ] `docker-compose.yml`
  - [ ] `.dockerignore`
  - [ ] `frontend2/.env.production`
  - [ ] Updated `backend/server.js`
- [ ] Local Docker build tested successfully
- [ ] Frontend builds without TypeScript errors
- [ ] Backend API endpoints working on port 1504

## Coolify Configuration Checklist

- [ ] New application created in Coolify
- [ ] Git repository connected
- [ ] Branch set to correct deployment branch
- [ ] Build method set to `Dockerfile`
- [ ] Port set to `1504`
- [ ] Health check configured: `/api/charts`
- [ ] Environment variables set:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=1504`
- [ ] Domain configured (if applicable)
- [ ] SSL certificate enabled

## Post-Deployment Verification

- [ ] Build completed successfully
- [ ] Application started without errors
- [ ] Frontend accessible at domain/IP
- [ ] API health check working: `https://yourdomain.com/api/charts`
- [ ] Search API working: `https://yourdomain.com/api/search?q=test`
- [ ] Music search functionality working
- [ ] Chart data loading correctly
- [ ] YouTube integration working

## Performance Checks

- [ ] Memory usage under acceptable limits
- [ ] CPU usage normal
- [ ] Response times acceptable (<2s for API calls)
- [ ] No memory leaks detected

## Security Checks

- [ ] HTTPS enabled and working
- [ ] Health checks responding correctly
- [ ] No sensitive data exposed in logs
- [ ] CORS configured properly

## Final Steps

- [ ] DNS updated (if using custom domain)
- [ ] Monitoring configured
- [ ] Backup strategy in place (if needed)
- [ ] Documentation updated
- [ ] Team notified of deployment

## Quick Test Commands

Test these URLs after deployment:

```bash
# Frontend
curl -I https://yourdomain.com

# API Health Check
curl https://yourdomain.com/api/charts

# Search Test
curl "https://yourdomain.com/api/search?q=taylor+swift"

# YouTube API Test
curl "https://yourdomain.com/api/youtube?q=taylor+swift+love+story"
```

All responses should return appropriate HTTP status codes (200 for successful requests).
