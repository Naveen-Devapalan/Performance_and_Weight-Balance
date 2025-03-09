FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++ sqlite-dev

WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Create production image
FROM node:18-alpine

WORKDIR /app
RUN apk add --no-cache sqlite-dev

# Copy built artifacts from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/src/data ./src/data

EXPOSE 3000
CMD ["npm", "start"]