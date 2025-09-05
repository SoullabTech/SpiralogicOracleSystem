FROM node:20-alpine

# Install basic tools
RUN apk add --no-cache git bash

# Create workspace directory
WORKDIR /workspace

# Set up non-root user
RUN adduser -D -u 1000 node || true

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --only=production
RUN cd backend && npm ci --only=production

# Copy application code
COPY . .

# Install dev dependencies
RUN npm install
RUN cd backend && npm install

# Expose ports
EXPOSE 3000 3002

# Switch to non-root user
USER node

CMD ["npm", "run", "dev"]