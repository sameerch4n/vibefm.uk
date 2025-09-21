# Multi-stage Dockerfile for VibeFM
# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend2

# Copy package files
COPY frontend2/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source code
COPY frontend2/ ./

# Build the frontend for production
RUN npm run build

# Stage 2: Setup backend and serve everything
FROM node:18-alpine AS production

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend2/dist ./frontend2/dist

# Copy public assets for frontend (if any)
COPY frontend2/public ./frontend2/public

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S vibefm -u 1001

# Change ownership of the app directory
RUN chown -R vibefm:nodejs /app

# Switch to non-root user
USER vibefm

# Expose the port
EXPOSE 1504

# Set environment variables
ENV NODE_ENV=production
ENV PORT=1504

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:1504/api/charts', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the server
CMD ["npm", "start"]
