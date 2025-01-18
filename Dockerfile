# Use Node.js base image
FROM node:20-slim

# Install Chrome dependencies and Chromium
RUN apt-get update \
    && apt-get install -y chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Create dist directory and copy files
RUN mkdir -p dist && \
    cp -r src/* dist/ && \
    cp package.json dist/

# Expose port
EXPOSE 3000

# Set NODE_ENV
ENV NODE_ENV=production

# Start command for production
CMD ["node", "dist/index.js"] 