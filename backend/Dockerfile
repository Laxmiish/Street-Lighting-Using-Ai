# Production Dockerfile for LuminaAI Express Backend Service
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies (utilizing Docker layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

# Expose backend port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "server.js"]
